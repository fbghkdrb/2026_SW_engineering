import { useEffect } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCharacter } from "../context/CharacterContext";

const QuizResultPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { fetchCharacter } = useCharacter();

  useEffect(() => {
    fetchCharacter();
  }, [fetchCharacter]);

  // state 없이 직접 접근한 경우 퀴즈 페이지로 리다이렉트
  if (!state) {
    return <Navigate to="/quiz" replace />;
  }

  const { totalCount, correctCount, wrongWords } = state;
  const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  const emoji = score === 100 ? "🎉" : score >= 70 ? "👍" : "💪";
  const message =
    score === 100
      ? "완벽해요! 모두 맞혔습니다."
      : score >= 70
      ? "잘했어요! 조금만 더 노력해봐요."
      : "다시 풀어서 복습해봐요!";
  const barColor =
    score === 100 ? "bg-green-400" : score >= 70 ? "bg-indigo-500" : "bg-orange-400";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <main className="max-w-2xl mx-auto space-y-5">
        {/* 점수 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow p-8 text-center"
        >
          <p className="text-4xl mb-3">{emoji}</p>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">퀴즈 완료!</h1>
          <p className="text-sm text-gray-500 mb-7">{message}</p>

          {/* 정답 수 / 전체 수 */}
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-indigo-600">{correctCount}</p>
              <p className="text-xs text-gray-400 mt-1">정답</p>
            </div>
            <div className="text-gray-300 text-2xl font-light">/</div>
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-700">{totalCount}</p>
              <p className="text-xs text-gray-400 mt-1">전체</p>
            </div>
          </div>

          {/* 점수 바 */}
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className={`h-full rounded-full ${barColor}`}
            />
          </div>
          <p className="text-sm text-gray-400">{score}점</p>
        </motion.div>

        {/* 오답 목록 */}
        {wrongWords && wrongWords.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-white rounded-2xl shadow p-6"
          >
            <h2 className="text-base font-bold text-gray-700 mb-4">
              틀린 단어 ({wrongWords.length}개)
            </h2>
            <div className="space-y-2">
              {wrongWords.map((w) => (
                <div
                  key={w.wordId}
                  className="flex items-center justify-between px-4 py-3 bg-red-50 rounded-xl"
                >
                  <span className="font-semibold text-gray-800">{w.english}</span>
                  <span className="text-sm text-gray-500">{w.korean}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 버튼 영역 */}
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/quiz")}
            className="flex-1 bg-indigo-600 text-white font-semibold py-3.5 rounded-2xl hover:bg-indigo-700 transition-colors"
          >
            다시 풀기
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/words")}
            className="flex-1 bg-white text-indigo-600 font-semibold py-3.5 rounded-2xl border border-indigo-200 hover:bg-indigo-50 transition-colors"
          >
            단어장으로
          </motion.button>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/wrong-notes")}
          className="w-full bg-red-50 text-red-500 font-semibold py-3.5 rounded-2xl border border-red-200 hover:bg-red-100 transition-colors"
        >
          오답노트 보기 📝
        </motion.button>
      </main>
    </div>
  );
};

export default QuizResultPage;
