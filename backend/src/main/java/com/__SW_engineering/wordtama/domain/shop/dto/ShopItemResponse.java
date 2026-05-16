package com.__SW_engineering.wordtama.domain.shop.dto;

import com.__SW_engineering.wordtama.domain.shop.entity.ItemType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ShopItemResponse {

    private String itemType;
    private String name;
    private String description;
    private int price;

    public static ShopItemResponse from(ItemType itemType) {
        return ShopItemResponse.builder()
                .itemType(itemType.name())
                .name(itemType.getName())
                .description(itemType.getDescription())
                .price(itemType.getPrice())
                .build();
    }
}
