package com.__SW_engineering.wordtama.domain.user.controller;

import com.__SW_engineering.wordtama.domain.user.dto.NicknameUpdateRequest;
import com.__SW_engineering.wordtama.domain.user.dto.UserResponse;
import com.__SW_engineering.wordtama.domain.user.service.UserService;
import com.__SW_engineering.wordtama.global.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMe(@AuthenticationPrincipal Long userId) {
        UserResponse response = userService.getMe(userId);
        return ResponseEntity.ok(ApiResponse.success(response, "내 정보 조회 성공"));
    }

    @PatchMapping("/me/nickname")
    public ResponseEntity<ApiResponse<?>> updateNickname(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody NicknameUpdateRequest request) {
        userService.updateNickname(userId, request);
        return ResponseEntity.ok(ApiResponse.success("닉네임이 수정되었습니다."));
    }

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<?>> deleteUser(@AuthenticationPrincipal Long userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success("회원 탈퇴가 완료되었습니다."));
    }

    @GetMapping("/check")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkUsername(
            @RequestParam String username) {
        boolean available = userService.checkUsernameAvailable(username);
        return ResponseEntity.ok(
                ApiResponse.success(Map.of("available", available), "아이디 중복 확인 완료"));
    }
}
