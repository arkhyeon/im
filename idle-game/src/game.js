import {
  BOSS,
  BREAK_BONUS,
  BYPRODUCTS,
  CHARM_CAP,
  CHARM_GACHA,
  CHARM_SLOTS,
  CHARM_TYPES,
  COMBOS,
  EQUIPMENT,
  EQUIP_GROWTH,
  MATERIALS,
  MAX_LEVEL,
  ORE_LEVELS,
  ORES,
  PICKAXE_STEP,
  PRESTIGE,
  QUESTS,
  RARITIES,
  RUSH,
  SET_BONUS,
  STAGE_BREAKS,
  STAGE_HP,
  STAGE_MULT_GROWTH,
  TREASURE,
  TRIBES,
  TRIBE_STEPS,
  WORKER_GOLD,
  WORKERS,
} from "./data";

const UNITS = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
export const fmt = (n, decimals = 0) => {
  if (!Number.isFinite(n)) return "∞";
  let i = 0;
  while (n >= 1000 && i < UNITS.length - 1) {
    n /= 1000;
    i++;
  }
  if (n >= 1000) return n.toExponential(2).replace("+", "") + UNITS[i];
  if (i > 0) return n.toFixed(2) + UNITS[i];
  return decimals ? String(parseFloat(n.toFixed(decimals))) : Math.floor(n).toString();
};

export const pct = (v) => `${parseFloat((v * 100).toFixed(2))}%`;

// ---------- 장비 ----------
export const materialIndexOf = (level) => Math.min(MATERIALS.length - 1, Math.floor(Math.max(level - 1, 0) / 100));
export const materialOf = (level) => MATERIALS[materialIndexOf(level)];
// 같은 재질 안에서 10레벨마다 +1 강화 표시
export const plusOf = (level) => (level ? Math.floor(((level - 1) % 100) / 10) : 0);
export const equipNameOf = (slot, level) =>
  level ? `${materialOf(level).name} ${slot.name}${plusOf(level) ? ` +${plusOf(level)}` : ""}` : `기본 ${slot.name}`;
export const equipCostOf = (slot, level) => Math.floor(slot.base * EQUIP_GROWTH ** level * (level + 1));
export const pickaxeDamageOf = (level) => (1 + level) * PICKAXE_STEP ** Math.floor(level / 10);
export const setTierOf = (equip) => Math.floor(Math.min(...EQUIPMENT.map((e) => equip[e.id])) / 10);

// 지금 골드로 연속해서 올릴 수 있는 레벨 수와 총 비용
export const maxBuyOf = (slot, level, gold) => {
  let count = 0;
  let cost = 0;
  while (level + count < MAX_LEVEL) {
    const next = equipCostOf(slot, level + count);
    if (cost + next > gold) break;
    cost += next;
    count++;
  }
  return { count, cost };
};

export const equipEffectText = (slotId, level) => {
  switch (slotId) {
    case "pickaxe":
      return `탭 피해 ${fmt(pickaxeDamageOf(level))}`;
    case "helmet":
      return `치명타 확률 ${pct(level * 0.0004)}`;
    case "gloves":
      return `치명타 피해 x${(2 + level * 0.02).toFixed(2)}`;
    case "shirt":
      return `광부 효율 +${level}%`;
    case "pants":
      return `골드 러시 +${(level * 0.01).toFixed(2)}초 · 탭 x${(RUSH.tapMult + level * 0.005).toFixed(2)}`;
    default:
      return `파괴 보너스 +${level * 2}% · 드롭 +${(level * 0.1).toFixed(1)}%`;
  }
};

// ---------- 광부 ----------
export const workerById = (id) => WORKERS.find((w) => w.id === id);
export const workerRateOf = (workers) => WORKERS.reduce((sum, w) => sum + w.rate * (workers?.[w.id] || 0), 0);

