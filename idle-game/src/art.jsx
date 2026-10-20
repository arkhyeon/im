import { useId } from "react";
import { MATERIALS, RARITIES } from "./data";

/* 모든 그림은 이미지 파일 없이 SVG로 그려요. 재질·등급이 오를수록 색과 장식이 바뀌어요. */

function Sparkle({ x, y, size = 1, delay = 0, color = "#fffbe0" }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      <path
        className="twinkle"
        style={{ animationDelay: `${delay}s` }}
        d="M0 -9 L2 -2 L9 0 L2 2 L0 9 L-2 2 L-9 0 L-2 -2 Z"
        fill={color}
      />
    </g>
  );
}

export function CoinIcon({ size = 28 }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <circle cx="16" cy="17" r="14" fill="#c98a00" />
      <circle cx="16" cy="15" r="14" fill="#f5b301" />
      <circle cx="16" cy="15" r="10" fill="#ffd54a" />
      <path d="M16 9 L18 13.5 L23 14 L19 17 L20.5 22 L16 19 L11.5 22 L13 17 L9 14 L14 13.5 Z" fill="#f5b301" />
      <ellipse cx="11" cy="9" rx="3" ry="1.6" fill="#fff6c8" opacity=".8" />
    </svg>
  );
}

// 광석 덩어리. damage(0~1)가 클수록 금이 더 많이 가요.
export function OreRock({ ore, damage = 0, boss = false }) {
  const [top, light, left, right, front] = ore.faces;
  const [v1, v2, v3] = ore.vein;
  const crack = (min) => ({ opacity: damage > min ? 1 : 0, transition: "opacity .15s" });
  return (
    <svg viewBox="0 0 200 180" width="200" height="180" className="rock" aria-hidden="true">
      <defs>
        <linearGradient id={`vein-${ore.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={v1} />
          <stop offset=".5" stopColor={v2} />
          <stop offset="1" stopColor={v3} />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="168" rx="78" ry="10" fill="rgba(0,0,0,.4)" />
      <path d="M28 150 L16 100 L46 52 L96 30 L152 44 L184 96 L172 150 Q100 172 28 150 Z" fill={top} />
      <path d="M46 52 L96 30 L152 44 L124 74 L72 78 Z" fill={light} />
      <path d="M16 100 L46 52 L72 78 L58 126 L28 150 Z" fill={left} />
      <path d="M152 44 L184 96 L172 150 L140 116 L124 74 Z" fill={right} />
      <path d="M58 126 L72 78 L124 74 L140 116 L100 140 Z" fill={front} />
      {[
        "92,92 104,70 118,92 104,112",
        "56,104 64,90 72,104 64,116",
        "136,82 144,70 152,84 144,94",
        "118,124 124,114 132,126 124,134",
        "82,58 88,48 96,58 88,66",
      ].map((points) => (
        <polygon key={points} points={points} fill={`url(#vein-${ore.id})`} />
      ))}
      <g stroke="#120a18" strokeWidth="3" strokeLinecap="round" fill="none">
        <path style={crack(0.2)} d="M100 34 L94 52 L104 62 L96 76" />
        <path style={crack(0.45)} d="M30 110 L50 112 L58 124 L76 128" />
        <path style={crack(0.65)} d="M176 100 L156 108 L150 124 L132 130 L128 146" />
        <path style={crack(0.85)} d="M70 80 L84 96 L80 112 L94 124 L90 142" />
      </g>
      {boss ? (
        <g className="boss-face">
          <path d="M70 26 L78 8 L90 22 L100 4 L110 22 L122 8 L130 26 Z" fill="#ffd54a" stroke="#c98a00" strokeWidth="2" />
          <path d="M62 78 L88 88 M138 78 L112 88" stroke="#1a0a12" strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="80" cy="98" rx="10" ry="8" fill="#fff" />
          <ellipse cx="120" cy="98" rx="10" ry="8" fill="#fff" />
          <circle cx="82" cy="99" r="4.5" fill="#d50000" />
          <circle cx="118" cy="99" r="4.5" fill="#d50000" />
          <path d="M78 124 L86 118 L94 124 L100 118 L106 124 L114 118 L122 124" stroke="#1a0a12" strokeWidth="4" fill="none" strokeLinejoin="round" />
        </g>
      ) : (
        <>
          <Sparkle x={104} y={74} />
          <Sparkle x={62} y={92} delay={0.5} />
          <Sparkle x={146} y={72} delay={1} />
          <Sparkle x={126} y={118} delay={0.3} />
        </>
      )}
    </svg>
  );
}

