import { PICKAXES, RARITIES, TIERS, pickaxeOf } from "./game";

/* 모든 그림은 이미지 파일 없이 SVG로 그려요. tier가 오를수록 색과 장식이 바뀌어요. */

const BODY_COLORS = ["#3d7bd9", "#607d8b", "#7b1fa2", "#00897b"];
const HELMET_COLORS = ["#ffc107", "#dfe7ee", "#ffd54a", "#7ef9ff"];

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

export function OreRock({ mine }) {
  const [top, light, left, right, front] = mine.faces;
  const [v1, v2, v3] = mine.vein;
  return (
    <svg viewBox="0 0 200 180" width="200" height="180" className="rock" aria-hidden="true">
      <defs>
        <linearGradient id="vein" x1="0" y1="0" x2="1" y2="1">
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
      <polygon points="92,92 104,70 118,92 104,112" fill="url(#vein)" />
      <polygon points="56,104 64,90 72,104 64,116" fill="url(#vein)" />
      <polygon points="136,82 144,70 152,84 144,94" fill="url(#vein)" />
      <polygon points="118,124 124,114 132,126 124,134" fill="url(#vein)" />
      <polygon points="82,58 88,48 96,58 88,66" fill="url(#vein)" />
      <Sparkle x={104} y={74} />
      <Sparkle x={62} y={92} delay={0.5} />
      <Sparkle x={146} y={72} delay={1} />
      <Sparkle x={126} y={118} delay={0.3} />
      <Sparkle x={88} y={52} size={0.7} delay={0.8} />
    </svg>
  );
}

export function MinerIcon({ size = 44, delay = 0, tier = 0 }) {
  const head = TIERS[tier].color;
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} aria-hidden="true">
      <g className="bob" style={{ animationDelay: `${delay}s` }}>
        <g className="swing" style={{ transformOrigin: "40px 38px", animationDelay: `${delay}s` }}>
          <rect x="38.5" y="12" width="3" height="28" rx="1.5" fill="#8b5a2b" />
          <path d="M28 15 Q40 6 52 15 L50 18 Q40 11 30 18 Z" fill={tier ? head : "#b0bec5"} />
        </g>
        <rect x="21" y="48" width="6" height="8" rx="2" fill="#4e342e" />
        <rect x="31" y="48" width="6" height="8" rx="2" fill="#4e342e" />
        <rect x="18" y="32" width="22" height="19" rx="6" fill={BODY_COLORS[tier]} />
        <rect x="26" y="32" width="6" height="19" fill="rgba(0,0,0,.18)" />
        {tier >= 2 && <rect x="18" y="40" width="22" height="3" fill={head} />}
        <circle cx="29" cy="25" r="10" fill="#f2c9a0" />
        <circle cx="25" cy="26" r="1.4" fill="#333" />
        <circle cx="33" cy="26" r="1.4" fill="#333" />
        <path d="M26 30 Q29 32 32 30" stroke="#a0522d" strokeWidth="1.4" fill="none" />
        <path d="M18 23 A11 11 0 0 1 40 23 Z" fill={HELMET_COLORS[tier]} />
        <rect x="16" y="22" width="26" height="3" rx="1.5" fill="rgba(0,0,0,.2)" />
        <circle cx="29" cy="16" r="2.6" fill="#fff59d" />
        {tier >= 3 && <Sparkle x={36} y={12} size={0.5} delay={delay} color="#e0fbff" />}
      </g>
    </svg>
  );
}

export function DrillIcon({ size = 44, tier = 0 }) {
  const bodies = ["#ffb300", "#b0bec5", "#ffd54a", "#7ef9ff"];
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} aria-hidden="true">
      <g className="vibrate">
        <rect x="14" y="6" width="32" height="22" rx="5" fill={bodies[tier]} />
        <rect x="14" y="6" width="32" height="7" rx="3.5" fill="rgba(255,255,255,.35)" />
        <circle cx="22" cy="18" r="3" fill="#5d4037" />
        <circle cx="38" cy="18" r="3" fill="#5d4037" />
        <rect x="22" y="28" width="16" height="6" fill="#78909c" />
        <path d="M22 34 L38 34 L30 56 Z" fill={tier >= 2 ? TIERS[tier].color : "#cfd8dc"} />
        <path d="M24 39 L36 39 M26 44 L34 44 M28 49 L32 49" stroke="#78909c" strokeWidth="2" />
      </g>
      {tier >= 1 && <Sparkle x={22} y={54} size={0.5} color={TIERS[tier].color} />}
      {tier >= 2 && <Sparkle x={39} y={52} size={0.6} delay={0.4} color="#ffb300" />}
      {tier >= 3 && <Sparkle x={30} y={4} size={0.6} delay={0.8} color="#e0fbff" />}
    </svg>
  );
}

