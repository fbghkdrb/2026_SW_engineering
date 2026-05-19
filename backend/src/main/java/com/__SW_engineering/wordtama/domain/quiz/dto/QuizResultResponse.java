package com.__SW_engineering.wordtama.domain.quiz.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class QuizResultResponse {

    private int totalCount;
    private int correctCount;
    // 후속 PBI에서 코인 지급 연결 예정
    private int coinEarned;
    private List<WrongWordDto> wrongWords;
    @JsonProperty("isPassed")
    private boolean isPassed;
    @JsonProperty("isFirstPassToday")
    private boolean isFirstPassToday;
    @JsonProperty("isEnding")
    @Builder.Default
    private boolean isEnding = false;
}
