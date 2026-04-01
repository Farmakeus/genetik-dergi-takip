import React, { useState, useEffect, useCallback } from "react";

const journals = [
  {
    id: 1, name: "American Journal of Human Genetics", abbr: "AJHG", if2024: 8.1,
    frequency: "Aylık", focus: "İnsan genetiği, genomik, hesaplamalı biyoloji",
    url: "https://www.cell.com/ajhg/home", tags: ["temel", "genomik", "hesaplamalı"],
    tier: "S", color: "#1B4965", publisher: "Cell Press / ASHG",
    note: "ASHG'nin resmi dergisi. Popülasyon genetiğinden Mendelian hastalıklara kadar geniş kapsam."
  },
  {
    id: 2, name: "Nature Genetics", abbr: "Nat Genet", if2024: 31.7,
    frequency: "Aylık", focus: "Genetik ve genomik — temel ve translasyonel",
    url: "https://www.nature.com/ng/", tags: ["temel", "genomik", "translasyonel"],
    tier: "S", color: "#C1121F", publisher: "Nature Portfolio",
    note: "En yüksek IF'li genetik dergisi. GWAS, fonksiyonel genomik ve yeni gen keşifleri."
  },
  {
    id: 3, name: "Genetics in Medicine", abbr: "GIM", if2024: 6.6,
    frequency: "Aylık", focus: "Klinik genetik, genetik test, genetik danışmanlık",
    url: "https://www.gimjournal.org/", tags: ["klinik", "test", "rehber"],
    tier: "A", color: "#2D6A4F", publisher: "ACMG / Elsevier",
    note: "ACMG'nin resmi dergisi. Klinik varyant yorumlama rehberleri burada yayımlanır."
  },
  {
    id: 4, name: "European Journal of Human Genetics", abbr: "EJHG", if2024: 3.7,
    frequency: "Aylık", focus: "Klinik genetik, sitogenetik, moleküler genetik",
    url: "https://www.nature.com/ejhg/", tags: ["klinik", "moleküler", "sitogenetik"],
    tier: "A", color: "#003566", publisher: "ESHG / Nature Portfolio",
    note: "Avrupa perspektifli klinik genetik. Türk genetikçilerin sık yayın yaptığı dergi."
  },
  {
    id: 5, name: "American Journal of Medical Genetics Part A", abbr: "AJMG-A", if2024: 2.0,
    frequency: "Aylık", focus: "Klinik genetik, dismorfik sendromlar, vaka raporları",
    url: "https://onlinelibrary.wiley.com/journal/15524833", tags: ["klinik", "dismorfik", "vaka"],
    tier: "A", color: "#6A040F", publisher: "Wiley",
    note: "Dismorfik sendrom vaka raporları için ana dergi. Rezidanlar için ideal ilk yayın hedefi."
  },
  {
    id: 6, name: "Human Mutation / Human Genetics", abbr: "Hum Genet", if2024: 3.8,
    frequency: "Aylık", focus: "Mutasyon analizi, varyant fonksiyonel çalışmaları",
    url: "https://link.springer.com/journal/439", tags: ["moleküler", "varyant", "fonksiyonel"],
    tier: "A", color: "#7B2D8E", publisher: "Springer",
    note: "Varyant-fonksiyon ilişkisi ve in silico analiz çalışmaları için önemli."
  },
  {
    id: 7, name: "Prenatal Diagnosis", abbr: "Prenat Diagn", if2024: 2.3,
    frequency: "Aylık", focus: "Prenatal genetik tanı, NIPT, fetal tıp",
    url: "https://onlinelibrary.wiley.com/journal/10970223", tags: ["prenatal", "klinik", "test"],
    tier: "B", color: "#E76F51", publisher: "Wiley",
    note: "NIPT, CVS/amniyosentez sonuçları ve prenatal array CGH çalışmaları."
  },
  {
    id: 9, name: "Clinical Genetics", abbr: "Clin Genet", if2024: 3.2,
    frequency: "Aylık", focus: "Klinik genetik, moleküler tanı, danışmanlık",
    url: "https://onlinelibrary.wiley.com/journal/13990004", tags: ["klinik", "moleküler", "test"],
    tier: "A", color: "#264653", publisher: "Wiley",
    note: "Kısa vaka raporları (Letter) formatı rezidanlar için hızlı yayın imkanı sunar."
  },
  {
    id: 10, name: "Genome Medicine", abbr: "Genome Med", if2024: 10.4,
    frequency: "Sürekli", focus: "Klinik genomik, WES/WGS, hassas tıp",
    url: "https://genomemedicine.biomedcentral.com/", tags: ["genomik", "translasyonel", "hesaplamalı"],
    tier: "S", color: "#0077B6", publisher: "BMC / Springer Nature",
    note: "WES/WGS klinik çalışmaları ve biyoinformatik pipeline makaleleri. Open access."
  },
  {
    id: 11, name: "Orphanet Journal of Rare Diseases", abbr: "OJRD", if2024: 3.4,
    frequency: "Sürekli", focus: "Nadir hastalıklar, epidemiyoloji, tanı yolculuğu",
    url: "https://ojrd.biomedcentral.com/", tags: ["klinik", "nadir", "translasyonel"],
    tier: "B", color: "#588157", publisher: "BMC / Springer Nature",
    note: "Nadir hastalık kohortları ve tanı gecikme süreleri analizleri. Open access."
  },
  {
    id: 12, name: "Briefings in Bioinformatics", abbr: "Brief Bioinform", if2024: 6.8,
    frequency: "2 ayda bir", focus: "Biyoinformatik pipeline'lar, araç geliştirme, veri analiz yöntemleri",
    url: "https://academic.oup.com/bib", tags: ["biyoinformatik", "hesaplamalı", "pipeline"],
    tier: "S", color: "#E63946", publisher: "Oxford University Press",
    note: "NGS pipeline karşılaştırma ve review makaleleri için en prestijli adres."
  },
  {
    id: 13, name: "Human Genomics", abbr: "Hum Genomics", if2024: 3.8,
    frequency: "Sürekli", focus: "Klinik biyoinformatik, WES/WGS analiz, varyant yorumlama",
    url: "https://humgenomics.biomedcentral.com/", tags: ["biyoinformatik", "genomik", "varyant", "klinik"],
    tier: "A", color: "#457B9D", publisher: "BMC / Springer Nature",
    note: "WES/WGS klinik biyoinformatik çalışmaları ve varyant filtreleme stratejileri. Open access."
  },
  {
    id: 14, name: "Bioinformatics", abbr: "Bioinformatics", if2024: 4.4,
    frequency: "2 haftada bir", focus: "Algoritma geliştirme, varyant çağırma, yazılım araçları",
    url: "https://academic.oup.com/bioinformatics", tags: ["biyoinformatik", "hesaplamalı", "pipeline", "varyant"],
    tier: "A", color: "#2A9D8F", publisher: "Oxford University Press",
    note: "GATK, ACMG otomasyon araçları, varyant sınıflandırma algoritmaları burada yayımlanır."
  }
];

