import { useEffect, useRef, useState } from "react";
import { firebaseEnabled, loadPlayer, login, logout, savePlayer, watchAuth, watchTop3 } from "./firebase";
import {
  AD_TICKET,
  BAT,
  BREAKS_TO_UNLOCK,
  CHARM_SLOTS,
  EQUIPMENT,
  MATERIALS,
  MAX_LEVEL,
  MAX_OFFLINE_SEC,
  MERGE,
  ORES,
  PITY,
  QUESTS,
  RARITIES,
  RUSH,
  TICKETS,
  WORKERS,
} from "./data";
import {
  applyDamage,
  attendanceRewardOf,
  bumpDaily,
  charmTypeOf,
  dailyOf,
  equipCostOf,
  fmt,
  incomeOf,
  isOreUnlocked,
  materialOf,
  nextStreakOf,
  normalize,
  oreIndexOf,
  pickMergeMaterials,
  pickWorker,
  prestigeMult,
  questRewardOf,
  rebirthOf,
  rollMerge,
  rollWorker,
  statsOf,
  stonesFor,
  ticketCostOf,
  toSave,
  todayKey,
  addGold,
} from "./game";
import { useMarket, BUY_SPREAD } from "./market";
import { BatIcon, CharmIcon, ChestIcon, CoinIcon, GoogleLogo, OreItemIcon, OreRock, Walker, WorkerIcon } from "./art";
import { CharmsPanel, EquipPanel, MarketPanel, MissionsPanel, PrestigePanel, WorkersPanel } from "./panels";

const MAX_WALKERS = 8;
const MEDALS = ["🥇", "🥈", "🥉"];
const AD_MS = 2000;
const TABS = [
  ["equip", "장비"],
  ["workers", "광부"],
  ["charms", "장신구"],
  ["market", "시장"],
  ["missions", "미션"],
  ["prestige", "환생"],
];

