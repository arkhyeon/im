import {
  BREAK_BONUS,
  BREAKS_TO_UNLOCK,
  CHARM_CAP,
  CHARM_RARITY_WEIGHTS,
  CHARM_SLOTS,
  CHARM_TYPES,
  COMBOS,
  EQUIPMENT,
  EQUIP_GROWTH,
  MATERIALS,
  MAX_LEVEL,
  MERGE,
  ORES,
  PRESTIGE_UNIT,
  QUESTS,
  RARITIES,
  RUSH,
  SET_BONUS,
  TICKETS,
  TICKET_GROWTH,
  TRIBES,
  TRIBE_STEPS,
  WORKERS,
} from "./data";

export const fmt = (n, decimals = 0) => {
  const units = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp"];
  let i = 0;
  while (n >= 1000 && i < units.length - 1) {
    n /= 1000;
    i++;
  }
  if (i > 0) return n.toFixed(2) + units[i];
  return decimals ? String(parseFloat(n.toFixed(decimals))) : Math.floor(n).toString();
};

export const pct = (v) => `${parseFloat((v * 100).toFixed(1))}%`;

// ---------- 장비 ----------
export const materialOf = (level) => MATERIALS[Math.min(Math.max(level - 1, 0), MAX_LEVEL - 1) / 10 | 0];
export const equipCostOf = (slot, level) => Math.floor(slot.base * EQUIP_GROWTH ** level);
export const pickaxeDamageOf = (level) => (1 + level) * 2 ** Math.floor(level / 10);
export const setTierOf = (equip) => Math.floor(Math.min(...EQUIPMENT.map((e) => equip[e.id])) / 10);

export const equipEffectText = (slotId, level) => {
  switch (slotId) {
    case "pickaxe":
      return `탭 피해 ${fmt(pickaxeDamageOf(level))}`;
    case "helmet":
      return `치명타 확률 ${pct(level * 0.004)}`;
    case "gloves":
      return `치명타 피해 x${(2 + level * 0.08).toFixed(2)}`;
    case "shirt":
      return `일꾼 효율 +${level * 3}%`;
    case "pants":
      return `골드 러시 +${(level * 0.1).toFixed(1)}초 · 탭 x${(RUSH.tapMult + level * 0.03).toFixed(2)}`;
    default:
      return `파괴 보너스 +${level * 5}% · 드롭률 +${level}%`;
  }
};

// ---------- 일꾼 ----------
export const workerById = (id) => WORKERS.find((w) => w.id === id);
export const workerRateOf = (workers) => WORKERS.reduce((sum, w) => sum + w.rate * (workers?.[w.id] || 0), 0);

export const tribeStatusOf = (workers) =>
  Object.entries(TRIBES).map(([id, tribe]) => {
    const members = WORKERS.filter((w) => w.tribe === id);
    const owned = members.filter((w) => workers[w.id]).length;
    const step = [...TRIBE_STEPS].reverse().find((s) => owned >= s.count);
    return { id, ...tribe, members, owned, bonus: step?.bonus || 0 };
  });

export const comboStatusOf = (workers) =>
  COMBOS.map((c) => ({ ...c, active: c.members.every((m) => workers[m]) }));

// ---------- 장신구 ----------
export const charmTypeOf = (charm) => CHARM_TYPES.find((t) => t.id === charm.type);
export const charmText = (charm) => {
  const { stat } = charmTypeOf(charm);
  if (stat === "critChance") return `치명타 확률 +${pct(charm.value)}`;
  if (stat === "critDmg") return `치명타 피해 +${charm.value.toFixed(2)}`;
  if (stat === "rush") return `골드 러시 +${charm.value.toFixed(1)}초`;
  return `${{ drop: "드롭률", gold: "골드 획득", worker: "일꾼 효율" }[stat]} +${pct(charm.value)}`;
};
export const charmChanceOf = (oreIndex) => 0.03 + oreIndex * 0.005;

