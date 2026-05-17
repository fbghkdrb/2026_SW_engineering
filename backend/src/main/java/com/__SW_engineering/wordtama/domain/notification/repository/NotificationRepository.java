package com.__SW_engineering.wordtama.domain.notification.repository;

import com.__SW_engineering.wordtama.domain.notification.entity.Notification;
import com.__SW_engineering.wordtama.domain.notification.entity.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // 미읽음 알림 전체 조회 (최신순)
    List<Notification> findByUser_IdAndIsReadFalseOrderByCreatedAtDesc(Long userId);

    // 오늘 동일 type 알림 중복 방지 확인
    boolean existsByUser_IdAndTypeAndCreatedAtBetween(
            Long userId, NotificationType type, LocalDateTime start, LocalDateTime end);
}
