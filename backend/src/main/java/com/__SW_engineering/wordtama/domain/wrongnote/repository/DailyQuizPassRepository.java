package com.__SW_engineering.wordtama.domain.wrongnote.repository;

import com.__SW_engineering.wordtama.domain.wrongnote.entity.DailyQuizPass;
import com.__SW_engineering.wordtama.domain.wrongnote.entity.DailyQuizPassType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface DailyQuizPassRepository extends JpaRepository<DailyQuizPass, Long> {

    // [PBI-11 수정] type별 조회로 교체 — 유니크 제약이 (user_id, pass_date, type)으로 변경됨에 따라 타입 구분 필수
    Optional<DailyQuizPass> findByUserIdAndPassDateAndType(Long userId, LocalDate passDate, DailyQuizPassType type);

    boolean existsByUserIdAndPassDateAndType(Long userId, LocalDate passDate, DailyQuizPassType type);
}
