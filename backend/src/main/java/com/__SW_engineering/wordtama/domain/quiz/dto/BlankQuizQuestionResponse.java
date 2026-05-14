package com.__SW_engineering.wordtama.domain.quiz.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BlankQuizQuestionResponse {

    private Long wordId;
    private String blankSentence;
    private String korean;
}
