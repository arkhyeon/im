import { useEffect, useState } from "react";
import { ORES } from "./data";
import { advanceMarket, firebaseEnabled, recordTrade, watchMarket } from "./firebase";

// 광석 시세: 20분마다 그동안의 매수·매도량으로 다음 가격을 정해요.
// 많이 팔린 광물은 떨어지고, 안 팔린 광물은 조금씩 오르고, 기본가 쪽으로 천천히 되돌아가요.
export const WINDOW_MS = 20 * 60 * 1000;
export const BUY_SPREAD = 1.05;
const LIQUIDITY = 30;
const HISTORY = 24;
const MAX_STEPS = 500;

export const windowOf = (time = Date.now()) => Math.floor(time / WINDOW_MS);

// 같은 구간이면 모든 기기에서 같은 값이 나오는 난수
const seeded = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const initialMarket = (window) => ({
  window,
  prices: Object.fromEntries(ORES.map((o) => [o.id, o.price])),
  history: Object.fromEntries(ORES.map((o) => [o.id, [o.price]])),
});

const step = (state, trades, nextWindow, npc) => {
  const rand = seeded(nextWindow * 9973);
  const prices = {};
  const history = {};
  for (const o of ORES) {
    const price = state.prices?.[o.id] ?? o.price;
    let buys = trades?.buys?.[o.id] || 0;
    let sells = trades?.sells?.[o.id] || 0;
    if (npc) {
      // 혼자 할 때는 가상의 다른 광부들이 사고팔아요
      buys += Math.floor(rand() * 20);
      sells += Math.floor(rand() * 20);
    }
    const pressure = (buys - sells) / (LIQUIDITY + buys + sells);
    const scarcity = sells === 0 ? 0.04 : 0;
    const noise = (rand() - 0.5) * 0.16;
    const reversion = 0.08 * Math.log(o.price / price);
    const next = Math.min(o.price * 5, Math.max(o.price * 0.2, price * Math.exp(0.7 * pressure + scarcity + noise + reversion)));
    const rounded = next >= 100 ? Math.round(next) : Math.round(next * 100) / 100;
    prices[o.id] = rounded;
    history[o.id] = [...(state.history?.[o.id] || []), rounded].slice(-HISTORY);
  }
  return { window: nextWindow, prices, history };
};

// 밀린 구간이 여러 개면 첫 구간만 실제 거래량을 쓰고 나머지는 거래 없이 진행
export const advanceTo = (state, trades, target, npc = false) => {
  let s = state;
  let first = true;
  let steps = 0;
  while (s.window < target && steps < MAX_STEPS) {
    s = step(s, first ? trades : null, s.window + 1, npc);
    first = false;
    steps++;
  }
  return s.window < target ? { ...s, window: target } : s;
};

const LOCAL_STATE = "ore-market-state";
const LOCAL_TRADES = "ore-market-trades";
const readJson = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
};
const writeJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장이 막힌 브라우저
  }
};

// 로그인하면 전체 유저 공용 시세, 게스트면 이 기기 안의 모의 시세
export function useMarket(uid) {
  const online = Boolean(uid) && firebaseEnabled;
  const [state, setState] = useState(() => (online ? undefined : readJson(LOCAL_STATE) || initialMarket(windowOf())));
  const [now, setNow] = useState(Date.now());
  const current = windowOf(now);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!online) return undefined;
    return watchMarket(setState);
  }, [online]);

  useEffect(() => {
    if (state === undefined) return;
    if (online) {
      if (!state || state.window < current) {
        advanceMarket(current, advanceTo, initialMarket).catch((e) => console.error("시세 갱신 실패", e));
      }
      return;
    }
    if (state.window < current) {
      const trades = readJson(LOCAL_TRADES);
      const next = advanceTo(state, trades?.window === state.window ? trades : null, current, true);
      writeJson(LOCAL_STATE, next);
      setState(next);
    }
  }, [online, current, state]);

  const record = (side, oreId, qty) => {
    if (online) {
      recordTrade(current, side, oreId, qty).catch((e) => console.error("거래 기록 실패", e));
      return;
    }
    const saved = readJson(LOCAL_TRADES);
    const trades = saved?.window === current ? saved : { window: current, buys: {}, sells: {} };
    trades[side][oreId] = (trades[side][oreId] || 0) + qty;
    writeJson(LOCAL_TRADES, trades);
  };

  const priceOf = (oreId) => state?.prices?.[oreId] ?? ORES.find((o) => o.id === oreId).price;

  return { state: state || null, online, now, nextAt: (current + 1) * WINDOW_MS, record, priceOf };
}
