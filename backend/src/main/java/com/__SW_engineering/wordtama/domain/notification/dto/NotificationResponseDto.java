package com.__SW_engineering.wordtama.domain.notification.dto;

import com.__SW_engineering.wordtama.domain.notification.entity.Notification;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class NotificationResponseDto {

    private Long id;
    private String type;
    private String message;
    private LocalDateTime createdAt;

    public static NotificationResponseDto from(Notification notification) {
        return NotificationResponseDto.builder()
                .id(notification.getId())
                .type(notification.getType().name())
                .message(notification.getMessage())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
