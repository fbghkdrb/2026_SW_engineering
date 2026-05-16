package com.__SW_engineering.wordtama.domain.shop.dto;

import com.__SW_engineering.wordtama.domain.shop.entity.ItemType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BuyItemResponse {

    private String itemType;
    private int quantity;
    private long remainCoin;
}
