// 게임 밸런스와 콘텐츠 데이터. 숫자를 바꾸면 바로 게임에 반영돼요.

// ---------- 등급 (광부·장신구 공통 9단계) ----------
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

// ---------- 광부 (9등급 × 3명 = 27명) ----------
// 종족: 서로 다른 같은 종족 광부를 2/3/5명 모으면 시너지
export const TRIBES = {
  human: { name: "인간", effect: "gold", desc: "골드 획득" },
  dwarf: { name: "드워프", effect: "tap", desc: "탭 피해" },
  golem: { name: "골렘", effect: "worker", desc: "광부 효율" },
  spirit: { name: "정령", effect: "drop", desc: "부산물 드롭" },
  dragon: { name: "용족", effect: "crit", desc: "치명타 피해" },
};
export const TRIBE_STEPS = [
  { count: 2, bonus: 0.1 },
  { count: 3, bonus: 0.25 },
  { count: 5, bonus: 0.6 },
];

// 광부 1명이 1초에 광석에 주는 피해 (등급별). 탭이 주력이고 광부는 보조예요.
const RARITY_RATE = [0.2, 1, 5, 24, 120, 600, 3000, 16000, 80000];
// look: hair(머리색) style(머리 모양) outfit(옷) accent(포인트) eyes(눈) extra(장식)
const worker = (id, name, rarity, tribe, variant, look) => ({
  id,
  name,
  rarity,
  tribe,
  rate: RARITY_RATE[rarity] * [1, 1.15, 1.3][variant],
  look,
});

