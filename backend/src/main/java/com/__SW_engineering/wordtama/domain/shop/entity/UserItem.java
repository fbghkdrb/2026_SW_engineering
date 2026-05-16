package com.__SW_engineering.wordtama.domain.shop.entity;

import com.__SW_engineering.wordtama.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "user_items",
    uniqueConstraints = @UniqueConstraint(
        name = "unique_user_item_type",
        columnNames = {"user_id", "item_type"}
    )
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_type", nullable = false)
    private ItemType itemType;

    @Column(nullable = false)
    private int quantity;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public UserItem(User user, ItemType itemType) {
        this.user = user;
        this.itemType = itemType;
        this.quantity = 0;
        this.createdAt = LocalDateTime.now();
    }

    public void increaseQuantity(int amount) {
        this.quantity += amount;
    }

    public void decreaseQuantity(int amount) {
        if (this.quantity - amount < 0) {
            throw new com.__SW_engineering.wordtama.global.exception.CustomException(
                    com.__SW_engineering.wordtama.global.exception.ErrorCode.INSUFFICIENT_ITEM);
        }
        this.quantity -= amount;
    }
}