export const tribeStatusOf = (workers) =>
  Object.entries(TRIBES).map(([id, tribe]) => {
    const members = WORKERS.filter((w) => w.tribe === id);
    const owned = members.filter((w) => workers[w.id]).length;
    const step = [...TRIBE_STEPS].reverse().find((s) => owned >= s.count);
    return { id, ...tribe, members, owned, bonus: step?.bonus || 0 };
  });

export const comboStatusOf = (workers) => COMBOS.map((c) => ({ ...c, active: c.members.every((m) => workers[m]) }));

// ---------- 장신구 ----------
export const charmTypeOf = (charm) => CHARM_TYPES.find((t) => t.id === charm.type);
export const charmText = (charm) => {
  const { stat } = charmTypeOf(charm);
  if (stat === "critChance") return `치명타 확률 +${pct(charm.value)}`;
  if (stat === "critDmg") return `치명타 피해 +${charm.value.toFixed(2)}`;
  if (stat === "rush") return `골드 러시 +${charm.value.toFixed(1)}초`;
  return `${{ drop: "부산물 드롭", gold: "골드 획득", worker: "광부 효율" }[stat]} +${pct(charm.value)}`;
};
export const charmSellOf = (rarity) => 1000 * 4 ** rarity;

export const makeCharm = (typeId, rarity, roll) => {
  const type = CHARM_TYPES.find((t) => t.id === typeId);
  return {
    uid: Math.floor(roll() * 2 ** 40).toString(36) + Date.now().toString(36),
    type: type.id,
    rarity,
    value: type.base * (1 + rarity * 0.8) * (0.8 + roll() * 0.4),
  };
};

export const rollCharm = (roll) => {
  let pick = roll() * 100;
  let rarity = 0;
  while (rarity < CHARM_GACHA.odds.length - 1 && pick >= CHARM_GACHA.odds[rarity]) pick -= CHARM_GACHA.odds[rarity++];
  return makeCharm(CHARM_TYPES[Math.floor(roll() * CHARM_TYPES.length)].id, rarity, roll);
};

// 장착하지 않은 같은 등급 장신구 중 수치가 낮은 것부터 재료로
export const pickCharmMaterials = (g, rarity, count) => {
  const pool = g.charms.filter((c) => c.rarity === rarity && !g.equipped.includes(c.uid)).sort((a, b) => a.value - b.value);
  return pool.length >= count ? pool.slice(0, count) : null;
};

// ---------- 능력치 합산 ----------
export const prestigeMult = (prestiges) => 1 + prestiges * PRESTIGE.bonus;
export const prestigeCostOf = (prestiges) => PRESTIGE.base * PRESTIGE.growth ** prestiges;
export const stonesFor = (prestiges) => PRESTIGE.stonesBase + prestiges;

export const statsOf = (g) => {
  const bonus = { gold: 0, tap: 0, worker: 0, drop: 0, crit: 0 };
  tribeStatusOf(g.workers).forEach((t) => (bonus[t.effect] += t.bonus));
  comboStatusOf(g.workers).forEach((c) => c.active && (bonus[c.effect] += c.bonus));
  const charm = { gold: 0, worker: 0, drop: 0, critChance: 0, critDmg: 0, rush: 0 };
  g.equipped.forEach((uid) => {
    const c = g.charms.find((item) => item.uid === uid);
    if (c) charm[charmTypeOf(c).stat] += c.value;
  });
  const e = g.equip;
  const setTier = setTierOf(e);
  return {
    setTier,
    goldMult: prestigeMult(g.prestiges) * (1 + bonus.gold + charm.gold) * (1 + SET_BONUS.gold * setTier),
    tapDamage: pickaxeDamageOf(e.pickaxe) * (1 + bonus.tap),
    critChance: Math.min(0.75, e.helmet * 0.0004 + charm.critChance + SET_BONUS.critChance * setTier),
    critMult: (2 + e.gloves * 0.02) * (1 + bonus.crit) + charm.critDmg,
    workerPower: workerRateOf(g.workers) * (1 + e.shirt * 0.01) * (1 + bonus.worker + charm.worker),
    rushDuration: RUSH.duration + e.pants * 0.01 + charm.rush,
    rushTapMult: RUSH.tapMult + e.pants * 0.005,
    breakMult: 1 + e.boots * 0.02,
    dropMult: 1 + e.boots * 0.001 + bonus.drop + charm.drop,
    bonus,
    charm,
  };
};

