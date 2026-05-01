import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const HomePage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <header className="flex items-center justify-between mb-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-indigo-600">WordTama</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {user?.nickname}님
          </span>
          <button
            onClick={() => navigate("/mypage")}
            className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
          >
            설정
          </button>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-500 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow p-8 text-center"
        >
          <p className="text-4xl mb-4">🐣</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            안녕하세요, {user?.nickname}님!
          </h2>
          <p className="text-gray-500 text-sm">오늘도 단어 학습을 시작해볼까요?</p>
        </motion.div>
      </main>
    </div>
  );
};

export default HomePage;