const allTags = ["temel", "klinik", "genomik", "moleküler", "translasyonel", "hesaplamalı", "dismorfik", "prenatal", "vaka", "test", "rehber", "nadir", "varyant", "fonksiyonel", "biyoinformatik", "pipeline"];
const tierInfo = { S: { label: "S — Elit", desc: "IF > 6", bg: "#FFD700" }, A: { label: "A — Güçlü", desc: "IF 2–6", bg: "#C0C0C0" }, B: { label: "B — Hedef", desc: "IF < 3, erişilebilir", bg: "#CD7F32" } };
const periodLabels = { month: "Bu Ay", year: "Bu Yıl (2026)", alltime: "Tüm Zamanlar" };

// PubMed NLM Title Abbreviation + ISSN for CrossRef
const journalMeta = {
  "American Journal of Human Genetics": { ta: "Am J Hum Genet", issn: "0002-9297" },
  "Nature Genetics": { ta: "Nat Genet", issn: "1061-4036" },
  "Genetics in Medicine": { ta: "Genet Med", issn: "1098-3600" },
  "European Journal of Human Genetics": { ta: "Eur J Hum Genet", issn: "1018-4813" },
  "American Journal of Medical Genetics Part A": { ta: "Am J Med Genet A", issn: "1552-4825" },
  "Human Mutation / Human Genetics": { ta: "Hum Genet", issn: "0340-6717" },
  "Prenatal Diagnosis": { ta: "Prenat Diagn", issn: "0197-3851" },
  "Clinical Genetics": { ta: "Clin Genet", issn: "0009-9163" },
  "Genome Medicine": { ta: "Genome Med", issn: "1756-994X" },
  "Orphanet Journal of Rare Diseases": { ta: "Orphanet J Rare Dis", issn: "1750-1172" },
  "Briefings in Bioinformatics": { ta: "Brief Bioinform", issn: "1467-5463" },
  "Human Genomics": { ta: "Hum Genomics", issn: "1479-7364" },
  "Bioinformatics": { ta: "Bioinformatics", issn: "1367-4803" },
};

