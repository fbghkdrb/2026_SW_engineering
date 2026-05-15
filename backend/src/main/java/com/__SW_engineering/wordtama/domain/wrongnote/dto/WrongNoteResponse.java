package com.__SW_engineering.wordtama.domain.wrongnote.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class WrongNoteResponse {

    private Long wordId;
    private String english;
    private String korean;
    private String example;
    private String exampleKr;
    private int wrongCount;
    private LocalDateTime lastWrongAt;
}
