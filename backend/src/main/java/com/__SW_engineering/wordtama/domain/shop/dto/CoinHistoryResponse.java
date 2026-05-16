package com.__SW_engineering.wordtama.domain.shop.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class CoinHistoryResponse {

    private long coin;
    private List<Object> history; // 추후 이력 테이블 추가 시 확장
}