// ---------- 광석 단계 · 보스 ----------
// 단계 s = 광석 번호 × 10 + (레벨 - 1). 0 = 돌 Lv.1, 149 = 운석 Lv.10
export const STAGE_COUNT = ORES.length * ORE_LEVELS;
export const stageOf = (s) => ({
  index: s,
  ore: ORES[Math.floor(s / ORE_LEVELS)],
  oreIndex: Math.floor(s / ORE_LEVELS),
  level: (s % ORE_LEVELS) + 1,
  hp: Math.round(STAGE_HP.base * STAGE_HP.growth ** s),
  mult: STAGE_MULT_GROWTH ** s,
});
export const stageNameOf = (s) => `${stageOf(s).ore.name} Lv.${stageOf(s).level}`;
export const isBossGate = (s) => s % ORE_LEVELS === ORE_LEVELS - 1;
export const canChallengeBoss = (g) =>
  g.stageLevel < STAGE_COUNT - 1 && isBossGate(g.stageLevel) && g.stage === g.stageLevel && g.stageBreaks >= BOSS.breaksNeeded;
export const bossHpOf = (stageLevel) => stageOf(stageLevel).hp * BOSS.hpMult;
export const incomeOf = (g, st = statsOf(g)) => st.workerPower * stageOf(g.stage).mult * st.goldMult * WORKER_GOLD;
// 지금 캐는 광석의 HP (보물 광석이면 3배)
export const oreHpOf = (g) => stageOf(g.stage).hp * (g.treasure ? TREASURE.hpMult : 1);

export const addGold = (g, amount) => ({
  ...g,
  gold: g.gold + amount,
  totalEarned: g.totalEarned + amount,
  runEarned: g.runEarned + amount,
});

// 피해를 주고 골드·파괴 보상·부산물을 계산. rolls는 미리 뽑아 둔 난수 (state 업데이트를 순수하게 유지)
export const applyDamage = (g, damage, st, rolls, goldFactor) => {
  const stage = stageOf(g.stage);
  const hp = oreHpOf(g);
  let next = addGold(g, damage * stage.mult * st.goldMult * goldFactor);
  const total = g.oreDamage + damage;
  // 보물 광석은 한 번에 하나만 부서지고 남는 피해는 버려요
  const breaks = g.treasure ? Math.min(1, Math.floor(total / hp)) : Math.floor(total / hp);
  next.oreDamage = g.treasure && breaks ? 0 : total - breaks * hp;
  if (!breaks) return next;

  let r = 0;
  const roll = () => rolls[r++ % rolls.length];
  const treasure = Boolean(g.treasure);
  const bonus = breaks * stage.hp * stage.mult * BREAK_BONUS * st.breakMult * st.goldMult * (treasure ? TREASURE.bonusMult : 1);
  next = addGold(next, bonus);
  next.treasure = roll() < TREASURE.chance;

  // 부산물은 어느 광석에서든 8종 중 랜덤, 높은 단계일수록 많이
  const scale = 1.03 ** g.stage * st.dropMult * (treasure ? TREASURE.itemMult : 1);
  const items = {};
  const rolled = Math.min(breaks, 20);
  for (let i = 0; i < rolled; i++) {
    const id = BYPRODUCTS[Math.floor(roll() * BYPRODUCTS.length)].id;
    items[id] = (items[id] || 0) + Math.max(1, Math.round((1 + Math.floor(roll() * 3)) * scale));
  }
  if (breaks > rolled) {
    const extra = Math.max(1, Math.round(((breaks - rolled) * 2 * scale) / BYPRODUCTS.length));
    BYPRODUCTS.forEach((b) => (items[b.id] = (items[b.id] || 0) + extra));
  }
  const byproducts = { ...next.byproducts };
  Object.entries(items).forEach(([id, n]) => (byproducts[id] = (byproducts[id] || 0) + n));
  next.byproducts = byproducts;
  next.oreBreaks = { ...next.oreBreaks, [stage.ore.id]: (next.oreBreaks[stage.ore.id] || 0) + breaks };

  // 가장 높은 단계를 5번 부수면 다음 레벨이 열리고 자동으로 넘어가요 (Lv.10은 보스가 막고 있어요)
  let unlocked = null;
  if (g.stage === g.stageLevel) {
    const stageBreaks = g.stageBreaks + breaks;
    if (!isBossGate(g.stageLevel) && stageBreaks >= STAGE_BREAKS) {
      next.stageLevel = g.stageLevel + 1;
      next.stage = next.stageLevel;
      next.stageBreaks = 0;
      next.oreDamage = 0;
      unlocked = next.stageLevel;
    } else {
      next.stageBreaks = stageBreaks;
    }
  }
  next = bumpDaily(next, "breaks", breaks);
  if (unlocked !== null) next.treasure = false;
  next.lastBreak = { seq: (g.lastBreak?.seq || 0) + 1, stage: g.stage, breaks, bonus, items, unlocked, treasure, newTreasure: Boolean(next.treasure) };
  return next;
};

