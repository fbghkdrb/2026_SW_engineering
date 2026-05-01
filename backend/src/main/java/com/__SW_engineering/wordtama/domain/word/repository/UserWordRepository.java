package com.__SW_engineering.wordtama.domain.word.repository;

import com.__SW_engineering.wordtama.domain.word.entity.UserWord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserWordRepository extends JpaRepository<UserWord, Long> {

    Optional<UserWord> findByUser_IdAndWord_Id(Long userId, Long wordId);

    List<UserWord> findByUser_Id(Long userId);

    List<UserWord> findByUser_IdAndWord_IdIn(Long userId, List<Long> wordIds);
}
