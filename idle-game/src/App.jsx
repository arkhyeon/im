import { useEffect, useRef, useState } from "react";
import { firebaseEnabled, loadPlayer, login, logout, savePlayer, watchAuth, watchTop3 } from "./firebase";
import {
  GENERATORS,
  INITIAL,
  MAX_OFFLINE_SEC,
  MINES,
  PICKAXES,
  RUSH,
  TIERS,
  clickCostOf,
  clickPowerOf,
  costOf,
  fmt,
  genRateOf,
  mineOf,
  normalize,
  pickaxeOf,
  rateOf,
  tierOf,
} from "./game";
import {
  ChestIcon,
  CoinIcon,
  GeneratorIcon,
  GoogleLogo,
  OreRock,
  PickaxeIcon,
  TierAura,
  Walker,
} from "./art";

const MACHINE_LIMITS = { drill: 3, factory: 2, bank: 2 };
const MAX_WALKERS = 8;
const MEDALS = ["🥇", "🥈", "🥉"];

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
const offlineSecSince = (time) =>
  Math.min(Math.max((Date.now() - time) / 1000, 0), MAX_OFFLINE_SEC);

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
        <OreRock mine={MINES[0]} />
      </div>
      <h1 className="title">광석 캐기</h1>
      <p className="subtitle">탭해서 캐고, 일꾼을 모으고, 랭킹 1위를 노려 보세요</p>
      {firebaseEnabled && (
        <button className="google-btn" onClick={handleLogin} disabled={busy}>
          <GoogleLogo />
          {busy ? "로그인 중..." : "Google로 로그인"}
        </button>
      )}
      <button className="guest-btn" onClick={onGuest}>
        게스트로 하기{firebaseEnabled ? " (랭킹 미참여)" : ""}
      </button>
      {!firebaseEnabled && <p className="note">Firebase 설정 전이라 게스트 모드로만 할 수 있어요.</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

function Game({ user, onExit }) {
  const uid = user?.uid ?? null;
  const [loaded, setLoaded] = useState(false);
  const [game, setGame] = useState(() => normalize(null));
  const [offline, setOffline] = useState(0);
  const [askNickname, setAskNickname] = useState(false);
  const [top3, setTop3] = useState([]);
  const [rush, setRush] = useState({ gauge: 0, until: 0 });
  const [watchingAd, setWatchingAd] = useState(false);
  const [fx, setFx] = useState([]);
  const [hit, setHit] = useState(0);
  const [popKey, setPopKey] = useState({});
  const [banner, setBanner] = useState(null);
  const [armReset, setArmReset] = useState(false);

  const gameRef = useRef(game);
  gameRef.current = game;
  const rushRef = useRef(rush);
  rushRef.current = rush;
  const fxId = useRef(0);
  const sceneRef = useRef(null);
  const prevMine = useRef(null);
  const displayName = useRef(user?.displayName);

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
      if (saved?.savedAt) setOffline(rateOf(state.owned) * offlineSecSince(saved.savedAt));
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [uid]);

  useEffect(() => watchTop3(setTop3), []);

  // 0.1초마다 생산 + 골드 러시 게이지 감소/종료
  useEffect(() => {
    let last = Date.now();
    const id = setInterval(() => {
      const now = Date.now();
      const dt = Math.min((now - last) / 1000, 1);
      last = now;
      const rushing = rushRef.current.until > now;
      setGame((g) => {
        const gain = rateOf(g.owned) * (rushing ? RUSH.rateMult : 1) * dt;
        return gain ? { ...g, gold: g.gold + gain, totalEarned: g.totalEarned + gain } : g;
      });
      setRush((r) => {
        if (r.until) return r.until <= now ? { gauge: 0, until: 0 } : r;
        return r.gauge > 0 ? { gauge: Math.max(0, r.gauge - RUSH.decay * dt), until: 0 } : r;
      });
    }, 100);
    return () => clearInterval(id);
  }, []);

  // 로컬은 5초마다, 서버는 30초마다 + 앱을 내릴 때 저장
  useEffect(() => {
    if (!loaded) return;
    let hiddenAt = null;
    const snapshot = () => ({ ...gameRef.current, savedAt: Date.now() });
    const saveLocal = () => writeLocal(uid, snapshot());
    const saveRemote = () => {
      if (uid) savePlayer(uid, snapshot()).catch((e) => console.error("저장 실패", e));
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
        saveLocal();
        saveRemote();
      } else if (hiddenAt) {
        const reward = rateOf(gameRef.current.owned) * offlineSecSince(hiddenAt);
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

  const showBanner = (title, sub, color = "#ffd54a") => {
    const id = Date.now() + Math.random();
    setBanner({ id, title, sub, color });
    setTimeout(() => setBanner((b) => (b?.id === id ? null : b)), 2400);
  };

  // 누적 채굴량이 늘어 새 광산으로 바뀌면 알림
  const mineIndex = mineOf(game.totalEarned);
  const mine = MINES[mineIndex];
  useEffect(() => {
    if (!loaded) return;
    if (prevMine.current !== null && mineIndex > prevMine.current) {
      showBanner("새 광산 발견!", MINES[mineIndex].name, MINES[mineIndex].vein[1]);
    }
    prevMine.current = mineIndex;
  }, [mineIndex, loaded]);

  const now = Date.now();
  const rushing = rush.until > now;
  const rushLeft = rushing ? (rush.until - now) / 1000 : 0;
  const clickPower = clickPowerOf(game.clickLevel);
  const rate = rateOf(game.owned) * (rushing ? RUSH.rateMult : 1);

  const spawnFx = (x, y, amount, big) => {
    const items = [{ id: ++fxId.current, type: "text", x, y, text: `+${fmt(amount)}`, big }];
    for (let i = 0; i < (big ? 9 : 6); i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * (big ? 80 : 50);
      items.push({
        id: ++fxId.current,
        type: "coin",
        x,
        y,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist - 30,
      });
    }
    const ids = new Set(items.map((item) => item.id));
    setFx((f) => [...f, ...items]);
    setTimeout(() => setFx((f) => f.filter((item) => !ids.has(item.id))), 900);
  };

  const tap = (e) => {
    const rect = sceneRef.current.getBoundingClientRect();
    const isRushing = rushRef.current.until > Date.now();
    const gain = clickPower * (isRushing ? RUSH.tapMult : 1);
    spawnFx(e.clientX - rect.left, e.clientY - rect.top, gain, isRushing);
    setHit((h) => h + 1);
    setGame((g) => ({ ...g, gold: g.gold + gain, totalEarned: g.totalEarned + gain }));
    if (isRushing) return;
    if (rushRef.current.gauge + RUSH.perTap >= 1) {
      showBanner("골드 러시!", `${RUSH.duration}초 동안 탭 x${RUSH.tapMult} · 생산 x${RUSH.rateMult}`);
    }
    setRush((r) => {
      if (r.until) return r;
      const gauge = r.gauge + RUSH.perTap;
      return gauge >= 1 ? { gauge: 1, until: Date.now() + RUSH.duration * 1000 } : { gauge, until: 0 };
    });
  };

  const flash = (id) => setPopKey((p) => ({ ...p, [id]: (p[id] || 0) + 1 }));

  const buyGenerator = (gen) => {
    const count = gameRef.current.owned[gen.id];
    if (gameRef.current.gold < costOf(gen, count)) return;
    setGame((g) => {
      const cost = costOf(gen, g.owned[gen.id]);
      if (g.gold < cost) return g;
      return { ...g, gold: g.gold - cost, owned: { ...g.owned, [gen.id]: g.owned[gen.id] + 1 } };
    });
    flash(gen.id);
    const nextTier = tierOf(count + 1);
    if (nextTier > tierOf(count)) {
      showBanner(`${gen.name} ${TIERS[nextTier].name} 달성!`, "생산량 x2", TIERS[nextTier].color);
    }
  };

  const buyClick = () => {
    const level = gameRef.current.clickLevel;
    if (gameRef.current.gold < clickCostOf(level)) return;
    setGame((g) => {
      const cost = clickCostOf(g.clickLevel);
      if (g.gold < cost) return g;
      return { ...g, gold: g.gold - cost, clickLevel: g.clickLevel + 1 };
    });
    flash("click");
    const nextMaterial = pickaxeOf(level + 1);
    if (nextMaterial > pickaxeOf(level)) {
      showBanner(`${PICKAXES[nextMaterial].name} 획득!`, "탭 파워 x2", PICKAXES[nextMaterial].head);
    }
  };

  const claimOffline = (multiplier) => {
    const reward = offline * multiplier;
    setGame((g) => ({ ...g, gold: g.gold + reward, totalEarned: g.totalEarned + reward }));
    setOffline(0);
  };

  // TODO: 스토어 출시 시 AdMob 보상형 광고로 교체 (광고 완료 콜백에서 claimOffline(2))
  const watchAd = () => {
    setWatchingAd(true);
    setTimeout(() => {
      setWatchingAd(false);
      claimOffline(2);
    }, 2000);
  };

  const saveNickname = (nickname) => {
    setGame((g) => ({ ...g, nickname }));
    setAskNickname(false);
    if (uid) {
      savePlayer(uid, { ...gameRef.current, nickname, savedAt: Date.now() }).catch((e) =>
        console.error("저장 실패", e)
      );
    }
  };

  const handleLogout = async () => {
    try {
      await savePlayer(uid, { ...gameRef.current, savedAt: Date.now() });
    } catch (e) {
      console.error("저장 실패", e);
    }
    logout();
  };

  const handleGuestLogin = () => {
    writeLocal(null, { ...gameRef.current, savedAt: Date.now() });
    onExit();
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

  const walkers = Array.from({ length: Math.min(game.owned.miner, MAX_WALKERS) }, (_, i) => i);
  const machines = GENERATORS.filter((g) => MACHINE_LIMITS[g.id]).flatMap((g) =>
    Array.from({ length: Math.min(game.owned[g.id], MACHINE_LIMITS[g.id]) }, (_, i) => ({
      key: `${g.id}-${i}`,
      id: g.id,
      delay: i * 0.4,
    }))
  );

  if (!loaded) return <div className="splash">광산 여는 중...</div>;

  return (
    <div className={`game ${rushing ? "is-rush" : ""}`}>
      <header className="hud">
        <div className="hud-top">
          <section className="ranking" aria-label="랭킹">
            <div className="ranking-title">🏆 랭킹 TOP 3</div>
            {top3.length === 0 ? (
              <div className="ranking-empty">
                {firebaseEnabled ? "아직 기록이 없어요" : "로그인하면 랭킹에 올라가요"}
              </div>
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
          </div>
        </div>
        <div className="gold-row">
          <CoinIcon size={34} />
          {fmt(game.gold)}
        </div>
        <div className="rate">
          초당 +{fmt(rate, 1)} · {mine.name}
        </div>
        <div className={`rush-gauge ${rushing ? "on" : ""}`}>
          <div className="rush-fill" style={{ width: `${(rushing ? rushLeft / RUSH.duration : rush.gauge) * 100}%` }} />
          <span className="rush-text">
            {rushing ? `골드 러시 ${Math.ceil(rushLeft)}초` : "빠르게 탭해서 골드 러시 게이지를 채우세요"}
          </span>
        </div>
      </header>

      <div
        className={`scene ${rushing ? "rush" : ""}`}
        ref={sceneRef}
        onPointerDown={tap}
        style={{ "--bg1": mine.bg[0], "--bg2": mine.bg[1], "--bg3": mine.bg[2], "--glow": mine.vein[1] }}
      >
        {DUST.map((d, i) => (
          <span key={i} className="dust" style={{ left: d.left, top: d.top, animationDelay: d.delay }} />
        ))}
        {rushing &&
          RAIN.map((c, i) => (
            <span
              key={i}
              className="rain"
              style={{ left: c.left, animationDelay: c.delay, animationDuration: c.duration }}
            >
              <CoinIcon size={16} />
            </span>
          ))}
        {game.totalEarned < 10 && <div className="hint">광석을 톡톡 캐 보세요!</div>}
        <div key={hit} className={`rock-wrap ${hit ? "hit" : ""}`}>
          <OreRock mine={mine} />
        </div>
        <div className="ground">
          {machines.map((m) => (
            <GeneratorIcon key={m.key} id={m.id} size={40} delay={m.delay} tier={tierOf(game.owned[m.id])} />
          ))}
        </div>
        {walkers.map((i) => (
          <Walker key={i} index={i} tier={tierOf(game.owned.miner)} />
        ))}
        {fx.map((item) =>
          item.type === "text" ? (
            <span
              key={item.id}
              className={`fx-text ${item.big ? "big" : ""}`}
              style={{ left: item.x, top: item.y }}
            >
              {item.text}
            </span>
          ) : (
            <span
              key={item.id}
              className="fx-coin"
              style={{ left: item.x, top: item.y, "--dx": `${item.dx}px`, "--dy": `${item.dy}px` }}
            >
              <CoinIcon size={18} />
            </span>
          )
        )}
      </div>

      <div className="shop">
        <ShopCard
          popKey={popKey.click}
          icon={<PickaxeIcon size={48} level={game.clickLevel} />}
          tier={Math.min(pickaxeOf(game.clickLevel), TIERS.length - 1)}
          name={PICKAXES[pickaxeOf(game.clickLevel)].name}
          badge={`Lv.${game.clickLevel}`}
          desc={`탭당 +${fmt(clickPower)} → +${fmt(clickPowerOf(game.clickLevel + 1))}`}
          cost={clickCostOf(game.clickLevel)}
          canBuy={game.gold >= clickCostOf(game.clickLevel)}
          onBuy={buyClick}
        />
        {GENERATORS.map((gen) => {
          const count = game.owned[gen.id];
          const tier = tierOf(count);
          const next = TIERS[tier + 1];
          const cost = costOf(gen, count);
          return (
            <ShopCard
              key={gen.id}
              popKey={popKey[gen.id]}
              icon={<GeneratorIcon id={gen.id} size={48} tier={tier} />}
              tier={tier}
              name={`${gen.name} · ${TIERS[tier].name}`}
              badge={`x${count}`}
              desc={
                `초당 +${fmt(genRateOf(gen, count), 1)}` +
                (next ? ` · ${next.name}까지 ${next.min - count}개` : " · 최고 티어")
              }
              cycle={count > 0 ? gen.cycle : 0}
              cost={cost}
              canBuy={game.gold >= cost}
              onBuy={() => buyGenerator(gen)}
            />
          );
        })}
        <button className="reset" onClick={resetGame}>
          {armReset ? "한 번 더 누르면 처음부터 시작해요" : "초기화"}
        </button>
      </div>

      {banner && (
        <div key={banner.id} className="banner" style={{ "--bc": banner.color }}>
          <div className="banner-rays" />
          <div className="banner-title">{banner.title}</div>
          <div className="banner-sub">{banner.sub}</div>
        </div>
      )}

      {askNickname && (
        <NicknameModal
          initial={game.nickname}
          canClose={Boolean(game.nickname)}
          onSave={saveNickname}
          onClose={() => setAskNickname(false)}
        />
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
            <button className="ad-btn" onClick={watchAd} disabled={watchingAd}>
              {watchingAd && <span className="ad-progress" />}
              <span className="ad-label">{watchingAd ? "광고 시청 중..." : "📺 광고 보고 2배 받기"}</span>
            </button>
            <button className="plain-btn" onClick={() => claimOffline(1)} disabled={watchingAd}>
              그냥 받기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ShopCard({ popKey, icon, tier, name, badge, desc, cycle, cost, canBuy, onBuy }) {
  return (
    <div
      key={popKey}
      className={`card ${popKey ? "pop" : ""} ${tier ? "tiered" : ""}`}
      style={{ "--tc": TIERS[tier].color }}
    >
      <div className="icon-box">
        <TierAura tier={tier} />
        <div className="icon-inner">{icon}</div>
      </div>
      <div className="info">
        <div className="name">
          {name} <span className="badge">{badge}</span>
        </div>
        <div className="desc">{desc}</div>
        {cycle !== undefined && (
          <div className={`bar ${cycle ? "on" : ""}`}>
            <div style={{ animationDuration: `${cycle}s` }} />
          </div>
        )}
      </div>
      <button className={`buy ${canBuy ? "ready" : ""}`} onClick={onBuy} disabled={!canBuy}>
        <CoinIcon size={16} />
        {fmt(cost)}
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
        <input
          id="nickname"
          className="nick-input"
          value={value}
          maxLength={12}
          autoFocus
          onChange={(e) => setValue(e.target.value)}
        />
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
