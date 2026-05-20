import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getDays, getWords } from "../api/wordApi";
import WordCard from "../components/WordCard";
import ProgressBar from "../components/ProgressBar";
import { useAuth } from "../context/AuthContext";
import { useCharacter } from "../context/CharacterContext";
import useProgress from "../hooks/useProgress";

const NAV_ITEMS = [
  { label: "홈",     icon: "🏠", path: "/main" },
  { label: "단어장", icon: "📚", path: "/words" },
  { label: "퀴즈",   icon: "✏️", path: "/quiz" },
  { label: "오답노트", icon: "📝", path: "/wrong-notes" },
  { label: "상점",   icon: "🛍️", path: "/shop" },
  { label: "통계",   icon: "📊", path: "/stats" },
];

const FILTER_TABS = ["전체", "즐겨찾기", "모르겠다"];

const WordListPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { character } = useCharacter();
  const coin = character?.coin ?? 0;

  const [days, setDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);
  const [words, setWords] = useState([]);
  const [loadingDays, setLoadingDays] = useState(true);
  const [loadingWords, setLoadingWords] = useState(false);
  const [error, setError] = useState(null);
  const [filterTab, setFilterTab] = useState("전체");

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

  // days 로드 완료 후 첫 번째 Day 자동 선택
  useEffect(() => {
    if (days.length > 0 && selectedDay === null) {
      handleSelectDay(days[0].day);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const handleSelectDay = async (day) => {
    if (selectedDay === day) {
      setSelectedDay(null);
      setWords([]);
      return;
    }
    setSelectedDay(day);
    setFilterTab("전체");
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

  const handleStatusChange = useCallback(
    (wordId, patch) => {
      // 필터 탭이 실시간으로 반영되도록 words 배열도 업데이트
      setWords((prev) =>
        prev.map((w) => (w.id === wordId ? { ...w, ...patch } : w))
      );
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

  const filteredWords =
    filterTab === "즐겨찾기"
      ? words.filter((w) => w.isFavorite)
      : filterTab === "모르겠다"
      ? words.filter((w) => !w.isKnown)
      : words;

  return (
    <div className="min-h-screen bg-wt-sky pb-20">
      {/* 헤더 */}
      <header className="sticky top-0 z-20 bg-white shadow-sm flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/main")}
            className="text-gray-500 hover:text-wt-orange transition-colors text-xl leading-none"
          >
            ←
          </button>
          <h1 className="text-lg font-bold text-gray-800">단어장</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* 코인 배지 */}
          <div className="flex items-center gap-1 bg-wt-orange-light border border-wt-sky-dark rounded-full px-3 py-1">
            <span className="text-sm">🪙</span>
            <span className="text-sm font-bold text-wt-orange">{coin}</span>
          </div>
          {/* 로그아웃 아이콘 */}
          <button
            onClick={handleLogout}
            title={`${user?.nickname}님 로그아웃`}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-5 space-y-5">
        {/* 에러 */}
        {error && (
          <div className="bg-red-50 text-red-500 text-sm rounded-xl px-4 py-3">{error}</div>
        )}

        {/* 전체 진도율 바 */}
        {progress && (
          <ProgressBar completed={progress.completedDays} total={progress.totalDays} />
        )}

        {/* Day 뱃지 그리드 */}
        {loadingDays ? (
          <div className="text-center text-gray-400 py-8 text-sm">불러오는 중...</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {days.map((d) => (
              <DayBadge
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
              className="space-y-4"
            >
              <h2 className="text-base font-bold text-gray-700">Day {selectedDay} 단어</h2>

              {/* 필터 탭 */}
              <div className="flex items-center gap-2">
                {FILTER_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilterTab(tab)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                      filterTab === tab
                        ? "bg-wt-orange text-white shadow-sm"
                        : "bg-white text-gray-500 hover:bg-wt-orange-light hover:text-wt-orange"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
                <span className="ml-auto text-xs text-gray-400">
                  {filteredWords.length}개
                </span>
              </div>

              {loadingWords ? (
                <div className="text-center text-gray-400 py-12 text-sm">불러오는 중...</div>
              ) : filteredWords.length === 0 ? (
                <div className="text-center text-gray-400 py-12 text-sm">
                  {filterTab === "전체"
                    ? "등록된 단어가 없습니다."
                    : `${filterTab} 단어가 없습니다.`}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredWords.map((word) => (
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

      {/* 하단 네비게이션 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-20">
        <div className="max-w-4xl mx-auto flex">
          {NAV_ITEMS.map(({ label, icon, path }) => {
            const isActive = path === "/words";
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors ${
                  isActive ? "text-wt-orange" : "text-gray-400 hover:text-wt-orange"
                }`}
              >
                <span className="text-lg leading-none">{icon}</span>
                <span className={`text-[10px] font-semibold ${isActive ? "text-wt-orange" : ""}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

/** Day 뱃지 버튼 */
const DayBadge = ({ data, isSelected, isCompleted, onClick }) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.95 }}
    className={`rounded-full px-4 py-1.5 text-sm font-bold transition-all border ${
      isSelected
        ? "bg-wt-orange text-white border-wt-orange shadow-md"
        : isCompleted
        ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
        : "bg-white text-gray-600 border-gray-200 hover:border-wt-orange hover:text-wt-orange"
    }`}
  >
    {isCompleted && !isSelected ? "✓ " : ""}Day {data.day}
  </motion.button>
);

export default WordListPage;
