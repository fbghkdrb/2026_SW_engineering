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
  fetchTodayPassStatus,
} from "../api/quizApi";
import { getInventory, consumeItem } from "../api/shop";
import { useAuth } from "../context/AuthContext";
import { useCharacter } from "../context/CharacterContext";
import { playCorrect, playWrong } from "../utils/sound";

const TIMER_SECONDS = 15;

const QUIZ_TYPES = [
  { id: "SHORT",          label: "주관식",       desc: "한국어 뜻을 보고 영어 단어 입력",        icon: "✏️" },
  { id: "MULTIPLE_EN_KO", label: "객관식 영→뜻", desc: "영어 단어를 보고 한국어 뜻 선택",         icon: "🔤" },
  { id: "MULTIPLE_KO_EN", label: "객관식 뜻→영", desc: "한국어 뜻을 보고 영어 단어 선택",         icon: "🔡" },
  { id: "BLANK",          label: "빈칸 채우기",   desc: "예문의 빈칸에 들어갈 영어 단어 입력",     icon: "📝" },
];

const NAV_ITEMS = [
  { label: "홈",      icon: "🏠", path: "/main" },
  { label: "단어장",  icon: "📚", path: "/words" },
  { label: "퀴즈",    icon: "✏️", path: "/quiz" },
  { label: "오답노트", icon: "📝", path: "/wrong-notes" },
  { label: "상점",    icon: "🛍️", path: "/shop" },
  { label: "통계",    icon: "📊", path: "/stats" },
];

const CircleTimer = ({ timeLeft, total }) => {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - timeLeft / total);
  const danger = timeLeft <= 5;
  return (
    <div className="relative flex items-center justify-center" style={{ width: 52, height: 52 }}>
      <svg width="52" height="52" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="26" cy="26" r={r} fill="none" stroke="#E5E7EB" strokeWidth="4" />
        <circle
          cx="26" cy="26" r={r} fill="none"
          stroke={danger ? "#EF4444" : "#FF6B35"}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }}
        />
      </svg>
      <span
        className="absolute text-sm font-bold tabular-nums"
        style={{ color: danger ? "#EF4444" : "#FF6B35" }}
      >
        {timeLeft}
      </span>
    </div>
  );
};

