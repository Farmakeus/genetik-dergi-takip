import React, { useState, useEffect, useCallback, useMemo } from "react";

// ===================== DATA =====================
const temelBranslar = [
  { id: "anatomi", name: "Anatomi", icon: "🦴", soruSayisi: 18 },
  { id: "fizyoloji", name: "Fizyoloji", icon: "⚡", soruSayisi: 15 },
  { id: "biyokimya", name: "Biyokimya", icon: "🧪", soruSayisi: 15 },
  { id: "mikrobiyoloji", name: "Mikrobiyoloji", icon: "🦠", soruSayisi: 15 },
  { id: "patoloji", name: "Patoloji", icon: "🔬", soruSayisi: 15 },
  { id: "farmakoloji", name: "Farmakoloji", icon: "💊", soruSayisi: 15 },
  { id: "histoloji", name: "Histoloji ve Embriyoloji", icon: "🧫", soruSayisi: 8 },
  { id: "tibbigenetik", name: "Tıbbi Genetik", icon: "🧬", soruSayisi: 5 },
  { id: "biyoistatistik", name: "Biyoistatistik", icon: "📊", soruSayisi: 5 },
  { id: "tibbiekoloji", name: "Tıbbi Ekoloji", icon: "🌿", soruSayisi: 3 },
  { id: "tibbietik", name: "Tıbbi Etik / Deontoloji", icon: "⚖️", soruSayisi: 3 },
];

const klinikBranslar = [
  { id: "dahiliye", name: "İç Hastalıkları", icon: "🏥", soruSayisi: 18 },
  { id: "cerrrahi", name: "Genel Cerrahi", icon: "🔪", soruSayisi: 15 },
  { id: "pediatri", name: "Pediatri", icon: "👶", soruSayisi: 15 },
  { id: "kadinDogum", name: "Kadın Hastalıkları ve Doğum", icon: "🤰", soruSayisi: 12 },
  { id: "kardiyoloji", name: "Kardiyoloji", icon: "❤️", soruSayisi: 8 },
  { id: "gogus", name: "Göğüs Hastalıkları", icon: "🫁", soruSayisi: 6 },
  { id: "noroloji", name: "Nöroloji", icon: "🧠", soruSayisi: 8 },
  { id: "psikiyatri", name: "Psikiyatri", icon: "🧩", soruSayisi: 6 },
  { id: "dermatoloji", name: "Dermatoloji", icon: "🩹", soruSayisi: 5 },
  { id: "kbb", name: "KBB", icon: "👂", soruSayisi: 5 },
  { id: "goz", name: "Göz Hastalıkları", icon: "👁️", soruSayisi: 5 },
  { id: "uroloji", name: "Üroloji", icon: "🫘", soruSayisi: 5 },
  { id: "ortopedi", name: "Ortopedi ve Travmatoloji", icon: "🦿", soruSayisi: 5 },
  { id: "enfeksiyon", name: "Enfeksiyon Hastalıkları", icon: "🛡️", soruSayisi: 6 },
  { id: "radyoloji", name: "Radyoloji", icon: "📡", soruSayisi: 3 },
  { id: "anestezi", name: "Anesteziyoloji", icon: "😷", soruSayisi: 3 },
  { id: "acil", name: "Acil Tıp", icon: "🚑", soruSayisi: 3 },
  { id: "ftr", name: "Fiziksel Tıp ve Rehabilitasyon", icon: "🏋️", soruSayisi: 4 },
  { id: "halkSagligi", name: "Halk Sağlığı", icon: "🌍", soruSayisi: 5 },
  { id: "adliTip", name: "Adli Tıp", icon: "🔍", soruSayisi: 3 },
];

const tumBranslar = [
  ...temelBranslar.map(b => ({ ...b, kategori: "Temel Tıp" })),
  ...klinikBranslar.map(b => ({ ...b, kategori: "Klinik Tıp" })),
];

const haftaGunleri = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

// ===================== HELPERS =====================
const LS_KEY = "tus_takip_data";

function loadData() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function saveData(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

function defaultData() {
  return {
    hedefPuan: 70,
    sinavTarihi: "2026-09-13",
    konuDurumlari: {},
    soruCozumleri: [],
    denemeler: [],
    haftalikPlan: {},
    calismaKayitlari: [],
  };
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

function kalanGun(tarih) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const hedef = new Date(tarih);
  hedef.setHours(0, 0, 0, 0);
  return Math.ceil((hedef - now) / (1000 * 60 * 60 * 24));
}

function hesaplaNet(dogru, yanlis) {
  return Math.max(0, dogru - yanlis * 0.25);
}

// ===================== STYLES =====================
const colors = {
  bg: "#0f172a",
  card: "#1e293b",
  cardHover: "#334155",
  primary: "#3b82f6",
  primaryHover: "#2563eb",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  text: "#f1f5f9",
  textMuted: "#94a3b8",
  border: "#334155",
  inputBg: "#0f172a",
  temel: "#8b5cf6",
  klinik: "#06b6d4",
};

const baseStyles = {
  container: {
    minHeight: "100vh",
    background: `linear-gradient(135deg, ${colors.bg} 0%, #1a1a2e 100%)`,
    color: colors.text,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    padding: "0",
  },
  header: {
    background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)",
    padding: "20px 24px",
    borderBottom: `1px solid ${colors.border}`,
    position: "sticky",
    top: 0,
    zIndex: 100,
    backdropFilter: "blur(12px)",
  },
  headerContent: {
    maxWidth: 1200,
    margin: "0 auto",
  },
  title: {
    fontSize: 26,
    fontWeight: 800,
    margin: 0,
    background: "linear-gradient(135deg, #60a5fa, #a78bfa)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    margin: "4px 0 0",
  },
  nav: {
    display: "flex",
    gap: 4,
    marginTop: 16,
    overflowX: "auto",
    paddingBottom: 4,
  },
  navBtn: (active) => ({
    padding: "8px 16px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    background: active ? colors.primary : "transparent",
    color: active ? "#fff" : colors.textMuted,
    transition: "all 0.2s",
    whiteSpace: "nowrap",
  }),
  main: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "24px 16px",
  },
  card: {
    background: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    border: `1px solid ${colors.border}`,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 16,
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  input: {
    background: colors.inputBg,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    padding: "8px 12px",
    color: colors.text,
    fontSize: 14,
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
  },
  select: {
    background: colors.inputBg,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    padding: "8px 12px",
    color: colors.text,
    fontSize: 14,
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
  },
  btn: (variant = "primary") => ({
    padding: "8px 16px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    background: variant === "primary" ? colors.primary : variant === "danger" ? colors.danger : variant === "success" ? colors.success : colors.cardHover,
    color: "#fff",
    transition: "all 0.2s",
  }),
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 16,
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 12,
  },
  badge: (color) => ({
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    background: color + "22",
    color: color,
  }),
  progressBar: (pct, color) => ({
    height: 6,
    borderRadius: 3,
    background: colors.border,
    position: "relative",
    overflow: "hidden",
    flex: 1,
  }),
  progressFill: (pct, color) => ({
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: `${Math.min(100, pct)}%`,
    borderRadius: 3,
    background: color || colors.primary,
    transition: "width 0.5s ease",
  }),
  label: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
    display: "block",
    fontWeight: 500,
  },
  statBox: {
    textAlign: "center",
    padding: 16,
    borderRadius: 10,
    background: colors.inputBg,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 800,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  deleteBtn: {
    background: "none",
    border: "none",
    color: colors.danger,
    cursor: "pointer",
    fontSize: 16,
    padding: "4px 8px",
    borderRadius: 4,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
  },
  th: {
    textAlign: "left",
    padding: "8px 12px",
    borderBottom: `1px solid ${colors.border}`,
    color: colors.textMuted,
    fontWeight: 600,
    fontSize: 12,
  },
  td: {
    padding: "10px 12px",
    borderBottom: `1px solid ${colors.border}22`,
  },
};