function getDateRange(period) {
  const now = new Date();
  if (period === "month") {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    return { mindate: `${y}/${m}/01`, maxdate: `${y}/${m}/${new Date(y, now.getMonth() + 1, 0).getDate()}` };
  }
  if (period === "year") {
    const y = now.getFullYear();
    return { mindate: `${y}/01/01`, maxdate: `${y}/12/31` };
  }
  // alltime — last 10 years, sorted by relevance
  const y = now.getFullYear();
  return { mindate: `${y - 10}/01/01`, maxdate: `${y}/12/31` };
}

async function pubmedSearch(journalQuery, mindate, maxdate, sort) {
  try {
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(journalQuery)}&datetype=pdat&mindate=${mindate}&maxdate=${maxdate}&retmax=5&sort=${sort}&retmode=json`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return [];
    const searchData = await searchRes.json();
    return searchData?.esearchresult?.idlist || [];
  } catch {
    return [];
  }
}

async function fetchFromPubMed(journalName, period) {
  const meta = journalMeta[journalName];
  const ta = meta?.ta;
  const { mindate, maxdate } = getDateRange(period);
  const journalQuery = ta ? `"${ta}"[ta]` : `"${journalName}"[Journal]`;
  const sort = period === "alltime" ? "relevance" : "pub+date";

  let ids = await pubmedSearch(journalQuery, mindate, maxdate, sort);

  // If "Bu Ay" returns nothing, try last 3 months
  if (ids.length === 0 && period === "month") {
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const fallbackMin = `${threeMonthsAgo.getFullYear()}/${String(threeMonthsAgo.getMonth() + 1).padStart(2, "0")}/01`;
    ids = await pubmedSearch(journalQuery, fallbackMin, maxdate, sort);
  }

  if (ids.length === 0) return null;

  const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`;
  const fetchRes = await fetch(fetchUrl);
  if (!fetchRes.ok) return null;
  const fetchData = await fetchRes.json();

  const expectedSource = ta || "";
  const articles = [];
  for (const id of ids) {
    const rec = fetchData?.result?.[id];
    if (!rec) continue;
    // Verify the article actually belongs to this journal
    if (expectedSource && rec.source && rec.source.toLowerCase() !== expectedSource.toLowerCase()) continue;
    const doi = (rec.articleids || []).find(a => a.idtype === "doi")?.value || "";
    const authors = rec.authors?.length > 0
      ? (rec.authors.length > 2 ? `${rec.authors[0].name} et al.` : rec.authors.map(a => a.name).join(", "))
      : "Bilinmiyor";
    const year = rec.pubdate ? parseInt(rec.pubdate) : new Date().getFullYear();
    articles.push({
      title: rec.title || "Başlık yok",
      authors,
      year: isNaN(year) ? rec.pubdate : year,
      summary: rec.title,
      doi,
      why: `${rec.source || journalName} — PMID: ${id}`,
    });
    if (articles.length >= 3) break;
  }
  return articles.length > 0 ? articles : null;
}

