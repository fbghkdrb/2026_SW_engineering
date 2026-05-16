package com.__SW_engineering.wordtama.domain.attendance.repository;

import com.__SW_engineering.wordtama.domain.attendance.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    boolean existsByUserIdAndAttendDate(Long userId, LocalDate attendDate);

    @Query("SELECT a.attendDate FROM Attendance a WHERE a.user.id = :userId AND a.attendDate BETWEEN :from AND :to")
    List<LocalDate> findAttendDatesByUserIdBetween(
            @Param("userId") Long userId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );
}
