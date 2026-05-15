package com.__SW_engineering.wordtama.domain.character.controller;

import com.__SW_engineering.wordtama.domain.character.dto.CharacterResponse;
import com.__SW_engineering.wordtama.domain.character.service.CharacterService;
import com.__SW_engineering.wordtama.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/character")
@RequiredArgsConstructor
public class CharacterController {

    private final CharacterService characterService;

    @GetMapping
    public ResponseEntity<ApiResponse<CharacterResponse>> getCharacter(
            @AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(
                ApiResponse.success(characterService.getCharacter(userId), "성공"));
    }

    @PostMapping("/revive")
    public ResponseEntity<ApiResponse<CharacterResponse>> reviveCharacter(
            @AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(
                ApiResponse.success(characterService.reviveCharacter(userId), "성공"));
    }
}
