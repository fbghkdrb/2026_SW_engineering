package com.__SW_engineering.wordtama.domain.word.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class WordRequest {

    @NotBlank(message = "영어 단어는 필수입니다.")
    private String english;

    @NotBlank(message = "한국어 뜻은 필수입니다.")
    private String korean;

    private String example;

    private String exampleKorean;

    @NotNull(message = "day는 필수입니다.")
    @Positive(message = "day는 1 이상이어야 합니다.")
    private Integer day;
}
