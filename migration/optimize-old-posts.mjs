// One-time SEO pass over the migrated Azerbaijani posts: they came across with
// no Yoast meta description, no focus keyword and no excerpt. This sets a
// keyword-optimized Yoast title + meta description + focus keyword and an
// excerpt for each, resolved by slug. Content prose is left untouched here.
//
//   node migration/optimize-old-posts.mjs          # apply
//   node migration/optimize-old-posts.mjs --dry     # preview only
import fs from "node:fs";
import path from "node:path";

const BASE = "https://cms.kardio.az/wp-json/wp/v2";
const DRY = process.argv.includes("--dry");

function auth() {
  const env = fs.readFileSync(path.resolve("web/.env.local"), "utf8");
  const val = (k) => {
    const l = env.split(/\r?\n/).find((x) => x.startsWith(k));
    return l ? l.slice(k.length).replace(/^\s*=?\s*/, "").replace(/^"|"$/g, "").trim() : null;
  };
  const pass = (val("WP_MIGRATE_APP_PASSWORD") || "").replace(/\s+/g, "");
  return "Basic " + Buffer.from(`${val("WP_MIGRATE_USER")}:${pass}`).toString("base64");
}

// slug → SEO title, meta description (= excerpt), focus keyword.
const POSTS = [
  { slug: "hipertoniya-xesteliyi", fk: "hipertoniya",
    t: "Hipertoniya (yüksək qan təzyiqi): əlamətlər və müalicə",
    m: "Hipertoniya (yüksək qan təzyiqi) nədir, əlamətləri, təhlükələri və müalicəsi — kardioloq Dr. Kənan Əhmədovdan." },
  { slug: "urek-isemik-xestelikleri", fk: "ürək işemik xəstəliyi",
    t: "Ürəyin işemik xəstəliyi: əlamətlər və müalicə",
    m: "Ürəyin işemik (koronar) xəstəliyi nədir, əlamətləri, səbəbləri və müalicəsi — kardioloq Dr. Kənan Əhmədovdan." },
  { slug: "yuksek-qan-tezyiqi-hansi-hallarda-yaranir", fk: "yüksək qan təzyiqi səbəbləri",
    t: "Yüksək qan təzyiqi hansı hallarda yaranır?",
    m: "Yüksək qan təzyiqinin (hipertoniya) səbəbləri və risk faktorları — kardioloq Dr. Kənan Əhmədovdan izah." },
  { slug: "yuksek-qan-tezyiqinin-dermansiz-idare-olunmasinin-10-yolu", fk: "qan təzyiqini dərmansız endirmək",
    t: "Qan təzyiqini dərmansız endirməyin 10 yolu",
    m: "Yüksək qan təzyiqini dərmansız idarə etməyin 10 yolu — qidalanma, hərəkət, duz və stress. Kardioloq məsləhətləri." },
  { slug: "corablarim-ayaqlarima-iz-salib-asagi-etraf-odemleri-ne-sebebden-olur", fk: "ayaq ödemi",
    t: "Ayaqlarda ödem (şişkinlik): səbəbləri",
    m: "Ayaqlarda ödem (şişkinlik) nə üçün olur — ürək, damar və digər səbəblər. Nə zaman həkimə müraciət etməli." },
  { slug: "kalium-qan-tezyiqinin-enmesine-sebeb-olurmu", fk: "kalium qan təzyiqi",
    t: "Kalium qan təzyiqini endirirmi?",
    m: "Kaliumun qan təzyiqinə təsiri — hansı qidalarda var və ürək üçün əhəmiyyəti. Kardioloq Dr. Kənan Əhmədovdan." },
  { slug: "qan-tezyiqim-asagidir-hipotenziyani-mualice-etmek-lazimdirmi", fk: "hipotenziya",
    t: "Aşağı təzyiq (hipotenziya): müalicə lazımdırmı?",
    m: "Aşağı qan təzyiqi (hipotenziya) nə üçün olur, əlamətləri və nə zaman müalicə lazımdır — kardioloq izahı." },
  { slug: "nefesi-derinden-ala-bilmirem-da-kosta-sindromu", fk: "da kosta sindromu",
    t: "Da Kosta sindromu: nəfəs çatışmazlığı hissi",
    m: "Nəfəsi dərindən ala bilməmək və Da Kosta sindromu — səbəbləri və ürəklə əlaqəsi. Kardioloq Dr. Kənan Əhmədovdan." },
  { slug: "alkoqolun-ureye-tesiri", fk: "alkoqolun ürəyə təsiri",
    t: "Alkoqolun ürəyə təsiri: nə qədər təhlükəlidir?",
    m: "Alkoqol ürəyə necə təsir edir — ritm pozğunluğu, təzyiq və ürək əzələsi. Kardioloq Dr. Kənan Əhmədovdan izah." },
  { slug: "qanda-olan-hormonlarin-urek-xestelikleri-ile-elaqesi", fk: "hormonlar və ürək xəstəlikləri",
    t: "Hormonların ürək xəstəlikləri ilə əlaqəsi",
    m: "Qanda hormonların ürək-damar sağlamlığına təsiri — qalxanabənzər vəzi, stress hormonları və ürək. Kardioloq izahı." },
  { slug: "urek-xesteliklerinin-yaranmasinda-qadinlar-ve-kisiler-arasinda-ferqler-varmi", fk: "ürək xəstəliyi qadın kişi fərqi",
    t: "Ürək xəstəliyi: qadın və kişi arasında fərqlər",
    m: "Ürək xəstəlikləri qadınlarda və kişilərdə necə fərqlənir — əlamətlər, risklər və diaqnostika. Kardioloq izahı." },
  { slug: "yeni-il-qabagi-urek-xestelerine-qidalanma-ile-bagli-meslehetler", fk: "ürək xəstələri üçün qidalanma",
    t: "Ürək xəstələri üçün bayram qidalanma məsləhətləri",
    m: "Bayram süfrəsində ürək xəstələri üçün qidalanma məsləhətləri — duz, yağ və porsiya. Kardioloq tövsiyələri." },
  { slug: "valerian-korvalol-valokordin-bunlar-urek-dermanlaridirmi", fk: "valerian korvalol ürək",
    t: "Valerian, Korvalol, Valokordin ürək dərmanıdırmı?",
    m: "Valerian, Korvalol və Valokordin əslində ürək dərmanıdırmı? Kardioloqdan həqiqət və təhlükələr haqqında." },
  { slug: "infarkt-tek-urekde-olurmu", fk: "infarkt",
    t: "İnfarkt yalnız ürəkdə olurmu?",
    m: "İnfarkt nədir, yalnız ürəkdə olurmu, əlamətləri və təcili yardım. Kardioloq Dr. Kənan Əhmədovdan izah." },
  { slug: "urayim-bezen-vurur-bezen-yox", fk: "ekstrasistol",
    t: "Ürəyim bəzən vurur, bəzən yox: ekstrasistol",
    m: "Ürəyin 'atlaması' hissi (ekstrasistol) nə üçün olur, təhlükəlidirmi və nə zaman həkimə müraciət etməli." },
  { slug: "ureyime-oksigen-catmir", fk: "ürəyə oksigen çatmır",
    t: "Ürəyə oksigen çatmır: angina və işemiya",
    m: "Ürəyə oksigen çatmaması (angina) nə üçün olur, əlamətləri və müalicəsi. Kardioloq Dr. Kənan Əhmədovdan." },
  { slug: "ureyime-su-yigilib-eslinde-bu-ne-demekdir", fk: "ürəkdə su yığılması",
    t: "«Ürəyimə su yığılıb» — bu nə deməkdir?",
    m: "Ürək ətrafında maye yığılması (perikardial maye) nə deməkdir, səbəbləri və müalicəsi — kardioloq izahı." },
  { slug: "seliak-xesteliyiqluten-hessasligi-xesteliyi-ile-urek-xestelikleri-arasinda-ne-elaqe", fk: "seliak xəstəliyi və ürək",
    t: "Seliak xəstəliyi ilə ürək xəstəlikləri arasında əlaqə",
    m: "Seliak (qlüten həssaslığı) xəstəliyi ilə ürək-damar xəstəlikləri arasında əlaqə. Kardioloq Dr. Kənan Əhmədovdan." },
  { slug: "soyuq-icki-seyici-aritmiyaya-sebeb-ola-biler", fk: "soyuq içki ürək ritmi",
    t: "Soyuq içki səyici aritmiyaya səbəb ola bilər?",
    m: "Soyuq içki ürək ritmini poza bilərmi (səyici aritmiya)? Kardioloq Dr. Kənan Əhmədovdan izah." },
];

