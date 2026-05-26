package com.__SW_engineering.wordtama.domain.character.service;

import com.__SW_engineering.wordtama.domain.character.dto.CharacterResponse;
import com.__SW_engineering.wordtama.domain.character.entity.Character;
import com.__SW_engineering.wordtama.domain.character.entity.CharacterStatus;
import com.__SW_engineering.wordtama.domain.character.repository.CharacterRepository;
import com.__SW_engineering.wordtama.domain.user.entity.User;
import com.__SW_engineering.wordtama.domain.wrongnote.entity.DailyQuizPass;
import com.__SW_engineering.wordtama.domain.wrongnote.repository.DailyQuizPassRepository;
import com.__SW_engineering.wordtama.global.exception.CustomException;
import com.__SW_engineering.wordtama.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CharacterService {

    private static final long REVIVE_COST = 50L;

    private final CharacterRepository characterRepository;
    private final DailyQuizPassRepository dailyQuizPassRepository;

    @Transactional
    public void createCharacter(User user) {
        Character character = Character.builder()
                .user(user)
                .build();
        characterRepository.save(character);
    }

    @Transactional(readOnly = true)
    public CharacterResponse getCharacter(Long userId) {
        Character character = characterRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHARACTER_NOT_FOUND));
        return new CharacterResponse(
                character.getStatus().name(),
                character.getVitality(),
                character.getCoin(),
                REVIVE_COST
        );
    }

    @Transactional
    public CharacterResponse reviveCharacter(Long userId) {
        Character character = characterRepository.findByUserIdWithLock(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHARACTER_NOT_FOUND));

        if (character.getCoin() < REVIVE_COST) {
            throw new CustomException(ErrorCode.INSUFFICIENT_COIN);
        }

        character.revive(REVIVE_COST);

        // 부활 시 daily_quiz_pass 중 is_valid=true인 레코드의 50% (내림)를 무효화
        List<DailyQuizPass> validPasses = dailyQuizPassRepository.findByUserIdAndIsValidTrue(userId);
        Collections.shuffle(validPasses);
        int invalidCount = Math.floorDiv(validPasses.size(), 2);
        List<DailyQuizPass> toInvalidate = validPasses.subList(0, invalidCount);
        toInvalidate.forEach(DailyQuizPass::invalidate);
        dailyQuizPassRepository.saveAll(toInvalidate);

        return new CharacterResponse(
                character.getStatus().name(),
                character.getVitality(),
                character.getCoin(),
                REVIVE_COST
        );
    }

    // 스케줄러용: 전체 사용자 vitality -15 배치 처리
    @Transactional
    public void decreaseAllVitality() {
        LocalDateTime now = LocalDateTime.now();
        characterRepository.bulkDecreaseVitality(now);
        characterRepository.bulkUpdateAllStatuses(now);
    }

    // 오답 퀴즈 완료 시 vitality 직접 추가
    @Transactional
    public void addVitality(Long userId, int amount) {
        Character character = characterRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHARACTER_NOT_FOUND));
        character.updateVitality(amount);
        updateStatus(character);
    }

    // [PBI-11 추가] 코인 증가 (퀴즈 통과 보상, 상점 아이템 구매 환원 등)
    @Transactional
    public void addCoin(Long userId, int amount) {
        Character character = characterRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHARACTER_NOT_FOUND));
        character.addCoin(amount);
    }

    // vitality 기준으로 status 자동 갱신 (퀴즈·스케줄러 공통 사용)
    private void updateStatus(Character character) {
        int vitality = character.getVitality();
        CharacterStatus newStatus;
        if (vitality >= 80) {
            newStatus = CharacterStatus.HAPPY;
        } else if (vitality >= 60) {
            newStatus = CharacterStatus.NORMAL;
        } else if (vitality >= 40) {
            newStatus = CharacterStatus.SAD;
        } else if (vitality >= 1) {
            newStatus = CharacterStatus.DANGER;
        } else {
            newStatus = CharacterStatus.FAINT;
        }
        character.updateStatus(newStatus);
    }
}
