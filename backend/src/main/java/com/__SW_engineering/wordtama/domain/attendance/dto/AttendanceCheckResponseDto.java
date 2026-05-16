package com.__SW_engineering.wordtama.domain.attendance.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AttendanceCheckResponseDto {
    private boolean alreadyChecked;
    private int streak;
    private boolean bonusGranted;
}
