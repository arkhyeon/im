import { useEffect, useRef, useState } from "react";
import {
  AD_TICKET,
  CHARM_SLOTS,
  EFFECT_NAMES,
  EQUIPMENT,
  MATERIALS,
  MAX_LEVEL,
  MERGE,
  ORES,
  PITY,
  PRESTIGE_UNIT,
  QUESTS,
  RARITIES,
  SET_BONUS,
  TICKETS,
  TRIBES,
  TRIBE_STEPS,
  WORKERS,
} from "./data";
import {
  charmText,
  charmTypeOf,
  comboStatusOf,
  dailyOf,
  equipCostOf,
  equipEffectText,
  fmt,
  materialOf,
  nextStreakOf,
  pct,
  prestigeMult,
  questRewardOf,
  rarityCountOf,
  stonesFor,
  ticketCostOf,
  todayKey,
  tribeStatusOf,
  workerById,
} from "./game";
import { BUY_SPREAD } from "./market";
import { CharmIcon, CoinIcon, EquipIcon, OreItemIcon, Sparkline, WorkerIcon } from "./art";

function SubTabs({ items, value, onChange }) {
  return (
    <div className="subtabs">
      {items.map(([id, label]) => (
        <button key={id} className={`subtab ${value === id ? "active" : ""}`} onClick={() => onChange(id)}>
          {label}
        </button>
      ))}
    </div>
  );
}

