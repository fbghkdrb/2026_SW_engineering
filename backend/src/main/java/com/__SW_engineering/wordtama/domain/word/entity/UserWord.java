package com.__SW_engineering.wordtama.domain.word.entity;

import com.__SW_engineering.wordtama.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_words",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_user_word",
                columnNames = {"user_id", "word_id"}
        ))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserWord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "word_id", nullable = false)
    private Word word;

    @Column(name = "is_known", nullable = false)
    private boolean isKnown;

    @Column(name = "is_favorite", nullable = false)
    private boolean isFavorite;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public UserWord(User user, Word word, boolean isKnown, boolean isFavorite) {
        this.user = user;
        this.word = word;
        this.isKnown = isKnown;
        this.isFavorite = isFavorite;
        this.createdAt = LocalDateTime.now();
    }

    public void toggleKnown() {
        this.isKnown = !this.isKnown;
    }

    public void toggleFavorite() {
        this.isFavorite = !this.isFavorite;
    }
}
