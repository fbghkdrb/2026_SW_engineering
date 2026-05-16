package com.__SW_engineering.wordtama.domain.shop.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL) // FEED가 아닌 경우 vitality 필드 제외
public class UseItemResponse {

    private String itemType;
    private int quantity;
    private Integer vitality; // FEED일 때만 반환
}
