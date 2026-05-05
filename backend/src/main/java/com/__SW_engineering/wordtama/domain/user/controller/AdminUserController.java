package com.__SW_engineering.wordtama.domain.user.controller;

import com.__SW_engineering.wordtama.domain.user.dto.UserResponse;
import com.__SW_engineering.wordtama.domain.user.service.AdminUserService;
import com.__SW_engineering.wordtama.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> users = adminUserService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users, "유저 목록 조회 성공"));
    }

    @PatchMapping("/{userId}/role")
    public ResponseEntity<ApiResponse<UserResponse>> toggleUserRole(
            @AuthenticationPrincipal Long adminId,
            @PathVariable Long userId) {
        UserResponse updated = adminUserService.toggleUserRole(adminId, userId);
        return ResponseEntity.ok(ApiResponse.success(updated, "권한이 변경되었습니다."));
    }
}
