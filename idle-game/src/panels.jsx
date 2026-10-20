import { useEffect, useRef, useState } from "react";
import {
  AD_TICKET,
  BYPRODUCTS,
  CHARM_CAP,
  CHARM_GACHA,
  CHARM_MERGE,
  CHARM_SLOTS,
  EFFECT_NAMES,
  EQUIPMENT,
  MAX_LEVEL,
  MERGE,
  PITY,
  PRESTIGE,
  QUESTS,
  RARITIES,
  SET_BONUS,
  TICKETS,
  TRIBES,
  TRIBE_STEPS,
  WORKERS,
} from "./data";
import {
  charmSellOf,
  charmText,
  charmTypeOf,
  comboStatusOf,
  dailyOf,
  equipCostOf,
  equipEffectText,
  equipNameOf,
  fmt,
  maxBuyOf,
  nextStreakOf,
  pct,
  pickCharmMaterials,
  prestigeCostOf,
  prestigeMult,
  questRewardOf,
  rarityCountOf,
  stonesFor,
  todayKey,
  tribeStatusOf,
  workerById,
} from "./game";
import { ByproductIcon, CharmIcon, CoinIcon, EquipIcon, Sparkline, WorkerIcon } from "./art";

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

// 합성 한 줄: 같은 등급 3개 → 다음 등급, 1번 또는 가능한 만큼 전부
function MergeRow({ rarity, count, config, onMerge }) {
  const success = config.success(rarity);
  const great = rarity + 2 < RARITIES.length ? config.great : 0;
  const times = Math.floor(count / config.count);
  return (
    <div className="merge-row" style={{ "--rc": RARITIES[rarity].color, "--nc": RARITIES[rarity + 1].color }}>
      <div className="merge-info">
        <span>
          <b style={{ color: RARITIES[rarity].color }}>{RARITIES[rarity].name}</b> {config.count}개 →{" "}
          <b style={{ color: RARITIES[rarity + 1].color }}>{RARITIES[rarity + 1].name}</b>
        </span>
        <span className="merge-odds">
          성공 {pct(success)} · 대성공 {pct(great)} · 실패 {pct(1 - success - great)}
        </span>
        <span className="merge-own">보유 {count}개</span>
      </div>
      <div className="merge-buttons">
        <button className={`buy small ${times ? "ready" : ""}`} disabled={!times} onClick={() => onMerge(rarity, false)}>
          합성
        </button>
        <button className="buy small all" disabled={times < 2} onClick={() => onMerge(rarity, true)}>
          전부 ×{times}
        </button>
      </div>
    </div>
  );
}

// ---------- 장비 ----------
const ROW_H = 50;
const LIST_H = 440;

