package com.__SW_engineering.wordtama.domain.shop.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserInventoryResponse {

    private String itemType;
    private int quantity;
}
