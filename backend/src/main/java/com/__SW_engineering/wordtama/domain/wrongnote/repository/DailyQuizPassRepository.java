package com.__SW_engineering.wordtama.domain.wrongnote.repository;

import com.__SW_engineering.wordtama.domain.wrongnote.entity.DailyQuizPass;
import com.__SW_engineering.wordtama.domain.wrongnote.entity.DailyQuizPassType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyQuizPassRepository extends JpaRepository<DailyQuizPass, Long> {

    // [PBI-11 수정] type별 조회로 교체 — 유니크 제약이 (user_id, pass_date, type)으로 변경됨에 따라 타입 구분 필수
    Optional<DailyQuizPass> findByUserIdAndPassDateAndType(Long userId, LocalDate passDate, DailyQuizPassType type);

    boolean existsByUserIdAndPassDateAndType(Long userId, LocalDate passDate, DailyQuizPassType type);

    void deleteByUserId(Long userId);

    // [PBI-14] 부활 시 50% 리셋용 — is_valid=true인 레코드 전체 조회
    List<DailyQuizPass> findByUserIdAndIsValidTrue(Long userId);

    // [PBI-14] 엔딩 판단용 — is_valid=true이고 type이 일치하는 distinct pass_date 수 카운트
    @Query("SELECT COUNT(DISTINCT d.passDate) FROM DailyQuizPass d WHERE d.user.id = :userId AND d.isValid = true AND d.type = :type")
    long countDistinctPassDateByUserIdAndIsValidTrueAndType(
            @Param("userId") Long userId,
            @Param("type") DailyQuizPassType type
    );
}
