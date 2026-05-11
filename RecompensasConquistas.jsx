import { useState, useEffect } from "react";

const TEAL       = "#2A9E87";
const TEAL_DARK  = "#1B7A67";
const TEAL_LIGHT = "#E1F5EE";
const TEAL_MID   = "#5DCAA5";

/* Dados Estáticos */

const ALL_REWARDS = [
  {
    id: "desc_passeio_1",
    icon: "🏞️",
    title: "10% off em passeio",
    partner: "Parceiro de Passeios",
    desc: "Desconto em passeio turístico com parceiro credenciado.",
    cost: 150,
    code: "SERGI10PAS",
    category: "desconto",
    expiry: "31/12/2026",
  },
  {
    id: "brinde_restaurante_1",
    icon: "🍮",
    title: "Sobremesa grátis",
    partner: "Restaurante Parceiro",
    desc: "Ganhe uma sobremesa típica na sua próxima visita.",
    cost: 80,
    code: "SOBREMESA_SG",
    category: "brinde",
    expiry: "30/06/2026",
  },
  {
    id: "desc_hotel_1",
    icon: "🏨",
    title: "15% off em hospedagem",
    partner: "Hotel Parceiro",
    desc: "Desconto na diária para reservas feitas pelo Sergipanidade.",
    cost: 300,
    code: "HOTEL15SG",
    category: "desconto",
    expiry: "31/08/2026",
  },
  {
    id: "experiencia_roteiro",
    icon: "🗺️",
    title: "Roteiro personalizado grátis",
    partner: "Sergipanidade",
    desc: "Receba um roteiro exclusivo montado por nossos guias locais.",
    cost: 200,
    code: "ROTEIRO_VIP",
    category: "experiencia",
    expiry: "31/12/2026",
  },
  {
    id: "desc_passeio_2",
    icon: "🚤",
    title: "20% off em passeio aquático",
    partner: "Parceiro de Passeios",
    desc: "Desconto em passeio de barco com parceiro credenciado.",
    cost: 120,
    code: "SERGI20PAQ",
    category: "desconto",
    expiry: "30/09/2026",
  },
  {
    id: "kit_boas_vindas",
    icon: "🎁",
    title: "Kit Sergipanidade",
    partner: "Sergipanidade",
    desc: "Kit com produtos artesanais sergipanos enviado para você.",
    cost: 500,
    code: "KIT_SERGI",
    category: "brinde",
    expiry: "31/12/2026",
  },
];

const BADGES_CONFIG = [
  { id: "explorador",  label: "Explorador",    icon: "🗺️", desc: "5 avaliações enviadas",    threshold: 5,  field: "totalReviews",    points: 100 },
  { id: "gourmet",     label: "Gourmet Local",  icon: "🍽️", desc: "3 restaurantes avaliados", threshold: 3,  field: "restaurantCount", points: 75  },
  { id: "hospede",     label: "Hóspede Fiel",   icon: "🏨", desc: "2 hotéis avaliados",       threshold: 2,  field: "hotelCount",      points: 75  },
  { id: "aventureiro", label: "Aventureiro",    icon: "🏄", desc: "3 passeios avaliados",     threshold: 3,  field: "passeiCount",     points: 100 },
  { id: "sergipano",   label: "Sergipanidade",  icon: "🦀", desc: "10 avaliações aprovadas",  threshold: 10, field: "approvedReviews", points: 200 },
];

const LEVELS = [
  { name: "Visitante",   min: 0    },
  { name: "Explorador",  min: 100  },
  { name: "Descobridor", min: 300  },
  { name: "Embaixador",  min: 600  },
  { name: "Sergipano",   min: 1000 },
];

/* Usuários */

function storageKey(userName) { return `sergipanidade_rewards_${userName}`; }

