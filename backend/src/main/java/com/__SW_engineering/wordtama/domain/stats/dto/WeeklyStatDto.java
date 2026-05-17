package com.__SW_engineering.wordtama.domain.stats.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WeeklyStatDto {

    private String date;
    private int count;
}
