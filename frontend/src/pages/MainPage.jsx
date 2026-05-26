import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import roomBg    from "../assets/background/room.png";
import libraryBg from "../assets/background/library.png";
import cafeBg    from "../assets/background/cafe.png";
import parkBg    from "../assets/background/park.png";
import { useAuth } from "../context/AuthContext";
import { useCharacter } from "../context/CharacterContext";
import { reviveCharacter } from "../api/characterApi";
import { getNotifications, markNotificationRead } from "../api/notificationApi";
import { getProgress, getQuizAccuracy } from "../api/statsApi";
import CharacterDisplay from "../components/CharacterDisplay";
import AttendanceWidget from "../components/AttendanceWidget";
import { isSoundOn, toggleSound } from "../utils/sound";


const NOTIFICATION_STYLE = {
  CHARACTER_DANGER: { bg: "#FFF1F0", border: "#FFA39E", text: "#820014" },
  QUIZ_MISSING:     { bg: "#FFFBE6", border: "#FFE58F", text: "#874D00" },
  ATTENDANCE:       { bg: "#E6F7FF", border: "#91D5FF", text: "#0050B3" },
};
const NOTIFICATION_PRIORITY = ["CHARACTER_DANGER", "QUIZ_MISSING", "ATTENDANCE"];

const STATUS_LABEL = { HAPPY: "신남", NORMAL: "보통", SAD: "슬픔", DANGER: "위험", FAINT: "기절" };
const STATUS_BADGE = {
  HAPPY:  { bg: "#d1fae5", color: "#065f46" },
  NORMAL: { bg: "#dcfce7", color: "#166534" },
  SAD:    { bg: "#e0f2fe", color: "#075985" },
  DANGER: { bg: "#fee2e2", color: "#991b1b" },
  FAINT:  { bg: "#f3f4f6", color: "#6b7280" },
};
const NAV_ITEMS = [
  { label: "홈",      path: "/main",        icon: "🏠" },
  { label: "단어장",  path: "/words",       icon: "📚" },
  { label: "퀴즈",    path: "/quiz",        icon: "✏️" },
  { label: "오답노트", path: "/wrong-notes", icon: "📝" },
  { label: "상점",    path: "/shop",        icon: "🛒" },
  { label: "통계",    path: "/stats",       icon: "📊" },
];
const BG_OPTIONS = [
  { key: "room",    label: "방",    src: roomBg },
  { key: "library", label: "도서관", src: libraryBg },
  { key: "cafe",    label: "카페",   src: cafeBg },
  { key: "park",    label: "공원",   src: parkBg },
];

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const MainPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout } = useAuth();
  const { character, updateCharacter } = useCharacter();
  const reviveCost = character?.reviveCost ?? 50;

  const [isReviving,   setIsReviving]   = useState(false);
  const [reviveError,  setReviveError]  = useState("");
  const [activeBanner, setActiveBanner] = useState(null);
  const [bgKey,        setBgKey]        = useState(() => localStorage.getItem("charBg") ?? "room");
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [todayStats,   setTodayStats]   = useState({
    completedDays: 0, totalDays: 0, progressRate: 0, latestAccuracy: 0, quizCount: 0,
  });

  // 사운드 토글 상태
  const [soundOn, setSoundOn] = useState(() => isSoundOn());

  // 코인 카운트업
  const coin = character?.coin ?? 0;
  const [displayCoin, setDisplayCoin] = useState(coin);
  const prevCoinRef = useRef(coin);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const from = prevCoinRef.current;
    const to = coin;
    prevCoinRef.current = to;
    if (from === to) return;

    const duration = 500;
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayCoin(Math.round(from + (to - from) * progress));
      if (progress < 1) animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [coin]);

  useEffect(() => {
    getNotifications()
      .then(({ data }) => {
        if (!data.success || !data.data?.length) return;
        const sorted = [...data.data].sort(
          (a, b) => NOTIFICATION_PRIORITY.indexOf(a.type) - NOTIFICATION_PRIORITY.indexOf(b.type)
        );
        setActiveBanner(sorted[0]);
      })
      .catch((err) => console.error("[MainPage] 알림 조회 실패:", err));
  }, []);

  useEffect(() => {
    getProgress()
      .then(({ data }) => {
        if (data.success && data.data) {
          const v = data.data;
          setTodayStats((prev) => ({
            ...prev,
            completedDays: v.completedDays ?? v.completedDay ?? 0,
            totalDays:     v.totalDays     ?? v.totalDay     ?? 0,
            progressRate:  v.progressRate  ?? v.progress     ?? 0,
          }));
        }
      })
      .catch((err) => console.error("[MainPage] 진도 조회 실패:", err));

    getQuizAccuracy()
      .then(({ data }) => {
        if (data.success && data.data) {
          const v = data.data;
          if (Array.isArray(v)) {
            const latest = v.length > 0 ? v[v.length - 1] : null;
            setTodayStats((prev) => ({
              ...prev,
              latestAccuracy: latest ? (latest.accuracy ?? latest.correctRate ?? 0) : 0,
              quizCount: v.length,
            }));
          } else {
            setTodayStats((prev) => ({
              ...prev,
              latestAccuracy: v.accuracy ?? v.correctRate ?? 0,
              quizCount:      v.quizCount ?? v.count ?? (v.accuracy != null ? 1 : 0),
            }));
          }
        }
      })
      .catch((err) => console.error("[MainPage] 정답률 조회 실패:", err));
  }, []);

  const handleLogout = async () => { await logout(); navigate("/login"); };

  const handleDismissBanner = async () => {
    if (!activeBanner) return;
    try { await markNotificationRead(activeBanner.id); } catch {}
    setActiveBanner(null);
  };

  const handleRevive = async () => {
    setIsReviving(true);
    setReviveError("");
    try {
      const { data } = await reviveCharacter();
      if (data.success) updateCharacter(data.data);
    } catch (err) {
      setReviveError(err.response?.data?.message ?? "부활에 실패했습니다.");
    } finally {
      setIsReviving(false);
    }
  };

  const handleBgChange = (key) => { setBgKey(key); localStorage.setItem("charBg", key); setShowBgPicker(false); };

  const handleSoundToggle = () => {
    toggleSound();
    setSoundOn(isSoundOn());
  };

  const currentBg = BG_OPTIONS.find((b) => b.key === bgKey)?.src ?? roomBg;
  const status = character?.status ?? "NORMAL";
  const vitality = character?.vitality ?? 0;
  const badge = STATUS_BADGE[status] ?? STATUS_BADGE.NORMAL;
  const bannerStyle = NOTIFICATION_STYLE[activeBanner?.type] ?? { bg: "#f9fafb", border: "#d1d5db", text: "#374151" };

  return (
    <div style={{ height: "100vh", background: "#D6EEFA", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <style>{`
        .main-char-wrap .character-wrapper img { width: 340px !important; height: 340px !important; }
        .main-char-wrap .character-wrapper .w-40 { width: 340px !important; }
        .main-char-wrap .character-wrapper .h-40 { height: 340px !important; }
        .main-char-wrap .character-wrapper .relative.group {
          position: absolute !important; top: 16px !important; right: 16px !important;
        }
        .main-char-wrap .character-wrapper .relative.group button:not(:disabled) {
          background-color: #FF6B35 !important; color: #fff !important;
        }
        @keyframes charWalk {
          from { transform: translateX(-200px) translateY(30px); }
          to   { transform: translateX(200px) translateY(30px); }
        }
        .main-char-wrap .character-wrapper img {
          animation: charWalk 4s ease-in-out infinite alternate;
        }
        .main-char-wrap .character-wrapper > div:first-of-type:not(.relative) {
          animation: charWalk 4s ease-in-out infinite alternate;
        }
      `}</style>

      <AnimatePresence>
        {activeBanner && (
          <motion.div
            key={activeBanner.id}
            initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 20px",
              background: bannerStyle.bg, borderBottom: `1px solid ${bannerStyle.border}`, color: bannerStyle.text,
              fontSize: "13px", fontWeight: 500, flexShrink: 0,
            }}
          >
            <span>{activeBanner.message}</span>
            <button onClick={handleDismissBanner} aria-label="알림 닫기"
              style={{ marginLeft: "16px", fontSize: "18px", opacity: 0.6, background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}>×</button>
          </motion.div>
        )}
      </AnimatePresence>

      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 24px", background: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)", flexShrink: 0,
      }}>
        <span style={{ fontSize: "22px", fontWeight: 800, color: "#FF6B35", letterSpacing: "-0.02em" }}>
          WordTama
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* 코인 배지 (카운트업 애니메이션) */}
          <div style={{
            display: "flex", alignItems: "center", gap: "4px",
            background: "#FFF3EE", borderRadius: "999px", padding: "5px 14px",
            fontSize: "14px", fontWeight: 700, color: "#FF6B35",
          }}>
            🪙 <motion.span>{displayCoin.toLocaleString()}</motion.span>
          </div>

          <span style={{ fontSize: "14px", color: "#4a5568", fontWeight: 500 }}>{user?.nickname}님</span>

          {/* 사운드 토글 버튼 */}
          <button
            onClick={handleSoundToggle}
            title={soundOn ? "사운드 끄기" : "사운드 켜기"}
            style={{
              fontSize: "18px", background: "none", border: "none", cursor: "pointer",
              opacity: soundOn ? 1 : 0.4, transition: "opacity 0.2s",
            }}
          >
            {soundOn ? "🔊" : "🔇"}
          </button>

          <button onClick={() => navigate("/mypage")} title="설정"
            style={{ fontSize: "20px", background: "none", border: "none", cursor: "pointer" }}>⚙️</button>

          {user?.role === "ADMIN" && (
            <button onClick={() => navigate("/admin")}
              style={{ fontSize: "12px", background: "none", border: "none", cursor: "pointer", color: "#7c3aed", fontWeight: 700 }}>
              관리자
            </button>
          )}

          <button onClick={handleLogout} title="로그아웃"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "none", border: "none", cursor: "pointer",
              color: "#8BAFC7", padding: "4px", transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#FF6B35")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#8BAFC7")}
          >
            <LogoutIcon />
          </button>
        </div>
      </header>

      <main className="flex-1" style={{ display: "flex", gap: "20px", padding: "20px 24px", minHeight: 0, overflow: "hidden" }}>

        <div style={{
          flex: 1, backgroundImage: `url(${currentBg})`, backgroundSize: "cover", backgroundPosition: "center",
          borderRadius: "20px", padding: "28px 20px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "14px",
          position: "relative", boxShadow: "0 4px 20px rgba(0,0,0,0.07)", overflow: "hidden",
        }}>
          <span style={{ position: "absolute", top: "14px",    right: "20px", color: "#FF6B35", fontSize: "14px", opacity: 0.5, pointerEvents: "none" }}>✦</span>
          <span style={{ position: "absolute", top: "50px",    left: "14px",  color: "#BAE0F7", fontSize: "10px", opacity: 0.9, pointerEvents: "none" }}>✦</span>
          <span style={{ position: "absolute", bottom: "130px", right: "16px", color: "#FF6B35", fontSize: "10px", opacity: 0.4, pointerEvents: "none" }}>✦</span>
          <span style={{ position: "absolute", bottom: "70px",  left: "18px",  color: "#BAE0F7", fontSize: "14px", opacity: 0.6, pointerEvents: "none" }}>✦</span>

          <div className="main-char-wrap" style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
            <CharacterDisplay status={status} isReviving={isReviving} />
          </div>

          <motion.div key={status} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{
              position: "absolute", top: "16px", left: "16px",
              background: badge.bg, color: badge.color,
              borderRadius: "999px", padding: "6px 20px", fontSize: "16px", fontWeight: 700,
            }}>
            상태: {STATUS_LABEL[status] ?? status}
          </motion.div>

          <div style={{ width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#4a5568", marginBottom: "6px", fontWeight: 600 }}>
              <span>활력도</span><span>{vitality} / 100</span>
            </div>
            <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.7)", borderRadius: "999px", overflow: "hidden" }}>
              <motion.div
                style={{ height: "100%", background: "#FF6B35", borderRadius: "999px" }}
                initial={{ width: 0 }} animate={{ width: `${vitality}%` }} transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>

          {showBgPicker && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setShowBgPicker(false)} />
              <div style={{
                position: "absolute", top: "96px", left: "16px", zIndex: 11,
                background: "rgba(255,255,255,0.96)", borderRadius: "12px", padding: "6px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", gap: "2px", minWidth: "110px",
              }}>
                {BG_OPTIONS.map(({ key, label }) => (
                  <button key={key} onClick={() => handleBgChange(key)}
                    style={{
                      background: bgKey === key ? "#FF6B35" : "none", color: bgKey === key ? "#fff" : "#1a1a2e",
                      border: "none", borderRadius: "8px", padding: "8px 12px",
                      fontSize: "13px", fontWeight: 600, cursor: "pointer", textAlign: "left",
                    }}>{label}</button>
                ))}
              </div>
            </>
          )}
          <button onClick={() => setShowBgPicker((v) => !v)}
            style={{
              position: "absolute", top: "58px", left: "16px", width: "32px", height: "32px",
              background: "rgba(255,255,255,0.85)", border: "none", borderRadius: "50%",
              fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)", zIndex: 12,
            }} title="배경 변경">🏠</button>

          {status === "FAINT" && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
              <button onClick={handleRevive} disabled={isReviving}
                style={{
                  width: "100%", background: isReviving ? "#ffb89a" : "#FF6B35",
                  color: "#fff", fontWeight: 700, fontSize: "14px",
                  padding: "10px", borderRadius: "12px", border: "none",
                  cursor: isReviving ? "not-allowed" : "pointer", transition: "background 0.2s",
                }}>
                {isReviving ? "부활 중..." : `부활하기 (${reviveCost}코인)`}
              </button>
              {reviveError && <p style={{ fontSize: "11px", color: "#ef4444" }}>{reviveError}</p>}
            </motion.div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: "fit-content", gap: "16px", minHeight: 0 }}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "20px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <AttendanceWidget />
          </div>
          <div style={{ flex: 1, background: "#fff", borderRadius: "20px", padding: "20px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", minHeight: 0 }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#1a1a2e", marginBottom: "12px", flexShrink: 0 }}>학습 현황</h3>
            {(todayStats.completedDays > 0 || todayStats.progressRate > 0 || todayStats.latestAccuracy > 0 || todayStats.quizCount > 0) ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", flex: 1, minHeight: 0 }}>
                {[
                  { label: "전체 진도율", value: todayStats.totalDays > 0 ? `${todayStats.completedDays} / ${todayStats.totalDays} DAY` : "-", icon: "📅" },
                  { label: "진도율",     value: `${todayStats.progressRate <= 1 ? Math.round(todayStats.progressRate * 100) : todayStats.progressRate}%`, icon: "📈" },
                  { label: "최근 정답률", value: todayStats.latestAccuracy > 0 ? `${todayStats.latestAccuracy}%` : "-", icon: "🎯" },
                  { label: "퀴즈 완료",  value: `${todayStats.quizCount}회`, icon: "✏️" },
                ].map((stat) => (
                  <div key={stat.label} style={{
                    background: "#F7FAFF", borderRadius: "12px", padding: "10px 12px",
                    display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px",
                  }}>
                    <span style={{ fontSize: "16px" }}>{stat.icon}</span>
                    <span style={{ fontSize: "18px", fontWeight: 800, color: "#1a1a2e", lineHeight: 1.2 }}>{stat.value}</span>
                    <span style={{ fontSize: "11px", color: "#8BAFC7", fontWeight: 500 }}>{stat.label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                <p style={{ fontSize: "13px", color: "#8BAFC7", textAlign: "center", lineHeight: 1.6 }}>
                  아직 오늘 학습을 시작하지 않았어요!<br />지금 시작해보세요 →
                </p>
                <button onClick={() => navigate("/words")}
                  style={{ background: "#FF6B35", color: "#fff", fontWeight: 700, fontSize: "13px", padding: "10px 24px", borderRadius: "999px", border: "none", cursor: "pointer" }}>
                  학습 시작하기
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <nav style={{ background: "#fff", borderTop: "1px solid #E8F4FD", padding: "8px 16px", boxShadow: "0 -2px 10px rgba(0,0,0,0.04)", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-around", maxWidth: "640px", margin: "0 auto" }}>
          {NAV_ITEMS.map(({ label, path, icon }) => {
            const active = location.pathname === path;
            return (
              <button key={label} onClick={() => navigate(path)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
                  padding: "6px 10px", border: "none", background: "none", cursor: "pointer",
                  color: active ? "#FF6B35" : "#8BAFC7", fontWeight: active ? 700 : 500, transition: "color 0.15s",
                }}>
                <span style={{ fontSize: "18px" }}>{icon}</span>
                <span style={{ fontSize: "11px" }}>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default MainPage;