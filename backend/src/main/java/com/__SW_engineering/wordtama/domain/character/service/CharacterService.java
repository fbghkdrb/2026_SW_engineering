package com.__SW_engineering.wordtama.domain.character.service;

import com.__SW_engineering.wordtama.domain.character.dto.CharacterResponse;
import com.__SW_engineering.wordtama.domain.character.entity.Character;
import com.__SW_engineering.wordtama.domain.character.repository.CharacterRepository;
import com.__SW_engineering.wordtama.domain.user.entity.User;
import com.__SW_engineering.wordtama.global.exception.CustomException;
import com.__SW_engineering.wordtama.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
}
