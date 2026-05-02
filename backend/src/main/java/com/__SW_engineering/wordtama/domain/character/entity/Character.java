package com.__SW_engineering.wordtama.domain.character.entity;

import com.__SW_engineering.wordtama.domain.user.entity.User;
import com.__SW_engineering.wordtama.global.exception.CustomException;
import com.__SW_engineering.wordtama.global.exception.ErrorCode;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "characters")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Character {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CharacterStatus status;

    @Column(nullable = false)
    private int vitality;

    @Column(nullable = false)
    private long coin;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Builder
    public Character(User user) {
        this.user = user;
        this.status = CharacterStatus.HAPPY;
        this.vitality = 100;
        this.coin = 0;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void revive(long cost) {
        if (this.status != CharacterStatus.FAINT) {
            throw new CustomException(ErrorCode.CHARACTER_NOT_FAINT);
        }
        if (this.coin < cost) {
            throw new CustomException(ErrorCode.INSUFFICIENT_COIN);
        }
        this.coin -= cost;
        this.status = CharacterStatus.NORMAL;
        this.vitality = 100;
        this.updatedAt = LocalDateTime.now();
    }
}
