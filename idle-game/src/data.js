// 게임 밸런스와 콘텐츠 데이터. 숫자를 바꾸면 바로 게임에 반영돼요.

// ---------- 일꾼 등급 (9단계 × 3명 = 27명) ----------
export const RARITIES = [
  { name: "일반", color: "#b0bec5" },
  { name: "고급", color: "#81c784" },
  { name: "희귀", color: "#4fc3f7" },
  { name: "영웅", color: "#b388ff" },
  { name: "전설", color: "#ffd54a" },
  { name: "신화", color: "#ff5c8a" },
  { name: "초월", color: "#ff8a3d" },
  { name: "불멸", color: "#e8eaff" },
  { name: "태초", color: "#7ef9ff" },
];

// 종족: 서로 다른 일꾼을 2/3/5명 모으면 종족 시너지
export const TRIBES = {
  human: { name: "인간", effect: "gold", desc: "골드 획득" },
  dwarf: { name: "드워프", effect: "tap", desc: "탭 피해" },
  golem: { name: "골렘", effect: "worker", desc: "일꾼 효율" },
  spirit: { name: "정령", effect: "drop", desc: "아이템 드롭률" },
  dragon: { name: "용족", effect: "crit", desc: "치명타 피해" },
};
export const TRIBE_STEPS = [
  { count: 2, bonus: 0.1 },
  { count: 3, bonus: 0.25 },
  { count: 5, bonus: 0.6 },
];

const RARITY_RATE = [1, 5, 25, 120, 600, 3000, 15000, 80000, 400000];
const worker = (id, name, rarity, tribe, variant, look) => ({
  id,
  name,
  rarity,
  tribe,
  rate: RARITY_RATE[rarity] * [1, 1.15, 1.3][variant],
  look,
});

export const WORKERS = [
  worker("apprentice", "견습 광부", 0, "human", 0, { body: "#8d6e63", helmet: "#ffc107" }),
  worker("porter", "짐꾼", 0, "human", 1, { body: "#689f38", helmet: "#a1887f" }),
  worker("pebble", "조약돌 골렘", 0, "golem", 2, { body: "#9e9e9e", helmet: "#bdbdbd", skin: "#a8a8a8", extra: "golem" }),
  worker("carter", "수레꾼", 1, "human", 0, { body: "#00897b", helmet: "#ffb74d" }),
  worker("dwarfling", "꼬마 드워프", 1, "dwarf", 1, { body: "#795548", helmet: "#81c784", extra: "beard" }),
  worker("firefly", "반딧불 정령", 1, "spirit", 2, { body: "#c5e1a5", helmet: "#81c784", skin: "#f0ffd0", extra: "spirit" }),
  worker("veteran", "숙련 광부", 2, "human", 0, { body: "#1e88e5", helmet: "#4fc3f7" }),
  worker("blaster", "폭파 전문가", 2, "human", 1, { body: "#e53935", helmet: "#ff7043", extra: "dynamite" }),
  worker("irongolem", "강철 골렘", 2, "golem", 2, { body: "#607d8b", helmet: "#90a4ae", skin: "#b0bec5", extra: "golem" }),
  worker("dwarf", "드워프 장인", 3, "dwarf", 0, { body: "#6d4c41", helmet: "#b388ff", extra: "beard" }),
  worker("wizard", "광산 마법사", 3, "spirit", 1, { body: "#5e35b1", helmet: "#7e57c2", extra: "wizard" }),
  worker("wyrmling", "새끼 용", 3, "dragon", 2, { body: "#43a047", helmet: "#b388ff", skin: "#9ccc65", extra: "horns" }),
  worker("golem", "황금 골렘", 4, "golem", 0, { body: "#f9a825", helmet: "#ffd54a", skin: "#ffca28", extra: "golem" }),
  worker("dragonslayer", "용 사냥꾼", 4, "dragon", 1, { body: "#b71c1c", helmet: "#ffd54a", extra: "crown" }),
  worker("dwarfking", "드워프 왕", 4, "dwarf", 2, { body: "#4e342e", helmet: "#ffd54a", extra: "beardcrown" }),
  worker("spirit", "대지의 정령", 5, "spirit", 0, { body: "#26c6da", helmet: "#ff5c8a", skin: "#b2fbff", extra: "spirit" }),
  worker("drake", "화염 드레이크", 5, "dragon", 1, { body: "#d84315", helmet: "#ff5c8a", skin: "#ff8a65", extra: "horns" }),
  worker("mithril", "미스릴 골렘", 5, "golem", 2, { body: "#90caf9", helmet: "#ff5c8a", skin: "#e3f2fd", extra: "golem" }),
  worker("starminer", "별의 광부", 6, "human", 0, { body: "#283593", helmet: "#ff8a3d", extra: "cape" }),
  worker("runesmith", "룬 대장장이", 6, "dwarf", 1, { body: "#3e2723", helmet: "#ff8a3d", extra: "beardcape" }),
  worker("storm", "폭풍의 정령", 6, "spirit", 2, { body: "#5c6bc0", helmet: "#ff8a3d", skin: "#c5cae9", extra: "spirit" }),
  worker("elder", "고대 용", 7, "dragon", 0, { body: "#4a148c", helmet: "#e8eaff", skin: "#ce93d8", extra: "hornscape" }),
  worker("eternal", "영원의 골렘", 7, "golem", 1, { body: "#eceff1", helmet: "#e8eaff", skin: "#fafafa", extra: "golemcape" }),
  worker("dwarfgod", "드워프 신", 7, "dwarf", 2, { body: "#fff8e1", helmet: "#e8eaff", extra: "beardhalo" }),
  worker("genesis", "창세의 광부", 8, "human", 0, { body: "#000a2e", helmet: "#7ef9ff", extra: "halo" }),
  worker("primal", "태초의 정령", 8, "spirit", 1, { body: "#ffffff", helmet: "#7ef9ff", skin: "#e0fbff", extra: "spirithalo" }),
  worker("cosmic", "우주 용", 8, "dragon", 2, { body: "#1a0033", helmet: "#7ef9ff", skin: "#7c4dff", extra: "hornshalo" }),
];

