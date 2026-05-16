package com.__SW_engineering.wordtama.domain.attendance.controller;

import com.__SW_engineering.wordtama.domain.attendance.dto.AttendanceCheckResponseDto;
import com.__SW_engineering.wordtama.domain.attendance.dto.AttendanceStatusResponseDto;
import com.__SW_engineering.wordtama.domain.attendance.service.AttendanceService;
import com.__SW_engineering.wordtama.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping
    public ResponseEntity<ApiResponse<AttendanceCheckResponseDto>> checkAttendance(
            @AuthenticationPrincipal Long userId) {
        AttendanceCheckResponseDto result = attendanceService.checkAttendance(userId);
        String message = resolveCheckMessage(result);
        return ResponseEntity.ok(ApiResponse.success(result, message));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<AttendanceStatusResponseDto>> getAttendanceStatus(
            @AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(
                ApiResponse.success(attendanceService.getAttendanceStatus(userId), "출석 현황 조회 성공")
        );
    }

    private String resolveCheckMessage(AttendanceCheckResponseDto result) {
        if (result.isAlreadyChecked()) {
            return "이미 출석했습니다";
        }
        if (result.isBonusGranted()) {
            return result.getStreak() + "일 연속 출석! 보너스 코인 50 지급";
        }
        return "출석 체크 완료";
    }
}
