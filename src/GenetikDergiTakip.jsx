import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  isConfigured as firebaseConfigured,
  auth, db, googleProvider,
  signInWithPopup, signOut, onAuthStateChanged,
  collection, doc, setDoc, getDoc, getDocs, deleteDoc,
  query, where, orderBy, limit, onSnapshot,
  serverTimestamp, updateDoc, increment
} from "./firebase";

// ──────────────────────────────────────────────
// JOURNAL DATA
// ──────────────────────────────────────────────
const journals = [
  // === Q1 — IF > 6 ===
  { id: 1, name: "Nature Genetics", abbr: "Nat Genet", if2024: 31.7, quartile: "Q1", frequency: "Aylık", focus: "Genetik ve genomik — temel ve translasyonel", url: "https://www.nature.com/ng/", field: "Genomik", tags: ["temel", "genomik", "translasyonel"], color: "#C1121F", publisher: "Nature Portfolio", note: "En yüksek IF'li genetik dergisi. GWAS, fonksiyonel genomik ve yeni gen keşifleri." },
  { id: 2, name: "Nature Reviews Genetics", abbr: "Nat Rev Genet", if2024: 39.1, quartile: "Q1", frequency: "Aylık", focus: "Genetik ve genomik alanında kapsamlı derleme makaleleri", url: "https://www.nature.com/nrg/", field: "Genomik", tags: ["temel", "genomik", "derleme"], color: "#9B1B30", publisher: "Nature Portfolio", note: "Alanın en prestijli review dergisi. Yeni kavram ve teknolojilerin kapsamlı değerlendirmesi." },
  { id: 3, name: "Genome Research", abbr: "Genome Res", if2024: 6.2, quartile: "Q1", frequency: "Aylık", focus: "Genom analizi, fonksiyonel genomik, hesaplamalı biyoloji", url: "https://genome.cshlp.org/", field: "Genomik", tags: ["temel", "genomik", "hesaplamalı"], color: "#5B2C6F", publisher: "Cold Spring Harbor Laboratory Press", note: "Genom düzeyinde analizler, yeni sekanslama teknikleri ve büyük ölçekli veri çalışmaları." },
  { id: 4, name: "Genome Medicine", abbr: "Genome Med", if2024: 10.4, quartile: "Q1", frequency: "Sürekli", focus: "Klinik genomik, WES/WGS, hassas tıp", url: "https://genomemedicine.biomedcentral.com/", field: "Klinik Genomik", tags: ["genomik", "translasyonel", "hesaplamalı"], color: "#0077B6", publisher: "BMC / Springer Nature", note: "WES/WGS klinik çalışmaları ve biyoinformatik pipeline makaleleri. Open access." },
  { id: 5, name: "Genome Biology", abbr: "Genome Biol", if2024: 10.1, quartile: "Q1", frequency: "Sürekli", focus: "Genomik, epigenomik, transkriptomik, araç geliştirme", url: "https://genomebiology.biomedcentral.com/", field: "Genomik", tags: ["genomik", "hesaplamalı", "pipeline"], color: "#1A5276", publisher: "BMC / Springer Nature", note: "Yeni biyoinformatik araçlar ve büyük ölçekli -omik çalışmaları. Open access." },
  { id: 6, name: "American Journal of Human Genetics", abbr: "AJHG", if2024: 8.1, quartile: "Q1", frequency: "Aylık", focus: "İnsan genetiği, genomik, hesaplamalı biyoloji", url: "https://www.cell.com/ajhg/home", field: "İnsan Genetiği", tags: ["temel", "genomik", "hesaplamalı"], color: "#1B4965", publisher: "Cell Press / ASHG", note: "ASHG'nin resmi dergisi. Popülasyon genetiğinden Mendelian hastalıklara kadar geniş kapsam." },
  { id: 7, name: "Genetics in Medicine", abbr: "GIM", if2024: 6.6, quartile: "Q1", frequency: "Aylık", focus: "Klinik genetik, genetik test, genetik danışmanlık", url: "https://www.gimjournal.org/", field: "Klinik Genetik", tags: ["klinik", "test", "rehber"], color: "#2D6A4F", publisher: "ACMG / Elsevier", note: "ACMG'nin resmi dergisi. Klinik varyant yorumlama rehberleri burada yayımlanır." },
  { id: 8, name: "Briefings in Bioinformatics", abbr: "Brief Bioinform", if2024: 6.8, quartile: "Q1", frequency: "2 ayda bir", focus: "Biyoinformatik pipeline'lar, araç geliştirme, veri analiz yöntemleri", url: "https://academic.oup.com/bib", field: "Biyoinformatik", tags: ["biyoinformatik", "hesaplamalı", "pipeline"], color: "#E63946", publisher: "Oxford University Press", note: "NGS pipeline karşılaştırma ve review makaleleri için en prestijli adres." },
  { id: 9, name: "Nucleic Acids Research", abbr: "Nucleic Acids Res", if2024: 14.9, quartile: "Q1", frequency: "Haftalık", focus: "Nükleik asit araştırmaları, veritabanları, biyoinformatik araçlar", url: "https://academic.oup.com/nar", field: "Moleküler Genetik", tags: ["moleküler", "biyoinformatik", "pipeline"], color: "#D4AC0D", publisher: "Oxford University Press", note: "Database ve web-server özel sayıları biyoinformatik araçları için referans kaynağı." },
  { id: 10, name: "Human Molecular Genetics", abbr: "Hum Mol Genet", if2024: 6.0, quartile: "Q1", frequency: "2 haftada bir", focus: "Moleküler genetik mekanizmalar, hastalık modelleri", url: "https://academic.oup.com/hmg", field: "Moleküler Genetik", tags: ["moleküler", "temel", "fonksiyonel"], color: "#6C3483", publisher: "Oxford University Press", note: "Hastalık mekanizmalarının moleküler düzeyde araştırılması, fare modelleri ve fonksiyonel çalışmalar." },
  { id: 11, name: "The Pharmacogenomics Journal", abbr: "Pharmacogenomics J", if2024: 6.1, quartile: "Q1", frequency: "2 ayda bir", focus: "Farmakogenomik, ilaç yanıtı, kişiselleştirilmiş tıp", url: "https://www.nature.com/tpj/", field: "Farmakogenetik", tags: ["farmakogenetik", "translasyonel", "klinik"], color: "#117A65", publisher: "Nature Portfolio", note: "İlaç yanıtında genetik varyasyonlar ve kişiselleştirilmiş tedavi stratejileri." },
  // === Q2 — IF 3–6 ===
  { id: 12, name: "European Journal of Human Genetics", abbr: "EJHG", if2024: 3.7, quartile: "Q2", frequency: "Aylık", focus: "Klinik genetik, sitogenetik, moleküler genetik", url: "https://www.nature.com/ejhg/", field: "Klinik Genetik", tags: ["klinik", "moleküler", "sitogenetik"], color: "#003566", publisher: "ESHG / Nature Portfolio", note: "Avrupa perspektifli klinik genetik. Türk genetikçilerin sık yayın yaptığı dergi." },
  { id: 13, name: "Human Mutation / Human Genetics", abbr: "Hum Genet", if2024: 3.8, quartile: "Q2", frequency: "Aylık", focus: "Mutasyon analizi, varyant fonksiyonel çalışmaları", url: "https://link.springer.com/journal/439", field: "Moleküler Genetik", tags: ["moleküler", "varyant", "fonksiyonel"], color: "#7B2D8E", publisher: "Springer", note: "Varyant-fonksiyon ilişkisi ve in silico analiz çalışmaları için önemli." },
  { id: 14, name: "Bioinformatics", abbr: "Bioinformatics", if2024: 4.4, quartile: "Q2", frequency: "2 haftada bir", focus: "Algoritma geliştirme, varyant çağırma, yazılım araçları", url: "https://academic.oup.com/bioinformatics", field: "Biyoinformatik", tags: ["biyoinformatik", "hesaplamalı", "pipeline", "varyant"], color: "#2A9D8F", publisher: "Oxford University Press", note: "GATK, ACMG otomasyon araçları, varyant sınıflandırma algoritmaları burada yayımlanır." },
  { id: 15, name: "Human Genomics", abbr: "Hum Genomics", if2024: 3.8, quartile: "Q2", frequency: "Sürekli", focus: "Klinik biyoinformatik, WES/WGS analiz, varyant yorumlama", url: "https://humgenomics.biomedcentral.com/", field: "Klinik Genomik", tags: ["biyoinformatik", "genomik", "varyant", "klinik"], color: "#457B9D", publisher: "BMC / Springer Nature", note: "WES/WGS klinik biyoinformatik çalışmaları ve varyant filtreleme stratejileri. Open access." },
  { id: 16, name: "Clinical Genetics", abbr: "Clin Genet", if2024: 3.2, quartile: "Q2", frequency: "Aylık", focus: "Klinik genetik, moleküler tanı, danışmanlık", url: "https://onlinelibrary.wiley.com/journal/13990004", field: "Klinik Genetik", tags: ["klinik", "moleküler", "test"], color: "#264653", publisher: "Wiley", note: "Kısa vaka raporları (Letter) formatı rezidanlar için hızlı yayın imkanı sunar." },
  { id: 17, name: "Orphanet Journal of Rare Diseases", abbr: "OJRD", if2024: 3.4, quartile: "Q2", frequency: "Sürekli", focus: "Nadir hastalıklar, epidemiyoloji, tanı yolculuğu", url: "https://ojrd.biomedcentral.com/", field: "Nadir Hastalıklar", tags: ["klinik", "nadir", "translasyonel"], color: "#588157", publisher: "BMC / Springer Nature", note: "Nadir hastalık kohortları ve tanı gecikme süreleri analizleri. Open access." },
  { id: 18, name: "Journal of Medical Genetics", abbr: "J Med Genet", if2024: 4.0, quartile: "Q2", frequency: "Aylık", focus: "Tıbbi genetik, genotip-fenotip korelasyonları", url: "https://jmg.bmj.com/", field: "Klinik Genetik", tags: ["klinik", "moleküler", "vaka"], color: "#1F618D", publisher: "BMJ", note: "Genotip-fenotip korelasyon çalışmaları ve yeni sendrom tanımlamaları." },
  { id: 19, name: "Pharmacogenomics", abbr: "Pharmacogenomics", if2024: 3.1, quartile: "Q2", frequency: "Aylık", focus: "Farmakogenomik uygulamalar, ilaç metabolizması genetiği", url: "https://www.future-medicine.com/journal/pgs", field: "Farmakogenetik", tags: ["farmakogenetik", "klinik", "translasyonel"], color: "#148F77", publisher: "Future Medicine", note: "CYP enzim polimorfizmleri, ilaç doz ayarlama ve farmakogenetik klinik uygulamalar." },
  { id: 20, name: "BMC Genomics", abbr: "BMC Genomics", if2024: 3.5, quartile: "Q2", frequency: "Sürekli", focus: "Genomik, transkriptomik, epigenomik, metagenomik", url: "https://bmcgenomics.biomedcentral.com/", field: "Genomik", tags: ["genomik", "hesaplamalı", "temel"], color: "#2E86C1", publisher: "BMC / Springer Nature", note: "Geniş kapsamlı genomik çalışmalar. Erişilebilir IF ve open access." },
  { id: 21, name: "Molecular Genetics and Metabolism", abbr: "Mol Genet Metab", if2024: 3.6, quartile: "Q2", frequency: "Aylık", focus: "Kalıtsal metabolizma hastalıkları, enzim eksiklikleri, tedavi", url: "https://www.sciencedirect.com/journal/molecular-genetics-and-metabolism", field: "Metabolik Genetik", tags: ["metabolik", "klinik", "translasyonel"], color: "#D35400", publisher: "Elsevier", note: "IEM (Inborn Errors of Metabolism) için temel dergi. Yenidoğan tarama ve tedavi çalışmaları." },
  { id: 22, name: "Cytogenetic and Genome Research", abbr: "Cytogenet Genome Res", if2024: 3.1, quartile: "Q2", frequency: "2 ayda bir", focus: "Sitogenetik, kromozom yapısı, genom organizasyonu", url: "https://karger.com/cgr", field: "Sitogenetik", tags: ["sitogenetik", "temel", "genomik"], color: "#7D3C98", publisher: "Karger", note: "Klasik sitogenetik ve modern moleküler sitogenetik (FISH, array CGH) çalışmaları." },
  { id: 23, name: "Genes", abbr: "Genes", if2024: 3.5, quartile: "Q2", frequency: "Sürekli", focus: "Genetik, genomik, gen ifadesi, epigenetik", url: "https://www.mdpi.com/journal/genes", field: "Genomik", tags: ["temel", "genomik", "moleküler"], color: "#27AE60", publisher: "MDPI", note: "Geniş kapsamlı genetik/genomik çalışmalar. Hızlı hakem süreci ve open access." },
  // === Q3 — IF 1.5–3 ===
  { id: 24, name: "American Journal of Medical Genetics Part A", abbr: "AJMG-A", if2024: 2.0, quartile: "Q3", frequency: "Aylık", focus: "Klinik genetik, dismorfik sendromlar, vaka raporları", url: "https://onlinelibrary.wiley.com/journal/15524833", field: "Klinik Genetik", tags: ["klinik", "dismorfik", "vaka"], color: "#6A040F", publisher: "Wiley", note: "Dismorfik sendrom vaka raporları için ana dergi. Rezidanlar için ideal ilk yayın hedefi." },
  { id: 25, name: "Prenatal Diagnosis", abbr: "Prenat Diagn", if2024: 2.3, quartile: "Q3", frequency: "Aylık", focus: "Prenatal genetik tanı, NIPT, fetal tıp", url: "https://onlinelibrary.wiley.com/journal/10970223", field: "Prenatal Genetik", tags: ["prenatal", "klinik", "test"], color: "#E76F51", publisher: "Wiley", note: "NIPT, CVS/amniyosentez sonuçları ve prenatal array CGH çalışmaları." },
  { id: 26, name: "Journal of Genetic Counseling", abbr: "J Genet Couns", if2024: 2.1, quartile: "Q3", frequency: "2 ayda bir", focus: "Genetik danışmanlık, psikososyal araştırma, hasta iletişimi", url: "https://onlinelibrary.wiley.com/journal/15733599", field: "Genetik Danışmanlık", tags: ["klinik", "danışmanlık", "psikososyal"], color: "#AF7AC5", publisher: "Wiley / NSGC", note: "Genetik danışmanlık pratiği ve araştırması. NSGC'nin resmi dergisi." },
  { id: 27, name: "Molecular Cytogenetics", abbr: "Mol Cytogenet", if2024: 2.0, quartile: "Q3", frequency: "Sürekli", focus: "Moleküler sitogenetik, array CGH, FISH, kromozom analizi", url: "https://molecularcytogenetics.biomedcentral.com/", field: "Sitogenetik", tags: ["sitogenetik", "moleküler", "klinik"], color: "#C0392B", publisher: "BMC / Springer Nature", note: "Array CGH, FISH ve kromozomal mikrodelesyon/mikroduplikasyon vaka raporları. Open access." },
  { id: 28, name: "BMC Medical Genetics / BMC Medical Genomics", abbr: "BMC Med Genomics", if2024: 2.7, quartile: "Q3", frequency: "Sürekli", focus: "Tıbbi genetik, klinik genomik, vaka serileri", url: "https://bmcmedgenomics.biomedcentral.com/", field: "Klinik Genomik", tags: ["klinik", "genomik", "vaka"], color: "#2980B9", publisher: "BMC / Springer Nature", note: "Klinik WES/WGS vaka raporları ve küçük kohort çalışmaları. Open access." },
  { id: 29, name: "European Journal of Medical Genetics", abbr: "Eur J Med Genet", if2024: 2.2, quartile: "Q3", frequency: "2 ayda bir", focus: "Gelişimsel genetik, dismorfik sendromlar, konjenital anomaliler", url: "https://www.sciencedirect.com/journal/european-journal-of-medical-genetics", field: "Klinik Genetik", tags: ["klinik", "dismorfik", "vaka"], color: "#1ABC9C", publisher: "Elsevier", note: "Avrupa perspektifli klinik genetik vaka serileri ve genotip-fenotip çalışmaları." },
  { id: 30, name: "Journal of Human Genetics", abbr: "J Hum Genet", if2024: 2.9, quartile: "Q3", frequency: "Aylık", focus: "İnsan genetiği, popülasyon genetiği, hastalık genleri", url: "https://www.nature.com/jhg/", field: "İnsan Genetiği", tags: ["temel", "genomik", "moleküler"], color: "#E74C3C", publisher: "Nature Portfolio / JHS", note: "Asya perspektifli insan genetiği. Popülasyon spesifik varyantlar ve hastalık çalışmaları." },
  { id: 31, name: "Genetic Testing and Molecular Biomarkers", abbr: "Genet Test Mol Biomarkers", if2024: 1.7, quartile: "Q3", frequency: "Aylık", focus: "Genetik test validasyonu, moleküler biyobelirteçler", url: "https://www.liebertpub.com/journal/gtmb", field: "Genetik Test", tags: ["test", "moleküler", "klinik"], color: "#F39C12", publisher: "Mary Ann Liebert", note: "Genetik test yöntemlerinin validasyonu ve yeni moleküler biyobelirteç keşifleri." },
  { id: 32, name: "Gene", abbr: "Gene", if2024: 2.6, quartile: "Q3", frequency: "Haftalık", focus: "Gen yapısı, ifadesi, düzenlenmesi, evrim", url: "https://www.sciencedirect.com/journal/gene", field: "Moleküler Genetik", tags: ["temel", "moleküler", "fonksiyonel"], color: "#16A085", publisher: "Elsevier", note: "Geniş kapsamlı moleküler genetik çalışmalar. Yüksek kabul oranı." },
  // === Q4 — IF < 1.5 ===
  { id: 33, name: "Molecular Syndromology", abbr: "Mol Syndromol", if2024: 1.4, quartile: "Q4", frequency: "2 ayda bir", focus: "Sendromik hastalıklar, dismorfik fenotip, gelişimsel bozukluklar", url: "https://karger.com/msy", field: "Klinik Genetik", tags: ["klinik", "dismorfik", "vaka"], color: "#95A5A6", publisher: "Karger", note: "Nadir sendromların fenotip-genotip tanımlaması. Vaka raporları için erişilebilir hedef." },
  { id: 34, name: "Balkan Journal of Medical Genetics", abbr: "Balkan J Med Genet", if2024: 0.8, quartile: "Q4", frequency: "2 yılda bir", focus: "Balkan bölgesi genetik çalışmaları, popülasyon genetiği", url: "https://sciendo.com/journal/BJMG", field: "İnsan Genetiği", tags: ["klinik", "temel", "vaka"], color: "#7F8C8D", publisher: "Sciendo", note: "Bölgesel genetik çalışmalar. Türk araştırmacılar için erişilebilir yayın hedefi." },
  { id: 35, name: "Journal of Community Genetics", abbr: "J Community Genet", if2024: 1.3, quartile: "Q4", frequency: "Sürekli", focus: "Toplum genetiği, taşıyıcı tarama, halk sağlığı genetiği", url: "https://link.springer.com/journal/12687", field: "Genetik Danışmanlık", tags: ["klinik", "danışmanlık", "halk sağlığı"], color: "#AEB6BF", publisher: "Springer", note: "Toplum tabanlı genetik tarama ve genetik danışmanlık araştırmaları." },
];

