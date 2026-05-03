import { motion } from "framer-motion";

const ProgressBar = ({ completed, total }) => {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl p-5 shadow">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700">전체 학습 진도</h2>
        <span className="text-sm font-bold text-indigo-600">
          {completed} / {total} Days 완료 ({pct}%)
        </span>
      </div>
      <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
