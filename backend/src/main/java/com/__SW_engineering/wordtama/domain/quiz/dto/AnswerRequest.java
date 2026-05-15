package com.__SW_engineering.wordtama.domain.quiz.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AnswerRequest {

    @NotNull(message = "wordId는 필수입니다.")
    private Long wordId;

    // null 방지: 빈 문자열은 허용 (trim 후 비교 시 오답 처리)
    @NotNull(message = "userAnswer는 필수입니다.")
    private String userAnswer;
}
