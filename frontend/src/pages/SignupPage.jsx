import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { signup } from "../api/auth";
import { checkUsername } from "../api/user";

const SignupPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    nickname: "",
  });
  const [errors, setErrors] = useState({});
  const [usernameStatus, setUsernameStatus] = useState(null); // null | 'available' | 'taken'
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!/^[a-zA-Z0-9]{4,20}$/.test(form.username)) {
      newErrors.username = "아이디는 영문, 숫자 4~20자여야 합니다.";
    }
    if (form.password.length < 8) {
      newErrors.password = "비밀번호는 8자 이상이어야 합니다.";
    }
    if (form.nickname.length < 2 || form.nickname.length > 10) {
      newErrors.nickname = "닉네임은 2~10자여야 합니다.";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
    if (name === "username") setUsernameStatus(null);
  };

  const handleCheckUsername = async () => {
    if (!/^[a-zA-Z0-9]{4,20}$/.test(form.username)) {
      setErrors({ ...errors, username: "아이디는 영문, 숫자 4~20자여야 합니다." });
      return;
    }
    try {
      const { data } = await checkUsername(form.username);
      setUsernameStatus(data.data.available ? "available" : "taken");
    } catch {
      setUsernameStatus(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (usernameStatus !== "available") {
      setErrors({ ...errors, username: "아이디 중복 확인을 해주세요." });
      return;
    }

    setLoading(true);
    try {
      await signup(form);
      navigate("/login");
    } catch (err) {
      const message = err.response?.data?.message || "회원가입에 실패했습니다.";
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-center text-indigo-600 mb-6">
          회원가입
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 아이디 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              아이디
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="영문+숫자 4~20자"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="button"
                onClick={handleCheckUsername}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-sm rounded-lg text-gray-700 whitespace-nowrap transition-colors"
              >
                중복 확인
              </button>
            </div>
            {errors.username && (
              <p className="text-xs text-red-500 mt-1">{errors.username}</p>
            )}
            {usernameStatus === "available" && (
              <p className="text-xs text-green-500 mt-1">사용 가능한 아이디입니다.</p>
            )}
            {usernameStatus === "taken" && (
              <p className="text-xs text-red-500 mt-1">이미 사용 중인 아이디입니다.</p>
            )}
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="8자 이상"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          {/* 닉네임 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              닉네임
            </label>
            <input
              type="text"
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              placeholder="2~10자"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {errors.nickname && (
              <p className="text-xs text-red-500 mt-1">{errors.nickname}</p>
            )}
          </div>

          {errors.general && (
            <p className="text-sm text-red-500 text-center">{errors.general}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {loading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          이미 계정이 있으신가요?{" "}
          <Link to="/login" className="text-indigo-600 font-medium hover:underline">
            로그인
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignupPage;
