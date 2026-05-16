import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAttendance, postAttendance } from "../api/attendanceApi";
import { useCharacter } from "../context/CharacterContext";

const DAY_LABELS = ["6일전", "5일전", "4일전", "3일전", "2일전", "어제", "오늘"];

const AttendanceWidget = () => {
  const { setStreak, fetchCharacter } = useCharacter();
  const [last7Days, setLast7Days] = useState(Array(7).fill(false));
  const [currentStreak, setCurrentStreak] = useState(0);
  const [todayChecked, setTodayChecked] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [toast, setToast] = useState(null);

  const loadStatus = useCallback(async () => {
    try {
      const { data } = await getAttendance();
      if (data.success) {
        setLast7Days(data.data.last7Days);
        setCurrentStreak(data.data.streak);
        setStreak(data.data.streak);
        // index 6 = 오늘
        setTodayChecked(data.data.last7Days[6]);
      }
    } catch {
      // 네트워크 오류 등 무시
    }
  }, [setStreak]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const handleCheckAttendance = async () => {
    if (todayChecked || isChecking) return;
    setIsChecking(true);
    try {
      const { data } = await postAttendance();
      if (data.success) {
        const { streak, bonusGranted, alreadyChecked } = data.data;
        setCurrentStreak(streak);
        setStreak(streak);

        if (!alreadyChecked) {
          setTodayChecked(true);
          setLast7Days((prev) => {
            const next = [...prev];
            next[6] = true;
            return next;
          });
          // 코인 변경을 Context에 반영
          await fetchCharacter();
        }

        if (bonusGranted) {
          showToast(`🎉 ${streak}일 연속 출석! 보너스 코인 50 지급!`, "bonus");
        } else {
          showToast("출석 체크 완료! 코인 10 지급", "success");
        }
      }
    } catch {
      showToast("출석 체크에 실패했습니다.", "error");
    } finally {
      setIsChecking(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toastStyle = {
    bonus: "bg-yellow-100 text-yellow-700 border border-yellow-300",
    success: "bg-green-100 text-green-700 border border-green-300",
    error: "bg-red-100 text-red-600 border border-red-300",
  };

  return (
    <div className="w-full max-w-xs bg-white/80 rounded-2xl shadow p-4">
      {/* 헤더: 출석 현황 + 스트릭 */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-gray-700">출석 현황</span>
        <AnimatePresence mode="wait">
          {currentStreak > 0 && (
            <motion.span
              key={currentStreak}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm font-bold text-orange-500"
            >
              🔥 {currentStreak}일 연속 출석!
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* 최근 7일 출석 원형 표시 */}
      <div className="flex justify-between mb-4">
        {last7Days.map((checked, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                checked
                  ? "bg-orange-400 border-orange-400 text-white"
                  : "bg-white border-gray-300 text-gray-300"
              }`}
            >
              {checked ? "✓" : ""}
            </motion.div>
            <span className="text-[9px] text-gray-400">{DAY_LABELS[i]}</span>
          </div>
        ))}
      </div>

      {/* 출석 버튼 */}
      {!todayChecked ? (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleCheckAttendance}
          disabled={isChecking}
          className="w-full py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors"
        >
          {isChecking ? "처리 중..." : "출석 체크"}
        </motion.button>
      ) : (
        <div className="w-full py-2 bg-gray-100 text-gray-400 text-sm font-bold rounded-xl text-center">
          오늘 출석 완료 ✓
        </div>
      )}

      {/* 토스트 메시지 */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className={`mt-2 text-xs text-center py-2 px-3 rounded-xl font-semibold ${toastStyle[toast.type]}`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AttendanceWidget;
