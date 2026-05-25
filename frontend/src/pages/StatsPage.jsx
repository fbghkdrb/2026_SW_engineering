import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getQuizAccuracy, getWeeklyStats } from "../api/statsApi";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";

const StatsPage = () => {
  const navigate = useNavigate();
  const [quizAccuracy, setQuizAccuracy] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [accuracyRes, weeklyRes] = await Promise.all([getQuizAccuracy(), getWeeklyStats()]);
      if (accuracyRes.data.success) setQuizAccuracy(accuracyRes.data.data);
      if (weeklyRes.data.success) setWeeklyStats(weeklyRes.data.data);
    } catch {
      setError("통계를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const isEmpty = !loading && !error && quizAccuracy.length === 0 && weeklyStats.length === 0;

  return (
    <div className="min-h-screen bg-wt-sky p-6">
      <div className="max-w-lg mx-auto">
        <button onClick={() => navigate("/main")} className="text-sm text-wt-orange hover:underline mb-6 inline-block">← 홈으로</button>

        {loading ? (
          <LoadingSpinner message="통계 불러오는 중..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={load} />
        ) : isEmpty ? (
          <EmptyState icon="📊" message="아직 학습 기록이 없어요" subMessage="퀴즈를 풀면 통계가 쌓여요" />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-2xl shadow p-6 mb-4"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-6">학습 통계</h2>

            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">최근 7일 퀴즈 응시 횟수</h3>
              {weeklyStats.length > 0 ? (
                <div className="flex items-end gap-1.5 h-28">
                  {(() => {
                    const maxCount = Math.max(...weeklyStats.map((s) => s.count), 1);
                    return weeklyStats.map((stat) => (
                      <div key={stat.date} className="flex flex-col items-center flex-1 gap-1">
                        <span className="text-xs text-gray-500 font-medium">{stat.count > 0 ? stat.count : ""}</span>
                        <div className="w-full bg-gray-100 rounded-t-md overflow-hidden flex flex-col justify-end" style={{ height: "80px" }}>
                          <div className="w-full bg-wt-orange rounded-t-md transition-all duration-500"
                            style={{ height: `${(stat.count / maxCount) * 100}%` }} />
                        </div>
                        <span className="text-xs text-gray-400">{stat.date.slice(5)}</span>
                      </div>
                    ));
                  })()}
                </div>
              ) : (
                <p className="text-sm text-gray-400">데이터가 없습니다.</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">최근 퀴즈 정답률 (최대 10개)</h3>
              {quizAccuracy.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="text-xs text-gray-400 border-b border-gray-100">
                        <th className="pb-2 pr-4 font-medium">Day</th>
                        <th className="pb-2 pr-4 font-medium">맞춘 수 / 전체</th>
                        <th className="pb-2 font-medium">정답률</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quizAccuracy.map((q) => (
                        <tr key={q.quizId} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-2 pr-4 text-gray-700 font-medium">Day {q.day}</td>
                          <td className="py-2 pr-4 text-gray-600">{q.correctCount ?? 0} / {q.totalCount ?? 0}</td>
                          <td className="py-2">
                            <span className={`font-semibold ${q.accuracy >= 80 ? "text-green-600" : q.accuracy >= 50 ? "text-yellow-600" : "text-red-500"}`}>
                              {q.accuracy.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-400">완료된 퀴즈가 없습니다.</p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StatsPage;