// 시장에서 파는 부산물
export function ByproductIcon({ item, size = 28 }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <path d="M6 20 Q4 11 12 7 Q20 3 26 10 Q31 17 25 24 Q18 30 10 27 Q6 25 6 20 Z" fill={item.color} stroke="rgba(0,0,0,.4)" strokeWidth="1.5" />
      <path d="M11 12 Q15 8 20 10" stroke="rgba(255,255,255,.7)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="18" cy="20" r="2" fill="rgba(0,0,0,.18)" />
      <circle cx="12" cy="19" r="1.4" fill="rgba(0,0,0,.18)" />
    </svg>
  );
}

// 시장에서 사고파는 광석 아이템
export function OreItemIcon({ ore, size = 28 }) {
  const [v1, v2, v3] = ore.vein;
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <path d="M8 6 L24 6 L30 13 L16 29 L2 13 Z" fill={v2} />
      <path d="M8 6 L16 13 L24 6 Z" fill={v1} />
      <path d="M2 13 L16 13 L16 29 Z" fill={v3} />
      <path d="M16 13 L30 13 L16 29 Z" fill={v2} opacity=".75" />
      <path d="M2 13 L8 6 L16 13 Z M16 13 L24 6 L30 13 Z" fill={v1} opacity=".6" />
    </svg>
  );
}

// ---------- 광부 (미소녀) ----------
// viewBox 64×88 세로 그림. size는 높이(px)예요.
const BACK_HAIR = {
  long: <path d="M14 24 Q9 50 15 68 L21 62 L25 69 L32 64 L39 69 L43 62 L49 68 Q55 50 50 24 Z" />,
  ponytail: <path d="M44 10 Q63 14 59 42 Q57 58 49 68 Q53 50 49 34 Q47 22 41 16 Z" />,
  twin: (
    <>
      <path d="M19 15 Q1 28 6 54 Q8 66 4 76 Q15 68 17 52 Q19 34 23 22 Z" />
      <path d="M45 15 Q63 28 58 54 Q56 66 60 76 Q49 68 47 52 Q45 34 41 22 Z" />
    </>
  ),
  bob: <path d="M14 24 Q11 42 17 48 L47 48 Q53 42 50 24 Z" />,
  braid: (
    <>
      <path d="M14 24 Q12 40 18 46 L46 46 Q52 40 50 24 Z" />
      {[38, 45, 52, 59].map((y, i) => (
        <ellipse key={y} cx={47 + i * 0.6} cy={y} rx="4" ry="4.2" />
      ))}
    </>
  ),
  bun: (
    <>
      <path d="M14 24 Q11 44 18 50 L46 50 Q53 44 50 24 Z" />
      <circle cx="32" cy="4" r="6.5" />
    </>
  ),
};

