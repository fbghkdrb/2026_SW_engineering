import { createContext, useContext, useState, useCallback } from "react";
import { login as loginApi, logout as logoutApi } from "../api/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const nickname = localStorage.getItem("nickname");
    const role = localStorage.getItem("role");
    return nickname && role ? { nickname, role } : null;
  });

  const login = useCallback(async (username, password, rememberMe) => {
    const { data } = await loginApi({ username, password });
    const { accessToken, refreshToken, role, nickname } = data.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("nickname", nickname);
    localStorage.setItem("role", role);

    // 자동 로그인 체크 시에만 refreshToken을 localStorage에 저장
    if (rememberMe) {
      localStorage.setItem("refreshToken", refreshToken);
    }

    setUser({ nickname, role });
    return role;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("nickname");
      localStorage.removeItem("role");
      setUser(null);
    }
  }, []);

  const updateUserNickname = useCallback((nickname) => {
    localStorage.setItem("nickname", nickname);
    setUser((prev) => ({ ...prev, nickname }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserNickname }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