const researchFields = [
  "Genomik", "Klinik Genetik", "Klinik Genomik", "Moleküler Genetik",
  "Biyoinformatik", "İnsan Genetiği", "Sitogenetik", "Nadir Hastalıklar",
  "Prenatal Genetik", "Farmakogenetik", "Metabolik Genetik",
  "Genetik Danışmanlık", "Genetik Test"
];

const allTags = ["temel", "klinik", "genomik", "moleküler", "translasyonel", "hesaplamalı", "dismorfik", "prenatal", "vaka", "test", "rehber", "nadir", "varyant", "fonksiyonel", "biyoinformatik", "pipeline", "farmakogenetik", "metabolik", "sitogenetik", "danışmanlık", "derleme", "psikososyal", "halk sağlığı"];
const quartileInfo = {
  Q1: { label: "Q1", desc: "IF > 6", bg: "#22C55E", color: "#166534" },
  Q2: { label: "Q2", desc: "IF 3-6", bg: "#3B82F6", color: "#1E40AF" },
  Q3: { label: "Q3", desc: "IF 1.5-3", bg: "#F59E0B", color: "#92400E" },
  Q4: { label: "Q4", desc: "IF < 1.5", bg: "#EF4444", color: "#991B1B" },
};
const periodLabels = { month: "Bu Ay", year: "Bu Yıl (2026)", alltime: "Tüm Zamanlar" };

