import { useState } from "react";
import { motion } from "framer-motion";
import { toggleKnown, toggleFavorite } from "../api/wordApi";

const ttsSupported = typeof window !== "undefined" && "speechSynthesis" in window;

/**
 * @param {{ word: import('../api/wordApi').WordWithStatus, onStatusChange: (id: number, patch: object) => void }} props
 */
const WordCard = ({ word, onStatusChange }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isKnown, setIsKnown] = useState(word.isKnown);
  const [isFavorite, setIsFavorite] = useState(word.isFavorite);
  const [loadingKnown, setLoadingKnown] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  const handleSpeak = (e) => {
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(word.english);
    utterance.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleKnown = async (e, target) => {
    e.stopPropagation();
    if (loadingKnown || isKnown === target) return;
    setLoadingKnown(true);
    try {
      const res = await toggleKnown(word.id);
      const next = res.data.data.isKnown;
      setIsKnown(next);
      onStatusChange?.(word.id, { isKnown: next });
    } finally {
      setLoadingKnown(false);
    }
  };

  const handleFavorite = async (e) => {
    e.stopPropagation();
    if (loadingFavorite) return;
    setLoadingFavorite(true);
    try {
      const res = await toggleFavorite(word.id);
      const next = res.data.data.isFavorite;
      setIsFavorite(next);
      onStatusChange?.(word.id, { isFavorite: next });
    } finally {
      setLoadingFavorite(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 카드 플립 영역 */}
      <div
        className="cursor-pointer select-none"
        style={{ perspective: "1000px" }}
        onClick={() => setIsFlipped((f) => !f)}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          style={{ transformStyle: "preserve-3d", position: "relative", height: "180px" }}
        >
          {/* 앞면: 영어 단어 + 발음 버튼 */}
          <div
            style={{ backfaceVisibility: "hidden" }}
            className="absolute inset-0 bg-white rounded-2xl shadow-md flex flex-col items-center justify-center gap-3 px-6"
          >
            <p className="text-2xl font-bold text-indigo-700">{word.english}</p>
            <button
              onClick={handleSpeak}
              disabled={!ttsSupported}
              title={ttsSupported ? "발음 듣기" : "이 브라우저는 TTS를 지원하지 않습니다"}
              className={`text-xl transition-opacity ${
                ttsSupported
                  ? "opacity-80 hover:opacity-100 active:scale-95"
                  : "opacity-30 cursor-not-allowed"
              }`}
            >
              🔊
            </button>
            <p className="text-xs text-gray-400 mt-1">클릭해서 뜻 보기</p>
          </div>

          {/* 뒷면: 한국어 뜻 + 예문 */}
          <div
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
            className="absolute inset-0 bg-indigo-50 rounded-2xl shadow-md flex flex-col items-center justify-center gap-2 px-6 text-center overflow-hidden"
          >
            <p className="text-xl font-bold text-indigo-800">{word.korean}</p>
            {word.example && (
              <p className="text-sm text-gray-600 italic leading-snug">{word.example}</p>
            )}
            {word.exampleKr && (
              <p className="text-xs text-gray-400 leading-snug">{word.exampleKr}</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* 알겠다 / 즐겨찾기 버튼 */}
      <div className="flex gap-2">
        <button
          onClick={(e) => handleKnown(e, true)}
          disabled={loadingKnown}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
            isKnown
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-600"
          } disabled:opacity-50`}
        >
          알겠다 ✅
        </button>
        <button
          onClick={(e) => handleKnown(e, false)}
          disabled={loadingKnown}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
            !isKnown
              ? "bg-red-50 text-red-500 hover:bg-red-100"
              : "bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-400"
          } disabled:opacity-50`}
        >
          모르겠다 ❌
        </button>
        <button
          onClick={handleFavorite}
          disabled={loadingFavorite}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            isFavorite
              ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          } disabled:opacity-50`}
        >
          {isFavorite ? "⭐" : "☆"}
        </button>
      </div>
    </div>
  );
};

export default WordCard;