export const WORKERS = [
  worker("apprentice", "견습생 하나", 0, "human", 0, { hair: "#6d4c41", style: "ponytail", outfit: "#8d6e63", accent: "#ffc107", eyes: "#5d4037", extra: "helmet" }),
  worker("porter", "짐꾼 소라", 0, "human", 1, { hair: "#212121", style: "bob", outfit: "#689f38", accent: "#a1887f", eyes: "#3e2723", extra: "helmet" }),
  worker("pebble", "조약돌 리코", 0, "golem", 2, { hair: "#9e9e9e", style: "twin", outfit: "#757575", accent: "#bdbdbd", eyes: "#455a64", extra: "golem" }),
  worker("carter", "수레꾼 유이", 1, "human", 0, { hair: "#ff8a65", style: "twin", outfit: "#00897b", accent: "#ffb74d", eyes: "#4e342e", extra: "helmet" }),
  worker("dwarfling", "꼬마 드워프 미미", 1, "dwarf", 1, { hair: "#d84315", style: "bun", outfit: "#795548", accent: "#81c784", eyes: "#2e7d32", extra: "goggles" }),
  worker("firefly", "반딧불 루미", 1, "spirit", 2, { hair: "#c5e1a5", style: "long", outfit: "#aed581", accent: "#fff59d", eyes: "#558b2f", skin: "#f7ffe8", extra: "spirit" }),
  worker("veteran", "베테랑 카나", 2, "human", 0, { hair: "#283593", style: "long", outfit: "#1e88e5", accent: "#4fc3f7", eyes: "#1a237e", extra: "helmet" }),
  worker("blaster", "폭파 담당 레나", 2, "human", 1, { hair: "#e53935", style: "ponytail", outfit: "#424242", accent: "#ff7043", eyes: "#b71c1c", extra: "helmet dynamite" }),
  worker("irongolem", "강철 기사 아이", 2, "golem", 2, { hair: "#90a4ae", style: "bob", outfit: "#546e7a", accent: "#4fc3f7", eyes: "#0277bd", extra: "golem" }),
  worker("dwarf", "장인 브리엘", 3, "dwarf", 0, { hair: "#ff7043", style: "braid", outfit: "#6d4c41", accent: "#b388ff", eyes: "#6a1b9a", extra: "goggles" }),
  worker("wizard", "광산 마녀 세라", 3, "spirit", 1, { hair: "#7e57c2", style: "long", outfit: "#5e35b1", accent: "#b388ff", eyes: "#4527a0", extra: "wizard" }),
  worker("wyrmling", "새끼 용 아리", 3, "dragon", 2, { hair: "#66bb6a", style: "bob", outfit: "#2e7d32", accent: "#b388ff", eyes: "#f9a825", extra: "horns tail" }),
  worker("golem", "황금 수호자 골디", 4, "golem", 0, { hair: "#ffd54a", style: "twin", outfit: "#f9a825", accent: "#ffd54a", eyes: "#e65100", extra: "golem crown" }),
  worker("dragonslayer", "용사냥꾼 시온", 4, "dragon", 1, { hair: "#b71c1c", style: "ponytail", outfit: "#880e4f", accent: "#ffd54a", eyes: "#ffb300", extra: "horns tail" }),
  worker("dwarfking", "드워프 공주 힐데", 4, "dwarf", 2, { hair: "#ffb300", style: "braid", outfit: "#4e342e", accent: "#ffd54a", eyes: "#5d4037", extra: "goggles crown" }),
  worker("spirit", "대지의 무녀 가이아", 5, "spirit", 0, { hair: "#26c6da", style: "long", outfit: "#00838f", accent: "#ff5c8a", eyes: "#ff5c8a", skin: "#eafcff", extra: "spirit" }),
  worker("drake", "화염룡 이그니", 5, "dragon", 1, { hair: "#ff7043", style: "twin", outfit: "#bf360c", accent: "#ff5c8a", eyes: "#ffeb3b", extra: "horns tail" }),
  worker("mithril", "미스릴 메이", 5, "golem", 2, { hair: "#e3f2fd", style: "long", outfit: "#90caf9", accent: "#ff5c8a", eyes: "#1565c0", extra: "golem" }),
  worker("starminer", "별빛 광부 스텔라", 6, "human", 0, { hair: "#fff176", style: "twin", outfit: "#283593", accent: "#ff8a3d", eyes: "#3949ab", extra: "helmet cape" }),
  worker("runesmith", "룬 대장장이 루나", 6, "dwarf", 1, { hair: "#ce93d8", style: "bun", outfit: "#3e2723", accent: "#ff8a3d", eyes: "#7b1fa2", extra: "goggles cape" }),
  worker("storm", "폭풍의 실프", 6, "spirit", 2, { hair: "#9fa8da", style: "long", outfit: "#5c6bc0", accent: "#ff8a3d", eyes: "#1a237e", skin: "#f0f2ff", extra: "spirit" }),
  worker("elder", "고룡 아우라", 7, "dragon", 0, { hair: "#e1bee7", style: "long", outfit: "#4a148c", accent: "#e8eaff", eyes: "#ab47bc", extra: "horns tail cape" }),
  worker("eternal", "영원의 에테르", 7, "golem", 1, { hair: "#fafafa", style: "twin", outfit: "#eceff1", accent: "#e8eaff", eyes: "#78909c", extra: "golem cape" }),
  worker("dwarfgod", "대장간 여신 헤스티", 7, "dwarf", 2, { hair: "#ff6f00", style: "braid", outfit: "#fff8e1", accent: "#e8eaff", eyes: "#e65100", extra: "goggles halo" }),
  worker("genesis", "창세의 아마테", 8, "human", 0, { hair: "#fffde7", style: "long", outfit: "#0d1b4a", accent: "#7ef9ff", eyes: "#00bcd4", extra: "helmet halo cape" }),
  worker("primal", "태초의 엘리시아", 8, "spirit", 1, { hair: "#b2fbff", style: "twin", outfit: "#ffffff", accent: "#7ef9ff", eyes: "#00acc1", skin: "#f2feff", extra: "spirit halo" }),
  worker("cosmic", "우주룡 코스모", 8, "dragon", 2, { hair: "#7c4dff", style: "long", outfit: "#1a0033", accent: "#7ef9ff", eyes: "#ffd54a", extra: "horns tail halo" }),
];

// 특정 광부를 함께 가지고 있으면 발동하는 조합 시너지
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
  worker: "광부 효율",
  drop: "부산물 드롭",
  crit: "치명타 피해",
};

// ---------- 광부 뽑기 (가격 고정) ----------
export const TICKETS = [
  { id: "bronze", name: "동 티켓", cost: 500, color: "#e0975a", odds: [70, 25, 5, 0, 0, 0, 0, 0, 0] },
  { id: "silver", name: "은 티켓", cost: 25000, color: "#dfe7ee", odds: [35, 35, 22, 7, 1, 0, 0, 0, 0] },
  { id: "gold", name: "금 티켓", cost: 1.2e6, color: "#ffd54a", odds: [10, 25, 30, 22, 10, 3, 0, 0, 0] },
  { id: "diamond", name: "다이아 티켓", cost: 6e7, color: "#7ef9ff", odds: [0, 5, 20, 30, 28, 12, 4, 1, 0] },
  { id: "primal", name: "태초 티켓", cost: 4e9, color: "#ff6ad5", odds: [0, 0, 0, 10, 30, 30, 18, 9, 3] },
];
// 천장: 금 이상 티켓을 50번 뽑는 동안 전설이 안 나오면 50번째는 전설 이상 확정
export const PITY = { tickets: ["gold", "diamond", "primal"], limit: 50, rarity: 4 };
// 합성: 같은 등급 3개 → 성공 +1등급, 대성공 +2등급, 실패 시 1개만 돌려받음
export const MERGE = { count: 3, great: 0.06, success: (rarity) => Math.max(0.15, 0.75 - rarity * 0.07) };
export const AD_TICKET = { ticket: "silver", perDay: 3 };

