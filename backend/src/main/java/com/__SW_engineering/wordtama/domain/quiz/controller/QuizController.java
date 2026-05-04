package com.__SW_engineering.wordtama.domain.quiz.controller;

import com.__SW_engineering.wordtama.domain.quiz.dto.*;
import com.__SW_engineering.wordtama.domain.quiz.service.QuizService;
import com.__SW_engineering.wordtama.global.dto.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<QuizQuestionResponse>>> getQuizQuestions(
            @RequestParam @Min(value = 1, message = "day는 1 이상이어야 합니다.") Integer day,
            @RequestParam String type) {
        return ResponseEntity.ok(
                ApiResponse.success(quizService.getQuizQuestions(day), "퀴즈 문제 조회 성공"));
    }

    @PostMapping("/start")
    public ResponseEntity<ApiResponse<StartQuizResponse>> startQuiz(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody StartQuizRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(quizService.startQuiz(userId, request), "퀴즈 시작 성공"));
    }

    @PostMapping("/{quizId}/answer")
    public ResponseEntity<ApiResponse<AnswerFeedbackResponse>> submitAnswer(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long quizId,
            @Valid @RequestBody AnswerRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(quizService.submitAnswer(userId, quizId, request), "답 제출 성공"));
    }

    @PostMapping("/{quizId}/submit")
    public ResponseEntity<ApiResponse<QuizResultResponse>> submitQuiz(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long quizId) {
        return ResponseEntity.ok(
                ApiResponse.success(quizService.submitQuiz(userId, quizId), "퀴즈 최종 제출 성공"));
    }
}
