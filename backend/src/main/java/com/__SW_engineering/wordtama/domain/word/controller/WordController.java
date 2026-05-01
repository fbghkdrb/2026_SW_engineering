package com.__SW_engineering.wordtama.domain.word.controller;

import com.__SW_engineering.wordtama.domain.word.dto.DayProgressResponse;
import com.__SW_engineering.wordtama.domain.word.dto.WordWithStatusResponse;
import com.__SW_engineering.wordtama.domain.word.service.WordService;
import com.__SW_engineering.wordtama.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/words")
@RequiredArgsConstructor
public class WordController {

    private final WordService wordService;

    @GetMapping("/days")
    public ResponseEntity<ApiResponse<List<DayProgressResponse>>> getDays(
            @AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(
                ApiResponse.success(wordService.getDays(userId), "day 목록 조회 성공"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<WordWithStatusResponse>>> getWords(
            @RequestParam Integer day,
            @AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(
                ApiResponse.success(wordService.getWords(day, userId), "단어 목록 조회 성공"));
    }

    @PatchMapping("/{wordId}/known")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> toggleKnown(
            @PathVariable Long wordId,
            @AuthenticationPrincipal Long userId) {
        boolean newState = wordService.toggleKnown(wordId, userId);
        return ResponseEntity.ok(
                ApiResponse.success(Map.of("isKnown", newState), "알겠다 상태가 변경되었습니다."));
    }

    @PatchMapping("/{wordId}/favorite")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> toggleFavorite(
            @PathVariable Long wordId,
            @AuthenticationPrincipal Long userId) {
        boolean newState = wordService.toggleFavorite(wordId, userId);
        return ResponseEntity.ok(
                ApiResponse.success(Map.of("isFavorite", newState), "즐겨찾기 상태가 변경되었습니다."));
    }
}
