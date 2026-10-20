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

// 고용소에서 뽑는 일꾼 등급
export const RARITIES = [
  { name: "일반", color: "#b0bec5" },
  { name: "희귀", color: "#4fc3f7" },
  { name: "영웅", color: "#b388ff" },
  { name: "전설", color: "#ffd54a" },
  { name: "신화", color: "#ff5c8a" },
];

// 뽑은 일꾼은 마리당 rate 만큼 초당 골드를 자동으로 캐 와요
export const WORKERS = [
  { id: "apprentice", name: "견습 광부", rarity: 0, rate: 1, look: { body: "#8d6e63", helmet: "#ffc107" } },
  { id: "porter", name: "짐꾼", rarity: 0, rate: 1.5, look: { body: "#689f38", helmet: "#a1887f" } },
  { id: "veteran", name: "숙련 광부", rarity: 1, rate: 12, look: { body: "#1e88e5", helmet: "#4fc3f7" } },
  { id: "blaster", name: "폭파 전문가", rarity: 1, rate: 18, look: { body: "#e53935", helmet: "#ff7043", extra: "dynamite" } },
  { id: "dwarf", name: "드워프 장인", rarity: 2, rate: 200, look: { body: "#6d4c41", helmet: "#b388ff", extra: "beard" } },
  { id: "wizard", name: "광산 마법사", rarity: 2, rate: 300, look: { body: "#5e35b1", helmet: "#7e57c2", extra: "wizard" } },
  { id: "golem", name: "황금 골렘", rarity: 3, rate: 4000, look: { body: "#f9a825", helmet: "#ffd54a", skin: "#ffca28", extra: "golem" } },
  { id: "dragonslayer", name: "용 사냥꾼", rarity: 3, rate: 6000, look: { body: "#b71c1c", helmet: "#ffd54a", extra: "crown" } },
  { id: "spirit", name: "대지의 정령", rarity: 4, rate: 120000, look: { body: "#26c6da", helmet: "#ff5c8a", skin: "#b2fbff", extra: "spirit" } },
];

// 비싼 티켓일수록 높은 등급이 잘 나와요. odds는 등급별 확률(%)이고, 뽑을 때마다 그 티켓 가격이 6%씩 올라요.
export const TICKETS = [
  { id: "bronze", name: "동 티켓", cost: 100, color: "#e0975a", odds: [80, 19, 1, 0, 0] },
  { id: "silver", name: "은 티켓", cost: 2000, color: "#dfe7ee", odds: [50, 35, 13, 2, 0] },
  { id: "gold", name: "금 티켓", cost: 40000, color: "#ffd54a", odds: [20, 40, 30, 9, 1] },
  { id: "diamond", name: "다이아 티켓", cost: 800000, color: "#7ef9ff", odds: [0, 10, 45, 35, 10] },
];
export const TICKET_GROWTH = 1.06;

// 천장: 금 티켓을 50번 뽑는 동안 전설이 안 나오면 50번째는 전설 이상 확정
export const PITY = { ticket: "gold", limit: 50 };
// 같은 일꾼 5마리 → 한 등급 위 일꾼 1마리
export const MERGE_COUNT = 5;
// 광고 보고 무료 은 티켓, 하루 3회
export const AD_TICKET = { ticket: "silver", perDay: 3 };
// 환생: 이번 판 채굴량 1M마다 계산해 환생석 지급, 환생석 1개당 생산·탭 +10%
export const PRESTIGE_UNIT = 1e6;
// 황금 박쥐: 40~90초마다 7초 동안 날아감
export const BAT = { minGap: 40000, maxGap: 90000, flight: 7000 };

export const QUESTS = [
  { id: "taps", name: "광석 300번 캐기", goal: 300 },
  { id: "pulls", name: "일꾼 10명 뽑기", goal: 10 },
  { id: "rushes", name: "골드 러시 2번 발동", goal: 2 },
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
  workers: {},
  pulls: {},
  runEarned: 0,
  stones: 0,
  prestiges: 0,
  pity: 0,
  daily: null,
  attendance: { last: "", streak: 0 },
};

const indexByMin = (list, value) => list.reduce((found, item, i) => (value >= item.min ? i : found), 0);

export const tierOf = (count) => indexByMin(TIERS, count);
export const mineOf = (runEarned) => indexByMin(MINES, runEarned);
export const pickaxeOf = (level) => Math.min(Math.floor(level / 3), PICKAXES.length - 1);

export const costOf = (gen, count) => Math.floor(gen.baseCost * COST_GROWTH ** count);
export const clickCostOf = (level) => Math.floor(50 * 3 ** level);
export const clickPowerOf = (level) => (level + 1) * 2 ** pickaxeOf(level);
export const genRateOf = (gen, count) => gen.rate * count * 2 ** tierOf(count);
export const workerRateOf = (workers) =>
  WORKERS.reduce((sum, w) => sum + w.rate * (workers?.[w.id] || 0), 0);