const QuizPage = () => {
  const navigate = useNavigate();
  useAuth();
  const { character, fetchCharacter } = useCharacter();
  const coin = character?.coin ?? 0;

  const [phase, setPhase] = useState("select");
  const [days, setDays] = useState([]);
  const [loadingDays, setLoadingDays] = useState(true);
  const [daysError, setDaysError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [startError, setStartError] = useState(null);
  const [quizType, setQuizType] = useState("SHORT");
  const [timedMode, setTimedMode] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [quizId, setQuizId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [answerLoading, setAnswerLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [answerError, setAnswerError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const quizActiveRef = useRef(false);
  const submittingRef = useRef(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isPassedToday, setIsPassedToday] = useState(false);
  const [timeExtQty, setTimeExtQty] = useState(0);
  const [extUsing, setExtUsing] = useState(false);
  const [extToast, setExtToast] = useState(null);

  // 정답/오답 오버레이 표시용
  const [showCorrectOverlay, setShowCorrectOverlay] = useState(false);
  const [showWrongOverlay, setShowWrongOverlay] = useState(false);

  const isMultiple = quizType === "MULTIPLE_EN_KO" || quizType === "MULTIPLE_KO_EN";

  const stopTimer = useCallback(() => { clearInterval(timerRef.current); }, []);

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    setTimeLeft(TIMER_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

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

      // 사운드 + 오버레이
      if (feedbackData.isCorrect) {
        playCorrect();
        setShowCorrectOverlay(true);
        setTimeout(() => setShowCorrectOverlay(false), 350);
      } else {
        playWrong();
        setShowWrongOverlay(true);
        setTimeout(() => setShowWrongOverlay(false), 450);
      }

      setFeedback(feedbackData);
    } catch {
      setAnswerError("답 제출에 실패했습니다. 다시 시도해주세요.");
      if (timedMode) startTimer();
    } finally {
      setAnswerLoading(false);
      submittingRef.current = false;
    }
  }, [quizId, questions, currentIndex, timedMode, stopTimer, startTimer]);

  useEffect(() => { return () => clearInterval(timerRef.current); }, []);
  useEffect(() => {
    if (!timedMode || phase !== "quiz" || feedback !== null || timeLeft !== 0) return;
    submitCurrentAnswer("");
  }, [timeLeft, timedMode, phase, feedback, submitCurrentAnswer]);
  useEffect(() => {
    if (phase === "quiz" && timedMode && feedback === null) startTimer();
  }, [phase, currentIndex, feedback, timedMode, startTimer]);
  useEffect(() => {
    if (phase !== "quiz") return;
    const handler = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [phase]);
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
  const loadDays = useCallback(async () => {
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
  }, []);

  useEffect(() => { loadDays(); }, [loadDays]);
  useEffect(() => {
    getInventory()
      .then((res) => {
        if (res.data.success) {
          const found = res.data.data.find((i) => i.itemType === "TIME_EXTENSION");
          setTimeExtQty(found?.quantity ?? 0);
        }
      }).catch(() => {});
  }, []);
  useEffect(() => {
    fetchTodayPassStatus()
      .then((res) => { if (res.data.success) setIsPassedToday(res.data.data.isPassedToday); })
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (phase === "quiz" && feedback === null && !isMultiple) inputRef.current?.focus();
  }, [phase, currentIndex, feedback, isMultiple]);


  const handleStartQuiz = async () => {
    submittingRef.current = false;
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

  const handleSubmitAnswer = () => {
    if (!userAnswer.trim() || answerLoading || feedback !== null) return;
    submitCurrentAnswer(userAnswer);
  };

  const handleChoiceSelect = (choice) => {
    if (feedback || answerLoading) return;
    const q = questions[currentIndex];
    const isCorrectChoice = choice === q.correctAnswer;
    const submitWord = isCorrectChoice
      ? quizType === "MULTIPLE_EN_KO" ? q.question : q.correctAnswer
      : "";
    submitCurrentAnswer(submitWord, choice);
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSubmitAnswer(); };

  const handleNext = () => {
    submittingRef.current = false;
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

  const handleTimeExtension = useCallback(async () => {
    if (extUsing || timeExtQty <= 0) return;
    if (feedback !== null || timeLeft <= 0) {
      setExtToast("타이머가 만료되어 사용할 수 없습니다");
      setTimeout(() => setExtToast(null), 2500);
      return;
    }
    setExtUsing(true);
    try {
      const res = await consumeItem("TIME_EXTENSION");
      if (res.data.success) {
        setTimeExtQty(res.data.data.quantity);
        fetchCharacter();
        if (feedback !== null) {
          setExtToast("타이머가 만료되어 사용할 수 없습니다");
          setTimeout(() => setExtToast(null), 2500);
        } else {
          setTimeLeft((prev) => prev + 10);
        }
      }
    } catch {
      setExtToast("아이템 사용에 실패했습니다.");
      setTimeout(() => setExtToast(null), 2500);
    } finally {
      setExtUsing(false);
    }
  }, [extUsing, timeExtQty, feedback, timeLeft, fetchCharacter]);

  const isLastQuestion = questions.length > 0 && currentIndex === questions.length - 1;
  const progressPct = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-wt-sky flex items-center justify-center">
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          className="text-wt-orange text-lg font-semibold"
        >
          퀴즈 준비 중...
        </motion.p>
      </div>
    );
  }

  if (phase === "select") {
    return (
      <div className="min-h-screen bg-wt-sky pb-20">
        <header className="sticky top-0 z-20 bg-white shadow-sm flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/main")} className="text-gray-500 hover:text-wt-orange transition-colors text-xl leading-none">←</button>
            <h1 className="text-lg font-bold text-gray-800">퀴즈</h1>
          </div>
          <div className="flex items-center gap-1.5 bg-wt-orange-light border border-wt-sky-dark rounded-full px-3 py-1">
            <span className="text-sm">🪙</span>
            <span className="text-sm font-bold text-wt-orange">{coin}</span>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 pt-5 pb-4 space-y-5">
          {isPassedToday && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-semibold rounded-2xl px-4 py-3 text-center">
              오늘 퀴즈 통과 완료 ✅
            </div>
          )}
          {startError && (
            <div className="bg-red-50 border border-red-200 text-red-500 text-sm rounded-2xl px-4 py-3">{startError}</div>
          )}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Day 선택</h2>
            {loadingDays ? (
              <div className="text-center text-gray-400 py-6 text-sm">불러오는 중...</div>
            ) : daysError ? (
              <div className="text-center space-y-3 py-4">
                <p className="text-red-500 text-sm">{daysError}</p>
                <button onClick={loadDays} className="text-sm text-wt-orange underline">다시 시도</button>
              </div>
            ) : days.length === 0 ? (
              <div className="text-center text-gray-400 py-6 text-sm">등록된 단어가 없습니다.</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {days.map((d) => {
                  const isCompleted = d.progress >= 100;
                  const isSelected = selectedDay === d.day;
                  return (
                    <motion.button
                      key={d.day}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDay(d.day)}
                      className={`rounded-full px-4 py-1.5 text-sm font-bold transition-all border ${
                        isSelected
                          ? "bg-wt-orange text-white border-wt-orange shadow-md"
                          : isCompleted
                          ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-wt-orange hover:text-wt-orange"
                      }`}
                    >
                      {isCompleted && !isSelected ? "✓ " : ""}Day {d.day}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide px-1">유형 선택</h2>
            {QUIZ_TYPES.map((t) => {
              const isSelected = quizType === t.id;
              return (
                <motion.button
                  key={t.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setQuizType(t.id)}
                  className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all ${
                    isSelected ? "border-wt-orange bg-wt-orange-light" : "border-gray-100 bg-white hover:border-wt-orange"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{t.icon}</span>
                    <div>
                      <p className={`font-bold text-sm ${isSelected ? "text-wt-orange" : "text-gray-800"}`}>{t.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
                    </div>
                    {isSelected && <span className="ml-auto text-wt-orange font-bold text-lg">✓</span>}
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div
            className={`bg-white rounded-2xl border-2 transition-all px-5 py-4 cursor-pointer ${timedMode ? "border-wt-orange" : "border-gray-100"}`}
            onClick={() => setTimedMode((v) => !v)}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">⏱️</span>
              <div className="flex-1">
                <p className={`font-bold text-sm ${timedMode ? "text-wt-orange" : "text-gray-800"}`}>시간 제한 모드</p>
                <p className="text-xs text-gray-400 mt-0.5">문제당 {TIMER_SECONDS}초 제한 · 초과 시 자동 오답 처리</p>
              </div>
              <div className={`relative w-11 h-6 rounded-full transition-colors ${timedMode ? "bg-wt-orange" : "bg-gray-200"}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${timedMode ? "translate-x-5" : "translate-x-1"}`} />
              </div>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleStartQuiz}
            disabled={!selectedDay || loadingDays}
            className="w-full bg-wt-orange text-white font-bold py-4 rounded-full text-base hover:bg-[#ed5d28] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
          >
            {selectedDay ? `Day ${selectedDay} · ${QUIZ_TYPES.find((t) => t.id === quizType)?.label} 시작 →` : "Day를 선택해주세요"}
          </motion.button>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-20">
          <div className="max-w-2xl mx-auto flex">
            {NAV_ITEMS.map(({ label, icon, path }) => {
              const isActive = path === "/quiz";
              return (
                <button key={path} onClick={() => navigate(path)}
                  className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors ${isActive ? "text-wt-orange" : "text-gray-400 hover:text-wt-orange"}`}
                >
                  <span className="text-lg leading-none">{icon}</span>
                  <span className={`text-[10px] font-semibold ${isActive ? "text-wt-orange" : ""}`}>{label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-wt-sky">
      {/* 정답 오버레이: 옅은 초록 펄스 */}
      <AnimatePresence>
        {showCorrectOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-green-400 pointer-events-none z-40"
          />
        )}
      </AnimatePresence>

      {/* 오답 오버레이: 옅은 빨간 */}
      <AnimatePresence>
        {showWrongOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 bg-red-400 pointer-events-none z-40"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExitModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center"
            >
              <p className="text-lg font-bold text-gray-800 mb-2">퀴즈를 종료하시겠습니까?</p>
              <p className="text-sm text-gray-500 mb-6">진행 중인 퀴즈 결과는 저장되지 않습니다.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowExitModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-wt-orange text-wt-orange font-semibold text-sm hover:bg-wt-orange-light transition-colors">
                  계속 풀기
                </button>
                <button onClick={() => { stopTimer(); quizActiveRef.current = false; setShowExitModal(false); navigate("/main"); }}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 transition-colors">
                  나가기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-5 py-3">
          <button onClick={() => setShowExitModal(true)} aria-label="퀴즈 종료"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 transition-colors text-lg font-bold">
            ✕
          </button>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-800">
              {currentIndex + 1}<span className="text-gray-400 font-normal"> / {questions.length}</span>
            </p>
            <p className="text-xs text-gray-400">{QUIZ_TYPES.find((t) => t.id === quizType)?.label}</p>
          </div>
          {timedMode && feedback === null ? (
            <div className="flex flex-col items-center gap-1">
              <CircleTimer timeLeft={timeLeft} total={TIMER_SECONDS} />
              {timeExtQty > 0 && (
                <button onClick={handleTimeExtension} disabled={extUsing}
                  className="text-[10px] bg-orange-100 hover:bg-orange-200 text-orange-600 font-semibold px-2 py-0.5 rounded-full transition-colors disabled:opacity-50">
                  +10s ({timeExtQty})
                </button>
              )}
            </div>
          ) : <div className="w-9" />}
        </div>
        <div className="h-2.5 bg-gray-100">
          <motion.div className="h-full bg-wt-orange" initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ duration: 0.35, ease: "easeOut" }} />
        </div>
      </div>

      <main className="px-4 py-5 pb-8 max-w-2xl mx-auto w-full space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="bg-white shadow-sm text-center px-10 py-14"
            style={{ borderRadius: "16px" }}
          >
            {quizType === "SHORT" && (
              <>
                <p className="text-xs text-wt-orange font-bold uppercase tracking-widest mb-5">한국어 뜻 → 영어 단어</p>
                <p className="text-3xl font-bold text-gray-800 mb-4">{currentQuestion.korean}</p>
                {currentQuestion.exampleKr && <p className="text-sm text-gray-400 italic leading-relaxed">{currentQuestion.exampleKr}</p>}
              </>
            )}
            {quizType === "MULTIPLE_EN_KO" && (
              <>
                <p className="text-xs text-wt-orange font-bold uppercase tracking-widest mb-5">영어 단어 → 한국어 뜻</p>
                <p className="text-4xl font-bold text-gray-800">{currentQuestion.question}</p>
              </>
            )}
            {quizType === "MULTIPLE_KO_EN" && (
              <>
                <p className="text-xs text-wt-orange font-bold uppercase tracking-widest mb-5">한국어 뜻 → 영어 단어</p>
                <p className="text-3xl font-bold text-gray-800">{currentQuestion.question}</p>
              </>
            )}
            {quizType === "BLANK" && (
              <>
                <p className="text-xs text-wt-orange font-bold uppercase tracking-widest mb-5">빈칸 채우기</p>
                <p className="text-xl font-semibold text-gray-800 leading-relaxed mb-4">{currentQuestion.blankSentence}</p>
                <div className="inline-block bg-wt-orange-light border border-wt-sky-dark rounded-xl px-4 py-1.5">
                  <p className="text-sm font-semibold text-wt-orange">힌트: {currentQuestion.korean}</p>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {isMultiple && (
          <div className="space-y-2.5">
            {currentQuestion.choices.map((choice, i) => {
              const isSelected = feedback?.selectedChoice === choice;
              const isCorrectChoice = choice === currentQuestion.correctAnswer;
              let cls = "w-full px-5 py-4 text-left font-semibold text-sm transition-all border-2 ";
              if (feedback) {
                if (isCorrectChoice) cls += "border-green-400 bg-green-50 text-green-800 rounded-2xl";
                else if (isSelected) cls += "border-red-400 bg-red-50 text-red-700 rounded-2xl";
                else cls += "border-gray-100 bg-white text-gray-400 rounded-2xl";
              } else {
                cls += "border-gray-200 bg-white text-gray-700 hover:border-wt-orange hover:bg-wt-orange-light rounded-2xl cursor-pointer";
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
                  className={cls}
                >
                  <span className="text-gray-400 mr-3 font-normal">{String.fromCharCode(65 + i)}.</span>
                  {choice}
                </motion.button>
              );
            })}
          </div>
        )}

        {!isMultiple && (
          <motion.div
            animate={feedback && !feedback.isCorrect ? { x: [0, -8, 8, -8, 8, 0] } : {}}
            transition={{ duration: 0.38 }}
          >
            <input
              ref={inputRef} type="text" value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!!feedback || answerLoading}
              placeholder="영어 단어를 입력하세요"
              className={`w-full px-6 py-5 border-2 text-center text-xl font-semibold outline-none transition-all ${
                feedback
                  ? feedback.isCorrect ? "border-green-400 bg-green-50 text-green-800" : "border-red-400 bg-red-50 text-red-700"
                  : "border-gray-200 bg-white text-gray-800 focus:border-wt-orange"
              } disabled:cursor-default`}
              style={{ borderRadius: "16px" }}
            />
          </motion.div>
        )}

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`rounded-2xl px-6 py-4 text-base font-bold text-center ${
                feedback.isCorrect
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-600 border border-red-200"
              }`}
            >
              {feedback.isCorrect ? (
                <span>✓ 정답!</span>
              ) : (
                <span>✗ 오답&nbsp;·&nbsp;정답: <span className="font-extrabold">{feedback.correctAnswer}</span></span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {answerError && <p className="text-red-500 text-sm text-center">{answerError}</p>}

        {!isMultiple && !feedback && (
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmitAnswer}
            disabled={!userAnswer.trim() || answerLoading}
            className="w-full bg-wt-orange text-white font-bold py-4 rounded-full text-base hover:bg-[#ed5d28] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md">
            {answerLoading ? "채점 중..." : "제출하기"}
          </motion.button>
        )}

        {feedback && (
          isLastQuestion ? (
            <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} whileTap={{ scale: 0.97 }}
              onClick={handleFinalSubmit} disabled={submitLoading}
              className="w-full bg-wt-orange text-white font-bold py-4 rounded-full text-base hover:bg-[#ed5d28] transition-colors disabled:opacity-50 shadow-md">
              {submitLoading ? "저장 중..." : "결과 보기 →"}
            </motion.button>
          ) : (
            <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} whileTap={{ scale: 0.97 }}
              onClick={handleNext}
              className="w-full bg-wt-orange text-white font-bold py-4 rounded-full text-base hover:bg-[#ed5d28] transition-colors shadow-md">
              다음 문제 →
            </motion.button>
          )
        )}
      </main>

      {extToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-lg text-sm font-semibold bg-gray-800 text-white z-50">
          {extToast}
        </div>
      )}
    </div>
  );
};

export default QuizPage;