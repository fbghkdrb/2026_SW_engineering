package com.__SW_engineering.wordtama.domain.wrongnote.repository;

import com.__SW_engineering.wordtama.domain.wrongnote.entity.DailyQuizPass;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface DailyQuizPassRepository extends JpaRepository<DailyQuizPass, Long> {

    Optional<DailyQuizPass> findByUserIdAndPassDate(Long userId, LocalDate passDate);
}