function loadState(userName) {
  try {
    const raw = localStorage.getItem(storageKey(userName));
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
}

function saveState(userName, state) {
  try { localStorage.setItem(storageKey(userName), JSON.stringify(state)); } catch (_) {}
}

function getInitials(name = "") {
  return name.trim().split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("");
}

function computeStats(reviews = []) {
  const approved = reviews.filter(r => r.status === "aprovada");
  return {
    totalReviews:    reviews.length,
    approvedReviews: approved.length,
    earnedPoints:    approved.reduce((s, r) => s + (r.points ?? 0), 0),
    restaurantCount: reviews.filter(r => r.category === "Restaurantes").length,
    hotelCount:      reviews.filter(r => r.category === "Hotéis").length,
    passeiCount:     reviews.filter(r => r.category === "Passeios").length,
  };
}

function getLevel(pts) {
  let lv = LEVELS[0];
  for (const l of LEVELS) { if (pts >= l.min) lv = l; }
  const idx = LEVELS.indexOf(lv);
  return { current: lv, next: LEVELS[idx + 1] || null };
}

/* Subcomponentes */

function Avatar({ initials, size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: TEAL_LIGHT, color: TEAL_DARK,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: Math.round(size * 0.35),
      flexShrink: 0, border: `2px solid ${TEAL_MID}`,
    }}>
      {initials}
    </div>
  );
}

function ProgressBar({ value, max }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 99, height: 6, overflow: "hidden", width: "100%" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: "#fff", borderRadius: 99, transition: "width 0.6s ease" }} />
    </div>
  );
}

