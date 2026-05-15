package com.__SW_engineering.wordtama.domain.word.dto;

import com.__SW_engineering.wordtama.domain.word.entity.Word;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class WordResponse {

    private Long id;
    private Integer day;
    private String english;
    private String korean;
    private String example;
    private String exampleKorean;

    public static WordResponse from(Word word) {
        return WordResponse.builder()
                .id(word.getId())
                .day(word.getDay())
                .english(word.getEnglish())
                .korean(word.getKorean())
                .example(word.getExample())
                .exampleKorean(word.getExampleKr())
                .build();
    }
}
