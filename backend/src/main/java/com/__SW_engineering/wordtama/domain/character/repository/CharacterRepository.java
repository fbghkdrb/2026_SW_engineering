package com.__SW_engineering.wordtama.domain.character.repository;

import com.__SW_engineering.wordtama.domain.character.entity.Character;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CharacterRepository extends JpaRepository<Character, Long> {
    Optional<Character> findByUserId(Long userId);
}
