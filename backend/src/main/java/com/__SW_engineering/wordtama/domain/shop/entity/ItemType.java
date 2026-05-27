package com.__SW_engineering.wordtama.domain.shop.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ItemType {

    FEED("캐릭터 먹이", "캐릭터에게 먹이를 줘 활력을 30 회복합니다.", 30, 30),
    TIME_EXTENSION("시간 연장", "퀴즈 타이머를 10초 늘립니다.", 15, 0);

    private final String name;
    private final String description;
    private final int price;
    private final int vitalityEffect;
}
