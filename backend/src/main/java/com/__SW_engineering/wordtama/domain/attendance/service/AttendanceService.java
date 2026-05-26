package com.__SW_engineering.wordtama.domain.attendance.service;

import com.__SW_engineering.wordtama.domain.attendance.dto.AttendanceCheckResponseDto;
import com.__SW_engineering.wordtama.domain.attendance.dto.AttendanceStatusResponseDto;
import com.__SW_engineering.wordtama.domain.attendance.entity.Attendance;
import com.__SW_engineering.wordtama.domain.attendance.repository.AttendanceRepository;
import com.__SW_engineering.wordtama.domain.character.service.CharacterService;
import com.__SW_engineering.wordtama.domain.user.entity.User;
import com.__SW_engineering.wordtama.domain.user.repository.UserRepository;
import com.__SW_engineering.wordtama.global.exception.CustomException;
import com.__SW_engineering.wordtama.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");
    private static final int STREAK_RANGE_DAYS = 365;
    private static final int ATTENDANCE_COIN_REWARD = 10;
    private static final int STREAK_BONUS_COIN = 50;
    private static final int STREAK_BONUS_INTERVAL = 7;

    private final AttendanceRepository attendanceRepository;
    private final CharacterService characterService;
    private final UserRepository userRepository;

    @Transactional
    public AttendanceCheckResponseDto checkAttendance(Long userId) {
        LocalDate today = LocalDate.now(SEOUL);

        // 당일 이미 출석한 경우 — 예외 없이 정상 응답
        if (attendanceRepository.existsByUserIdAndAttendDate(userId, today)) {
            int streak = fetchAndCalculateStreak(userId, today, true);
            return AttendanceCheckResponseDto.builder()
                    .alreadyChecked(true)
                    .streak(streak)
                    .bonusGranted(false)
                    .build();
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        try {
            attendanceRepository.saveAndFlush(Attendance.builder()
                    .user(user)
                    .attendDate(today)
                    .build());
        } catch (DataIntegrityViolationException e) {
            // 동시 요청으로 이미 출석 처리된 경우
            int streak = fetchAndCalculateStreak(userId, today, true);
            return AttendanceCheckResponseDto.builder()
                    .alreadyChecked(true)
                    .streak(streak)
                    .bonusGranted(false)
                    .build();
        }

        // 기본 출석 코인 지급
        characterService.addCoin(userId, ATTENDANCE_COIN_REWARD);

        // JPQL 쿼리 실행 전 flush되어 방금 INSERT된 행이 streak 계산에 포함됨
        int streak = fetchAndCalculateStreak(userId, today, true);

        boolean bonusGranted = (streak > 0 && streak % STREAK_BONUS_INTERVAL == 0);
        if (bonusGranted) {
            characterService.addCoin(userId, STREAK_BONUS_COIN);
        }

        return AttendanceCheckResponseDto.builder()
                .alreadyChecked(false)
                .streak(streak)
                .bonusGranted(bonusGranted)
                .build();
    }

    @Transactional(readOnly = true)
    public AttendanceStatusResponseDto getAttendanceStatus(Long userId) {
        LocalDate today = LocalDate.now(SEOUL);
        LocalDate rangeStart = today.minusDays(STREAK_RANGE_DAYS);

        List<LocalDate> allDates = attendanceRepository.findAttendDatesByUserIdBetween(userId, rangeStart, today);
        Set<LocalDate> attendedSet = new HashSet<>(allDates);

        // index 0 = 6일 전, index 6 = 오늘
        LocalDate sixDaysAgo = today.minusDays(6);
        List<Boolean> last7Days = new ArrayList<>(7);
        for (int i = 0; i < 7; i++) {
            last7Days.add(attendedSet.contains(sixDaysAgo.plusDays(i)));
        }

        boolean todayChecked = attendedSet.contains(today);
        int streak = calculateStreakFromSet(attendedSet, today, todayChecked);

        return AttendanceStatusResponseDto.builder()
                .streak(streak)
                .last7Days(last7Days)
                .build();
    }

    /**
     * DB에서 날짜 목록을 가져온 뒤 스트릭 계산
     * checkAttendance에서 사용 (save 후 호출 시 flush로 인해 오늘 행 포함)
     */
    private int fetchAndCalculateStreak(Long userId, LocalDate today, boolean todayChecked) {
        LocalDate rangeStart = today.minusDays(STREAK_RANGE_DAYS);
        List<LocalDate> dates = attendanceRepository.findAttendDatesByUserIdBetween(userId, rangeStart, today);
        return calculateStreakFromSet(new HashSet<>(dates), today, todayChecked);
    }

    /**
     * 오늘 기준으로 연속 출석 일수 역산
     * todayChecked=true  → 오늘부터 역산
     * todayChecked=false → 어제부터 역산 (어제도 없으면 0)
     */
    private int calculateStreakFromSet(Set<LocalDate> attendedSet, LocalDate today, boolean todayChecked) {
        LocalDate startDate = todayChecked ? today : today.minusDays(1);

        if (!attendedSet.contains(startDate)) {
            return 0;
        }

        int streak = 0;
        LocalDate current = startDate;
        while (attendedSet.contains(current)) {
            streak++;
            current = current.minusDays(1);
        }
        return streak;
    }
}