// ===================== MINI CHART (SVG Bar) =====================
function MiniBarChart({ data, height = 120, barColor = colors.primary }) {
  if (!data || data.length === 0) return <div style={{ color: colors.textMuted, fontSize: 13 }}>Henüz veri yok</div>;
  const max = Math.max(...data.map(d => d.value), 1);
  const barW = Math.min(32, Math.floor(280 / data.length) - 4);
  const w = data.length * (barW + 4);
  return (
    <svg width="100%" height={height + 24} viewBox={`0 0 ${Math.max(w, 100)} ${height + 24}`} style={{ overflow: "visible" }}>
      {data.map((d, i) => {
        const h = (d.value / max) * height;
        return (
          <g key={i}>
            <rect x={i * (barW + 4)} y={height - h} width={barW} height={h} rx={3} fill={d.color || barColor} opacity={0.85} />
            <text x={i * (barW + 4) + barW / 2} y={height - h - 4} textAnchor="middle" fill={colors.textMuted} fontSize={10}>{d.value.toFixed(1)}</text>
            <text x={i * (barW + 4) + barW / 2} y={height + 14} textAnchor="middle" fill={colors.textMuted} fontSize={9}>{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function MiniLineChart({ data, height = 100, color = colors.primary }) {
  if (!data || data.length < 2) return <div style={{ color: colors.textMuted, fontSize: 13 }}>En az 2 veri noktası gerekli</div>;
  const max = Math.max(...data.map(d => d.value), 1);
  const min = Math.min(...data.map(d => d.value), 0);
  const range = max - min || 1;
  const w = 300;
  const stepX = w / (data.length - 1);
  const points = data.map((d, i) => `${i * stepX},${height - ((d.value - min) / range) * (height - 10)}`).join(" ");
  return (
    <svg width="100%" height={height + 24} viewBox={`0 0 ${w} ${height + 24}`} style={{ overflow: "visible" }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={i * stepX} cy={height - ((d.value - min) / range) * (height - 10)} r={3} fill={color} />
          <text x={i * stepX} y={height + 16} textAnchor="middle" fill={colors.textMuted} fontSize={9}>{d.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ===================== COMPONENTS =====================

// --- Dashboard ---
function Dashboard({ data, setData }) {
  const kalan = kalanGun(data.sinavTarihi);
  const toplamSoru = data.soruCozumleri.reduce((s, c) => s + c.dogru + c.yanlis + (c.bos || 0), 0);
  const toplamDogru = data.soruCozumleri.reduce((s, c) => s + c.dogru, 0);
  const toplamYanlis = data.soruCozumleri.reduce((s, c) => s + c.yanlis, 0);
  const basariOrani = toplamSoru > 0 ? ((toplamDogru / toplamSoru) * 100).toFixed(1) : 0;
  const sonDenemeler = [...data.denemeler].sort((a, b) => new Date(b.tarih) - new Date(a.tarih)).slice(0, 5);
  const tamamlananKonuSayisi = Object.values(data.konuDurumlari).filter(k => k === "tamamlandi").length;
  const toplamKonu = tumBranslar.length;

  const calismaSuresi = data.calismaKayitlari.reduce((s, c) => s + (c.sure || 0), 0);
  const saatStr = (calismaSuresi / 60).toFixed(0);

  return (
    <div>
      {/* Countdown */}
      <div style={{ ...baseStyles.card, background: "linear-gradient(135deg, #1e3a5f 0%, #2d1b69 100%)", textAlign: "center", padding: 32 }}>
        <div style={{ fontSize: 14, color: colors.textMuted, marginBottom: 8 }}>TUS Sınavına Kalan</div>
        <div style={{ fontSize: 56, fontWeight: 900, background: kalan <= 30 ? "linear-gradient(135deg, #ef4444, #f59e0b)" : "linear-gradient(135deg, #60a5fa, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          {kalan > 0 ? kalan : 0} Gün
        </div>
        <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
          Hedef: {formatDate(data.sinavTarihi)} | Hedef Puan: {data.hedefPuan}
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
          <label style={{ fontSize: 12, color: colors.textMuted }}>
            Sınav Tarihi:
            <input type="date" value={data.sinavTarihi} onChange={e => setData(d => ({ ...d, sinavTarihi: e.target.value }))} style={{ ...baseStyles.input, width: 150, marginLeft: 6 }} />
          </label>
          <label style={{ fontSize: 12, color: colors.textMuted }}>
            Hedef Puan:
            <input type="number" value={data.hedefPuan} min={0} max={100} onChange={e => setData(d => ({ ...d, hedefPuan: Number(e.target.value) }))} style={{ ...baseStyles.input, width: 80, marginLeft: 6 }} />
          </label>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 16 }}>
        {[
          { label: "Çözülen Soru", value: toplamSoru, color: colors.primary },
          { label: "Başarı Oranı", value: `%${basariOrani}`, color: colors.success },
          { label: "Toplam Net", value: hesaplaNet(toplamDogru, toplamYanlis).toFixed(1), color: colors.warning },
          { label: "Deneme Sayısı", value: data.denemeler.length, color: "#a78bfa" },
          { label: "Konu İlerlemesi", value: `${tamamlananKonuSayisi}/${toplamKonu}`, color: colors.klinik },
          { label: "Çalışma Süresi", value: `${saatStr} sa`, color: "#f472b6" },
        ].map((s, i) => (
          <div key={i} style={baseStyles.statBox}>
            <div style={{ ...baseStyles.statValue, color: s.color }}>{s.value}</div>
            <div style={baseStyles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Son Denemeler */}
      {sonDenemeler.length > 0 && (
        <div style={baseStyles.card}>
          <div style={baseStyles.cardTitle}>Son Denemeler</div>
          <MiniLineChart
            data={sonDenemeler.reverse().map(d => ({
              value: d.toplamNet,
              label: new Date(d.tarih).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
            }))}
            color={colors.success}
          />
        </div>
      )}

      {/* Konu İlerlemesi Özet */}
      <div style={baseStyles.grid2}>
        <div style={baseStyles.card}>
          <div style={baseStyles.cardTitle}><span style={{ color: colors.temel }}>■</span> Temel Tıp İlerlemesi</div>
          {temelBranslar.map(b => {
            const durum = data.konuDurumlari[b.id] || "baslanmadi";
            const pct = durum === "tamamlandi" ? 100 : durum === "devam" ? 50 : durum === "tekrar" ? 75 : 0;
            const c = durum === "tamamlandi" ? colors.success : durum === "devam" ? colors.warning : durum === "tekrar" ? colors.klinik : colors.border;
            return (
              <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 14, width: 20 }}>{b.icon}</span>
                <span style={{ fontSize: 12, width: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.name}</span>
                <div style={baseStyles.progressBar(pct)}>
                  <div style={baseStyles.progressFill(pct, c)} />
                </div>
              </div>
            );
          })}
        </div>
        <div style={baseStyles.card}>
          <div style={baseStyles.cardTitle}><span style={{ color: colors.klinik }}>■</span> Klinik Tıp İlerlemesi</div>
          {klinikBranslar.map(b => {
            const durum = data.konuDurumlari[b.id] || "baslanmadi";
            const pct = durum === "tamamlandi" ? 100 : durum === "devam" ? 50 : durum === "tekrar" ? 75 : 0;
            const c = durum === "tamamlandi" ? colors.success : durum === "devam" ? colors.warning : durum === "tekrar" ? colors.klinik : colors.border;
            return (
              <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 14, width: 20 }}>{b.icon}</span>
                <span style={{ fontSize: 12, width: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.name}</span>
                <div style={baseStyles.progressBar(pct)}>
                  <div style={baseStyles.progressFill(pct, c)} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- Konu Takibi ---
function KonuTakibi({ data, setData }) {
  const durumlar = [
    { id: "baslanmadi", label: "Başlanmadı", color: colors.textMuted },
    { id: "devam", label: "Devam Ediyor", color: colors.warning },
    { id: "tekrar", label: "Tekrar Aşamasında", color: colors.klinik },
    { id: "tamamlandi", label: "Tamamlandı", color: colors.success },
  ];

  const setDurum = (bransId, durum) => {
    setData(d => ({
      ...d,
      konuDurumlari: { ...d.konuDurumlari, [bransId]: durum },
    }));
  };

  const renderBransGrubu = (baslik, branslar, renk) => (
    <div style={baseStyles.card}>
      <div style={{ ...baseStyles.cardTitle, fontSize: 18 }}>
        <span style={{ color: renk }}>■</span> {baslik}
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {branslar.map(b => {
          const durum = data.konuDurumlari[b.id] || "baslanmadi";
          const durumObj = durumlar.find(d => d.id === durum);
          return (
            <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: colors.inputBg, borderRadius: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 20, width: 28 }}>{b.icon}</span>
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{b.name}</div>
                <div style={{ fontSize: 11, color: colors.textMuted }}>Soru payı: ~{b.soruSayisi}</div>
              </div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {durumlar.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setDurum(b.id, d.id)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 6,
                      border: durum === d.id ? `2px solid ${d.color}` : `1px solid ${colors.border}`,
                      background: durum === d.id ? d.color + "22" : "transparent",
                      color: durum === d.id ? d.color : colors.textMuted,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const ozet = durumlar.map(d => ({
    ...d,
    count: tumBranslar.filter(b => (data.konuDurumlari[b.id] || "baslanmadi") === d.id).length,
  }));

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        {ozet.map(d => (
          <div key={d.id} style={{ ...baseStyles.statBox, flex: "1 1 120px" }}>
            <div style={{ ...baseStyles.statValue, fontSize: 24, color: d.color }}>{d.count}</div>
            <div style={baseStyles.statLabel}>{d.label}</div>
          </div>
        ))}
      </div>
      {renderBransGrubu("Temel Tıp Bilimleri", temelBranslar, colors.temel)}
      {renderBransGrubu("Klinik Tıp Bilimleri", klinikBranslar, colors.klinik)}
    </div>
  );
}

// --- Soru Çözümü ---
function SoruCozumu({ data, setData }) {
  const [form, setForm] = useState({ bransId: tumBranslar[0].id, dogru: "", yanlis: "", bos: "", kaynak: "", tarih: new Date().toISOString().slice(0, 10) });

  const ekle = () => {
    const dogru = parseInt(form.dogru) || 0;
    const yanlis = parseInt(form.yanlis) || 0;
    const bos = parseInt(form.bos) || 0;
    if (dogru + yanlis + bos === 0) return;
    const yeni = { id: Date.now(), bransId: form.bransId, dogru, yanlis, bos, kaynak: form.kaynak, tarih: form.tarih, net: hesaplaNet(dogru, yanlis) };
    setData(d => ({ ...d, soruCozumleri: [yeni, ...d.soruCozumleri] }));
    setForm(f => ({ ...f, dogru: "", yanlis: "", bos: "" }));
  };

  const sil = (id) => {
    setData(d => ({ ...d, soruCozumleri: d.soruCozumleri.filter(s => s.id !== id) }));
  };

  // Son 7 gün soru çözüm grafiği
  const son7 = useMemo(() => {
    const gunler = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("tr-TR", { weekday: "short" });
      const gunSoru = data.soruCozumleri.filter(s => s.tarih === key);
      const toplam = gunSoru.reduce((s, c) => s + c.dogru + c.yanlis + (c.bos || 0), 0);
      gunler.push({ label, value: toplam });
    }
    return gunler;
  }, [data.soruCozumleri]);

  const brans = tumBranslar.find(b => b.id === form.bransId);

  return (
    <div>
      {/* Form */}
      <div style={baseStyles.card}>
        <div style={baseStyles.cardTitle}>Soru Çözümü Ekle</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
          <div>
            <label style={baseStyles.label}>Branş</label>
            <select value={form.bransId} onChange={e => setForm(f => ({ ...f, bransId: e.target.value }))} style={baseStyles.select}>
              <optgroup label="Temel Tıp">
                {temelBranslar.map(b => <option key={b.id} value={b.id}>{b.icon} {b.name}</option>)}
              </optgroup>
              <optgroup label="Klinik Tıp">
                {klinikBranslar.map(b => <option key={b.id} value={b.id}>{b.icon} {b.name}</option>)}
              </optgroup>
            </select>
          </div>
          <div>
            <label style={baseStyles.label}>Tarih</label>
            <input type="date" value={form.tarih} onChange={e => setForm(f => ({ ...f, tarih: e.target.value }))} style={baseStyles.input} />
          </div>
          <div>
            <label style={baseStyles.label}>Doğru</label>
            <input type="number" min={0} value={form.dogru} onChange={e => setForm(f => ({ ...f, dogru: e.target.value }))} style={baseStyles.input} placeholder="0" />
          </div>
          <div>
            <label style={baseStyles.label}>Yanlış</label>
            <input type="number" min={0} value={form.yanlis} onChange={e => setForm(f => ({ ...f, yanlis: e.target.value }))} style={baseStyles.input} placeholder="0" />
          </div>
          <div>
            <label style={baseStyles.label}>Boş</label>
            <input type="number" min={0} value={form.bos} onChange={e => setForm(f => ({ ...f, bos: e.target.value }))} style={baseStyles.input} placeholder="0" />
          </div>
          <div>
            <label style={baseStyles.label}>Kaynak</label>
            <input type="text" value={form.kaynak} onChange={e => setForm(f => ({ ...f, kaynak: e.target.value }))} style={baseStyles.input} placeholder="Tusdata, ÖSYM..." />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
          <span style={{ fontSize: 13, color: colors.textMuted }}>
            Net: <strong style={{ color: colors.success }}>{hesaplaNet(parseInt(form.dogru) || 0, parseInt(form.yanlis) || 0).toFixed(2)}</strong>
          </span>
          <button onClick={ekle} style={baseStyles.btn("primary")}>Ekle</button>
        </div>
      </div>

      {/* Son 7 gün grafiği */}
      <div style={baseStyles.card}>
        <div style={baseStyles.cardTitle}>Son 7 Gün Soru Çözümü</div>
        <MiniBarChart data={son7} barColor={colors.primary} />
      </div>

      {/* Kayıtlar */}
      <div style={baseStyles.card}>
        <div style={baseStyles.cardTitle}>Soru Çözüm Kayıtları ({data.soruCozumleri.length})</div>
        {data.soruCozumleri.length === 0 ? (
          <div style={{ color: colors.textMuted, fontSize: 13, textAlign: "center", padding: 20 }}>Henüz soru çözümü eklenmedi</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={baseStyles.table}>
              <thead>
                <tr>
                  <th style={baseStyles.th}>Tarih</th>
                  <th style={baseStyles.th}>Branş</th>
                  <th style={baseStyles.th}>D</th>
                  <th style={baseStyles.th}>Y</th>
                  <th style={baseStyles.th}>B</th>
                  <th style={baseStyles.th}>Net</th>
                  <th style={baseStyles.th}>Kaynak</th>
                  <th style={baseStyles.th}></th>
                </tr>
              </thead>
              <tbody>
                {data.soruCozumleri.slice(0, 50).map(s => {
                  const b = tumBranslar.find(x => x.id === s.bransId);
                  return (
                    <tr key={s.id}>
                      <td style={baseStyles.td}>{formatDate(s.tarih)}</td>
                      <td style={baseStyles.td}>{b ? `${b.icon} ${b.name}` : s.bransId}</td>
                      <td style={{ ...baseStyles.td, color: colors.success }}>{s.dogru}</td>
                      <td style={{ ...baseStyles.td, color: colors.danger }}>{s.yanlis}</td>
                      <td style={{ ...baseStyles.td, color: colors.textMuted }}>{s.bos || 0}</td>
                      <td style={{ ...baseStyles.td, fontWeight: 700 }}>{s.net.toFixed(1)}</td>
                      <td style={{ ...baseStyles.td, color: colors.textMuted }}>{s.kaynak || "-"}</td>
                      <td style={baseStyles.td}><button onClick={() => sil(s.id)} style={baseStyles.deleteBtn}>×</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Denemeler ---
function Denemeler({ data, setData }) {
  const [form, setForm] = useState({
    ad: "",
    tarih: new Date().toISOString().slice(0, 10),
    temelDogru: "",
    temelYanlis: "",
    klinikDogru: "",
    klinikYanlis: "",
  });

  const ekle = () => {
    const td = parseInt(form.temelDogru) || 0;
    const ty = parseInt(form.temelYanlis) || 0;
    const kd = parseInt(form.klinikDogru) || 0;
    const ky = parseInt(form.klinikYanlis) || 0;
    if (td + ty + kd + ky === 0) return;
    const temelNet = hesaplaNet(td, ty);
    const klinikNet = hesaplaNet(kd, ky);
    const toplamNet = temelNet + klinikNet;
    const yeni = {
      id: Date.now(),
      ad: form.ad || `Deneme ${data.denemeler.length + 1}`,
      tarih: form.tarih,
      temelDogru: td, temelYanlis: ty, temelNet,
      klinikDogru: kd, klinikYanlis: ky, klinikNet,
      toplamNet,
    };
    setData(d => ({ ...d, denemeler: [yeni, ...d.denemeler] }));
    setForm({ ad: "", tarih: new Date().toISOString().slice(0, 10), temelDogru: "", temelYanlis: "", klinikDogru: "", klinikYanlis: "" });
  };

  const sil = (id) => {
    setData(d => ({ ...d, denemeler: d.denemeler.filter(x => x.id !== id) }));
  };

  const sorted = [...data.denemeler].sort((a, b) => new Date(a.tarih) - new Date(b.tarih));
  const lineData = sorted.map(d => ({
    value: d.toplamNet,
    label: new Date(d.tarih).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
  }));

  const enIyi = sorted.length > 0 ? Math.max(...sorted.map(d => d.toplamNet)) : 0;
  const sonNet = sorted.length > 0 ? sorted[sorted.length - 1].toplamNet : 0;
  const ort = sorted.length > 0 ? (sorted.reduce((s, d) => s + d.toplamNet, 0) / sorted.length).toFixed(1) : 0;

  return (
    <div>
      {/* Form */}
      <div style={baseStyles.card}>
        <div style={baseStyles.cardTitle}>Deneme Sonucu Ekle</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
          <div>
            <label style={baseStyles.label}>Deneme Adı</label>
            <input type="text" value={form.ad} onChange={e => setForm(f => ({ ...f, ad: e.target.value }))} style={baseStyles.input} placeholder="Deneme 1" />
          </div>
          <div>
            <label style={baseStyles.label}>Tarih</label>
            <input type="date" value={form.tarih} onChange={e => setForm(f => ({ ...f, tarih: e.target.value }))} style={baseStyles.input} />
          </div>
          <div>
            <label style={baseStyles.label}>Temel Doğru</label>
            <input type="number" min={0} max={120} value={form.temelDogru} onChange={e => setForm(f => ({ ...f, temelDogru: e.target.value }))} style={baseStyles.input} placeholder="0" />
          </div>
          <div>
            <label style={baseStyles.label}>Temel Yanlış</label>
            <input type="number" min={0} max={120} value={form.temelYanlis} onChange={e => setForm(f => ({ ...f, temelYanlis: e.target.value }))} style={baseStyles.input} placeholder="0" />
          </div>
          <div>
            <label style={baseStyles.label}>Klinik Doğru</label>
            <input type="number" min={0} max={120} value={form.klinikDogru} onChange={e => setForm(f => ({ ...f, klinikDogru: e.target.value }))} style={baseStyles.input} placeholder="0" />
          </div>
          <div>
            <label style={baseStyles.label}>Klinik Yanlış</label>
            <input type="number" min={0} max={120} value={form.klinikYanlis} onChange={e => setForm(f => ({ ...f, klinikYanlis: e.target.value }))} style={baseStyles.input} placeholder="0" />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
          <span style={{ fontSize: 13, color: colors.textMuted }}>
            Temel: <strong style={{ color: colors.temel }}>{hesaplaNet(parseInt(form.temelDogru) || 0, parseInt(form.temelYanlis) || 0).toFixed(1)}</strong> |
            Klinik: <strong style={{ color: colors.klinik }}>{hesaplaNet(parseInt(form.klinikDogru) || 0, parseInt(form.klinikYanlis) || 0).toFixed(1)}</strong> |
            Toplam: <strong style={{ color: colors.success }}>{(hesaplaNet(parseInt(form.temelDogru) || 0, parseInt(form.temelYanlis) || 0) + hesaplaNet(parseInt(form.klinikDogru) || 0, parseInt(form.klinikYanlis) || 0)).toFixed(1)}</strong>
          </span>
          <button onClick={ekle} style={baseStyles.btn("primary")}>Ekle</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12, marginBottom: 16 }}>
        <div style={baseStyles.statBox}>
          <div style={{ ...baseStyles.statValue, fontSize: 24, color: colors.success }}>{enIyi.toFixed(1)}</div>
          <div style={baseStyles.statLabel}>En İyi Net</div>
        </div>
        <div style={baseStyles.statBox}>
          <div style={{ ...baseStyles.statValue, fontSize: 24, color: colors.primary }}>{sonNet.toFixed(1)}</div>
          <div style={baseStyles.statLabel}>Son Net</div>
        </div>
        <div style={baseStyles.statBox}>
          <div style={{ ...baseStyles.statValue, fontSize: 24, color: colors.warning }}>{ort}</div>
          <div style={baseStyles.statLabel}>Ortalama</div>
        </div>
        <div style={baseStyles.statBox}>
          <div style={{ ...baseStyles.statValue, fontSize: 24, color: "#a78bfa" }}>{data.denemeler.length}</div>
          <div style={baseStyles.statLabel}>Deneme</div>
        </div>
      </div>

      {/* Chart */}
      {lineData.length >= 2 && (
        <div style={baseStyles.card}>
          <div style={baseStyles.cardTitle}>Net İlerleme Grafiği</div>
          <MiniLineChart data={lineData} color={colors.success} />
        </div>
      )}

      {/* Tablo */}
      <div style={baseStyles.card}>
        <div style={baseStyles.cardTitle}>Deneme Sonuçları</div>
        {data.denemeler.length === 0 ? (
          <div style={{ color: colors.textMuted, fontSize: 13, textAlign: "center", padding: 20 }}>Henüz deneme eklenmedi</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={baseStyles.table}>
              <thead>
                <tr>
                  <th style={baseStyles.th}>Tarih</th>
                  <th style={baseStyles.th}>Ad</th>
                  <th style={baseStyles.th}>Temel Net</th>
                  <th style={baseStyles.th}>Klinik Net</th>
                  <th style={baseStyles.th}>Toplam Net</th>
                  <th style={baseStyles.th}></th>
                </tr>
              </thead>
              <tbody>
                {data.denemeler.map(d => (
                  <tr key={d.id}>
                    <td style={baseStyles.td}>{formatDate(d.tarih)}</td>
                    <td style={baseStyles.td}>{d.ad}</td>
                    <td style={{ ...baseStyles.td, color: colors.temel, fontWeight: 600 }}>{d.temelNet.toFixed(1)}</td>
                    <td style={{ ...baseStyles.td, color: colors.klinik, fontWeight: 600 }}>{d.klinikNet.toFixed(1)}</td>
                    <td style={{ ...baseStyles.td, color: colors.success, fontWeight: 700, fontSize: 15 }}>{d.toplamNet.toFixed(1)}</td>
                    <td style={baseStyles.td}><button onClick={() => sil(d.id)} style={baseStyles.deleteBtn}>×</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Çalışma Planı ---
function CalismePlani({ data, setData }) {
  const [form, setForm] = useState({ gun: haftaGunleri[0], bransId: tumBranslar[0].id, sure: 60, not: "" });

  const ekle = () => {
    const key = form.gun;
    const yeni = { id: Date.now(), bransId: form.bransId, sure: parseInt(form.sure) || 60, not: form.not };
    setData(d => ({
      ...d,
      haftalikPlan: {
        ...d.haftalikPlan,
        [key]: [...(d.haftalikPlan[key] || []), yeni],
      },
    }));
    setForm(f => ({ ...f, not: "" }));
  };

  const sil = (gun, id) => {
    setData(d => ({
      ...d,
      haftalikPlan: {
        ...d.haftalikPlan,
        [gun]: (d.haftalikPlan[gun] || []).filter(x => x.id !== id),
      },
    }));
  };

  const gunToplamSure = (gun) => (data.haftalikPlan[gun] || []).reduce((s, x) => s + x.sure, 0);

  return (
    <div>
      {/* Ekleme Formu */}
      <div style={baseStyles.card}>
        <div style={baseStyles.cardTitle}>Haftalık Plan Ekle</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
          <div>
            <label style={baseStyles.label}>Gün</label>
            <select value={form.gun} onChange={e => setForm(f => ({ ...f, gun: e.target.value }))} style={baseStyles.select}>
              {haftaGunleri.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label style={baseStyles.label}>Branş</label>
            <select value={form.bransId} onChange={e => setForm(f => ({ ...f, bransId: e.target.value }))} style={baseStyles.select}>
              <optgroup label="Temel Tıp">
                {temelBranslar.map(b => <option key={b.id} value={b.id}>{b.icon} {b.name}</option>)}
              </optgroup>
              <optgroup label="Klinik Tıp">
                {klinikBranslar.map(b => <option key={b.id} value={b.id}>{b.icon} {b.name}</option>)}
              </optgroup>
            </select>
          </div>
          <div>
            <label style={baseStyles.label}>Süre (dk)</label>
            <input type="number" min={15} step={15} value={form.sure} onChange={e => setForm(f => ({ ...f, sure: e.target.value }))} style={baseStyles.input} />
          </div>
          <div>
            <label style={baseStyles.label}>Not</label>
            <input type="text" value={form.not} onChange={e => setForm(f => ({ ...f, not: e.target.value }))} style={baseStyles.input} placeholder="Kaynak, konu..." />
          </div>
        </div>
        <div style={{ marginTop: 12, textAlign: "right" }}>
          <button onClick={ekle} style={baseStyles.btn("primary")}>Ekle</button>
        </div>
      </div>

      {/* Haftalık Takvim */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 }}>
        {haftaGunleri.map(gun => {
          const items = data.haftalikPlan[gun] || [];
          const topSure = gunToplamSure(gun);
          return (
            <div key={gun} style={{ ...baseStyles.card, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{gun}</div>
                <span style={baseStyles.badge(topSure > 0 ? colors.primary : colors.textMuted)}>
                  {topSure > 0 ? `${(topSure / 60).toFixed(1)} sa` : "Boş"}
                </span>
              </div>
              {items.length === 0 ? (
                <div style={{ color: colors.textMuted, fontSize: 12, textAlign: "center", padding: 8 }}>Plan eklenmedi</div>
              ) : items.map(item => {
                const b = tumBranslar.find(x => x.id === item.bransId);
                return (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", marginBottom: 4, background: colors.inputBg, borderRadius: 6 }}>
                    <span style={{ fontSize: 14 }}>{b?.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{b?.name}</div>
                      <div style={{ fontSize: 10, color: colors.textMuted }}>{item.sure} dk {item.not ? `· ${item.not}` : ""}</div>
                    </div>
                    <button onClick={() => sil(gun, item.id)} style={baseStyles.deleteBtn}>×</button>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Çalışma Kaydı ---
function CalismaKaydi({ data, setData }) {
  const [form, setForm] = useState({ bransId: tumBranslar[0].id, sure: 60, tarih: new Date().toISOString().slice(0, 10), not: "" });

  const ekle = () => {
    const sure = parseInt(form.sure) || 0;
    if (sure <= 0) return;
    const yeni = { id: Date.now(), bransId: form.bransId, sure, tarih: form.tarih, not: form.not };
    setData(d => ({ ...d, calismaKayitlari: [yeni, ...d.calismaKayitlari] }));
    setForm(f => ({ ...f, not: "" }));
  };

  const sil = (id) => {
    setData(d => ({ ...d, calismaKayitlari: d.calismaKayitlari.filter(x => x.id !== id) }));
  };

  // Son 7 gün çalışma
  const son7 = useMemo(() => {
    const gunler = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("tr-TR", { weekday: "short" });
      const topSure = data.calismaKayitlari.filter(c => c.tarih === key).reduce((s, c) => s + c.sure, 0);
      gunler.push({ label, value: topSure / 60, color: topSure >= 240 ? colors.success : topSure >= 120 ? colors.warning : colors.danger });
    }
    return gunler;
  }, [data.calismaKayitlari]);

  return (
    <div>
      <div style={baseStyles.card}>
        <div style={baseStyles.cardTitle}>Çalışma Kaydı Ekle</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
          <div>
            <label style={baseStyles.label}>Branş</label>
            <select value={form.bransId} onChange={e => setForm(f => ({ ...f, bransId: e.target.value }))} style={baseStyles.select}>
              <optgroup label="Temel Tıp">
                {temelBranslar.map(b => <option key={b.id} value={b.id}>{b.icon} {b.name}</option>)}
              </optgroup>
              <optgroup label="Klinik Tıp">
                {klinikBranslar.map(b => <option key={b.id} value={b.id}>{b.icon} {b.name}</option>)}
              </optgroup>
            </select>
          </div>
          <div>
            <label style={baseStyles.label}>Tarih</label>
            <input type="date" value={form.tarih} onChange={e => setForm(f => ({ ...f, tarih: e.target.value }))} style={baseStyles.input} />
          </div>
          <div>
            <label style={baseStyles.label}>Süre (dk)</label>
            <input type="number" min={5} step={5} value={form.sure} onChange={e => setForm(f => ({ ...f, sure: e.target.value }))} style={baseStyles.input} />
          </div>
          <div>
            <label style={baseStyles.label}>Not</label>
            <input type="text" value={form.not} onChange={e => setForm(f => ({ ...f, not: e.target.value }))} style={baseStyles.input} placeholder="Konu detayı..." />
          </div>
        </div>
        <div style={{ marginTop: 12, textAlign: "right" }}>
          <button onClick={ekle} style={baseStyles.btn("primary")}>Ekle</button>
        </div>
      </div>

      <div style={baseStyles.card}>
        <div style={baseStyles.cardTitle}>Son 7 Gün Çalışma (saat)</div>
        <MiniBarChart data={son7} height={100} />
      </div>

      <div style={baseStyles.card}>
        <div style={baseStyles.cardTitle}>Çalışma Kayıtları ({data.calismaKayitlari.length})</div>
        {data.calismaKayitlari.length === 0 ? (
          <div style={{ color: colors.textMuted, fontSize: 13, textAlign: "center", padding: 20 }}>Henüz kayıt yok</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={baseStyles.table}>
              <thead>
                <tr>
                  <th style={baseStyles.th}>Tarih</th>
                  <th style={baseStyles.th}>Branş</th>
                  <th style={baseStyles.th}>Süre</th>
                  <th style={baseStyles.th}>Not</th>
                  <th style={baseStyles.th}></th>
                </tr>
              </thead>
              <tbody>
                {data.calismaKayitlari.slice(0, 50).map(c => {
                  const b = tumBranslar.find(x => x.id === c.bransId);
                  return (
                    <tr key={c.id}>
                      <td style={baseStyles.td}>{formatDate(c.tarih)}</td>
                      <td style={baseStyles.td}>{b ? `${b.icon} ${b.name}` : c.bransId}</td>
                      <td style={baseStyles.td}>{c.sure} dk</td>
                      <td style={{ ...baseStyles.td, color: colors.textMuted }}>{c.not || "-"}</td>
                      <td style={baseStyles.td}><button onClick={() => sil(c.id)} style={baseStyles.deleteBtn}>×</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Analiz ---
function Analiz({ data }) {
  // Branş bazlı soru çözüm analizi
  const bransAnaliz = useMemo(() => {
    return tumBranslar.map(b => {
      const kayitlar = data.soruCozumleri.filter(s => s.bransId === b.id);
      const topDogru = kayitlar.reduce((s, c) => s + c.dogru, 0);
      const topYanlis = kayitlar.reduce((s, c) => s + c.yanlis, 0);
      const topBos = kayitlar.reduce((s, c) => s + (c.bos || 0), 0);
      const topSoru = topDogru + topYanlis + topBos;
      const net = hesaplaNet(topDogru, topYanlis);
      const basari = topSoru > 0 ? (topDogru / topSoru) * 100 : 0;
      const calismaSuresi = data.calismaKayitlari.filter(c => c.bransId === b.id).reduce((s, c) => s + c.sure, 0);
      return { ...b, topSoru, topDogru, topYanlis, topBos, net, basari, calismaSuresi };
    }).filter(b => b.topSoru > 0 || b.calismaSuresi > 0);
  }, [data.soruCozumleri, data.calismaKayitlari]);

  const enGuclu = [...bransAnaliz].filter(b => b.topSoru >= 10).sort((a, b) => b.basari - a.basari).slice(0, 5);
  const enZayif = [...bransAnaliz].filter(b => b.topSoru >= 10).sort((a, b) => a.basari - b.basari).slice(0, 5);

  // Hiç soru çözülmeyen branşlar
  const hicCozulmeyenler = tumBranslar.filter(b => !bransAnaliz.find(a => a.id === b.id && a.topSoru > 0));

  return (
    <div>
      {/* Güçlü/Zayıf Yönler */}
      <div style={baseStyles.grid2}>
        <div style={baseStyles.card}>
          <div style={{ ...baseStyles.cardTitle, color: colors.success }}>En Güçlü Branşlar</div>
          {enGuclu.length === 0 ? (
            <div style={{ color: colors.textMuted, fontSize: 13 }}>En az 10 soru çözülmüş branş gerekli</div>
          ) : enGuclu.map((b, i) => (
            <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, padding: "8px 10px", background: colors.inputBg, borderRadius: 8 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: colors.success, width: 24 }}>#{i + 1}</span>
              <span style={{ fontSize: 16 }}>{b.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{b.name}</div>
                <div style={{ fontSize: 11, color: colors.textMuted }}>{b.topSoru} soru · {b.net.toFixed(1)} net</div>
              </div>
              <span style={{ fontWeight: 700, color: colors.success }}>%{b.basari.toFixed(0)}</span>
            </div>
          ))}
        </div>
        <div style={baseStyles.card}>
          <div style={{ ...baseStyles.cardTitle, color: colors.danger }}>En Zayıf Branşlar</div>
          {enZayif.length === 0 ? (
            <div style={{ color: colors.textMuted, fontSize: 13 }}>En az 10 soru çözülmüş branş gerekli</div>
          ) : enZayif.map((b, i) => (
            <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, padding: "8px 10px", background: colors.inputBg, borderRadius: 8 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: colors.danger, width: 24 }}>#{i + 1}</span>
              <span style={{ fontSize: 16 }}>{b.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{b.name}</div>
                <div style={{ fontSize: 11, color: colors.textMuted }}>{b.topSoru} soru · {b.net.toFixed(1)} net</div>
              </div>
              <span style={{ fontWeight: 700, color: colors.danger }}>%{b.basari.toFixed(0)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Branş Detay */}
      <div style={baseStyles.card}>
        <div style={baseStyles.cardTitle}>Branş Bazlı Detaylı Analiz</div>
        {bransAnaliz.length === 0 ? (
          <div style={{ color: colors.textMuted, fontSize: 13, textAlign: "center", padding: 20 }}>Soru çözümü veya çalışma kaydı ekledikten sonra analiz görünecektir</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={baseStyles.table}>
              <thead>
                <tr>
                  <th style={baseStyles.th}>Branş</th>
                  <th style={baseStyles.th}>Soru</th>
                  <th style={baseStyles.th}>D/Y/B</th>
                  <th style={baseStyles.th}>Net</th>
                  <th style={baseStyles.th}>Başarı</th>
                  <th style={baseStyles.th}>Çalışma</th>
                </tr>
              </thead>
              <tbody>
                {bransAnaliz.sort((a, b) => b.topSoru - a.topSoru).map(b => (
                  <tr key={b.id}>
                    <td style={baseStyles.td}>{b.icon} {b.name}</td>
                    <td style={baseStyles.td}>{b.topSoru}</td>
                    <td style={baseStyles.td}>
                      <span style={{ color: colors.success }}>{b.topDogru}</span>/
                      <span style={{ color: colors.danger }}>{b.topYanlis}</span>/
                      <span style={{ color: colors.textMuted }}>{b.topBos}</span>
                    </td>
                    <td style={{ ...baseStyles.td, fontWeight: 700 }}>{b.net.toFixed(1)}</td>
                    <td style={baseStyles.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ ...baseStyles.progressBar(b.basari), width: 60 }}>
                          <div style={baseStyles.progressFill(b.basari, b.basari >= 70 ? colors.success : b.basari >= 50 ? colors.warning : colors.danger)} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: b.basari >= 70 ? colors.success : b.basari >= 50 ? colors.warning : colors.danger }}>%{b.basari.toFixed(0)}</span>
                      </div>
                    </td>
                    <td style={{ ...baseStyles.td, color: colors.textMuted }}>{b.calismaSuresi > 0 ? `${(b.calismaSuresi / 60).toFixed(1)} sa` : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Hiç çözülmeyen */}
      {hicCozulmeyenler.length > 0 && (
        <div style={baseStyles.card}>
          <div style={{ ...baseStyles.cardTitle, color: colors.warning }}>Henüz Soru Çözülmeyen Branşlar</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {hicCozulmeyenler.map(b => (
              <span key={b.id} style={{ ...baseStyles.badge(colors.warning), padding: "4px 10px", fontSize: 12 }}>{b.icon} {b.name}</span>
            ))}
          </div>
        </div>
      )}

      {/* Temel vs Klinik karşılaştırma */}
      <div style={baseStyles.card}>
        <div style={baseStyles.cardTitle}>Temel Tıp vs Klinik Tıp</div>
        {(() => {
          const temelKayitlar = data.soruCozumleri.filter(s => temelBranslar.find(b => b.id === s.bransId));
          const klinikKayitlar = data.soruCozumleri.filter(s => klinikBranslar.find(b => b.id === s.bransId));
          const tD = temelKayitlar.reduce((s, c) => s + c.dogru, 0);
          const tY = temelKayitlar.reduce((s, c) => s + c.yanlis, 0);
          const tS = tD + tY + temelKayitlar.reduce((s, c) => s + (c.bos || 0), 0);
          const kD = klinikKayitlar.reduce((s, c) => s + c.dogru, 0);
          const kY = klinikKayitlar.reduce((s, c) => s + c.yanlis, 0);
          const kS = kD + kY + klinikKayitlar.reduce((s, c) => s + (c.bos || 0), 0);
          return (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ textAlign: "center", padding: 16, borderRadius: 8, background: colors.temel + "15" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: colors.temel, marginBottom: 8 }}>Temel Tıp</div>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{tS > 0 ? ((tD / tS) * 100).toFixed(0) : 0}%</div>
                <div style={{ fontSize: 12, color: colors.textMuted }}>{tS} soru · {hesaplaNet(tD, tY).toFixed(1)} net</div>
              </div>
              <div style={{ textAlign: "center", padding: 16, borderRadius: 8, background: colors.klinik + "15" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: colors.klinik, marginBottom: 8 }}>Klinik Tıp</div>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{kS > 0 ? ((kD / kS) * 100).toFixed(0) : 0}%</div>
                <div style={{ fontSize: 12, color: colors.textMuted }}>{kS} soru · {hesaplaNet(kD, kY).toFixed(1)} net</div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ===================== MAIN APP =====================
const tabs = [
  { id: "dashboard", label: "Genel Bakış" },
  { id: "konular", label: "Konu Takibi" },
  { id: "sorular", label: "Soru Çözümü" },
  { id: "denemeler", label: "Denemeler" },
  { id: "plan", label: "Çalışma Planı" },
  { id: "kayit", label: "Çalışma Kaydı" },
  { id: "analiz", label: "Analiz" },
];

export default function TusTakip() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [data, setDataRaw] = useState(() => loadData() || defaultData());

  const setData = useCallback((updater) => {
    setDataRaw(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveData(next);
      return next;
    });
  }, []);

  // Migrate missing fields
  useEffect(() => {
    let needs = false;
    const d = { ...data };
    if (!d.calismaKayitlari) { d.calismaKayitlari = []; needs = true; }
    if (!d.haftalikPlan) { d.haftalikPlan = {}; needs = true; }
    if (needs) setData(d);
  }, []);

  const resetData = () => {
    if (confirm("Tüm veriler silinecek. Emin misiniz?")) {
      setData(defaultData());
    }
  };

  return (
    <div style={baseStyles.container}>
      <header style={baseStyles.header}>
        <div style={baseStyles.headerContent}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 style={baseStyles.title}>TUS Takip</h1>
              <p style={baseStyles.subtitle}>Tıpta Uzmanlık Sınavı Hazırlık Takip Sistemi</p>
            </div>
            <button onClick={resetData} style={{ ...baseStyles.btn("ghost"), fontSize: 11, opacity: 0.5 }}>Sıfırla</button>
          </div>
          <nav style={baseStyles.nav}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={baseStyles.navBtn(activeTab === t.id)}>
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main style={baseStyles.main}>
        {activeTab === "dashboard" && <Dashboard data={data} setData={setData} />}
        {activeTab === "konular" && <KonuTakibi data={data} setData={setData} />}
        {activeTab === "sorular" && <SoruCozumu data={data} setData={setData} />}
        {activeTab === "denemeler" && <Denemeler data={data} setData={setData} />}
        {activeTab === "plan" && <CalismePlani data={data} setData={setData} />}
        {activeTab === "kayit" && <CalismaKaydi data={data} setData={setData} />}
        {activeTab === "analiz" && <Analiz data={data} />}
      </main>
    </div>
  );
}
