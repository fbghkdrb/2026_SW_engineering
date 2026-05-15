import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminUsers, patchUserRole } from "../api/admin";

const AdminUserPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [toast, setToast] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await getAdminUsers();
      setUsers(res.data.data ?? []);
    } catch {
      showToast("유저 목록을 불러오지 못했습니다.", "error");
    }
  }, [showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleRole = async (userId) => {
    setLoadingId(userId);
    try {
      await patchUserRole(userId);
      showToast("권한이 변경되었습니다.");
      await fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message ?? "권한 변경에 실패했습니다.";
      showToast(msg, "error");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">유저 관리 (관리자)</h1>
          <button
            onClick={() => navigate("/admin")}
            className="text-sm text-gray-500 hover:text-gray-700 transition"
          >
            ← 관리자 메인
          </button>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left w-16">ID</th>
                <th className="px-4 py-3 text-left">아이디</th>
                <th className="px-4 py-3 text-left">닉네임</th>
                <th className="px-4 py-3 text-left w-24">권한</th>
                <th className="px-4 py-3 text-center w-28">권한 변경</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    유저가 없습니다.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{u.id}</td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{u.username}</td>
                    <td className="px-4 py-3 text-gray-700">{u.nickname}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          u.role === "ADMIN"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleRole(u.id)}
                        disabled={loadingId === u.id}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition disabled:opacity-50 ${
                          u.role === "ADMIN"
                            ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            : "bg-purple-600 text-white hover:bg-purple-700"
                        }`}
                      >
                        {loadingId === u.id
                          ? "변경 중..."
                          : u.role === "ADMIN"
                          ? "→ USER"
                          : "→ ADMIN"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-5 py-3 rounded-xl shadow-lg text-white text-sm transition-all ${
            toast.type === "error" ? "bg-red-500" : "bg-green-500"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default AdminUserPage;
