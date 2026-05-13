import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getWrongNoteQuiz, submitWrongNoteQuiz } from "../api/wrongNoteApi";
import { useCharacter } from "../context/CharacterContext";

const WrongNoteQuizPage = () => {
  const navigate = useNavigate();
  const { fetchCharacter } = useCharacter();

  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState({}); // { wordId: chosenAnswer }
  const [result, setResult] = useState(null);   // { correctCount, totalCount, vitalityGained }
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data } = await getWrongNoteQuiz();
        if (data.success) setQuestions(data.data);
      } catch (err) {
        const msg = err.response?.data?.message ?? "퀴즈를 불러오는데 실패했습니다.";
        setFetchError(msg);
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
      return "bg-white border border-gray-200 text-gray-700 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer";
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
    const emoji = score === 100 ? "🎉" : score >= 70 ? "👍" : "💪";

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex flex-col items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 18 }}
          className="bg-white rounded-3xl shadow-lg p-10 w-full max-w-sm text-center space-y-5"
        >
          <p className="text-5xl">{emoji}</p>
          <h2 className="text-2xl font-bold text-gray-800">오답 퀴즈 완료!</h2>

          <div className="flex items-center justify-center gap-6">
            <div>
              <p className="text-4xl font-bold text-red-500">{result.correctCount}</p>
              <p className="text-xs text-gray-400 mt-1">정답</p>
            </div>
            <div className="text-gray-200 text-2xl">/</div>
            <div>
              <p className="text-4xl font-bold text-gray-700">{result.totalCount}</p>
              <p className="text-xs text-gray-400 mt-1">전체</p>
            </div>
          </div>

          {/* 점수 바 */}
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="h-full rounded-full bg-red-400"
            />
          </div>

          {/* 활력도 획득 안내 */}
          {result.vitalityGained > 0 ? (
            <div className="bg-orange-50 rounded-2xl py-3 px-4 flex items-center justify-center gap-2">
              <span className="text-lg">⚡</span>
              <p className="text-sm font-bold text-orange-500">
                활력도 +{result.vitalityGained} 획득!
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl py-3 px-4 flex items-center justify-center gap-2">
              <span className="text-lg">💡</span>
              <p className="text-sm text-gray-500">
                80% 이상 맞혀야 활력도를 획득할 수 있어요
              </p>
            </div>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/wrong-notes")}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-2xl transition-colors"
          >
            오답노트로 돌아가기
          </motion.button>
        </motion.div>
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
          className="text-indigo-600 hover:underline text-sm"
        >
          오답노트로 돌아가기
        </button>
      </div>
    );
  }

  // ── 퀴즈 문제 화면 ─────────────────────────────────────────────
  const answeredCount = Object.keys(selected).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex flex-col">
      {/* 헤더 */}
      <header className="flex items-center gap-3 px-5 py-4 bg-white/70 backdrop-blur shadow-sm sticky top-0 z-10">
        <button
          onClick={() => navigate("/wrong-notes")}
          className="text-gray-500 hover:text-gray-800 transition-colors text-lg"
        >
          ←
        </button>
        <h1 className="text-lg font-bold text-gray-800">오답 퀴즈</h1>
        <span className="ml-auto text-sm text-gray-500 font-medium">
          {answeredCount} / {questions.length}
        </span>
      </header>

      {/* 진행 바 */}
      <div className="h-1.5 bg-gray-100">
        <motion.div
          className="h-full bg-red-400"
          initial={{ width: 0 }}
          animate={{ width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* 문제 목록 */}
      <main className="flex-1 overflow-y-auto px-4 py-5 pb-28 max-w-lg mx-auto w-full space-y-5">
        <AnimatePresence>
          {questions.map((q, idx) => (
            <motion.div
              key={q.wordId}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.05 }}
              className="bg-white rounded-2xl shadow-sm p-5 space-y-4"
            >
              {/* 문제 번호 + 한국어 */}
              <div>
                <span className="text-xs font-bold text-red-400 uppercase tracking-wide">
                  Q{idx + 1}
                </span>
                <p className="text-lg font-bold text-gray-800 mt-1">{q.korean}</p>
              </div>

              {/* 보기 */}
              <div className="grid grid-cols-2 gap-2">
                {q.choices.map((choice) => (
                  <button
                    key={choice}
                    onClick={() => handleSelect(q.wordId, choice)}
                    className={`py-3 px-3 rounded-xl text-sm text-left transition-all ${getChoiceStyle(q, choice)}`}
                  >
                    {choice}
                  </button>
                ))}
              </div>

              {/* 선택 후 정답 표시 */}
              {selected[q.wordId] !== undefined && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-xs font-semibold ${
                    selected[q.wordId].toLowerCase() === q.english.toLowerCase()
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {selected[q.wordId].toLowerCase() === q.english.toLowerCase()
                    ? "✓ 정답!"
                    : `✗ 오답 — 정답: ${q.english}`}
                </motion.p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </main>

      {/* 하단 제출 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-gray-100 px-4 py-4 z-10">
        <div className="max-w-lg mx-auto space-y-2">
          {submitError && (
            <p className="text-xs text-red-500 text-center font-medium">{submitError}</p>
          )}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl transition-colors shadow-md"
          >
            {submitting
              ? "제출 중..."
              : allAnswered
              ? "제출하기"
              : `${questions.length - answeredCount}문제 남았습니다`}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default WrongNoteQuizPage;
