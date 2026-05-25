// AudioContext 싱글턴 — 첫 사용자 인터랙션 시점에 생성
let audioCtx = null;

const getCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
};

const playTone = (frequency, duration, startFreq = null) => {
  if (!isSoundOn()) return;
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    if (startFreq) {
      osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
      osc.frequency.setValueAtTime(frequency, ctx.currentTime + 0.1);
    } else {
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    }
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // autoplay 정책 등 예외 무시
  }
};

// 정답: 880Hz, 0.1초
export const playCorrect = () => playTone(880, 0.1);

// 오답: 220Hz, 0.2초
export const playWrong = () => playTone(220, 0.2);

// 코인: 660Hz→880Hz, 각 0.1초 연속
export const playCoin = () => playTone(880, 0.1, 660);

export const isSoundOn = () => {
  return (localStorage.getItem("wordtama_sound") ?? "on") === "on";
};

export const toggleSound = () => {
  const next = isSoundOn() ? "off" : "on";
  localStorage.setItem("wordtama_sound", next);
  return next;
};