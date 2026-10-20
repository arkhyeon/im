export const GENERATORS = [
  { id: "miner", name: "광부", baseCost: 10, rate: 0.5, cycle: 1 },
  { id: "drill", name: "드릴", baseCost: 100, rate: 4, cycle: 1.5 },
  { id: "factory", name: "공장", baseCost: 1100, rate: 30, cycle: 2.5 },
  { id: "bank", name: "은행", baseCost: 12000, rate: 250, cycle: 4 },
];

// 같은 일꾼을 많이 모으면 티어가 오르고, 티어마다 생산량 2배
export const TIERS = [
  { min: 0, name: "브론즈", color: "#e0975a" },
  { min: 10, name: "실버", color: "#dfe7ee" },
  { min: 25, name: "골드", color: "#ffd54a" },
  { min: 50, name: "다이아", color: "#7ef9ff" },
];

// 곡괭이는 3레벨마다 재질이 바뀌고 탭 파워 2배
export const PICKAXES = [
  { name: "나무 곡괭이", head: "#a1887f" },
  { name: "돌 곡괭이", head: "#90a4ae" },
  { name: "철 곡괭이", head: "#e3eaef" },
  { name: "황금 곡괭이", head: "#ffd54a" },
  { name: "다이아 곡괭이", head: "#7ef9ff" },
  { name: "전설의 곡괭이", head: "#ff6ad5" },
];

// 누적 채굴량에 따라 광산(배경·광석)이 바뀜
export const MINES = [
  {
    min: 0,
    name: "돌 광산",
    faces: ["#6b5b7b", "#8f7fa6", "#574a66", "#463b55", "#7a6a90"],
    vein: ["#fff3b0", "#ffc928", "#d48a00"],
    bg: ["#4a3466", "#2a1d3d", "#140d1f"],
  },
  {
    min: 1e3,
    name: "황금 광산",
    faces: ["#7a5c3a", "#a07a4a", "#5e4529", "#4a361f", "#8c6a40"],
    vein: ["#fffbe0", "#ffd54a", "#e09b00"],
    bg: ["#5a4020", "#2e2010", "#140d08"],
  },
  {
    min: 1e5,
    name: "수정 동굴",
    faces: ["#3b5a8a", "#5a82c0", "#2e4870", "#223858", "#4a6fa8"],
    vein: ["#e0fbff", "#7ef9ff", "#2bb7d6"],
    bg: ["#1f4a6e", "#13283d", "#081420"],
  },
  {
    min: 1e7,
    name: "다이아 광맥",
    faces: ["#5b3b7a", "#8a5ab8", "#46305e", "#38244c", "#734aa0"],
    vein: ["#ffffff", "#ff9ef5", "#c03fd0"],
    bg: ["#4a1f5e", "#2a1238", "#12071a"],
  },
  {
    min: 1e9,
    name: "운석 분화구",
    faces: ["#5a2a24", "#8a3a2a", "#46201b", "#381814", "#7a3424"],
    vein: ["#fff2c0", "#ff8a3d", "#e0301a"],
    bg: ["#5e1f14", "#300f0a", "#140504"],
  },
];

// 골드 러시: 빠르게 탭해서 게이지를 채우면 발동
export const RUSH = { perTap: 0.05, decay: 0.12, duration: 10, tapMult: 5, rateMult: 3 };

export const COST_GROWTH = 1.15;
export const MAX_OFFLINE_SEC = 8 * 60 * 60;

export const INITIAL = {
  nickname: "",
  gold: 0,
  totalEarned: 0,
  clickLevel: 0,
  owned: Object.fromEntries(GENERATORS.map((g) => [g.id, 0])),
};

const indexByMin = (list, value) => list.reduce((found, item, i) => (value >= item.min ? i : found), 0);

export const tierOf = (count) => indexByMin(TIERS, count);
export const mineOf = (totalEarned) => indexByMin(MINES, totalEarned);
export const pickaxeOf = (level) => Math.min(Math.floor(level / 3), PICKAXES.length - 1);

export const costOf = (gen, count) => Math.floor(gen.baseCost * COST_GROWTH ** count);
export const clickCostOf = (level) => Math.floor(50 * 3 ** level);
export const clickPowerOf = (level) => (level + 1) * 2 ** pickaxeOf(level);
export const genRateOf = (gen, count) => gen.rate * count * 2 ** tierOf(count);
export const rateOf = (owned) =>
  GENERATORS.reduce((sum, g) => sum + genRateOf(g, owned?.[g.id] || 0), 0);

export const fmt = (n, decimals = 0) => {
  const units = ["", "K", "M", "B", "T", "Qa", "Qi"];
  let i = 0;
  while (n >= 1000 && i < units.length - 1) {
    n /= 1000;
    i++;
  }
  if (i > 0) return n.toFixed(2) + units[i];
  return decimals ? String(parseFloat(n.toFixed(decimals))) : Math.floor(n).toString();
};

// 저장된 데이터(로컬/서버)를 게임 상태로 정리
export const normalize = (saved) => {
  if (!saved) return { ...INITIAL, owned: { ...INITIAL.owned } };
  const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
  return {
    nickname: typeof saved.nickname === "string" ? saved.nickname : "",
    gold: num(saved.gold),
    totalEarned: Math.max(num(saved.totalEarned), num(saved.gold)),
    clickLevel: Math.floor(num(saved.clickLevel)),
    owned: Object.fromEntries(GENERATORS.map((g) => [g.id, Math.floor(num(saved.owned?.[g.id]))])),
  };
};
