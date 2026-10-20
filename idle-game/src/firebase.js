import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getFirestore,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// .env.local 이 없으면 게스트(로컬 저장) 모드로만 동작
export const firebaseEnabled = Boolean(config.apiKey && config.projectId);

const app = firebaseEnabled ? initializeApp(config) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

export const watchAuth = (callback) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

export const login = () => signInWithPopup(auth, new GoogleAuthProvider());

export const logout = () => signOut(auth);

export const loadPlayer = async (uid) => {
  const snap = await getDoc(doc(db, "players", uid));
  return snap.exists() ? snap.data() : null;
};

// Firestore는 undefined/null 필드를 싫어해서 저장 전에 빈 값을 정리
export const savePlayer = (uid, data) =>
  setDoc(doc(db, "players", uid), {
    ...JSON.parse(JSON.stringify({ ...data, daily: data.daily ?? {} })),
    updatedAt: serverTimestamp(),
  });

export const watchTop3 = (callback) => {
  if (!db) return () => {};
  const top = query(collection(db, "players"), orderBy("totalEarned", "desc"), limit(3));
  return onSnapshot(
    top,
    (snap) =>
      callback(
        snap.docs.map((d) => ({
          uid: d.id,
          nickname: d.data().nickname,
          totalEarned: d.data().totalEarned,
        }))
      ),
    (error) => console.error("랭킹 불러오기 실패", error)
  );
};

// ---------- 광석 시세 (모든 유저 공용) ----------
// market/state: 현재 시세, market_trades/{구간}: 그 20분 동안의 매수·매도량
export const watchMarket = (callback) =>
  onSnapshot(
    doc(db, "market", "state"),
    (snap) => callback(snap.exists() ? snap.data() : null),
    (error) => console.error("시세 불러오기 실패", error)
  );

// 구간이 바뀌었으면 처음 본 유저가 다음 시세를 계산해 저장 (트랜잭션이라 한 번만 반영)
export const advanceMarket = (target, advance, initial) =>
  runTransaction(db, async (tx) => {
    const stateRef = doc(db, "market", "state");
    const snap = await tx.get(stateRef);
    if (!snap.exists()) {
      tx.set(stateRef, initial(target));
      return;
    }
    const state = snap.data();
    if (state.window >= target) return;
    const trades = await tx.get(doc(db, "market_trades", String(state.window)));
    tx.set(stateRef, advance(state, trades.exists() ? trades.data() : null, target));
  });

export const recordTrade = (window, side, oreId, qty) =>
  setDoc(doc(db, "market_trades", String(window)), { [side]: { [oreId]: increment(qty) } }, { merge: true });
