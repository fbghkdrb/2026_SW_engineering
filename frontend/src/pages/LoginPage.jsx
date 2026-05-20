import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import happyChar from "../assets/character/ending.png";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ username: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const role = await login(form.username, form.password, rememberMe);
      if (role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/main");
      }
    } catch (err) {
      const message = err.response?.data?.message || "로그인에 실패했습니다.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "#D6EEFA" }}
    >
      <button
        onClick={() => navigate("/")}
        className="absolute top-5 left-6 font-semibold text-sm"
        style={{ color: "#FF6B35" }}
      >
        ← 홈으로
      </button>
      <div className="flex w-full max-w-4xl items-center gap-12">

        {/* ===== 왼쪽: 캐릭터 + 소개 ===== */}
        <div className="hidden md:flex flex-1 flex-col items-center text-center gap-8">
          <motion.img
            src={happyChar}
            alt="WordTama 캐릭터"
            className="w-48 h-48"
            style={{ filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.15))" }}
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <p
            className="text-2xl font-extrabold leading-relaxed"
            style={{ color: "#1A3A5C" }}
          >
            WordTama와 함께<br />토익 단어를 정복하세요!
          </p>
        </div>

        {/* ===== 오른쪽: 로그인 카드 ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md md:max-w-none md:flex-1 mx-auto"
          style={{
            background: "#fff",
            borderRadius: "20px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.10)",
            padding: "48px 40px",
          }}
        >
          <h1
            className="text-center text-3xl font-extrabold mb-2"
            style={{ color: "#FF6B35" }}
          >
            WordTama
          </h1>
          <p className="text-center text-gray-400 text-sm mb-8">
            토익 단어를 재미있게 학습해요
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 아이디 */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base pointer-events-none">
                👤
              </span>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="아이디를 입력하세요"
                required
                className="w-full pl-10 pr-4 py-3 text-sm rounded-xl outline-none transition-colors"
                style={{ border: "1.5px solid #BAE0F7" }}
                onFocus={(e) => (e.target.style.borderColor = "#FF6B35")}
                onBlur={(e) => (e.target.style.borderColor = "#BAE0F7")}
              />
            </div>

            {/* 비밀번호 */}
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base pointer-events-none">
                🔒
              </span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="비밀번호를 입력하세요"
                required
                className="w-full pl-10 pr-4 py-3 text-sm rounded-xl outline-none transition-colors"
                style={{ border: "1.5px solid #BAE0F7" }}
                onFocus={(e) => (e.target.style.borderColor = "#FF6B35")}
                onBlur={(e) => (e.target.style.borderColor = "#BAE0F7")}
              />
            </div>

            {/* 자동 로그인 */}
            <div className="flex items-center gap-2">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded"
                style={{ accentColor: "#FF6B35" }}
              />
              <label htmlFor="rememberMe" className="text-sm text-gray-500">
                자동 로그인
              </label>
            </div>

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-bold text-white py-3 rounded-full text-base transition-colors"
              style={{ background: loading ? "#ffb89a" : "#FF6B35" }}
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            계정이 없으신가요?{" "}
            <Link
              to="/signup"
              className="font-semibold hover:underline"
              style={{ color: "#FF6B35" }}
            >
              회원가입
            </Link>
          </p>
        </motion.div>

      </div>
    </div>
  );
};

export default LoginPage;
