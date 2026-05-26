package com.__SW_engineering.wordtama.domain.word.repository;

import com.__SW_engineering.wordtama.domain.word.entity.Word;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface WordRepository extends JpaRepository<Word, Long> {

    List<Word> findByDayOrderByIdAsc(Integer day);

    List<Word> findAllByOrderByDayAscIdAsc();

    // 특정 day 제외한 단어 목록 (4지선다 다른 day 보기용)
    List<Word> findByDayNotOrderByDayAscIdAsc(Integer day);

    @Query("SELECT MAX(w.day) FROM Word w")
    Optional<Integer> findMaxDay();

    // 전체 영어 단어 문자열만 조회 (오답 퀴즈 보기 fallback용, 전체 Entity 로드 방지)
    @Query("SELECT w.english FROM Word w")
    List<String> findAllEnglish();
}
