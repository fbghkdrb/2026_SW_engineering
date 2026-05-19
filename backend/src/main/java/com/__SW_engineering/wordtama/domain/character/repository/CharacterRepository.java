package com.__SW_engineering.wordtama.domain.character.repository;

import com.__SW_engineering.wordtama.domain.character.entity.Character;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface CharacterRepository extends JpaRepository<Character, Long> {
    Optional<Character> findByUserId(Long userId);

    // 부활 시 동시 요청 방어용 비관적 락
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM Character c WHERE c.user.id = :userId")
    Optional<Character> findByUserIdWithLock(@Param("userId") Long userId);

    void deleteByUserId(Long userId);

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE characters SET vitality = GREATEST(vitality - 15, 0), updated_at = :now", nativeQuery = true)
    void bulkDecreaseVitality(@Param("now") LocalDateTime now);

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE characters SET status = CASE WHEN vitality >= 80 THEN 'HAPPY' WHEN vitality >= 60 THEN 'NORMAL' WHEN vitality >= 40 THEN 'SAD' WHEN vitality >= 1 THEN 'DANGER' ELSE 'FAINT' END, updated_at = :now", nativeQuery = true)
    void bulkUpdateAllStatuses(@Param("now") LocalDateTime now);
}
