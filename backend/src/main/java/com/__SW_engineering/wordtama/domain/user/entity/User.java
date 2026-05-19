package com.__SW_engineering.wordtama.domain.user.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 50)
    private String nickname;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // [PBI-14 v2.0] 취업 엔딩 최초 달성 여부 — 이미 엔딩을 본 유저는 false 유지
    @Column(name = "is_ended", nullable = false, columnDefinition = "TINYINT(1) DEFAULT 0")
    private boolean isEnded;

    @Builder
    public User(String username, String password, String nickname, Role role) {
        this.username = username;
        this.password = password;
        this.nickname = nickname;
        this.role = role;
        this.createdAt = LocalDateTime.now();
    }

    public void updateNickname(String nickname) {
        this.nickname = nickname;
    }

    // [PBI-14 v2.0] 취업 엔딩 최초 달성 시 1회만 호출
    public void markEnded() {
        this.isEnded = true;
    }

    public void toggleRole() {
        this.role = (this.role == Role.USER) ? Role.ADMIN : Role.USER;
    }

    public enum Role {
        USER, ADMIN
    }
}
