package com.__SW_engineering.wordtama.domain.quiz.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class StartQuizRequest {

    @NotNull(message = "day는 필수입니다.")
    private Integer day;

    @NotBlank(message = "type은 필수입니다.")
    private String type;
}
