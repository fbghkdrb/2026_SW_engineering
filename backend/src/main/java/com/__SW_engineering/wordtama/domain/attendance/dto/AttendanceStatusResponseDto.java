package com.__SW_engineering.wordtama.domain.attendance.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class AttendanceStatusResponseDto {
    private int streak;
    private List<Boolean> last7Days;
}
