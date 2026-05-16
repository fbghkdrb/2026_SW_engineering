import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCharacter } from "../context/CharacterContext";
import { getInventory, consumeItem } from "../api/shop";

const STATUS_FILTER = {
  HAPPY: "brightness(1.1) saturate(1.3)",
  NORMAL: "none",
  SAD: "saturate(0.4) brightness(0.9)",
  DANGER: "sepia(0.5) hue-rotate(-20deg) saturate(1.5)",
  FAINT: "grayscale(1) opacity(0.5)",
};

const Eye = ({ faint }) => {
  if (faint) {
    return (
      <div className="relative w-4 h-4 flex items-center justify-center">
        <div className="absolute w-5 h-0.5 bg-gray-800 rotate-45" />
        <div className="absolute w-5 h-0.5 bg-gray-800 -rotate-45" />
      </div>
    );
  }
  return <div className="w-3 h-3 bg-gray-800 rounded-full" />;
};

const Mouth = ({ status }) => {
  if (status === "HAPPY") {
    return <div className="w-10 h-5 border-b-4 border-gray-800 rounded-b-full mt-1" />;
  }
  if (status === "SAD" || status === "DANGER") {
    return <div className="w-10 h-5 border-t-4 border-gray-800 rounded-t-full mt-3" />;
  }
  return <div className="w-8 h-0.5 bg-gray-800 mt-2" />;
};

const CharacterDisplay = ({ status = "NORMAL" }) => {
  const isFaint = status === "FAINT";
  const isHappy = status === "HAPPY";

  const { character, fetchCharacter } = useCharacter();
  const vitality = character?.vitality ?? 0;
  const isMaxVitality = vitality >= 100;

  const [feedQty, setFeedQty] = useState(0);
  const [using, setUsing] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  useEffect(() => {
    getInventory()
      .then(({ data }) => {
        const feedItem = data.data.find((i) => i.itemType === "FEED");
        setFeedQty(feedItem?.quantity ?? 0);
      })
      .catch(() => {});
  }, []);

  const handleUseFeed = async () => {
    if (using) return;
    setUsing(true);
    try {
      const { data } = await consumeItem("FEED");
      if (data.success) {
        setFeedQty(data.data.quantity);
        await fetchCharacter();
        showToast("먹이 사용! 활력도 +30", "success");
      }
    } catch (err) {
      const msg = err.response?.data?.message ?? "사용에 실패했습니다.";
      showToast(msg, "error");
    } finally {
      setUsing(false);
    }
  };

  const canUse = !isMaxVitality && feedQty > 0 && !using;

  return (
    <div className="character-wrapper select-none flex flex-col items-center gap-4">
      {/* 캐릭터 아트 */}
      <div style={{ filter: STATUS_FILTER[status] ?? "none" }}>
        <div className="flex flex-col items-center">
          {/* 머리 */}
          <div className="relative w-32 h-32 bg-yellow-300 rounded-full flex flex-col items-center justify-center shadow-xl">
            {isHappy && (
              <>
                <div className="absolute left-3 bottom-8 w-8 h-5 bg-pink-300 rounded-full opacity-70" />
                <div className="absolute right-3 bottom-8 w-8 h-5 bg-pink-300 rounded-full opacity-70" />
              </>
            )}
            <div className="flex gap-6 mb-1">
              <Eye faint={isFaint} />
              <Eye faint={isFaint} />
            </div>
            <Mouth status={status} />
          </div>

          {/* 몸통 */}
          <div className="w-24 h-16 bg-yellow-300 rounded-2xl -mt-3 shadow-lg" />

          {/* 발 */}
          <div className="flex gap-5 -mt-2">
            <div className="w-9 h-5 bg-yellow-400 rounded-full" />
            <div className="w-9 h-5 bg-yellow-400 rounded-full" />
          </div>
        </div>
      </div>

      {/* 먹이 사용 버튼 */}
      <div className="relative group">
        <motion.button
          whileTap={canUse ? { scale: 0.95 } : {}}
          onClick={handleUseFeed}
          disabled={!canUse}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            canUse
              ? "bg-orange-100 text-orange-600 hover:bg-orange-200"
              : "bg-gray-100 text-gray-300 cursor-not-allowed"
          }`}
        >
          <span>🍖</span>
          <span>{using ? "사용 중..." : "먹이 사용"}</span>
          <span className="text-xs opacity-60">x{feedQty}</span>
        </motion.button>

        {/* vitality 최대 툴팁 */}
        {isMaxVitality && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            활력도가 최대입니다
          </div>
        )}
      </div>

      {/* 토스트 */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-lg text-sm font-semibold z-50 ${
              toast.type === "success" ? "bg-gray-800 text-white" : "bg-red-500 text-white"
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CharacterDisplay;
