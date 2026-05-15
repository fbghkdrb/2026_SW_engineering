package com.__SW_engineering.wordtama.domain.wrongnote.entity;

import com.__SW_engineering.wordtama.domain.quiz.entity.Quiz;
import com.__SW_engineering.wordtama.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 오답 퀴즈 일일 통과 기록 테이블.
 * 실제 운영 시 JPA DDL 자동 생성이 아닌 마이그레이션 스크립트로 별도 관리 필요.
 */
@Entity
@Table(
    name = "daily_quiz_pass",
    uniqueConstraints = @UniqueConstraint(
        name = "unique_user_date",
        columnNames = {"user_id", "pass_date"}
    )
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DailyQuizPass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "pass_date", nullable = false)
    private LocalDate passDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(name = "is_valid", nullable = false)
    private boolean isValid;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public DailyQuizPass(User user, LocalDate passDate, Quiz quiz) {
        this.user = user;
        this.passDate = passDate;
        this.quiz = quiz;
        this.isValid = true;
        this.createdAt = LocalDateTime.now();
    }
}
