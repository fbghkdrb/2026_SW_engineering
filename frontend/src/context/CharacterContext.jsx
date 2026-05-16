import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { getCharacter } from "../api/characterApi";

const CharacterContext = createContext(null);

export const CharacterProvider = ({ children }) => {
  const { user } = useAuth();
  const [character, setCharacter] = useState(null);
  const [streak, setStreak] = useState(0);

  const fetchCharacter = useCallback(async () => {
    try {
      const { data } = await getCharacter();
      if (data.success) {
        setCharacter(data.data);
      }
    } catch {
      // 인증 실패 등의 경우 무시
    }
  }, []);

  // 로그인 상태 변경 시 자동 fetch
  useEffect(() => {
    if (user) {
      fetchCharacter();
    } else {
      setCharacter(null);
      setStreak(0);
    }
  }, [user, fetchCharacter]);

  const updateCharacter = useCallback((newCharacter) => {
    setCharacter(newCharacter);
  }, []);

  // [PBI-11 추가] 구매/사용 후 서버 응답의 코인값으로 로컬 상태만 즉시 갱신
  const updateCoin = useCallback((newCoin) => {
    setCharacter((prev) => (prev ? { ...prev, coin: newCoin } : prev));
  }, []);

  return (
    <CharacterContext.Provider value={{ character, fetchCharacter, updateCharacter, updateCoin, streak, setStreak }}>
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (!context) throw new Error("useCharacter must be used within CharacterProvider");
  return context;
};
