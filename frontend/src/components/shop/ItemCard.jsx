import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ITEM_ICONS = {
  FEED: "🍖",
  TIME_EXTENSION: "⏰",
};

/**
 * @param {{ item: { itemType: string, name: string, description: string, price: number }, onBuy: (itemType: string) => Promise<void>, userCoin: number }} props
 */
const ItemCard = ({ item, onBuy, userCoin }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [buying, setBuying] = useState(false);

  const canAfford = userCoin >= item.price;

  const handleConfirm = async () => {
    setBuying(true);
    try {
      await onBuy(item.itemType);
    } finally {
      setBuying(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      {/* 아이템 카드 */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-white rounded-2xl shadow p-6 flex flex-col items-center gap-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-4xl">
          {ITEM_ICONS[item.itemType] ?? "🎁"}
        </div>

        <div className="text-center space-y-1">
          <p className="font-bold text-gray-800">{item.name}</p>
          <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>
        </div>

        <div className="flex items-center gap-1 text-sm font-bold text-yellow-600">
          <span>🪙</span>
          <span>{item.price} 코인</span>
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowConfirm(true)}
          disabled={!canAfford}
          className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-colors ${
            canAfford
              ? "bg-orange-500 hover:bg-orange-600 text-white"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {canAfford ? "구매" : "코인 부족"}
        </motion.button>
      </motion.div>

      {/* 구매 확인 모달 */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="bg-white rounded-2xl shadow-xl p-8 max-w-xs w-full text-center space-y-4"
            >
              <p className="text-3xl">{ITEM_ICONS[item.itemType] ?? "🎁"}</p>
              <div>
                <p className="font-bold text-gray-800">{item.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {item.price}코인을 사용합니다.
                </p>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={buying}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={buying}
                  className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors disabled:opacity-60"
                >
                  {buying ? "구매 중..." : "확인"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ItemCard;