export const rollCharm = (oreIndex, roll) => {
  const weights = CHARM_RARITY_WEIGHTS.map((w, r) => w * (1 + oreIndex * 0.4) ** r);
  let pick = roll() * weights.reduce((a, b) => a + b, 0);
  let rarity = 0;
  while (rarity < weights.length - 1 && pick >= weights[rarity]) pick -= weights[rarity++];
  const type = CHARM_TYPES[Math.floor(roll() * CHARM_TYPES.length)];
  const ore = ORES[oreIndex];
  return {
    uid: Math.floor(roll() * 2 ** 40).toString(36) + Date.now().toString(36),
    type: type.id,
    rarity,
    value: type.base * (1 + rarity * 0.8) * (0.8 + roll() * 0.4),
    sell: Math.round(ore.hp * ore.mult * (rarity + 1) * 2),
  };
};

// ---------- 능력치 합산 ----------
export const prestigeMult = (stones) => 1 + stones * 0.1;
export const stonesFor = (runEarned) => Math.floor(Math.sqrt(runEarned / PRESTIGE_UNIT));

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
    goldMult: prestigeMult(g.stones) * (1 + bonus.gold + charm.gold) * (1 + SET_BONUS.gold * setTier),
    tapDamage: pickaxeDamageOf(e.pickaxe) * (1 + bonus.tap),
    critChance: Math.min(0.75, e.helmet * 0.004 + charm.critChance + SET_BONUS.critChance * setTier),
    critMult: (2 + e.gloves * 0.08) * (1 + bonus.crit) + charm.critDmg,
    workerPower: workerRateOf(g.workers) * (1 + e.shirt * 0.03) * (1 + bonus.worker + charm.worker),
    rushDuration: RUSH.duration + e.pants * 0.1 + charm.rush,
    rushTapMult: RUSH.tapMult + e.pants * 0.03,
    breakMult: 1 + e.boots * 0.05,
    dropMult: 1 + e.boots * 0.01 + bonus.drop + charm.drop,
    bonus,
    charm,
  };
};

// ---------- 광석 ----------
export const oreIndexOf = (id) => Math.max(0, ORES.findIndex((o) => o.id === id));
export const isOreUnlocked = (g, index) => index === 0 || (g.oreBreaks[ORES[index - 1].id] || 0) >= BREAKS_TO_UNLOCK;
export const incomeOf = (g, st = statsOf(g)) => st.workerPower * ORES[oreIndexOf(g.ore)].mult * st.goldMult;

export const addGold = (g, amount) => ({
  ...g,
  gold: g.gold + amount,
  totalEarned: g.totalEarned + amount,
  runEarned: g.runEarned + amount,
});

// 피해를 주고 골드·파괴 보상·드롭을 계산. rolls는 미리 뽑아 둔 난수 (state 업데이트를 순수하게 유지)
export const applyDamage = (g, damage, st, rolls) => {
  const index = oreIndexOf(g.ore);
  const ore = ORES[index];
  let next = addGold(g, damage * ore.mult * st.goldMult);
  const total = g.oreDamage + damage;
  const breaks = Math.floor(total / ore.hp);
  next.oreDamage = total - breaks * ore.hp;
  if (!breaks) return next;

  let r = 0;
  const roll = () => rolls[r++ % rolls.length];
  const bonus = breaks * ore.hp * ore.mult * BREAK_BONUS * st.breakMult * st.goldMult;
  next = addGold(next, bonus);

  const rolled = Math.min(breaks, 20);
  let items = 0;
  const found = [];
  for (let i = 0; i < rolled; i++) {
    items += 1 + Math.floor(roll() * 3 * st.dropMult);
    if (roll() < charmChanceOf(index) * st.dropMult) found.push(rollCharm(index, roll));
  }
  if (breaks > rolled) items += Math.round((breaks - rolled) * 2 * st.dropMult);
  const charms = found.slice(0, Math.max(0, CHARM_CAP - g.charms.length));

  const before = g.oreBreaks[ore.id] || 0;
  const after = before + breaks;
  const unlocked = before < BREAKS_TO_UNLOCK && after >= BREAKS_TO_UNLOCK && ORES[index + 1] ? ORES[index + 1].id : null;

  next.oreItems = { ...next.oreItems, [ore.id]: (next.oreItems[ore.id] || 0) + items };
  next.charms = [...next.charms, ...charms];
  next.oreBreaks = { ...next.oreBreaks, [ore.id]: after };
  next = bumpDaily(next, "breaks", breaks);
  next.lastBreak = { seq: (g.lastBreak?.seq || 0) + 1, ore: ore.id, breaks, bonus, items, charms, unlocked };
  return next;
};

