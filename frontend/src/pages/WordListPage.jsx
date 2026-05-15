import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getDays, getWords } from "../api/wordApi";
import WordCard from "../components/WordCard";
import ProgressBar from "../components/ProgressBar";
import { useAuth } from "../context/AuthContext";
import useProgress from "../hooks/useProgress";

const WordListPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [days, setDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [words, setWords] = useState([]);
  const [loadingDays, setLoadingDays] = useState(true);
  const [loadingWords, setLoadingWords] = useState(false);
  const [error, setError] = useState(null);

  const { progress } = useProgress();
  const completedDaySet = new Set(progress?.completedDayList ?? []);

  useEffect(() => {
    const fetchDays = async () => {
      try {
        const res = await getDays();
        setDays(res.data.data);
      } catch {
        setError("day 목록을 불러오지 못했습니다.");
      } finally {
        setLoadingDays(false);
      }
    };
    fetchDays();
  }, []);

  const handleSelectDay = async (day) => {
    if (selectedDay === day) {
      setSelectedDay(null);
      setWords([]);
      return;
    }
    setSelectedDay(day);
    setLoadingWords(true);
    try {
      const res = await getWords(day);
      setWords(res.data.data);
    } catch {
      setError("단어 목록을 불러오지 못했습니다.");
    } finally {
      setLoadingWords(false);
    }
  };

  // WordCard에서 known/favorite 변경 시 days 진도율 갱신
  const handleStatusChange = useCallback(
    (wordId, patch) => {
      if (patch.isKnown === undefined) return;
      setDays((prev) =>
        prev.map((d) => {
          if (d.day !== selectedDay) return d;
          const delta = patch.isKnown ? 1 : -1;
          const nextKnown = Math.max(0, Math.min(d.totalCount, d.knownCount + delta));
          return {
            ...d,
            knownCount: nextKnown,
            progress: d.totalCount > 0 ? (nextKnown / d.totalCount) * 100 : 0,
          };
        })
      );
    },
    [selectedDay]
  );

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <header className="flex items-center justify-between mb-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="text-gray-400 hover:text-indigo-600 transition-colors text-lg"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-indigo-600">단어장</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.nickname}님</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto space-y-6">
        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 text-red-500 text-sm rounded-xl px-4 py-3">{error}</div>
        )}

        {/* 전체 진도율 바 */}
        {progress && (
          <ProgressBar completed={progress.completedDays} total={progress.totalDays} />
        )}

        {/* Day 목록 */}
        {loadingDays ? (
          <div className="text-center text-gray-400 py-12">불러오는 중...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {days.map((d) => (
              <DayCard
                key={d.day}
                data={d}
                isSelected={selectedDay === d.day}
                isCompleted={completedDaySet.has(d.day)}
                onClick={() => handleSelectDay(d.day)}
              />
            ))}
          </div>
        )}

        {/* 단어 목록 */}
        <AnimatePresence>
          {selectedDay !== null && (
            <motion.div
              key={selectedDay}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-bold text-gray-700 mb-4">
                Day {selectedDay} 단어
              </h2>

              {loadingWords ? (
                <div className="text-center text-gray-400 py-12">불러오는 중...</div>
              ) : words.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  등록된 단어가 없습니다.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {words.map((word) => (
                    <WordCard
                      key={word.id}
                      word={word}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

/** Day 진도율 카드 */
const DayCard = ({ data, isSelected, isCompleted, onClick }) => {
  const pct = Math.round(data.progress);
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={`rounded-2xl p-4 text-left shadow transition-all ${
        isSelected
          ? "bg-indigo-600 text-white"
          : "bg-white text-gray-800 hover:shadow-md"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <p className={`text-xs font-semibold ${isSelected ? "text-indigo-200" : "text-gray-400"}`}>
          Day {data.day}
        </p>
        {/* 학습 완료 뱃지 */}
        {isCompleted && (
          <span
            className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
              isSelected
                ? "bg-white text-indigo-600"
                : "bg-green-100 text-green-600"
            }`}
          >
            완료
          </span>
        )}
      </div>
      <p className="text-lg font-bold mb-2">{pct}%</p>
      {/* 진도 바 */}
      <div className={`h-1.5 rounded-full ${isSelected ? "bg-indigo-400" : "bg-gray-100"}`}>
        <div
          className={`h-full rounded-full transition-all ${
            isSelected ? "bg-white" : "bg-indigo-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={`text-xs mt-1.5 ${isSelected ? "text-indigo-200" : "text-gray-400"}`}>
        {data.knownCount} / {data.totalCount}
      </p>
    </motion.button>
  );
};

export default WordListPage;
