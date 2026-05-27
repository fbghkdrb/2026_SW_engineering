package com.__SW_engineering.wordtama.domain.notification.repository;

import com.__SW_engineering.wordtama.domain.notification.entity.Notification;
import com.__SW_engineering.wordtama.domain.notification.entity.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // 미읽음 알림 전체 조회 (최신순)
    List<Notification> findByUser_IdAndIsReadFalseOrderByCreatedAtDesc(Long userId);

    // 오늘 동일 type 알림 중복 방지 확인
    boolean existsByUser_IdAndTypeAndCreatedAtBetween(
            Long userId, NotificationType type, LocalDateTime start, LocalDateTime end);

    // 회원 탈퇴 시 알림 일괄 삭제
    void deleteByUser_Id(Long userId);

    // 오늘 특정 type 알림을 이미 받은 유저 ID 목록 (스케줄러 N+1 방지)
    @Query("SELECT DISTINCT n.user.id FROM Notification n WHERE n.type = :type AND n.createdAt BETWEEN :start AND :end")
    List<Long> findUserIdsWithNotificationBetween(
            @Param("type") NotificationType type,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
}
