// 효과음: 파일 없이 브라우저(Web Audio)로 직접 만들어요. 첫 탭 이후부터 소리가 나요.
let ctx = null;
let muted = (() => {
  try {
    return localStorage.getItem("ore-muted") === "1";
  } catch {
    return false;
  }
})();

export const isMuted = () => muted;
export const setMuted = (value) => {
  muted = value;
  try {
    localStorage.setItem("ore-muted", value ? "1" : "0");
  } catch {
    // 저장이 막힌 브라우저
  }
};

const audio = () => {
  if (muted) return null;
  if (!ctx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    ctx = new AudioContext();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
};

const tone = (freq, dur, type = "square", vol = 0.06, slideTo = null, delay = 0) => {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + delay;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur);
};

const noise = (dur, vol = 0.15, freq = 900) => {
  const a = audio();
  if (!a) return;
  const buffer = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = a.createBufferSource();
  const filter = a.createBiquadFilter();
  const gain = a.createGain();
  src.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.value = freq;
  gain.gain.value = vol;
  src.connect(filter).connect(gain).connect(a.destination);
  src.start();
};

const melody = (notes, gap = 0.11, type = "triangle", vol = 0.07) =>
  notes.forEach((f, i) => tone(f, 0.2, type, vol, null, i * gap));

export const sfx = {
  tap: () => tone(480 + Math.random() * 120, 0.05, "square", 0.035, 240),
  crit: () => {
    tone(900, 0.08, "square", 0.06, 1600);
    tone(1500, 0.12, "triangle", 0.05);
  },
  weak: () => melody([1200, 1800], 0.05, "triangle", 0.07),
  break: () => {
    noise(0.25, 0.2, 700);
    tone(200, 0.25, "sawtooth", 0.05, 60);
  },
  boom: () => {
    noise(0.7, 0.35, 300);
    tone(100, 0.6, "sawtooth", 0.09, 35);
  },
  coin: () => melody([1320, 1760], 0.06, "triangle", 0.05),
  fanfare: () => melody([523, 659, 784, 1047, 1319], 0.1),
  fail: () => melody([330, 262, 196], 0.14, "sawtooth", 0.05),
  boss: () => melody([196, 185, 175, 165], 0.16, "sawtooth", 0.06),
  combo: () => melody([880, 1109, 1319], 0.06),
};

// 휴대폰 진동 (지원하는 기기만)
export const buzz = (ms) => {
  try {
    navigator.vibrate?.(ms);
  } catch {
    // 진동 미지원
  }
};
