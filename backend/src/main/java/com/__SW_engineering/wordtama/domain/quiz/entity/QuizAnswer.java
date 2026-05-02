package com.__SW_engineering.wordtama.domain.quiz.entity;

import com.__SW_engineering.wordtama.domain.word.entity.Word;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "quiz_answers")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class QuizAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "word_id", nullable = false)
    private Word word;

    @Column(name = "user_answer", length = 100)
    private String userAnswer;

    @Column(name = "is_correct", nullable = false)
    private boolean correct;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public QuizAnswer(Quiz quiz, Word word, String userAnswer, boolean correct) {
        this.quiz = quiz;
        this.word = word;
        this.userAnswer = userAnswer;
        this.correct = correct;
        this.createdAt = LocalDateTime.now();
    }
}