// ---------- 장비 (Lv.0~1000, 100레벨마다 재질이 바뀜) ----------
export const MAX_LEVEL = 1000;
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
  { id: "pickaxe", name: "곡괭이", base: 10 },
  { id: "helmet", name: "헬멧", base: 40 },
  { id: "gloves", name: "장갑", base: 50 },
  { id: "shirt", name: "작업복", base: 60 },
  { id: "pants", name: "작업 바지", base: 45 },
  { id: "boots", name: "안전화", base: 40 },
];
// 비용 = base × 1.04^Lv × (Lv+1)
export const EQUIP_GROWTH = 1.04;
// 세트: 모든 장비가 Lv.10, 20, … 이상이면 단계마다 골드 +5%, 치명타 확률 +0.25%
export const SET_BONUS = { gold: 0.05, critChance: 0.0025 };

// ---------- 광석과 보스 ----------
// 탭은 피해 × 3배, 광부는 피해 × 1배만큼 골드를 줘요.
export const TAP_GOLD = 3;
export const WORKER_GOLD = 1;
export const BREAK_BONUS = 3;
// 광석 15종 × 레벨 10 = 150단계. 가장 높은 단계를 5번 부수면 다음 레벨이 열리고,
// 각 광석의 Lv.10을 5번 부수면 보스에 도전할 수 있어요. 보스는 탭으로만 잡아요.
export const ORE_LEVELS = 10;
export const STAGE_BREAKS = 5;
export const BOSS = { breaksNeeded: 5, hpMult: 25, seconds: 30, rewardMult: 8 };
const ore = (id, name, faces, vein, bg) => ({ id, name, faces, vein, bg });
export const ORES = [
  ore("stone", "돌", ["#6b5b7b", "#8f7fa6", "#574a66", "#463b55", "#7a6a90"], ["#f5f5f5", "#bdbdbd", "#8d8d8d"], ["#4a3466", "#2a1d3d", "#140d1f"]),
  ore("copper", "구리", ["#6d4c41", "#8d6e63", "#5d4037", "#4e342e", "#795548"], ["#ffd0b0", "#e07a4a", "#a14a20"], ["#5a3426", "#2e1a12", "#140a06"]),
  ore("tin", "주석", ["#7b8a8f", "#9fb0b5", "#66767b", "#55636a", "#8a9ba0"], ["#ffffff", "#dfe6e8", "#a7b5b9"], ["#3c4a50", "#1f282c", "#0c1214"]),
  ore("iron", "철", ["#546e7a", "#78909c", "#455a64", "#37474f", "#607d8b"], ["#ffffff", "#cfd8dc", "#90a4ae"], ["#2f4550", "#18242b", "#0a1014"]),
  ore("nickel", "니켈", ["#6f6a5f", "#938c7c", "#5b574e", "#4a4740", "#7f796c"], ["#fffef5", "#d8d2b8", "#9e977c"], ["#45412f", "#24221a", "#0f0e0a"]),
  ore("silver", "은", ["#5c6b7a", "#8193a6", "#4a5866", "#3b4652", "#6e7f91"], ["#ffffff", "#e3eaf2", "#a9b8c8"], ["#3a4a66", "#1d2638", "#0c1018"]),
  ore("gold", "금", ["#7a5c3a", "#a07a4a", "#5e4529", "#4a361f", "#8c6a40"], ["#fffbe0", "#ffd54a", "#e09b00"], ["#5a4020", "#2e2010", "#140d08"]),
  ore("platinum", "백금", ["#8a8fa3", "#b3b8cc", "#737889", "#5f6372", "#9da2b5"], ["#ffffff", "#eef1ff", "#b9c0de"], ["#4a4f6e", "#262a40", "#0e1020"]),
  ore("ruby", "루비", ["#6a2c3a", "#8e3e52", "#55222e", "#431a24", "#7a3446"], ["#ffd0dc", "#ff3d6e", "#b0103a"], ["#5e1f2e", "#300f18", "#14050a"]),
  ore("sapphire", "사파이어", ["#2e4870", "#4a6fa8", "#223858", "#1a2c46", "#3b5a8a"], ["#e0f0ff", "#4fa3ff", "#1a5fd0"], ["#1f3a6e", "#132340", "#081020"]),
  ore("emerald", "에메랄드", ["#2e5a46", "#447f63", "#234837", "#1a382a", "#386d54"], ["#e0ffe8", "#3ddc84", "#0f8a4a"], ["#1f5a3e", "#123522", "#06140c"]),
  ore("diamond", "다이아몬드", ["#3b5a8a", "#5a82c0", "#2e4870", "#223858", "#4a6fa8"], ["#ffffff", "#7ef9ff", "#2bb7d6"], ["#1f4a6e", "#13283d", "#081420"]),
  ore("mithril", "미스릴", ["#3d6e7a", "#5c97a5", "#305963", "#254750", "#4b8290"], ["#f0ffff", "#9ff3ff", "#3fc9e0"], ["#1e5560", "#113038", "#061418"]),
  ore("orichalcum", "오리하르콘", ["#7a4a20", "#a86a30", "#5e3818", "#4a2c12", "#8f5a28"], ["#fff0d0", "#ff9e40", "#d0601a"], ["#5e3510", "#301b08", "#140b03"]),
  ore("meteor", "운석", ["#5a2a24", "#8a3a2a", "#46201b", "#381814", "#7a3424"], ["#fff2c0", "#ff8a3d", "#e0301a"], ["#5e1f14", "#300f0a", "#140504"]),
];
// 단계 s(0~149)의 HP와 골드 배율: 단계마다 HP ×1.2, 골드 ×1.028
export const STAGE_HP = { base: 20, growth: 1.2 };
export const STAGE_MULT_GROWTH = 1.028;