// 특정 일꾼을 함께 가지고 있으면 발동하는 조합 시너지
export const COMBOS = [
  { id: "trio", name: "광산 삼총사", members: ["apprentice", "veteran", "starminer"], effect: "gold", bonus: 0.3 },
  { id: "anvil", name: "망치와 모루", members: ["dwarf", "runesmith"], effect: "tap", bonus: 0.5 },
  { id: "hunt", name: "용과 사냥꾼", members: ["wyrmling", "dragonslayer"], effect: "crit", bonus: 0.4 },
  { id: "element", name: "원소의 조화", members: ["firefly", "spirit", "storm"], effect: "drop", bonus: 0.5 },
  { id: "legion", name: "골렘 군단", members: ["pebble", "irongolem", "golem", "mithril"], effect: "worker", bonus: 0.4 },
  { id: "dawn", name: "태초의 빛", members: ["genesis", "primal", "cosmic"], effect: "gold", bonus: 2 },
];

export const EFFECT_NAMES = {
  gold: "골드 획득",
  tap: "탭 피해",
  worker: "일꾼 효율",
  drop: "드롭률",
  crit: "치명타 피해",
};

// ---------- 뽑기 티켓 ----------
// odds: 일반~태초 9등급 확률(%). 뽑을 때마다 그 티켓 가격이 4%씩 올라요.
export const TICKETS = [
  { id: "bronze", name: "동 티켓", cost: 100, color: "#e0975a", odds: [70, 25, 5, 0, 0, 0, 0, 0, 0] },
  { id: "silver", name: "은 티켓", cost: 3000, color: "#dfe7ee", odds: [35, 35, 22, 7, 1, 0, 0, 0, 0] },
  { id: "gold", name: "금 티켓", cost: 80000, color: "#ffd54a", odds: [10, 25, 30, 22, 10, 3, 0, 0, 0] },
  { id: "diamond", name: "다이아 티켓", cost: 2.5e6, color: "#7ef9ff", odds: [0, 5, 20, 30, 28, 12, 4, 1, 0] },
  { id: "primal", name: "태초 티켓", cost: 8e7, color: "#ff6ad5", odds: [0, 0, 0, 10, 30, 30, 18, 9, 3] },
];
export const TICKET_GROWTH = 1.04;
// 천장: 금 이상 티켓을 50번 뽑는 동안 전설이 안 나오면 50번째는 전설 이상 확정
export const PITY = { tickets: ["gold", "diamond", "primal"], limit: 50, rarity: 4 };
// 합성: 같은 등급 3명 → 성공 시 +1등급, 대성공 시 +2등급, 실패 시 1명만 돌려받음
export const MERGE = { count: 3, great: 0.06, success: (rarity) => Math.max(0.15, 0.75 - rarity * 0.07) };
export const AD_TICKET = { ticket: "silver", perDay: 3 };

// ---------- 장비 (Lv.0~100, 10레벨마다 재질이 바뀜) ----------
export const MAX_LEVEL = 100;
export const MATERIALS = [
  { name: "나무", color: "#a1887f" },
  { name: "돌", color: "#90a4ae" },
  { name: "구리", color: "#d9825b" },
  { name: "철", color: "#cfd8dc" },
  { name: "은", color: "#f5f8fc" },
  { name: "황금", color: "#ffd54a" },
  { name: "루비", color: "#ff5c8a" },
  { name: "사파이어", color: "#4fa3ff" },
  { name: "다이아", color: "#7ef9ff" },
  { name: "전설", color: "#ff6ad5" },
];
export const EQUIPMENT = [
  { id: "pickaxe", name: "곡괭이", base: 15 },
  { id: "helmet", name: "헬멧", base: 60 },
  { id: "gloves", name: "장갑", base: 80 },
  { id: "shirt", name: "작업복", base: 50 },
  { id: "pants", name: "작업 바지", base: 70 },
  { id: "boots", name: "안전화", base: 60 },
];
export const EQUIP_GROWTH = 1.17;
// 세트: 모든 장비가 Lv.10, 20, … 이상이면 그 단계 세트 효과
export const SET_BONUS = { gold: 0.2, critChance: 0.01 };