// Shelf definitions (like Goodreads)
const SHELVES = {
  read: { label: "Okudum", icon: "✓", color: "#22C55E", desc: "Okuduğun makaleler" },
  reading: { label: "Okuyorum", icon: "📖", color: "#3B82F6", desc: "Şu an okuduğun makaleler" },
  wantToRead: { label: "Okumak İstiyorum", icon: "📋", color: "#F59E0B", desc: "Okuma listene eklediğin makaleler" },
};

// ──────────────────────────────────────────────
// PubMed Title Abbreviation + ISSN for CrossRef
// ──────────────────────────────────────────────
const journalMeta = {
  "Nature Genetics": { ta: "Nat Genet", issn: "1061-4036" },
  "Nature Reviews Genetics": { ta: "Nat Rev Genet", issn: "1471-0056" },
  "Genome Research": { ta: "Genome Res", issn: "1088-9051" },
  "Genome Medicine": { ta: "Genome Med", issn: "1756-994X" },
  "Genome Biology": { ta: "Genome Biol", issn: "1474-760X" },
  "American Journal of Human Genetics": { ta: "Am J Hum Genet", issn: "0002-9297" },
  "Genetics in Medicine": { ta: "Genet Med", issn: "1098-3600" },
  "Briefings in Bioinformatics": { ta: "Brief Bioinform", issn: "1467-5463" },
  "Nucleic Acids Research": { ta: "Nucleic Acids Res", issn: "0305-1048" },
  "Human Molecular Genetics": { ta: "Hum Mol Genet", issn: "0964-6906" },
  "The Pharmacogenomics Journal": { ta: "Pharmacogenomics J", issn: "1470-269X" },
  "European Journal of Human Genetics": { ta: "Eur J Hum Genet", issn: "1018-4813" },
  "Human Mutation / Human Genetics": { ta: "Hum Genet", issn: "0340-6717" },
  "Bioinformatics": { ta: "Bioinformatics", issn: "1367-4803" },
  "Human Genomics": { ta: "Hum Genomics", issn: "1479-7364" },
  "Clinical Genetics": { ta: "Clin Genet", issn: "0009-9163" },
  "Orphanet Journal of Rare Diseases": { ta: "Orphanet J Rare Dis", issn: "1750-1172" },
  "Journal of Medical Genetics": { ta: "J Med Genet", issn: "0022-2593" },
  "Pharmacogenomics": { ta: "Pharmacogenomics", issn: "1462-2416" },
  "BMC Genomics": { ta: "BMC Genomics", issn: "1471-2164" },
  "Molecular Genetics and Metabolism": { ta: "Mol Genet Metab", issn: "1096-7192" },
  "Cytogenetic and Genome Research": { ta: "Cytogenet Genome Res", issn: "1424-8581" },
  "Genes": { ta: "Genes (Basel)", issn: "2073-4425" },
  "American Journal of Medical Genetics Part A": { ta: "Am J Med Genet A", issn: "1552-4825" },
  "Prenatal Diagnosis": { ta: "Prenat Diagn", issn: "0197-3851" },
  "Journal of Genetic Counseling": { ta: "J Genet Couns", issn: "1059-7700" },
  "Molecular Cytogenetics": { ta: "Mol Cytogenet", issn: "1755-8166" },
  "BMC Medical Genetics / BMC Medical Genomics": { ta: "BMC Med Genomics", issn: "1755-8794" },
  "European Journal of Medical Genetics": { ta: "Eur J Med Genet", issn: "1769-7212" },
  "Journal of Human Genetics": { ta: "J Hum Genet", issn: "1434-5161" },
  "Genetic Testing and Molecular Biomarkers": { ta: "Genet Test Mol Biomarkers", issn: "2159-3353" },
  "Gene": { ta: "Gene", issn: "0378-1119" },
  "Molecular Syndromology": { ta: "Mol Syndromol", issn: "1661-8769" },
  "Balkan Journal of Medical Genetics": { ta: "Balkan J Med Genet", issn: "1311-0160" },
  "Journal of Community Genetics": { ta: "J Community Genet", issn: "1868-310X" },
};

// ──────────────────────────────────────────────
// API FUNCTIONS
// ──────────────────────────────────────────────
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
  const y = now.getFullYear();
  return { mindate: `${y - 10}/01/01`, maxdate: `${y}/12/31` };
}

async function pubmedSearch(journalQuery, mindate, maxdate, sort, retmax = 100) {
  try {
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(journalQuery)}&datetype=pdat&mindate=${mindate}&maxdate=${maxdate}&retmax=${retmax}&sort=${sort}&retmode=json`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return [];
    const searchData = await searchRes.json();
    return searchData?.esearchresult?.idlist || [];
  } catch {
    return [];
  }
}

function parseArticlesFromXml(xmlText, expectedSource) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "text/xml");
  const articleNodes = doc.querySelectorAll("PubmedArticle");
  const articles = [];

  for (const node of articleNodes) {
    const medline = node.querySelector("MedlineCitation");
    const article = medline?.querySelector("Article");
    if (!article) continue;

    const journalAbbr = medline?.querySelector("MedlineJournalInfo MedlineTA")?.textContent || "";
    if (expectedSource && journalAbbr && journalAbbr.toLowerCase() !== expectedSource.toLowerCase()) continue;

    const pmid = medline?.querySelector("PMID")?.textContent || "";
    const title = article?.querySelector("ArticleTitle")?.textContent || "Başlık yok";

    const abstractNode = article?.getElementsByTagName("Abstract")?.[0];
    let abstract = "";
    if (abstractNode) {
      const abstractTexts = abstractNode.getElementsByTagName("AbstractText");
      if (abstractTexts.length > 0) {
        for (let k = 0; k < abstractTexts.length; k++) {
          const part = abstractTexts[k];
          const label = part.getAttribute("Label");
          if (label) abstract += label + ": ";
          abstract += part.textContent + "\n\n";
        }
      } else {
        abstract = abstractNode.textContent || "";
      }
    }
    abstract = abstract.trim();

    const authorNodes = article?.querySelectorAll("AuthorList Author") || [];
    const authorNames = [];
    for (const auth of authorNodes) {
      const last = auth.querySelector("LastName")?.textContent || "";
      const initials = auth.querySelector("Initials")?.textContent || "";
      if (last) authorNames.push(`${last} ${initials}`.trim());
    }
    const authors = authorNames.length > 3
      ? `${authorNames[0]} et al.`
      : authorNames.length > 0 ? authorNames.join(", ") : "Bilinmiyor";

    const pubDateYear = article?.querySelector("Journal JournalIssue PubDate Year")?.textContent ||
                        medline?.querySelector("DateCompleted Year")?.textContent || "";
    const year = pubDateYear ? parseInt(pubDateYear) : new Date().getFullYear();

    const idNodes = node.querySelectorAll("PubmedData ArticleIdList ArticleId");
    let doi = "";
    for (const idNode of idNodes) {
      if (idNode.getAttribute("IdType") === "doi") { doi = idNode.textContent; break; }
    }

    const volume = article?.querySelector("Journal JournalIssue Volume")?.textContent || "";
    const issue = article?.querySelector("Journal JournalIssue Issue")?.textContent || "";
    const pages = article?.querySelector("Pagination MedlinePgn")?.textContent || "";
    const citation = [volume && `Vol. ${volume}`, issue && `(${issue})`, pages && `pp. ${pages}`].filter(Boolean).join(" ");

    articles.push({ title, authors, year, abstract, doi, pmid, citation, journalAbbr });
  }
  return articles;
}

async function fetchFromPubMed(journalName, period) {
  const meta = journalMeta[journalName];
  const ta = meta?.ta;
  const { mindate, maxdate } = getDateRange(period);
  const journalQuery = ta ? `"${ta}"[ta]` : `"${journalName}"[Journal]`;
  const sort = period === "alltime" ? "relevance" : "pub+date";

  let ids = await pubmedSearch(journalQuery, mindate, maxdate, sort);

  if (ids.length === 0 && period === "month") {
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const fallbackMin = `${threeMonthsAgo.getFullYear()}/${String(threeMonthsAgo.getMonth() + 1).padStart(2, "0")}/01`;
    ids = await pubmedSearch(journalQuery, fallbackMin, maxdate, sort);
  }

  if (ids.length === 0) return null;

  const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${ids.join(",")}&retmode=xml`;
  try {
    const fetchRes = await fetch(fetchUrl);
    if (!fetchRes.ok) return null;
    const xmlText = await fetchRes.text();
    const articles = parseArticlesFromXml(xmlText, ta);
    return articles.length > 0 ? articles : null;
  } catch {
    return null;
  }
}

async function fetchFromCrossRef(journalName, period) {
  const meta = journalMeta[journalName];
  const issn = meta?.issn;
  if (!issn) return null;

  const { mindate, maxdate } = getDateRange(period);
  let fromDate = mindate.replace(/\//g, "-");
  const untilDate = maxdate.replace(/\//g, "-");

  if (period === "month") {
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    fromDate = `${threeMonthsAgo.getFullYear()}-${String(threeMonthsAgo.getMonth() + 1).padStart(2, "0")}-01`;
  }

  const sort = period === "alltime" ? "is-referenced-by-count" : "published";
  const url = `https://api.crossref.org/works?filter=issn:${issn},from-pub-date:${fromDate},until-pub-date:${untilDate}&sort=${sort}&order=desc&rows=50&select=title,author,published-print,published-online,DOI,container-title`;

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
      authors, year,
      summary: Array.isArray(item.title) ? item.title[0] : (item.title || ""),
      doi: item.DOI || "",
      why: `${item["container-title"]?.[0] || journalName}`,
    };
  });
}

