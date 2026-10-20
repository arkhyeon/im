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
const BACK_HAIR = {
  long: <path d="M15.5 22 Q13 44 19 50 L41 50 Q47 44 44.5 22 Z" />,
  ponytail: <path d="M41 15 Q57 17 52 39 Q50 30 44 25 Z" />,
  twin: (
    <>
      <path d="M17 17 Q4 28 10 47 Q14 36 19 27 Z" />
      <path d="M43 17 Q56 28 50 47 Q46 36 41 27 Z" />
    </>
  ),
  bob: <path d="M15.5 22 Q15 37 21 38 L39 38 Q45 37 44.5 22 Z" />,
  braid: (
    <>
      <circle cx="43" cy="31" r="3.3" />
      <circle cx="44" cy="37" r="3.1" />
      <circle cx="44.5" cy="43" r="2.8" />
    </>
  ),
  bun: <circle cx="30" cy="7" r="5.5" />,
};

export function WorkerIcon({ look, rarity = 0, size = 44, delay = 0, still = false }) {
  const has = (key) => look.extra?.split(" ").includes(key);
  const skin = look.skin || "#ffe3cf";
  const accent = RARITIES[rarity].color;
  const classes = [has("spirit") ? "spirit-glow" : "", rarity >= 8 ? "rainbow-glow" : ""].join(" ");
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} className={classes} aria-hidden="true">
      <g className={still ? "" : "bob"} style={{ animationDelay: `${delay}s` }}>
        {has("cape") && <path d="M19 36 L12 57 L48 57 L41 36 Z" fill={accent} opacity=".85" />}
        {has("tail") && <path d="M40 49 Q55 51 55 40 Q57 33 52 31 Q53 42 40 45 Z" fill={look.hair} />}
        <g fill={look.hair}>
          <circle cx="30" cy="22" r="14.5" />
          {BACK_HAIR[look.style]}
        </g>
        {look.style === "twin" && (
          <>
            <circle cx="17.5" cy="18" r="2.4" fill={look.accent} />
            <circle cx="42.5" cy="18" r="2.4" fill={look.accent} />
          </>
        )}
        <g className={still ? "" : "swing"} style={{ transformOrigin: "42px 42px", animationDelay: `${delay}s` }}>
          <rect x="41" y="20" width="2.6" height="25" rx="1.3" fill={rarity >= 4 ? "#4a148c" : "#8b5a2b"} />
          <path d="M32 22 Q42 13 53 21 L51 24 Q42 18 34 25 Z" fill={rarity ? accent : "#b0bec5"} />
        </g>
        <rect x="23.5" y="49" width="5" height="7" rx="2" fill={skin} />
        <rect x="31.5" y="49" width="5" height="7" rx="2" fill={skin} />
        <rect x="23" y="54.5" width="6" height="3" rx="1.5" fill="#5d4037" />
        <rect x="31" y="54.5" width="6" height="3" rx="1.5" fill="#5d4037" />
        <path d="M21.5 35 Q30 32 38.5 35 L43 51 Q30 55 17 51 Z" fill={look.outfit} />
        <path d="M17.5 49.5 Q30 53 42.5 49.5" stroke="rgba(255,255,255,.55)" strokeWidth="1.4" fill="none" />
        <path d="M26.5 35 L30 38.5 L33.5 35" fill="none" stroke={look.accent} strokeWidth="1.8" />
        <path d="M27 39.5 L30 41 L33 39.5 L30 42.5 Z" fill={look.accent} />
        {has("dynamite") && (
          <>
            <rect x="20" y="43" width="2.6" height="6" rx="1" fill="#d32f2f" />
            <rect x="23.2" y="43" width="2.6" height="6" rx="1" fill="#d32f2f" />
          </>
        )}
        {has("golem") && (
          <>
            <path d="M15 40 L20 33.5 L24 38 L19 42 Z" fill="#9e9e9e" stroke="#616161" strokeWidth="1" />
            <path d="M45 40 L40 33.5 L36 38 L41 42 Z" fill="#9e9e9e" stroke="#616161" strokeWidth="1" />
          </>
        )}
        <circle cx="18.5" cy="44" r="2.4" fill={skin} />
        <circle cx="41.5" cy="43" r="2.4" fill={skin} />
        <circle cx="30" cy="23" r="13" fill={skin} />
        <ellipse cx="25" cy="25.5" rx="2.6" ry="3.4" fill={look.eyes} />
        <ellipse cx="35" cy="25.5" rx="2.6" ry="3.4" fill={look.eyes} />
        <circle cx="24.1" cy="24.2" r="1.05" fill="#fff" />
        <circle cx="34.1" cy="24.2" r="1.05" fill="#fff" />
        <circle cx="25.8" cy="27.2" r="0.5" fill="#fff" />
        <circle cx="35.8" cy="27.2" r="0.5" fill="#fff" />
        <ellipse cx="21.5" cy="29.5" rx="2.3" ry="1.2" fill="#ff8a80" opacity=".55" />
        <ellipse cx="38.5" cy="29.5" rx="2.3" ry="1.2" fill="#ff8a80" opacity=".55" />
        <path d="M28.6 30.6 Q30 31.9 31.4 30.6" stroke="#c2185b" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        <path d="M17 24 Q16 10 30 9 Q44 10 43 24 Q41 17 37.5 16 Q35.5 20.5 31.5 17 Q28.5 21 24.5 17 Q20.5 18 17 24 Z" fill={look.hair} />
        {has("helmet") && (
          <>
            <path d="M16.5 17 A13.5 11 0 0 1 43.5 17 Z" fill={look.accent} />
            <rect x="15" y="15.5" width="30" height="3" rx="1.5" fill="rgba(0,0,0,.22)" />
            <circle cx="30" cy="10.5" r="2.4" fill="#fff59d" />
          </>
        )}
        {has("goggles") && (
          <>
            <rect x="17" y="13" width="26" height="2.6" fill="#5d4037" />
            <circle cx="24" cy="14.3" r="3.6" fill={look.accent} stroke="#5d4037" strokeWidth="1.4" />
            <circle cx="36" cy="14.3" r="3.6" fill={look.accent} stroke="#5d4037" strokeWidth="1.4" />
          </>
        )}
        {has("wizard") && (
          <>
            <path d="M16 15 L33 -3 L44 15 Z" fill={look.outfit} />
            <ellipse cx="30" cy="15" rx="17" ry="3" fill={look.outfit} />
            <Sparkle x={31} y={7} size={0.35} delay={delay} color="#fff59d" />
          </>
        )}
        {has("horns") && <path d="M19 12 Q13 4 16.5 -0.5 Q19.5 7 23 10 Z M41 12 Q47 4 43.5 -0.5 Q40.5 7 37 10 Z" fill="#fff3e0" stroke="#bcaaa4" strokeWidth=".8" />}
        {has("crown") && <path d="M23 10 L25 3.5 L30 7.5 L35 3.5 L37 10 Z" fill="#ffd54a" stroke="#c98a00" strokeWidth="1" />}
        {has("golem") && <path d="M38 10 L41 4.5 L44 10 L41 13.5 Z" fill={look.accent} stroke="#fff" strokeWidth=".8" />}
        {has("spirit") && (
          <g fill={accent}>
            <circle cx="41" cy="11" r="2.2" />
            <circle cx="44" cy="9" r="1.6" />
            <circle cx="44" cy="13" r="1.6" />
            <circle cx="38" cy="9" r="1.6" />
          </g>
        )}
        {has("halo") && <ellipse cx="30" cy="2.5" rx="10" ry="2.6" fill="none" stroke="#fff59d" strokeWidth="2" />}
        {rarity >= 4 && <Sparkle x={51} y={9} size={0.5} delay={delay + 0.4} color={accent} />}
        {rarity >= 6 && <Sparkle x={8} y={32} size={0.45} delay={delay + 0.9} color={accent} />}
      </g>
    </svg>
  );
}

// 광석까지 걸어가서 캐고, 광석 자루를 메고 돌아가는 꼬마 일꾼
export function Walker({ index, look, rarity = 0 }) {
  const fromLeft = index % 2 === 0;
  const lane = Math.floor(index / 2);
  const timing = {
    animationDuration: `${7 + (index % 3) * 1.2}s`,
    animationDelay: `${-index * 1.7}s`,
  };
  return (
    <div
      className="walker"
      style={{
        ...timing,
        "--from": fromLeft ? `${-6 + lane * 2}%` : `${94 - lane * 2}%`,
        "--to": fromLeft ? `${18 + lane * 4}%` : `${70 - lane * 4}%`,
        "--dir": fromLeft ? 1 : -1,
        bottom: `${60 - (lane % 2) * 8}px`,
        zIndex: 3 + (lane % 2),
      }}
    >
      <div className="walker-face" style={timing}>
        <WorkerIcon size={34} look={look} rarity={rarity} delay={index * 0.2} />
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