async function fetchFromCrossRef(journalName, period) {
  const meta = journalMeta[journalName];
  const issn = meta?.issn;
  if (!issn) return null; // Can't reliably query CrossRef without ISSN

  const { mindate, maxdate } = getDateRange(period);
  let fromDate = mindate.replace(/\//g, "-");
  const untilDate = maxdate.replace(/\//g, "-");

  // If "Bu Ay", expand to last 3 months as fallback
  if (period === "month") {
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    fromDate = `${threeMonthsAgo.getFullYear()}-${String(threeMonthsAgo.getMonth() + 1).padStart(2, "0")}-01`;
  }

  const sort = period === "alltime" ? "is-referenced-by-count" : "published";
  const order = "desc";

  const url = `https://api.crossref.org/works?filter=issn:${issn},from-pub-date:${fromDate},until-pub-date:${untilDate}&sort=${sort}&order=${order}&rows=3&select=title,author,published-print,published-online,DOI,container-title`;

  const res = await fetch(url, {
    headers: { "User-Agent": "GenetikDergiTakip/1.0 (mailto:research@example.com)" }
  });
  if (!res.ok) return null;
  const data = await res.json();
  const items = data?.message?.items;
  if (!items || items.length === 0) return null;

  return items.map(item => {
    const dateArr = item["published-print"]?.["date-parts"]?.[0] || item["published-online"]?.["date-parts"]?.[0] || [];
    const year = dateArr[0] || new Date().getFullYear();
    const authorList = item.author || [];
    const authors = authorList.length > 0
      ? (authorList.length > 2 ? `${authorList[0].family || authorList[0].name || "?"} et al.` : authorList.map(a => a.family || a.name || "?").join(", "))
      : "Bilinmiyor";
    return {
      title: Array.isArray(item.title) ? item.title[0] : (item.title || "Başlık yok"),
      authors,
      year,
      summary: Array.isArray(item.title) ? item.title[0] : (item.title || ""),
      doi: item.DOI || "",
      why: `${item["container-title"]?.[0] || journalName}`,
    };
  });
}

async function fetchArticles(journalName, period) {
  try {
    // Try PubMed first (best for biomedical journals)
    const pubmedResult = await fetchFromPubMed(journalName, period);
    if (pubmedResult) return pubmedResult;

    // Fallback to CrossRef
    const crossrefResult = await fetchFromCrossRef(journalName, period);
    if (crossrefResult) return crossrefResult;

    return null;
  } catch (e) {
    console.error("Fetch error:", e);
    return null;
  }
}

function ArticlePanel({ journal, onClose }) {
  const [period, setPeriod] = useState("month");
  const [articles, setArticles] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cacheRef = React.useRef({});

  const doFetch = useCallback(async (p) => {
    if (cacheRef.current[p]) {
      setArticles(prev => ({ ...prev, [p]: cacheRef.current[p] }));
      return;
    }
    setLoading(true);
    setError(null);
    const result = await fetchArticles(journal.name, p);
    if (result) {
      cacheRef.current[p] = result;
      setArticles(prev => ({ ...prev, [p]: result }));
    } else {
      setError("Makale bulunamadı veya API yanıt vermedi. Tekrar deneyin.");
    }
    setLoading(false);
  }, [journal.name]);

  useEffect(() => {
    doFetch(period);
  }, [period, doFetch]);

  const currentArticles = articles[period] || [];

  return (
    <div style={{
      marginTop: "16px", padding: "20px", borderRadius: "12px",
      background: "rgba(0,0,0,0.3)", border: `1px solid ${journal.color}25`,
      backdropFilter: "blur(10px)"
    }} onClick={e => e.stopPropagation()}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "#F3F4F6", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>📄</span>
          Öne Çıkan Makaleler — <span style={{ color: journal.color }}>{journal.abbr}</span>
        </div>
        <button onClick={onClose} style={{
          background: "rgba(255,255,255,0.06)", border: "none", color: "#9CA3AF",
          width: "24px", height: "24px", borderRadius: "6px", cursor: "pointer", fontSize: "12px"
        }}>✕</button>
      </div>

      {/* Period tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "16px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", padding: "3px" }}>
        {Object.entries(periodLabels).map(([key, label]) => (
          <button key={key} onClick={() => setPeriod(key)} style={{
            flex: 1, padding: "7px 10px", borderRadius: "6px", border: "none",
            background: period === key ? `${journal.color}25` : "transparent",
            color: period === key ? "#F3F4F6" : "#6B7280",
            fontSize: "12px", fontWeight: period === key ? 600 : 400,
            cursor: "pointer", transition: "all 0.2s ease",
            fontFamily: "'DM Sans', sans-serif"
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ padding: "30px 0", textAlign: "center" }}>
          <div style={{
            width: "28px", height: "28px", border: `2px solid ${journal.color}30`,
            borderTopColor: journal.color, borderRadius: "50%", margin: "0 auto 12px",
            animation: "spin 0.8s linear infinite"
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <div style={{ fontSize: "12px", color: "#6B7280" }}>
            PubMed'den makaleler yükleniyor...
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && !currentArticles.length && (
        <div style={{ padding: "24px 0", textAlign: "center" }}>
          <div style={{ fontSize: "12px", color: "#F87171", marginBottom: "8px" }}>{error}</div>
          <button onClick={() => { delete cacheRef.current[period]; doFetch(period); }}
            style={{
              fontSize: "11px", padding: "6px 14px", borderRadius: "6px", cursor: "pointer",
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
              color: "#9CA3AF", fontFamily: "'DM Sans', sans-serif"
            }}>
            Tekrar Dene
          </button>
        </div>
      )}

      {/* Articles */}
      {!loading && currentArticles.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {currentArticles.map((art, i) => (
            <div key={i} style={{
              padding: "14px 16px", borderRadius: "10px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              transition: "border-color 0.2s"
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = `${journal.color}40`}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"}
            >
              <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <span style={{
                  width: "22px", height: "22px", borderRadius: "6px", flexShrink: 0,
                  background: `${journal.color}20`, color: journal.color,
                  fontSize: "11px", fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#E5E7EB", lineHeight: 1.4, marginBottom: "4px" }}>
                    {art.title}
                  </div>
                  <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "6px" }}>
                    {art.authors} · {art.year}
                  </div>
                  <div style={{ fontSize: "12px", color: "#D1D5DB", lineHeight: 1.5, marginBottom: "6px" }}>
                    {art.summary}
                  </div>
                  <div style={{
                    fontSize: "11px", color: journal.color, fontStyle: "italic",
                    padding: "6px 10px", borderRadius: "6px", background: `${journal.color}08`,
                    borderLeft: `2px solid ${journal.color}40`
                  }}>
                    💡 {art.why}
                  </div>
                  {art.doi && (
                    <a href={art.doi.startsWith("http") ? art.doi : `https://doi.org/${art.doi}`}
                      target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      style={{
                        display: "inline-block", marginTop: "8px", fontSize: "11px",
                        color: "#6B7280", textDecoration: "none",
                        padding: "3px 10px", borderRadius: "4px",
                        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
                        transition: "color 0.15s"
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = journal.color}
                      onMouseLeave={e => e.currentTarget.style.color = "#6B7280"}
                    >
                      DOI ile Makaleye Git →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GenetikDergiTakip() {
  const [selectedTier, setSelectedTier] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [search, setSearch] = useState("");
  const [bookmarks, setBookmarks] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [articlePanelId, setArticlePanelId] = useState(null);
  const [sortBy, setSortBy] = useState("tier");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const toggleTag = (tag) => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  const toggleBookmark = (id) => setBookmarks(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);

  const tierOrder = { S: 0, A: 1, B: 2 };
  const filtered = journals
    .filter(j => {
      if (selectedTier && j.tier !== selectedTier) return false;
      if (selectedTags.length > 0 && !selectedTags.some(t => j.tags.includes(t))) return false;
      if (search && !j.name.toLowerCase().includes(search.toLowerCase()) && !j.abbr.toLowerCase().includes(search.toLowerCase()) && !j.focus.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "if") return b.if2024 - a.if2024;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return tierOrder[a.tier] - tierOrder[b.tier] || b.if2024 - a.if2024;
    });

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(165deg, #0a0e1a 0%, #101828 40%, #0d1520 100%)",
      color: "#e8e6e3", fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      padding: 0, position: "relative", overflow: "hidden"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />

      <div style={{ position: "fixed", top: "-200px", right: "-200px", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-300px", left: "-100px", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Header */}
      <div style={{ padding: "40px 32px 24px", position: "relative", zIndex: 1, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "6px" }}>
            <span style={{ fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: "#6B7280", fontWeight: 500 }}>Tıbbi Genetik</span>
            <span style={{ width: "40px", height: "1px", background: "linear-gradient(90deg, #6B7280, transparent)", display: "inline-block", verticalAlign: "middle" }} />
          </div>
          <h1 style={{
            fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(32px, 5vw, 48px)",
            fontWeight: 400, fontStyle: "italic", color: "#F9FAFB", margin: "8px 0 12px", lineHeight: 1.1, letterSpacing: "-0.5px"
          }}>
            Dergi Takip Rehberi
          </h1>
          <p style={{ color: "#9CA3AF", fontSize: "14px", maxWidth: "560px", lineHeight: 1.6, margin: 0 }}>
            AI destekli makale keşfi ile zenginleştirilmiş dergi koleksiyonu. Her derginin kartını açıp{" "}
            <strong style={{ color: "#C4B5FD" }}>📄 Makaleleri Keşfet</strong> butonuna tıklayarak bu ay, bu yıl ve tüm zamanların en önemli makalelerini görüntüleyin.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "24px 32px 60px", position: "relative", zIndex: 1 }}>

        {/* Tier pills */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "16px" }}>
          {Object.entries(tierInfo).map(([key, val]) => (
            <button key={key} onClick={() => setSelectedTier(selectedTier === key ? null : key)} style={{
              padding: "8px 18px", borderRadius: "999px", border: "1px solid",
              borderColor: selectedTier === key ? val.bg : "rgba(255,255,255,0.08)",
              background: selectedTier === key ? `${val.bg}18` : "rgba(255,255,255,0.02)",
              color: selectedTier === key ? val.bg : "#9CA3AF",
              fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease",
              display: "flex", alignItems: "center", gap: "6px"
            }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: val.bg, opacity: selectedTier === key ? 1 : 0.4 }} />
              {val.label}
              <span style={{ fontWeight: 400, opacity: 0.6, fontSize: "11px" }}>({val.desc})</span>
            </button>
          ))}
        </div>

        {/* Search + Sort */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
          <input type="text" placeholder="Dergi ara..." value={search} onChange={e => setSearch(e.target.value)} style={{
            flex: "1 1 200px", padding: "10px 16px", borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)",
            color: "#e8e6e3", fontSize: "14px", outline: "none", fontFamily: "'DM Sans', sans-serif"
          }} />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
            padding: "10px 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(15,20,35,0.9)", color: "#9CA3AF", fontSize: "13px", cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif"
          }}>
            <option value="tier">Tier'a göre</option>
            <option value="if">IF'ye göre</option>
            <option value="name">İsme göre</option>
          </select>
        </div>

        {/* Tag filters */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "28px" }}>
          {allTags.map(tag => (
            <button key={tag} onClick={() => toggleTag(tag)} style={{
              padding: "4px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 500, textTransform: "capitalize",
              border: "1px solid", borderColor: selectedTags.includes(tag) ? "rgba(139,92,246,0.5)" : "rgba(255,255,255,0.06)",
              background: selectedTags.includes(tag) ? "rgba(139,92,246,0.12)" : "transparent",
              color: selectedTags.includes(tag) ? "#C4B5FD" : "#6B7280", cursor: "pointer", transition: "all 0.15s ease"
            }}>{tag}</button>
          ))}
          {selectedTags.length > 0 && (
            <button onClick={() => setSelectedTags([])} style={{
              padding: "4px 12px", borderRadius: "6px", fontSize: "11px",
              border: "none", background: "rgba(239,68,68,0.1)", color: "#F87171", cursor: "pointer"
            }}>✕ Temizle</button>
          )}
        </div>

        {bookmarks.length > 0 && (
          <div style={{
            marginBottom: "20px", padding: "10px 16px", borderRadius: "10px",
            background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)",
            fontSize: "13px", color: "#FBBF24", display: "flex", alignItems: "center", gap: "8px"
          }}>
            <span>★</span>
            <span>{bookmarks.length} dergi işaretlendi</span>
            <span style={{ color: "#9CA3AF", fontSize: "11px" }}>
              — {journals.filter(j => bookmarks.includes(j.id)).map(j => j.abbr).join(", ")}
            </span>
          </div>
        )}

        <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "14px", letterSpacing: "0.5px" }}>
          {filtered.length} / {journals.length} dergi gösteriliyor
        </div>

        {/* Journal Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map((j, idx) => {
            const isExpanded = expandedId === j.id;
            const isBookmarked = bookmarks.includes(j.id);
            const showArticles = articlePanelId === j.id;
            return (
              <div key={j.id} style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid",
                borderColor: isExpanded ? `${j.color}40` : "rgba(255,255,255,0.05)",
                borderRadius: "14px", overflow: "hidden", transition: "all 0.3s ease",
                opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(12px)",
                transitionDelay: `${idx * 40}ms`, cursor: "pointer"
              }} onClick={() => { setExpandedId(isExpanded ? null : j.id); if (isExpanded) setArticlePanelId(null); }}>

                {/* Main row */}
                <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "auto 1fr auto auto", alignItems: "center", gap: "16px" }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "10px",
                    background: `${tierInfo[j.tier].bg}15`, border: `1px solid ${tierInfo[j.tier].bg}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "14px", fontWeight: 700, color: tierInfo[j.tier].bg, flexShrink: 0
                  }}>{j.tier}</div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "15px", fontWeight: 600, color: "#F3F4F6" }}>{j.abbr}</span>
                      <span style={{ fontSize: "12px", color: "#6B7280", fontWeight: 400 }}>{j.name}</span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>{j.focus}</div>
                  </div>

                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "18px", fontWeight: 700, color: j.color, fontVariantNumeric: "tabular-nums" }}>{j.if2024}</div>
                    <div style={{ fontSize: "10px", color: "#6B7280", letterSpacing: "0.5px" }}>IF 2024</div>
                  </div>

                  <button onClick={e => { e.stopPropagation(); toggleBookmark(j.id); }} style={{
                    width: "32px", height: "32px", borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.06)",
                    background: isBookmarked ? "rgba(251,191,36,0.1)" : "transparent",
                    color: isBookmarked ? "#FBBF24" : "#4B5563",
                    cursor: "pointer", fontSize: "16px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s ease", flexShrink: 0
                  }}>{isBookmarked ? "★" : "☆"}</button>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div style={{ padding: "0 20px 20px", borderTop: "1px solid rgba(255,255,255,0.04)", marginTop: "-2px", paddingTop: "16px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "14px" }}>
                      <div style={{ background: "rgba(255,255,255,0.02)", padding: "10px 14px", borderRadius: "8px" }}>
                        <div style={{ fontSize: "10px", color: "#6B7280", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Yayıncı</div>
                        <div style={{ fontSize: "13px", color: "#D1D5DB" }}>{j.publisher}</div>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.02)", padding: "10px 14px", borderRadius: "8px" }}>
                        <div style={{ fontSize: "10px", color: "#6B7280", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Yayın Sıklığı</div>
                        <div style={{ fontSize: "13px", color: "#D1D5DB" }}>{j.frequency}</div>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.02)", padding: "10px 14px", borderRadius: "8px" }}>
                        <div style={{ fontSize: "10px", color: "#6B7280", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Etiketler</div>
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                          {j.tags.map(t => (
                            <span key={t} style={{
                              fontSize: "10px", padding: "2px 8px", borderRadius: "4px",
                              background: `${j.color}18`, color: `${j.color}cc`,
                              border: `1px solid ${j.color}25`, textTransform: "capitalize"
                            }}>{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      padding: "12px 16px", borderRadius: "10px", background: `${j.color}08`,
                      borderLeft: `3px solid ${j.color}60`, fontSize: "13px", color: "#D1D5DB", lineHeight: 1.6
                    }}>
                      <span style={{ fontWeight: 600, color: j.color, fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>Strateji Notu</span>
                      <br />{j.note}
                    </div>

                    {/* Action buttons */}
                    <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <a href={j.url} target="_blank" rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        style={{
                          fontSize: "12px", color: j.color, textDecoration: "none",
                          display: "inline-flex", alignItems: "center", gap: "6px",
                          padding: "8px 16px", borderRadius: "8px",
                          background: `${j.color}10`, border: `1px solid ${j.color}25`, transition: "all 0.2s ease"
                        }}>
                        Dergiye Git →
                      </a>
                      <button
                        onClick={e => { e.stopPropagation(); setArticlePanelId(showArticles ? null : j.id); }}
                        style={{
                          fontSize: "12px", color: "#C4B5FD", textDecoration: "none",
                          display: "inline-flex", alignItems: "center", gap: "6px",
                          padding: "8px 16px", borderRadius: "8px", cursor: "pointer",
                          background: showArticles ? "rgba(139,92,246,0.15)" : "rgba(139,92,246,0.08)",
                          border: showArticles ? "1px solid rgba(139,92,246,0.4)" : "1px solid rgba(139,92,246,0.15)",
                          transition: "all 0.2s ease", fontFamily: "'DM Sans', sans-serif"
                        }}>
                        📄 {showArticles ? "Makaleleri Gizle" : "Makaleleri Keşfet"}
                      </button>
                    </div>

                    {showArticles && <ArticlePanel journal={j} onClose={() => setArticlePanelId(null)} />}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#6B7280", fontSize: "14px" }}>
            Filtrelere uygun dergi bulunamadı. Filtreleri genişletmeyi deneyin.
          </div>
        )}

        <div style={{
          marginTop: "48px", paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.04)",
          fontSize: "11px", color: "#4B5563", textAlign: "center", lineHeight: 1.8
        }}>
          IF değerleri 2024 JCR verilerine dayanmaktadır. Makale verileri PubMed ve CrossRef API'lerinden gerçek zamanlı olarak çekilmektedir.
          <br />Tıbbi Genetik Rezidanlığı Dergi Takip Rehberi
        </div>
      </div>
    </div>
  );
}