// ---------- 장비 ----------
export function EquipPanel({ game, stats, onBuy }) {
  const [slotId, setSlotId] = useState("pickaxe");
  const listRef = useRef(null);
  const slot = EQUIPMENT.find((e) => e.id === slotId);
  const level = game.equip[slotId];
  const minLevel = Math.min(...EQUIPMENT.map((e) => game.equip[e.id]));
  const nextSet = Math.min(stats.setTier + 1, MATERIALS.length);

  // 탭을 열면 다음에 살 레벨이 보이도록 목록을 스크롤
  useEffect(() => {
    const list = listRef.current;
    const row = list?.querySelector(".lv-row.next") || list?.querySelector(".lv-row:last-child");
    if (list && row) list.scrollTop = row.offsetTop - list.clientHeight / 2;
  }, [slotId]);

  return (
    <div className="shop">
      <section className="set-box">
        <div className="set-title">
          {stats.setTier ? `🛡️ ${MATERIALS[stats.setTier - 1].name} 세트 발동 중` : "🛡️ 장비 세트"}
        </div>
        <p className="section-note">
          모든 장비를 Lv.10, 20, 30…까지 맞추면 세트 효과가 붙어요. 단계마다 골드 +{pct(SET_BONUS.gold)}, 치명타 확률 +
          {pct(SET_BONUS.critChance)}.
        </p>
        {stats.setTier < MATERIALS.length && (
          <div className="set-progress">
            <span>
              다음 {MATERIALS[nextSet - 1].name} 세트: 모든 장비 Lv.{nextSet * 10} (지금 최저 Lv.{minLevel})
            </span>
            <div className="bar">
              <div className="quest-fill" style={{ width: `${Math.min(1, minLevel / (nextSet * 10)) * 100}%` }} />
            </div>
          </div>
        )}
      </section>

      <div className="equip-slots">
        {EQUIPMENT.map((e) => (
          <button key={e.id} className={`equip-slot ${slotId === e.id ? "active" : ""}`} onClick={() => setSlotId(e.id)}>
            <EquipIcon slot={e.id} level={game.equip[e.id]} size={34} />
            <span>{e.name}</span>
            <span className="equip-lv">Lv.{game.equip[e.id]}</span>
          </button>
        ))}
      </div>

      <section className="equip-head">
        <EquipIcon slot={slotId} level={level} size={64} />
        <div className="info">
          <div className="name">
            {level ? `${materialOf(level).name} ${slot.name}` : `기본 ${slot.name}`} <span className="badge">Lv.{level}</span>
          </div>
          <div className="desc">지금: {equipEffectText(slotId, level)}</div>
          {level < MAX_LEVEL && <div className="desc next-effect">다음: {equipEffectText(slotId, level + 1)}</div>}
        </div>
        {level < MAX_LEVEL ? (
          <button className={`buy ${game.gold >= equipCostOf(slot, level) ? "ready" : ""}`} disabled={game.gold < equipCostOf(slot, level)} onClick={() => onBuy(slotId)}>
            <CoinIcon size={16} />
            {fmt(equipCostOf(slot, level))}
          </button>
        ) : (
          <span className="max-tag">MAX</span>
        )}
      </section>

      <div className="lv-list" ref={listRef}>
        {Array.from({ length: MAX_LEVEL }, (_, i) => i + 1).map((lv) => {
          const state = lv <= level ? "owned" : lv === level + 1 ? "next" : "locked";
          const cost = equipCostOf(slot, lv - 1);
          return (
            <div key={lv} className={`lv-row ${state} ${lv % 10 === 1 ? "material-start" : ""}`}>
              {lv % 10 === 1 && <span className="material-label" style={{ color: materialOf(lv).color }}>{materialOf(lv).name}</span>}
              <EquipIcon slot={slotId} level={lv} size={34} />
              <div className="lv-info">
                <span className="lv-name">
                  Lv.{lv} {materialOf(lv).name} {slot.name}
                </span>
                <span className="lv-effect">{equipEffectText(slotId, lv)}</span>
              </div>
              {state === "owned" && <span className="lv-check">✓</span>}
              {state === "next" && (
                <button className={`buy small ${game.gold >= cost ? "ready" : ""}`} disabled={game.gold < cost} onClick={() => onBuy(slotId)}>
                  <CoinIcon size={14} />
                  {fmt(cost)}
                </button>
              )}
              {state === "locked" && (
                <span className="lv-price">
                  <CoinIcon size={12} />
                  {fmt(cost)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- 광부 (뽑기 · 보관함 · 합성 · 시너지) ----------
export function WorkersPanel({ game, stats, adsLeft, watchingAd, onAdPull, onPull, onMerge }) {
  const [sub, setSub] = useState("gacha");
  const [selected, setSelected] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const owned = WORKERS.filter((w) => game.workers[w.id]).sort((a, b) => b.rarity - a.rarity || b.rate - a.rate);
  const list = showAll ? [...WORKERS].sort((a, b) => b.rarity - a.rarity) : owned;
  const picked = selected && workerById(selected);
  const adTicket = TICKETS.find((t) => t.id === AD_TICKET.ticket);

  return (
    <div className="shop">
      <SubTabs
        items={[
          ["gacha", "뽑기"],
          ["bag", `보관함 ${owned.length}/${WORKERS.length}`],
          ["merge", "합성"],
          ["synergy", "시너지"],
        ]}
        value={sub}
        onChange={setSub}
      />

      {sub === "gacha" && (
        <>
          <p className="section-note">뽑은 광부는 탭하지 않아도 광석을 캐서 골드를 벌어요. 비싼 티켓일수록 높은 등급이 잘 나와요.</p>
          <button className="ad-wide" disabled={adsLeft <= 0 || Boolean(watchingAd)} onClick={onAdPull}>
            {watchingAd === "ticket" && <span className="ad-progress" />}
            <span className="ad-label">
              {watchingAd === "ticket"
                ? "광고 시청 중..."
                : adsLeft > 0
                  ? `📺 광고 보고 무료 ${adTicket.name} (오늘 ${adsLeft}/${AD_TICKET.perDay})`
                  : "오늘 무료 티켓을 다 받았어요"}
            </span>
          </button>
          {TICKETS.map((ticket) => {
            const pulls = game.pulls[ticket.id] || 0;
            const cost1 = ticketCostOf(ticket, pulls, 1);
            const cost10 = ticketCostOf(ticket, pulls, 10);
            return (
              <div key={ticket.id} className="ticket" style={{ "--tc": ticket.color }}>
                <div className="ticket-head">
                  <span className="ticket-stub" />
                  <span className="ticket-name">{ticket.name}</span>
                  {PITY.tickets.includes(ticket.id) && <span className="pity">전설 보장까지 {PITY.limit - game.pity}회</span>}
                </div>
                <div className="odds">
                  {ticket.odds.map((odd, r) =>
                    odd ? (
                      <span key={r} style={{ color: RARITIES[r].color }}>
                        {RARITIES[r].name} {odd}%
                      </span>
                    ) : null
                  )}
                </div>
                <div className="ticket-buttons">
                  <button className={`buy ${game.gold >= cost1 ? "ready" : ""}`} disabled={game.gold < cost1} onClick={() => onPull(ticket, 1)}>
                    1회 <CoinIcon size={16} />
                    {fmt(cost1)}
                  </button>
                  <button className={`buy ${game.gold >= cost10 ? "ready" : ""}`} disabled={game.gold < cost10} onClick={() => onPull(ticket, 10)}>
                    10회 <CoinIcon size={16} />
                    {fmt(cost10)}
                  </button>
                </div>
              </div>
            );
          })}
        </>
      )}

      {sub === "bag" && (
        <>
          <div className="bag-head">
            <span className="section-note">광부 {Object.values(game.workers).reduce((a, b) => a + b, 0)}명 · 초당 피해 {fmt(stats.workerPower, 1)}</span>
            <button className="link-btn" onClick={() => setShowAll((v) => !v)}>
              {showAll ? "가진 것만" : "도감 전체 보기"}
            </button>
          </div>
          {list.length === 0 ? (
            <p className="empty">아직 광부가 없어요. 뽑기에서 첫 광부를 뽑아 보세요.</p>
          ) : (
            <div className="bag-grid">
              {list.map((w) => {
                const count = game.workers[w.id] || 0;
                return (
                  <button
                    key={w.id}
                    className={`bag-slot r${w.rarity} ${count ? "" : "locked"} ${selected === w.id ? "selected" : ""}`}
                    style={{ "--rc": RARITIES[w.rarity].color }}
                    onClick={() => setSelected(w.id)}
                  >
                    <WorkerIcon look={w.look} rarity={w.rarity} size={40} still />
                    {count > 0 && <span className="bag-count">{count}</span>}
                  </button>
                );
              })}
            </div>
          )}
          {picked && (
            <section className="detail" style={{ "--rc": RARITIES[picked.rarity].color }}>
              <WorkerIcon look={picked.look} rarity={picked.rarity} size={64} />
              <div className="info">
                <div className="name">
                  {game.workers[picked.id] ? picked.name : "???"} <span className="rarity-chip">{RARITIES[picked.rarity].name}</span>
                </div>
                <div className="desc">
                  {TRIBES[picked.tribe].name} · 마리당 초당 피해 {fmt(picked.rate, 1)} · 보유 {game.workers[picked.id] || 0}명
                </div>
                <div className="desc">
                  조합: {comboStatusOf(game.workers).filter((c) => c.members.includes(picked.id)).map((c) => c.name).join(", ") || "없음"}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {sub === "merge" && (
        <>
          <p className="section-note">
            같은 등급 광부 {MERGE.count}명을 합쳐 다음 등급에 도전해요. 대성공이면 두 등급이 오르고, 실패하면 {MERGE.count}명 중 1명만
            돌아와요.
          </p>
          {RARITIES.slice(0, -1).map((rarity, r) => {
            const count = rarityCountOf(game.workers, r);
            const success = MERGE.success(r);
            const great = r + 2 < RARITIES.length ? MERGE.great : 0;
            return (
              <div key={r} className="merge-row" style={{ "--rc": rarity.color, "--nc": RARITIES[r + 1].color }}>
                <div className="merge-info">
                  <span>
                    <b style={{ color: rarity.color }}>{rarity.name}</b> {MERGE.count}명 → <b style={{ color: RARITIES[r + 1].color }}>{RARITIES[r + 1].name}</b>
                  </span>
                  <span className="merge-odds">
                    성공 {pct(success)} · 대성공 {pct(great)} · 실패 {pct(1 - success - great)}
                  </span>
                  <span className="merge-own">보유 {count}명</span>
                </div>
                <button className={`buy ${count >= MERGE.count ? "ready" : ""}`} disabled={count < MERGE.count} onClick={() => onMerge(r)}>
                  합성
                </button>
              </div>
            );
          })}
        </>
      )}

      {sub === "synergy" && (
        <>
          <p className="section-note">서로 다른 같은 종족 광부를 {TRIBE_STEPS.map((s) => s.count).join("/")}명 모으거나, 정해진 조합을 모으면 효과가 켜져요.</p>
          {tribeStatusOf(game.workers).map((t) => (
            <section key={t.id} className={`synergy ${t.bonus ? "on" : ""}`}>
              <div className="synergy-head">
                <span className="synergy-name">{t.name}</span>
                <span className="synergy-effect">
                  {t.desc} {t.bonus ? `+${pct(t.bonus)}` : "꺼짐"}
                </span>
              </div>
              <div className="synergy-steps">
                {TRIBE_STEPS.map((s) => (
                  <span key={s.count} className={`step ${t.owned >= s.count ? "on" : ""}`}>
                    {s.count}명 +{pct(s.bonus)}
                  </span>
                ))}
              </div>
              <div className="synergy-members">
                {t.members.map((w) => (
                  <span key={w.id} className={game.workers[w.id] ? "" : "missing"}>
                    <WorkerIcon look={w.look} rarity={w.rarity} size={30} still />
                  </span>
                ))}
              </div>
            </section>
          ))}
          <div className="set-title">조합 시너지</div>
          {comboStatusOf(game.workers).map((c) => (
            <section key={c.id} className={`synergy ${c.active ? "on" : ""}`}>
              <div className="synergy-head">
                <span className="synergy-name">{c.name}</span>
                <span className="synergy-effect">
                  {EFFECT_NAMES[c.effect]} +{pct(c.bonus)} {c.active ? "✓" : ""}
                </span>
              </div>
              <div className="synergy-members">
                {c.members.map((id) => {
                  const w = workerById(id);
                  return (
                    <span key={id} className={game.workers[id] ? "" : "missing"}>
                      <WorkerIcon look={w.look} rarity={w.rarity} size={30} still />
                    </span>
                  );
                })}
              </div>
            </section>
          ))}
        </>
      )}
    </div>
  );
}

// ---------- 장신구 ----------
export function CharmsPanel({ game, stats, onEquip, onUnequip, onSell, onSellBelow }) {
  const [selected, setSelected] = useState(null);
  const picked = game.charms.find((c) => c.uid === selected);
  const isEquipped = (uid) => game.equipped.includes(uid);
  const sorted = [...game.charms].sort((a, b) => b.rarity - a.rarity || b.value - a.value);
  const { charm } = stats;

  return (
    <div className="shop">
      <p className="section-note">광석을 부수면 가끔 장신구가 나와요. {CHARM_SLOTS}개까지 낄 수 있고, 환생해도 사라지지 않아요.</p>
      <div className="charm-slots">
        {Array.from({ length: CHARM_SLOTS }, (_, i) => {
          const c = game.charms.find((item) => item.uid === game.equipped[i]);
          return (
            <button key={i} className={`charm-slot ${c ? "filled" : ""}`} style={c ? { "--rc": RARITIES[c.rarity].color } : undefined} onClick={() => c && setSelected(c.uid)}>
              {c ? <CharmIcon type={c.type} rarity={c.rarity} size={44} /> : <span className="empty-slot">빈 칸</span>}
            </button>
          );
        })}
      </div>
      <div className="charm-total">
        {[
          ["골드", charm.gold, pct],
          ["일꾼", charm.worker, pct],
          ["드롭", charm.drop, pct],
          ["치명 확률", charm.critChance, pct],
          ["치명 피해", charm.critDmg, (v) => v.toFixed(2)],
          ["러시", charm.rush, (v) => `${v.toFixed(1)}초`],
        ]
          .filter(([, v]) => v > 0)
          .map(([label, v, f]) => (
            <span key={label}>
              {label} +{f(v)}
            </span>
          ))}
      </div>

      {picked && (
        <section className="detail" style={{ "--rc": RARITIES[picked.rarity].color }}>
          <CharmIcon type={picked.type} rarity={picked.rarity} size={56} />
          <div className="info">
            <div className="name">
              {charmTypeOf(picked).name} <span className="rarity-chip">{RARITIES[picked.rarity].name}</span>
            </div>
            <div className="desc">{charmText(picked)}</div>
            <div className="detail-actions">
              {isEquipped(picked.uid) ? (
                <button className="buy small" onClick={() => onUnequip(picked.uid)}>
                  해제
                </button>
              ) : (
                <button className="buy small ready" disabled={game.equipped.length >= CHARM_SLOTS} onClick={() => onEquip(picked.uid)}>
                  {game.equipped.length >= CHARM_SLOTS ? "칸이 가득 찼어요" : "장착"}
                </button>
              )}
              {!isEquipped(picked.uid) && (
                <button
                  className="buy small sell"
                  onClick={() => {
                    onSell(picked.uid);
                    setSelected(null);
                  }}
                >
                  판매 <CoinIcon size={14} />
                  {fmt(picked.sell)}
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      <div className="bag-head">
        <span className="section-note">보관함 {game.charms.length}/60</span>
        <button className="link-btn" onClick={() => onSellBelow(1)}>
          일반·고급 한 번에 팔기
        </button>
      </div>
      {sorted.length === 0 ? (
        <p className="empty">아직 장신구가 없어요. 광석을 부숴 보세요.</p>
      ) : (
        <div className="bag-grid">
          {sorted.map((c) => (
            <button
              key={c.uid}
              className={`bag-slot r${c.rarity} ${selected === c.uid ? "selected" : ""}`}
              style={{ "--rc": RARITIES[c.rarity].color }}
              onClick={() => setSelected(c.uid)}
            >
              <CharmIcon type={c.type} rarity={c.rarity} size={36} />
              {isEquipped(c.uid) && <span className="bag-count">E</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- 시장 ----------
export function MarketPanel({ game, market, onSell, onBuy }) {
  const left = Math.max(0, market.nextAt - market.now);
  const mm = String(Math.floor(left / 60000)).padStart(2, "0");
  const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, "0");

  return (
    <div className="shop">
      <section className="market-head">
        <div>
          <div className="set-title">📈 광석 시세</div>
          <p className="section-note">
            {market.online
              ? "모든 광부의 거래량으로 20분마다 시세가 바뀌어요. 많이 팔린 광석은 떨어지고, 안 팔린 광석은 올라요."
              : "게스트는 이 기기 안의 모의 시세예요. 로그인하면 모든 광부와 같은 시세로 거래해요."}
          </p>
        </div>
        <div className="countdown">
          <span>다음 시세</span>
          <b>
            {mm}:{ss}
          </b>
        </div>
      </section>
      {!market.state && <p className="empty">시세를 불러오는 중...</p>}
      {ORES.map((ore) => {
        const price = market.priceOf(ore.id);
        const history = market.state?.history?.[ore.id] || [price];
        const prev = history.length > 1 ? history[history.length - 2] : price;
        const change = prev ? (price - prev) / prev : 0;
        const held = game.oreItems[ore.id] || 0;
        const buyPrice = price * BUY_SPREAD;
        return (
          <div key={ore.id} className="market-row">
            <div className="market-top">
              <OreItemIcon ore={ore} size={30} />
              <div className="market-name">
                <span>{ore.name}</span>
                <span className="market-held">보유 {fmt(held)}개</span>
              </div>
              <Sparkline values={history} />
              <div className="market-price">
                <span>{fmt(price, 2)}</span>
                <span className={change > 0 ? "up" : change < 0 ? "down" : ""}>
                  {change > 0 ? "▲" : change < 0 ? "▼" : "-"} {pct(Math.abs(change))}
                </span>
              </div>
            </div>
            <div className="market-actions">
              <button className="trade sell" disabled={held < 1} onClick={() => onSell(ore.id, 1)}>
                1개 팔기
              </button>
              <button className="trade sell" disabled={held < 1} onClick={() => onSell(ore.id, held)}>
                전부 팔기
              </button>
              <button className="trade buy-btn" disabled={game.gold < buyPrice} onClick={() => onBuy(ore.id, 1)}>
                1개 사기
              </button>
              <button className="trade buy-btn" disabled={game.gold < buyPrice * 10} onClick={() => onBuy(ore.id, 10)}>
                10개 사기
              </button>
            </div>
          </div>
        );
      })}
      <p className="mission-note">살 때는 시세보다 5% 비싸요. 시장에서 번 골드는 랭킹 점수에 들어가지 않아요.</p>
    </div>
  );
}

// ---------- 미션 ----------
export function MissionsPanel({ game, attendanceDue, onClaimQuest }) {
  const daily = dailyOf(game.daily);
  return (
    <div className="shop">
      <section className="mission-box">
        <div className="set-title">📅 출석</div>
        <div className="attendance">
          {Array.from({ length: 7 }, (_, i) => {
            const day = i + 1;
            const done = game.attendance.last === todayKey() ? day <= game.attendance.streak : day < nextStreakOf(game.attendance);
            return (
              <div key={day} className={`att-day ${done ? "done" : ""} ${day === 7 ? "big" : ""}`}>
                <span>{day}일</span>
                <span className="att-icon">{day === 7 ? "🎟️" : "💰"}</span>
              </div>
            );
          })}
        </div>
        <p className="mission-note">{attendanceDue ? "오늘 출석 보상을 아직 안 받았어요" : "오늘 출석 완료! 내일 또 오세요"} · 7일차엔 금 티켓 1회</p>
      </section>
      <section className="mission-box">
        <div className="set-title">🎯 오늘의 미션</div>
        {QUESTS.map((q, i) => {
          const progress = Math.min(daily[q.id] || 0, q.goal);
          const done = progress >= q.goal;
          return (
            <div key={q.id} className="quest">
              <div className="quest-info">
                <span>{q.name}</span>
                <div className="bar">
                  <div className="quest-fill" style={{ width: `${(progress / q.goal) * 100}%` }} />
                </div>
                <span className="quest-count">
                  {progress}/{q.goal}
                </span>
              </div>
              <button className={`buy ${done && !daily.claimed[i] ? "ready" : ""}`} disabled={!done || daily.claimed[i]} onClick={() => onClaimQuest(i)}>
                {daily.claimed[i] ? "완료" : `+${fmt(questRewardOf(game))}`}
              </button>
            </div>
          );
        })}
        <p className="mission-note">미션은 매일 자정에 새로 바뀌어요</p>
      </section>
    </div>
  );
}

// ---------- 환생 ----------
export function PrestigePanel({ game, armed, armedReset, onRebirth, onReset }) {
  const gain = stonesFor(game.runEarned);
  const next = Math.min(prestigeMult(game.stones + gain), Infinity);
  return (
    <div className="shop">
      <section className="prestige">
        <div className="prestige-title">💎 환생</div>
        <p className="prestige-text">환생석 1개마다 모든 골드 획득이 영구히 +10%예요. 광부와 장신구는 그대로라서 바로 다시 빠르게 캘 수 있어요.</p>
        <div className="prestige-stats">
          <span>보유 💎 {game.stones}개 (x{prestigeMult(game.stones).toFixed(1)})</span>
          <span>환생하면 💎 +{gain} (x{next.toFixed(1)})</span>
        </div>
        <div className="keep-grid">
          <div>
            <b className="keep">그대로 유지</b>
            <span>광부 전부 · 장신구 · 광석 해금 · 시장 광석 · 환생석 · 랭킹 점수 · 출석/미션</span>
          </div>
          <div>
            <b className="lose">초기화</b>
            <span>골드 · 장비 레벨 · 티켓 가격 (다시 싸져요)</span>
          </div>
        </div>
        <button className="prestige-btn" disabled={gain < 1} onClick={onRebirth}>
          {gain < 1
            ? `이번 판에서 ${fmt(PRESTIGE_UNIT)} 이상 벌면 환생할 수 있어요 (지금 ${fmt(game.runEarned)})`
            : armed
              ? "한 번 더 누르면 환생해요"
              : `환생하고 💎 ${gain}개 받기`}
        </button>
      </section>
      <button className="reset" onClick={onReset}>
        {armedReset ? "한 번 더 누르면 모든 기록을 지우고 처음부터 시작해요" : "모든 기록 초기화"}
      </button>
    </div>
  );
}
