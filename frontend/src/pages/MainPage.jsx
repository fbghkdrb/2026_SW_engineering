import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useCharacter } from "../context/CharacterContext";
import { reviveCharacter } from "../api/characterApi";
import CharacterDisplay from "../components/CharacterDisplay";
import AttendanceWidget from "../components/AttendanceWidget";

const REVIVE_COST = 50;

const VITALITY_COLOR = (v) => {
  if (v >= 70) return "bg-green-400";
  if (v >= 40) return "bg-yellow-400";
  return "bg-red-400";
};

const STATUS_LABEL = {
  HAPPY: "신남",
  NORMAL: "보통",
  SAD: "슬픔",
  DANGER: "위험",
  FAINT: "기절",
};

const NAV_ITEMS = [
  { label: "단어장", path: "/words", icon: "📚" },
  { label: "퀴즈", path: "/quiz", icon: "✏️" },
  { label: "오답노트", path: "/wrong-notes", icon: "📝" },
  { label: "상점", path: "/shop", icon: "🛒" },
  { label: "통계", path: "/stats", icon: "📊" },
];

const MainPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { character, updateCharacter } = useCharacter();
  const [isReviving, setIsReviving] = useState(false);
  const [reviveError, setReviveError] = useState("");

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleRevive = async () => {
    setIsReviving(true);
    setReviveError("");
    try {
      const { data } = await reviveCharacter();
      if (data.success) {
        updateCharacter(data.data);
      }
    } catch (err) {
      const msg = err.response?.data?.message ?? "부활에 실패했습니다.";
      setReviveError(msg);
    } finally {
      setIsReviving(false);
    }
  };

  const vitality = character?.vitality ?? 0;
  const status = character?.status ?? "NORMAL";
  const coin = character?.coin ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex flex-col">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-5 py-4 bg-white/70 backdrop-blur shadow-sm">
        <h1 className="text-xl font-bold text-orange-500">WordTama</h1>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span className="flex items-center gap-1 font-semibold text-yellow-600">
            🪙 {coin.toLocaleString()}
          </span>
          <span>{user?.nickname}님</span>
          <button
            onClick={() => navigate("/mypage")}
            className="hover:text-orange-500 transition-colors"
          >
            설정
          </button>
          {user?.role === "ADMIN" && (
            <button
              onClick={() => navigate("/admin")}
              className="hover:text-purple-600 transition-colors font-semibold"
            >
              관리자
            </button>
          )}
          <button
            onClick={handleLogout}
            className="hover:text-red-500 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* 캐릭터 영역 */}
      <main className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-8">
        {/* 캐릭터 등장 애니메이션 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
        >
          <CharacterDisplay status={status} />
        </motion.div>

        {/* 상태 텍스트 */}
        <motion.p
          key={status}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-semibold text-gray-500"
        >
          상태: {STATUS_LABEL[status] ?? status}
        </motion.p>

        {/* 활력도 바 */}
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>활력도</span>
            <span>{vitality} / 100</span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${VITALITY_COLOR(vitality)}`}
              initial={{ width: 0 }}
              animate={{ width: `${vitality}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* 출석 위젯 */}
        <AttendanceWidget />

        {/* FAINT 상태 부활 버튼 */}
        {status === "FAINT" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-2"
          >
            <button
              onClick={handleRevive}
              disabled={isReviving}
              className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-bold px-8 py-3 rounded-2xl shadow-md transition-colors"
            >
              {isReviving ? "부활 중..." : `부활하기 (${REVIVE_COST}코인)`}
            </button>
            {reviveError && (
              <p className="text-xs text-red-500">{reviveError}</p>
            )}
          </motion.div>
        )}
      </main>

      {/* 하단 내비게이션 */}
      <nav className="bg-white border-t border-gray-100 px-4 py-3 shadow-inner">
        <div className="grid grid-cols-5 gap-1 max-w-lg mx-auto">
          {NAV_ITEMS.map(({ label, path, icon }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl hover:bg-orange-50 transition-colors"
            >
              <span className="text-xl">{icon}</span>
              <span className="text-xs text-gray-600 font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default MainPage;
