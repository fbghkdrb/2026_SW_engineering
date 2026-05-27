package com.__SW_engineering.wordtama.global.scheduler;

import com.__SW_engineering.wordtama.domain.notification.entity.Notification;
import com.__SW_engineering.wordtama.domain.notification.entity.NotificationType;
import com.__SW_engineering.wordtama.domain.notification.repository.NotificationRepository;
import com.__SW_engineering.wordtama.domain.notification.service.NotificationService;
import com.__SW_engineering.wordtama.domain.quiz.repository.QuizRepository;
import com.__SW_engineering.wordtama.domain.user.entity.User;
import com.__SW_engineering.wordtama.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationScheduler {

    private final UserRepository userRepository;
    private final QuizRepository quizRepository;
    private final NotificationRepository notificationRepository;

    // 매일 21:00 (Asia/Seoul) 퀴즈 미참여 유저에게 알림 발송
    @Transactional
    @Scheduled(cron = "0 0 21 * * *", zone = "Asia/Seoul")
    public void sendQuizMissingNotifications() {
        log.info("[NotificationScheduler] 퀴즈 미참여 알림 시작");

        LocalDateTime start = NotificationService.todayStartSeoul();
        LocalDateTime end = NotificationService.todayEndSeoul();

        // 오늘 퀴즈 참여 유저 / 이미 알림 받은 유저를 한 번씩만 조회 (N+1 방지)
        Set<Long> quizUserIds = new HashSet<>(quizRepository.findUserIdsWithQuizBetween(start, end));
        Set<Long> notifiedUserIds = new HashSet<>(
                notificationRepository.findUserIdsWithNotificationBetween(NotificationType.QUIZ_MISSING, start, end));

        List<User> users = userRepository.findByRole(User.Role.USER);

        List<Notification> toSave = users.stream()
                .filter(u -> !quizUserIds.contains(u.getId()) && !notifiedUserIds.contains(u.getId()))
                .map(u -> Notification.builder()
                        .user(u)
                        .type(NotificationType.QUIZ_MISSING)
                        .message("오늘 퀴즈에 아직 참여하지 않았어요! 지금 풀어보세요 🐣")
                        .build())
                .collect(Collectors.toList());

        notificationRepository.saveAll(toSave);

        log.info("[NotificationScheduler] 퀴즈 미참여 알림 완료 — {}명 발송", toSave.size());
    }
}
