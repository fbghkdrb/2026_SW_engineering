package com.__SW_engineering.wordtama.domain.quiz.repository;

import com.__SW_engineering.wordtama.domain.quiz.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface QuizRepository extends JpaRepository<Quiz, Long> {

    Optional<Quiz> findByIdAndUser_Id(Long id, Long userId);

    // 통계 계산용: 해당 유저의 제출 완료된 퀴즈 전체 조회
    List<Quiz> findByUser_IdAndCompletedTrue(Long userId);

    void deleteByUser_Id(Long userId);

    @Query("SELECT COALESCE(MAX(q.day), 0) FROM Quiz q")
    int findMaxDay();
}
