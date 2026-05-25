import { motion } from "framer-motion";

const EmptyState = ({ icon, message, subMessage }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-20 gap-3 text-center"
    >
      <span className="text-5xl">{icon}</span>
      <p className="text-gray-600 font-semibold text-base">{message}</p>
      {subMessage && (
        <p className="text-gray-400 text-sm">{subMessage}</p>
      )}
    </motion.div>
  );
};

export default EmptyState;