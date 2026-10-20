import { useEffect, useRef, useState } from "react";
import { firebaseEnabled, loadPlayer, login, logout, savePlayer, watchAuth, watchTop3 } from "./firebase";
import {
  AD_TICKET,
  BAT,
  BOSS,
  BYPRODUCTS,
  COMBO,
  CHARM_GACHA,
  CHARM_MERGE,
  CHARM_SLOTS,
  EQUIPMENT,
  MAX_LEVEL,
  MAX_OFFLINE_SEC,
  MERGE,
  ORE_LEVELS,
  ORES,
  STAGE_BREAKS,
  PITY,
  QUESTS,
  RARITIES,
  RUSH,
  SKILLS,
  TAP_GOLD,
  TICKETS,
  TREASURE,
  WEAK,
  WORKER_GOLD,
  WORKERS,
} from "./data";
import {
  addGold,
  applyDamage,
  attendanceRewardOf,
  bossHpOf,
  bumpDaily,
  canChallengeBoss,
  charmSellOf,
  charmTypeOf,
  dailyOf,
  equipCostOf,
  equipNameOf,
  fmt,
  incomeOf,
  isBossGate,
  makeCharm,
  nextStreakOf,
  normalize,
  oreHpOf,
  pickCharmMaterials,
  pickMergeMaterials,
  pickWorker,
  plusOf,
  prestigeCostOf,
  prestigeMult,
  questRewardOf,
  rarityCountOf,
  rebirthOf,
  rollCharm,
  rollMergeOutcome,
  rollWorker,
  setTierOf,
  STAGE_COUNT,
  stageNameOf,
  stageOf,
  statsOf,
  stonesFor,
  toSave,
  todayKey,
} from "./game";
import { useMarket } from "./market";
import { buzz, isMuted, setMuted as saveMuted, sfx } from "./sound";
import { BatIcon, ByproductIcon, CharmIcon, ChestIcon, CoinIcon, GoogleLogo, OreItemIcon, OreRock, Walker, WorkerIcon, WorkerPortrait } from "./art";
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

// PC에서도 마우스로 끌어서 스크롤 (광석 화면은 제외)
function useDragScroll() {
  useEffect(() => {
    let drag = null;
    const scrollableOf = (el) => {
      for (; el && el !== document.body; el = el.parentElement) {
        const style = getComputedStyle(el);
        const y = /(auto|scroll)/.test(style.overflowY) && el.scrollHeight > el.clientHeight;
        const x = /(auto|scroll)/.test(style.overflowX) && el.scrollWidth > el.clientWidth;
        if (x || y) return el;
      }
      return document.scrollingElement;
    };
    const down = (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0 || e.target.closest(".scene, input, .overlay")) return;
      const el = scrollableOf(e.target);
      drag = { el, x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop, moved: false };
    };
    const move = (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 6) return;
      drag.moved = true;
      drag.el.scrollLeft = drag.left - dx;
      drag.el.scrollTop = drag.top - dy;
    };
    const up = () => {
      if (drag?.moved) {
        // 끌어서 스크롤한 뒤에 버튼이 눌리지 않게
        const block = (ev) => {
          ev.stopPropagation();
          ev.preventDefault();
        };
        window.addEventListener("click", block, true);
        setTimeout(() => window.removeEventListener("click", block, true), 0);
      }
      drag = null;
    };
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);
}

