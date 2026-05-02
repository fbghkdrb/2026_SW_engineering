import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getDays } from "../api/wordApi";
import {
  fetchQuizQuestions,
  startQuiz,
  submitAnswer as submitAnswerApi,
  submitQuiz as submitQuizApi,
} from "../api/quizApi";
import { useAuth } from "../context/AuthContext";

const QuizPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // 'select' | 'loading' | 'quiz'
  const [phase, setPhase] = useState("select");

  // Day 선택 화면 상태
  const [days, setDays] = useState([]);
  const [loadingDays, setLoadingDays] = useState(true);
  const [daysError, setDaysError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [startError, setStartError] = useState(null);

  // 퀴즈 진행 상태
  const [questions, setQuestions] = useState([]);
  const [quizId, setQuizId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null); // null | { isCorrect, correctAnswer }
  const [answerLoading, setAnswerLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [answerError, setAnswerError] = useState(null);

  const inputRef = useRef(null);
  const quizActiveRef = useRef(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // 퀴즈 진행 중 브라우저 새로고침/닫기 차단
  useEffect(() => {
    if (phase !== "quiz") return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [phase]);

  // 퀴즈 진행 중 브라우저 뒤로가기 차단 (BrowserRouter 호환)
  useEffect(() => {
    if (phase !== "quiz") return;
    window.history.pushState(null, "", window.location.pathname);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.pathname);
      setShowExitModal(true);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [phase]);

  // Day 목록 최초 로드
  useEffect(() => {
    loadDays();
  }, []);

  // 새 문제로 이동 시 입력창 자동 포커스
  useEffect(() => {
    if (phase === "quiz" && feedback === null) {
      inputRef.current?.focus();
    }
  }, [phase, currentIndex, feedback]);

  const loadDays = async () => {
    setLoadingDays(true);
    setDaysError(null);
    try {
      const res = await getDays();
      setDays(res.data.data);
    } catch {
      setDaysError("day 목록을 불러오지 못했습니다.");
    } finally {
      setLoadingDays(false);
    }
  };

  const handleStartQuiz = async () => {
    if (!selectedDay) return;
    setPhase("loading");
    setStartError(null);
    try {
      const [questionsRes, startRes] = await Promise.all([
        fetchQuizQuestions(selectedDay, "SHORT"),
        startQuiz(selectedDay, "SHORT"),
      ]);
      const qs = questionsRes.data.data;
      if (!qs || qs.length === 0) {
        setStartError("해당 day에 단어가 없습니다.");
        setPhase("select");
        return;
      }
      setQuestions(qs);
      setQuizId(startRes.data.data.quizId);
      setCurrentIndex(0);
      setUserAnswer("");
      setFeedback(null);
      setAnswerError(null);
      quizActiveRef.current = true;
      setPhase("quiz");
    } catch {
      setStartError("퀴즈를 불러오지 못했습니다. 다시 시도해주세요.");
      setPhase("select");
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim() || answerLoading || feedback !== null) return;
    setAnswerLoading(true);
    setAnswerError(null);
    try {
      const res = await submitAnswerApi(quizId, questions[currentIndex].wordId, userAnswer);
      setFeedback(res.data.data);
    } catch {
      setAnswerError("답 제출에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setAnswerLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmitAnswer();
  };

  const handleNext = () => {
    setCurrentIndex((i) => i + 1);
    setUserAnswer("");
    setFeedback(null);
    setAnswerError(null);
  };

  const handleFinalSubmit = async () => {
    setSubmitLoading(true);
    setAnswerError(null);
    try {
      const res = await submitQuizApi(quizId);
      quizActiveRef.current = false; // blocker 비활성화 후 이동
      navigate("/quiz/result", { state: res.data.data, replace: true });
    } catch {
      setAnswerError("최종 제출에 실패했습니다. 다시 시도해주세요.");
      setSubmitLoading(false);
    }
  };

  const isLastQuestion = questions.length > 0 && currentIndex === questions.length - 1;
  const progressPct = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  // ── Day 선택 화면 ──────────────────────────────────────────────────────────
  if (phase === "select") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <header className="flex items-center gap-3 mb-8 max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="text-gray-400 hover:text-indigo-600 transition-colors text-lg"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-indigo-600">퀴즈</h1>
          <span className="text-sm text-gray-500 ml-auto">{user?.nickname}님</span>
        </header>

        <main className="max-w-2xl mx-auto space-y-5">
          {startError && (
            <div className="bg-red-50 text-red-500 text-sm rounded-xl px-4 py-3">
              {startError}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-base font-semibold text-gray-700 mb-4">Day 선택</h2>

            {loadingDays ? (
              <div className="text-center text-gray-400 py-8">불러오는 중...</div>
            ) : daysError ? (
              <div className="text-center space-y-3 py-6">
                <p className="text-red-500 text-sm">{daysError}</p>
                <button
                  onClick={loadDays}
                  className="text-sm text-indigo-600 underline"
                >
                  다시 시도
                </button>
              </div>
            ) : days.length === 0 ? (
              <div className="text-center text-gray-400 py-8">등록된 단어가 없습니다.</div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {days.map((d) => (
                  <motion.button
                    key={d.day}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDay(d.day)}
                    className={`rounded-xl py-3 text-sm font-semibold transition-colors ${
                      selectedDay === d.day
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                    }`}
                  >
                    Day {d.day}
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleStartQuiz}
            disabled={!selectedDay || loadingDays}
            className="w-full bg-indigo-600 text-white font-semibold py-3.5 rounded-2xl hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {selectedDay ? `Day ${selectedDay} 퀴즈 시작` : "Day를 선택해주세요"}
          </motion.button>
        </main>
      </div>
    );
  }

  // ── 로딩 화면 ─────────────────────────────────────────────────────────────
  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <p className="text-indigo-600 text-lg font-semibold animate-pulse">퀴즈 준비 중...</p>
      </div>
    );
  }

  // ── 퀴즈 진행 화면 ────────────────────────────────────────────────────────
  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* 이탈 확인 모달 */}
      <AnimatePresence>
        {showExitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center"
            >
              <p className="text-lg font-bold text-gray-800 mb-2">퀴즈를 종료하시겠습니까?</p>
              <p className="text-sm text-gray-500 mb-6">
                진행 중인 퀴즈 결과는 저장되지 않습니다.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExitModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-indigo-300 text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-colors"
                >
                  계속 풀기
                </button>
                <button
                  onClick={() => {
                    quizActiveRef.current = false;
                    setShowExitModal(false);
                    navigate("/");
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors"
                >
                  나가기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 진행률 헤더 */}
      <header className="max-w-2xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setShowExitModal(true)}
            aria-label="퀴즈 종료"
            className="text-2xl leading-none text-gray-400 hover:text-red-400 transition-colors"
          >
            ×
          </button>
          <span className="text-sm font-semibold text-gray-600">
            {currentIndex + 1} / {questions.length}
          </span>
          <div className="w-6" />
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-indigo-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.35 }}
          />
        </div>
      </header>

      <main className="max-w-2xl mx-auto space-y-5">
        {/* 문제 카드 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-2xl shadow p-8 text-center"
          >
            <p className="text-xs text-indigo-400 font-medium mb-4 uppercase tracking-wide">
              한국어 뜻을 보고 영어 단어를 입력하세요
            </p>
            <p className="text-2xl font-bold text-gray-800 mb-3">
              {currentQuestion.korean}
            </p>
            {currentQuestion.exampleKr && (
              <p className="text-sm text-gray-400 italic leading-relaxed">
                {currentQuestion.exampleKr}
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* 입력창 — 오답 시 흔들림 애니메이션 */}
        <motion.div
          animate={
            feedback && !feedback.isCorrect
              ? { x: [0, -8, 8, -8, 8, 0] }
              : {}
          }
          transition={{ duration: 0.38 }}
        >
          <input
            ref={inputRef}
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!!feedback || answerLoading}
            placeholder="영어 단어 입력..."
            className={`w-full px-5 py-4 rounded-2xl border-2 text-center text-lg font-medium outline-none transition-all ${
              feedback
                ? feedback.isCorrect
                  ? "border-green-400 bg-green-50 text-green-800"
                  : "border-red-400 bg-red-50 text-red-700"
                : "border-gray-200 bg-white text-gray-800 focus:border-indigo-400"
            } disabled:cursor-default`}
          />
        </motion.div>

        {/* 즉시 피드백 */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`rounded-xl px-5 py-3.5 text-sm font-semibold text-center ${
                feedback.isCorrect
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-600 border border-red-200"
              }`}
            >
              {feedback.isCorrect ? (
                "✓ 정답!"
              ) : (
                <>
                  ✗ 오답&nbsp;·&nbsp;정답:{" "}
                  <span className="font-bold">{feedback.correctAnswer}</span>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 오류 메시지 + 재시도 안내 */}
        {answerError && (
          <p className="text-red-500 text-sm text-center">{answerError}</p>
        )}

        {/* 하단 버튼 영역 */}
        {!feedback ? (
          /* 제출 버튼 */
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmitAnswer}
            disabled={!userAnswer.trim() || answerLoading}
            className="w-full bg-indigo-600 text-white font-semibold py-3.5 rounded-2xl hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {answerLoading ? "채점 중..." : "제출"}
          </motion.button>
        ) : isLastQuestion ? (
          /* 마지막 문제 — 최종 제출 */
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleFinalSubmit}
            disabled={submitLoading}
            className="w-full bg-indigo-600 text-white font-semibold py-3.5 rounded-2xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {submitLoading ? "저장 중..." : "결과 보기 →"}
          </motion.button>
        ) : (
          /* 다음 문제 */
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleNext}
            className="w-full bg-indigo-600 text-white font-semibold py-3.5 rounded-2xl hover:bg-indigo-700 transition-colors"
          >
            다음 문제 →
          </motion.button>
        )}
      </main>
    </div>
  );
};

export default QuizPage;