export function FactoryIcon({ size = 44, delay = 0, tier = 0 }) {
  const walls = ["#8d6e63", "#78909c", "#a1887f", "#5c6bc0"];
  const windows = ["#ffe082", "#e3f2fd", "#ffd54a", "#7ef9ff"];
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} aria-hidden="true">
      <circle className="smoke" style={{ animationDelay: `${delay}s` }} cx="47.5" cy="8" r="4" fill="#cfd8dc" />
      <circle className="smoke" style={{ animationDelay: `${delay + 1}s` }} cx="47.5" cy="8" r="4" fill="#cfd8dc" />
      {tier >= 2 && (
        <>
          <circle className="smoke" style={{ animationDelay: `${delay + 0.5}s` }} cx="35.5" cy="12" r="3" fill="#cfd8dc" />
          <rect x="33" y="14" width="5" height="16" fill="#6d4c41" />
        </>
      )}
      <rect x="44" y="10" width="7" height="22" fill="#6d4c41" />
      <path d="M6 30 L6 22 L18 30 L18 22 L30 30 L30 22 L42 30 Z" fill={tier >= 3 ? "#ffd54a" : "#bcaaa4"} />
      <rect x="6" y="30" width="48" height="24" fill={walls[tier]} />
      <rect className={tier >= 1 ? "window-glow" : ""} x="11" y="36" width="8" height="7" rx="1" fill={windows[tier]} />
      <rect className={tier >= 1 ? "window-glow" : ""} x="23" y="36" width="8" height="7" rx="1" fill={windows[tier]} />
      <rect className={tier >= 1 ? "window-glow" : ""} x="35" y="36" width="8" height="7" rx="1" fill={windows[tier]} />
      <rect x="25" y="46" width="10" height="8" fill="#5d4037" />
    </svg>
  );
}

export function BankIcon({ size = 44, delay = 0, tier = 0 }) {
  const pillar = ["#eceff1", "#dfe7ee", "#ffe082", "#b2fbff"];
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} aria-hidden="true">
      <g className="coin-hop" style={{ animationDelay: `${delay}s` }}>
        {tier >= 2 ? (
          <path d="M30 2 L36 9 L30 16 L24 9 Z" fill="#7ef9ff" stroke="#2bb7d6" strokeWidth="1" />
        ) : (
          <>
            <circle cx="30" cy="9" r="6" fill="#f5b301" />
            <circle cx="30" cy="9" r="4" fill="#ffd54a" />
          </>
        )}
      </g>
      <path d="M8 27 L30 17 L52 27 Z" fill={tier >= 1 ? TIERS[tier].color : "#eceff1"} />
      <rect x="9" y="27" width="42" height="4" fill="#b0bec5" />
      <rect x="13" y="31" width="5" height="17" fill={pillar[tier]} />
      <rect x="22" y="31" width="5" height="17" fill={pillar[tier]} />
      <rect x="33" y="31" width="5" height="17" fill={pillar[tier]} />
      <rect x="42" y="31" width="5" height="17" fill={pillar[tier]} />
      <rect x="7" y="48" width="46" height="6" rx="1" fill="#b0bec5" />
      {tier >= 3 && <Sparkle x={50} y={18} size={0.6} delay={delay} color="#e0fbff" />}
    </svg>
  );
}

export function GeneratorIcon({ id, ...props }) {
  if (id === "miner") return <MinerIcon {...props} />;
  if (id === "drill") return <DrillIcon {...props} />;
  if (id === "factory") return <FactoryIcon {...props} />;
  return <BankIcon {...props} />;
}

export function PickaxeIcon({ size = 44, level = 0 }) {
  const material = pickaxeOf(level);
  const head = PICKAXES[material].head;
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} aria-hidden="true">
      <g className="swing" style={{ transformOrigin: "30px 52px" }}>
        <rect x="27" y="14" width="6" height="40" rx="3" fill={material >= 5 ? "#4a148c" : "#8b5a2b"} />
        <path d="M8 21 Q30 2 52 21 L47 25 Q30 12 13 25 Z" fill={head} />
        <path d="M8 21 Q30 2 52 21 L50 22 Q30 6 10 22 Z" fill="rgba(255,255,255,.45)" />
      </g>
      {material >= 3 && <Sparkle x={12} y={14} size={0.5} color={head} />}
      {material >= 4 && <Sparkle x={50} y={12} size={0.6} delay={0.6} color="#fffbe0" />}
    </svg>
  );
}

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

