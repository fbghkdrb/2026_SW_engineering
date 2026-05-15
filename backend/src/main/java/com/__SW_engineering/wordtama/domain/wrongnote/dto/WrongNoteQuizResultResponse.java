package com.__SW_engineering.wordtama.domain.wrongnote.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WrongNoteQuizResultResponse {

    private Long quizId;
    private int correctCount;
    private int totalCount;
    private int vitalityGained;
}
