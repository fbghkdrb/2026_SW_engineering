package com.__SW_engineering.wordtama.domain.word.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "words")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Word {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer day;

    @Column(nullable = false, length = 100)
    private String english;

    @Column(nullable = false, length = 255)
    private String korean;

    @Column(columnDefinition = "TEXT")
    private String example;

    @Column(name = "example_kr", columnDefinition = "TEXT")
    private String exampleKr;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public Word(Integer day, String english, String korean, String example, String exampleKr) {
        this.day = day;
        this.english = english;
        this.korean = korean;
        this.example = example;
        this.exampleKr = exampleKr;
        this.createdAt = LocalDateTime.now();
    }

    public void update(Integer day, String english, String korean, String example, String exampleKr) {
        this.day = day;
        this.english = english;
        this.korean = korean;
        this.example = example;
        this.exampleKr = exampleKr;
    }
}
