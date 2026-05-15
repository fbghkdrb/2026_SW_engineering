package com.__SW_engineering.wordtama.domain.quiz.entity;

import com.__SW_engineering.wordtama.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "quizzes")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer day;

    @Column(name = "total_count")
    private Integer totalCount;

    @Column(name = "correct_count")
    private Integer correctCount;

    // submit 호출 시점에만 true로 변경
    @Column(nullable = false)
    private boolean completed;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public Quiz(User user, Integer day) {
        this.user = user;
        this.day = day;
        this.completed = false;
        this.createdAt = LocalDateTime.now();
    }

    public void complete(int totalCount, int correctCount) {
        this.totalCount = totalCount;
        this.correctCount = correctCount;
        this.completed = true;
    }
}