export function WorkerIcon({ look, rarity = 0, size = 52, delay = 0, still = false }) {
  const uid = useId().replace(/:/g, "");
  const has = (key) => look.extra?.split(" ").includes(key);
  const skin = look.skin || "#ffe6d5";
  const accent = RARITIES[rarity].color;
  const classes = [has("spirit") ? "spirit-glow" : "", rarity >= 8 ? "rainbow-glow" : ""].join(" ");
  const eye = (cx, flip) => (
    <g>
      <ellipse cx={cx} cy="29" rx="3.7" ry="4.6" fill="#fff" />
      <ellipse cx={cx} cy="29.4" rx="3.1" ry="4.1" fill={`url(#iris-${uid})`} />
      <ellipse cx={cx} cy="30" rx="1.4" ry="2.1" fill="rgba(20,10,20,.75)" />
      <circle cx={cx - 1.2} cy="27.3" r="1.25" fill="#fff" />
      <circle cx={cx + 1.1} cy="31.4" r=".6" fill="#fff" />
      <path
        d={flip ? `M${cx + 4} 25.4 Q${cx} 23.6 ${cx - 3.9} 25.6 L${cx - 4.8} 25` : `M${cx - 4} 25.4 Q${cx} 23.6 ${cx + 3.9} 25.6 L${cx + 4.8} 25`}
        stroke="#2b1a24"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
  return (
    <svg viewBox="0 0 64 88" width={size * (64 / 88)} height={size} className={classes} aria-hidden="true">
      <defs>
        <linearGradient id={`iris-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1020" />
          <stop offset=".45" stopColor={look.eyes} />
          <stop offset="1" stopColor="#fff" stopOpacity=".9" />
        </linearGradient>
        <linearGradient id={`hair-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={look.hair} />
          <stop offset="1" stopColor={look.hair} stopOpacity=".78" />
        </linearGradient>
      </defs>
      <g className={still ? "" : "bob"} style={{ animationDelay: `${delay}s` }}>
        {has("cape") && <path d="M21 44 L10 84 L54 84 L43 44 Z" fill={accent} opacity=".85" />}
        {has("tail") && <path d="M42 66 Q60 68 60 54 Q62 46 56 43 Q57 58 42 61 Z" fill={look.hair} />}
        <g fill={`url(#hair-${uid})`}>
          <ellipse cx="32" cy="23" rx="18" ry="18" />
          {BACK_HAIR[look.style]}
        </g>
        {look.style === "twin" && (
          <>
            <path d="M16 14 L21 12 L20 19 Z M14 18 L20 16 L18 22 Z" fill={look.accent} />
            <path d="M48 14 L43 12 L44 19 Z M50 18 L44 16 L46 22 Z" fill={look.accent} />
          </>
        )}
        {look.style === "ponytail" && <path d="M41 13 L46 9 L47 15 Z" fill={look.accent} />}
        <g className={still ? "" : "swing"} style={{ transformOrigin: "47px 54px", animationDelay: `${delay}s` }}>
          <rect x="46" y="30" width="2.6" height="28" rx="1.3" fill={rarity >= 4 ? "#4a148c" : "#8b5a2b"} />
          <path d="M37 32 Q47 23 58 31 L56 34 Q47 28 39 35 Z" fill={rarity ? accent : "#b0bec5"} />
        </g>
        <rect x="26" y="68" width="4.6" height="12" rx="2" fill={skin} />
        <rect x="33.4" y="68" width="4.6" height="12" rx="2" fill={skin} />
        <path d="M24.5 77 h7 a1 1 0 0 1 1 1 v4 a2 2 0 0 1 -2 2 h-6.5 a2 2 0 0 1 -2 -2 v-2 z" fill="#5d4037" />
        <path d="M32.5 77 h7 l1 3 v2 a2 2 0 0 1 -2 2 h-6 a2 2 0 0 1 -2 -2 v-4 z" fill="#5d4037" />
        <rect x="24.5" y="76" width="8" height="2" fill={look.accent} />
        <rect x="31.5" y="76" width="8" height="2" fill={look.accent} />
        <path d="M24 46 Q32 43 40 46 L42 58 L22 58 Z" fill={look.outfit} />
        <path d="M22 57 L42 57 L49 70 Q32 74 15 70 Z" fill={look.outfit} />
        <path d="M15 70 Q17.5 72.5 20 70.6 Q22.5 73 25 71.2 Q27.5 73.6 30 71.6 Q32.5 74 35 71.6 Q37.5 73.6 40 71.2 Q42.5 73 45 70.6 Q47.5 72.5 49 70 L49 71.5 Q32 76 15 71.5 Z" fill="#fff" opacity=".9" />
        <path d="M22.5 58 L41.5 58" stroke="rgba(0,0,0,.25)" strokeWidth="1.4" />
        <path d="M26 45.5 L32 51 L38 45.5 L35 45 L32 48 L29 45 Z" fill="#fff" />
        <path d="M29.5 50 Q32 52.5 34.5 50 L36 54 L32 52 L28 54 Z" fill={look.accent} />
        {has("dynamite") && (
          <>
            <rect x="23" y="58" width="2.4" height="7" rx="1" fill="#d32f2f" />
            <rect x="26" y="58" width="2.4" height="7" rx="1" fill="#d32f2f" />
          </>
        )}
        {has("golem") && (
          <>
            <path d="M16 50 L22 43.5 L26 48 L20 53 Z" fill="#9e9e9e" stroke="#616161" strokeWidth="1" />
            <path d="M48 50 L42 43.5 L38 48 L44 53 Z" fill="#9e9e9e" stroke="#616161" strokeWidth="1" />
          </>
        )}
        <path d="M23.5 46.5 Q19 50 19.5 57" stroke={look.outfit} strokeWidth="4.4" fill="none" strokeLinecap="round" />
        <path d="M40.5 46.5 Q45 49 46.5 54" stroke={look.outfit} strokeWidth="4.4" fill="none" strokeLinecap="round" />
        <circle cx="19.6" cy="58.6" r="2.3" fill={skin} />
        <circle cx="46.8" cy="55.6" r="2.3" fill={skin} />
        <rect x="29.5" y="40" width="5" height="6" fill={skin} />
        <path d="M18 25 Q18 11 32 11 Q46 11 46 25 Q46 37 32 43 Q18 37 18 25 Z" fill={skin} />
        {eye(26.3, false)}
        {eye(37.7, true)}
        <path d="M23.6 21 Q26 19.9 28.4 20.6 M35.6 20.6 Q38 19.9 40.4 21" stroke={look.hair} strokeWidth=".8" fill="none" strokeLinecap="round" opacity=".8" />
        <ellipse cx="23" cy="34" rx="2.6" ry="1.3" fill="#ff8a95" opacity=".5" />
        <ellipse cx="41" cy="34" rx="2.6" ry="1.3" fill="#ff8a95" opacity=".5" />
        <path d="M30.6 36 Q32 37.4 33.4 36" stroke="#c2185b" strokeWidth="1" fill="none" strokeLinecap="round" />
        <g fill={`url(#hair-${uid})`}>
          <path d="M18.5 22 Q15 38 17.5 50 Q20.5 40 21.5 28 Z" />
          <path d="M45.5 22 Q49 38 46.5 50 Q43.5 40 42.5 28 Z" />
          <path d="M16.5 27 Q15 8 32 7 Q49 8 47.5 27 Q45.5 18 41.5 16 L40 24 Q37.5 17 34.5 15.5 L32.5 23 Q30 16 27.5 16 L25 24 Q22.5 17 19.5 20 Z" />
        </g>
        <path d="M21 15 Q32 8 43 15" stroke="#fff" strokeOpacity=".4" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        {has("helmet") && (
          <>
            <path d="M15.5 17 A16.5 12.5 0 0 1 48.5 17 Z" fill={look.accent} />
            <path d="M20 12 Q32 5 44 12" stroke="#fff" strokeOpacity=".45" strokeWidth="1.6" fill="none" />
            <rect x="13.5" y="15.6" width="37" height="3" rx="1.5" fill="rgba(0,0,0,.22)" />
            <circle cx="32" cy="9.5" r="2.8" fill="#fff59d" stroke="#f9a825" strokeWidth=".8" />
          </>
        )}
        {has("goggles") && (
          <>
            <rect x="16" y="11" width="32" height="2.8" fill="#5d4037" />
            <circle cx="25" cy="12.4" r="4.2" fill={look.accent} stroke="#5d4037" strokeWidth="1.5" />
            <circle cx="39" cy="12.4" r="4.2" fill={look.accent} stroke="#5d4037" strokeWidth="1.5" />
            <circle cx="23.6" cy="11" r="1.2" fill="#fff" opacity=".8" />
            <circle cx="37.6" cy="11" r="1.2" fill="#fff" opacity=".8" />
          </>
        )}
        {has("wizard") && (
          <>
            <path d="M15 14 L37 -8 L49 14 Z" fill={look.outfit} />
            <ellipse cx="32" cy="14" rx="20" ry="3.4" fill={look.outfit} />
            <path d="M18 12.5 L46 12.5" stroke={look.accent} strokeWidth="2" />
            <Sparkle x={34} y={3} size={0.35} delay={delay} color="#fff59d" />
          </>
        )}
        {has("horns") && <path d="M20 11 Q13 3 16 -2 Q20 6 24 9 Z M44 11 Q51 3 48 -2 Q44 6 40 9 Z" fill="#fff3e0" stroke="#bcaaa4" strokeWidth=".8" />}
        {has("crown") && <path d="M24 9 L26 2 L32 6.5 L38 2 L40 9 Z" fill="#ffd54a" stroke="#c98a00" strokeWidth="1" />}
        {has("golem") && <path d="M41 9 L44.5 3 L48 9 L44.5 13 Z" fill={look.accent} stroke="#fff" strokeWidth=".8" />}
        {has("spirit") && (
          <g fill={accent}>
            <circle cx="44" cy="11" r="2.4" />
            <circle cx="47.5" cy="9" r="1.8" />
            <circle cx="47.5" cy="13.4" r="1.8" />
            <circle cx="40.5" cy="9" r="1.8" />
            <circle cx="44" cy="11" r="1.1" fill="#fff" />
          </g>
        )}
        {has("halo") && <ellipse cx="32" cy="1.5" rx="11" ry="2.6" fill="none" stroke="#fff59d" strokeWidth="2" />}
        {rarity >= 4 && <Sparkle x={57} y={10} size={0.5} delay={delay + 0.4} color={accent} />}
        {rarity >= 6 && <Sparkle x={7} y={40} size={0.45} delay={delay + 0.9} color={accent} />}
      </g>
    </svg>
  );
}

// 일러스트가 있는 광부는 그림 파일로, 없으면 SVG로 보여줘요.
// src/assets/workers/광부ID.webp(또는 .png) 파일만 넣으면 자동으로 바뀌어요.
const WORKER_ART = import.meta.glob("./assets/workers/*.{webp,png,jpg}", { eager: true, import: "default" });
export const workerArtOf = (id) =>
  WORKER_ART[`./assets/workers/${id}.webp`] || WORKER_ART[`./assets/workers/${id}.png`] || WORKER_ART[`./assets/workers/${id}.jpg`] || null;

// full: 카드 그림 전체, 아니면 얼굴 중심으로 자른 정사각형 썸네일
export function WorkerPortrait({ worker, size = 56, full = false }) {
  const art = workerArtOf(worker.id);
  if (!art) return <WorkerIcon look={worker.look} rarity={worker.rarity} size={size} still />;
  return (
    <img
      src={art}
      alt=""
      className={`worker-art ${full ? "full" : "thumb"}`}
      style={full ? { height: size } : { width: size, height: size }}
      draggable={false}
    />
  );
}

// 배경을 지운 걷기용 그림 (src/assets/sprites/광부ID.webp). 없으면 SVG 꼬마 광부로 걸어요.
const WORKER_SPRITES = import.meta.glob("./assets/sprites/*.{webp,png}", { eager: true, import: "default" });
export const workerSpriteOf = (id) => WORKER_SPRITES[`./assets/sprites/${id}.webp`] || WORKER_SPRITES[`./assets/sprites/${id}.png`] || null;

// 광석까지 걸어가서 캐고, 광석 자루를 메고 돌아가는 광부
export function Walker({ index, worker }) {
  const sprite = workerSpriteOf(worker.id);
  const fromLeft = index % 2 === 0;
  const lane = Math.floor(index / 2);
  const timing = {
    animationDuration: `${7 + (index % 3) * 1.2}s`,
    animationDelay: `${-index * 1.7}s`,
  };
  return (
    <div
      className={`walker ${sprite ? "has-sprite" : ""}`}
      style={{
        ...timing,
        "--from": fromLeft ? `${-10 + lane * 3}%` : `${90 - lane * 3}%`,
        "--to": fromLeft ? `${4 + lane * 8}%` : `${74 - lane * 8}%`,
        "--dir": fromLeft ? 1 : -1,
        bottom: sprite ? `${58 - (lane % 2) * 8}px` : `${58 - (lane % 2) * 10}px`,
        zIndex: sprite ? 1 : 3 + (lane % 2),
      }}
    >
      <div className="walker-face" style={timing}>
        {sprite ? (
          <img
            src={sprite}
            alt=""
            draggable={false}
            className={`walker-sprite ${worker.rarity >= 6 ? "glow" : ""}`}
            style={{ animationDelay: `${-index * 0.37}s` }}
          />
        ) : (
          <WorkerIcon size={54} look={worker.look} rarity={worker.rarity} delay={index * 0.2} />
        )}
        <span className="ore-sack" style={timing} />
      </div>
    </div>
  );
}

// ---------- 장비 ----------
const EQUIP_SHAPES = {
  pickaxe: (c) => (
    <>
      <rect x="27" y="16" width="6" height="40" rx="3" fill="#8b5a2b" transform="rotate(-20 30 36)" />
      <path d="M6 22 Q30 2 54 18 L49 23 Q30 10 11 26 Z" fill={c} stroke="rgba(0,0,0,.35)" strokeWidth="1.5" />
      <path d="M8 21 Q30 4 52 18 L50 19 Q30 7 10 22 Z" fill="rgba(255,255,255,.45)" />
    </>
  ),
  helmet: (c) => (
    <>
      <path d="M10 38 A20 20 0 0 1 50 38 Z" fill={c} stroke="rgba(0,0,0,.35)" strokeWidth="1.5" />
      <rect x="6" y="37" width="48" height="6" rx="3" fill={c} stroke="rgba(0,0,0,.35)" strokeWidth="1.5" />
      <path d="M26 19 Q30 16 34 19 L34 38 L26 38 Z" fill="rgba(255,255,255,.3)" />
      <circle cx="30" cy="27" r="5" fill="#fff59d" stroke="#c9a800" strokeWidth="1.5" />
    </>
  ),
  gloves: (c) => (
    <>
      <path d="M18 54 L18 30 Q18 26 22 26 L22 14 Q22 11 25 11 Q28 11 28 14 L28 24 L28 10 Q28 7 31 7 Q34 7 34 10 L34 24 L34 12 Q34 9 37 9 Q40 9 40 12 L40 26 Q44 22 47 25 Q49 27 46 31 L40 42 L40 54 Z" fill={c} stroke="rgba(0,0,0,.35)" strokeWidth="1.5" />
      <rect x="16" y="46" width="26" height="9" rx="2" fill="rgba(0,0,0,.25)" />
    </>
  ),
  shirt: (c) => (
    <>
      <path d="M20 8 L10 14 L4 28 L13 31 L15 26 L15 54 L45 54 L45 26 L47 31 L56 28 L50 14 L40 8 Q30 16 20 8 Z" fill={c} stroke="rgba(0,0,0,.35)" strokeWidth="1.5" />
      <rect x="15" y="34" width="30" height="4" fill="#ffeb3b" opacity=".9" />
      <rect x="15" y="42" width="30" height="4" fill="#ffeb3b" opacity=".9" />
    </>
  ),
  pants: (c) => (
    <>
      <path d="M14 8 L46 8 L50 54 L35 54 L30 22 L25 54 L10 54 Z" fill={c} stroke="rgba(0,0,0,.35)" strokeWidth="1.5" />
      <rect x="14" y="8" width="32" height="6" fill="rgba(0,0,0,.3)" />
      <rect x="27" y="9" width="6" height="4" rx="1" fill="#ffd54a" />
      <rect x="11" y="44" width="13" height="3" fill="#ffeb3b" />
      <rect x="36" y="44" width="13" height="3" fill="#ffeb3b" />
    </>
  ),
  boots: (c) => (
    <>
      <path d="M16 8 L34 8 L34 34 Q50 34 54 44 L54 50 L12 50 L12 34 Z" fill={c} stroke="rgba(0,0,0,.35)" strokeWidth="1.5" />
      <rect x="10" y="48" width="46" height="7" rx="2" fill="#3e2723" />
      <path d="M40 36 Q50 37 53 45 L40 45 Z" fill="#b0bec5" />
      <path d="M18 16 L32 16 M18 22 L32 22 M18 28 L32 28" stroke="rgba(0,0,0,.3)" strokeWidth="2" />
    </>
  ),
};

export function EquipIcon({ slot, level, size = 44 }) {
  const material = Math.min(MATERIALS.length - 1, Math.floor(Math.max(level - 1, 0) / 100));
  const plus = level ? Math.floor(((level - 1) % 100) / 10) : 0;
  const color = MATERIALS[material].color;
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} className={material >= 8 ? "equip-glow" : ""} aria-hidden="true">
      {EQUIP_SHAPES[slot](color)}
      {(material >= 5 || plus >= 5) && <Sparkle x={50} y={10} size={0.5} color="#fffbe0" />}
      {(material >= 7 || plus >= 8) && <Sparkle x={10} y={48} size={0.45} delay={0.6} color={color} />}
    </svg>
  );
}

