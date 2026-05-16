package com.__SW_engineering.wordtama.domain.shop.dto;

import com.__SW_engineering.wordtama.domain.shop.entity.ItemType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class UseItemRequest {

    @NotNull(message = "itemType은 필수입니다.")
    private ItemType itemType;
}
