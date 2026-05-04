package com.__SW_engineering.wordtama.domain.word.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class CsvUploadResponse {
    private int savedCount;
    private int skippedCount;
    private List<Long> skippedRows;
}
