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
  // NORMAL, FAINT
  return <div className="w-8 h-0.5 bg-gray-800 mt-2" />;
};

const CharacterDisplay = ({ status = "NORMAL" }) => {
  const isFaint = status === "FAINT";
  const isHappy = status === "HAPPY";

  return (
    <div
      className="character-wrapper select-none"
      style={{ filter: STATUS_FILTER[status] ?? "none" }}
    >
      <div className="flex flex-col items-center">
        {/* 머리 */}
        <div className="relative w-32 h-32 bg-yellow-300 rounded-full flex flex-col items-center justify-center shadow-xl">
          {/* 볼터치 (HAPPY 전용) */}
          {isHappy && (
            <>
              <div className="absolute left-3 bottom-8 w-8 h-5 bg-pink-300 rounded-full opacity-70" />
              <div className="absolute right-3 bottom-8 w-8 h-5 bg-pink-300 rounded-full opacity-70" />
            </>
          )}

          {/* 눈 */}
          <div className="flex gap-6 mb-1">
            <Eye faint={isFaint} />
            <Eye faint={isFaint} />
          </div>

          {/* 입 */}
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
  );
};

export default CharacterDisplay;
