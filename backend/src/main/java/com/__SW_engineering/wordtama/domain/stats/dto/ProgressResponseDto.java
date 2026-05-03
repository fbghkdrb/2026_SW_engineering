package com.__SW_engineering.wordtama.domain.stats.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ProgressResponseDto {

    private int completedDays;
    private int totalDays;
    private double progressRate;
    private List<Integer> completedDayList;
}