// 고용소 일꾼: look(색, 장식)과 등급에 따라 모습이 달라져요
export function WorkerIcon({ look, rarity = 0, size = 44, delay = 0 }) {
  const skin = look.skin || "#f2c9a0";
  const accent = RARITIES[rarity].color;
  return (
    <svg
      viewBox="0 0 60 60"
      width={size}
      height={size}
      className={look.extra === "spirit" ? "spirit-glow" : ""}
      aria-hidden="true"
    >
      <g className="bob" style={{ animationDelay: `${delay}s` }}>
        <g className="swing" style={{ transformOrigin: "40px 38px", animationDelay: `${delay}s` }}>
          <rect x="38.5" y="12" width="3" height="28" rx="1.5" fill={rarity >= 3 ? "#4a148c" : "#8b5a2b"} />
          <path d="M28 15 Q40 6 52 15 L50 18 Q40 11 30 18 Z" fill={rarity ? accent : "#b0bec5"} />
        </g>
        <rect x="21" y="48" width="6" height="8" rx="2" fill="#4e342e" />
        <rect x="31" y="48" width="6" height="8" rx="2" fill="#4e342e" />
        <rect x="18" y="32" width="22" height="19" rx="6" fill={look.body} />
        <rect x="26" y="32" width="6" height="19" fill="rgba(0,0,0,.18)" />
        {look.extra === "dynamite" && (
          <>
            <rect x="19" y="41" width="3" height="8" rx="1" fill="#d32f2f" />
            <rect x="23" y="41" width="3" height="8" rx="1" fill="#d32f2f" />
            <path d="M20.5 41 Q20 38 22 37" stroke="#ffb300" strokeWidth="1" fill="none" />
          </>
        )}
        {look.extra === "golem" ? (
          <rect x="19" y="15" width="20" height="19" rx="4" fill={skin} />
        ) : (
          <circle cx="29" cy="25" r="10" fill={skin} />
        )}
        <circle cx="25" cy="26" r="1.4" fill={look.extra === "golem" ? "#fff59d" : "#333"} />
        <circle cx="33" cy="26" r="1.4" fill={look.extra === "golem" ? "#fff59d" : "#333"} />
        {look.extra === "beard" ? (
          <path d="M20 26 Q29 42 38 26 Q34 31 29 31 Q24 31 20 26 Z" fill="#cfd8dc" />
        ) : (
          <path d="M26 30 Q29 32 32 30" stroke="#a0522d" strokeWidth="1.4" fill="none" />
        )}
        {look.extra === "wizard" ? (
          <>
            <path d="M17 21 L29 0 L41 21 Z" fill={look.helmet} />
            <rect x="15" y="19" width="28" height="3" rx="1.5" fill="rgba(0,0,0,.25)" />
            <Sparkle x={29} y={10} size={0.4} delay={delay} color="#fff59d" />
          </>
        ) : (
          <>
            <path d="M18 23 A11 11 0 0 1 40 23 Z" fill={look.helmet} />
            <rect x="16" y="22" width="26" height="3" rx="1.5" fill="rgba(0,0,0,.2)" />
            <circle cx="29" cy="16" r="2.6" fill="#fff59d" />
          </>
        )}
        {look.extra === "crown" && <path d="M21 13 L24 6 L29 11 L34 6 L37 13 Z" fill="#ffd54a" stroke="#c98a00" strokeWidth="1" />}
        {look.extra === "spirit" && <path d="M22 10 L25 4 L29 8 L33 4 L36 10 Z" fill={accent} />}
        {rarity >= 3 && <Sparkle x={44} y={8} size={0.5} delay={delay + 0.4} color={accent} />}
      </g>
    </svg>
  );
}

const MINER_LOOKS = TIERS.map((_, tier) => ({ body: BODY_COLORS[tier], helmet: HELMET_COLORS[tier] }));
export const minerLook = (tier) => MINER_LOOKS[tier];

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

export function TierAura({ tier }) {
  if (!tier) return null;
  return <div className={`aura tier${tier}`} style={{ "--tc": TIERS[tier].color }} />;
}
