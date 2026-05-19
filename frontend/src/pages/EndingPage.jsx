import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ENDING_IMAGE } from "../utils/characterImages";
import CharacterDisplay from "../components/CharacterDisplay";

// 별/파티클 위치·크기·딜레이 설정 (Framer Motion만 사용)
const STARS = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,      // vw 기준 %
  y: Math.random() * 100,      // vh 기준 %
  size: 8 + Math.random() * 16,
  delay: Math.random() * 2,
  duration: 2 + Math.random() * 3,
  emoji: ["⭐", "🌟", "✨", "🎊", "🎉"][Math.floor(Math.random() * 5)],
}));

const EndingPage = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-100 flex flex-col items-center justify-center overflow-hidden p-6"
    >
      {/* 배경 별/파티클 애니메이션 */}
      {STARS.map((star) => (
        <motion.div
          key={star.id}
          className="absolute pointer-events-none select-none"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            fontSize: star.size,
          }}
          initial={{ opacity: 0, scale: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 0.8, 0],
            scale: [0, 1.2, 1, 0.5],
            y: [-20, -60],
          }}
          transition={{
            delay: star.delay,
            duration: star.duration,
            repeat: Infinity,
            repeatDelay: Math.random() * 2,
          }}
        >
          {star.emoji}
        </motion.div>
      ))}

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 flex flex-col items-center gap-8 max-w-md w-full">

        {/* 엔딩 이미지 또는 CSS 캐릭터 fallback */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 200 }}
        >
          {ENDING_IMAGE ? (
            <img
              src={ENDING_IMAGE}
              alt="취업 성공 캐릭터"
              className="w-48 h-48 object-contain drop-shadow-xl"
            />
          ) : (
            <CharacterDisplay status="HAPPY" />
          )}
        </motion.div>

        {/* 취업 성공 텍스트 */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5, type: "spring", stiffness: 180 }}
          className="text-4xl font-extrabold text-orange-500 text-center drop-shadow"
        >
          취업 성공! 🎉
        </motion.h1>

        {/* 부제목 */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="text-lg text-gray-600 text-center font-semibold"
        >
          50개 day를 모두 통과했습니다!
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.9 }}
          className="text-sm text-gray-400 text-center"
        >
          열심히 공부한 당신, 정말 대단해요 🌟
        </motion.p>

        {/* 홈으로 버튼 */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1.1 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/")}
          className="w-full bg-gradient-to-r from-orange-400 to-pink-400 text-white font-bold py-4 rounded-2xl shadow-lg text-base hover:opacity-90 transition-opacity"
        >
          홈으로 돌아가기
        </motion.button>
      </div>
    </motion.div>
  );
};

export default EndingPage;
