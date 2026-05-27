import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getWrongNotes, deleteWrongNote } from "../api/wrongNoteApi";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";

const NAV_ITEMS = [
  { label: "홈",      path: "/main",        icon: "🏠" },
  { label: "단어장",  path: "/words",       icon: "📚" },
  { label: "퀴즈",    path: "/quiz",        icon: "✏️" },
  { label: "오답노트", path: "/wrong-notes", icon: "📝" },
  { label: "상점",    path: "/shop",        icon: "🛒" },
  { label: "통계",    path: "/stats",       icon: "📊" },
];

const ttsSupported = typeof window !== "undefined" && "speechSynthesis" in window;

const FlipCard = ({ wn }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const handleSpeak = (e) => {
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(wn.english);
    utterance.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };
  return (
    <div className="cursor-pointer select-none" style={{ perspective: "1000px" }} onClick={() => setIsFlipped((f) => !f)}>
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.45, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d", position: "relative", height: "160px" }}
      >
        <div style={{ backfaceVisibility: "hidden" }}
          className="absolute inset-0 bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center gap-3 px-6">
          <p className="text-2xl font-bold text-wt-orange">{wn.english}</p>
          <button onClick={handleSpeak} disabled={!ttsSupported}
            title={ttsSupported ? "발음 듣기" : "이 브라우저는 TTS를 지원하지 않습니다"}
            className={`text-xl transition-opacity ${ttsSupported ? "opacity-80 hover:opacity-100 active:scale-95" : "opacity-30 cursor-not-allowed"}`}>
            🔊
          </button>
          <p className="text-xs text-gray-400">클릭해서 뜻 보기</p>
        </div>
        <div style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          className="absolute inset-0 bg-wt-sky-dark rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 px-6 text-center overflow-hidden">
          <p className="text-xl font-bold text-wt-navy">{wn.korean}</p>
          {wn.example && <p className="text-sm text-gray-600 italic leading-snug">{wn.example}</p>}
          {wn.exampleKr && <p className="text-xs text-gray-400 leading-snug">{wn.exampleKr}</p>}
        </div>
      </motion.div>
    </div>
  );
};

const WrongNotePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [wrongNotes, setWrongNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const [quizEntryThreshold, setQuizEntryThreshold] = useState(20);

  const fetchWrongNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getWrongNotes();
      if (data.success) {
        setWrongNotes(data.data.wrongNotes);
        setQuizEntryThreshold(data.data.quizEntryThreshold);
      }
    } catch {
      setError("오답 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWrongNotes(); }, []);

  const handleDelete = async (wordId) => {
    if (deletingId) return;
    setDeletingId(wordId);
    try {
      await deleteWrongNote(wordId);
      setWrongNotes((prev) => prev.filter((wn) => wn.wordId !== wordId));
    } catch {
      setDeleteError("삭제에 실패했습니다. 다시 시도해주세요.");
      setTimeout(() => setDeleteError(""), 3000);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-wt-sky flex flex-col">
      <header className="flex items-center gap-3 px-5 py-4 bg-white/70 backdrop-blur shadow-sm sticky top-0 z-10">
        <button onClick={() => navigate("/main")} className="text-gray-500 hover:text-gray-800 transition-colors text-lg">←</button>
        <h1 className="text-lg font-bold text-gray-800">오답노트</h1>
        {!loading && !error && (
          <span className="ml-auto text-sm text-gray-500 font-medium">총 {wrongNotes.length}개</span>
        )}
      </header>

      {deleteError && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          className="fixed top-16 left-0 right-0 flex justify-center z-50 px-4"
        >
          <div className="bg-red-500 text-white text-sm font-medium px-5 py-2.5 rounded-2xl shadow-lg">{deleteError}</div>
        </motion.div>
      )}

      <main className="flex-1 overflow-y-auto px-4 py-5 pb-40 max-w-4xl mx-auto w-full">
        {loading && <LoadingSpinner message="오답노트 불러오는 중..." />}

        {error && <ErrorMessage message={error} onRetry={fetchWrongNotes} />}

        {!loading && !error && wrongNotes.length === 0 && (
          <EmptyState icon="📝" message="오답 노트가 비어있어요" subMessage="퀴즈를 풀면 틀린 단어가 여기 모여요" />
        )}

        {!loading && !error && wrongNotes.length > 0 && (
          <AnimatePresence>
            <div className="grid grid-cols-3 gap-4">
              {wrongNotes.map((wn, idx) => (
                <motion.div
                  key={wn.wordId}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.04 }}
                  className="bg-white rounded-2xl shadow-sm p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-white bg-red-400 rounded-full px-3 py-1">{wn.wrongCount}회 틀림</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">마지막: {new Date(wn.lastWrongAt).toLocaleDateString("ko-KR")}</span>
                      <button onClick={() => handleDelete(wn.wordId)} disabled={deletingId === wn.wordId}
                        className="text-gray-300 hover:text-red-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-base leading-none"
                        title="오답노트에서 삭제">
                        {deletingId === wn.wordId ? "…" : "✕"}
                      </button>
                    </div>
                  </div>
                  <FlipCard wn={wn} />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-10">
        {!loading && !error && (
          <div className="bg-white/90 backdrop-blur px-4 pt-3 pb-2">
            <div className="max-w-4xl mx-auto">
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => navigate("/wrong-notes/quiz")}
                disabled={wrongNotes.length < quizEntryThreshold}
                style={{ background: wrongNotes.length >= quizEntryThreshold ? "#FF6B35" : undefined }}
                className="w-full disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl transition-colors shadow-md">
                {wrongNotes.length < quizEntryThreshold ? `오답 단어가 ${quizEntryThreshold}개 이상이어야 퀴즈를 시작할 수 있습니다` : "오답 퀴즈 시작 ✏️"}
              </motion.button>
            </div>
          </div>
        )}
        <nav style={{ background: "#fff", borderTop: "1px solid #E8F4FD", padding: "8px 16px", boxShadow: "0 -2px 10px rgba(0,0,0,0.04)" }}>
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
    </div>
  );
};

export default WrongNotePage;