// 동굴 배경에 떠다니는 먼지, 골드 러시 때 쏟아지는 코인 위치
const DUST = Array.from({ length: 12 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  top: `${20 + ((i * 23) % 60)}%`,
  delay: `${(i * 0.7) % 6}s`,
}));
const RAIN = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i * 53) % 100}%`,
  delay: `${(i * 0.37) % 1.4}s`,
  duration: `${1.1 + (i % 4) * 0.25}s`,
}));
const BEAMS = Array.from({ length: 12 }, (_, i) => i * 30);

const localKey = (uid) => `ore-miner-save-${uid || "guest"}`;
const readLocal = (uid) => {
  try {
    return JSON.parse(localStorage.getItem(localKey(uid)));
  } catch {
    return null;
  }
};
const writeLocal = (uid, data) => {
  try {
    localStorage.setItem(localKey(uid), JSON.stringify(data));
  } catch {
    // 저장 공간이 막힌 브라우저에서는 그냥 넘어감
  }
};
const offlineSecSince = (time) => Math.min(Math.max((Date.now() - time) / 1000, 0), MAX_OFFLINE_SEC);
const randoms = (n = 48) => Array.from({ length: n }, Math.random);

export default function App() {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState(null);
  const [guest, setGuest] = useState(false);

  useEffect(
    () =>
      watchAuth((u) => {
        setUser(u);
        setAuthReady(true);
      }),
    []
  );

  if (!authReady) return <div className="splash">불러오는 중...</div>;
  if (user) return <Game key={user.uid} user={user} />;
  if (guest) return <Game key="guest" user={null} onExit={() => setGuest(false)} />;
  return <Login onGuest={() => setGuest(true)} />;
}

function Login({ onGuest }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setBusy(true);
    setError("");
    try {
      await login();
    } catch (e) {
      console.error(e);
      setError("로그인하지 못했어요. 팝업 차단을 풀고 다시 눌러 주세요.");
      setBusy(false);
    }
  };

  return (
    <div className="game login">
      <div className="login-art">
        <OreRock ore={ORES[4]} />
      </div>
      <h1 className="title">광석 캐기</h1>
      <p className="subtitle">광석을 부수고, 광부를 모으고, 시세를 읽어 랭킹 1위를 노려 보세요</p>
      {firebaseEnabled && (
        <button className="google-btn" onClick={handleLogin} disabled={busy}>
          <GoogleLogo />
          {busy ? "로그인 중..." : "Google로 로그인"}
        </button>
      )}
      <button className="guest-btn" onClick={onGuest}>
        게스트로 하기{firebaseEnabled ? " (랭킹·공용 시세 미참여)" : ""}
      </button>
      {!firebaseEnabled && <p className="note">Firebase 설정 전이라 게스트 모드로만 할 수 있어요.</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

function Game({ user, onExit }) {
  const uid = user?.uid ?? null;
  const market = useMarket(uid);
  const [loaded, setLoaded] = useState(false);
  const [game, setGame] = useState(() => normalize(null));
  const [offline, setOffline] = useState(0);
  const [askNickname, setAskNickname] = useState(false);
  const [top3, setTop3] = useState([]);
  const [rush, setRush] = useState({ gauge: 0, until: 0, duration: RUSH.duration });
  const [watchingAd, setWatchingAd] = useState(null);
  const [fx, setFx] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [hit, setHit] = useState(0);
  const [banner, setBanner] = useState(null);
  const [armReset, setArmReset] = useState(false);
  const [armPrestige, setArmPrestige] = useState(false);
  const [tab, setTab] = useState("equip");
  const [pullResult, setPullResult] = useState(null);
  const [mergeResult, setMergeResult] = useState(null);
  const [bat, setBat] = useState(null);

  const gameRef = useRef(game);
  gameRef.current = game;
  const rushRef = useRef(rush);
  rushRef.current = rush;
  const fxId = useRef(0);
  const sceneRef = useRef(null);
  const displayName = useRef(user?.displayName);
  const lastBreakSeq = useRef(0);
  const lastShatter = useRef(0);

  // 로컬 저장본과 서버 저장본 중 더 최근 것을 불러옴
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const local = readLocal(uid);
      let remote = null;
      if (uid) {
        try {
          remote = await loadPlayer(uid);
        } catch (e) {
          console.error("불러오기 실패", e);
        }
      }
      let saved = [local, remote].filter(Boolean).sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0))[0];
      if (uid && !saved) saved = readLocal(null); // 게스트로 하던 진행을 이어받기
      if (cancelled) return;
      const state = normalize(saved);
      if (uid && !state.nickname) {
        state.nickname = (displayName.current || "광부").slice(0, 12);
        setAskNickname(true);
      }
      setGame(state);
      if (saved?.savedAt) setOffline(incomeOf(state) * offlineSecSince(saved.savedAt));
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [uid]);

  useEffect(() => watchTop3(setTop3), []);

  // 0.1초마다 광부들이 광석에 피해를 줌 + 골드 러시 게이지 감소/종료
  useEffect(() => {
    let last = Date.now();
    const id = setInterval(() => {
      const now = Date.now();
      const dt = Math.min((now - last) / 1000, 1);
      last = now;
      const rushing = rushRef.current.until > now;
      const rolls = randoms();
      setGame((g) => {
        const st = statsOf(g);
        const damage = st.workerPower * (rushing ? RUSH.rateMult : 1) * dt;
        return damage > 0 ? applyDamage(g, damage, st, rolls) : g;
      });
      setRush((r) => {
        if (r.until) return r.until <= now ? { ...r, gauge: 0, until: 0 } : r;
        return r.gauge > 0 ? { ...r, gauge: Math.max(0, r.gauge - RUSH.decay * dt) } : r;
      });
    }, 100);
    return () => clearInterval(id);
  }, []);

  // 로컬은 5초마다, 서버는 30초마다 + 앱을 내릴 때 저장
  useEffect(() => {
    if (!loaded) return;
    let hiddenAt = null;
    const saveLocal = () => writeLocal(uid, toSave(gameRef.current));
    const saveRemote = () => {
      if (uid) savePlayer(uid, toSave(gameRef.current)).catch((e) => console.error("저장 실패", e));
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
        saveLocal();
        saveRemote();
      } else if (hiddenAt) {
        const reward = incomeOf(gameRef.current) * offlineSecSince(hiddenAt);
        hiddenAt = null;
        if (reward >= 1) setOffline((o) => o + reward);
      }
    };
    const localId = setInterval(saveLocal, 5000);
    const remoteId = setInterval(saveRemote, 30000);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("beforeunload", saveLocal);
    return () => {
      clearInterval(localId);
      clearInterval(remoteId);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("beforeunload", saveLocal);
      saveLocal();
    };
  }, [loaded, uid]);

  // 황금 박쥐가 가끔 화면을 가로질러 날아감
  useEffect(() => {
    let timer;
    const schedule = () => {
      timer = setTimeout(() => {
        setBat({ id: Date.now(), top: 12 + Math.random() * 30, fromLeft: Math.random() < 0.5 });
        timer = setTimeout(() => {
          setBat(null);
          schedule();
        }, BAT.flight);
      }, BAT.minGap + Math.random() * (BAT.maxGap - BAT.minGap));
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  const showBanner = (title, sub, color = "#ffd54a") => {
    const id = Date.now() + Math.random();
    setBanner({ id, title, sub, color });
    setTimeout(() => setBanner((b) => (b?.id === id ? null : b)), 2400);
  };

  const showToast = (content, color) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-3), { id, content, color }]);
    setTimeout(() => setToasts((t) => t.filter((item) => item.id !== id)), 2600);
  };

  const addFx = (items, ms = 900) => {
    const ids = new Set(items.map((item) => item.id));
    setFx((f) => [...f, ...items]);
    setTimeout(() => setFx((f) => f.filter((item) => !ids.has(item.id))), ms);
  };

  const sceneCenter = () => {
    const rect = sceneRef.current?.getBoundingClientRect();
    return rect ? { x: rect.width / 2, y: 136 } : { x: 180, y: 136 };
  };

  // 광석이 부서지면 파편 + 보상 표시
  useEffect(() => {
    const lb = game.lastBreak;
    if (!lb || lb.seq === lastBreakSeq.current) return;
    lastBreakSeq.current = lb.seq;
    lb.charms.forEach((c) => {
      showToast(
        <>
          <CharmIcon type={c.type} rarity={c.rarity} size={26} /> {RARITIES[c.rarity].name} {charmTypeOf(c).name} 획득!
        </>,
        RARITIES[c.rarity].color
      );
      if (c.rarity >= 3) showBanner("귀한 장신구!", `${RARITIES[c.rarity].name} ${charmTypeOf(c).name}`, RARITIES[c.rarity].color);
    });
    if (lb.unlocked) showBanner("새 광석 해금!", ORES.find((o) => o.id === lb.unlocked).name, "#7ef9ff");
    const now = Date.now();
    if (now - lastShatter.current < 400) return;
    lastShatter.current = now;
    const ore = ORES.find((o) => o.id === lb.ore);
    const { x, y } = sceneCenter();
    const items = [
      { id: ++fxId.current, type: "break", x, y: y - 40, text: `${lb.breaks > 1 ? `${lb.breaks}번 ` : ""}파괴! +${fmt(lb.bonus)}` },
      { id: ++fxId.current, type: "drop", x: x + 50, y: y + 20, ore, text: `+${fmt(lb.items)}` },
    ];
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 70;
      items.push({
        id: ++fxId.current,
        type: "chunk",
        x,
        y,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist - 20,
        color: ore.faces[i % ore.faces.length],
        size: 8 + Math.random() * 10,
      });
    }
    addFx(items, 1100);
  }, [game.lastBreak]);

  const stats = statsOf(game);
  const now = Date.now();
  const rushing = rush.until > now;
  const rushLeft = rushing ? (rush.until - now) / 1000 : 0;
  const oreIndex = oreIndexOf(game.ore);
  const ore = ORES[oreIndex];
  const income = incomeOf(game, stats) * (rushing ? RUSH.rateMult : 1);
  const daily = dailyOf(game.daily);
  const attendanceDue = loaded && game.attendance.last !== todayKey();
  const adsLeft = AD_TICKET.perDay - daily.ads;

  const startRush = (duration) => {
    showBanner("골드 러시!", `${duration.toFixed(1)}초 동안 탭 x${stats.rushTapMult.toFixed(2)} · 광부 x${RUSH.rateMult}`);
    setRush({ gauge: 1, until: Date.now() + duration * 1000, duration });
    setGame((g) => bumpDaily(g, "rushes"));
  };

  const tap = (e) => {
    const rect = sceneRef.current.getBoundingClientRect();
    const st = statsOf(gameRef.current);
    const isRushing = rushRef.current.until > Date.now();
    const crit = Math.random() < st.critChance;
    const damage = st.tapDamage * (crit ? st.critMult : 1) * (isRushing ? st.rushTapMult : 1);
    const gain = damage * ORES[oreIndexOf(gameRef.current.ore)].mult * st.goldMult;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const items = [{ id: ++fxId.current, type: crit ? "crit" : "text", x, y, text: crit ? `치명타! +${fmt(gain)}` : `+${fmt(gain)}`, big: isRushing }];
    for (let i = 0; i < (crit || isRushing ? 9 : 5); i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 60;
      items.push({ id: ++fxId.current, type: "coin", x, y, dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist - 30 });
    }
    addFx(items);
    setHit((h) => h + 1);
    const rolls = randoms();
    setGame((g) => applyDamage(g, damage, statsOf(g), rolls));
    if (isRushing) return;
    const gauge = rushRef.current.gauge + RUSH.perTap;
    if (gauge >= 1) startRush(st.rushDuration);
    else setRush((r) => ({ ...r, gauge }));
  };

  const catchBat = (e) => {
    e.stopPropagation();
    const rect = sceneRef.current.getBoundingClientRect();
    setBat(null);
    if (Math.random() < 0.25 && rushRef.current.until <= Date.now()) {
      showBanner("황금 박쥐 포획!", "골드 러시 발동");
      startRush(statsOf(gameRef.current).rushDuration);
      return;
    }
    const reward = Math.max(500, incomeOf(gameRef.current) * 90);
    addFx([{ id: ++fxId.current, type: "text", x: e.clientX - rect.left, y: e.clientY - rect.top, text: `+${fmt(reward)}`, big: true }]);
    showBanner("황금 박쥐 포획!", `골드 +${fmt(reward)}`);
    setGame((g) => addGold(g, reward));
  };

  const selectOre = (id) => {
    const index = ORES.findIndex((o) => o.id === id);
    if (!isOreUnlocked(gameRef.current, index)) return;
    setGame((g) => (g.ore === id ? g : { ...g, ore: id, oreDamage: 0 }));
  };

  const buyEquip = (slotId) => {
    const slot = EQUIPMENT.find((e) => e.id === slotId);
    const level = gameRef.current.equip[slotId];
    if (level >= MAX_LEVEL || gameRef.current.gold < equipCostOf(slot, level)) return;
    setGame((g) => {
      const cost = equipCostOf(slot, g.equip[slotId]);
      if (g.gold < cost || g.equip[slotId] >= MAX_LEVEL) return g;
      return { ...g, gold: g.gold - cost, equip: { ...g.equip, [slotId]: g.equip[slotId] + 1 } };
    });
    const nextLevel = level + 1;
    if (nextLevel % 10 === 1 && nextLevel > 1) {
      showBanner(`${materialOf(nextLevel).name} ${slot.name}!`, "재질이 바뀌었어요", materialOf(nextLevel).color);
    }
    const before = Math.floor(Math.min(...EQUIPMENT.map((e) => gameRef.current.equip[e.id])) / 10);
    const after = Math.floor(Math.min(...EQUIPMENT.map((e) => (e.id === slotId ? nextLevel : gameRef.current.equip[e.id]))) / 10);
    if (after > before) showBanner(`${MATERIALS[after - 1].name} 세트 완성!`, "골드 +20% · 치명타 확률 +1%", MATERIALS[after - 1].color);
  };

  // 뽑기: 빛기둥 연출 → 카드 공개 (좋은 등급일수록 연출이 길고 화려해요)
  const showPull = (results, title, before) => {
    const id = Date.now();
    const best = Math.max(...results.map((w) => w.rarity));
    setPullResult({
      id,
      title,
      best,
      stage: "summon",
      results: results.map((w, i) => ({ ...w, isNew: !before[w.id] && results.findIndex((r) => r.id === w.id) === i })),
    });
    setTimeout(() => setPullResult((p) => (p?.id === id && p.stage === "summon" ? { ...p, stage: "reveal" } : p)), best >= 4 ? 1900 : 1000);
  };

  // free: 광고·출석 보상처럼 골드를 쓰지 않는 뽑기
  const pull = (ticket, times, free = null) => {
    const g0 = gameRef.current;
    const cost = free ? 0 : ticketCostOf(ticket, g0.pulls[ticket.id] || 0, times);
    if (g0.gold < cost) return;
    let pity = g0.pity;
    const results = Array.from({ length: times }, () => {
      let w = rollWorker(ticket);
      if (PITY.tickets.includes(ticket.id)) {
        pity += 1;
        if (w.rarity < PITY.rarity && pity >= PITY.limit) w = pickWorker(PITY.rarity);
        if (w.rarity >= PITY.rarity) pity = 0;
      }
      return w;
    });
    setGame((g) => {
      if (g.gold < cost) return g;
      const workers = { ...g.workers };
      results.forEach((w) => {
        workers[w.id] = (workers[w.id] || 0) + 1;
      });
      let next = { ...g, gold: g.gold - cost, workers, pity };
      if (!free) next.pulls = { ...g.pulls, [ticket.id]: (g.pulls[ticket.id] || 0) + times };
      next = bumpDaily(next, "pulls", times);
      if (free === "ad") next = bumpDaily(next, "ads");
      return next;
    });
    showPull(results, `${ticket.name} 결과`, g0.workers);
  };

  const merge = (rarity) => {
    const g0 = gameRef.current;
    const materials = pickMergeMaterials(g0.workers, rarity);
    if (!materials) return;
    const { outcome, result } = rollMerge(rarity);
    const refund = outcome === "fail" ? materials[Math.floor(Math.random() * materials.length)] : null;
    const gained = result || refund;
    setGame((g) => {
      if (!pickMergeMaterials(g.workers, rarity)) return g;
      const workers = { ...g.workers };
      materials.forEach((w) => (workers[w.id] -= 1));
      workers[gained.id] = (workers[gained.id] || 0) + 1;
      Object.keys(workers).forEach((k) => !workers[k] && delete workers[k]);
      return { ...g, workers };
    });
    const id = Date.now();
    setMergeResult({ id, stage: "merging", materials, outcome, result, refund, isNew: result && !g0.workers[result.id] });
    setTimeout(() => setMergeResult((m) => (m?.id === id ? { ...m, stage: "result" } : m)), 1500);
  };

  const equipCharm = (uid) =>
    setGame((g) => (g.equipped.length >= CHARM_SLOTS || g.equipped.includes(uid) ? g : { ...g, equipped: [...g.equipped, uid] }));
  const unequipCharm = (uid) => setGame((g) => ({ ...g, equipped: g.equipped.filter((u) => u !== uid) }));
  const sellCharm = (uid) =>
    setGame((g) => {
      const c = g.charms.find((item) => item.uid === uid);
      if (!c || g.equipped.includes(uid)) return g;
      return { ...g, gold: g.gold + c.sell, charms: g.charms.filter((item) => item.uid !== uid) };
    });
  const sellCharmsBelow = (maxRarity) => {
    const g0 = gameRef.current;
    const sold = new Set(g0.charms.filter((c) => c.rarity <= maxRarity && !g0.equipped.includes(c.uid)).map((c) => c.uid));
    if (!sold.size) return;
    const total = g0.charms.filter((c) => sold.has(c.uid)).reduce((sum, c) => sum + c.sell, 0);
    setGame((g) => ({ ...g, gold: g.gold + total, charms: g.charms.filter((c) => !sold.has(c.uid)) }));
    showToast(`장신구 ${sold.size}개 판매 +${fmt(total)}`, "#ffd54a");
  };

  // 시장: 판 돈은 골드로만 들어가고 랭킹 점수(누적 채굴량)에는 안 들어가요
  const marketSell = (oreId, qty) => {
    const held = gameRef.current.oreItems[oreId] || 0;
    const n = Math.min(qty, held);
    if (n < 1) return;
    const price = market.priceOf(oreId);
    setGame((g) => {
      if ((g.oreItems[oreId] || 0) < n) return g;
      return { ...g, gold: g.gold + n * price, oreItems: { ...g.oreItems, [oreId]: g.oreItems[oreId] - n } };
    });
    market.record("sells", oreId, n);
    showToast(`${ORES.find((o) => o.id === oreId).name} ${fmt(n)}개 판매 +${fmt(n * price)}`, "#ff6b6b");
  };

  const marketBuy = (oreId, qty) => {
    const cost = qty * market.priceOf(oreId) * BUY_SPREAD;
    if (gameRef.current.gold < cost) return;
    setGame((g) => (g.gold < cost ? g : { ...g, gold: g.gold - cost, oreItems: { ...g.oreItems, [oreId]: (g.oreItems[oreId] || 0) + qty } }));
    market.record("buys", oreId, qty);
    showToast(`${ORES.find((o) => o.id === oreId).name} ${qty}개 구매 -${fmt(cost)}`, "#4fa3ff");
  };

  // TODO: 스토어 출시 시 AdMob 보상형 광고로 교체 (광고 완료 콜백에서 onDone 실행)
  const playAd = (kind, onDone) => {
    setWatchingAd(kind);
    setTimeout(() => {
      setWatchingAd(null);
      onDone();
    }, AD_MS);
  };

  const claimOffline = (multiplier) => {
    const reward = offline * multiplier;
    setGame((g) => addGold(g, reward));
    setOffline(0);
  };

  const claimAttendance = () => {
    const g0 = gameRef.current;
    const day = nextStreakOf(g0.attendance);
    const reward = attendanceRewardOf(g0, day);
    setGame((g) => addGold({ ...g, attendance: { last: todayKey(), streak: day } }, reward));
    showBanner(`출석 ${day}일차`, `골드 +${fmt(reward)}${day === 7 ? " · 금 티켓 1회" : ""}`);
    if (day === 7) pull(TICKETS.find((t) => t.id === "gold"), 1, "attendance");
  };

  const claimQuest = (index) => {
    const reward = questRewardOf(gameRef.current);
    setGame((g) => {
      const d = dailyOf(g.daily);
      if (d.claimed[index] || (d[QUESTS[index].id] || 0) < QUESTS[index].goal) return g;
      return addGold({ ...g, daily: { ...d, claimed: d.claimed.map((c, i) => c || i === index) } }, reward);
    });
    showBanner("미션 완료!", `골드 +${fmt(reward)}`);
  };

  const rebirth = () => {
    const gain = stonesFor(gameRef.current.runEarned);
    if (gain < 1) return;
    if (!armPrestige) {
      setArmPrestige(true);
      setTimeout(() => setArmPrestige(false), 3000);
      return;
    }
    setArmPrestige(false);
    setGame((g) => rebirthOf(g));
    setRush({ gauge: 0, until: 0, duration: RUSH.duration });
    showBanner("환생 완료!", `💎 +${gain} · 골드 x${prestigeMult(gameRef.current.stones + gain).toFixed(1)}`, "#ff9ef5");
  };

  const resetGame = () => {
    if (!armReset) {
      setArmReset(true);
      setTimeout(() => setArmReset(false), 3000);
      return;
    }
    setArmReset(false);
    setGame((g) => ({ ...normalize(null), nickname: g.nickname }));
    setOffline(0);
  };

  const saveNickname = (nickname) => {
    setGame((g) => ({ ...g, nickname }));
    setAskNickname(false);
    if (uid) savePlayer(uid, toSave({ ...gameRef.current, nickname })).catch((e) => console.error("저장 실패", e));
  };

  const handleLogout = async () => {
    try {
      await savePlayer(uid, toSave(gameRef.current));
    } catch (e) {
      console.error("저장 실패", e);
    }
    logout();
  };

  const handleGuestLogin = () => {
    writeLocal(null, toSave(gameRef.current));
    onExit();
  };

  const walkers = WORKERS.filter((w) => game.workers[w.id])
    .sort((a, b) => b.rarity - a.rarity || b.rate - a.rate)
    .flatMap((w) => Array.from({ length: Math.min(game.workers[w.id], MAX_WALKERS) }, () => w))
    .slice(0, MAX_WALKERS);
  const dots = {
    workers: adsLeft > 0 || RARITIES.slice(0, -1).some((_, r) => (pickMergeMaterials(game.workers, r) || []).length === MERGE.count),
    missions: attendanceDue || QUESTS.some((q, i) => (daily[q.id] || 0) >= q.goal && !daily.claimed[i]),
    prestige: stonesFor(game.runEarned) > 0,
  };

  if (!loaded) return <div className="splash">광산 여는 중...</div>;

  return (
    <div className={`game ${rushing ? "is-rush" : ""}`}>
      <header className="hud">
        <div className="hud-top">
          <section className="ranking" aria-label="랭킹">
            <div className="ranking-title">🏆 랭킹 TOP 3</div>
            {top3.length === 0 ? (
              <div className="ranking-empty">{firebaseEnabled ? "아직 기록이 없어요" : "로그인하면 랭킹에 올라가요"}</div>
            ) : (
              top3.map((p, i) => (
                <div key={p.uid} className={`rank-row ${p.uid === uid ? "me" : ""}`}>
                  <span className="medal">{MEDALS[i]}</span>
                  <span className="rank-name">{p.nickname}</span>
                  <span className="rank-score">{fmt(p.totalEarned)}</span>
                </div>
              ))
            )}
          </section>
          <div className="profile">
            {uid ? (
              <>
                <button className="nick-chip" onClick={() => setAskNickname(true)}>
                  ✏️ {game.nickname}
                </button>
                <button className="link-btn" onClick={handleLogout}>
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <span className="nick-chip guest">게스트</span>
                <button className="link-btn" onClick={handleGuestLogin}>
                  {firebaseEnabled ? "로그인하기" : "처음 화면"}
                </button>
              </>
            )}
            {game.stones > 0 && (
              <span className="stone-chip">
                💎 {game.stones} · x{prestigeMult(game.stones).toFixed(1)}
              </span>
            )}
          </div>
        </div>
        <div className="gold-row">
          <CoinIcon size={34} />
          {fmt(game.gold)}
        </div>
        <div className="rate">
          초당 +{fmt(income, 1)} · 탭 {fmt(stats.tapDamage)} · 치명 {Math.round(stats.critChance * 100)}%
        </div>
        <div className={`rush-gauge ${rushing ? "on" : ""}`}>
          <div className="rush-fill" style={{ width: `${(rushing ? rushLeft / rush.duration : rush.gauge) * 100}%` }} />
          <span className="rush-text">{rushing ? `골드 러시 ${Math.ceil(rushLeft)}초` : "빠르게 탭해서 골드 러시 게이지를 채우세요"}</span>
        </div>
      </header>

      <div className="ore-picker" role="tablist" aria-label="캘 광석">
        {ORES.map((o, i) => {
          const unlocked = isOreUnlocked(game, i);
          const prevBreaks = i ? game.oreBreaks[ORES[i - 1].id] || 0 : 0;
          return (
            <button
              key={o.id}
              className={`ore-chip ${game.ore === o.id ? "active" : ""} ${unlocked ? "" : "locked"}`}
              style={{ "--oc": o.vein[1] }}
              disabled={!unlocked}
              onClick={() => selectOre(o.id)}
            >
              <OreItemIcon ore={o} size={20} />
              <span>{unlocked ? o.name : `🔒 ${prevBreaks}/${BREAKS_TO_UNLOCK}`}</span>
            </button>
          );
        })}
      </div>

      <div
        className={`scene ${rushing ? "rush" : ""}`}
        ref={sceneRef}
        onPointerDown={tap}
        style={{ "--bg1": ore.bg[0], "--bg2": ore.bg[1], "--bg3": ore.bg[2], "--glow": ore.vein[1] }}
      >
        {DUST.map((d, i) => (
          <span key={i} className="dust" style={{ left: d.left, top: d.top, animationDelay: d.delay }} />
        ))}
        {rushing &&
          RAIN.map((c, i) => (
            <span key={i} className="rain" style={{ left: c.left, animationDelay: c.delay, animationDuration: c.duration }}>
              <CoinIcon size={16} />
            </span>
          ))}
        <div className="ore-hp">
          <span>
            {ore.name} 광석 · 파괴 {fmt(game.oreBreaks[ore.id] || 0)}회
          </span>
          <div className="hp-bar">
            <div style={{ width: `${(1 - game.oreDamage / ore.hp) * 100}%` }} />
          </div>
          <span className="hp-text">
            {fmt(Math.max(0, ore.hp - game.oreDamage))} / {fmt(ore.hp)}
          </span>
        </div>
        <div key={hit} className={`rock-wrap ${hit ? "hit" : ""}`}>
          <OreRock ore={ore} damage={game.oreDamage / ore.hp} />
        </div>
        <div className="ground" />
        {walkers.map((w, i) => (
          <Walker key={i} index={i} look={w.look} rarity={w.rarity} />
        ))}
        {bat && (
          <button
            key={bat.id}
            className={`bat ${bat.fromLeft ? "" : "reverse"}`}
            style={{ top: `${bat.top}%`, animationDuration: `${BAT.flight}ms` }}
            onPointerDown={catchBat}
            aria-label="황금 박쥐 잡기"
          >
            <span className="bat-bob">
              <BatIcon />
            </span>
          </button>
        )}
        {fx.map((item) => {
          if (item.type === "coin" || item.type === "chunk") {
            return (
              <span
                key={item.id}
                className={item.type === "coin" ? "fx-coin" : "fx-chunk"}
                style={{
                  left: item.x,
                  top: item.y,
                  "--dx": `${item.dx}px`,
                  "--dy": `${item.dy}px`,
                  ...(item.type === "chunk" ? { width: item.size, height: item.size, background: item.color } : null),
                }}
              >
                {item.type === "coin" && <CoinIcon size={18} />}
              </span>
            );
          }
          if (item.type === "drop") {
            return (
              <span key={item.id} className="fx-drop" style={{ left: item.x, top: item.y }}>
                <OreItemIcon ore={item.ore} size={26} />
                {item.text}
              </span>
            );
          }
          return (
            <span key={item.id} className={`fx-text ${item.type} ${item.big ? "big" : ""}`} style={{ left: item.x, top: item.y }}>
              {item.text}
            </span>
          );
        })}
      </div>

      <nav className="tabs" aria-label="메뉴">
        {TABS.map(([id, label]) => (
          <button key={id} className={`tab ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>
            {label}
            {dots[id] && <span className="dot" />}
          </button>
        ))}
      </nav>

      {tab === "equip" && <EquipPanel game={game} stats={stats} onBuy={buyEquip} />}
      {tab === "workers" && (
        <WorkersPanel
          game={game}
          stats={stats}
          adsLeft={adsLeft}
          watchingAd={watchingAd}
          onAdPull={() => playAd("ticket", () => pull(TICKETS.find((t) => t.id === AD_TICKET.ticket), 1, "ad"))}
          onPull={pull}
          onMerge={merge}
        />
      )}
      {tab === "charms" && (
        <CharmsPanel game={game} stats={stats} onEquip={equipCharm} onUnequip={unequipCharm} onSell={sellCharm} onSellBelow={sellCharmsBelow} />
      )}
      {tab === "market" && <MarketPanel game={game} market={market} onSell={marketSell} onBuy={marketBuy} />}
      {tab === "missions" && <MissionsPanel game={game} attendanceDue={attendanceDue} onClaimQuest={claimQuest} />}
      {tab === "prestige" && (
        <PrestigePanel game={game} armed={armPrestige} armedReset={armReset} onRebirth={rebirth} onReset={resetGame} />
      )}

      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="toast" style={{ "--tc": t.color }}>
            {t.content}
          </div>
        ))}
      </div>

      {banner && (
        <div key={banner.id} className="banner" style={{ "--bc": banner.color }}>
          <div className="banner-rays" />
          <div className="banner-title">{banner.title}</div>
          <div className="banner-sub">{banner.sub}</div>
        </div>
      )}

      {askNickname && (
        <NicknameModal initial={game.nickname} canClose={Boolean(game.nickname)} onSave={saveNickname} onClose={() => setAskNickname(false)} />
      )}

      {!askNickname && offline >= 1 && (
        <div className="overlay">
          <div className="modal">
            <div className="rays" />
            <div className="chest">
              <ChestIcon />
            </div>
            <h2>자리를 비운 동안 캐 온 골드</h2>
            <p className="reward">
              <CoinIcon size={30} />
              {fmt(offline)}
            </p>
            <button className="ad-btn" onClick={() => playAd("offline", () => claimOffline(2))} disabled={Boolean(watchingAd)}>
              {watchingAd === "offline" && <span className="ad-progress" />}
              <span className="ad-label">{watchingAd === "offline" ? "광고 시청 중..." : "📺 광고 보고 2배 받기"}</span>
            </button>
            <button className="plain-btn" onClick={() => claimOffline(1)} disabled={Boolean(watchingAd)}>
              그냥 받기
            </button>
          </div>
        </div>
      )}

      {!askNickname && offline < 1 && !pullResult && attendanceDue && (
        <div className="overlay">
          <div className="modal">
            <div className="rays" />
            <h2>출석 {nextStreakOf(game.attendance)}일차</h2>
            <div className="attendance">
              {Array.from({ length: 7 }, (_, i) => (
                <div
                  key={i}
                  className={`att-day ${i + 1 < nextStreakOf(game.attendance) ? "done" : ""} ${i + 1 === nextStreakOf(game.attendance) ? "today" : ""} ${i === 6 ? "big" : ""}`}
                >
                  <span>{i + 1}일</span>
                  <span className="att-icon">{i === 6 ? "🎟️" : "💰"}</span>
                </div>
              ))}
            </div>
            <p className="reward">
              <CoinIcon size={30} />
              {fmt(attendanceRewardOf(game, nextStreakOf(game.attendance)))}
            </p>
            {nextStreakOf(game.attendance) === 7 && <p className="modal-text">+ 금 티켓 1회 무료</p>}
            <button className="ad-btn" onClick={claimAttendance}>
              <span className="ad-label">출석 보상 받기</span>
            </button>
          </div>
        </div>
      )}

      {pullResult && (
        <div
          className={`overlay pull-overlay r${pullResult.best}`}
          style={{ "--bc": RARITIES[pullResult.best].color }}
          onClick={() =>
            setPullResult((p) => (p.stage === "summon" ? { ...p, stage: "reveal" } : null))
          }
        >
          {pullResult.stage === "summon" ? (
            <div className="summon">
              <div className="summon-beams">
                {BEAMS.map((deg) => (
                  <span key={deg} style={{ transform: `rotate(${deg}deg)` }} />
                ))}
              </div>
              <div className="summon-orb" />
              <p className="summon-text">{pullResult.best >= 4 ? "강한 기운이 느껴져요…!" : "광부를 부르는 중…"}</p>
              <p className="summon-skip">탭해서 건너뛰기</p>
            </div>
          ) : (
            <div key={pullResult.id} className={`modal pull-modal ${pullResult.best >= 4 ? "jackpot" : ""}`}>
              {pullResult.best >= 4 && <div className="banner-rays" />}
              <h2>{pullResult.best >= 4 ? `${RARITIES[pullResult.best].name} 광부 등장!` : pullResult.title}</h2>
              <div className={`pull-grid ${pullResult.results.length > 1 ? "multi" : ""}`}>
                {pullResult.results.map((w, i) => (
                  <div key={i} className={`pull-card r${w.rarity}`} style={{ "--rc": RARITIES[w.rarity].color, animationDelay: `${i * 0.12}s` }}>
                    {w.isNew && <span className="new-tag">NEW</span>}
                    <WorkerIcon look={w.look} rarity={w.rarity} size={pullResult.results.length > 1 ? 40 : 72} still />
                    <span className="pull-name">{w.name}</span>
                    <span className="pull-rarity">{RARITIES[w.rarity].name}</span>
                  </div>
                ))}
              </div>
              <button className="ad-btn">
                <span className="ad-label">확인</span>
              </button>
            </div>
          )}
        </div>
      )}

      {mergeResult && (
        <div className="overlay" onClick={() => mergeResult.stage === "result" && setMergeResult(null)}>
          {mergeResult.stage === "merging" ? (
            <div className="merging">
              {mergeResult.materials.map((w, i) => (
                <span key={i} className={`merge-mat m${i}`}>
                  <WorkerIcon look={w.look} rarity={w.rarity} size={56} still />
                </span>
              ))}
              <div className="merge-core" style={{ "--rc": RARITIES[mergeResult.materials[0].rarity + 1].color }} />
              <p className="summon-text">합성 중…</p>
            </div>
          ) : (
            <div
              className={`modal merge-modal ${mergeResult.outcome}`}
              style={{ "--bc": mergeResult.result ? RARITIES[mergeResult.result.rarity].color : "#78909c" }}
            >
              {mergeResult.outcome !== "fail" && <div className="banner-rays" />}
              <h2>{{ great: "대성공!! 두 등급 상승", success: "합성 성공!", fail: "합성 실패…" }[mergeResult.outcome]}</h2>
              <div className="pull-grid">
                {(() => {
                  const w = mergeResult.result || mergeResult.refund;
                  return (
                    <div className={`pull-card r${w.rarity} ${mergeResult.outcome === "fail" ? "failed" : ""}`} style={{ "--rc": RARITIES[w.rarity].color }}>
                      {mergeResult.isNew && <span className="new-tag">NEW</span>}
                      <WorkerIcon look={w.look} rarity={w.rarity} size={72} still />
                      <span className="pull-name">{w.name}</span>
                      <span className="pull-rarity">{mergeResult.outcome === "fail" ? "1명 돌려받음" : RARITIES[w.rarity].name}</span>
                    </div>
                  );
                })()}
              </div>
              <button className="ad-btn">
                <span className="ad-label">확인</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NicknameModal({ initial, canClose, onSave, onClose }) {
  const [value, setValue] = useState(initial);
  const trimmed = value.trim();
  return (
    <div className="overlay">
      <form
        className="modal"
        onSubmit={(e) => {
          e.preventDefault();
          if (trimmed) onSave(trimmed);
        }}
      >
        <h2>닉네임 정하기</h2>
        <p className="modal-text">랭킹에 이 이름으로 보여요 (최대 12자)</p>
        <input id="nickname" className="nick-input" value={value} maxLength={12} autoFocus onChange={(e) => setValue(e.target.value)} />
        <button className="ad-btn" type="submit" disabled={!trimmed}>
          <span className="ad-label">저장</span>
        </button>
        {canClose && (
          <button className="plain-btn" type="button" onClick={onClose}>
            취소
          </button>
        )}
      </form>
    </div>
  );
}
