package com.__SW_engineering.wordtama.domain.quiz.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class TodayPassResponse {

    @JsonProperty("isPassedToday")
    private boolean isPassedToday;
    private LocalDateTime passedAt;
}
