-- ============================================================
-- WordTama 배포 전 DB 마이그레이션 스크립트 (멱등성 보장)
-- 실행: mysql -u <user> -p wordtama < V5__prod_migration.sql
-- ============================================================

-- ── 1. daily_quiz_pass UNIQUE KEY 확인 및 보정 ─────────────────────────────
-- 엔티티: unique_user_date_type (user_id, pass_date, type)
-- ddl-auto=update 가 이미 적용했다면 이 블록은 no-op

SET @has_correct = (
    SELECT COUNT(1)
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'daily_quiz_pass'
      AND CONSTRAINT_NAME = 'unique_user_date_type'
      AND CONSTRAINT_TYPE = 'UNIQUE'
);

SET @sql = IF(@has_correct = 0,
    'ALTER TABLE daily_quiz_pass ADD CONSTRAINT unique_user_date_type UNIQUE (user_id, pass_date, type)',
    'SELECT ''[SKIP] unique_user_date_type already exists'' AS info'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ── 2. 성능 인덱스 추가 (IF NOT EXISTS — MySQL 8.0+) ────────────────────────

-- attendance: 날짜 기준 조회 최적화
CREATE INDEX IF NOT EXISTS idx_attendance_user_date
    ON attendance (user_id, attend_date);

-- daily_quiz_pass: 날짜 기준 조회 최적화
CREATE INDEX IF NOT EXISTS idx_daily_quiz_pass_user_date
    ON daily_quiz_pass (user_id, pass_date);

-- notifications: 오늘 범위 쿼리 최적화
CREATE INDEX IF NOT EXISTS idx_notifications_user_created
    ON notifications (user_id, created_at);

-- notifications: 미읽음 필터 최적화
CREATE INDEX IF NOT EXISTS idx_notifications_is_read
    ON notifications (user_id, is_read);

-- quizzes: 주간 통계 날짜 범위 쿼리 최적화
CREATE INDEX IF NOT EXISTS idx_quizzes_user_created
    ON quizzes (user_id, created_at);

-- wrong_notes: 오답 수 내림차순 정렬 최적화
CREATE INDEX IF NOT EXISTS idx_wrong_notes_user_count
    ON wrong_notes (user_id, wrong_count);

SELECT 'Migration V5 completed.' AS result;
