package com.__SW_engineering.wordtama.global.exception;

import com.__SW_engineering.wordtama.global.dto.ApiResponse;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ApiResponse<?>> handleCustomException(CustomException e) {
        log.error("CustomException: {}", e.getMessage());
        return ResponseEntity
                .status(e.getErrorCode().getStatus())
                .body(ApiResponse.fail(e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getAllErrors().stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("입력값이 올바르지 않습니다.");
        return ResponseEntity
                .badRequest()
                .body(ApiResponse.fail(message));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<?>> handleConstraintViolationException(ConstraintViolationException e) {
        String message = e.getConstraintViolations().stream()
                .findFirst()
                .map(ConstraintViolation::getMessage)
                .orElse("입력값이 올바르지 않습니다.");
        return ResponseEntity
                .badRequest()
                .body(ApiResponse.fail(message));
    }

    // daily_quiz_pass(user_id, pass_date) 유니크 제약 위반 시 DAILY_QUIZ_ALREADY_PASSED로 변환
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<?>> handleDataIntegrityViolation(DataIntegrityViolationException e) {
        String message = e.getMessage() != null ? e.getMessage() : "";
        if (message.contains("daily_quiz_pass")) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.fail(ErrorCode.DAILY_QUIZ_ALREADY_PASSED.getMessage()));
        }
        if (message.contains("unique_user_item_type") || message.contains("Duplicate entry")) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.fail("아이템 구매 처리 중 충돌이 발생했습니다. 다시 시도해주세요."));
        }
        log.error("DataIntegrityViolationException: {}", e.getMessage());
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiResponse.fail("데이터 중복 오류가 발생했습니다."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleException(Exception e) {
        log.error("Unhandled Exception: ", e);
        return ResponseEntity
                .internalServerError()
                .body(ApiResponse.fail("서버 오류가 발생했습니다."));
    }
}