export function EquipPanel({ game, stats, onBuy }) {
  const [slotId, setSlotId] = useState("pickaxe");
  const [scrollTop, setScrollTop] = useState(0);
  const listRef = useRef(null);
  const slot = EQUIPMENT.find((e) => e.id === slotId);
  const level = game.equip[slotId];
  const minLevel = Math.min(...EQUIPMENT.map((e) => game.equip[e.id]));
  const nextSet = (stats.setTier + 1) * 10;
  const cost = equipCostOf(slot, level);
  const max = maxBuyOf(slot, level, game.gold);

  // 탭을 열면 다음에 살 레벨이 가운데 오도록 스크롤
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    list.scrollTop = Math.max(0, level * ROW_H - LIST_H / 2 + ROW_H / 2);
    setScrollTop(list.scrollTop);
    // 장비를 바꿀 때만 이동하고, 레벨이 오를 때는 따라가지 않아요
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotId]);

  // 1000줄을 다 그리지 않고 보이는 줄만 그려요
  const first = Math.max(1, Math.floor(scrollTop / ROW_H) - 3);
  const last = Math.min(MAX_LEVEL, first + Math.ceil(LIST_H / ROW_H) + 7);
  const rows = [];
  for (let lv = first; lv <= last; lv++) rows.push(lv);

  return (
    <div className="shop">
      <section className="set-box">
        <div className="set-title">🛡️ 장비 세트 {stats.setTier ? `${stats.setTier}단계 발동 중` : ""}</div>
        <p className="section-note">
          모든 장비를 Lv.10, 20, 30…까지 맞추면 단계마다 골드 +{pct(SET_BONUS.gold)}, 치명타 확률 +{pct(SET_BONUS.critChance)}.
        </p>
        <div className="set-progress">
          <span>
            다음 {stats.setTier + 1}단계: 모든 장비 Lv.{nextSet} (지금 최저 Lv.{minLevel})
          </span>
          <div className="bar">
            <div className="quest-fill" style={{ width: `${Math.min(1, (minLevel % 10) / 10) * 100}%` }} />
          </div>
        </div>
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
            {equipNameOf(slot, level)} <span className="badge">Lv.{level}</span>
          </div>
          <div className="desc">지금: {equipEffectText(slotId, level)}</div>
          {level < MAX_LEVEL && <div className="desc next-effect">다음: {equipEffectText(slotId, level + 1)}</div>}
        </div>
        {level < MAX_LEVEL ? (
          <div className="buy-stack">
            <button className={`buy ${game.gold >= cost ? "ready" : ""}`} disabled={game.gold < cost} onClick={() => onBuy(slotId, 1)}>
              <CoinIcon size={16} />
              {fmt(cost)}
            </button>
            <button className="buy small all" disabled={max.count < 2} onClick={() => onBuy(slotId, max.count)}>
              최대 +{max.count}
            </button>
          </div>
        ) : (
          <span className="max-tag">MAX</span>
        )}
      </section>

      <div className="lv-list" ref={listRef} style={{ height: LIST_H }} onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}>
        <div style={{ height: MAX_LEVEL * ROW_H, position: "relative" }}>
          {rows.map((lv) => {
            const state = lv <= level ? "owned" : lv === level + 1 ? "next" : "locked";
            const rowCost = equipCostOf(slot, lv - 1);
            return (
              <div key={lv} className={`lv-row ${state}`} style={{ top: (lv - 1) * ROW_H, height: ROW_H }}>
                <EquipIcon slot={slotId} level={lv} size={32} />
                <div className="lv-info">
                  <span className="lv-name">
                    Lv.{lv} {equipNameOf(slot, lv)}
                    {lv % 100 === 1 && <span className="new-material">새 재질</span>}
                  </span>
                  <span className="lv-effect">{equipEffectText(slotId, lv)}</span>
                </div>
                {state === "owned" && <span className="lv-check">✓</span>}
                {state === "next" && (
                  <button className={`buy small ${game.gold >= rowCost ? "ready" : ""}`} disabled={game.gold < rowCost} onClick={() => onBuy(slotId, 1)}>
                    <CoinIcon size={14} />
                    {fmt(rowCost)}
                  </button>
                )}
                {state === "locked" && (
                  <span className="lv-price">
                    <CoinIcon size={12} />
                    {fmt(rowCost)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
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
          <p className="section-note">광부는 환생해도 계속 함께해요. 탭하지 않아도 조금씩 광석을 캐 와요. 비싼 티켓일수록 높은 등급이 잘 나와요.</p>
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
          {TICKETS.map((ticket) => (
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
                {[1, 10].map((times) => (
                  <button
                    key={times}
                    className={`buy ${game.gold >= ticket.cost * times ? "ready" : ""}`}
                    disabled={game.gold < ticket.cost * times}
                    onClick={() => onPull(ticket, times)}
                  >
                    {times}회 <CoinIcon size={16} />
                    {fmt(ticket.cost * times)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {sub === "bag" && (
        <>
          <div className="bag-head">
            <span className="section-note">
              광부 {Object.values(game.workers).reduce((a, b) => a + b, 0)}명 · 초당 피해 {fmt(stats.workerPower, 1)}
            </span>
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
                    <WorkerIcon look={w.look} rarity={w.rarity} size={56} still />
                    {count > 0 && <span className="bag-count">{count}</span>}
                  </button>
                );
              })}
            </div>
          )}
          {picked && (
            <section className="detail" style={{ "--rc": RARITIES[picked.rarity].color }}>
              <WorkerIcon look={picked.look} rarity={picked.rarity} size={110} />
              <div className="info">
                <div className="name">
                  {game.workers[picked.id] ? picked.name : "???"} <span className="rarity-chip">{RARITIES[picked.rarity].name}</span>
                </div>
                <div className="desc">
                  {TRIBES[picked.tribe].name} · 1명당 초당 피해 {fmt(picked.rate, 1)} · 보유 {game.workers[picked.id] || 0}명
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
            같은 등급 광부 {MERGE.count}명을 합쳐 다음 등급에 도전해요. 대성공이면 두 등급이 오르고, 실패하면 1명만 돌아와요.
          </p>
          {RARITIES.slice(0, -1).map((_, r) => (
            <MergeRow key={r} rarity={r} count={rarityCountOf(game.workers, r)} config={MERGE} onMerge={onMerge} />
          ))}
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
                    <WorkerIcon look={w.look} rarity={w.rarity} size={44} still />
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
                      <WorkerIcon look={w.look} rarity={w.rarity} size={44} still />
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

// ---------- 장신구 (보관함 · 뽑기 · 합성) ----------
export function CharmsPanel({ game, stats, onEquip, onUnequip, onSell, onPull, onMerge }) {
  const [sub, setSub] = useState("bag");
  const [selected, setSelected] = useState(null);
  const picked = game.charms.find((c) => c.uid === selected);
  const isEquipped = (uid) => game.equipped.includes(uid);
  const sorted = [...game.charms].sort((a, b) => b.rarity - a.rarity || b.value - a.value);
  const { charm } = stats;

  return (
    <div className="shop">
      <div className="stone-bar">
        <span>💎 환생석 {game.stones}개</span>
        <span className="section-note">환생할 때 받아요</span>
      </div>
      <SubTabs
        items={[
          ["bag", `보관함 ${game.charms.length}/${CHARM_CAP}`],
          ["gacha", "뽑기"],
          ["merge", "합성"],
        ]}
        value={sub}
        onChange={setSub}
      />

      {sub === "bag" && (
        <>
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
              ["광부", charm.worker, pct],
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
                      {fmt(charmSellOf(picked.rarity))}
                    </button>
                  )}
                </div>
              </div>
            </section>
          )}
          {sorted.length === 0 ? (
            <p className="empty">아직 장신구가 없어요. 환생석으로 뽑아 보세요.</p>
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
        </>
      )}

      {sub === "gacha" && (
        <div className="ticket" style={{ "--tc": "#ff9ef5" }}>
          <div className="ticket-head">
            <span className="ticket-stub" />
            <span className="ticket-name">장신구 뽑기</span>
          </div>
          <div className="odds">
            {CHARM_GACHA.odds.map((odd, r) =>
              odd ? (
                <span key={r} style={{ color: RARITIES[r].color }}>
                  {RARITIES[r].name} {odd}%
                </span>
              ) : null
            )}
          </div>
          <div className="ticket-buttons">
            {[1, 10].map((times) => (
              <button
                key={times}
                className={`buy ${game.stones >= CHARM_GACHA.cost * times ? "ready" : ""}`}
                disabled={game.stones < CHARM_GACHA.cost * times || game.charms.length + times > CHARM_CAP}
                onClick={() => onPull(times)}
              >
                {times}회 💎 {CHARM_GACHA.cost * times}
              </button>
            ))}
          </div>
          {game.charms.length >= CHARM_CAP - 9 && <p className="mission-note">보관함이 거의 찼어요. 합성하거나 팔아서 비워 주세요.</p>}
        </div>
      )}

      {sub === "merge" && (
        <>
          <p className="section-note">장착하지 않은 같은 등급 장신구 {CHARM_MERGE.count}개를 합쳐 다음 등급에 도전해요. 수치가 낮은 것부터 재료로 써요.</p>
          {RARITIES.slice(0, -1).map((_, r) => {
            const count = game.charms.filter((c) => c.rarity === r && !game.equipped.includes(c.uid)).length;
            return <MergeRow key={r} rarity={r} count={count} config={CHARM_MERGE} onMerge={onMerge} />;
          })}
        </>
      )}
    </div>
  );
}

// ---------- 부산물 시장 ----------
export function MarketPanel({ game, market, onSell }) {
  const left = Math.max(0, market.nextAt - market.now);
  const mm = String(Math.floor(left / 60000)).padStart(2, "0");
  const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, "0");

  return (
    <div className="shop">
      <section className="market-head">
        <div>
          <div className="set-title">📈 부산물 시세</div>
          <p className="section-note">
            {market.online
              ? "모두 같은 가격에서 시작해요. 20분마다 모든 광부가 많이 판 건 싸지고, 덜 판 건 비싸져요. 비쌀 때까지 들고 있다가 파세요!"
              : "게스트는 이 기기 안의 모의 시세예요. 로그인하면 모든 광부의 판매량으로 시세가 정해져요."}
          </p>
        </div>
        <div className="countdown">
          <span>다음 시세</span>
          <b>
            {mm}:{ss}
          </b>
        </div>
      </section>
      {BYPRODUCTS.map((item) => {
        const price = market.priceOf(item.id);
        const history = market.state?.history?.[item.id] || [price];
        const prev = history.length > 1 ? history[history.length - 2] : price;
        const change = prev ? (price - prev) / prev : 0;
        const held = game.byproducts[item.id] || 0;
        return (
          <div key={item.id} className="market-row">
            <div className="market-top">
              <ByproductIcon item={item} size={30} />
              <div className="market-name">
                <span>{item.name}</span>
                <span className="market-held">
                  보유 {fmt(held)}개 · 전부 팔면 {fmt(held * price)}
                </span>
              </div>
              <Sparkline values={history} />
              <div className="market-price">
                <span>{fmt(price, 1)}</span>
                <span className={change > 0 ? "up" : change < 0 ? "down" : ""}>
                  {change > 0 ? "▲" : change < 0 ? "▼" : "-"} {pct(Math.abs(change))}
                </span>
              </div>
            </div>
            <div className="market-actions three">
              <button className="trade sell" disabled={held < 1} onClick={() => onSell(item.id, 1)}>
                1개
              </button>
              <button className="trade sell" disabled={held < 10} onClick={() => onSell(item.id, 10)}>
                10개
              </button>
              <button className="trade sell" disabled={held < 1} onClick={() => onSell(item.id, held)}>
                전부 팔기
              </button>
            </div>
          </div>
        );
      })}
      <p className="mission-note">부산물은 어느 광석을 부숴도 8종 중에서 랜덤으로 나와요. 높은 단계일수록 많이 나와요. 시장에서 번 골드는 랭킹 점수에 들어가지 않아요.</p>
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
  const cost = prestigeCostOf(game.prestiges);
  const ready = game.gold >= cost;
  return (
    <div className="shop">
      <section className="prestige">
        <div className="prestige-title">💎 환생 {game.prestiges ? `(${game.prestiges}회 완료)` : ""}</div>
        <p className="prestige-text">
          골드를 내고 바로 환생해요. 환생할 때마다 비용이 {PRESTIGE.growth}배씩 올라가요. 대신 골드 획득이 영구히 +{pct(PRESTIGE.bonus)}씩 늘고,
          장신구를 뽑는 환생석을 받아요.
        </p>
        <div className="prestige-stats">
          <span>골드 배율 x{prestigeMult(game.prestiges).toFixed(2)} → x{prestigeMult(game.prestiges + 1).toFixed(2)}</span>
          <span>💎 +{stonesFor(game.prestiges)}</span>
        </div>
        <div className="set-progress">
          <span>
            환생 비용 {fmt(cost)} (지금 {fmt(game.gold)})
          </span>
          <div className="bar">
            <div className="quest-fill" style={{ width: `${Math.min(1, game.gold / cost) * 100}%` }} />
          </div>
        </div>
        <div className="keep-grid">
          <div>
            <b className="keep">그대로 유지</b>
            <span>광부 전부 · 장신구 · 열린 광석 · 부산물 · 환생석 · 랭킹 점수 · 출석/미션</span>
          </div>
          <div>
            <b className="lose">초기화</b>
            <span>골드 · 장비 레벨</span>
          </div>
        </div>
        <button className="prestige-btn" disabled={!ready} onClick={onRebirth}>
          {!ready ? `골드 ${fmt(cost)}가 필요해요` : armed ? "한 번 더 누르면 환생해요" : `${fmt(cost)} 내고 환생하기`}
        </button>
      </section>
      <button className="reset" onClick={onReset}>
        {armedReset ? "한 번 더 누르면 모든 기록을 지우고 처음부터 시작해요" : "모든 기록 초기화"}
      </button>
    </div>
  );
}