// ---------- 장신구 ----------
const CHARM_SHAPES = {
  clover: (c) => (
    <>
      {[[22, 20], [38, 20], [22, 36], [38, 36]].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="9" fill="#66bb6a" stroke="#2e7d32" strokeWidth="1.5" />
      ))}
      <path d="M30 30 Q34 44 40 54" stroke="#2e7d32" strokeWidth="3" fill="none" />
      <circle cx="30" cy="28" r="5" fill={c} />
    </>
  ),
  ring: (c) => (
    <>
      <circle cx="30" cy="36" r="16" fill="none" stroke="#ffc107" strokeWidth="6" />
      <path d="M22 18 L30 8 L38 18 L30 26 Z" fill={c} stroke="#fff" strokeWidth="1.5" />
    </>
  ),
  necklace: (c) => (
    <>
      <path d="M10 8 Q30 44 50 8" fill="none" stroke="#ffd54a" strokeWidth="3" />
      <path d="M30 32 L38 42 L30 54 L22 42 Z" fill={c} stroke="#fff" strokeWidth="1.5" />
    </>
  ),
  earring: (c) => (
    <>
      <path d="M30 6 Q40 6 40 14 Q40 20 30 22" fill="none" stroke="#ffd54a" strokeWidth="3" />
      <circle cx="30" cy="26" r="3" fill="#ffd54a" />
      <path d="M30 30 Q42 42 30 56 Q18 42 30 30 Z" fill={c} stroke="#fff" strokeWidth="1.5" />
    </>
  ),
  bracelet: (c) => (
    <>
      <ellipse cx="30" cy="32" rx="22" ry="14" fill="none" stroke="#b0bec5" strokeWidth="7" />
      {[14, 30, 46].map((x) => (
        <circle key={x} cx={x} cy={x === 30 ? 46 : 40} r="5" fill={c} stroke="#fff" strokeWidth="1.2" />
      ))}
    </>
  ),
  feather: (c) => (
    <>
      <path d="M44 6 Q20 14 16 46 L22 50 Q44 36 44 6 Z" fill={c} stroke="#fff" strokeWidth="1.5" />
      <path d="M44 6 L14 56" stroke="rgba(0,0,0,.35)" strokeWidth="2" />
    </>
  ),
};

