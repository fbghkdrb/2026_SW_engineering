package com.__SW_engineering.wordtama.domain.notification.service;

import com.__SW_engineering.wordtama.domain.attendance.repository.AttendanceRepository;
import com.__SW_engineering.wordtama.domain.character.repository.CharacterRepository;
import com.__SW_engineering.wordtama.domain.notification.dto.NotificationResponseDto;
import com.__SW_engineering.wordtama.domain.notification.entity.Notification;
import com.__SW_engineering.wordtama.domain.notification.entity.NotificationType;
import com.__SW_engineering.wordtama.domain.notification.repository.NotificationRepository;
import com.__SW_engineering.wordtama.domain.user.entity.User;
import com.__SW_engineering.wordtama.domain.user.repository.UserRepository;
import com.__SW_engineering.wordtama.global.exception.CustomException;
import com.__SW_engineering.wordtama.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");

    private final NotificationRepository notificationRepository;
    private final CharacterRepository characterRepository;
    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    // GET /api/notifications 호출 시점에 조건부 알림 생성 후 미읽음 목록 반환
    @Transactional
    public List<NotificationResponseDto> getUnreadNotifications(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        LocalDateTime todayStart = todayStartSeoul();
        LocalDateTime todayEnd = todayEndSeoul();

        generateCharacterDangerIfNeeded(user, todayStart, todayEnd);
        generateAttendanceIfNeeded(user, todayStart, todayEnd);

        return notificationRepository
                .findByUser_IdAndIsReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponseDto::from)
                .collect(Collectors.toList());
    }

    // PATCH /api/notifications/{id}/read
    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOTIFICATION_NOT_FOUND));

        if (!notification.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }

        notification.markAsRead();
    }

    // 캐릭터 활력 <= 40 시 CHARACTER_DANGER 알림 생성 (오늘 중복 방지)
    private void generateCharacterDangerIfNeeded(User user, LocalDateTime start, LocalDateTime end) {
        characterRepository.findByUserId(user.getId()).ifPresent(character -> {
            if (character.getVitality() <= 40) {
                boolean exists = notificationRepository.existsByUser_IdAndTypeAndCreatedAtBetween(
                        user.getId(), NotificationType.CHARACTER_DANGER, start, end);
                if (!exists) {
                    notificationRepository.save(Notification.builder()
                            .user(user)
                            .type(NotificationType.CHARACTER_DANGER)
                            .message("캐릭터의 활력이 위험해요! 퀴즈를 풀어 회복시켜 주세요 ❤️")
                            .build());
                }
            }
        });
    }

    // 오늘 출석 미완료 시 ATTENDANCE 알림 생성 (오늘 중복 방지)
    private void generateAttendanceIfNeeded(User user, LocalDateTime start, LocalDateTime end) {
        LocalDate today = LocalDate.now(SEOUL);
        boolean attended = attendanceRepository.existsByUserIdAndAttendDate(user.getId(), today);
        if (!attended) {
            boolean exists = notificationRepository.existsByUser_IdAndTypeAndCreatedAtBetween(
                    user.getId(), NotificationType.ATTENDANCE, start, end);
            if (!exists) {
                notificationRepository.save(Notification.builder()
                        .user(user)
                        .type(NotificationType.ATTENDANCE)
                        .message("오늘 출석 체크를 아직 안 했어요! 잊지 마세요 📅")
                        .build());
            }
        }
    }

    // Seoul 기준 오늘 자정 (서버 로컬 시간으로 변환)
    public static LocalDateTime todayStartSeoul() {
        ZoneId server = ZoneId.systemDefault();
        ZonedDateTime seoulMidnight = LocalDate.now(SEOUL).atStartOfDay(SEOUL);
        return seoulMidnight.withZoneSameInstant(server).toLocalDateTime();
    }

    // Seoul 기준 내일 자정 (서버 로컬 시간으로 변환)
    public static LocalDateTime todayEndSeoul() {
        ZoneId server = ZoneId.systemDefault();
        ZonedDateTime seoulMidnight = LocalDate.now(SEOUL).plusDays(1).atStartOfDay(SEOUL);
        return seoulMidnight.withZoneSameInstant(server).toLocalDateTime();
    }
}
