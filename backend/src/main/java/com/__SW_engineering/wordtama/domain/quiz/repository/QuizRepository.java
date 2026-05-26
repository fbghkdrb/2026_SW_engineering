package com.__SW_engineering.wordtama.domain.quiz.repository;

import com.__SW_engineering.wordtama.domain.quiz.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface QuizRepository extends JpaRepository<Quiz, Long> {

    Optional<Quiz> findByIdAndUser_Id(Long id, Long userId);

    // 통계 계산용: 해당 유저의 제출 완료된 퀴즈 전체 조회
    List<Quiz> findByUser_IdAndCompletedTrue(Long userId);

    void deleteByUser_Id(Long userId);

    // 최근 완료 퀴즈 10개 (정답률 목록용)
    List<Quiz> findTop10ByUser_IdAndCompletedTrueOrderByCreatedAtDesc(Long userId);

    // 특정 기간 내 퀴즈 조회 (주간 통계용)
    List<Quiz> findByUser_IdAndCreatedAtBetween(Long userId, LocalDateTime start, LocalDateTime end);

    // 특정 기간 내 완료된 퀴즈 조회 (주간 통계 - 완료 기준)
    List<Quiz> findByUser_IdAndCompletedTrueAndCreatedAtBetween(Long userId, LocalDateTime start, LocalDateTime end);

    // 오늘 퀴즈에 참여한 유저 ID 목록 (알림 스케줄러 N+1 방지)
    @Query("SELECT DISTINCT q.user.id FROM Quiz q WHERE q.createdAt BETWEEN :start AND :end")
    List<Long> findUserIdsWithQuizBetween(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
}