export function CharmIcon({ type, rarity = 0, size = 40 }) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} aria-hidden="true">
      {CHARM_SHAPES[type](RARITIES[rarity].color)}
      {rarity >= 3 && <Sparkle x={50} y={52} size={0.5} color={RARITIES[rarity].color} />}
    </svg>
  );
}

// ---------- 기타 ----------
export function ChestIcon() {
  return (
    <svg viewBox="0 0 120 100" width="120" height="100" aria-hidden="true">
      <circle cx="40" cy="22" r="9" fill="#f5b301" />
      <circle cx="62" cy="16" r="10" fill="#ffd54a" />
      <circle cx="82" cy="24" r="8" fill="#f5b301" />
      <rect x="15" y="45" width="90" height="48" rx="6" fill="#8d5524" />
      <path d="M15 52 Q15 22 60 22 Q105 22 105 52 Z" fill="#a8672e" />
      <rect x="15" y="45" width="90" height="8" fill="#ffc107" />
      <rect x="54" y="24" width="12" height="69" fill="#ffc107" />
      <rect x="50" y="52" width="20" height="18" rx="3" fill="#ffe082" stroke="#b8860b" strokeWidth="2" />
      <circle cx="60" cy="60" r="3" fill="#5d4037" />
    </svg>
  );
}