// ---------- 뽑기 · 합성 ----------
export const ticketCostOf = (ticket, pulls, times = 1) => {
  let total = 0;
  for (let k = 0; k < times; k++) total += Math.floor(ticket.cost * TICKET_GROWTH ** (pulls + k));
  return total;
};

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

// 같은 등급 일꾼 3명을 재료로 고름 (많이 가진 일꾼부터)
export const pickMergeMaterials = (workers, rarity) => {
  const left = { ...workers };
  const used = [];
  for (let i = 0; i < MERGE.count; i++) {
    const best = WORKERS.filter((w) => w.rarity === rarity && left[w.id] > 0).sort((a, b) => left[b.id] - left[a.id])[0];
    if (!best) return null;
    used.push(best);
    left[best.id] -= 1;
  }
  return used;
};

export const rollMerge = (rarity, rand = Math.random) => {
  const success = MERGE.success(rarity);
  const r = rand();
  if (r < MERGE.great && rarity + 2 < RARITIES.length) return { outcome: "great", result: pickWorker(rarity + 2, rand) };
  if (r < MERGE.great + success) return { outcome: "success", result: pickWorker(rarity + 1, rand) };
  return { outcome: "fail", result: null };
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
export const questRewardOf = (g) => Math.max(1000, incomeOf(g) * 900);
export const attendanceRewardOf = (g, day) => Math.max(500 * day, incomeOf(g) * 600 * day);
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
        .map((c) => ({ uid: c.uid, type: c.type, rarity: Math.floor(num(c.rarity)), value: num(c.value), sell: num(c.sell) }))
    : [];
  const g = {
    nickname: typeof s.nickname === "string" ? s.nickname : "",
    gold: num(s.gold),
    totalEarned: Math.max(num(s.totalEarned), num(s.gold)),
    runEarned: typeof s.runEarned === "number" ? num(s.runEarned) : num(s.totalEarned),
    stones: Math.floor(num(s.stones)),
    prestiges: Math.floor(num(s.prestiges)),
    equip,
    workers: counts(s.workers, WORKERS),
    pulls: counts(s.pulls, TICKETS),
    pity: Math.floor(num(s.pity)),
    ore: typeof s.ore === "string" ? s.ore : "stone",
    oreDamage: num(s.oreDamage),
    oreBreaks: counts(s.oreBreaks, ORES),
    oreItems: counts(s.oreItems, ORES),
    charms,
    equipped: Array.isArray(s.equipped)
      ? s.equipped.filter((uid) => charms.some((c) => c.uid === uid)).slice(0, CHARM_SLOTS)
      : [],
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
  const index = ORES.findIndex((o) => o.id === g.ore);
  if (index < 0 || !isOreUnlocked(g, index)) {
    g.ore = "stone";
    g.oreDamage = 0;
  }
  return g;
};

// 저장할 때 화면용 임시 값은 빼기
export const toSave = (g) => {
  const { lastBreak, ...rest } = g;
  return { ...rest, savedAt: Date.now() };
};

// 환생: 골드·장비·티켓 가격만 초기화하고 일꾼·장신구·광석·시세 아이템은 유지
export const rebirthOf = (g) => ({
  ...g,
  gold: 0,
  runEarned: 0,
  stones: g.stones + stonesFor(g.runEarned),
  prestiges: g.prestiges + 1,
  equip: Object.fromEntries(EQUIPMENT.map((e) => [e.id, 0])),
  pulls: {},
  oreDamage: 0,
});
