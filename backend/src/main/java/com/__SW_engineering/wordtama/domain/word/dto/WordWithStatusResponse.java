package com.__SW_engineering.wordtama.domain.word.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WordWithStatusResponse {

    private Long id;
    private Integer day;
    private String english;
    private String korean;
    private String example;
    private String exampleKr;

    @JsonProperty("isKnown")
    private boolean known;

    @JsonProperty("isFavorite")
    private boolean favorite;
}
