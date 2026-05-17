package com.__SW_engineering.wordtama.domain.wrongnote.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class WrongNoteQuizSubmitRequest {

    @NotNull(message = "answers는 필수입니다.")
    @NotEmpty(message = "answers가 비어있습니다.")
    @Valid
    private List<AnswerItem> answers;

    @Getter
    @NoArgsConstructor
    public static class AnswerItem {

        @NotNull(message = "wordId는 필수입니다.")
        private Long wordId;

        @NotNull(message = "userAnswer는 필수입니다.")
        private String userAnswer;
    }
}