// ---------- 부산물 시장 ----------
// 모든 부산물은 같은 가격에서 시작하고, 어느 광석에서든 랜덤으로 나와요.
// 20분마다 많이 팔린 건 싸지고 덜 팔린 건 비싸져요.
export const BYPRODUCT_PRICE = 100;
export const BYPRODUCTS = [
  { id: "coal", name: "석탄", color: "#5d5d5d" },
  { id: "clay", name: "점토", color: "#bc8a5f" },
  { id: "mica", name: "운모", color: "#c7d3dc" },
  { id: "sulfur", name: "유황", color: "#fdd835" },
  { id: "fossil", name: "화석", color: "#d7ccc8" },
  { id: "quartz", name: "석영", color: "#e0f7fa" },
  { id: "amber", name: "호박", color: "#ffb300" },
  { id: "obsidian", name: "흑요석", color: "#4527a0" },
];

// ---------- 장신구 (환생석으로 뽑기, 환생해도 유지) ----------
export const CHARM_SLOTS = 3;
export const CHARM_CAP = 100;
export const CHARM_GACHA = { cost: 3, odds: [50, 27, 13, 6, 2.5, 1, 0.4, 0.09, 0.01] };
export const CHARM_MERGE = { count: 3, great: 0.05, success: (rarity) => Math.max(0.2, 0.8 - rarity * 0.08) };
export const CHARM_TYPES = [
  { id: "clover", name: "행운의 부적", stat: "drop", base: 0.05 },
  { id: "ring", name: "황금 반지", stat: "gold", base: 0.05 },
  { id: "necklace", name: "광부의 목걸이", stat: "worker", base: 0.06 },
  { id: "earring", name: "매의 귀걸이", stat: "critChance", base: 0.008 },
  { id: "bracelet", name: "분노의 팔찌", stat: "critDmg", base: 0.25 },
  { id: "feather", name: "폭풍의 깃털", stat: "rush", base: 0.5 },
];

// ---------- 환생 (골드로 바로 환생, 갈수록 비싸짐) ----------
// 비용 = base × growth^(환생 횟수), 받는 환생석 = 3 + 환생 횟수, 환생 1번마다 골드 +25% 영구
export const PRESTIGE = { base: 1e8, growth: 8, stonesBase: 3, bonus: 0.25 };

// ---------- 기타 ----------
export const RUSH = { perTap: 0.05, decay: 0.12, duration: 10, tapMult: 5, rateMult: 3 };
export const MAX_OFFLINE_SEC = 8 * 60 * 60;
export const BAT = { minGap: 40000, maxGap: 90000, flight: 7000 };
export const QUESTS = [
  { id: "breaks", name: "광석 10번 부수기", goal: 10 },
  { id: "pulls", name: "광부 10명 뽑기", goal: 10 },
  { id: "rushes", name: "골드 러시 2번 발동", goal: 2 },
];
