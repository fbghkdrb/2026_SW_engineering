package com.__SW_engineering.wordtama.domain.shop.controller;

import com.__SW_engineering.wordtama.domain.shop.dto.*;
import com.__SW_engineering.wordtama.domain.shop.service.ShopService;
import com.__SW_engineering.wordtama.global.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ShopController {

    private final ShopService shopService;

    @GetMapping("/api/shop/items")
    public ResponseEntity<ApiResponse<List<ShopItemResponse>>> getShopItems() {
        return ResponseEntity.ok(
                ApiResponse.success(shopService.getShopItems(), "상점 아이템 목록 조회 성공"));
    }

    @PostMapping("/api/shop/buy")
    public ResponseEntity<ApiResponse<BuyItemResponse>> buyItem(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody BuyItemRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(shopService.buyItem(userId, request), "아이템 구매 성공"));
    }

    @PostMapping("/api/shop/use")
    public ResponseEntity<ApiResponse<UseItemResponse>> useItem(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody UseItemRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(shopService.useItem(userId, request), "아이템 사용 성공"));
    }

    @GetMapping("/api/shop/inventory")
    public ResponseEntity<ApiResponse<List<UserInventoryResponse>>> getInventory(
            @AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(
                ApiResponse.success(shopService.getInventory(userId), "보유 아이템 조회 성공"));
    }

    @GetMapping("/api/coins/history")
    public ResponseEntity<ApiResponse<CoinHistoryResponse>> getCoinHistory(
            @AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(
                ApiResponse.success(shopService.getCoinHistory(userId), "코인 내역 조회 성공"));
    }
}