export function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.5z" />
    </svg>
  );
}

export function BatIcon({ size = 56 }) {
  return (
    <svg viewBox="0 0 80 50" width={size} height={size * 0.625} aria-hidden="true">
      <g className="wing-left">
        <path d="M34 22 Q20 4 2 12 Q10 18 8 26 Q16 22 20 30 Q26 24 34 28 Z" fill="#f5b301" stroke="#c98a00" strokeWidth="1.5" />
      </g>
      <g className="wing-right">
        <path d="M46 22 Q60 4 78 12 Q70 18 72 26 Q64 22 60 30 Q54 24 46 28 Z" fill="#f5b301" stroke="#c98a00" strokeWidth="1.5" />
      </g>
      <ellipse cx="40" cy="26" rx="9" ry="11" fill="#ffd54a" stroke="#c98a00" strokeWidth="1.5" />
      <path d="M33 17 L35 9 L38 16 Z M47 17 L45 9 L42 16 Z" fill="#ffd54a" stroke="#c98a00" strokeWidth="1" />
      <circle cx="36.5" cy="23" r="1.8" fill="#4a2f00" />
      <circle cx="43.5" cy="23" r="1.8" fill="#4a2f00" />
      <path d="M37 29 L38.5 31 L40 29 L41.5 31 L43 29" stroke="#fff" strokeWidth="1" fill="none" />
      <Sparkle x={62} y={8} size={0.5} color="#fffbe0" />
      <Sparkle x={16} y={36} size={0.4} delay={0.6} color="#fffbe0" />
    </svg>
  );
}

// 작은 시세 그래프
export function Sparkline({ values, width = 64, height = 22 }) {
  if (!values || values.length < 2) return <svg width={width} height={height} aria-hidden="true" />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values
    .map((v, i) => `${(i / (values.length - 1)) * (width - 4) + 2},${height - 2 - ((v - min) / span) * (height - 4)}`)
    .join(" ");
  const up = values[values.length - 1] >= values[values.length - 2];
  return (
    <svg width={width} height={height} aria-hidden="true">
      <polyline points={points} fill="none" stroke={up ? "#ff6b6b" : "#4fa3ff"} strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
