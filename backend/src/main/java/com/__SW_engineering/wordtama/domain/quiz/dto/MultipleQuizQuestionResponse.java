package com.__SW_engineering.wordtama.domain.quiz.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class MultipleQuizQuestionResponse {

    private Long wordId;
    private String question;
    private List<String> choices;
    private String correctAnswer;
}