export const rateOf = (owned, workers) =>
  GENERATORS.reduce((sum, g) => sum + genRateOf(g, owned?.[g.id] || 0), 0) + workerRateOf(workers);

export const prestigeMult = (stones) => 1 + stones * 0.1;
export const stonesFor = (runEarned) => Math.floor(Math.sqrt(runEarned / PRESTIGE_UNIT));
// 환생 배율까지 포함한 실제 초당 생산량
export const incomeOf = (g) => rateOf(g.owned, g.workers) * prestigeMult(g.stones);
export const tapPowerOf = (g) => clickPowerOf(g.clickLevel) * prestigeMult(g.stones);

export const addGold = (g, amount) => ({
  ...g,
  gold: g.gold + amount,
  totalEarned: g.totalEarned + amount,
  runEarned: g.runEarned + amount,
});

// 날짜(YYYY-MM-DD)로 하루 단위 기록을 나눔
export const todayKey = (date = new Date()) => date.toLocaleDateString("sv-SE");
export const yesterdayKey = () => todayKey(new Date(Date.now() - 864e5));
export const freshDaily = () => ({ day: todayKey(), taps: 0, pulls: 0, rushes: 0, ads: 0, claimed: QUESTS.map(() => false) });
export const dailyOf = (daily) => (daily?.day === todayKey() ? daily : freshDaily());
export const bumpDaily = (g, field, amount = 1) => {
  const daily = dailyOf(g.daily);
  return { ...g, daily: { ...daily, [field]: daily[field] + amount } };
};

export const questRewardOf = (g) => Math.max(1000, incomeOf(g) * 900);
// 출석 n일차: n × 10분치 생산량, 7일차엔 금 티켓 1회 추가
export const attendanceRewardOf = (g, day) => Math.max(500 * day, incomeOf(g) * 600 * day);
export const nextStreakOf = (attendance) =>
  attendance.last === yesterdayKey() ? (attendance.streak % 7) + 1 : 1;

// times 번 뽑을 때의 총 가격 (한 번 뽑을 때마다 가격 상승)
export const ticketCostOf = (ticket, pulls, times = 1) => {
  let total = 0;
  for (let k = 0; k < times; k++) total += Math.floor(ticket.cost * TICKET_GROWTH ** (pulls + k));
  return total;
};

export const rollWorker = (ticket, rand = Math.random) => {
  let roll = rand() * 100;
  let rarity = ticket.odds.reduce((last, odd, i) => (odd > 0 ? i : last), 0);
  for (let i = 0; i < ticket.odds.length; i++) {
    if (roll < ticket.odds[i]) {
      rarity = i;
      break;
    }
    roll -= ticket.odds[i];
  }
  return pickWorker(rarity, rand);
};

export const pickWorker = (rarity, rand = Math.random) => {
  const pool = WORKERS.filter((w) => w.rarity === rarity);
  return pool[Math.floor(rand() * pool.length)];
};

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
  if (!saved) return { ...INITIAL, owned: { ...INITIAL.owned }, workers: {}, pulls: {}, attendance: { ...INITIAL.attendance } };
  const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
  const counts = (obj, list) =>
    Object.fromEntries(list.map((item) => [item.id, Math.floor(num(obj?.[item.id]))]).filter(([, n]) => n > 0));
  return {
    nickname: typeof saved.nickname === "string" ? saved.nickname : "",
    gold: num(saved.gold),
    totalEarned: Math.max(num(saved.totalEarned), num(saved.gold)),
    clickLevel: Math.floor(num(saved.clickLevel)),
    owned: Object.fromEntries(GENERATORS.map((g) => [g.id, Math.floor(num(saved.owned?.[g.id]))])),
    workers: counts(saved.workers, WORKERS),
    pulls: counts(saved.pulls, TICKETS),
    runEarned: typeof saved.runEarned === "number" ? num(saved.runEarned) : num(saved.totalEarned),
    stones: Math.floor(num(saved.stones)),
    prestiges: Math.floor(num(saved.prestiges)),
    pity: Math.floor(num(saved.pity)),
    daily:
      saved.daily && typeof saved.daily.day === "string"
        ? {
            day: saved.daily.day,
            taps: num(saved.daily.taps),
            pulls: num(saved.daily.pulls),
            rushes: num(saved.daily.rushes),
            ads: num(saved.daily.ads),
            claimed: QUESTS.map((_, i) => Boolean(saved.daily.claimed?.[i])),
          }
        : null,
    attendance: {
      last: typeof saved.attendance?.last === "string" ? saved.attendance.last : "",
      streak: Math.floor(num(saved.attendance?.streak)),
    },
  };
};
