package com.__SW_engineering.wordtama.domain.character.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CharacterResponse {
    private String status;
    private int vitality;
    private long coin;
    private long reviveCost;
}
