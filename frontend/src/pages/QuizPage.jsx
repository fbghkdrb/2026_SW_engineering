import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getDays } from "../api/wordApi";
import {
  fetchQuizQuestions,
  fetchMultipleQuizQuestions,
  fetchBlankQuizQuestions,
  startQuiz,
  submitAnswer as submitAnswerApi,
  submitQuiz as submitQuizApi,
} from "../api/quizApi";
import { useAuth } from "../context/AuthContext";

const TIMER_SECONDS = 15;

const QUIZ_TYPES = [
  { id: "SHORT", label: "주관식", desc: "한국어 뜻을 보고 영어 단어 입력" },
  { id: "MULTIPLE_EN_KO", label: "객관식 영→뜻", desc: "영어 단어를 보고 한국어 뜻 선택" },
  { id: "MULTIPLE_KO_EN", label: "객관식 뜻→영", desc: "한국어 뜻을 보고 영어 단어 선택" },
  { id: "BLANK", label: "빈칸 채우기", desc: "예문의 빈칸에 들어갈 영어 단어 입력" },
];

const QuizPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // 'select' | 'type-select' | 'loading' | 'quiz'
  const [phase, setPhase] = useState("select");

  // Day 선택 화면 상태
  const [days, setDays] = useState([]);
  const [loadingDays, setLoadingDays] = useState(true);
  const [daysError, setDaysError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [startError, setStartError] = useState(null);

  // 유형 선택
  const [quizType, setQuizType] = useState("SHORT");
  const [timedMode, setTimedMode] = useState(false);

  // 퀴즈 진행 상태
  const [questions, setQuestions] = useState([]);
  const [quizId, setQuizId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null); // null | { isCorrect, correctAnswer, selectedChoice? }
  const [answerLoading, setAnswerLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [answerError, setAnswerError] = useState(null);

  // 타이머
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const timerRef = useRef(null);

  const inputRef = useRef(null);
  const quizActiveRef = useRef(false);
  const submittingRef = useRef(false); // 이중 제출 방지 플래그
  const [showExitModal, setShowExitModal] = useState(false);

  const isMultiple = quizType === "MULTIPLE_EN_KO" || quizType === "MULTIPLE_KO_EN";

  // ── 타이머 제어 ────────────────────────────────────────────────────────────
  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current);
  }, []);

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    setTimeLeft(TIMER_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // 공통 제출 로직 — submittingRef로 이중 제출 완전 차단
  // useEffect보다 반드시 위에 선언해야 TDZ 오류 방지
  // selectedChoice: 객관식에서 사용자가 선택한 보기 (피드백 UI용)
  const submitCurrentAnswer = useCallback(async (answer, selectedChoice = null) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    stopTimer();
    setAnswerLoading(true);
    setAnswerError(null);
    try {
      const res = await submitAnswerApi(quizId, questions[currentIndex].wordId, answer);
      const feedbackData = selectedChoice
        ? { ...res.data.data, selectedChoice }
        : res.data.data;
      setFeedback(feedbackData);
    } catch {
      setAnswerError("답 제출에 실패했습니다. 다시 시도해주세요.");
      if (timedMode) startTimer();
    } finally {
      setAnswerLoading(false);
      submittingRef.current = false;
    }
  }, [quizId, questions, currentIndex, timedMode, stopTimer, startTimer]);

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  // 시간 초과 처리 — submitCurrentAnswer를 deps에 포함해 stale closure 방지
  useEffect(() => {
    if (!timedMode || phase !== "quiz" || feedback !== null || timeLeft !== 0) return;
    submitCurrentAnswer("");
  }, [timeLeft, timedMode, phase, feedback, submitCurrentAnswer]);

  // 새 문제 시작 시 타이머 재시작
  useEffect(() => {
    if (phase === "quiz" && timedMode && feedback === null) {
      startTimer();
    }
  }, [phase, currentIndex, feedback, timedMode, startTimer]);

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

  // 새 문제로 이동 시 입력창 자동 포커스 (SHORT, BLANK)
  useEffect(() => {
    if (phase === "quiz" && feedback === null && !isMultiple) {
      inputRef.current?.focus();
    }
  }, [phase, currentIndex, feedback, isMultiple]);

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
    submittingRef.current = false; // 이전 퀴즈 제출 플래그 초기화
    setPhase("loading");
    setStartError(null);
    try {
      let questionsRes;
      if (quizType === "MULTIPLE_EN_KO") {
        questionsRes = await fetchMultipleQuizQuestions(selectedDay, "EN_TO_KO");
      } else if (quizType === "MULTIPLE_KO_EN") {
        questionsRes = await fetchMultipleQuizQuestions(selectedDay, "KO_TO_EN");
      } else if (quizType === "BLANK") {
        questionsRes = await fetchBlankQuizQuestions(selectedDay);
      } else {
        questionsRes = await fetchQuizQuestions(selectedDay, "SHORT");
      }
      const startRes = await startQuiz(selectedDay, quizType);

      const qs = questionsRes.data.data;
      if (!qs || qs.length === 0) {
        setStartError("해당 day에 문제를 출제할 단어가 없습니다.");
        setPhase("type-select");
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
      setPhase("type-select");
    }
  };

  // SHORT / BLANK: 텍스트 입력 제출
  const handleSubmitAnswer = () => {
    if (!userAnswer.trim() || answerLoading || feedback !== null) return;
    submitCurrentAnswer(userAnswer);
  };

  // MULTIPLE: 선택지 클릭
  const handleChoiceSelect = (choice) => {
    if (feedback || answerLoading) return;
    const q = questions[currentIndex];
    const isCorrectChoice = choice === q.correctAnswer;
    // 백엔드는 항상 영어 단어로 정답 판별하므로:
    // EN_TO_KO: question 필드가 영어 → 정답이면 question 제출
    // KO_TO_EN: correctAnswer 필드가 영어 → 정답이면 correctAnswer 제출
    // 오답이면 빈 문자열 → 백엔드가 오답 처리
    const submitWord = isCorrectChoice
      ? quizType === "MULTIPLE_EN_KO"
        ? q.question
        : q.correctAnswer
      : "";
    submitCurrentAnswer(submitWord, choice);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmitAnswer();
  };

  const handleNext = () => {
    submittingRef.current = false; // 다음 문제 진입 시 제출 플래그 초기화
    setCurrentIndex((i) => i + 1);
    setUserAnswer("");
    setFeedback(null);
    setAnswerError(null);
  };

  const handleFinalSubmit = async () => {
    stopTimer();
    setSubmitLoading(true);
    setAnswerError(null);
    try {
      const res = await submitQuizApi(quizId);
      quizActiveRef.current = false;
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
            onClick={() => {
              setStartError(null);
              setPhase("type-select");
            }}
            disabled={!selectedDay || loadingDays}
            className="w-full bg-indigo-600 text-white font-semibold py-3.5 rounded-2xl hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {selectedDay ? `Day ${selectedDay} · 다음` : "Day를 선택해주세요"}
          </motion.button>
        </main>
      </div>
    );
  }

  // ── 유형 선택 화면 ─────────────────────────────────────────────────────────
  if (phase === "type-select") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <header className="flex items-center gap-3 mb-8 max-w-2xl mx-auto">
          <button
            onClick={() => setPhase("select")}
            className="text-gray-400 hover:text-indigo-600 transition-colors text-lg"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-indigo-600">퀴즈 유형 선택</h1>
          <span className="text-sm text-gray-500 ml-auto">Day {selectedDay}</span>
        </header>

        <main className="max-w-2xl mx-auto space-y-4">
          {startError && (
            <div className="bg-red-50 text-red-500 text-sm rounded-xl px-4 py-3">
              {startError}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow p-6 space-y-3">
            <h2 className="text-base font-semibold text-gray-700 mb-1">유형 선택</h2>
            {QUIZ_TYPES.map((t) => (
              <motion.button
                key={t.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setQuizType(t.id)}
                className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${
                  quizType === t.id
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-100 bg-gray-50 hover:border-indigo-200"
                }`}
              >
                <p className={`font-semibold text-sm ${quizType === t.id ? "text-indigo-700" : "text-gray-700"}`}>
                  {quizType === t.id ? "✓ " : ""}{t.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
              </motion.button>
            ))}
          </div>

          {/* 시간 제한 옵션 */}
          <div className="bg-white rounded-2xl shadow px-6 py-4">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={timedMode}
                onChange={(e) => setTimedMode(e.target.checked)}
                className="w-4 h-4 accent-indigo-600"
              />
              <div>
                <p className="font-semibold text-sm text-gray-700">시간 제한 모드</p>
                <p className="text-xs text-gray-400">문제당 {TIMER_SECONDS}초 제한 · 초과 시 자동 오답 처리</p>
              </div>
            </label>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleStartQuiz}
            className="w-full bg-indigo-600 text-white font-semibold py-3.5 rounded-2xl hover:bg-indigo-700 transition-colors"
          >
            퀴즈 시작
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
                    stopTimer();
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
          {/* 타이머 표시 */}
          {timedMode && feedback === null ? (
            <span
              className={`text-sm font-bold tabular-nums w-10 text-right ${
                timeLeft <= 5 ? "text-red-500" : "text-indigo-500"
              }`}
            >
              {timeLeft}s
            </span>
          ) : (
            <div className="w-10" />
          )}
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
            {/* 주관식 (SHORT) */}
            {quizType === "SHORT" && (
              <>
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
              </>
            )}

            {/* 객관식 영→뜻 */}
            {quizType === "MULTIPLE_EN_KO" && (
              <>
                <p className="text-xs text-indigo-400 font-medium mb-4 uppercase tracking-wide">
                  영어 단어의 뜻을 고르세요
                </p>
                <p className="text-3xl font-bold text-gray-800">{currentQuestion.question}</p>
              </>
            )}

            {/* 객관식 뜻→영 */}
            {quizType === "MULTIPLE_KO_EN" && (
              <>
                <p className="text-xs text-indigo-400 font-medium mb-4 uppercase tracking-wide">
                  한국어 뜻에 맞는 영어 단어를 고르세요
                </p>
                <p className="text-3xl font-bold text-gray-800">{currentQuestion.question}</p>
              </>
            )}

            {/* 빈칸 채우기 */}
            {quizType === "BLANK" && (
              <>
                <p className="text-xs text-indigo-400 font-medium mb-4 uppercase tracking-wide">
                  빈칸에 들어갈 영어 단어를 입력하세요
                </p>
                <p className="text-lg font-semibold text-gray-800 leading-relaxed mb-3">
                  {currentQuestion.blankSentence}
                </p>
                <p className="text-sm text-indigo-500 font-medium">
                  힌트: {currentQuestion.korean}
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* 객관식 보기 버튼 */}
        {isMultiple && (
          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.choices.map((choice, i) => {
              const isSelected = feedback?.selectedChoice === choice;
              const isCorrectChoice = choice === currentQuestion.correctAnswer;

              let btnClass =
                "w-full px-5 py-3.5 rounded-xl border-2 font-medium text-sm text-left transition-all ";
              if (feedback) {
                if (isCorrectChoice) {
                  btnClass += "border-green-400 bg-green-50 text-green-800";
                } else if (isSelected) {
                  btnClass += "border-red-400 bg-red-50 text-red-700";
                } else {
                  btnClass += "border-gray-100 bg-gray-50 text-gray-400";
                }
              } else {
                btnClass +=
                  "border-gray-200 bg-white text-gray-700 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer";
              }

              return (
                <motion.button
                  key={i}
                  animate={
                    feedback && isSelected && !feedback.isCorrect
                      ? { x: [0, -8, 8, -8, 8, 0] }
                      : feedback && isCorrectChoice
                      ? { scale: [1, 1.03, 1] }
                      : {}
                  }
                  transition={{ duration: 0.38 }}
                  whileTap={!feedback ? { scale: 0.98 } : {}}
                  onClick={() => handleChoiceSelect(choice)}
                  disabled={!!feedback || answerLoading}
                  className={btnClass}
                >
                  {choice}
                </motion.button>
              );
            })}
          </div>
        )}

        {/* 텍스트 입력창 (SHORT / BLANK) */}
        {!isMultiple && (
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
        )}

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

        {/* 오류 메시지 */}
        {answerError && (
          <p className="text-red-500 text-sm text-center">{answerError}</p>
        )}

        {/* 제출 버튼 (SHORT / BLANK, 피드백 전) */}
        {!isMultiple && !feedback && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmitAnswer}
            disabled={!userAnswer.trim() || answerLoading}
            className="w-full bg-indigo-600 text-white font-semibold py-3.5 rounded-2xl hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {answerLoading ? "채점 중..." : "제출"}
          </motion.button>
        )}

        {/* 다음 문제 / 결과 보기 버튼 (피드백 후) */}
        {feedback && (
          isLastQuestion ? (
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
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleNext}
              className="w-full bg-indigo-600 text-white font-semibold py-3.5 rounded-2xl hover:bg-indigo-700 transition-colors"
            >
              다음 문제 →
            </motion.button>
          )
        )}
      </main>
    </div>
  );
};

export default QuizPage;
