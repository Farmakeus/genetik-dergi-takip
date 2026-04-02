import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ──────────────────────────────────────────────
// JOURNAL DATA
// ──────────────────────────────────────────────
const DEFAULT_JOURNALS = [
  // === Q1 — IF > 6 ===
  { id: 1, name: "Nature Genetics", abbr: "Nat Genet", if2024: 31.7, quartile: "Q1", frequency: "Aylık", focus: "Genetik ve genomik — temel ve translasyonel", url: "https://www.nature.com/ng/", field: "Genomik", tags: ["temel", "genomik", "translasyonel"], color: "#C1121F", publisher: "Nature Portfolio", note: "En yüksek IF'li genetik dergisi. GWAS, fonksiyonel genomik ve yeni gen keşifleri.", openAccess: false },
  { id: 2, name: "Nature Reviews Genetics", abbr: "Nat Rev Genet", if2024: 39.1, quartile: "Q1", frequency: "Aylık", focus: "Genetik ve genomik alanında kapsamlı derleme makaleleri", url: "https://www.nature.com/nrg/", field: "Genomik", tags: ["temel", "genomik", "derleme"], color: "#9B1B30", publisher: "Nature Portfolio", note: "Alanın en prestijli review dergisi. Yeni kavram ve teknolojilerin kapsamlı değerlendirmesi.", openAccess: false },
  { id: 3, name: "Genome Research", abbr: "Genome Res", if2024: 6.2, quartile: "Q1", frequency: "Aylık", focus: "Genom analizi, fonksiyonel genomik, hesaplamalı biyoloji", url: "https://genome.cshlp.org/", field: "Genomik", tags: ["temel", "genomik", "hesaplamalı"], color: "#5B2C6F", publisher: "Cold Spring Harbor Laboratory Press", note: "Genom düzeyinde analizler, yeni sekanslama teknikleri ve büyük ölçekli veri çalışmaları.", openAccess: false },
  { id: 4, name: "Genome Medicine", abbr: "Genome Med", if2024: 10.4, quartile: "Q1", frequency: "Sürekli", focus: "Klinik genomik, WES/WGS, hassas tıp", url: "https://genomemedicine.biomedcentral.com/", field: "Klinik Genomik", tags: ["genomik", "translasyonel", "hesaplamalı"], color: "#0077B6", publisher: "BMC / Springer Nature", note: "WES/WGS klinik çalışmaları ve biyoinformatik pipeline makaleleri. Open access.", openAccess: true },
  { id: 5, name: "Genome Biology", abbr: "Genome Biol", if2024: 10.1, quartile: "Q1", frequency: "Sürekli", focus: "Genomik, epigenomik, transkriptomik, araç geliştirme", url: "https://genomebiology.biomedcentral.com/", field: "Genomik", tags: ["genomik", "hesaplamalı", "pipeline"], color: "#1A5276", publisher: "BMC / Springer Nature", note: "Yeni biyoinformatik araçlar ve büyük ölçekli -omik çalışmaları. Open access.", openAccess: true },
  { id: 6, name: "American Journal of Human Genetics", abbr: "AJHG", if2024: 8.1, quartile: "Q1", frequency: "Aylık", focus: "İnsan genetiği, genomik, hesaplamalı biyoloji", url: "https://www.cell.com/ajhg/home", field: "İnsan Genetiği", tags: ["temel", "genomik", "hesaplamalı"], color: "#1B4965", publisher: "Cell Press / ASHG", note: "ASHG'nin resmi dergisi. Popülasyon genetiğinden Mendelian hastalıklara kadar geniş kapsam.", openAccess: false },
  { id: 7, name: "Genetics in Medicine", abbr: "GIM", if2024: 6.6, quartile: "Q1", frequency: "Aylık", focus: "Klinik genetik, genetik test, genetik danışmanlık", url: "https://www.gimjournal.org/", field: "Klinik Genetik", tags: ["klinik", "test", "rehber"], color: "#2D6A4F", publisher: "ACMG / Elsevier", note: "ACMG'nin resmi dergisi. Klinik varyant yorumlama rehberleri burada yayımlanır.", openAccess: false },
  { id: 8, name: "Briefings in Bioinformatics", abbr: "Brief Bioinform", if2024: 6.8, quartile: "Q1", frequency: "2 ayda bir", focus: "Biyoinformatik pipeline'lar, araç geliştirme, veri analiz yöntemleri", url: "https://academic.oup.com/bib", field: "Biyoinformatik", tags: ["biyoinformatik", "hesaplamalı", "pipeline"], color: "#E63946", publisher: "Oxford University Press", note: "NGS pipeline karşılaştırma ve review makaleleri için en prestijli adres.", openAccess: false },
  { id: 9, name: "Nucleic Acids Research", abbr: "Nucleic Acids Res", if2024: 14.9, quartile: "Q1", frequency: "Haftalık", focus: "Nükleik asit araştırmaları, veritabanları, biyoinformatik araçlar", url: "https://academic.oup.com/nar", field: "Moleküler Genetik", tags: ["moleküler", "biyoinformatik", "pipeline"], color: "#D4AC0D", publisher: "Oxford University Press", note: "Database ve web-server özel sayıları biyoinformatik araçları için referans kaynağı.", openAccess: true },
  { id: 10, name: "Human Molecular Genetics", abbr: "Hum Mol Genet", if2024: 6.0, quartile: "Q1", frequency: "2 haftada bir", focus: "Moleküler genetik mekanizmalar, hastalık modelleri", url: "https://academic.oup.com/hmg", field: "Moleküler Genetik", tags: ["moleküler", "temel", "fonksiyonel"], color: "#6C3483", publisher: "Oxford University Press", note: "Hastalık mekanizmalarının moleküler düzeyde araştırılması, fare modelleri ve fonksiyonel çalışmalar.", openAccess: false },
  { id: 11, name: "The Pharmacogenomics Journal", abbr: "Pharmacogenomics J", if2024: 6.1, quartile: "Q1", frequency: "2 ayda bir", focus: "Farmakogenomik, ilaç yanıtı, kişiselleştirilmiş tıp", url: "https://www.nature.com/tpj/", field: "Farmakogenetik", tags: ["farmakogenetik", "translasyonel", "klinik"], color: "#117A65", publisher: "Nature Portfolio", note: "İlaç yanıtında genetik varyasyonlar ve kişiselleştirilmiş tedavi stratejileri.", openAccess: false },
  // === Q2 — IF 3–6 ===
  { id: 12, name: "European Journal of Human Genetics", abbr: "EJHG", if2024: 3.7, quartile: "Q2", frequency: "Aylık", focus: "Klinik genetik, sitogenetik, moleküler genetik", url: "https://www.nature.com/ejhg/", field: "Klinik Genetik", tags: ["klinik", "moleküler", "sitogenetik"], color: "#003566", publisher: "ESHG / Nature Portfolio", note: "Avrupa perspektifli klinik genetik. Türk genetikçilerin sık yayın yaptığı dergi.", openAccess: false },
  { id: 13, name: "Human Mutation / Human Genetics", abbr: "Hum Genet", if2024: 3.8, quartile: "Q2", frequency: "Aylık", focus: "Mutasyon analizi, varyant fonksiyonel çalışmaları", url: "https://link.springer.com/journal/439", field: "Moleküler Genetik", tags: ["moleküler", "varyant", "fonksiyonel"], color: "#7B2D8E", publisher: "Springer", note: "Varyant-fonksiyon ilişkisi ve in silico analiz çalışmaları için önemli.", openAccess: false },
  { id: 14, name: "Bioinformatics", abbr: "Bioinformatics", if2024: 4.4, quartile: "Q2", frequency: "2 haftada bir", focus: "Algoritma geliştirme, varyant çağırma, yazılım araçları", url: "https://academic.oup.com/bioinformatics", field: "Biyoinformatik", tags: ["biyoinformatik", "hesaplamalı", "pipeline", "varyant"], color: "#2A9D8F", publisher: "Oxford University Press", note: "GATK, ACMG otomasyon araçları, varyant sınıflandırma algoritmaları burada yayımlanır.", openAccess: false },
  { id: 15, name: "Human Genomics", abbr: "Hum Genomics", if2024: 3.8, quartile: "Q2", frequency: "Sürekli", focus: "Klinik biyoinformatik, WES/WGS analiz, varyant yorumlama", url: "https://humgenomics.biomedcentral.com/", field: "Klinik Genomik", tags: ["biyoinformatik", "genomik", "varyant", "klinik"], color: "#457B9D", publisher: "BMC / Springer Nature", note: "WES/WGS klinik biyoinformatik çalışmaları ve varyant filtreleme stratejileri. Open access.", openAccess: true },
  { id: 16, name: "Clinical Genetics", abbr: "Clin Genet", if2024: 3.2, quartile: "Q2", frequency: "Aylık", focus: "Klinik genetik, moleküler tanı, danışmanlık", url: "https://onlinelibrary.wiley.com/journal/13990004", field: "Klinik Genetik", tags: ["klinik", "moleküler", "test"], color: "#264653", publisher: "Wiley", note: "Kısa vaka raporları (Letter) formatı rezidanlar için hızlı yayın imkanı sunar.", openAccess: false },
  { id: 17, name: "Orphanet Journal of Rare Diseases", abbr: "OJRD", if2024: 3.4, quartile: "Q2", frequency: "Sürekli", focus: "Nadir hastalıklar, epidemiyoloji, tanı yolculuğu", url: "https://ojrd.biomedcentral.com/", field: "Nadir Hastalıklar", tags: ["klinik", "nadir", "translasyonel"], color: "#588157", publisher: "BMC / Springer Nature", note: "Nadir hastalık kohortları ve tanı gecikme süreleri analizleri. Open access.", openAccess: true },
  { id: 18, name: "Journal of Medical Genetics", abbr: "J Med Genet", if2024: 4.0, quartile: "Q2", frequency: "Aylık", focus: "Tıbbi genetik, genotip-fenotip korelasyonları", url: "https://jmg.bmj.com/", field: "Klinik Genetik", tags: ["klinik", "moleküler", "vaka"], color: "#1F618D", publisher: "BMJ", note: "Genotip-fenotip korelasyon çalışmaları ve yeni sendrom tanımlamaları.", openAccess: false },
  { id: 19, name: "Pharmacogenomics", abbr: "Pharmacogenomics", if2024: 3.1, quartile: "Q2", frequency: "Aylık", focus: "Farmakogenomik uygulamalar, ilaç metabolizması genetiği", url: "https://www.future-medicine.com/journal/pgs", field: "Farmakogenetik", tags: ["farmakogenetik", "klinik", "translasyonel"], color: "#148F77", publisher: "Future Medicine", note: "CYP enzim polimorfizmleri, ilaç doz ayarlama ve farmakogenetik klinik uygulamalar.", openAccess: false },
  { id: 20, name: "BMC Genomics", abbr: "BMC Genomics", if2024: 3.5, quartile: "Q2", frequency: "Sürekli", focus: "Genomik, transkriptomik, epigenomik, metagenomik", url: "https://bmcgenomics.biomedcentral.com/", field: "Genomik", tags: ["genomik", "hesaplamalı", "temel"], color: "#2E86C1", publisher: "BMC / Springer Nature", note: "Geniş kapsamlı genomik çalışmalar. Erişilebilir IF ve open access.", openAccess: true },
  { id: 21, name: "Molecular Genetics and Metabolism", abbr: "Mol Genet Metab", if2024: 3.6, quartile: "Q2", frequency: "Aylık", focus: "Kalıtsal metabolizma hastalıkları, enzim eksiklikleri, tedavi", url: "https://www.sciencedirect.com/journal/molecular-genetics-and-metabolism", field: "Metabolik Genetik", tags: ["metabolik", "klinik", "translasyonel"], color: "#D35400", publisher: "Elsevier", note: "IEM (Inborn Errors of Metabolism) için temel dergi. Yenidoğan tarama ve tedavi çalışmaları.", openAccess: false },
  { id: 22, name: "Cytogenetic and Genome Research", abbr: "Cytogenet Genome Res", if2024: 3.1, quartile: "Q2", frequency: "2 ayda bir", focus: "Sitogenetik, kromozom yapısı, genom organizasyonu", url: "https://karger.com/cgr", field: "Sitogenetik", tags: ["sitogenetik", "temel", "genomik"], color: "#7D3C98", publisher: "Karger", note: "Klasik sitogenetik ve modern moleküler sitogenetik (FISH, array CGH) çalışmaları.", openAccess: false },
  { id: 23, name: "Genes", abbr: "Genes", if2024: 3.5, quartile: "Q2", frequency: "Sürekli", focus: "Genetik, genomik, gen ifadesi, epigenetik", url: "https://www.mdpi.com/journal/genes", field: "Genomik", tags: ["temel", "genomik", "moleküler"], color: "#27AE60", publisher: "MDPI", note: "Geniş kapsamlı genetik/genomik çalışmalar. Hızlı hakem süreci ve open access.", openAccess: true },
  // === Q3 — IF 1.5–3 ===
  { id: 24, name: "American Journal of Medical Genetics Part A", abbr: "AJMG-A", if2024: 2.0, quartile: "Q3", frequency: "Aylık", focus: "Klinik genetik, dismorfik sendromlar, vaka raporları", url: "https://onlinelibrary.wiley.com/journal/15524833", field: "Klinik Genetik", tags: ["klinik", "dismorfik", "vaka"], color: "#6A040F", publisher: "Wiley", note: "Dismorfik sendrom vaka raporları için ana dergi. Rezidanlar için ideal ilk yayın hedefi.", openAccess: false },
  { id: 25, name: "Prenatal Diagnosis", abbr: "Prenat Diagn", if2024: 2.3, quartile: "Q3", frequency: "Aylık", focus: "Prenatal genetik tanı, NIPT, fetal tıp", url: "https://onlinelibrary.wiley.com/journal/10970223", field: "Prenatal Genetik", tags: ["prenatal", "klinik", "test"], color: "#E76F51", publisher: "Wiley", note: "NIPT, CVS/amniyosentez sonuçları ve prenatal array CGH çalışmaları.", openAccess: false },
  { id: 26, name: "Journal of Genetic Counseling", abbr: "J Genet Couns", if2024: 2.1, quartile: "Q3", frequency: "2 ayda bir", focus: "Genetik danışmanlık, psikososyal araştırma, hasta iletişimi", url: "https://onlinelibrary.wiley.com/journal/15733599", field: "Genetik Danışmanlık", tags: ["klinik", "danışmanlık", "psikososyal"], color: "#AF7AC5", publisher: "Wiley / NSGC", note: "Genetik danışmanlık pratiği ve araştırması. NSGC'nin resmi dergisi.", openAccess: false },
  { id: 27, name: "Molecular Cytogenetics", abbr: "Mol Cytogenet", if2024: 2.0, quartile: "Q3", frequency: "Sürekli", focus: "Moleküler sitogenetik, array CGH, FISH, kromozom analizi", url: "https://molecularcytogenetics.biomedcentral.com/", field: "Sitogenetik", tags: ["sitogenetik", "moleküler", "klinik"], color: "#C0392B", publisher: "BMC / Springer Nature", note: "Array CGH, FISH ve kromozomal mikrodelesyon/mikroduplikasyon vaka raporları. Open access.", openAccess: true },
  { id: 28, name: "BMC Medical Genetics / BMC Medical Genomics", abbr: "BMC Med Genomics", if2024: 2.7, quartile: "Q3", frequency: "Sürekli", focus: "Tıbbi genetik, klinik genomik, vaka serileri", url: "https://bmcmedgenomics.biomedcentral.com/", field: "Klinik Genomik", tags: ["klinik", "genomik", "vaka"], color: "#2980B9", publisher: "BMC / Springer Nature", note: "Klinik WES/WGS vaka raporları ve küçük kohort çalışmaları. Open access.", openAccess: true },
  { id: 29, name: "European Journal of Medical Genetics", abbr: "Eur J Med Genet", if2024: 2.2, quartile: "Q3", frequency: "2 ayda bir", focus: "Gelişimsel genetik, dismorfik sendromlar, konjenital anomaliler", url: "https://www.sciencedirect.com/journal/european-journal-of-medical-genetics", field: "Klinik Genetik", tags: ["klinik", "dismorfik", "vaka"], color: "#1ABC9C", publisher: "Elsevier", note: "Avrupa perspektifli klinik genetik vaka serileri ve genotip-fenotip çalışmaları.", openAccess: false },
  { id: 30, name: "Journal of Human Genetics", abbr: "J Hum Genet", if2024: 2.9, quartile: "Q3", frequency: "Aylık", focus: "İnsan genetiği, popülasyon genetiği, hastalık genleri", url: "https://www.nature.com/jhg/", field: "İnsan Genetiği", tags: ["temel", "genomik", "moleküler"], color: "#E74C3C", publisher: "Nature Portfolio / JHS", note: "Asya perspektifli insan genetiği. Popülasyon spesifik varyantlar ve hastalık çalışmaları.", openAccess: false },
  { id: 31, name: "Genetic Testing and Molecular Biomarkers", abbr: "Genet Test Mol Biomarkers", if2024: 1.7, quartile: "Q3", frequency: "Aylık", focus: "Genetik test validasyonu, moleküler biyobelirteçler", url: "https://www.liebertpub.com/journal/gtmb", field: "Genetik Test", tags: ["test", "moleküler", "klinik"], color: "#F39C12", publisher: "Mary Ann Liebert", note: "Genetik test yöntemlerinin validasyonu ve yeni moleküler biyobelirteç keşifleri.", openAccess: false },
  { id: 32, name: "Gene", abbr: "Gene", if2024: 2.6, quartile: "Q3", frequency: "Haftalık", focus: "Gen yapısı, ifadesi, düzenlenmesi, evrim", url: "https://www.sciencedirect.com/journal/gene", field: "Moleküler Genetik", tags: ["temel", "moleküler", "fonksiyonel"], color: "#16A085", publisher: "Elsevier", note: "Geniş kapsamlı moleküler genetik çalışmalar. Yüksek kabul oranı.", openAccess: false },
  // === Q4 — IF < 1.5 ===
  { id: 33, name: "Molecular Syndromology", abbr: "Mol Syndromol", if2024: 1.4, quartile: "Q4", frequency: "2 ayda bir", focus: "Sendromik hastalıklar, dismorfik fenotip, gelişimsel bozukluklar", url: "https://karger.com/msy", field: "Klinik Genetik", tags: ["klinik", "dismorfik", "vaka"], color: "#95A5A6", publisher: "Karger", note: "Nadir sendromların fenotip-genotip tanımlaması. Vaka raporları için erişilebilir hedef.", openAccess: false },
  { id: 34, name: "Balkan Journal of Medical Genetics", abbr: "Balkan J Med Genet", if2024: 0.8, quartile: "Q4", frequency: "2 yılda bir", focus: "Balkan bölgesi genetik çalışmaları, popülasyon genetiği", url: "https://sciendo.com/journal/BJMG", field: "İnsan Genetiği", tags: ["klinik", "temel", "vaka"], color: "#7F8C8D", publisher: "Sciendo", note: "Bölgesel genetik çalışmalar. Türk araştırmacılar için erişilebilir yayın hedefi.", openAccess: false },
  { id: 35, name: "Journal of Community Genetics", abbr: "J Community Genet", if2024: 1.3, quartile: "Q4", frequency: "Sürekli", focus: "Toplum genetiği, taşıyıcı tarama, halk sağlığı genetiği", url: "https://link.springer.com/journal/12687", field: "Genetik Danışmanlık", tags: ["klinik", "danışmanlık", "halk sağlığı"], color: "#AEB6BF", publisher: "Springer", note: "Toplum tabanlı genetik tarama ve genetik danışmanlık araştırmaları.", openAccess: true },
  // === Kullanıcı tarafından eklenen ===
  { id: 36, name: "The Journal of Molecular Diagnostics", abbr: "J Mol Diagn", if2024: 3.4, quartile: "Q2", frequency: "2 ayda bir", focus: "Moleküler tanı, moleküler patoloji, klinik moleküler testler", url: "https://www.sciencedirect.com/journal/the-journal-of-molecular-diagnostics", field: "Genetik Test", tags: ["moleküler", "test", "klinik", "translasyonel"], color: "#8B5CF6", publisher: "Elsevier / AMP", note: "Association for Molecular Pathology'nin resmi dergisi. Moleküler tanı yöntemleri, NGS validasyonu, klinik laboratuvar uygulamaları ve yeni moleküler test geliştirme çalışmaları.", openAccess: false },
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
const periodLabels = { month: "Bu Ay", year: "Bu Yıl (2026)", last3years: "Son 3 Yıl", alltime: "Tüm Zamanlar" };

const READING_STATUSES = {
  okunacak: { label: "Okunacak", icon: "📋", color: "#F59E0B" },
  okunuyor: { label: "Okunuyor", icon: "📖", color: "#3B82F6" },
  okundu: { label: "Okundu", icon: "✓", color: "#22C55E" },
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
  "The Journal of Molecular Diagnostics": { ta: "J Mol Diagn", issn: "1525-1578" },
};

// ──────────────────────────────────────────────
// WIZARD DATA
// ──────────────────────────────────────────────
const wizardSteps = [
  {
    id: "researchType",
    question: "Araştırma tipiniz nedir?",
    options: [
      { value: "case_report", label: "Vaka Raporu", desc: "Tekil veya seri vaka sunumu" },
      { value: "original", label: "Özgün Araştırma", desc: "Orijinal klinik veya laboratuvar çalışması" },
      { value: "review", label: "Derleme", desc: "Sistematik veya anlatımsal derleme" },
      { value: "meta_analysis", label: "Meta-Analiz", desc: "Birden fazla çalışmanın istatistiksel sentezi" },
      { value: "letter", label: "Editöre Mektup", desc: "Kısa iletişim, yorum veya teknik not" },
      { value: "method", label: "Yöntem / Pipeline", desc: "Biyoinformatik araç veya analiz yöntemi" },
    ]
  },
  {
    id: "subspecialty",
    question: "Alt uzmanlık alanınız?",
    options: researchFields.map(f => ({ value: f, label: f, desc: "" }))
  },
  {
    id: "careerStage",
    question: "Kariyer aşamanız?",
    options: [
      { value: "resident", label: "Asistan (Uzmanlık Öğrencisi)", desc: "İlk yayın deneyimi" },
      { value: "fellow", label: "Fellow / Yan Dal", desc: "Uzmanlaşma dönemi" },
      { value: "assistant_prof", label: "Dr. Öğr. Üyesi", desc: "Akademik kariyer başlangıcı" },
      { value: "associate_prof", label: "Doçent", desc: "Orta kariyer" },
      { value: "professor", label: "Profesör", desc: "İleri kariyer" },
    ]
  },
  {
    id: "openAccess",
    question: "Açık erişim gerekli mi?",
    options: [
      { value: "required", label: "Evet, şart", desc: "Sadece açık erişim dergiler" },
      { value: "preferred", label: "Tercih ederim", desc: "Açık erişim avantajlı" },
      { value: "no", label: "Önemli değil", desc: "Tüm dergiler olabilir" },
    ]
  },
  {
    id: "targetIF",
    question: "Hedef IF aralığı?",
    options: [
      { value: "high", label: "IF > 6 (Q1)", desc: "En prestijli dergiler" },
      { value: "mid", label: "IF 3-6 (Q2)", desc: "Güçlü orta seviye" },
      { value: "accessible", label: "IF 1.5-3 (Q3)", desc: "Erişilebilir dergiler" },
      { value: "entry", label: "IF < 1.5 (Q4)", desc: "Giriş seviyesi" },
      { value: "any", label: "Farketmez", desc: "IF önemli değil" },
    ]
  },
];

function scoreJournal(journal, answers) {
  let score = 0;
  let maxScore = 0;

  // Research type (30%)
  maxScore += 30;
  const typeTagMap = {
    case_report: ["vaka", "dismorfik", "klinik"],
    original: ["temel", "moleküler", "genomik", "klinik"],
    review: ["derleme"],
    meta_analysis: ["hesaplamalı", "klinik"],
    letter: ["vaka", "klinik"],
    method: ["biyoinformatik", "pipeline", "hesaplamalı"],
  };
  const typeTags = typeTagMap[answers.researchType] || [];
  const typeMatch = typeTags.filter(t => journal.tags.includes(t)).length;
  if (typeMatch > 0) score += Math.min(30, (typeMatch / typeTags.length) * 30);

  // Case report bonus for specific journals
  if (answers.researchType === "case_report") {
    if (journal.note.toLowerCase().includes("vaka rapor") || journal.note.toLowerCase().includes("rezidan")) score += 10;
  }
  if (answers.researchType === "review" && journal.tags.includes("derleme")) score += 10;
  if (answers.researchType === "method" && (journal.tags.includes("pipeline") || journal.tags.includes("biyoinformatik"))) score += 10;

  // Subspecialty (25%)
  maxScore += 25;
  if (answers.subspecialty) {
    if (journal.field === answers.subspecialty) score += 25;
    else {
      const fieldTags = {
        "Genomik": ["genomik"], "Klinik Genetik": ["klinik"], "Klinik Genomik": ["genomik", "klinik"],
        "Moleküler Genetik": ["moleküler"], "Biyoinformatik": ["biyoinformatik", "hesaplamalı"],
        "İnsan Genetiği": ["temel", "genomik"], "Sitogenetik": ["sitogenetik"],
        "Nadir Hastalıklar": ["nadir"], "Prenatal Genetik": ["prenatal"],
        "Farmakogenetik": ["farmakogenetik"], "Metabolik Genetik": ["metabolik"],
        "Genetik Danışmanlık": ["danışmanlık"], "Genetik Test": ["test"],
      };
      const fTags = fieldTags[answers.subspecialty] || [];
      const fMatch = fTags.filter(t => journal.tags.includes(t)).length;
      if (fMatch > 0) score += (fMatch / fTags.length) * 15;
    }
  }

  // Career stage (15%)
  maxScore += 15;
  const stageQuartileMap = {
    resident: ["Q3", "Q4"],
    fellow: ["Q2", "Q3"],
    assistant_prof: ["Q1", "Q2"],
    associate_prof: ["Q1", "Q2"],
    professor: ["Q1"],
  };
  const preferredQ = stageQuartileMap[answers.careerStage] || [];
  if (preferredQ.includes(journal.quartile)) score += 15;
  else if (answers.careerStage === "resident" && journal.quartile === "Q2") score += 8;
  else if (answers.careerStage === "professor" && journal.quartile === "Q2") score += 8;

  // Open access (15%)
  maxScore += 15;
  if (answers.openAccess === "required") {
    if (journal.openAccess) score += 15;
  } else if (answers.openAccess === "preferred") {
    if (journal.openAccess) score += 15;
    else score += 8;
  } else {
    score += 12;
  }

  // IF range (15%)
  maxScore += 15;
  const ifRanges = {
    high: [6, 100], mid: [3, 6], accessible: [1.5, 3], entry: [0, 1.5], any: [0, 100],
  };
  const range = ifRanges[answers.targetIF] || [0, 100];
  if (journal.if2024 >= range[0] && journal.if2024 <= range[1]) score += 15;
  else {
    const dist = Math.min(Math.abs(journal.if2024 - range[0]), Math.abs(journal.if2024 - range[1]));
    score += Math.max(0, 15 - dist * 2);
  }

  return Math.min(100, Math.round((score / maxScore) * 100));
}

function getWizardReasoning(journal, answers) {
  const reasons = [];
  if (journal.field === answers.subspecialty) reasons.push(`${answers.subspecialty} alanında doğrudan hedef dergi`);
  if (answers.researchType === "case_report" && journal.note.toLowerCase().includes("vaka")) reasons.push("Vaka raporları için uygun");
  if (answers.researchType === "method" && journal.tags.includes("pipeline")) reasons.push("Biyoinformatik araç/pipeline yayınları kabul ediyor");
  if (answers.researchType === "review" && journal.tags.includes("derleme")) reasons.push("Derleme makaleleri yayımlayan dergi");
  if (journal.openAccess && answers.openAccess !== "no") reasons.push("Açık erişim");
  if (answers.careerStage === "resident" && journal.note.toLowerCase().includes("rezidan")) reasons.push("Rezidanlar için ideal ilk yayın hedefi");
  if (journal.note.toLowerCase().includes("türk")) reasons.push("Türk araştırmacıların sık yayın yaptığı dergi");
  if (reasons.length === 0) reasons.push(`IF ${journal.if2024} · ${journal.quartile} · ${journal.field}`);
  return reasons.join(". ") + ".";
}

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
  if (period === "last3years") {
    const y = now.getFullYear();
    return { mindate: `${y - 3}/01/01`, maxdate: `${y}/12/31` };
  }
  // alltime — last 10 years
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
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");
  const articleNodes = xmlDoc.querySelectorAll("PubmedArticle");
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
  const sort = (period === "alltime" || period === "last3years") ? "relevance" : "pub+date";

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

  const sort = (period === "alltime" || period === "last3years") ? "is-referenced-by-count" : "published";
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
// READING LIST BUTTON COMPONENT
// ──────────────────────────────────────────────
function ReadingListButton({ articleKey, readingList, setReadingList, artData }) {
  const [open, setOpen] = useState(false);
  const current = readingList[articleKey];

  const setStatus = (status) => {
    setReadingList(prev => {
      if (!status) {
        const next = { ...prev };
        delete next[articleKey];
        return next;
      }
      return { ...prev, [articleKey]: { ...artData, status, notes: prev[articleKey]?.notes || "", addedAt: prev[articleKey]?.addedAt || Date.now(), updatedAt: Date.now() } };
    });
    setOpen(false);
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(!open); }}
        style={{
          fontSize: "11px", padding: "4px 10px", borderRadius: "8px",
          border: current ? `1px solid ${READING_STATUSES[current.status].color}` : "1px solid #cbd5e1",
          background: current ? `${READING_STATUSES[current.status].color}15` : "#ffffff",
          color: current ? READING_STATUSES[current.status].color : "#64748b",
          cursor: "pointer", fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
          display: "flex", alignItems: "center", gap: "6px", transition: "all 0.15s"
        }}
      >
        {current ? `${READING_STATUSES[current.status].icon} ${READING_STATUSES[current.status].label}` : "📚 Listeye Ekle"}
        <span style={{ fontSize: "8px" }}>▾</span>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, marginTop: "4px",
          background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 100, minWidth: "170px", overflow: "hidden"
        }}>
          {Object.entries(READING_STATUSES).map(([key, s]) => (
            <button key={key}
              onClick={e => { e.stopPropagation(); setStatus(current?.status === key ? null : key); }}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                width: "100%", padding: "10px 14px", border: "none",
                background: current?.status === key ? `${s.color}10` : "transparent",
                color: current?.status === key ? s.color : "#334155",
                fontSize: "13px", cursor: "pointer", textAlign: "left",
                fontFamily: "'DM Sans', sans-serif",
                borderLeft: current?.status === key ? `3px solid ${s.color}` : "3px solid transparent",
                transition: "all 0.1s"
              }}
              onMouseEnter={e => { if (current?.status !== key) e.currentTarget.style.background = "#f8fafc"; }}
              onMouseLeave={e => { if (current?.status !== key) e.currentTarget.style.background = "transparent"; }}
            >
              <span>{s.icon}</span>
              <span style={{ fontWeight: 500 }}>{s.label}</span>
              {current?.status === key && <span style={{ marginLeft: "auto", fontSize: "14px" }}>✓</span>}
            </button>
          ))}
          {current && (
            <button
              onClick={e => { e.stopPropagation(); setStatus(null); }}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                width: "100%", padding: "10px 14px", border: "none",
                borderTop: "1px solid #f1f5f9",
                background: "transparent", color: "#EF4444",
                fontSize: "12px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif"
              }}
            >
              ✕ Listeden Kaldır
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// ARTICLE NOTES COMPONENT
// ──────────────────────────────────────────────
function ArticleNotes({ articleKey, readingList, setReadingList }) {
  const [editing, setEditing] = useState(false);
  const current = readingList[articleKey];
  if (!current) return null;

  return (
    <div style={{ marginTop: "6px" }}>
      {!editing ? (
        <button onClick={e => { e.stopPropagation(); setEditing(true); }}
          style={{
            fontSize: "11px", color: current.notes ? "#475569" : "#94a3b8",
            background: "none", border: "none", cursor: "pointer", padding: "2px 0",
            fontFamily: "'DM Sans', sans-serif", fontStyle: current.notes ? "normal" : "italic"
          }}
        >
          {current.notes ? `📝 ${current.notes.slice(0, 60)}${current.notes.length > 60 ? "..." : ""}` : "📝 Not ekle..."}
        </button>
      ) : (
        <div style={{ display: "flex", gap: "6px" }} onClick={e => e.stopPropagation()}>
          <textarea
            autoFocus
            value={current.notes || ""}
            onChange={e => {
              const notes = e.target.value;
              setReadingList(prev => ({ ...prev, [articleKey]: { ...prev[articleKey], notes, updatedAt: Date.now() } }));
            }}
            placeholder="Kişisel notunuz..."
            style={{
              flex: 1, padding: "6px 10px", borderRadius: "6px",
              border: "1px solid #93c5fd", background: "#f8fafc",
              fontSize: "12px", color: "#334155", resize: "vertical",
              minHeight: "40px", fontFamily: "'DM Sans', sans-serif", outline: "none"
            }}
          />
          <button onClick={() => setEditing(false)} style={{
            padding: "6px 10px", borderRadius: "6px", border: "none",
            background: "#1e40af", color: "#fff", fontSize: "11px",
            cursor: "pointer", fontFamily: "'DM Sans', sans-serif", alignSelf: "flex-end"
          }}>Tamam</button>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// ARTICLE PANEL
// ──────────────────────────────────────────────
function ArticlePanel({ journal, onClose, readingList, setReadingList }) {
  const [period, setPeriod] = useState("month");
  const [articles, setArticles] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedAbstract, setExpandedAbstract] = useState(null);
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

  const getArticleKey = (art) => {
    if (art.doi) return art.doi.replace(/[./]/g, "_");
    if (art.pmid) return `pmid_${art.pmid}`;
    return `hash_${btoa(art.title.slice(0, 60)).replace(/[^a-zA-Z0-9]/g, "")}`;
  };

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

      {!loading && currentArticles.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "70vh", overflowY: "auto", paddingRight: "4px" }}>
          {currentArticles.map((art, i) => {
            const isAbstractOpen = expandedAbstract === i;
            const artKey = getArticleKey(art);

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

                    {/* Reading list + Abstract toggle */}
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", marginBottom: "4px" }}>
                      <ReadingListButton
                        articleKey={artKey}
                        readingList={readingList}
                        setReadingList={setReadingList}
                        artData={{ title: art.title, authors: art.authors, journalAbbr: journal.abbr, doi: art.doi, pmid: art.pmid, year: art.year }}
                      />
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
                    </div>

                    <ArticleNotes articleKey={artKey} readingList={readingList} setReadingList={setReadingList} />

                    {isAbstractOpen && art.abstract && (
                      <div style={{
                        fontSize: "12px", color: "#334155", lineHeight: 1.7,
                        padding: "10px 12px", borderRadius: "8px",
                        background: "#f1f5f9", border: "1px solid #e2e8f0",
                        marginTop: "6px", marginBottom: "6px", whiteSpace: "pre-wrap"
                      }}>
                        {art.abstract}
                      </div>
                    )}

                    {!art.abstract && (
                      <div style={{ fontSize: "11px", color: "#94a3b8", fontStyle: "italic", marginBottom: "4px" }}>
                        Abstract mevcut değil
                      </div>
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
// WIZARD COMPONENT
// ──────────────────────────────────────────────
function JournalWizard({ journals }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const currentStep = wizardSteps[step];
  const progress = ((step + 1) / wizardSteps.length) * 100;

  const selectOption = (value) => {
    const newAnswers = { ...answers, [currentStep.id]: value };
    setAnswers(newAnswers);
    if (step < wizardSteps.length - 1) {
      setStep(step + 1);
    } else {
      setShowResults(true);
    }
  };

  const results = useMemo(() => {
    if (!showResults) return [];
    return journals
      .map(j => ({ ...j, score: scoreJournal(j, answers) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [showResults, answers]);

  const reset = () => {
    setStep(0);
    setAnswers({});
    setShowResults(false);
  };

  if (showResults) {
    return (
      <div>
        <div style={{
          background: "linear-gradient(135deg, #1e3a8a, #7c3aed)", borderRadius: "16px",
          padding: "28px 32px", color: "#ffffff", marginBottom: "20px"
        }}>
          <div style={{ fontSize: "22px", fontWeight: 600, marginBottom: "6px" }}>Size Uygun Dergiler</div>
          <div style={{ fontSize: "13px", opacity: 0.8, marginBottom: "16px" }}>
            Cevaplarınıza göre en uygun 5 dergi
          </div>
          <button onClick={reset} style={{
            padding: "8px 18px", borderRadius: "8px",
            background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)",
            color: "#ffffff", fontSize: "12px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif"
          }}>
            Tekrar Dene
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {results.map((j, i) => (
            <div key={j.id} style={{
              background: "#ffffff", borderRadius: "14px", padding: "20px 24px",
              border: "1px solid #e2e8f0", display: "flex", gap: "16px", alignItems: "flex-start",
              transition: "border-color 0.2s"
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#93c5fd"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}
            >
              <div style={{
                width: "48px", height: "48px", borderRadius: "12px", flexShrink: 0,
                background: `linear-gradient(135deg, ${j.color}20, ${j.color}40)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "18px", fontWeight: 800, color: j.color
              }}>#{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
                  <span style={{ fontSize: "16px", fontWeight: 600, color: "#0f172a" }}>{j.name}</span>
                  <span style={{
                    fontSize: "11px", padding: "2px 8px", borderRadius: "6px",
                    background: j.score >= 70 ? "#dcfce7" : j.score >= 50 ? "#fef3c7" : "#fee2e2",
                    color: j.score >= 70 ? "#166534" : j.score >= 50 ? "#92400e" : "#991b1b",
                    fontWeight: 700
                  }}>%{j.score} uyum</span>
                </div>
                <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px" }}>
                  {j.abbr} · IF {j.if2024} · {j.quartile} · {j.field}
                  {j.openAccess && <span style={{ color: "#22C55E", fontWeight: 600 }}> · OA</span>}
                </div>
                <div style={{
                  fontSize: "12px", color: "#475569", lineHeight: 1.5,
                  padding: "8px 12px", borderRadius: "8px", background: "#f8fafc",
                  borderLeft: `3px solid ${j.color}`
                }}>
                  {getWizardReasoning(j, answers)}
                </div>
                <div style={{ marginTop: "8px" }}>
                  <a href={j.url} target="_blank" rel="noopener noreferrer"
                    style={{
                      fontSize: "12px", color: "#ffffff", textDecoration: "none",
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      padding: "6px 14px", borderRadius: "6px",
                      background: j.color, transition: "opacity 0.2s"
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  >
                    Dergiye Git →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Progress */}
      <div style={{
        background: "linear-gradient(135deg, #1e3a8a, #7c3aed)", borderRadius: "16px",
        padding: "28px 32px", color: "#ffffff", marginBottom: "24px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ fontSize: "22px", fontWeight: 600 }}>Dergi Seçim Wizard'ı</div>
          <div style={{ fontSize: "13px", opacity: 0.8 }}>Adım {step + 1} / {wizardSteps.length}</div>
        </div>
        <div style={{ height: "4px", borderRadius: "2px", background: "rgba(255,255,255,0.2)" }}>
          <div style={{ height: "100%", borderRadius: "2px", background: "#ffffff", width: `${progress}%`, transition: "width 0.3s ease" }} />
        </div>
      </div>

      {/* Question */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "20px", fontWeight: 600, color: "#0f172a", marginBottom: "16px" }}>
          {currentStep.question}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
          {currentStep.options.map(opt => (
            <button key={opt.value} onClick={() => selectOption(opt.value)}
              style={{
                padding: "16px 20px", borderRadius: "12px", border: "1px solid",
                borderColor: answers[currentStep.id] === opt.value ? "#1e40af" : "#e2e8f0",
                background: answers[currentStep.id] === opt.value ? "#eff6ff" : "#ffffff",
                color: "#0f172a", cursor: "pointer", textAlign: "left",
                transition: "all 0.15s", fontFamily: "'DM Sans', sans-serif"
              }}
              onMouseEnter={e => { if (answers[currentStep.id] !== opt.value) e.currentTarget.style.borderColor = "#93c5fd"; }}
              onMouseLeave={e => { if (answers[currentStep.id] !== opt.value) e.currentTarget.style.borderColor = "#e2e8f0"; }}
            >
              <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "2px" }}>{opt.label}</div>
              {opt.desc && <div style={{ fontSize: "12px", color: "#64748b" }}>{opt.desc}</div>}
            </button>
          ))}
        </div>
      </div>

      {/* Back button */}
      {step > 0 && (
        <button onClick={() => setStep(step - 1)} style={{
          padding: "8px 18px", borderRadius: "8px",
          background: "transparent", border: "1px solid #cbd5e1",
          color: "#64748b", fontSize: "12px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif"
        }}>
          ← Geri
        </button>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// READING LIST PANEL
// ──────────────────────────────────────────────
function ReadingListPanel({ readingList, setReadingList }) {
  const grouped = useMemo(() => {
    const result = { okunacak: [], okunuyor: [], okundu: [] };
    Object.entries(readingList).forEach(([id, art]) => {
      if (art.status && result[art.status]) {
        result[art.status].push({ id, ...art });
      }
    });
    Object.keys(result).forEach(key => {
      result[key].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    });
    return result;
  }, [readingList]);

  const total = Object.values(grouped).reduce((s, arr) => s + arr.length, 0);

  if (total === 0) return null;

  return (
    <div style={{
      marginBottom: "20px", padding: "16px 20px", borderRadius: "12px",
      background: "#ffffff", border: "1px solid #e2e8f0"
    }}>
      <div style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
        📚 Okuma Listem
      </div>
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        {Object.entries(READING_STATUSES).map(([key, s]) => {
          const count = grouped[key]?.length || 0;
          return (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "14px" }}>{s.icon}</span>
              <span style={{ fontSize: "13px", color: "#334155" }}>{s.label}:</span>
              <span style={{ fontSize: "13px", fontWeight: 700, color: s.color }}>{count}</span>
            </div>
          );
        })}
      </div>
      {/* Recent items */}
      {Object.entries(READING_STATUSES).map(([key, s]) => {
        const items = grouped[key];
        if (!items || items.length === 0) return null;
        return (
          <div key={key} style={{ marginTop: "12px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: s.color, marginBottom: "6px" }}>{s.icon} {s.label} ({items.length})</div>
            {items.slice(0, 3).map(art => (
              <div key={art.id} style={{
                padding: "8px 12px", borderRadius: "8px",
                background: "#f8fafc", marginBottom: "4px",
                display: "flex", alignItems: "center", gap: "10px"
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "12px", fontWeight: 500, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {art.title}
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>
                    {art.authors} {art.journalAbbr && `· ${art.journalAbbr}`}
                  </div>
                  {art.notes && <div style={{ fontSize: "11px", color: "#94a3b8", fontStyle: "italic", marginTop: "2px" }}>📝 {art.notes.slice(0, 50)}{art.notes.length > 50 ? "..." : ""}</div>}
                </div>
                <button onClick={() => setReadingList(prev => { const next = { ...prev }; delete next[art.id]; return next; })}
                  style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "12px", flexShrink: 0 }}>✕</button>
              </div>
            ))}
            {items.length > 3 && <div style={{ fontSize: "11px", color: "#94a3b8", paddingLeft: "12px" }}>+{items.length - 3} daha</div>}
          </div>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────
// OPENALEX JOURNAL SEARCH
// ──────────────────────────────────────────────
async function searchOpenAlex(query) {
  if (!query || query.trim().length < 2) return [];
  const url = `https://api.openalex.org/sources?search=${encodeURIComponent(query.trim())}&filter=type:journal&per_page=12&select=id,display_name,alternate_titles,abbreviated_title,issn,host_organization_name,homepage_url,type,is_oa,works_count,cited_by_count,summary_stats,topics`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "mailto:research@genetik-dergi-takip.app" } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map(src => {
      const hIndex = src.summary_stats?.h_index || 0;
      const citedBy = src.cited_by_count || 0;
      const worksCount = src.works_count || 0;
      // Approximate IF from cited_by_count / works_count (2-year window not available, use rough ratio)
      const approxIF = worksCount > 0 ? Math.round((citedBy / worksCount) * 10) / 10 : 0;
      // Estimate quartile from h-index
      const estQuartile = hIndex >= 150 ? "Q1" : hIndex >= 60 ? "Q2" : hIndex >= 25 ? "Q3" : "Q4";
      // Extract top topics/concepts for field detection
      const topTopics = (src.topics || []).slice(0, 5).map(t => t.display_name);

      return {
        openAlexId: src.id,
        name: src.display_name || "",
        abbr: src.abbreviated_title || src.display_name?.split(" ").map(w => w[0]).join("") || "",
        issn: src.issn?.[0] || "",
        publisher: src.host_organization_name || "",
        url: src.homepage_url || "",
        isOA: src.is_oa || false,
        worksCount,
        citedBy,
        hIndex,
        approxIF,
        estQuartile,
        topTopics,
      };
    });
  } catch (e) {
    console.error("OpenAlex search error:", e);
    return [];
  }
}

function guessFieldFromTopics(topics) {
  const topicStr = (topics || []).join(" ").toLowerCase();
  if (topicStr.includes("bioinformatic") || topicStr.includes("computational")) return "Biyoinformatik";
  if (topicStr.includes("pharmacogen") || topicStr.includes("pharmacol")) return "Farmakogenetik";
  if (topicStr.includes("prenatal") || topicStr.includes("fetal")) return "Prenatal Genetik";
  if (topicStr.includes("cytogenet") || topicStr.includes("chromosome")) return "Sitogenetik";
  if (topicStr.includes("rare disease") || topicStr.includes("orphan")) return "Nadir Hastalıklar";
  if (topicStr.includes("metabol")) return "Metabolik Genetik";
  if (topicStr.includes("counsel")) return "Genetik Danışmanlık";
  if (topicStr.includes("genomic") || topicStr.includes("genome")) return "Genomik";
  if (topicStr.includes("molecular")) return "Moleküler Genetik";
  if (topicStr.includes("clinical") || topicStr.includes("medical")) return "Klinik Genetik";
  if (topicStr.includes("human genet")) return "İnsan Genetiği";
  return "Klinik Genetik";
}

// ──────────────────────────────────────────────
// ADD JOURNAL FORM (with OpenAlex search)
// ──────────────────────────────────────────────
function AddJournalForm({ onAdd, onClose, existingNames }) {
  const [mode, setMode] = useState("search"); // "search" | "manual" | "edit"
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const searchTimeout = useRef(null);

  const [form, setForm] = useState({
    name: "", abbr: "", if2024: "", quartile: "Q2", frequency: "Aylık",
    focus: "", url: "", field: "Klinik Genetik", tags: [],
    publisher: "", note: "", openAccess: false
  });
  const [error, setError] = useState("");

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const toggleFormTag = (tag) => setForm(prev => ({
    ...prev, tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
  }));

  // Debounced OpenAlex search
  const doSearch = useCallback((q) => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!q || q.trim().length < 2) { setSearchResults([]); setSearching(false); return; }
    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      const results = await searchOpenAlex(q);
      setSearchResults(results);
      setSearching(false);
    }, 400);
  }, []);

  const handleSearchInput = (val) => {
    setSearchQuery(val);
    doSearch(val);
  };

  const selectSearchResult = (result) => {
    setSelectedResult(result);
    setForm({
      name: result.name,
      abbr: result.abbr,
      if2024: result.approxIF > 0 ? String(result.approxIF) : "",
      quartile: result.estQuartile,
      frequency: "Aylık",
      focus: result.topTopics.slice(0, 3).join(", "),
      url: result.url,
      field: guessFieldFromTopics(result.topTopics),
      tags: [],
      publisher: result.publisher,
      note: `h-index: ${result.hIndex} · ${result.worksCount.toLocaleString()} makale · ${result.citedBy.toLocaleString()} atıf`,
      openAccess: result.isOA,
    });
    setMode("edit");
    setError("");
  };

  const handleSubmit = () => {
    if (!form.name.trim()) { setError("Dergi adı gerekli."); return; }
    if (existingNames.some(n => n.toLowerCase() === form.name.trim().toLowerCase())) { setError("Bu dergi zaten listende mevcut."); return; }
    if (!form.abbr.trim()) { setError("Kısaltma gerekli."); return; }
    const ifVal = parseFloat(form.if2024);
    if (isNaN(ifVal) || ifVal < 0) { setError("Geçerli bir IF değeri girin."); return; }
    onAdd({
      ...form,
      name: form.name.trim(),
      abbr: form.abbr.trim(),
      if2024: ifVal,
      focus: form.focus.trim(),
      url: form.url.trim(),
      publisher: form.publisher.trim(),
      note: form.note.trim(),
      id: `custom_${Date.now()}`,
      color: ["#C1121F", "#0077B6", "#2D6A4F", "#5B2C6F", "#E63946", "#1B4965", "#D35400", "#7D3C98", "#2A9D8F", "#6A040F"][Math.floor(Math.random() * 10)],
      isCustom: true,
      issn: selectedResult?.issn || "",
    });
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: "8px",
    border: "1px solid #cbd5e1", background: "#ffffff",
    color: "#1e293b", fontSize: "13px", outline: "none",
    fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box"
  };
  const labelStyle = { fontSize: "11px", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px", display: "block" };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
    }} onClick={onClose}>
      <div style={{
        background: "#ffffff", borderRadius: "16px", padding: "28px 32px",
        maxWidth: "600px", width: "100%", maxHeight: "85vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#0f172a", margin: 0 }}>
            {mode === "search" ? "🔍 Dergi Ara" : mode === "edit" ? "📝 Dergi Bilgilerini Düzenle" : "➕ Manuel Dergi Ekle"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#94a3b8" }}>✕</button>
        </div>

        {error && <div style={{ padding: "10px 14px", borderRadius: "8px", background: "#fee2e2", color: "#dc2626", fontSize: "12px", marginBottom: "14px" }}>{error}</div>}

        {/* ─── SEARCH MODE ─── */}
        {mode === "search" && (
          <>
            <div style={{ position: "relative", marginBottom: "16px" }}>
              <input
                autoFocus
                value={searchQuery}
                onChange={e => handleSearchInput(e.target.value)}
                placeholder="Dergi adı yazın... (ör: Nature Genetics, Lancet, EJHG)"
                style={{ ...inputStyle, paddingRight: "40px", fontSize: "14px", padding: "12px 16px" }}
              />
              {searching && (
                <div style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "14px" }}>
                  ⏳
                </div>
              )}
            </div>

            {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
              <div style={{ textAlign: "center", padding: "20px", color: "#94a3b8", fontSize: "13px" }}>
                Sonuç bulunamadı. Manuel eklemek için aşağıdaki butonu kullanın.
              </div>
            )}

            {searchResults.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "8px" }}>
                  {searchResults.length} dergi bulundu — OpenAlex
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "400px", overflowY: "auto" }}>
                  {searchResults.map((r, i) => {
                    const alreadyExists = existingNames.some(n => n.toLowerCase() === r.name.toLowerCase());
                    return (
                      <button key={r.openAlexId || i}
                        onClick={() => !alreadyExists && selectSearchResult(r)}
                        disabled={alreadyExists}
                        style={{
                          padding: "12px 16px", borderRadius: "10px", border: "1px solid #e2e8f0",
                          background: alreadyExists ? "#f8fafc" : "#ffffff", cursor: alreadyExists ? "not-allowed" : "pointer",
                          textAlign: "left", fontFamily: "'DM Sans', sans-serif",
                          transition: "all 0.15s", opacity: alreadyExists ? 0.5 : 1,
                          display: "flex", gap: "12px", alignItems: "center"
                        }}
                        onMouseEnter={e => { if (!alreadyExists) e.currentTarget.style.borderColor = "#93c5fd"; }}
                        onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}
                      >
                        <div style={{
                          width: "40px", height: "40px", borderRadius: "10px", flexShrink: 0,
                          background: `${quartileInfo[r.estQuartile].bg}15`,
                          border: `1px solid ${quartileInfo[r.estQuartile].bg}30`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "11px", fontWeight: 700, color: quartileInfo[r.estQuartile].bg
                        }}>{r.estQuartile}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "#0f172a", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                            {r.name}
                            {r.isOA && <span style={{ fontSize: "9px", padding: "1px 6px", borderRadius: "4px", background: "#dcfce7", color: "#166534", fontWeight: 600 }}>OA</span>}
                            {alreadyExists && <span style={{ fontSize: "9px", padding: "1px 6px", borderRadius: "4px", background: "#fee2e2", color: "#dc2626", fontWeight: 600 }}>Mevcut</span>}
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                            {r.publisher}{r.publisher && " · "}h-index: {r.hIndex} · {r.worksCount.toLocaleString()} makale
                          </div>
                          {r.topTopics.length > 0 && (
                            <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "2px" }}>
                              {r.topTopics.slice(0, 3).join(", ")}
                            </div>
                          )}
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontSize: "16px", fontWeight: 700, color: quartileInfo[r.estQuartile].bg }}>
                            {r.approxIF > 0 ? r.approxIF : "—"}
                          </div>
                          <div style={{ fontSize: "9px", color: "#94a3b8" }}>~IF</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "14px", display: "flex", justifyContent: "center" }}>
              <button onClick={() => setMode("manual")} style={{
                padding: "8px 18px", borderRadius: "8px", border: "1px solid #cbd5e1",
                background: "#ffffff", color: "#64748b", fontSize: "12px", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif"
              }}>
                ✏️ Manuel olarak ekle
              </button>
            </div>
          </>
        )}

        {/* ─── EDIT / MANUAL MODE ─── */}
        {(mode === "edit" || mode === "manual") && (
          <>
            {mode === "edit" && selectedResult && (
              <div style={{
                padding: "10px 14px", borderRadius: "8px", background: "#eff6ff",
                border: "1px solid #bfdbfe", fontSize: "12px", color: "#1e40af", marginBottom: "14px",
                display: "flex", alignItems: "center", gap: "8px"
              }}>
                <span>🔗</span> OpenAlex'ten alındı — bilgileri düzenleyip ekleyebilirsiniz
                <button onClick={() => { setMode("search"); setSelectedResult(null); }}
                  style={{ marginLeft: "auto", background: "none", border: "none", color: "#1e40af", cursor: "pointer", fontSize: "12px", textDecoration: "underline" }}>
                  Farklı dergi ara
                </button>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Dergi Adı *</label>
                <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Nature Genetics" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Kısaltma *</label>
                <input value={form.abbr} onChange={e => set("abbr", e.target.value)} placeholder="Nat Genet" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Impact Factor *</label>
                <input value={form.if2024} onChange={e => set("if2024", e.target.value)} placeholder="6.5" type="number" step="0.1" min="0" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Quartile</label>
                <select value={form.quartile} onChange={e => set("quartile", e.target.value)} style={inputStyle}>
                  {["Q1", "Q2", "Q3", "Q4"].map(q => <option key={q} value={q}>{q} — {quartileInfo[q].desc}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Alan</label>
                <select value={form.field} onChange={e => set("field", e.target.value)} style={inputStyle}>
                  {researchFields.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Odak / Kapsam</label>
                <input value={form.focus} onChange={e => set("focus", e.target.value)} placeholder="Klinik genetik, moleküler tanı..." style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Yayıncı</label>
                <input value={form.publisher} onChange={e => set("publisher", e.target.value)} placeholder="Elsevier" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Yayın Sıklığı</label>
                <select value={form.frequency} onChange={e => set("frequency", e.target.value)} style={inputStyle}>
                  {["Haftalık", "2 haftada bir", "Aylık", "2 ayda bir", "Sürekli"].map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>URL</label>
                <input value={form.url} onChange={e => set("url", e.target.value)} placeholder="https://..." style={inputStyle} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Strateji Notu</label>
                <textarea value={form.note} onChange={e => set("note", e.target.value)} placeholder="Bu dergi hakkında notunuz..."
                  style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Etiketler</label>
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                  {allTags.map(tag => (
                    <button key={tag} onClick={() => toggleFormTag(tag)} style={{
                      padding: "3px 10px", borderRadius: "6px", fontSize: "11px",
                      border: "1px solid", borderColor: form.tags.includes(tag) ? "#1e40af" : "#cbd5e1",
                      background: form.tags.includes(tag) ? "#1e40af" : "#ffffff",
                      color: form.tags.includes(tag) ? "#ffffff" : "#64748b",
                      cursor: "pointer", textTransform: "capitalize"
                    }}>{tag}</button>
                  ))}
                </div>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input type="checkbox" checked={form.openAccess} onChange={e => set("openAccess", e.target.checked)} />
                  <span style={{ fontSize: "13px", color: "#334155" }}>Açık Erişim (Open Access)</span>
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "16px" }}>
              <button onClick={() => { setMode("search"); setError(""); }} style={{
                padding: "10px 20px", borderRadius: "8px", border: "1px solid #cbd5e1",
                background: "#ffffff", color: "#64748b", fontSize: "13px", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif"
              }}>← Geri</button>
              <button onClick={handleSubmit} style={{
                padding: "10px 20px", borderRadius: "8px", border: "none",
                background: "#1e40af", color: "#ffffff", fontSize: "13px", cursor: "pointer",
                fontWeight: 600, fontFamily: "'DM Sans', sans-serif"
              }}>Dergi Ekle</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────
export default function GenetikDergiTakip() {
  const [selectedQuartiles, setSelectedQuartiles] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [search, setSearch] = useState("");
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("genetik_bookmarks") || "[]"); } catch { return []; }
  });
  const [expandedId, setExpandedId] = useState(null);
  const [articlePanelId, setArticlePanelId] = useState(null);
  const [sortBy, setSortBy] = useState("quartile");
  const [ifRange, setIfRange] = useState([0, 50]);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("discover");
  const [showAddJournal, setShowAddJournal] = useState(false);

  const [readingList, setReadingList] = useState(() => {
    try { return JSON.parse(localStorage.getItem("genetik_reading_list") || "{}"); } catch { return {}; }
  });

  const [customJournals, setCustomJournals] = useState(() => {
    try { return JSON.parse(localStorage.getItem("genetik_custom_journals") || "[]"); } catch { return []; }
  });

  const [removedJournalIds, setRemovedJournalIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem("genetik_removed_journals") || "[]"); } catch { return []; }
  });

  const journals = useMemo(() => {
    const kept = DEFAULT_JOURNALS.filter(j => !removedJournalIds.includes(j.id));
    return [...kept, ...customJournals];
  }, [customJournals, removedJournalIds]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    localStorage.setItem("genetik_bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem("genetik_reading_list", JSON.stringify(readingList));
  }, [readingList]);

  useEffect(() => {
    localStorage.setItem("genetik_custom_journals", JSON.stringify(customJournals));
  }, [customJournals]);

  useEffect(() => {
    localStorage.setItem("genetik_removed_journals", JSON.stringify(removedJournalIds));
  }, [removedJournalIds]);

  const addJournal = (journal) => {
    setCustomJournals(prev => [...prev, journal]);
    setShowAddJournal(false);
  };

  const removeJournal = (id) => {
    if (typeof id === "string" && id.startsWith("custom_")) {
      setCustomJournals(prev => prev.filter(j => j.id !== id));
    } else {
      setRemovedJournalIds(prev => [...prev, id]);
    }
    setBookmarks(prev => prev.filter(b => b !== id));
    if (expandedId === id) setExpandedId(null);
    if (articlePanelId === id) setArticlePanelId(null);
  };

  const restoreJournal = (id) => {
    setRemovedJournalIds(prev => prev.filter(rid => rid !== id));
  };

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

  const readingListTotal = Object.keys(readingList).length;

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
              Kişisel araştırma asistanı — dergi keşfi, makale takibi ve akıllı dergi seçimi.
            </p>
          </div>

          {/* Tab navigation */}
          <div style={{ display: "flex", gap: "4px", marginTop: "16px" }}>
            {[
              { key: "discover", label: "Keşfet", icon: "🔬", count: journals.length },
              { key: "wizard", label: "Dergi Wizard", icon: "🧭", count: null },
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
                {tab.count != null && (
                  <span style={{
                    fontSize: "10px", padding: "1px 6px", borderRadius: "10px",
                    background: activeTab === tab.key ? "#eff6ff" : "rgba(255,255,255,0.15)",
                    color: activeTab === tab.key ? "#1e40af" : "rgba(255,255,255,0.7)"
                  }}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "24px 32px 60px", position: "relative", zIndex: 1 }}>

        {/* ═══════ DISCOVER TAB ═══════ */}
        {activeTab === "discover" && (
          <>
            <ReadingListPanel readingList={readingList} setReadingList={setReadingList} />

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

            {/* Search + Sort + Add */}
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
              <button onClick={() => setShowAddJournal(true)} style={{
                padding: "10px 18px", borderRadius: "10px", border: "none",
                background: "#1e40af", color: "#ffffff", fontSize: "13px",
                cursor: "pointer", fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap"
              }}>
                ➕ Dergi Ekle
              </button>
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
                          {j.openAccess && <span style={{ fontSize: "9px", padding: "1px 6px", borderRadius: "4px", background: "#dcfce7", color: "#166534", fontWeight: 600 }}>OA</span>}
                          {j.isCustom && <span style={{ fontSize: "9px", padding: "1px 6px", borderRadius: "4px", background: "#ede9fe", color: "#6d28d9", fontWeight: 600 }}>Özel</span>}
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

                      <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                        <button onClick={e => { e.stopPropagation(); toggleBookmark(j.id); }} style={{
                          width: "32px", height: "32px", borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                          background: isBookmarked ? "#fef3c7" : "transparent",
                          color: isBookmarked ? "#d97706" : "#94a3b8",
                          cursor: "pointer", fontSize: "16px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.2s ease"
                        }}>{isBookmarked ? "★" : "☆"}</button>
                        <button onClick={e => { e.stopPropagation(); if (window.confirm(`"${j.name}" dergisini listeden kaldırmak istediğinize emin misiniz?`)) removeJournal(j.id); }} style={{
                          width: "32px", height: "32px", borderRadius: "8px",
                          border: "1px solid #fecaca",
                          background: "transparent", color: "#ef4444",
                          cursor: "pointer", fontSize: "14px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.2s ease", opacity: 0.5
                        }}
                          onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                          onMouseLeave={e => e.currentTarget.style.opacity = "0.5"}
                          title="Dergiyi kaldır"
                        >✕</button>
                      </div>
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
                            readingList={readingList}
                            setReadingList={setReadingList}
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

            {/* Removed journals restore */}
            {removedJournalIds.length > 0 && (
              <div style={{
                marginTop: "24px", padding: "14px 18px", borderRadius: "12px",
                background: "#fff7ed", border: "1px solid #fed7aa"
              }}>
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#9a3412", marginBottom: "8px" }}>
                  Kaldırılan Dergiler ({removedJournalIds.length})
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {removedJournalIds.map(id => {
                    const j = DEFAULT_JOURNALS.find(dj => dj.id === id);
                    if (!j) return null;
                    return (
                      <button key={id} onClick={() => restoreJournal(id)} style={{
                        padding: "4px 12px", borderRadius: "6px", fontSize: "11px",
                        border: "1px solid #fdba74", background: "#ffffff", color: "#9a3412",
                        cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                        display: "flex", alignItems: "center", gap: "4px"
                      }}>
                        ↩ {j.abbr}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {showAddJournal && (
              <AddJournalForm
                onAdd={addJournal}
                onClose={() => setShowAddJournal(false)}
                existingNames={journals.map(j => j.name)}
              />
            )}
          </>
        )}

        {/* ═══════ WIZARD TAB ═══════ */}
        {activeTab === "wizard" && (
          <JournalWizard journals={journals} />
        )}

        <div style={{
          marginTop: "48px", paddingTop: "24px", borderTop: "1px solid #e2e8f0",
          fontSize: "11px", color: "#94a3b8", textAlign: "center", lineHeight: 1.8
        }}>
          IF değerleri 2024 JCR verilerine, quartile bilgileri Genetics &amp; Heredity kategorisine dayanmaktadır. Makale verileri PubMed ve CrossRef API'lerinden gerçek zamanlı olarak çekilmektedir.
          <br />Tıbbi Genetik Dergi Takip Rehberi — {journals.length} dergi · Kişisel Araştırma Asistanı
        </div>
      </div>
    </div>
  );
}
