package com.__SW_engineering.wordtama.domain.wrongnote.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class WrongNoteListResponse {
    private List<WrongNoteResponse> wrongNotes;
    private int quizEntryThreshold;
}
