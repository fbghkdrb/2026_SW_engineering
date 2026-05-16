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

@Entity
@Table(
    name = "daily_quiz_pass",
    uniqueConstraints = @UniqueConstraint(
        name = "unique_user_date_type",
        columnNames = {"user_id", "pass_date", "type"}   // [PBI-11 수정] type 추가 — QUIZ와 WRONG_QUIZ가 같은 날 공존 가능하도록
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

    // [PBI-11 추가] 퀴즈 유형 구분 (QUIZ: 일반 퀴즈, WRONG_QUIZ: 오답 퀴즈)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DailyQuizPassType type;

    @Builder
    public DailyQuizPass(User user, LocalDate passDate, Quiz quiz, DailyQuizPassType type) {
        this.user = user;
        this.passDate = passDate;
        this.quiz = quiz;
        this.type = type;
        this.isValid = true;
        this.createdAt = LocalDateTime.now();
    }
}