// ---------- 뽑기 · 합성 ----------
export const pickWorker = (rarity, rand = Math.random) => {
  const pool = WORKERS.filter((w) => w.rarity === rarity);
  return pool[Math.floor(rand() * pool.length)];
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

export const rarityCountOf = (workers, rarity) =>
  WORKERS.filter((w) => w.rarity === rarity).reduce((sum, w) => sum + (workers[w.id] || 0), 0);

// 같은 등급 광부 count명을 재료로 고름 (많이 가진 광부부터)
export const pickMergeMaterials = (workers, rarity, count) => {
  const left = { ...workers };
  const used = [];
  for (let i = 0; i < count; i++) {
    const best = WORKERS.filter((w) => w.rarity === rarity && left[w.id] > 0).sort((a, b) => left[b.id] - left[a.id])[0];
    if (!best) return null;
    used.push(best);
    left[best.id] -= 1;
  }
  return used;
};

// 합성 결과: great(+2등급) / success(+1등급) / fail
export const rollMergeOutcome = (config, rarity, rand = Math.random) => {
  const r = rand();
  if (r < config.great && rarity + 2 < RARITIES.length) return "great";
  if (r < config.great + config.success(rarity)) return "success";
  return "fail";
};

// ---------- 하루 단위 기록 ----------
export const todayKey = (date = new Date()) => date.toLocaleDateString("sv-SE");
export const yesterdayKey = () => todayKey(new Date(Date.now() - 864e5));
export const freshDaily = () => ({ day: todayKey(), breaks: 0, pulls: 0, rushes: 0, ads: 0, claimed: QUESTS.map(() => false) });
export const dailyOf = (daily) => (daily?.day === todayKey() ? daily : freshDaily());
export const bumpDaily = (g, field, amount = 1) => {
  const daily = dailyOf(g.daily);
  return { ...g, daily: { ...daily, [field]: (daily[field] || 0) + amount } };
};
export const questRewardOf = (g) => Math.max(1000, incomeOf(g) * 300);
export const attendanceRewardOf = (g, day) => Math.max(500 * day, incomeOf(g) * 200 * day);
export const nextStreakOf = (attendance) => (attendance.last === yesterdayKey() ? (attendance.streak % 7) + 1 : 1);

// ---------- 저장 데이터 정리 ----------
const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
const counts = (obj, list) =>
  Object.fromEntries(list.map((item) => [item.id, Math.floor(num(obj?.[item.id]))]).filter(([, n]) => n > 0));

export const normalize = (saved) => {
  const s = saved || {};
  const equip = Object.fromEntries(
    EQUIPMENT.map((e) => [
      e.id,
      Math.min(MAX_LEVEL, Math.max(0, Math.floor(num(s.equip?.[e.id] ?? (e.id === "pickaxe" ? s.clickLevel : 0))))),
    ])
  );
  const charms = Array.isArray(s.charms)
    ? s.charms
        .filter((c) => c && typeof c.uid === "string" && CHARM_TYPES.some((t) => t.id === c.type))
        .slice(0, CHARM_CAP)
        .map((c) => ({ uid: c.uid, type: c.type, rarity: Math.min(RARITIES.length - 1, Math.floor(num(c.rarity))), value: num(c.value) }))
    : [];
  const oreBreaks = counts(s.oreBreaks, ORES);
  // 이전 버전(광석 10종 단위 해금) 저장은 그때 열린 광석의 Lv.1부터 시작
  const OLD_ORDER = ["stone", "copper", "iron", "silver", "gold", "ruby", "sapphire", "emerald", "diamond", "meteor"];
  let stageLevel;
  if (typeof s.stageLevel === "number") {
    stageLevel = Math.floor(num(s.stageLevel));
  } else {
    let oldLevel = typeof s.oreLevel === "number" ? Math.floor(num(s.oreLevel)) : 0;
    if (typeof s.oreLevel !== "number") while (oldLevel < 9 && (oreBreaks[OLD_ORDER[oldLevel]] || 0) >= 10) oldLevel++;
    stageLevel = ORES.findIndex((o) => o.id === OLD_ORDER[Math.min(oldLevel, 9)]) * ORE_LEVELS;
  }
  stageLevel = Math.min(STAGE_COUNT - 1, Math.max(0, stageLevel));
  const g = {
    nickname: typeof s.nickname === "string" ? s.nickname : "",
    gold: num(s.gold),
    totalEarned: Math.max(num(s.totalEarned), num(s.gold)),
    runEarned: num(s.runEarned),
    stones: Math.floor(num(s.stones)),
    prestiges: Math.floor(num(s.prestiges)),
    equip,
    workers: counts(s.workers, WORKERS),
    pity: Math.floor(num(s.pity)),
    stageLevel,
    stage: typeof s.stage === "number" ? Math.min(stageLevel, Math.max(0, Math.floor(num(s.stage)))) : stageLevel,
    stageBreaks: Math.floor(num(s.stageBreaks)),
    treasure: Boolean(s.treasure),
    oreDamage: typeof s.stage === "number" ? num(s.oreDamage) : 0,
    oreBreaks,
    byproducts: counts(s.byproducts, BYPRODUCTS),
    charms,
    equipped: Array.isArray(s.equipped) ? s.equipped.filter((uid) => charms.some((c) => c.uid === uid)).slice(0, CHARM_SLOTS) : [],
    daily:
      s.daily && typeof s.daily.day === "string"
        ? {
            day: s.daily.day,
            breaks: num(s.daily.breaks),
            pulls: num(s.daily.pulls),
            rushes: num(s.daily.rushes),
            ads: num(s.daily.ads),
            claimed: QUESTS.map((_, i) => Boolean(s.daily.claimed?.[i])),
          }
        : null,
    attendance: {
      last: typeof s.attendance?.last === "string" ? s.attendance.last : "",
      streak: Math.floor(num(s.attendance?.streak)),
    },
  };
  return g;
};

// 저장할 때 화면용 임시 값은 빼기
export const toSave = (g) => {
  const { lastBreak, ...rest } = g;
  return { ...rest, savedAt: Date.now() };
};

// 환생: 골드와 장비만 초기화하고 광부·장신구·광석 해금·부산물은 유지
export const rebirthOf = (g) => ({
  ...g,
  gold: 0,
  runEarned: 0,
  stones: g.stones + stonesFor(g.prestiges),
  prestiges: g.prestiges + 1,
  equip: Object.fromEntries(EQUIPMENT.map((e) => [e.id, 0])),
  oreDamage: 0,
});
