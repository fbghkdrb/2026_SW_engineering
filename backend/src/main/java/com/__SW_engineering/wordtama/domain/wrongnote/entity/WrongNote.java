package com.__SW_engineering.wordtama.domain.wrongnote.entity;

import com.__SW_engineering.wordtama.domain.user.entity.User;
import com.__SW_engineering.wordtama.domain.word.entity.Word;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "wrong_notes",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "word_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WrongNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "word_id", nullable = false)
    private Word word;

    @Column(name = "wrong_count", nullable = false)
    private int wrongCount;

    @Column(name = "last_wrong_at")
    private LocalDateTime lastWrongAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public WrongNote(User user, Word word) {
        this.user = user;
        this.word = word;
        this.wrongCount = 1;
        this.lastWrongAt = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
    }

    public void incrementWrongCount() {
        this.wrongCount++;
        this.lastWrongAt = LocalDateTime.now();
    }
}
