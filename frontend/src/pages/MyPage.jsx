import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { updateNickname, deleteAccount } from "../api/user";

const MyPage = () => {
  const navigate = useNavigate();
  const { user, logout, updateUserNickname } = useAuth();

  const [nickname, setNickname] = useState(user?.nickname || "");
  const [nicknameError, setNicknameError] = useState("");
  const [nicknameSuccess, setNicknameSuccess] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNicknameUpdate = async (e) => {
    e.preventDefault();
    if (nickname.length < 2 || nickname.length > 10) {
      setNicknameError("닉네임은 2~10자여야 합니다.");
      return;
    }

    setLoading(true);
    setNicknameError("");
    setNicknameSuccess("");

    try {
      await updateNickname(nickname);
      updateUserNickname(nickname);
      setNicknameSuccess("닉네임이 수정되었습니다.");
    } catch (err) {
      setNicknameError(err.response?.data?.message || "수정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await deleteAccount();
      await logout();
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "탈퇴에 실패했습니다.");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => navigate("/")}
          className="text-sm text-indigo-600 hover:underline mb-6 inline-block"
        >
          ← 홈으로
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow p-6 mb-4"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6">계정 설정</h2>

          {/* 닉네임 수정 */}
          <form onSubmit={handleNicknameUpdate} className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              닉네임 수정
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setNicknameError("");
                  setNicknameSuccess("");
                }}
                placeholder="2~10자"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-medium rounded-lg transition-colors"
              >
                저장
              </button>
            </div>
            {nicknameError && (
              <p className="text-xs text-red-500">{nicknameError}</p>
            )}
            {nicknameSuccess && (
              <p className="text-xs text-green-500">{nicknameSuccess}</p>
            )}
          </form>
        </motion.div>

        {/* 회원 탈퇴 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-2xl shadow p-6"
        >
          <h3 className="text-sm font-semibold text-gray-700 mb-3">위험 구역</h3>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-sm text-red-500 hover:text-red-700 underline"
          >
            회원 탈퇴
          </button>
        </motion.div>
      </div>

      {/* 탈퇴 확인 다이얼로그 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              정말 탈퇴하시겠어요?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              탈퇴 후 모든 데이터가 영구 삭제되며 복구할 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {loading ? "처리 중..." : "탈퇴하기"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MyPage;