async function fetchArticles(journalName, period) {
  try {
    const pubmedResult = await fetchFromPubMed(journalName, period);
    if (pubmedResult) return pubmedResult;
    const crossrefResult = await fetchFromCrossRef(journalName, period);
    if (crossrefResult) return crossrefResult;
    return null;
  } catch (e) {
    console.error("Fetch error:", e);
    return null;
  }
}

// ──────────────────────────────────────────────
// FIREBASE HELPER HOOKS
// ──────────────────────────────────────────────

// Generate a stable article ID from DOI or PMID
function articleId(art) {
  if (art.doi) return art.doi.replace(/[./]/g, "_");
  if (art.pmid) return `pmid_${art.pmid}`;
  return `hash_${btoa(art.title.slice(0, 60)).replace(/[^a-zA-Z0-9]/g, "")}`;
}

// Check if Firebase is configured
function useFirebaseReady() {
  return firebaseConfigured;
}

function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const firebaseReady = useFirebaseReady();

  useEffect(() => {
    if (!firebaseReady) { setLoading(false); return; }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, [firebaseReady]);

  const login = async () => {
    if (!firebaseReady) return;
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error("Login error:", e);
    }
  };

  const logout = async () => {
    if (!firebaseReady) return;
    await signOut(auth);
  };

  return { user, loading, login, logout, firebaseReady };
}

