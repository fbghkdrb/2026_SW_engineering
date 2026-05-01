package com.__SW_engineering.wordtama.domain.word.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class DayProgressResponse {

    private Integer day;
    private int totalCount;
    private int knownCount;
    private double progress;
}
