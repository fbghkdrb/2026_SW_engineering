import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCharacter } from "../context/CharacterContext";
import { getInventory, consumeItem } from "../api/shop";
import { CHARACTER_IMAGES, EAT_FRAMES, REVIVE_FRAMES } from "../utils/characterImages";
import usePrevious from "../hooks/usePrevious";

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
  if (status === "HAPPY") return <div className="w-10 h-5 border-b-4 border-gray-800 rounded-b-full mt-1" />;
  if (status === "SAD" || status === "DANGER") return <div className="w-10 h-5 border-t-4 border-gray-800 rounded-t-full mt-3" />;
  return <div className="w-8 h-0.5 bg-gray-800 mt-2" />;
};

const CharacterDisplay = ({ status = "NORMAL", isReviving = false }) => {
  const isFaint = status === "FAINT";
  const isHappy = status === "HAPPY";

  const { character, fetchCharacter } = useCharacter();
  const vitality = character?.vitality ?? 0;
  const isMaxVitality = vitality >= 100;

  const prevVitality = usePrevious(vitality);

  // vitality 변화 감지 → 애니메이션 키
  const vitalityUp = prevVitality !== undefined && vitality > prevVitality;
  const vitalityDown = prevVitality !== undefined && vitality < prevVitality;

  const [feedQty, setFeedQty] = useState(0);
  const [using, setUsing] = useState(false);
  const [toast, setToast] = useState(null);
  const [eatFrame, setEatFrame] = useState(0);
  const [reviveFrame, setReviveFrame] = useState(0);
  const [imgError, setImgError] = useState(false);

  const eatIntervalRef = useRef(null);
  const reviveIntervalRef = useRef(null);

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

  useEffect(() => {
    if (!using) { setEatFrame(0); clearInterval(eatIntervalRef.current); return; }
    eatIntervalRef.current = setInterval(() => {
      setEatFrame((prev) => (prev + 1) % EAT_FRAMES.length);
    }, 150);
    return () => clearInterval(eatIntervalRef.current);
  }, [using]);

  useEffect(() => {
    if (!isReviving) { setReviveFrame(0); clearInterval(reviveIntervalRef.current); return; }
    reviveIntervalRef.current = setInterval(() => {
      setReviveFrame((prev) => (prev + 1) % REVIVE_FRAMES.length);
    }, 500);
    return () => clearInterval(reviveIntervalRef.current);
  }, [isReviving]);

  const currentImage = (() => {
    if (isReviving) return REVIVE_FRAMES[reviveFrame];
    if (using) return EAT_FRAMES[eatFrame];
    return CHARACTER_IMAGES[status] ?? null;
  })();

  useEffect(() => { setImgError(false); }, [currentImage]);

  useEffect(() => {
    [...EAT_FRAMES, ...REVIVE_FRAMES].forEach((src) => {
      if (!src) return;
      const img = new Image();
      img.src = src;
    });
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

  // vitality 변화 애니메이션 속성
  const vitalityAnimate = vitalityUp
    ? { y: [0, -8, 0] }
    : vitalityDown
    ? { x: [0, -6, 6, -6, 6, 0] }
    : {};
  const vitalityTransition = vitalityUp
    ? { duration: 0.3 }
    : { duration: 0.4 };

  return (
    <div className="character-wrapper select-none flex flex-col items-center gap-4">
      {/* vitality 변화 감지 애니메이션 wrapper */}
      <motion.div
        animate={vitalityAnimate}
        transition={vitalityTransition}
      >
        {currentImage && !imgError ? (
          <img
            src={currentImage}
            alt={`캐릭터 ${status}`}
            className="w-40 h-40 object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={{ filter: STATUS_FILTER[status] ?? "none" }}>
            <div className="flex flex-col items-center">
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
              <div className="w-24 h-16 bg-yellow-300 rounded-2xl -mt-3 shadow-lg" />
              <div className="flex gap-5 -mt-2">
                <div className="w-9 h-5 bg-yellow-400 rounded-full" />
                <div className="w-9 h-5 bg-yellow-400 rounded-full" />
              </div>
            </div>
          </div>
        )}
      </motion.div>

      <div className="relative group">
        <motion.button
          whileTap={canUse ? { scale: 0.95 } : {}}
          onClick={handleUseFeed}
          disabled={!canUse}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            canUse ? "bg-orange-100 text-orange-600 hover:bg-orange-200" : "bg-gray-100 text-gray-300 cursor-not-allowed"
          }`}
        >
          <span>🍖</span>
          <span>{using ? "사용 중..." : "먹이 사용"}</span>
          <span className="text-xs opacity-60">x{feedQty}</span>
        </motion.button>
        {isMaxVitality && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            활력도가 최대입니다
          </div>
        )}
        {!isMaxVitality && feedQty === 0 && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            먹이가 없어요. 상점에서 구매하세요
          </div>
        )}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
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