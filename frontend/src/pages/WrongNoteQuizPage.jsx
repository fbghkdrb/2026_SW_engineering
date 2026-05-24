import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getWrongNoteQuiz, submitWrongNoteQuiz } from "../api/wrongNoteApi";
import { useCharacter } from "../context/CharacterContext";
import resultPerfect from "../assets/character/result_perfect.png";
import resultGood    from "../assets/character/result_good.png";
import resultBad     from "../assets/character/result_bad.png";

const WrongNoteQuizPage = () => {
  const navigate = useNavigate();
  const { fetchCharacter } = useCharacter();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState({}); // { wordId: chosenAnswer }
  const [result, setResult] = useState(null);   // { correctCount, totalCount, vitalityGained }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [entryBlocked, setEntryBlocked] = useState(false);
  const [entryMessage, setEntryMessage] = useState("");

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data } = await getWrongNoteQuiz();
        if (data.success) setQuestions(data.data);
      } catch (err) {
        const msg = err.response?.data?.message ?? "퀴즈를 불러오는데 실패했습니다.";
        if (err.response?.status === 400) {
          setEntryBlocked(true);
          setEntryMessage(msg);
        } else {
          setFetchError(msg);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, []);

  const handleSelect = (wordId, choice) => {
    // 이미 선택한 문제는 변경 불가
    if (selected[wordId] !== undefined) return;
    setSelected((prev) => ({ ...prev, [wordId]: choice }));
  };

  const allAnswered = questions.length > 0 && questions.every((q) => selected[q.wordId] !== undefined);

  const handleSubmit = async () => {
    if (!allAnswered || submitting) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const answers = questions.map((q) => ({
        wordId: q.wordId,
        userAnswer: selected[q.wordId],
      }));
      const { data } = await submitWrongNoteQuiz(answers);
      if (data.success) {
        setResult(data.data);
        fetchCharacter();
      }
    } catch (err) {
      const msg = err.response?.data?.message ?? "제출에 실패했습니다. 다시 시도해주세요.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const getChoiceStyle = (question, choice) => {
    const chosen = selected[question.wordId];
    const isCorrect = choice.toLowerCase() === question.english.toLowerCase();

    if (chosen === undefined) {
      return "bg-white border border-gray-200 text-gray-700 hover:border-wt-orange hover:bg-wt-orange-light cursor-pointer";
    }
    if (isCorrect) {
      return "bg-green-100 border border-green-400 text-green-700 font-semibold";
    }
    if (chosen === choice) {
      return "bg-red-100 border border-red-400 text-red-600 font-semibold";
    }
    return "bg-white border border-gray-100 text-gray-400";
  };

  // ── 결과 화면 ──────────────────────────────────────────────────
  if (result) {
    const score = result.totalCount > 0
      ? Math.round((result.correctCount / result.totalCount) * 100)
      : 0;
    const resultImg = score >= 80 ? resultPerfect : score >= 50 ? resultGood : resultBad;

    return (
      <div style={{ minHeight: "100vh", background: "#D6EEFA", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 18 }}
          style={{ background: "#fff", borderRadius: "24px", boxShadow: "0 8px 32px rgba(0,0,0,0.10)", padding: "40px 32px", width: "100%", maxWidth: "480px", textAlign: "center" }}
        >
          <img src={resultImg} alt="결과 캐릭터" style={{ width: "120px", height: "120px", objectFit: "contain", margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#1a1a2e", marginBottom: "20px" }}>오답 퀴즈 완료!</h2>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "24px", marginBottom: "16px" }}>
            <div>
              <p style={{ fontSize: "40px", fontWeight: 800, color: "#FF6B35" }}>{result.correctCount}</p>
              <p style={{ fontSize: "12px", color: "#8BAFC7", marginTop: "4px" }}>정답</p>
            </div>
            <div style={{ fontSize: "24px", color: "#E8F4FD" }}>/</div>
            <div>
              <p style={{ fontSize: "40px", fontWeight: 800, color: "#1a1a2e" }}>{result.totalCount}</p>
              <p style={{ fontSize: "12px", color: "#8BAFC7", marginTop: "4px" }}>전체</p>
            </div>
          </div>

          {/* 점수 바 */}
          <div style={{ height: "10px", background: "#E8F4FD", borderRadius: "999px", overflow: "hidden", marginBottom: "20px" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.7, delay: 0.2 }}
              style={{ height: "100%", borderRadius: "999px", background: "#FF6B35" }}
            />
          </div>

          {/* 활력도 획득 안내 */}
          {result.vitalityGained > 0 ? (
            <div style={{ background: "#FFF3EE", borderRadius: "16px", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{ fontSize: "18px" }}>⚡</span>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#FF6B35" }}>활력도 +{result.vitalityGained} 획득!</p>
            </div>
          ) : (
            <div style={{ background: "#F7FAFF", borderRadius: "16px", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{ fontSize: "18px" }}>💡</span>
              <p style={{ fontSize: "14px", color: "#8BAFC7" }}>80% 이상 맞혀야 활력도를 획득할 수 있어요</p>
            </div>
          )}

          {/* [PBI-11 추가] 코인 획득 안내 */}
          {result.coinEarned > 0 && (
            <div style={{ background: "#FFFBE6", borderRadius: "16px", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{ fontSize: "18px" }}>🪙</span>
              <p style={{ fontSize: "14px", fontWeight: 700, color: "#d97706" }}>코인 +{result.coinEarned} 획득!</p>
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/wrong-notes")}
            style={{ width: "100%", background: "#FF6B35", color: "#fff", fontWeight: 700, fontSize: "15px", padding: "14px", borderRadius: "999px", border: "none", cursor: "pointer", marginTop: "8px" }}
          >
            오답노트로 돌아가기
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ── 진입 조건 미충족 ───────────────────────────────────────────
  if (entryBlocked) {
    return (
      <div className="min-h-screen bg-wt-sky flex flex-col items-center justify-center px-6 gap-5">
        <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-sm text-center space-y-5">
          <p className="text-4xl">🚫</p>
          <p className="text-gray-700 font-semibold text-sm leading-relaxed">{entryMessage}</p>
          <motion.button
            disabled
            className="w-full bg-gray-200 text-gray-400 font-bold py-3.5 rounded-2xl cursor-not-allowed"
          >
            퀴즈 시작하기
          </motion.button>
          <button
            onClick={() => navigate("/wrong-notes")}
            className="text-wt-orange hover:underline text-sm"
          >
            오답노트로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // ── 로딩 / 에러 ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        퀴즈 불러오는 중...
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-red-500 font-semibold text-center">{fetchError}</p>
        <button
          onClick={() => navigate("/wrong-notes")}
          className="text-wt-orange hover:underline text-sm"
        >
          오답노트로 돌아가기
        </button>
      </div>
    );
  }

  // ── 퀴즈 문제 화면 ─────────────────────────────────────────────
  const answeredCount = Object.keys(selected).length;
  const currentQ = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const currentAnswered = currentQ && selected[currentQ.wordId] !== undefined;

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#D6EEFA", overflow: "hidden" }}>
      {/* 헤더 */}
      <header style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 20px", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", flexShrink: 0 }}>
        <button onClick={() => navigate("/wrong-notes")} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#8BAFC7" }}>←</button>
        <span style={{ fontSize: "18px", fontWeight: 800, color: "#1a1a2e" }}>오답 퀴즈</span>
        <span style={{ marginLeft: "auto", fontSize: "13px", color: "#8BAFC7", fontWeight: 600 }}>{currentIndex + 1} / {questions.length}</span>
      </header>

      {/* 진행 바 */}
      <div style={{ height: "6px", background: "#E8F4FD", flexShrink: 0 }}>
        <motion.div
          style={{ height: "100%", background: "#FF6B35" }}
          animate={{ width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* 문제 카드 */}
      <main style={{ flex: 1, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 24px" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.2 }}
            style={{ background: "#fff", borderRadius: "20px", padding: "28px 24px", width: "100%", maxWidth: "480px", boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}
          >
            <div style={{ marginBottom: "24px" }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#FF6B35", letterSpacing: "0.05em" }}>Q{currentIndex + 1}</span>
              <p style={{ fontSize: "22px", fontWeight: 800, color: "#1a1a2e", marginTop: "6px" }}>{currentQ.korean}</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {currentQ.choices.map((choice) => {
                const chosen = selected[currentQ.wordId];
                const isCorrect = choice.toLowerCase() === currentQ.english.toLowerCase();
                let bg = "#F7FAFF", border = "#E8F4FD", color = "#1a1a2e";
                if (chosen !== undefined) {
                  if (isCorrect) { bg = "#dcfce7"; border = "#86efac"; color = "#166534"; }
                  else if (chosen === choice) { bg = "#fee2e2"; border = "#fca5a5"; color = "#991b1b"; }
                  else { color = "#aaa"; }
                }
                return (
                  <button
                    key={choice}
                    onClick={() => handleSelect(currentQ.wordId, choice)}
                    style={{ background: bg, border: `1.5px solid ${border}`, color, borderRadius: "12px", padding: "12px", fontSize: "14px", fontWeight: 600, textAlign: "left", cursor: chosen !== undefined ? "default" : "pointer", transition: "all 0.15s" }}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>

            {currentAnswered && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: "14px", fontSize: "13px", fontWeight: 700, color: selected[currentQ.wordId]?.toLowerCase() === currentQ.english.toLowerCase() ? "#166534" : "#991b1b" }}
              >
                {selected[currentQ.wordId]?.toLowerCase() === currentQ.english.toLowerCase()
                  ? "✓ 정답!"
                  : `✗ 오답 — 정답: ${currentQ.english}`}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 하단 버튼 */}
      <div style={{ padding: "16px 24px", background: "#fff", borderTop: "1px solid #E8F4FD", flexShrink: 0 }}>
        {submitError && <p style={{ fontSize: "12px", color: "#ef4444", textAlign: "center", marginBottom: "8px", fontWeight: 600 }}>{submitError}</p>}
        {isLast ? (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            style={{ width: "100%", background: allAnswered && !submitting ? "#FF6B35" : "#d1d5db", color: "#fff", fontWeight: 700, fontSize: "15px", padding: "14px", borderRadius: "999px", border: "none", cursor: allAnswered && !submitting ? "pointer" : "not-allowed", transition: "background 0.2s" }}
          >
            {submitting ? "제출 중..." : allAnswered ? "제출하기" : `${questions.length - answeredCount}문제 남았습니다`}
          </motion.button>
        ) : (
          <motion.button
            whileTap={currentAnswered ? { scale: 0.97 } : {}}
            onClick={() => currentAnswered && setCurrentIndex((i) => i + 1)}
            style={{ width: "100%", background: currentAnswered ? "#FF6B35" : "#d1d5db", color: "#fff", fontWeight: 700, fontSize: "15px", padding: "14px", borderRadius: "999px", border: "none", cursor: currentAnswered ? "pointer" : "not-allowed", transition: "background 0.2s" }}
          >
            다음 →
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default WrongNoteQuizPage;