async function resolveId(a, slug) {
  const r = await fetch(`${BASE}/posts?slug=${encodeURIComponent(slug)}&status=any&_fields=id`, { headers: { "X-WP-Auth": a } });
  const j = await r.json();
  return Array.isArray(j) && j[0] ? j[0].id : null;
}

async function main() {
  const a = auth();
  let ok = 0, miss = 0;
  for (const p of POSTS) {
    const id = await resolveId(a, p.slug);
    if (!id) { console.log("MISS:", p.slug); miss++; continue; }
    if (DRY) { console.log("would set", id, p.slug, "→ fk:", p.fk); ok++; continue; }
    const r = await fetch(`${BASE}/posts/${id}`, {
      method: "POST",
      headers: { "X-WP-Auth": a, "Content-Type": "application/json" },
      body: JSON.stringify({
        excerpt: p.m,
        meta: { _yoast_wpseo_title: p.t, _yoast_wpseo_metadesc: p.m, _yoast_wpseo_focuskw: p.fk },
      }),
    });
    const j = await r.json();
    console.log(j.id ? `✓ ${id} ${p.slug} → ${p.fk}` : `FAIL ${p.slug} ${r.status}`);
    if (j.id) ok++;
  }
  console.log(`\nDone. ${ok} set, ${miss} missing.`);
}

main().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