// ──────────────────────────────────────────────
// STAR RATING COMPONENT
// ──────────────────────────────────────────────
function StarRating({ rating, onRate, size = 18, readonly = false }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "inline-flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onClick={e => { e.stopPropagation(); if (!readonly && onRate) onRate(star); }}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          style={{
            cursor: readonly ? "default" : "pointer",
            fontSize: `${size}px`,
            color: star <= (hover || rating) ? "#F59E0B" : "#CBD5E1",
            transition: "color 0.15s, transform 0.15s",
            transform: !readonly && star <= hover ? "scale(1.2)" : "scale(1)",
            userSelect: "none"
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────
// SHELF BUTTON COMPONENT
// ──────────────────────────────────────────────
function ShelfButton({ currentShelf, onSetShelf, compact = false }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(!open); }}
        style={{
          fontSize: compact ? "11px" : "12px",
          padding: compact ? "4px 10px" : "6px 14px",
          borderRadius: "8px",
          border: currentShelf ? `1px solid ${SHELVES[currentShelf].color}` : "1px solid #cbd5e1",
          background: currentShelf ? `${SHELVES[currentShelf].color}15` : "#ffffff",
          color: currentShelf ? SHELVES[currentShelf].color : "#64748b",
          cursor: "pointer", fontWeight: 500,
          fontFamily: "'DM Sans', sans-serif",
          display: "flex", alignItems: "center", gap: "6px",
          transition: "all 0.15s"
        }}
      >
        {currentShelf ? `${SHELVES[currentShelf].icon} ${SHELVES[currentShelf].label}` : "📚 Rafa Ekle"}
        <span style={{ fontSize: "8px" }}>▾</span>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, marginTop: "4px",
          background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 100,
          minWidth: "180px", overflow: "hidden"
        }}>
          {Object.entries(SHELVES).map(([key, shelf]) => (
            <button key={key}
              onClick={e => {
                e.stopPropagation();
                onSetShelf(currentShelf === key ? null : key);
                setOpen(false);
              }}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                width: "100%", padding: "10px 14px", border: "none",
                background: currentShelf === key ? `${shelf.color}10` : "transparent",
                color: currentShelf === key ? shelf.color : "#334155",
                fontSize: "13px", cursor: "pointer", textAlign: "left",
                fontFamily: "'DM Sans', sans-serif",
                borderLeft: currentShelf === key ? `3px solid ${shelf.color}` : "3px solid transparent",
                transition: "all 0.1s"
              }}
              onMouseEnter={e => { if (currentShelf !== key) e.currentTarget.style.background = "#f8fafc"; }}
              onMouseLeave={e => { if (currentShelf !== key) e.currentTarget.style.background = "transparent"; }}
            >
              <span>{shelf.icon}</span>
              <div>
                <div style={{ fontWeight: 500 }}>{shelf.label}</div>
                <div style={{ fontSize: "11px", color: "#94a3b8" }}>{shelf.desc}</div>
              </div>
              {currentShelf === key && <span style={{ marginLeft: "auto", fontSize: "14px" }}>✓</span>}
            </button>
          ))}
          {currentShelf && (
            <button
              onClick={e => { e.stopPropagation(); onSetShelf(null); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                width: "100%", padding: "10px 14px", border: "none",
                borderTop: "1px solid #f1f5f9",
                background: "transparent", color: "#EF4444",
                fontSize: "12px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif"
              }}
            >
              ✕ Raftan Kaldır
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// REVIEW / COMMENT COMPONENT
// ──────────────────────────────────────────────
function ReviewSection({ artId, user, firebaseReady }) {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!firebaseReady || !artId) return;
    setLoading(true);
    const q = query(
      collection(db, "reviews"),
      where("articleId", "==", artId),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    const unsub = onSnapshot(q, (snap) => {
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [artId, firebaseReady]);

  const submitReview = async () => {
    if (!user || !newReview.trim() || submitting) return;
    setSubmitting(true);
    try {
      const reviewId = `${artId}_${user.uid}_${Date.now()}`;
      await setDoc(doc(db, "reviews", reviewId), {
        articleId: artId,
        userId: user.uid,
        userName: user.displayName || "Anonim",
        userPhoto: user.photoURL || "",
        text: newReview.trim(),
        createdAt: serverTimestamp(),
      });
      setNewReview("");
    } catch (e) {
      console.error("Review submit error:", e);
    }
    setSubmitting(false);
  };

  const deleteReview = async (reviewId) => {
    try {
      await deleteDoc(doc(db, "reviews", reviewId));
    } catch (e) {
      console.error("Delete review error:", e);
    }
  };

  return (
    <div style={{ marginTop: "12px", borderTop: "1px solid #e2e8f0", paddingTop: "12px" }}>
      <div style={{ fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
        💬 Tartışma
        {reviews.length > 0 && <span style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 400 }}>({reviews.length})</span>}
      </div>

      {/* Write review */}
      {user ? (
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          {user.photoURL && (
            <img src={user.photoURL} alt="" style={{ width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0 }} />
          )}
          <div style={{ flex: 1 }}>
            <textarea
              value={newReview}
              onChange={e => setNewReview(e.target.value)}
              placeholder="Bu makale hakkında ne düşünüyorsun?"
              style={{
                width: "100%", padding: "10px 12px", borderRadius: "8px",
                border: "1px solid #e2e8f0", background: "#f8fafc",
                fontSize: "13px", color: "#334155", resize: "vertical",
                minHeight: "60px", fontFamily: "'DM Sans', sans-serif",
                outline: "none", boxSizing: "border-box"
              }}
              onFocus={e => e.currentTarget.style.borderColor = "#93c5fd"}
              onBlur={e => e.currentTarget.style.borderColor = "#e2e8f0"}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "6px" }}>
              <button
                onClick={submitReview}
                disabled={!newReview.trim() || submitting}
                style={{
                  padding: "6px 16px", borderRadius: "6px", border: "none",
                  background: newReview.trim() ? "#1e40af" : "#cbd5e1",
                  color: "#ffffff", fontSize: "12px", fontWeight: 500,
                  cursor: newReview.trim() ? "pointer" : "default",
                  fontFamily: "'DM Sans', sans-serif",
                  opacity: submitting ? 0.6 : 1
                }}
              >
                {submitting ? "Gönderiliyor..." : "Yorum Yap"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          padding: "12px", borderRadius: "8px", background: "#f8fafc",
          border: "1px dashed #cbd5e1", textAlign: "center",
          fontSize: "12px", color: "#64748b", marginBottom: "12px"
        }}>
          Yorum yapmak için giriş yapın
        </div>
      )}

      {/* Reviews list */}
      {loading && <div style={{ fontSize: "12px", color: "#94a3b8", padding: "8px 0" }}>Yorumlar yükleniyor...</div>}
      {reviews.map(r => (
        <div key={r.id} style={{
          padding: "10px 12px", borderRadius: "8px", background: "#ffffff",
          border: "1px solid #f1f5f9", marginBottom: "6px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            {r.userPhoto && <img src={r.userPhoto} alt="" style={{ width: "22px", height: "22px", borderRadius: "50%" }} />}
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#334155" }}>{r.userName}</span>
            <span style={{ fontSize: "10px", color: "#94a3b8" }}>
              {r.createdAt?.toDate ? new Date(r.createdAt.toDate()).toLocaleDateString("tr-TR") : ""}
            </span>
            {user && r.userId === user.uid && (
              <button onClick={() => deleteReview(r.id)} style={{
                marginLeft: "auto", fontSize: "10px", color: "#ef4444",
                background: "none", border: "none", cursor: "pointer"
              }}>Sil</button>
            )}
          </div>
          <div style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{r.text}</div>
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────
// USER PROFILE PANEL
// ──────────────────────────────────────────────
function ProfilePanel({ user, userArticles, onClose }) {
  const readCount = Object.values(userArticles).filter(a => a.shelf === "read").length;
  const readingCount = Object.values(userArticles).filter(a => a.shelf === "reading").length;
  const wantCount = Object.values(userArticles).filter(a => a.shelf === "wantToRead").length;
  const ratedArticles = Object.values(userArticles).filter(a => a.rating > 0);
  const avgRating = ratedArticles.length > 0
    ? (ratedArticles.reduce((s, a) => s + a.rating, 0) / ratedArticles.length).toFixed(1)
    : "-";

  // Group by shelf
  const shelvedArticles = {};
  Object.entries(SHELVES).forEach(([key]) => {
    shelvedArticles[key] = Object.entries(userArticles)
      .filter(([, a]) => a.shelf === key)
      .sort((a, b) => (b[1].updatedAt || 0) - (a[1].updatedAt || 0));
  });

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)",
      display: "flex", justifyContent: "center", alignItems: "flex-start",
      padding: "40px 20px", overflowY: "auto"
    }} onClick={onClose}>
      <div style={{
        background: "#ffffff", borderRadius: "16px", width: "100%", maxWidth: "640px",
        boxShadow: "0 24px 48px rgba(0,0,0,0.15)", overflow: "hidden"
      }} onClick={e => e.stopPropagation()}>
        {/* Profile header */}
        <div style={{
          background: "linear-gradient(135deg, #1e3a8a, #1e40af)",
          padding: "32px 28px", color: "#ffffff"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {user.photoURL && (
              <img src={user.photoURL} alt="" style={{
                width: "64px", height: "64px", borderRadius: "50%",
                border: "3px solid rgba(255,255,255,0.3)"
              }} />
            )}
            <div>
              <div style={{ fontSize: "22px", fontWeight: 600 }}>{user.displayName || "Kullanıcı"}</div>
              <div style={{ fontSize: "13px", opacity: 0.7 }}>{user.email}</div>
            </div>
            <button onClick={onClose} style={{
              marginLeft: "auto", background: "rgba(255,255,255,0.15)",
              border: "none", color: "#ffffff", width: "32px", height: "32px",
              borderRadius: "8px", cursor: "pointer", fontSize: "14px"
            }}>✕</button>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: "24px", marginTop: "20px" }}>
            {[
              { label: "Okunan", value: readCount, color: "#86EFAC" },
              { label: "Okunan", value: readingCount, color: "#93C5FD" },
              { label: "Liste", value: wantCount, color: "#FDE68A" },
              { label: "Ort. Puan", value: avgRating, color: "#FDE68A" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "24px", fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: "11px", opacity: 0.7 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Shelves */}
        <div style={{ padding: "24px 28px" }}>
          {Object.entries(SHELVES).map(([key, shelf]) => {
            const articles = shelvedArticles[key] || [];
            if (articles.length === 0) return null;
            return (
              <div key={key} style={{ marginBottom: "24px" }}>
                <div style={{
                  fontSize: "14px", fontWeight: 600, color: shelf.color,
                  marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px"
                }}>
                  {shelf.icon} {shelf.label}
                  <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 400 }}>({articles.length})</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {articles.map(([id, art]) => (
                    <div key={id} style={{
                      padding: "10px 14px", borderRadius: "8px",
                      background: "#f8fafc", border: "1px solid #e2e8f0",
                      display: "flex", alignItems: "center", gap: "10px"
                    }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "13px", fontWeight: 500, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {art.title}
                        </div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>
                          {art.authors} · {art.journalAbbr || ""}
                        </div>
                      </div>
                      {art.rating > 0 && <StarRating rating={art.rating} readonly size={14} />}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {readCount + readingCount + wantCount === 0 && (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>📚</div>
              <div style={{ fontSize: "14px" }}>Henüz rafına makale eklenmemiş</div>
              <div style={{ fontSize: "12px", marginTop: "4px" }}>Makaleleri keşfet ve rafa ekle!</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// COMMUNITY FEED
// ──────────────────────────────────────────────
function CommunityFeed({ firebaseReady, onClose }) {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseReady) { setLoading(false); return; }
    const q = query(
      collection(db, "activity"),
      orderBy("createdAt", "desc"),
      limit(30)
    );
    const unsub = onSnapshot(q, (snap) => {
      setFeed(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [firebaseReady]);

  const actionText = (type) => {
    if (type === "read") return "okudu";
    if (type === "reading") return "okuyor";
    if (type === "wantToRead") return "okumak istiyor";
    if (type === "rating") return "puanladı";
    if (type === "review") return "yorum yaptı";
    return "";
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)",
      display: "flex", justifyContent: "center", alignItems: "flex-start",
      padding: "40px 20px", overflowY: "auto"
    }} onClick={onClose}>
      <div style={{
        background: "#ffffff", borderRadius: "16px", width: "100%", maxWidth: "560px",
        boxShadow: "0 24px 48px rgba(0,0,0,0.15)", overflow: "hidden"
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          background: "linear-gradient(135deg, #1e3a8a, #1e40af)",
          padding: "24px 28px", color: "#ffffff",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div>
            <div style={{ fontSize: "18px", fontWeight: 600 }}>🌐 Topluluk</div>
            <div style={{ fontSize: "12px", opacity: 0.7 }}>Araştırmacıların okuma aktiviteleri</div>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.15)", border: "none", color: "#ffffff",
            width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer", fontSize: "14px"
          }}>✕</button>
        </div>

        <div style={{ padding: "20px 28px", maxHeight: "60vh", overflowY: "auto" }}>
          {loading && <div style={{ textAlign: "center", padding: "20px", color: "#94a3b8", fontSize: "13px" }}>Yükleniyor...</div>}

          {!loading && feed.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>🌱</div>
              <div style={{ fontSize: "14px" }}>Henüz aktivite yok</div>
              <div style={{ fontSize: "12px", marginTop: "4px" }}>Makale oku, puanla ve yorumla — aktivitelerin burada görünecek!</div>
            </div>
          )}

          {feed.map(item => (
            <div key={item.id} style={{
              padding: "12px 14px", borderRadius: "10px", background: "#f8fafc",
              border: "1px solid #e2e8f0", marginBottom: "8px",
              display: "flex", gap: "10px", alignItems: "flex-start"
            }}>
              {item.userPhoto && (
                <img src={item.userPhoto} alt="" style={{ width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", color: "#334155" }}>
                  <strong>{item.userName || "Anonim"}</strong>{" "}
                  <span style={{ color: "#64748b" }}>{actionText(item.type)}</span>
                </div>
                <div style={{ fontSize: "13px", fontWeight: 500, color: "#0f172a", marginTop: "2px" }}>
                  {item.articleTitle}
                </div>
                {item.journalAbbr && (
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{item.journalAbbr}</div>
                )}
                {item.rating > 0 && (
                  <div style={{ marginTop: "4px" }}><StarRating rating={item.rating} readonly size={12} /></div>
                )}
                {item.text && (
                  <div style={{ fontSize: "12px", color: "#475569", marginTop: "4px", lineHeight: 1.5 }}>
                    "{item.text.length > 120 ? item.text.slice(0, 120) + "..." : item.text}"
                  </div>
                )}
                <div style={{ fontSize: "10px", color: "#cbd5e1", marginTop: "4px" }}>
                  {item.createdAt?.toDate ? new Date(item.createdAt.toDate()).toLocaleDateString("tr-TR") : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// FIREBASE SETUP GUIDE
// ──────────────────────────────────────────────
function FirebaseSetupGuide({ onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(15,23,42,0.5)", backdropFilter: "blur(4px)",
      display: "flex", justifyContent: "center", alignItems: "flex-start",
      padding: "40px 20px", overflowY: "auto"
    }} onClick={onClose}>
      <div style={{
        background: "#ffffff", borderRadius: "16px", width: "100%", maxWidth: "560px",
        boxShadow: "0 24px 48px rgba(0,0,0,0.15)", overflow: "hidden"
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          background: "linear-gradient(135deg, #1e3a8a, #1e40af)",
          padding: "24px 28px", color: "#ffffff",
          display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div style={{ fontSize: "18px", fontWeight: 600 }}>🔧 Firebase Kurulumu</div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.15)", border: "none", color: "#ffffff",
            width: "32px", height: "32px", borderRadius: "8px", cursor: "pointer", fontSize: "14px"
          }}>✕</button>
        </div>
        <div style={{ padding: "24px 28px", fontSize: "13px", color: "#334155", lineHeight: 1.8 }}>
          <p style={{ marginBottom: "16px" }}>
            Sosyal özellikler (giriş yapma, puanlama, yorum, topluluk) için Firebase kurulumu gerekli:
          </p>
          <ol style={{ paddingLeft: "20px", marginBottom: "16px" }}>
            <li style={{ marginBottom: "8px" }}><a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: "#1e40af" }}>Firebase Console</a>'a gidin ve yeni proje oluşturun</li>
            <li style={{ marginBottom: "8px" }}><strong>Authentication</strong> &gt; Sign-in method &gt; <strong>Google</strong>'ı etkinleştirin</li>
            <li style={{ marginBottom: "8px" }}><strong>Firestore Database</strong> oluşturun (test modunda başlayabilirsiniz)</li>
            <li style={{ marginBottom: "8px" }}>Project Settings &gt; General &gt; Web App ekleyin</li>
            <li style={{ marginBottom: "8px" }}>Firebase config değerlerini kopyalayın</li>
            <li style={{ marginBottom: "8px" }}>Projenin kök dizininde <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>.env</code> dosyası oluşturun:</li>
          </ol>
          <pre style={{
            background: "#0f172a", color: "#e2e8f0", padding: "16px",
            borderRadius: "8px", fontSize: "11px", overflowX: "auto", lineHeight: 1.7
          }}>
{`VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=proje-adi.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=proje-adi
VITE_FIREBASE_STORAGE_BUCKET=proje-adi.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123`}
          </pre>
          <p style={{ marginTop: "16px", color: "#64748b", fontSize: "12px" }}>
            GitHub Pages için: repo Settings &gt; Secrets &gt; Actions'dan aynı değerleri ekleyin ve deploy.yml'i güncelleyin.
          </p>
          <p style={{ marginTop: "12px", fontSize: "12px", color: "#94a3b8" }}>
            Firebase kurulmadan da dergi takibi ve makale keşfetme özellikleri çalışır. Sosyal özellikler sadece Firebase ile aktif olur.
          </p>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// ARTICLE PANEL (with social features)
// ──────────────────────────────────────────────
function ArticlePanel({ journal, onClose, user, firebaseReady, userArticles, onArticleAction }) {
  const [period, setPeriod] = useState("month");
  const [articles, setArticles] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedAbstract, setExpandedAbstract] = useState(null);
  const [showReviews, setShowReviews] = useState(null);
  const cacheRef = useRef({});

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
      background: "#f8fafc", border: "1px solid #e2e8f0"
    }} onClick={e => e.stopPropagation()}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>📄</span>
          Makaleler — <span style={{ color: journal.color }}>{journal.abbr}</span>
          {currentArticles.length > 0 && <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 400 }}> ({currentArticles.length} makale)</span>}
        </div>
        <button onClick={onClose} style={{
          background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#64748b",
          width: "24px", height: "24px", borderRadius: "6px", cursor: "pointer", fontSize: "12px"
        }}>✕</button>
      </div>

      {/* Period tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "16px", background: "#e2e8f0", borderRadius: "8px", padding: "3px" }}>
        {Object.entries(periodLabels).map(([key, label]) => (
          <button key={key} onClick={() => setPeriod(key)} style={{
            flex: 1, padding: "7px 10px", borderRadius: "6px", border: "none",
            background: period === key ? "#1e40af" : "transparent",
            color: period === key ? "#ffffff" : "#64748b",
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
            width: "28px", height: "28px", border: "2px solid #cbd5e1",
            borderTopColor: "#1e40af", borderRadius: "50%", margin: "0 auto 12px",
            animation: "spin 0.8s linear infinite"
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <div style={{ fontSize: "12px", color: "#64748b" }}>PubMed'den makaleler yükleniyor...</div>
        </div>
      )}

      {/* Error */}
      {!loading && error && !currentArticles.length && (
        <div style={{ padding: "24px 0", textAlign: "center" }}>
          <div style={{ fontSize: "12px", color: "#dc2626", marginBottom: "8px" }}>{error}</div>
          <button onClick={() => { delete cacheRef.current[period]; doFetch(period); }}
            style={{
              fontSize: "11px", padding: "6px 14px", borderRadius: "6px", cursor: "pointer",
              background: "#ffffff", border: "1px solid #cbd5e1",
              color: "#475569", fontFamily: "'DM Sans', sans-serif"
            }}>
            Tekrar Dene
          </button>
        </div>
      )}

      {/* Articles */}
      {!loading && currentArticles.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "70vh", overflowY: "auto", paddingRight: "4px" }}>
          {currentArticles.map((art, i) => {
            const isAbstractOpen = expandedAbstract === i;
            const isReviewsOpen = showReviews === i;
            const aId = articleId(art);
            const userArt = userArticles[aId];

            return (
              <div key={art.pmid || i} style={{
                padding: "14px 16px", borderRadius: "10px",
                background: "#ffffff", border: "1px solid #e2e8f0",
                transition: "border-color 0.2s"
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#93c5fd"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}
              >
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <span style={{
                    width: "22px", height: "22px", borderRadius: "6px", flexShrink: 0,
                    background: `${journal.color}20`, color: journal.color,
                    fontSize: "10px", fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a", lineHeight: 1.4, marginBottom: "3px" }}>
                      {art.title}
                    </div>
                    <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "6px" }}>
                      {art.authors} · {art.year}
                      {art.citation && <span style={{ color: "#94a3b8" }}> · {art.citation}</span>}
                    </div>

                    {/* Social action row */}
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", marginBottom: "8px" }}>
                      {/* Shelf button */}
                      {(user || !firebaseReady) && (
                        <ShelfButton
                          compact
                          currentShelf={userArt?.shelf || null}
                          onSetShelf={(shelf) => onArticleAction(aId, { ...art, journalAbbr: journal.abbr }, "shelf", shelf)}
                        />
                      )}

                      {/* Star rating */}
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <StarRating
                          rating={userArt?.rating || 0}
                          onRate={(r) => onArticleAction(aId, { ...art, journalAbbr: journal.abbr }, "rate", r)}
                          size={15}
                          readonly={!user && firebaseReady}
                        />
                        {userArt?.rating > 0 && (
                          <span style={{ fontSize: "11px", color: "#F59E0B", fontWeight: 600 }}>{userArt.rating}</span>
                        )}
                      </div>
                    </div>

                    {/* Abstract toggle */}
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "4px" }}>
                      {art.abstract && (
                        <button
                          onClick={e => { e.stopPropagation(); setExpandedAbstract(isAbstractOpen ? null : i); }}
                          style={{
                            fontSize: "11px", color: isAbstractOpen ? "#1e40af" : "#64748b",
                            background: isAbstractOpen ? "#eff6ff" : "transparent",
                            border: "none", cursor: "pointer", padding: "3px 8px", borderRadius: "4px",
                            fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s"
                          }}
                        >
                          {isAbstractOpen ? "▾ Abstract'ı Gizle" : "▸ Abstract'ı Göster"}
                        </button>
                      )}
                      {firebaseReady && (
                        <button
                          onClick={e => { e.stopPropagation(); setShowReviews(isReviewsOpen ? null : i); }}
                          style={{
                            fontSize: "11px", color: isReviewsOpen ? "#1e40af" : "#64748b",
                            background: isReviewsOpen ? "#eff6ff" : "transparent",
                            border: "none", cursor: "pointer", padding: "3px 8px", borderRadius: "4px",
                            fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s"
                          }}
                        >
                          {isReviewsOpen ? "▾ Tartışmayı Gizle" : "💬 Tartışma"}
                        </button>
                      )}
                    </div>

                    {/* Abstract content */}
                    {isAbstractOpen && art.abstract && (
                      <div style={{
                        fontSize: "12px", color: "#334155", lineHeight: 1.7,
                        padding: "10px 12px", borderRadius: "8px",
                        background: "#f1f5f9", border: "1px solid #e2e8f0",
                        marginBottom: "6px", whiteSpace: "pre-wrap"
                      }}>
                        {art.abstract}
                      </div>
                    )}

                    {!art.abstract && (
                      <div style={{ fontSize: "11px", color: "#94a3b8", fontStyle: "italic", marginBottom: "4px" }}>
                        Abstract mevcut değil
                      </div>
                    )}

                    {/* Review section */}
                    {isReviewsOpen && firebaseReady && (
                      <ReviewSection artId={aId} user={user} firebaseReady={firebaseReady} />
                    )}

                    {/* Links */}
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                      {art.doi && (
                        <a href={art.doi.startsWith("http") ? art.doi : `https://doi.org/${art.doi}`}
                          target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{
                            display: "inline-block", fontSize: "11px",
                            color: "#64748b", textDecoration: "none",
                            padding: "3px 10px", borderRadius: "4px",
                            background: "#f8fafc", border: "1px solid #e2e8f0",
                            transition: "color 0.15s"
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = "#1e40af"}
                          onMouseLeave={e => e.currentTarget.style.color = "#64748b"}
                        >
                          DOI →
                        </a>
                      )}
                      {art.pmid && (
                        <a href={`https://pubmed.ncbi.nlm.nih.gov/${art.pmid}/`}
                          target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{
                            display: "inline-block", fontSize: "11px",
                            color: "#64748b", textDecoration: "none",
                            padding: "3px 10px", borderRadius: "4px",
                            background: "#f8fafc", border: "1px solid #e2e8f0",
                            transition: "color 0.15s"
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = "#2DD4BF"}
                          onMouseLeave={e => e.currentTarget.style.color = "#64748b"}
                        >
                          PubMed →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────
export default function GenetikDergiTakip() {
  const { user, loading: authLoading, login, logout, firebaseReady } = useAuth();

  const [selectedQuartiles, setSelectedQuartiles] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [search, setSearch] = useState("");
  const [bookmarks, setBookmarks] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [articlePanelId, setArticlePanelId] = useState(null);
  const [sortBy, setSortBy] = useState("quartile");
  const [ifRange, setIfRange] = useState([0, 50]);
  const [mounted, setMounted] = useState(false);

  // Social state
  const [userArticles, setUserArticles] = useState({}); // { articleId: { shelf, rating, title, authors, ... } }
  const [showProfile, setShowProfile] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [activeTab, setActiveTab] = useState("discover"); // discover | library

  useEffect(() => { setMounted(true); }, []);

  // Load user articles from Firestore
  useEffect(() => {
    if (!firebaseReady || !user) {
      // Load from localStorage as fallback
      try {
        const saved = localStorage.getItem("genetik_user_articles");
        if (saved) setUserArticles(JSON.parse(saved));
      } catch {}
      return;
    }

    const q = query(
      collection(db, "userArticles"),
      where("userId", "==", user.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      const arts = {};
      snap.docs.forEach(d => {
        const data = d.data();
        arts[data.articleId] = data;
      });
      setUserArticles(arts);
    });
    return unsub;
  }, [user, firebaseReady]);

  // Save to localStorage as fallback
  useEffect(() => {
    if (!firebaseReady || !user) {
      try {
        localStorage.setItem("genetik_user_articles", JSON.stringify(userArticles));
      } catch {}
    }
  }, [userArticles, firebaseReady, user]);

  // Handle article actions (shelf, rate)
  const handleArticleAction = useCallback(async (aId, artData, action, value) => {
    const existing = userArticles[aId] || {};

    if (firebaseReady && user) {
      // Save to Firestore
      const docId = `${user.uid}_${aId}`;
      const updates = {
        articleId: aId,
        userId: user.uid,
        title: artData.title,
        authors: artData.authors,
        journalAbbr: artData.journalAbbr || "",
        updatedAt: serverTimestamp(),
      };

      if (action === "shelf") {
        updates.shelf = value;
        if (!value) {
          // Remove from shelf but keep rating if exists
          if (!existing.rating) {
            await deleteDoc(doc(db, "userArticles", docId));
            // Post activity
          } else {
            await setDoc(doc(db, "userArticles", docId), { ...existing, ...updates, shelf: null }, { merge: true });
          }
        } else {
          await setDoc(doc(db, "userArticles", docId), { ...existing, ...updates }, { merge: true });
          // Post activity
          const actId = `${user.uid}_${aId}_${value}_${Date.now()}`;
          await setDoc(doc(db, "activity", actId), {
            type: value,
            userId: user.uid,
            userName: user.displayName || "Anonim",
            userPhoto: user.photoURL || "",
            articleId: aId,
            articleTitle: artData.title,
            journalAbbr: artData.journalAbbr || "",
            createdAt: serverTimestamp(),
          });
        }
      } else if (action === "rate") {
        updates.rating = value;
        await setDoc(doc(db, "userArticles", docId), { ...existing, ...updates }, { merge: true });
        // Post rating activity
        const actId = `${user.uid}_${aId}_rating_${Date.now()}`;
        await setDoc(doc(db, "activity", actId), {
          type: "rating",
          userId: user.uid,
          userName: user.displayName || "Anonim",
          userPhoto: user.photoURL || "",
          articleId: aId,
          articleTitle: artData.title,
          journalAbbr: artData.journalAbbr || "",
          rating: value,
          createdAt: serverTimestamp(),
        });
      }
    } else {
      // localStorage fallback
      setUserArticles(prev => {
        const updated = { ...prev };
        if (action === "shelf") {
          if (!value && !existing.rating) {
            delete updated[aId];
          } else {
            updated[aId] = { ...existing, ...artData, shelf: value, updatedAt: Date.now() };
          }
        } else if (action === "rate") {
          updated[aId] = { ...existing, ...artData, rating: value, updatedAt: Date.now() };
        }
        return updated;
      });
    }
  }, [user, firebaseReady, userArticles]);

  const toggleQuartile = (q) => setSelectedQuartiles(prev => prev.includes(q) ? prev.filter(x => x !== q) : [...prev, q]);
  const toggleTag = (tag) => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  const toggleBookmark = (id) => setBookmarks(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);

  const quartileOrder = { Q1: 0, Q2: 1, Q3: 2, Q4: 3 };
  const filtered = journals
    .filter(j => {
      if (selectedQuartiles.length > 0 && !selectedQuartiles.includes(j.quartile)) return false;
      if (selectedField && j.field !== selectedField) return false;
      if (selectedTags.length > 0 && !selectedTags.some(t => j.tags.includes(t))) return false;
      if (j.if2024 < ifRange[0] || j.if2024 > ifRange[1]) return false;
      if (search && !j.name.toLowerCase().includes(search.toLowerCase()) && !j.abbr.toLowerCase().includes(search.toLowerCase()) && !j.focus.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "if") return b.if2024 - a.if2024;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return quartileOrder[a.quartile] - quartileOrder[b.quartile] || b.if2024 - a.if2024;
    });

  // Library view data
  const libraryArticles = useMemo(() => {
    const result = { read: [], reading: [], wantToRead: [] };
    Object.entries(userArticles).forEach(([id, art]) => {
      if (art.shelf && result[art.shelf]) {
        result[art.shelf].push({ id, ...art });
      }
    });
    // Sort by most recently updated
    Object.keys(result).forEach(key => {
      result[key].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    });
    return result;
  }, [userArticles]);

  const totalLibrary = Object.values(libraryArticles).reduce((s, arr) => s + arr.length, 0);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(165deg, #f8fafc 0%, #e2e8f0 40%, #f1f5f9 100%)",
      color: "#1e293b", fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      padding: 0, position: "relative", overflow: "hidden"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />

      <div style={{ position: "fixed", top: "-200px", right: "-200px", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(30,58,138,0.06) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-300px", left: "-100px", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(30,58,138,0.04) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Header */}
      <div style={{ padding: "28px 32px 20px", position: "relative", zIndex: 1, borderBottom: "1px solid rgba(30,58,138,0.1)", background: "linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "6px" }}>
                <span style={{ fontSize: "11px", letterSpacing: "4px", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>Tıbbi Genetik</span>
                <span style={{ width: "40px", height: "1px", background: "linear-gradient(90deg, rgba(255,255,255,0.4), transparent)", display: "inline-block", verticalAlign: "middle" }} />
              </div>
              <h1 style={{
                fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 5vw, 42px)",
                fontWeight: 400, fontStyle: "italic", color: "#ffffff", margin: "8px 0 8px", lineHeight: 1.1, letterSpacing: "-0.5px"
              }}>
                Dergi Takip Rehberi
              </h1>
              <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "13px", maxWidth: "460px", lineHeight: 1.5, margin: 0 }}>
                Makale keşfet, puanla, yorumla ve toplulukla paylaş.
              </p>
            </div>

            {/* Auth section */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
              {!firebaseReady ? (
                <button onClick={() => setShowSetupGuide(true)} style={{
                  padding: "8px 16px", borderRadius: "8px",
                  background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)",
                  color: "#ffffff", fontSize: "12px", cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: "6px"
                }}>
                  🔧 Firebase Kur
                </button>
              ) : authLoading ? (
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>...</div>
              ) : user ? (
                <>
                  <button onClick={() => setShowCommunity(true)} style={{
                    padding: "8px 14px", borderRadius: "8px",
                    background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)",
                    color: "#ffffff", fontSize: "12px", cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif"
                  }}>
                    🌐 Topluluk
                  </button>
                  <button onClick={() => setShowProfile(true)} style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "6px 12px 6px 6px", borderRadius: "10px",
                    background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)",
                    color: "#ffffff", fontSize: "12px", cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif"
                  }}>
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" style={{ width: "26px", height: "26px", borderRadius: "50%" }} />
                    ) : (
                      <div style={{ width: "26px", height: "26px", borderRadius: "50%", background: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>👤</div>
                    )}
                    {user.displayName?.split(" ")[0] || "Profil"}
                  </button>
                  <button onClick={logout} style={{
                    padding: "8px 12px", borderRadius: "8px",
                    background: "transparent", border: "1px solid rgba(255,255,255,0.2)",
                    color: "rgba(255,255,255,0.7)", fontSize: "11px", cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif"
                  }}>
                    Çıkış
                  </button>
                </>
              ) : (
                <button onClick={login} style={{
                  padding: "10px 20px", borderRadius: "10px",
                  background: "#ffffff", border: "none",
                  color: "#1e40af", fontSize: "13px", fontWeight: 600, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  display: "flex", alignItems: "center", gap: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Google ile Giriş Yap
                </button>
              )}
            </div>
          </div>

          {/* Tab navigation */}
          <div style={{ display: "flex", gap: "4px", marginTop: "16px" }}>
            {[
              { key: "discover", label: "Keşfet", icon: "🔬", count: journals.length },
              { key: "library", label: "Kütüphanem", icon: "📚", count: totalLibrary },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                padding: "8px 18px", borderRadius: "8px 8px 0 0", border: "none",
                background: activeTab === tab.key ? "#ffffff" : "rgba(255,255,255,0.1)",
                color: activeTab === tab.key ? "#1e40af" : "rgba(255,255,255,0.7)",
                fontSize: "13px", fontWeight: activeTab === tab.key ? 600 : 400,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                display: "flex", alignItems: "center", gap: "6px",
                transition: "all 0.2s"
              }}>
                {tab.icon} {tab.label}
                <span style={{
                  fontSize: "10px", padding: "1px 6px", borderRadius: "10px",
                  background: activeTab === tab.key ? "#eff6ff" : "rgba(255,255,255,0.15)",
                  color: activeTab === tab.key ? "#1e40af" : "rgba(255,255,255,0.7)"
                }}>{tab.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "24px 32px 60px", position: "relative", zIndex: 1 }}>

        {/* ═══════ DISCOVER TAB ═══════ */}
        {activeTab === "discover" && (
          <>
            {/* Research Field Selector */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px", fontWeight: 500 }}>Araştırma Alanı</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <button onClick={() => setSelectedField(null)} style={{
                  padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 500,
                  border: "1px solid", borderColor: !selectedField ? "#1e40af" : "#cbd5e1",
                  background: !selectedField ? "#1e40af" : "#ffffff",
                  color: !selectedField ? "#ffffff" : "#475569", cursor: "pointer", transition: "all 0.15s ease"
                }}>Tümü</button>
                {researchFields.map(field => {
                  const count = journals.filter(j => j.field === field).length;
                  return (
                    <button key={field} onClick={() => setSelectedField(selectedField === field ? null : field)} style={{
                      padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: 500,
                      border: "1px solid", borderColor: selectedField === field ? "#1e40af" : "#cbd5e1",
                      background: selectedField === field ? "#1e40af" : "#ffffff",
                      color: selectedField === field ? "#ffffff" : "#475569", cursor: "pointer", transition: "all 0.15s ease"
                    }}>
                      {field} <span style={{ opacity: 0.5, fontSize: "10px" }}>({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quartile pills + IF Range */}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "16px", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {Object.entries(quartileInfo).map(([key, val]) => {
                  const isSelected = selectedQuartiles.includes(key);
                  return (
                    <button key={key} onClick={() => toggleQuartile(key)} style={{
                      padding: "7px 16px", borderRadius: "999px", border: "1px solid",
                      borderColor: isSelected ? val.bg : "#cbd5e1",
                      background: isSelected ? `${val.bg}18` : "#ffffff",
                      color: isSelected ? val.bg : "#64748b",
                      fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease",
                      display: "flex", alignItems: "center", gap: "6px"
                    }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: val.bg, opacity: isSelected ? 1 : 0.4 }} />
                      {val.label}
                      <span style={{ fontWeight: 400, opacity: 0.6, fontSize: "11px" }}>({val.desc})</span>
                    </button>
                  );
                })}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "6px 14px", borderRadius: "10px", background: "#ffffff", border: "1px solid #cbd5e1" }}>
                <span style={{ fontSize: "11px", color: "#64748b", whiteSpace: "nowrap" }}>IF:</span>
                <input type="range" min="0" max="50" step="0.5" value={ifRange[0]}
                  onChange={e => setIfRange([Math.min(parseFloat(e.target.value), ifRange[1]), ifRange[1]])}
                  style={{ width: "80px", accentColor: "#1e40af" }} />
                <span style={{ fontSize: "12px", color: "#1e293b", fontVariantNumeric: "tabular-nums", minWidth: "60px", textAlign: "center" }}>
                  {ifRange[0]} – {ifRange[1]}
                </span>
                <input type="range" min="0" max="50" step="0.5" value={ifRange[1]}
                  onChange={e => setIfRange([ifRange[0], Math.max(parseFloat(e.target.value), ifRange[0])])}
                  style={{ width: "80px", accentColor: "#1e40af" }} />
              </div>
            </div>

            {/* Search + Sort */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
              <input type="text" placeholder="Dergi ara..." value={search} onChange={e => setSearch(e.target.value)} style={{
                flex: "1 1 200px", padding: "10px 16px", borderRadius: "10px",
                border: "1px solid #cbd5e1", background: "#ffffff",
                color: "#1e293b", fontSize: "14px", outline: "none", fontFamily: "'DM Sans', sans-serif"
              }} />
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
                padding: "10px 16px", borderRadius: "10px", border: "1px solid #cbd5e1",
                background: "#ffffff", color: "#475569", fontSize: "13px", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif"
              }}>
                <option value="quartile">Quartile'a göre</option>
                <option value="if">IF'ye göre</option>
                <option value="name">İsme göre</option>
              </select>
            </div>

            {/* Tag filters */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "28px" }}>
              {allTags.map(tag => (
                <button key={tag} onClick={() => toggleTag(tag)} style={{
                  padding: "4px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: 500, textTransform: "capitalize",
                  border: "1px solid", borderColor: selectedTags.includes(tag) ? "#1e40af" : "#cbd5e1",
                  background: selectedTags.includes(tag) ? "#1e40af" : "transparent",
                  color: selectedTags.includes(tag) ? "#ffffff" : "#64748b", cursor: "pointer", transition: "all 0.15s ease"
                }}>{tag}</button>
              ))}
              {(selectedTags.length > 0 || selectedQuartiles.length > 0 || selectedField) && (
                <button onClick={() => { setSelectedTags([]); setSelectedQuartiles([]); setSelectedField(null); setIfRange([0, 50]); }} style={{
                  padding: "4px 12px", borderRadius: "6px", fontSize: "11px",
                  border: "none", background: "#fee2e2", color: "#dc2626", cursor: "pointer"
                }}>✕ Tümünü Temizle</button>
              )}
            </div>

            {bookmarks.length > 0 && (
              <div style={{
                marginBottom: "20px", padding: "10px 16px", borderRadius: "10px",
                background: "#fef3c7", border: "1px solid #fbbf24",
                fontSize: "13px", color: "#92400e", display: "flex", alignItems: "center", gap: "8px"
              }}>
                <span>★</span>
                <span>{bookmarks.length} dergi işaretlendi</span>
                <span style={{ color: "#78716c", fontSize: "11px" }}>
                  — {journals.filter(j => bookmarks.includes(j.id)).map(j => j.abbr).join(", ")}
                </span>
              </div>
            )}

            <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "14px", letterSpacing: "0.5px" }}>
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
                    background: "#ffffff", border: "1px solid",
                    borderColor: isExpanded ? j.color : "#e2e8f0",
                    borderRadius: "14px", overflow: "hidden", transition: "all 0.3s ease",
                    opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(12px)",
                    transitionDelay: `${idx * 40}ms`, cursor: "pointer"
                  }} onClick={() => { setExpandedId(isExpanded ? null : j.id); if (isExpanded) setArticlePanelId(null); }}>

                    <div style={{ padding: "16px 20px", display: "grid", gridTemplateColumns: "auto 1fr auto auto", alignItems: "center", gap: "16px" }}>
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "10px",
                        background: `${quartileInfo[j.quartile].bg}15`, border: `1px solid ${quartileInfo[j.quartile].bg}30`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "12px", fontWeight: 700, color: quartileInfo[j.quartile].bg, flexShrink: 0
                      }}>{j.quartile}</div>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "15px", fontWeight: 600, color: "#0f172a" }}>{j.abbr}</span>
                          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 400 }}>{j.name}</span>
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span>{j.focus}</span>
                          <span style={{ fontSize: "10px", padding: "1px 8px", borderRadius: "4px", background: "#eff6ff", color: "#1e40af", border: "1px solid #bfdbfe" }}>{j.field}</span>
                        </div>
                      </div>

                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontSize: "18px", fontWeight: 700, color: j.color, fontVariantNumeric: "tabular-nums" }}>{j.if2024}</div>
                        <div style={{ fontSize: "10px", color: "#94a3b8", letterSpacing: "0.5px" }}>IF 2024</div>
                      </div>

                      <button onClick={e => { e.stopPropagation(); toggleBookmark(j.id); }} style={{
                        width: "32px", height: "32px", borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        background: isBookmarked ? "#fef3c7" : "transparent",
                        color: isBookmarked ? "#d97706" : "#94a3b8",
                        cursor: "pointer", fontSize: "16px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.2s ease", flexShrink: 0
                      }}>{isBookmarked ? "★" : "☆"}</button>
                    </div>

                    {isExpanded && (
                      <div style={{ padding: "0 20px 20px", borderTop: "1px solid #e2e8f0", marginTop: "-2px", paddingTop: "16px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "14px" }}>
                          <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: "8px" }}>
                            <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Yayıncı</div>
                            <div style={{ fontSize: "13px", color: "#334155" }}>{j.publisher}</div>
                          </div>
                          <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: "8px" }}>
                            <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Yayın Sıklığı</div>
                            <div style={{ fontSize: "13px", color: "#334155" }}>{j.frequency}</div>
                          </div>
                          <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: "8px" }}>
                            <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Etiketler</div>
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
                          padding: "12px 16px", borderRadius: "10px", background: "#f1f5f9",
                          borderLeft: `3px solid ${j.color}`, fontSize: "13px", color: "#334155", lineHeight: 1.6
                        }}>
                          <span style={{ fontWeight: 600, color: j.color, fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>Strateji Notu</span>
                          <br />{j.note}
                        </div>

                        <div style={{ marginTop: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          <a href={j.url} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            style={{
                              fontSize: "12px", color: "#ffffff", textDecoration: "none",
                              display: "inline-flex", alignItems: "center", gap: "6px",
                              padding: "8px 16px", borderRadius: "8px",
                              background: j.color, border: `1px solid ${j.color}`, transition: "all 0.2s ease"
                            }}>
                            Dergiye Git →
                          </a>
                          <button
                            onClick={e => { e.stopPropagation(); setArticlePanelId(showArticles ? null : j.id); }}
                            style={{
                              fontSize: "12px", color: showArticles ? "#ffffff" : "#1e40af",
                              display: "inline-flex", alignItems: "center", gap: "6px",
                              padding: "8px 16px", borderRadius: "8px", cursor: "pointer",
                              background: showArticles ? "#1e40af" : "#eff6ff",
                              border: showArticles ? "1px solid #1e40af" : "1px solid #bfdbfe",
                              transition: "all 0.2s ease", fontFamily: "'DM Sans', sans-serif"
                            }}>
                            📄 {showArticles ? "Makaleleri Gizle" : "Makaleleri Keşfet"}
                          </button>
                        </div>

                        {showArticles && (
                          <ArticlePanel
                            journal={j}
                            onClose={() => setArticlePanelId(null)}
                            user={user}
                            firebaseReady={firebaseReady}
                            userArticles={userArticles}
                            onArticleAction={handleArticleAction}
                          />
                        )}
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
          </>
        )}

        {/* ═══════ LIBRARY TAB ═══════ */}
        {activeTab === "library" && (
          <div>
            {totalLibrary === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>📚</div>
                <div style={{ fontSize: "18px", fontWeight: 600, color: "#334155", marginBottom: "8px" }}>Kütüphaneniz boş</div>
                <div style={{ fontSize: "14px", color: "#64748b", maxWidth: "400px", margin: "0 auto", lineHeight: 1.6 }}>
                  Keşfet sekmesinden dergileri açın, makaleleri keşfet butonuna tıklayın ve beğendiğiniz makaleleri raflarınıza ekleyin.
                </div>
                <button onClick={() => setActiveTab("discover")} style={{
                  marginTop: "20px", padding: "10px 24px", borderRadius: "10px",
                  background: "#1e40af", color: "#ffffff", border: "none",
                  fontSize: "13px", fontWeight: 500, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif"
                }}>
                  🔬 Keşfetmeye Başla
                </button>
              </div>
            ) : (
              <div>
                {/* Reading stats */}
                <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
                  {Object.entries(SHELVES).map(([key, shelf]) => {
                    const count = libraryArticles[key]?.length || 0;
                    return (
                      <div key={key} style={{
                        flex: "1 1 150px", padding: "16px 20px", borderRadius: "12px",
                        background: "#ffffff", border: `1px solid ${shelf.color}30`,
                        display: "flex", alignItems: "center", gap: "12px"
                      }}>
                        <div style={{
                          width: "40px", height: "40px", borderRadius: "10px",
                          background: `${shelf.color}15`, display: "flex",
                          alignItems: "center", justifyContent: "center", fontSize: "20px"
                        }}>{shelf.icon}</div>
                        <div>
                          <div style={{ fontSize: "22px", fontWeight: 700, color: shelf.color }}>{count}</div>
                          <div style={{ fontSize: "12px", color: "#64748b" }}>{shelf.label}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Shelf sections */}
                {Object.entries(SHELVES).map(([key, shelf]) => {
                  const articles = libraryArticles[key];
                  if (!articles || articles.length === 0) return null;
                  return (
                    <div key={key} style={{ marginBottom: "28px" }}>
                      <div style={{
                        fontSize: "15px", fontWeight: 600, color: shelf.color,
                        marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px",
                        paddingBottom: "8px", borderBottom: `2px solid ${shelf.color}20`
                      }}>
                        {shelf.icon} {shelf.label}
                        <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 400 }}>({articles.length})</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {articles.map(art => (
                          <div key={art.id} style={{
                            padding: "14px 18px", borderRadius: "10px",
                            background: "#ffffff", border: "1px solid #e2e8f0",
                            display: "flex", alignItems: "center", gap: "12px",
                            transition: "border-color 0.2s"
                          }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = "#93c5fd"}
                            onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}
                          >
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: "14px", fontWeight: 500, color: "#0f172a", lineHeight: 1.4 }}>
                                {art.title}
                              </div>
                              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                                {art.authors} {art.journalAbbr && `· ${art.journalAbbr}`}
                              </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                              <StarRating
                                rating={art.rating || 0}
                                onRate={(r) => handleArticleAction(art.id, art, "rate", r)}
                                size={15}
                              />
                              <ShelfButton
                                compact
                                currentShelf={art.shelf}
                                onSetShelf={(s) => handleArticleAction(art.id, art, "shelf", s)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div style={{
          marginTop: "48px", paddingTop: "24px", borderTop: "1px solid #e2e8f0",
          fontSize: "11px", color: "#94a3b8", textAlign: "center", lineHeight: 1.8
        }}>
          IF değerleri 2024 JCR verilerine, quartile bilgileri Genetics &amp; Heredity kategorisine dayanmaktadır. Makale verileri PubMed ve CrossRef API'lerinden gerçek zamanlı olarak çekilmektedir.
          <br />Tıbbi Genetik Dergi Takip Rehberi — {journals.length} dergi
        </div>
      </div>

      {/* Modals */}
      {showProfile && user && (
        <ProfilePanel user={user} userArticles={userArticles} onClose={() => setShowProfile(false)} />
      )}
      {showCommunity && (
        <CommunityFeed firebaseReady={firebaseReady} onClose={() => setShowCommunity(false)} />
      )}
      {showSetupGuide && (
        <FirebaseSetupGuide onClose={() => setShowSetupGuide(false)} />
      )}
    </div>
  );
}