function RewardCard({ reward, availablePoints, redeemed, onRedeem }) {
  const [showCode, setShowCode] = useState(false);
  const canAfford = availablePoints >= reward.cost;

  const catColor = {
    desconto:    { bg: "#E1F5EE", color: TEAL_DARK,  label: "Desconto"    },
    brinde:      { bg: "#FFF0F6", color: "#9D174D",   label: "Brinde"      },
    experiencia: { bg: "#EEF2FF", color: "#3730A3",   label: "Experiência" },
  };
  const cat = catColor[reward.category] || catColor.desconto;

  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      border: `1.5px solid ${redeemed ? TEAL_MID : "#E5E7EB"}`,
      padding: "18px 16px",
      position: "relative",
      opacity: (!canAfford && !redeemed) ? 0.72 : 1,
      transition: "opacity 0.2s",
    }}>
      {redeemed && (
        <div style={{
          position: "absolute", top: -8, right: -8,
          background: TEAL, color: "#fff",
          borderRadius: "50%", width: 24, height: 24,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 800,
        }}>✓</div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ fontSize: 32 }}>{reward.icon}</span>
        <span style={{ background: cat.bg, color: cat.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
          {cat.label}
        </span>
      </div>

      <div style={{ fontWeight: 800, fontSize: 15, color: "#1a1a1a", marginBottom: 3 }}>{reward.title}</div>
      <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 6 }}>{reward.partner}</div>
      <div style={{ fontSize: 13, color: "#374151", marginBottom: 10, lineHeight: 1.5 }}>{reward.desc}</div>
      <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 14 }}>Válido até {reward.expiry}</div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ background: "#FFF8E7", color: "#B07D00", fontWeight: 700, fontSize: 13, padding: "4px 12px", borderRadius: 20 }}>
          {reward.cost} pts
        </span>
        {redeemed ? (
          <button
            onClick={() => setShowCode(s => !s)}
            style={{ background: TEAL_LIGHT, color: TEAL_DARK, border: "none", borderRadius: 10, padding: "7px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            {showCode ? "Ocultar" : "Ver cupom"}
          </button>
        ) : (
          <button
            onClick={() => canAfford && onRedeem(reward)}
            style={{ background: canAfford ? TEAL : "#E5E7EB", color: canAfford ? "#fff" : "#9CA3AF", border: "none", borderRadius: 10, padding: "7px 14px", fontSize: 13, fontWeight: 700, cursor: canAfford ? "pointer" : "not-allowed", transition: "background 0.2s" }}
          >
            {canAfford ? "Resgatar" : "Pontos insuf."}
          </button>
        )}
      </div>

      {redeemed && showCode && (
        <div style={{ marginTop: 12, background: TEAL_LIGHT, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
          <div style={{ fontSize: 11, color: TEAL_DARK, fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Seu cupom</div>
          <div style={{ fontFamily: "monospace", fontSize: 17, fontWeight: 800, color: TEAL_DARK, letterSpacing: 2 }}>{reward.code}</div>
          <div style={{ fontSize: 11, color: TEAL, marginTop: 6 }}>Apresente no estabelecimento parceiro</div>
        </div>
      )}
    </div>
  );
}

/* Componente Principal */

export default function RecompensasConquistas({
  user    = { name: "Visitante" },
  reviews = [],
}) {
  const userInitials = user.initials || getInitials(user.name);

  // Resgates persistidos no localStorage
  const [redeemed, setRedeemed] = useState(() => loadState(user.name)?.redeemed ?? []);
  const [spentPoints, setSpentPoints] = useState(() => loadState(user.name)?.spentPoints ?? 0);

  const [tab, setTab]                   = useState("recompensas");
  const [toast, setToast]               = useState(null);
  const [rewardFilter, setRewardFilter] = useState("todos");

  const stats         = computeStats(reviews);
  const availablePoints = Math.max(0, stats.earnedPoints - spentPoints);
  const { current: lvCurrent, next: lvNext } = getLevel(stats.earnedPoints);
  const earnedBadges  = BADGES_CONFIG.map(b => ({ ...b, earned: stats[b.field] >= b.threshold }));

  useEffect(() => {
    saveState(user.name, { redeemed, spentPoints });
  }, [redeemed, spentPoints, user.name]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleRedeem = (reward) => {
    if (availablePoints < reward.cost) return;
    setSpentPoints(p => p + reward.cost);
    setRedeemed(r => [...r, reward.id]);
    showToast(`Recompensa resgatada! Código: ${reward.code} 🎁`);
  };

  const filteredRewards = rewardFilter === "todos"
    ? ALL_REWARDS
    : ALL_REWARDS.filter(r => r.category === rewardFilter);

  const tabs = [
    { id: "recompensas", label: "Recompensas" },
    { id: "conquistas",  label: "Conquistas"  },
  ];

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", maxWidth: 700, margin: "0 auto", paddingBottom: 40 }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 2000,
          background: toast.type === "error" ? "#FEE2E2" : TEAL,
          color: toast.type === "error" ? "#B91C1C" : "#fff",
          padding: "12px 20px", borderRadius: 12, fontWeight: 600, fontSize: 14,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)", maxWidth: 360,
          animation: "sgFadeIn 0.3s ease",
        }}>
          {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes sgFadeIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sgPopIn  { from { transform: scale(0.85); opacity: 0; }      to { transform: scale(1); opacity: 1; } }
      `}</style>

      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${TEAL_DARK} 0%, ${TEAL} 60%, ${TEAL_MID} 100%)`,
        borderRadius: "0 0 24px 24px",
        padding: "28px 24px 24px",
        color: "#fff",
        marginBottom: 24,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar initials={userInitials} size={48} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.75, textTransform: "uppercase", letterSpacing: 1 }}>🦀 Sergipanidade</div>
              <div style={{ fontWeight: 800, fontSize: 18 }}>{user.name}</div>
              <div style={{ fontSize: 12, opacity: 0.8, fontWeight: 600 }}>{lvCurrent.name}</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 30, fontWeight: 900, lineHeight: 1 }}>{availablePoints}</div>
            <div style={{ fontSize: 11, opacity: 0.75, fontWeight: 600 }}>PONTOS</div>
          </div>
        </div>

        {lvNext && (
          <div style={{ background: "rgba(0,0,0,0.15)", borderRadius: 12, padding: "10px 16px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, fontWeight: 600 }}>
              <span>{lvCurrent.name}</span>
              <span style={{ opacity: 0.8 }}>{stats.earnedPoints} / {lvNext.min} pts → {lvNext.name}</span>
            </div>
            <ProgressBar value={stats.earnedPoints - lvCurrent.min} max={lvNext.min - lvCurrent.min} />
          </div>
        )}

        <div style={{ display: "flex" }}>
          {[
            { label: "Avaliações",  value: stats.totalReviews    },
            { label: "Aprovadas",   value: stats.approvedReviews },
            { label: "Conquistas",  value: earnedBadges.filter(b => b.earned).length },
          ].map((s, i) => (
            <div key={s.label} style={{ textAlign: "center", flex: 1, borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.2)" : "none" }}>
              <div style={{ fontSize: 22, fontWeight: 800 }}>{s.value}</div>
              <div style={{ fontSize: 11, opacity: 0.75, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>

        {/* Tabs */}
        <div style={{ display: "flex", background: "#F3F4F6", borderRadius: 12, padding: 4, marginBottom: 20 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "9px 0", border: "none",
              background: tab === t.id ? "#fff" : "transparent",
              color: tab === t.id ? TEAL_DARK : "#6B7280",
              borderRadius: 10, fontWeight: tab === t.id ? 700 : 500,
              fontSize: 14, cursor: "pointer",
              boxShadow: tab === t.id ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.2s",
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Recompensas */}
        {tab === "recompensas" && (
          <>
            {/* Saldo */}
            <div style={{
              background: "linear-gradient(135deg, #FFF8E7, #FEF3CD)",
              border: "1.5px solid #F59E0B",
              borderRadius: 16, padding: "16px 20px", marginBottom: 20,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#92400E", marginBottom: 2 }}>🏆 Saldo disponível</div>
                <div style={{ fontSize: 12, color: "#B45309" }}>Troque pontos por benefícios exclusivos</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 30, fontWeight: 900, color: "#B07D00" }}>{availablePoints}</div>
                <div style={{ fontSize: 11, color: "#B45309", fontWeight: 600 }}>pontos</div>
              </div>
            </div>

            {/* Filtros de categoria */}
            <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
              {[["todos","Todos"],["desconto","Descontos"],["brinde","Brindes"],["experiencia","Experiências"]].map(([val, label]) => (
                <button key={val} onClick={() => setRewardFilter(val)} style={{
                  padding: "6px 14px", borderRadius: 20, fontSize: 13,
                  border: `1.5px solid ${rewardFilter === val ? TEAL : "#E5E7EB"}`,
                  background: rewardFilter === val ? TEAL_LIGHT : "#fff",
                  color: rewardFilter === val ? TEAL_DARK : "#6B7280",
                  fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Grid de recompensas */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {filteredRewards.map(r => (
                <RewardCard
                  key={r.id}
                  reward={r}
                  availablePoints={availablePoints}
                  redeemed={redeemed.includes(r.id)}
                  onRedeem={handleRedeem}
                />
              ))}
            </div>

            {/* Como ganhar pontos */}
            <h3 style={{ fontWeight: 800, fontSize: 16, color: "#1a1a1a", margin: "28px 0 12px" }}>Como ganhar pontos</h3>
            {[
              { icon: "⭐", action: "Avaliação com 5 estrelas aprovada", points: "+50 pts" },
              { icon: "✍️", action: "Qualquer avaliação aprovada",       points: "+30 pts" },
              { icon: "👍", action: "Receber curtida na avaliação",      points: "+5 pts"  },
              { icon: "🔁", action: "3 avaliações no mesmo mês",         points: "+80 pts bônus" },
              { icon: "🦀", action: "Primeira avaliação do mês",         points: "+20 pts" },
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "13px 16px", background: "#fff",
                border: "1.5px solid #E5E7EB", borderRadius: 12, marginBottom: 8,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>{item.action}</span>
                </div>
                <span style={{ background: TEAL_LIGHT, color: TEAL_DARK, fontWeight: 700, fontSize: 13, padding: "4px 12px", borderRadius: 20 }}>
                  {item.points}
                </span>
              </div>
            ))}
          </>
        )}

        {/* Conquistas */}
        {tab === "conquistas" && (
          <>
            <p style={{ color: "#6B7280", fontSize: 14, margin: "0 0 20px" }}>
              Complete desafios para desbloquear conquistas e ganhar pontos bônus.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {earnedBadges.map(b => (
                <div key={b.id} style={{
                  background: b.earned ? "#fff" : "#F9FAFB",
                  border: `1.5px solid ${b.earned ? TEAL_MID : "#E5E7EB"}`,
                  borderRadius: 16, padding: "18px 16px", textAlign: "center",
                  opacity: b.earned ? 1 : 0.6,
                  position: "relative",
                  animation: b.earned ? "sgPopIn 0.4s ease" : "none",
                }}>
                  {b.earned && (
                    <div style={{
                      position: "absolute", top: -8, right: -8,
                      background: TEAL, color: "#fff",
                      borderRadius: "50%", width: 22, height: 22,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 800,
                    }}>✓</div>
                  )}
                  <div style={{ fontSize: 34, marginBottom: 8 }}>{b.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: "#1a1a1a", marginBottom: 4 }}>{b.label}</div>
                  <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 10 }}>{b.desc}</div>
                  <div style={{
                    background: b.earned ? TEAL_LIGHT : "#F3F4F6",
                    color: b.earned ? TEAL_DARK : "#9CA3AF",
                    borderRadius: 20, padding: "3px 12px",
                    fontSize: 12, fontWeight: 700, display: "inline-block",
                  }}>
                    {b.earned ? `+${b.points} pts ganhos` : `+${b.points} pts`}
                  </div>
                  {!b.earned && (
                    <div style={{ marginTop: 8, fontSize: 11, color: "#9CA3AF" }}>
                      {stats[b.field]}/{b.threshold} concluídos
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}