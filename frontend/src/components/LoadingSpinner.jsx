import { motion } from "framer-motion";

const LoadingSpinner = ({ message = "로딩 중..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-10 h-10 border-4 border-gray-200 border-t-wt-orange rounded-full"
      />
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
};

export default LoadingSpinner;