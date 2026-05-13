package com.__SW_engineering.wordtama.domain.wrongnote.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class WrongNoteQuizQuestionResponse {

    private Long wordId;
    private String english;
    private String korean;
    private List<String> choices;
}
