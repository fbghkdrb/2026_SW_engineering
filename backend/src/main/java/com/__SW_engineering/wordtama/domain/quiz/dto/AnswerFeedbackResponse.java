package com.__SW_engineering.wordtama.domain.quiz.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AnswerFeedbackResponse {

    @JsonProperty("isCorrect")
    private boolean correct;

    private String correctAnswer;
}
