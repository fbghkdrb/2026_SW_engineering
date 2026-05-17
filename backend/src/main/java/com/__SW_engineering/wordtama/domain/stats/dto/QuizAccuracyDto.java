package com.__SW_engineering.wordtama.domain.stats.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class QuizAccuracyDto {

    private Long quizId;
    private Integer day;
    private Integer correctCount;
    private Integer totalCount;
    private double accuracy;
    private LocalDateTime createdAt;
}
