package com.__SW_engineering.wordtama.domain.stats.controller;

import com.__SW_engineering.wordtama.domain.stats.dto.ProgressResponseDto;
import com.__SW_engineering.wordtama.domain.stats.service.StatsService;
import com.__SW_engineering.wordtama.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/progress")
    public ResponseEntity<ApiResponse<ProgressResponseDto>> getProgress(
            @AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(
                ApiResponse.success(statsService.getProgress(userId), "성공"));
    }
}
