package com.__SW_engineering.wordtama.domain.word.repository;

import com.__SW_engineering.wordtama.domain.word.entity.Word;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface WordRepository extends JpaRepository<Word, Long> {

    List<Word> findByDayOrderByIdAsc(Integer day);

    List<Word> findAllByOrderByDayAscIdAsc();

    @Query("SELECT MAX(w.day) FROM Word w")
    Optional<Integer> findMaxDay();
}
