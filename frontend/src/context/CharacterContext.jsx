import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { getCharacter } from "../api/characterApi";

const CharacterContext = createContext(null);

export const CharacterProvider = ({ children }) => {
  const { user } = useAuth();
  const [character, setCharacter] = useState(null);

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
    }
  }, [user, fetchCharacter]);

  const updateCharacter = useCallback((newCharacter) => {
    setCharacter(newCharacter);
  }, []);

  return (
    <CharacterContext.Provider value={{ character, fetchCharacter, updateCharacter }}>
      {children}
    </CharacterContext.Provider>
  );
};

export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (!context) throw new Error("useCharacter must be used within CharacterProvider");
  return context;
};