export default function App() {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState(null);
  const [guest, setGuest] = useState(false);
  useDragScroll();

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
        <OreRock ore={ORES[6]} />
        <div className="login-girls">
          {[WORKERS[0], WORKERS[16], WORKERS[24]].map((w) => (
            <WorkerIcon key={w.id} look={w.look} rarity={w.rarity} size={92} />
          ))}
        </div>
      </div>
      <h1 className="title">광석 캐기</h1>
      <p className="subtitle">광석을 부수고, 보스를 잡고, 광부 소녀들을 모아 보세요</p>
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
  const [boss, setBoss] = useState(null);
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
  const [combo, setCombo] = useState(0);
  const [weak, setWeak] = useState(null);
  const [skills, setSkills] = useState({});
  const [shakeUntil, setShakeUntil] = useState(0);
  const [muted, setMutedState] = useState(isMuted);

  const gameRef = useRef(game);
  gameRef.current = game;
  const rushRef = useRef(rush);
  rushRef.current = rush;
  const bossRef = useRef(boss);
  bossRef.current = boss;
  const fxId = useRef(0);
  const sceneRef = useRef(null);
  const displayName = useRef(user?.displayName);
  const lastBreakSeq = useRef(0);
  const lastShatter = useRef(0);
  // 뽑기·합성 결과는 연출이 끝날 때 반영해서 뒤 화면에 미리 보이지 않게
  const pending = useRef(null);
  const comboRef = useRef({ count: 0, last: 0 });
  const weakRef = useRef(null);
  weakRef.current = weak;
  const skillsRef = useRef(skills);
  skillsRef.current = skills;

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

  // 0.1초마다 광부들이 광석을 캠 (보스전 중에는 골드만) + 골드 러시·보스 시간 체크
  useEffect(() => {
    let last = Date.now();
    const id = setInterval(() => {
      const now = Date.now();
      const dt = Math.min((now - last) / 1000, 1);
      last = now;
      const rushing = rushRef.current.until > now;
      const fighting = Boolean(bossRef.current);
      const rolls = randoms();
      setGame((g) => {
        const st = statsOf(g);
        const rally = skillsRef.current.rally?.until > now ? SKILLS.find((k) => k.id === "rally").mult : 1;
        const damage = st.workerPower * (rushing ? RUSH.rateMult : 1) * rally * dt;
        if (damage <= 0) return g;
        if (fighting) return addGold(g, damage * stageOf(g.stage).mult * st.goldMult * WORKER_GOLD);
        return applyDamage(g, damage, st, rolls, WORKER_GOLD);
      });
      setRush((r) => {
        if (r.until) return r.until <= now ? { ...r, gauge: 0, until: 0 } : r;
        return r.gauge > 0 ? { ...r, gauge: Math.max(0, r.gauge - RUSH.decay * dt) } : r;
      });
      if (comboRef.current.count && now - comboRef.current.last > COMBO.window) {
        comboRef.current = { count: 0, last: 0 };
        setCombo(0);
      }
      if (bossRef.current && now > bossRef.current.until) {
        bossRef.current = null;
        setBoss(null);
        showBanner("보스가 도망갔어요", "곡괭이를 강화하고 다시 도전해 보세요", "#ff8a80");
        sfx.fail();
      }
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
        setBat({ id: Date.now(), top: 18 + Math.random() * 26, fromLeft: Math.random() < 0.5 });
        timer = setTimeout(() => {
          setBat(null);
          schedule();
        }, BAT.flight);
      }, BAT.minGap + Math.random() * (BAT.maxGap - BAT.minGap));
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  // 광석 화면에서는 손가락을 끌어도 페이지(바깥 앱 포함)가 스크롤되지 않게 터치 기본 동작을 막아요
  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return undefined;
    const block = (e) => {
      if (e.cancelable) e.preventDefault();
    };
    el.addEventListener("touchstart", block, { passive: false });
    el.addEventListener("touchmove", block, { passive: false });
    return () => {
      el.removeEventListener("touchstart", block);
      el.removeEventListener("touchmove", block);
    };
  }, [loaded]);

  // 약점 표적: 광석 위 랜덤 위치, 맞히거나 시간이 지나면 이동
  const moveWeak = () => {
    const width = sceneRef.current?.clientWidth || 360;
    setWeak({ id: Date.now(), x: width / 2 + (Math.random() - 0.5) * 120, y: 110 + Math.random() * 80 });
  };
  useEffect(() => {
    if (!loaded) return undefined;
    moveWeak();
    const id = setInterval(moveWeak, WEAK.moveMs);
    return () => clearInterval(id);
  }, [loaded]);

  const addFx = (items, ms = 900) => {
    const ids = new Set(items.map((item) => item.id));
    setFx((f) => [...f, ...items]);
    setTimeout(() => setFx((f) => f.filter((item) => !ids.has(item.id))), ms);
  };

  // 광석이 부서지면 파편 + 보상 표시
  useEffect(() => {
    const lb = game.lastBreak;
    if (!lb || lb.seq === lastBreakSeq.current) return;
    lastBreakSeq.current = lb.seq;
    if (lb.unlocked !== null) showToast(`⛏️ ${stageNameOf(lb.unlocked)} 해금!`, stageOf(lb.unlocked).ore.vein[1]);
    if (lb.treasure) {
      showBanner("💰 보물 광석 파괴!", `골드 +${fmt(lb.bonus)} · 부산물 x${TREASURE.itemMult}`, "#ffd54a");
      sfx.fanfare();
      buzz(80);
    }
    if (lb.newTreasure) showToast("✨ 보물 광석 등장! 부수면 보상 10배", "#ffd54a");
    const now = Date.now();
    if (now - lastShatter.current < 1200) return;
    lastShatter.current = now;
    sfx.break();
    setShakeUntil(now + 250);
    const ore = stageOf(lb.stage).ore;
    const width = sceneRef.current?.clientWidth || 360;
    const x = width / 2;
    const y = 150;
    const [itemId, qty] = Object.entries(lb.items)[0] || [];
    const items = [{ id: ++fxId.current, type: "break", x, y: y - 40, text: `${lb.breaks > 1 ? `${lb.breaks}번 ` : ""}파괴! +${fmt(lb.bonus)}` }];
    if (itemId) items.push({ id: ++fxId.current, type: "drop", x: x + 50, y: y + 20, item: BYPRODUCTS.find((b) => b.id === itemId), text: `+${fmt(qty)}` });
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
  const stage = stageOf(game.stage);
  const ore = stage.ore;
  const rallyOn = skills.rally?.until > now;
  const income = incomeOf(game, stats) * (rushing ? RUSH.rateMult : 1) * (rallyOn ? SKILLS.find((k) => k.id === "rally").mult : 1);
  const daily = dailyOf(game.daily);
  const attendanceDue = loaded && game.attendance.last !== todayKey();
  const adsLeft = AD_TICKET.perDay - daily.ads;

  const startRush = (duration) => {
    showBanner("골드 러시!", `${duration.toFixed(1)}초 동안 탭 x${stats.rushTapMult.toFixed(2)} · 광부 x${RUSH.rateMult}`);
    setRush({ gauge: 1, until: Date.now() + duration * 1000, duration });
    sfx.fanfare();
    setGame((g) => bumpDaily(g, "rushes"));
  };

  const startBoss = () => {
    const g = gameRef.current;
    if (!canChallengeBoss(g) || bossRef.current) return;
    const max = bossHpOf(g.stageLevel);
    const next = { level: g.stageLevel, hp: max, max, until: Date.now() + BOSS.seconds * 1000 };
    bossRef.current = next;
    setBoss(next);
    showBanner(`${stageNameOf(g.stageLevel)} 보스 등장!`, `${BOSS.seconds}초 안에 탭으로 부수세요`, "#ff5252");
    sfx.boss();
  };

  // 탭·다이너마이트 공용: 보스면 보스 HP를, 아니면 광석을 깎아요
  const strike = (damage, goldFactor, st) => {
    const g = gameRef.current;
    const gain = damage * stageOf(g.stage).mult * st.goldMult * goldFactor;
    const fight = bossRef.current;
    if (fight) {
      setGame((prev) => addGold(prev, gain));
      const hp = fight.hp - damage;
      if (hp > 0) {
        bossRef.current = { ...fight, hp };
        setBoss(bossRef.current);
      } else {
        // 보스 처치: 다음 광석 해금 + 큰 보상
        bossRef.current = null;
        setBoss(null);
        const target = fight.level + 1;
        const reward = fight.max * stageOf(fight.level).mult * st.goldMult * BOSS.rewardMult;
        setGame((prev) =>
          addGold({ ...prev, stageLevel: Math.max(prev.stageLevel, target), stage: target, stageBreaks: 0, oreDamage: 0, treasure: false }, reward)
        );
        showBanner("보스 처치!", `${stageOf(target).ore.name} 광석 해금 · 골드 +${fmt(reward)}`, stageOf(target).ore.vein[1]);
        sfx.fanfare();
        buzz(120);
        setShakeUntil(Date.now() + 500);
      }
    } else {
      const rolls = randoms();
      setGame((prev) => applyDamage(prev, damage, statsOf(prev), rolls, goldFactor));
    }
    return gain;
  };

  const tap = (e) => {
    e.preventDefault();
    const rect = sceneRef.current.getBoundingClientRect();
    const st = statsOf(gameRef.current);
    const now = Date.now();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 콤보
    const count = now - comboRef.current.last < COMBO.window ? comboRef.current.count + 1 : 1;
    comboRef.current = { count, last: now };
    setCombo(count);
    if (COMBO.milestones.includes(count)) {
      showToast(`🔥 ${count} 콤보! 피해 x${(1 + Math.min(count, COMBO.max) * COMBO.per).toFixed(2)}`, "#ff8a3d");
      sfx.combo();
    }

    const w = weakRef.current;
    const weakHit = Boolean(w) && Math.hypot(x - w.x, y - w.y) < WEAK.radius;
    const isRushing = rushRef.current.until > now;
    const crit = weakHit || Math.random() < st.critChance;
    const golden = skillsRef.current.golden?.until > now ? SKILLS.find((k) => k.id === "golden").mult : 1;
    const damage =
      st.tapDamage *
      (crit ? st.critMult : 1) *
      (weakHit ? WEAK.mult : 1) *
      (isRushing ? st.rushTapMult : 1) *
      (1 + Math.min(count, COMBO.max) * COMBO.per);
    const gain = strike(damage, TAP_GOLD * golden, st);

    const type = weakHit ? "weak" : crit ? "crit" : "text";
    const label = weakHit ? `약점!! +${fmt(gain)}` : crit ? `치명타! +${fmt(gain)}` : `+${fmt(gain)}`;
    const items = [{ id: ++fxId.current, type, x, y, text: label, big: isRushing || golden > 1 }];
    for (let i = 0; i < (crit || isRushing ? 9 : 5); i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 60;
      items.push({ id: ++fxId.current, type: "coin", x, y, dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist - 30 });
    }
    addFx(items);
    setHit((h) => h + 1);
    if (weakHit) {
      sfx.weak();
      buzz(30);
      moveWeak();
    } else if (crit) {
      sfx.crit();
      buzz(15);
    } else {
      sfx.tap();
    }

    if (isRushing) return;
    const gauge = rushRef.current.gauge + RUSH.perTap;
    if (gauge >= 1) startRush(st.rushDuration);
    else setRush((r) => ({ ...r, gauge }));
  };

  const activateSkill = (id) => {
    const now = Date.now();
    const def = SKILLS.find((k) => k.id === id);
    if ((skillsRef.current[id]?.readyAt || 0) > now) return;
    const next = { ...skillsRef.current, [id]: { readyAt: now + def.cooldown * 1000, until: now + (def.duration || 0) * 1000 } };
    skillsRef.current = next;
    setSkills(next);
    if (id === "dynamite") {
      const st = statsOf(gameRef.current);
      const gain = strike(st.tapDamage * def.power, TAP_GOLD, st);
      const width = sceneRef.current?.clientWidth || 360;
      addFx([{ id: ++fxId.current, type: "boom", x: width / 2, y: 150, text: `💥 +${fmt(gain)}` }], 1100);
      setShakeUntil(now + 600);
      sfx.boom();
      buzz(150);
    } else {
      showBanner(`${def.icon} ${def.name}!`, def.desc, "#ffd54a");
      sfx.fanfare();
    }
  };

  const toggleMute = () => {
    saveMuted(!muted);
    setMutedState(!muted);
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
    const reward = Math.max(500, incomeOf(gameRef.current) * 60 + statsOf(gameRef.current).tapDamage * stage.mult * TAP_GOLD * 30);
    addFx([{ id: ++fxId.current, type: "text", x: e.clientX - rect.left, y: e.clientY - rect.top, text: `+${fmt(reward)}`, big: true }]);
    showBanner("황금 박쥐 포획!", `골드 +${fmt(reward)}`);
    sfx.coin();
    setGame((g) => addGold(g, reward));
  };

  const selectStage = (target) => {
    if (bossRef.current || target > gameRef.current.stageLevel) return;
    setGame((g) => (g.stage === target ? g : { ...g, stage: target, oreDamage: 0 }));
  };

  // count레벨을 한 번에 올림 (최대 버튼)
  const buyEquip = (slotId, count) => {
    const slot = EQUIPMENT.find((e) => e.id === slotId);
    const g0 = gameRef.current;
    let level = g0.equip[slotId];
    let gold = g0.gold;
    let bought = 0;
    while (bought < count && level < MAX_LEVEL && gold >= equipCostOf(slot, level)) {
      gold -= equipCostOf(slot, level);
      level++;
      bought++;
    }
    if (!bought) return;
    setGame((g) => (g.equip[slotId] !== g0.equip[slotId] || g.gold < g0.gold - gold ? g : { ...g, gold: g.gold - (g0.gold - gold), equip: { ...g.equip, [slotId]: level } }));
    const before = g0.equip[slotId];
    if (Math.floor(Math.max(before - 1, 0) / 100) < Math.floor((level - 1) / 100)) {
      showBanner(equipNameOf(slot, level), "새 재질로 바뀌었어요!", "#7ef9ff");
    } else if (plusOf(level) > plusOf(before) && bought > 0) {
      showToast(`${equipNameOf(slot, level)} 달성`, "#ffd54a");
    }
    const tierBefore = setTierOf(g0.equip);
    const tierAfter = setTierOf({ ...g0.equip, [slotId]: level });
    if (tierAfter > tierBefore) showBanner(`장비 세트 ${tierAfter}단계!`, "골드와 치명타 확률이 올랐어요", "#9be7a0");
  };

  // 뽑기 결과 공개 (연출이 끝나거나 탭하면)
  const revealPull = () => {
    setPullResult((p) => {
      if (p && p.stage === "summon") (p.best >= 4 ? sfx.fanfare : sfx.coin)();
      return p;
    });
    if (pending.current) {
      pending.current();
      pending.current = null;
    }
    setPullResult((p) => (p && p.stage === "summon" ? { ...p, stage: "reveal" } : p));
  };

  const showPull = (kind, results, title, apply, before = {}) => {
    const id = Date.now();
    const best = Math.max(...results.map((w) => w.rarity));
    pending.current = apply;
    setPullResult({
      id,
      kind,
      title,
      best,
      stage: "summon",
      results: results.map((w, i) => ({ ...w, isNew: kind === "worker" && !before[w.id] && results.findIndex((r) => r.id === w.id) === i })),
    });
    setTimeout(() => {
      if (pending.current === apply) revealPull();
    }, best >= 4 ? 1900 : 1000);
  };

  // free: 광고·출석 보상처럼 골드를 쓰지 않는 뽑기
  const pull = (ticket, times, free = null) => {
    const g0 = gameRef.current;
    const cost = free ? 0 : ticket.cost * times;
    if (g0.gold < cost || pending.current) return;
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
    // 골드는 바로 내고, 광부는 공개될 때 들어와요
    setGame((g) => bumpDaily({ ...g, gold: g.gold - cost, pity }, "pulls", times));
    if (free === "ad") setGame((g) => bumpDaily(g, "ads"));
    const apply = () =>
      setGame((g) => {
        const workers = { ...g.workers };
        results.forEach((w) => (workers[w.id] = (workers[w.id] || 0) + 1));
        return { ...g, workers };
      });
    showPull("worker", results, `${ticket.name} 결과`, apply, g0.workers);
  };

  const pullCharms = (times) => {
    const g0 = gameRef.current;
    const cost = CHARM_GACHA.cost * times;
    if (g0.stones < cost || pending.current) return;
    const results = Array.from({ length: times }, () => rollCharm(Math.random));
    setGame((g) => ({ ...g, stones: g.stones - cost }));
    showPull("charm", results, "장신구 뽑기 결과", () => setGame((g) => ({ ...g, charms: [...g.charms, ...results] })));
  };

  // 합성 연출 → 결과 공개 (all이면 가능한 만큼 연속 합성)
  const showMerge = (kind, results, apply) => {
    const id = Date.now();
    pending.current = apply;
    setMergeResult({ id, kind, stage: "merging", results });
    setTimeout(() => {
      if (pending.current !== apply) return;
      pending.current();
      pending.current = null;
      setMergeResult((m) => (m?.id === id ? { ...m, stage: "result" } : m));
      (results.some((r) => r.outcome !== "fail") ? sfx.fanfare : sfx.fail)();
    }, 1500);
  };

  const mergeWorkers = (rarity, all) => {
    if (pending.current) return;
    const workers = { ...gameRef.current.workers };
    const before = gameRef.current.workers;
    const times = all ? Math.floor(rarityCountOf(workers, rarity) / MERGE.count) : 1;
    const results = [];
    for (let i = 0; i < times; i++) {
      const mats = pickMergeMaterials(workers, rarity, MERGE.count);
      if (!mats) break;
      mats.forEach((w) => (workers[w.id] -= 1));
      const outcome = rollMergeOutcome(MERGE, rarity);
      const item = outcome === "fail" ? mats[Math.floor(Math.random() * mats.length)] : pickWorker(rarity + (outcome === "great" ? 2 : 1));
      workers[item.id] = (workers[item.id] || 0) + 1;
      results.push({ outcome, item, mats, isNew: outcome !== "fail" && !before[item.id] });
    }
    if (!results.length) return;
    Object.keys(workers).forEach((k) => !workers[k] && delete workers[k]);
    showMerge("worker", results, () => setGame((g) => ({ ...g, workers })));
  };

  const mergeCharms = (rarity, all) => {
    if (pending.current) return;
    let work = { charms: [...gameRef.current.charms], equipped: gameRef.current.equipped };
    const results = [];
    for (let i = 0; i < (all ? 999 : 1); i++) {
      const mats = pickCharmMaterials(work, rarity, CHARM_MERGE.count);
      if (!mats) break;
      const used = new Set(mats.map((c) => c.uid));
      work = { ...work, charms: work.charms.filter((c) => !used.has(c.uid)) };
      const outcome = rollMergeOutcome(CHARM_MERGE, rarity);
      const item =
        outcome === "fail"
          ? mats[Math.floor(Math.random() * mats.length)]
          : makeCharm(mats[Math.floor(Math.random() * mats.length)].type, rarity + (outcome === "great" ? 2 : 1), Math.random);
      work.charms.push(item);
      results.push({ outcome, item, mats });
    }
    if (!results.length) return;
    const { charms } = work;
    showMerge("charm", results, () => setGame((g) => ({ ...g, charms })));
  };

  const equipCharm = (uid) =>
    setGame((g) => (g.equipped.length >= CHARM_SLOTS || g.equipped.includes(uid) ? g : { ...g, equipped: [...g.equipped, uid] }));
  const unequipCharm = (uid) => setGame((g) => ({ ...g, equipped: g.equipped.filter((u) => u !== uid) }));
  const sellCharm = (uid) =>
    setGame((g) => {
      const c = g.charms.find((item) => item.uid === uid);
      if (!c || g.equipped.includes(uid)) return g;
      return { ...g, gold: g.gold + charmSellOf(c.rarity), charms: g.charms.filter((item) => item.uid !== uid) };
    });

  // 시장: 판 돈은 골드로만 들어가고 랭킹 점수(누적 채굴량)에는 안 들어가요
  const sellByproduct = (id, qty) => {
    const held = gameRef.current.byproducts[id] || 0;
    const n = Math.min(qty, held);
    if (n < 1) return;
    const price = market.priceOf(id);
    setGame((g) => ((g.byproducts[id] || 0) < n ? g : { ...g, gold: g.gold + n * price, byproducts: { ...g.byproducts, [id]: g.byproducts[id] - n } }));
    market.recordSell(id, n);
    showToast(`${BYPRODUCTS.find((b) => b.id === id).name} ${fmt(n)}개 판매 +${fmt(n * price)}`, "#ff6b6b");
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
    const g0 = gameRef.current;
    if (g0.gold < prestigeCostOf(g0.prestiges)) return;
    if (!armPrestige) {
      setArmPrestige(true);
      setTimeout(() => setArmPrestige(false), 3000);
      return;
    }
    setArmPrestige(false);
    setGame((g) => (g.gold < prestigeCostOf(g.prestiges) ? g : rebirthOf(g)));
    setRush({ gauge: 0, until: 0, duration: RUSH.duration });
    bossRef.current = null;
    setBoss(null);
    showBanner("환생 완료!", `💎 +${stonesFor(g0.prestiges)} · 골드 x${prestigeMult(g0.prestiges + 1).toFixed(2)}`, "#ff9ef5");
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

  // 서로 다른 광부를 높은 등급부터 먼저 보여주고, 자리가 남으면 중복으로 채워요
  const ownedWorkers = WORKERS.filter((w) => game.workers[w.id]).sort((a, b) => b.rarity - a.rarity || b.rate - a.rate);
  const walkers = [
    ...ownedWorkers,
    ...ownedWorkers.flatMap((w) => Array.from({ length: Math.min(game.workers[w.id] - 1, MAX_WALKERS) }, () => w)),
  ].slice(0, MAX_WALKERS);
  const dots = {
    workers: adsLeft > 0,
    charms: game.stones >= CHARM_GACHA.cost,
    missions: attendanceDue || QUESTS.some((q, i) => (daily[q.id] || 0) >= q.goal && !daily.claimed[i]),
    prestige: game.gold >= prestigeCostOf(game.prestiges),
  };
  const bossReady = canChallengeBoss(game);
  const top = stageOf(game.stageLevel);
  const nextOre = ORES[top.oreIndex + 1];
  const fighting = Boolean(boss);
  const shownOre = fighting ? stageOf(boss.level).ore : ore;
  const progressNeed = isBossGate(game.stageLevel) ? BOSS.breaksNeeded : STAGE_BREAKS;

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
            <button className="link-btn" onClick={toggleMute} aria-label={muted ? "소리 켜기" : "소리 끄기"}>
              {muted ? "🔇 소리 꺼짐" : "🔊 소리 켜짐"}
            </button>
            {(game.prestiges > 0 || game.stones > 0) && (
              <span className="stone-chip">
                💎 {game.stones} · 환생 {game.prestiges}회
              </span>
            )}
          </div>
        </div>
        <div className="gold-row">
          <CoinIcon size={34} />
          {fmt(game.gold)}
        </div>
        <div className="rate">
          탭 {fmt(stats.tapDamage)} · 치명 {Math.round(stats.critChance * 100)}% · 광부 초당 +{fmt(income, 1)}
        </div>
        <div className={`rush-gauge ${rushing ? "on" : ""}`}>
          <div className="rush-fill" style={{ width: `${(rushing ? rushLeft / rush.duration : rush.gauge) * 100}%` }} />
          <span className="rush-text">{rushing ? `골드 러시 ${Math.ceil(rushLeft)}초` : "빠르게 탭해서 골드 러시 게이지를 채우세요"}</span>
        </div>
      </header>

      <div className="ore-picker" aria-label="캘 광석">
        {ORES.slice(0, top.oreIndex + 2).map((o, i) => {
          const unlocked = i <= top.oreIndex;
          return (
            <button
              key={o.id}
              className={`ore-chip ${stage.oreIndex === i ? "active" : ""} ${unlocked ? "" : "locked"}`}
              style={{ "--oc": o.vein[1] }}
              disabled={!unlocked || fighting}
              onClick={() => selectStage(Math.min(game.stageLevel, i * ORE_LEVELS + ORE_LEVELS - 1))}
            >
              <OreItemIcon ore={o} size={20} />
              <span>{unlocked ? o.name : `👑 ${o.name}`}</span>
            </button>
          );
        })}
      </div>

      <div className="level-picker" aria-label="광석 레벨">
        {Array.from({ length: ORE_LEVELS }, (_, l) => {
          const target = stage.oreIndex * ORE_LEVELS + l;
          const unlocked = target <= game.stageLevel;
          return (
            <button
              key={l}
              className={`level-chip ${game.stage === target ? "active" : ""} ${unlocked ? "" : "locked"} ${isBossGate(target) ? "gate" : ""}`}
              disabled={!unlocked || fighting}
              onClick={() => selectStage(target)}
            >
              {isBossGate(target) ? "👑" : ""}
              {l + 1}
            </button>
          );
        })}
      </div>

      {!fighting && (
        <button className={`boss-bar ${bossReady ? "ready" : ""}`} disabled={!bossReady} onClick={startBoss}>
          {game.stageLevel >= STAGE_COUNT - 1
            ? "⛏️ 모든 광석을 정복했어요!"
            : bossReady
              ? `👑 ${stageNameOf(game.stageLevel)} 보스 도전 · ${BOSS.seconds}초 안에 HP ${fmt(bossHpOf(game.stageLevel))} → ${nextOre.name} 해금`
              : game.stage !== game.stageLevel
                ? `다음 단계는 가장 높은 단계(${stageNameOf(game.stageLevel)})에서 열려요`
                : `${stageNameOf(game.stageLevel)}을 ${progressNeed}번 부수면 ${isBossGate(game.stageLevel) ? "보스 도전" : "다음 레벨"} (${Math.min(game.stageBreaks, progressNeed)}/${progressNeed})`}
        </button>
      )}

      <div
        className={`scene ${rushing ? "rush" : ""} ${fighting ? "boss" : ""} ${shakeUntil > now ? "shaking" : ""} ${skills.golden?.until > now ? "golden" : ""}`}
        ref={sceneRef}
        onPointerDown={tap}
        style={{ "--bg1": shownOre.bg[0], "--bg2": shownOre.bg[1], "--bg3": shownOre.bg[2], "--glow": shownOre.vein[1] }}
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
        {fighting ? (
          <div className="ore-hp boss-hp">
            <span>👑 {stageNameOf(boss.level)} 보스</span>
            <div className="hp-bar">
              <div style={{ width: `${(boss.hp / boss.max) * 100}%` }} />
            </div>
            <span className="hp-text">⏱ {Math.max(0, Math.ceil((boss.until - now) / 1000))}초</span>
          </div>
        ) : (
          <div className="ore-hp">
            <span>
              {game.treasure ? "💰 보물 광석 · " : ""}
              {stageNameOf(game.stage)} · 파괴 {fmt(game.oreBreaks[ore.id] || 0)}회
            </span>
            <div className="hp-bar">
              <div style={{ width: `${(1 - game.oreDamage / oreHpOf(game)) * 100}%` }} />
            </div>
            <span className="hp-text">
              {fmt(Math.max(0, oreHpOf(game) - game.oreDamage))} / {fmt(oreHpOf(game))}
            </span>
          </div>
        )}
        <div key={hit} className={`rock-wrap ${hit ? "hit" : ""} ${game.treasure && !fighting ? "treasure" : ""}`}>
          <OreRock ore={shownOre} damage={fighting ? 1 - boss.hp / boss.max : game.oreDamage / oreHpOf(game)} boss={fighting} />
        </div>
        {weak && (
          <span key={weak.id} className="weak-point" style={{ left: weak.x, top: weak.y }} aria-hidden="true" />
        )}
        {combo >= 5 && (
          <div key={combo >= COMBO.max ? "max" : "c"} className={`combo ${combo >= COMBO.max ? "max" : ""}`}>
            <b>{combo}</b> 콤보 · x{(1 + Math.min(combo, COMBO.max) * COMBO.per).toFixed(2)}
          </div>
        )}
        <div className="ground" />
        {walkers.map((w, i) => (
          <Walker key={i} index={i} look={w.look} rarity={w.rarity} />
        ))}
        {bat && !fighting && (
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
                <ByproductIcon item={item.item} size={24} />
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

      <div className="skill-bar">
        {SKILLS.map((k) => {
          const st = skills[k.id] || {};
          const active = st.until > now;
          const cooling = st.readyAt > now;
          return (
            <button
              key={k.id}
              className={`skill ${active ? "active" : ""} ${cooling && !active ? "cooling" : ""}`}
              disabled={cooling && !active}
              onClick={() => activateSkill(k.id)}
            >
              {cooling && !active && <span className="skill-cd" style={{ height: `${((st.readyAt - now) / (k.cooldown * 1000)) * 100}%` }} />}
              <span className="skill-icon">{k.icon}</span>
              <span className="skill-name">{k.name}</span>
              <span className="skill-state">
                {active ? `${Math.ceil((st.until - now) / 1000)}초 남음` : cooling ? `${Math.ceil((st.readyAt - now) / 1000)}초` : k.desc}
              </span>
            </button>
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
          onMerge={mergeWorkers}
        />
      )}
      {tab === "charms" && (
        <CharmsPanel
          game={game}
          stats={stats}
          onEquip={equipCharm}
          onUnequip={unequipCharm}
          onSell={sellCharm}
          onPull={pullCharms}
          onMerge={mergeCharms}
        />
      )}
      {tab === "market" && <MarketPanel game={game} market={market} onSell={sellByproduct} />}
      {tab === "missions" && <MissionsPanel game={game} attendanceDue={attendanceDue} onClaimQuest={claimQuest} />}
      {tab === "prestige" && <PrestigePanel game={game} armed={armPrestige} armedReset={armReset} onRebirth={rebirth} onReset={resetGame} />}

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

      {askNickname && <NicknameModal initial={game.nickname} canClose={Boolean(game.nickname)} onSave={saveNickname} onClose={() => setAskNickname(false)} />}

      {!askNickname && offline >= 1 && (
        <div className="overlay">
          <div className="modal">
            <div className="rays" />
            <div className="chest">
              <ChestIcon />
            </div>
            <h2>자리를 비운 동안 광부들이 캐 온 골드</h2>
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
          className={`overlay solid pull-overlay r${pullResult.best}`}
          style={{ "--bc": RARITIES[pullResult.best].color }}
          onClick={() => (pullResult.stage === "summon" ? revealPull() : setPullResult(null))}
        >
          {pullResult.stage === "summon" ? (
            <div className="summon">
              <div className="summon-beams">
                {BEAMS.map((deg) => (
                  <span key={deg} style={{ transform: `rotate(${deg}deg)` }} />
                ))}
              </div>
              <div className="summon-orb" />
              <p className="summon-text">{pullResult.best >= 4 ? "강한 기운이 느껴져요…!" : pullResult.kind === "charm" ? "장신구를 꺼내는 중…" : "광부를 부르는 중…"}</p>
              <p className="summon-skip">탭해서 건너뛰기</p>
            </div>
          ) : (
            <div key={pullResult.id} className={`modal pull-modal ${pullResult.best >= 4 ? "jackpot" : ""}`}>
              {pullResult.best >= 4 && <div className="banner-rays" />}
              <h2>{pullResult.best >= 4 ? `${RARITIES[pullResult.best].name} 등장!` : pullResult.title}</h2>
              <div className={`pull-grid ${pullResult.results.length > 1 ? "multi" : ""}`}>
                {pullResult.results.map((item, i) => (
                  <ResultCard key={i} kind={pullResult.kind} item={item} big={pullResult.results.length === 1} delay={i * 0.12} isNew={item.isNew} />
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
        <div className="overlay solid" onClick={() => mergeResult.stage === "result" && setMergeResult(null)}>
          {mergeResult.stage === "merging" ? (
            <div className="merging">
              {mergeResult.results[0].mats.map((m, i) => (
                <span key={i} className={`merge-mat m${i}`}>
                  {mergeResult.kind === "worker" ? <WorkerPortrait worker={m} size={72} /> : <CharmIcon type={m.type} rarity={m.rarity} size={52} />}
                </span>
              ))}
              <div className="merge-core" />
              <p className="summon-text">{mergeResult.results.length > 1 ? `${mergeResult.results.length}번 합성 중…` : "합성 중…"}</p>
            </div>
          ) : (
            <MergeSummary result={mergeResult} />
          )}
        </div>
      )}
    </div>
  );
}

function ResultCard({ kind, item, big, delay = 0, isNew, failed }) {
  return (
    <div className={`pull-card r${item.rarity} ${failed ? "failed" : ""}`} style={{ "--rc": RARITIES[item.rarity].color, animationDelay: `${delay}s` }}>
      {isNew && <span className="new-tag">NEW</span>}
      {kind === "worker" ? (
        <WorkerPortrait worker={item} size={big ? 220 : 52} full={big} />
      ) : (
        <CharmIcon type={item.type} rarity={item.rarity} size={big ? 64 : 38} />
      )}
      <span className="pull-name">{kind === "worker" ? item.name : charmTypeOf(item).name}</span>
      <span className="pull-rarity">{failed ? "돌려받음" : RARITIES[item.rarity].name}</span>
    </div>
  );
}

function MergeSummary({ result }) {
  const { kind, results } = result;
  const count = (o) => results.filter((r) => r.outcome === o).length;
  const best = results.reduce((b, r) => (r.outcome !== "fail" && (!b || r.item.rarity > b.item.rarity) ? r : b), null);
  const single = results.length === 1 ? results[0] : null;
  const outcome = single ? single.outcome : best ? (count("great") ? "great" : "success") : "fail";
  const title = single
    ? { great: "대성공!! 두 등급 상승", success: "합성 성공!", fail: "합성 실패…" }[single.outcome]
    : `${results.length}번 합성 완료`;
  return (
    <div className={`modal merge-modal ${outcome}`} style={{ "--bc": best ? RARITIES[best.item.rarity].color : "#78909c" }}>
      {outcome !== "fail" && <div className="banner-rays" />}
      <h2>{title}</h2>
      {!single && (
        <p className="merge-count">
          대성공 {count("great")} · 성공 {count("success")} · 실패 {count("fail")}
        </p>
      )}
      <div className={`pull-grid ${single ? "" : "multi"}`}>
        {results.map((r, i) => (
          <ResultCard key={i} kind={kind} item={r.item} big={Boolean(single)} delay={i * 0.08} isNew={r.isNew} failed={r.outcome === "fail"} />
        ))}
      </div>
      <button className="ad-btn">
        <span className="ad-label">확인</span>
      </button>
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
