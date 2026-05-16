package com.__SW_engineering.wordtama.domain.attendance.entity;

import com.__SW_engineering.wordtama.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_attendance_user_date",
                columnNames = {"user_id", "attend_date"}
        ))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "attend_date", nullable = false)
    private LocalDate attendDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public Attendance(User user, LocalDate attendDate) {
        this.user = user;
        this.attendDate = attendDate;
        this.createdAt = LocalDateTime.now();
    }
}
