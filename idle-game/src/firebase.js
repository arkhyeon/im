import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
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

export const savePlayer = (uid, data) =>
  setDoc(doc(db, "players", uid), {
    nickname: data.nickname,
    gold: data.gold,
    totalEarned: data.totalEarned,
    clickLevel: data.clickLevel,
    owned: data.owned,
    savedAt: data.savedAt,
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