// ---------- 광석 ----------
// 탭/일꾼 피해만큼 골드(피해 × mult)를 주고, HP를 다 깎으면 파괴 보너스와 아이템이 나와요.
// 앞 광석을 10번 부수면 다음 광석이 열려요.
export const BREAKS_TO_UNLOCK = 10;
export const BREAK_BONUS = 3;
const ore = (id, name, hp, mult, price, faces, vein, bg) => ({ id, name, hp, mult, price, faces, vein, bg });
export const ORES = [
  ore("stone", "돌", 20, 1, 5,
    ["#6b5b7b", "#8f7fa6", "#574a66", "#463b55", "#7a6a90"], ["#f5f5f5", "#bdbdbd", "#8d8d8d"], ["#4a3466", "#2a1d3d", "#140d1f"]),
  ore("copper", "구리", 200, 1.6, 25,
    ["#6d4c41", "#8d6e63", "#5d4037", "#4e342e", "#795548"], ["#ffd0b0", "#e07a4a", "#a14a20"], ["#5a3426", "#2e1a12", "#140a06"]),
  ore("iron", "철", 2000, 2.5, 120,
    ["#546e7a", "#78909c", "#455a64", "#37474f", "#607d8b"], ["#ffffff", "#cfd8dc", "#90a4ae"], ["#2f4550", "#18242b", "#0a1014"]),
  ore("silver", "은", 2e4, 4, 600,
    ["#5c6b7a", "#8193a6", "#4a5866", "#3b4652", "#6e7f91"], ["#ffffff", "#e3eaf2", "#a9b8c8"], ["#3a4a66", "#1d2638", "#0c1018"]),
  ore("gold", "금", 2e5, 6, 3000,
    ["#7a5c3a", "#a07a4a", "#5e4529", "#4a361f", "#8c6a40"], ["#fffbe0", "#ffd54a", "#e09b00"], ["#5a4020", "#2e2010", "#140d08"]),
  ore("ruby", "루비", 2e6, 9, 15000,
    ["#6a2c3a", "#8e3e52", "#55222e", "#431a24", "#7a3446"], ["#ffd0dc", "#ff3d6e", "#b0103a"], ["#5e1f2e", "#300f18", "#14050a"]),
  ore("sapphire", "사파이어", 2e7, 13, 80000,
    ["#2e4870", "#4a6fa8", "#223858", "#1a2c46", "#3b5a8a"], ["#e0f0ff", "#4fa3ff", "#1a5fd0"], ["#1f3a6e", "#132340", "#081020"]),
  ore("emerald", "에메랄드", 2e8, 19, 400000,
    ["#2e5a46", "#447f63", "#234837", "#1a382a", "#386d54"], ["#e0ffe8", "#3ddc84", "#0f8a4a"], ["#1f5a3e", "#123522", "#06140c"]),
  ore("diamond", "다이아몬드", 2e9, 28, 2e6,
    ["#3b5a8a", "#5a82c0", "#2e4870", "#223858", "#4a6fa8"], ["#ffffff", "#7ef9ff", "#2bb7d6"], ["#1f4a6e", "#13283d", "#081420"]),
  ore("meteor", "운석", 2e10, 40, 1e7,
    ["#5a2a24", "#8a3a2a", "#46201b", "#381814", "#7a3424"], ["#fff2c0", "#ff8a3d", "#e0301a"], ["#5e1f14", "#300f0a", "#140504"]),
];

// ---------- 장신구 (광석을 부수면 가끔 나옴, 환생해도 유지) ----------
export const CHARM_SLOTS = 3;
export const CHARM_CAP = 60;
export const CHARM_RARITY_WEIGHTS = [60, 25, 10, 4, 0.9, 0.1]; // 일반~신화
export const CHARM_TYPES = [
  { id: "clover", name: "행운의 부적", stat: "drop", base: 0.05 },
  { id: "ring", name: "황금 반지", stat: "gold", base: 0.05 },
  { id: "necklace", name: "광부의 목걸이", stat: "worker", base: 0.06 },
  { id: "earring", name: "매의 귀걸이", stat: "critChance", base: 0.01 },
  { id: "bracelet", name: "분노의 팔찌", stat: "critDmg", base: 0.25 },
  { id: "feather", name: "폭풍의 깃털", stat: "rush", base: 0.5 },
];

// ---------- 기타 ----------
export const RUSH = { perTap: 0.05, decay: 0.12, duration: 10, tapMult: 5, rateMult: 3 };
export const MAX_OFFLINE_SEC = 8 * 60 * 60;
export const PRESTIGE_UNIT = 1e6;
export const BAT = { minGap: 40000, maxGap: 90000, flight: 7000 };
export const QUESTS = [
  { id: "breaks", name: "광석 10번 부수기", goal: 10 },
  { id: "pulls", name: "일꾼 10명 뽑기", goal: 10 },
  { id: "rushes", name: "골드 러시 2번 발동", goal: 2 },
];
