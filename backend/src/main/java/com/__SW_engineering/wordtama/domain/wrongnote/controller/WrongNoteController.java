package com.__SW_engineering.wordtama.domain.wrongnote.controller;

import com.__SW_engineering.wordtama.domain.wrongnote.dto.WrongNoteQuizQuestionResponse;
import com.__SW_engineering.wordtama.domain.wrongnote.dto.WrongNoteQuizResultResponse;
import com.__SW_engineering.wordtama.domain.wrongnote.dto.WrongNoteQuizSubmitRequest;
import com.__SW_engineering.wordtama.domain.wrongnote.dto.WrongNoteResponse;
import com.__SW_engineering.wordtama.domain.wrongnote.service.WrongNoteService;
import com.__SW_engineering.wordtama.global.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wrong-notes")
@RequiredArgsConstructor
public class WrongNoteController {

    private final WrongNoteService wrongNoteService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<WrongNoteResponse>>> getWrongNotes(
            @AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(
                ApiResponse.success(wrongNoteService.getWrongNotes(userId), "오답 목록 조회 성공"));
    }

    @GetMapping("/quiz")
    public ResponseEntity<ApiResponse<List<WrongNoteQuizQuestionResponse>>> getWrongNoteQuiz(
            @AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(
                ApiResponse.success(wrongNoteService.getWrongNoteQuiz(userId), "오답 퀴즈 조회 성공"));
    }

    @PostMapping("/quiz/submit")
    public ResponseEntity<ApiResponse<WrongNoteQuizResultResponse>> submitWrongNoteQuiz(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody WrongNoteQuizSubmitRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(wrongNoteService.submitWrongNoteQuiz(userId, request), "오답 퀴즈 제출 성공"));
    }
}
