package com.__SW_engineering.wordtama.domain.character.service;

import com.__SW_engineering.wordtama.domain.character.dto.CharacterResponse;
import com.__SW_engineering.wordtama.domain.character.entity.Character;
import com.__SW_engineering.wordtama.domain.character.entity.CharacterStatus;
import com.__SW_engineering.wordtama.domain.character.repository.CharacterRepository;
import com.__SW_engineering.wordtama.domain.user.entity.User;
import com.__SW_engineering.wordtama.global.exception.CustomException;
import com.__SW_engineering.wordtama.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CharacterService {

    private static final long REVIVE_COST = 50L;

    private final CharacterRepository characterRepository;

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
                character.getCoin()
        );
    }

    @Transactional
    public CharacterResponse reviveCharacter(Long userId) {
        Character character = characterRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHARACTER_NOT_FOUND));
        character.revive(REVIVE_COST);
        return new CharacterResponse(
                character.getStatus().name(),
                character.getVitality(),
                character.getCoin()
        );
    }

    // 퀴즈 정답률 80% 이상이면 vitality +20
    @Transactional
    public void applyQuizResult(Long userId, int correctCount, int totalCount) {
        if (totalCount == 0) return;

        double correctRate = (double) correctCount / totalCount * 100;
        if (correctRate >= 80) {
            Character character = characterRepository.findByUserId(userId)
                    .orElseThrow(() -> new CustomException(ErrorCode.CHARACTER_NOT_FOUND));
            character.updateVitality(20);
            updateStatus(character);
        }
    }

    // 스케줄러용: 전체 사용자 vitality -15 배치 처리
    @Transactional
    public void decreaseAllVitality() {
        List<Character> characters = characterRepository.findAll();
        for (Character character : characters) {
            character.updateVitality(-15);
            updateStatus(character);
        }
        characterRepository.saveAll(characters);
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
