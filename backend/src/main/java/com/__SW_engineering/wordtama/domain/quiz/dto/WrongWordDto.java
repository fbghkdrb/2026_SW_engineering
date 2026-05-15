package com.__SW_engineering.wordtama.domain.quiz.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WrongWordDto {

    private Long wordId;
    private String english;
    private String korean;
}
