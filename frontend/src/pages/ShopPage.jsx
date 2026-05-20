import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCharacter } from "../context/CharacterContext";
import { getShopItems, buyItem, getInventory, consumeItem } from "../api/shop";
import ItemCard from "../components/shop/ItemCard";

const ShopPage = () => {
  const navigate = useNavigate();
  const { character, updateCoin, fetchCharacter } = useCharacter();

  const [shopItems, setShopItems] = useState([]);
  const [inventory, setInventory] = useState({}); // { FEED: 2, TIME_EXTENSION: 1 }
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null); // { msg: string, type: 'success' | 'error' }
  const [usingItem, setUsingItem] = useState(null); // 사용 중인 itemType

  const coin = character?.coin ?? 0;

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  // 상점 아이템 목록 + 보유 수량 초기 로드
  useEffect(() => {
    const load = async () => {
      try {
        const [itemsRes, invRes] = await Promise.all([
          getShopItems(),
          getInventory(),
        ]);
        setShopItems(itemsRes.data.data);
        const invMap = {};
        invRes.data.data.forEach(({ itemType, quantity }) => {
          invMap[itemType] = quantity;
        });
        setInventory(invMap);
      } catch {
        showToast("아이템 목록을 불러오지 못했습니다.", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [showToast]);

  const handleUse = async (itemType) => {
    setUsingItem(itemType);
    try {
      const { data } = await consumeItem(itemType);
      if (data.success) {
        setInventory((prev) => ({
          ...prev,
          [itemType]: data.data.quantity,
        }));
        await fetchCharacter();
        showToast("아이템을 사용했습니다!", "success");
      }
    } catch (err) {
      const msg = err.response?.data?.message ?? "사용에 실패했습니다.";
      showToast(msg, "error");
    } finally {
      setUsingItem(null);
    }
  };

  const handleBuy = async (itemType) => {
    try {
      const { data } = await buyItem(itemType);
      if (data.success) {
        updateCoin(data.data.remainCoin);
        setInventory((prev) => ({
          ...prev,
          [itemType]: data.data.quantity,
        }));
        showToast("구매 완료!", "success");
      }
    } catch (err) {
      const msg = err.response?.data?.message ?? "구매에 실패했습니다.";
      showToast(msg, "error");
    }
  };

  return (
    <div className="min-h-screen bg-wt-sky">
      {/* 헤더 */}
      <header className="flex items-center gap-3 px-5 py-4 bg-white/70 backdrop-blur shadow-sm sticky top-0 z-10">
        <button
          onClick={() => navigate("/main")}
          className="text-gray-400 hover:text-wt-orange transition-colors text-lg"
        >
          ←
        </button>
        <h1 className="text-xl font-bold text-wt-orange">상점</h1>
        <div className="ml-auto flex items-center gap-1.5 bg-wt-orange-light border border-wt-sky-dark rounded-full px-3 py-1">
          <span className="text-base">🪙</span>
          <span className="text-sm font-bold text-wt-orange">{coin.toLocaleString()}</span>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="text-center text-gray-400 py-16 text-sm">불러오는 중...</div>
        ) : (
          <>
            {/* 구매 섹션 */}
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
                아이템 구매
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {shopItems.map((item) => (
                  <ItemCard
                    key={item.itemType}
                    item={item}
                    onBuy={handleBuy}
                    userCoin={coin}
                  />
                ))}
              </div>
            </section>

            {/* 보유 아이템 섹션 */}
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
                보유 아이템
              </h2>
              <div className="bg-white rounded-2xl shadow divide-y divide-gray-50">
                {shopItems.map((item) => {
                  const qty = inventory[item.itemType] ?? 0;
                  return (
                    <div
                      key={item.itemType}
                      className="flex items-center px-5 py-4 gap-3"
                    >
                      <span className="text-2xl">
                        {item.itemType === "FEED" ? "🍖" : "⏰"}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-400">{qty}개 보유</p>
                      </div>
                      {item.itemType === "FEED" ? (
                        <button
                          onClick={() => handleUse(item.itemType)}
                          disabled={qty <= 0 || usingItem === item.itemType}
                          className={`text-sm font-semibold px-4 py-2 rounded-xl transition-colors ${
                            qty > 0
                              ? "bg-wt-orange hover:bg-[#ed5d28] text-white disabled:opacity-60"
                              : "bg-gray-100 text-gray-300 cursor-not-allowed"
                          }`}
                        >
                          {usingItem === item.itemType ? "사용 중..." : "사용"}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">퀴즈에서 사용</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </main>

      {/* 토스트 메시지 */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.22 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-lg text-sm font-semibold z-50 ${
              toast.type === "success"
                ? "bg-gray-800 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShopPage;
