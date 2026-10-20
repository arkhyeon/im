import { useEffect, useState } from "react";
import { BYPRODUCTS, BYPRODUCT_PRICE } from "./data";
import { advanceMarket, firebaseEnabled, recordTrade, watchMarket } from "./firebase";

// 부산물 시세: 모두 같은 가격에서 시작해서, 20분마다 그동안 팔린 양으로 다음 가격을 정해요.
// 평균보다 많이 팔린 부산물은 떨어지고, 덜 팔린 부산물은 올라요. 기본가 쪽으로 천천히 되돌아가기도 해요.
export const WINDOW_MS = 20 * 60 * 1000;
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
  prices: Object.fromEntries(BYPRODUCTS.map((b) => [b.id, BYPRODUCT_PRICE])),
  history: Object.fromEntries(BYPRODUCTS.map((b) => [b.id, [BYPRODUCT_PRICE]])),
});

const step = (state, trades, nextWindow, npc) => {
  const rand = seeded(nextWindow * 9973);
  const sells = {};
  for (const b of BYPRODUCTS) {
    sells[b.id] = (trades?.sells?.[b.id] || 0) + (npc ? Math.floor(rand() * 40) : 0); // 혼자 할 때는 가상의 광부들이 팔아요
  }
  const mean = Object.values(sells).reduce((a, v) => a + v, 0) / BYPRODUCTS.length;
  const prices = {};
  const history = {};
  for (const b of BYPRODUCTS) {
    const price = state.prices?.[b.id] ?? BYPRODUCT_PRICE;
    const pressure = (mean - sells[b.id]) / (LIQUIDITY + mean + sells[b.id]);
    const noise = (rand() - 0.5) * 0.12;
    const reversion = 0.08 * Math.log(BYPRODUCT_PRICE / price);
    const next = Math.min(BYPRODUCT_PRICE * 5, Math.max(BYPRODUCT_PRICE * 0.2, price * Math.exp(0.8 * pressure + noise + reversion)));
    const rounded = Math.round(next * 10) / 10;
    prices[b.id] = rounded;
    history[b.id] = [...(state.history?.[b.id] || []), rounded].slice(-HISTORY);
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

const LOCAL_STATE = "byproduct-market-state";
const LOCAL_TRADES = "byproduct-market-trades";
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

  const recordSell = (id, qty) => {
    if (online) {
      recordTrade(current, "sells", id, qty).catch((e) => console.error("거래 기록 실패", e));
      return;
    }
    const saved = readJson(LOCAL_TRADES);
    const trades = saved?.window === current ? saved : { window: current, sells: {} };
    trades.sells[id] = (trades.sells[id] || 0) + qty;
    writeJson(LOCAL_TRADES, trades);
  };

  const priceOf = (id) => state?.prices?.[id] ?? BYPRODUCT_PRICE;

  return { state: state || null, online, now, nextAt: (current + 1) * WINDOW_MS, recordSell, priceOf };
}
