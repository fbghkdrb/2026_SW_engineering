package com.__SW_engineering.wordtama.domain.quiz.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class QuizQuestionResponse {

    private Long wordId;
    private String korean;
    private String exampleKr;
}
