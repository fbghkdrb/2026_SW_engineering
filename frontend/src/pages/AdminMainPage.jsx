import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

const AdminMainPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-wt-sky flex flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-bold text-gray-800">관리자 페이지</h1>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={() => navigate("/admin/words")}
          className="w-full py-4 bg-wt-orange text-white rounded-xl text-lg font-semibold hover:bg-[#ed5d28] transition shadow"
        >
          단어 관리
        </button>
        <button
          onClick={() => navigate("/admin/users")}
          className="w-full py-4 bg-wt-orange text-white rounded-xl text-lg font-semibold hover:bg-[#ed5d28] transition shadow"
        >
          유저 관리
        </button>
      </div>
      <button
        onClick={() => navigate("/main")}
        className="text-sm text-gray-500 hover:text-gray-700 transition mt-2"
      >
        ← 메인으로
      </button>
    </div>
  );
};

export default AdminMainPage;
