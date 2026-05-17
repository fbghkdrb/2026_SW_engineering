package com.__SW_engineering.wordtama.domain.shop.service;

import com.__SW_engineering.wordtama.domain.character.entity.Character;
import com.__SW_engineering.wordtama.domain.character.repository.CharacterRepository;
import com.__SW_engineering.wordtama.domain.character.service.CharacterService;
import com.__SW_engineering.wordtama.domain.shop.dto.*;
import com.__SW_engineering.wordtama.domain.shop.entity.ItemType;
import com.__SW_engineering.wordtama.domain.shop.entity.UserItem;
import com.__SW_engineering.wordtama.domain.shop.repository.UserItemRepository;
import com.__SW_engineering.wordtama.domain.user.entity.User;
import com.__SW_engineering.wordtama.domain.user.repository.UserRepository;
import com.__SW_engineering.wordtama.global.exception.CustomException;
import com.__SW_engineering.wordtama.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShopService {

    private final UserItemRepository userItemRepository;
    private final CharacterRepository characterRepository;
    private final CharacterService characterService;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ShopItemResponse> getShopItems() {
        return Arrays.stream(ItemType.values())
                .map(ShopItemResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public BuyItemResponse buyItem(Long userId, BuyItemRequest request) {
        ItemType itemType = request.getItemType();

        // 코인 차감 (잔액 부족 시 Character.deductCoin 내부에서 INSUFFICIENT_COIN 예외 발생)
        Character character = characterRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHARACTER_NOT_FOUND));
        character.deductCoin(itemType.getPrice());

        // user_items에 quantity +1 (없으면 INSERT)
        // 동시 요청으로 unique 제약 위반 시 이미 저장된 레코드를 재조회해 정상 처리
        UserItem userItem;
        try {
            userItem = userItemRepository.findByUserIdAndItemType(userId, itemType)
                    .orElseGet(() -> {
                        User user = userRepository.findById(userId)
                                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
                        return userItemRepository.save(UserItem.builder()
                                .user(user)
                                .itemType(itemType)
                                .build());
                    });
        } catch (DataIntegrityViolationException e) {
            // 동시 INSERT 충돌 → 다른 트랜잭션이 먼저 저장한 레코드 재조회
            userItem = userItemRepository.findByUserIdAndItemType(userId, itemType)
                    .orElseThrow(() -> e);
        }
        userItem.increaseQuantity(1);

        return BuyItemResponse.builder()
                .itemType(itemType.name())
                .quantity(userItem.getQuantity())
                .remainCoin(character.getCoin())
                .build();
    }

    @Transactional
    public UseItemResponse useItem(Long userId, UseItemRequest request) {
        ItemType itemType = request.getItemType();

        // 보유 수량 확인
        UserItem userItem = userItemRepository.findByUserIdAndItemType(userId, itemType)
                .orElseThrow(() -> new CustomException(ErrorCode.INSUFFICIENT_ITEM));
        if (userItem.getQuantity() <= 0) {
            throw new CustomException(ErrorCode.INSUFFICIENT_ITEM);
        }

        // FEED: vitality 최대치 사전 체크 (수량 차감 전)
        if (itemType == ItemType.FEED) {
            Character character = characterRepository.findByUserId(userId)
                    .orElseThrow(() -> new CustomException(ErrorCode.CHARACTER_NOT_FOUND));
            if (character.getVitality() >= 100) {
                throw new CustomException(ErrorCode.VITALITY_ALREADY_MAX);
            }
        }

        // 수량 차감
        userItem.decreaseQuantity(1);

        // FEED: vitality +30 적용
        if (itemType == ItemType.FEED) {
            characterService.addVitality(userId, 30);
            Character character = characterRepository.findByUserId(userId)
                    .orElseThrow(() -> new CustomException(ErrorCode.CHARACTER_NOT_FOUND));
            return UseItemResponse.builder()
                    .itemType(itemType.name())
                    .quantity(userItem.getQuantity())
                    .vitality(character.getVitality())
                    .build();
        }

        // TIME_EXTENSION: FE에서 타이머 처리 — BE는 수량만 차감 후 응답
        return UseItemResponse.builder()
                .itemType(itemType.name())
                .quantity(userItem.getQuantity())
                .build();
    }

    // [PBI-11 추가] 유저 보유 아이템 목록 조회 (QuizPage TIME_EXTENSION 수량 표시용)
    @Transactional(readOnly = true)
    public List<UserInventoryResponse> getInventory(Long userId) {
        return Arrays.stream(ItemType.values())
                .map(type -> {
                    int qty = userItemRepository.findByUserIdAndItemType(userId, type)
                            .map(UserItem::getQuantity)
                            .orElse(0);
                    return UserInventoryResponse.builder()
                            .itemType(type.name())
                            .quantity(qty)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CoinHistoryResponse getCoinHistory(Long userId) {
        Character character = characterRepository.findByUserId(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.CHARACTER_NOT_FOUND));
        return CoinHistoryResponse.builder()
                .coin(character.getCoin())
                .history(Collections.emptyList())
                .build();
    }
}
