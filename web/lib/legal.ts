/**
 * Legal / policy page content (Azerbaijani). Source of truth for the full drafts
 * is /legal/*.md at the repo root. These are DRAFTS — a qualified AZ lawyer must
 * review before go-live (PROJECT-PLAN.md §14.9 / §15).
 */

export interface LegalSection {
  heading?: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalDoc {
  slug: string;
  title: string;
  metaDescription: string;
  intro: string;
  sections: LegalSection[];
}

const EMERGENCY_NOTE =
  "Bu xidmət təcili tibbi yardım üçün nəzərdə tutulmayıb. Həyati təhlükə zamanı dərhal 103-ə zəng edin.";

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: "tibbi-bildiris",
    title: "Tibbi bildiriş",
    metaDescription:
      "kardio.az saytındakı məzmun ümumi maarifləndirmə xarakteri daşıyır və peşəkar tibbi məsləhəti əvəz etmir.",
    intro:
      "kardio.az saytındakı məzmun yalnız ümumi məlumatlandırma və maarifləndirmə məqsədi daşıyır. Bu məzmun peşəkar tibbi məsləhəti, diaqnozu və ya müalicəni əvəz etmir.",
    sections: [
      {
        heading: "Əsas prinsiplər",
        paragraphs: [],
        bullets: [
          "Saytdakı məlumat əsasında öz-özünə diaqnoz qoymayın və müalicə təyin etməyin.",
          "Sağlamlığınızla bağlı hər sual üçün ixtisaslı həkimə müraciət edin.",
          "Həkim tövsiyəsini saytda oxuduğunuz məlumat səbəbindən təxirə salmayın.",
        ],
      },
      {
        heading: "Onlayn konsultasiya",
        paragraphs: [
          "Onlayn video konsultasiya üzbəüz (fiziki) müayinəni tam əvəz etmir.",
        ],
      },
      { heading: "Təcili hallar", paragraphs: [EMERGENCY_NOTE] },
    ],
  },
  {
    slug: "teletibb-razaliq",
    title: "Teletibb üçün məlumatlandırılmış razılıq",
    metaDescription:
      "Onlayn video konsultasiya (teletibb) xidmətinin mahiyyəti, imkanları və məhdudiyyətləri barədə razılıq.",
    intro:
      "Bu sənəd onlayn video konsultasiya (teletibb) xidmətinin mahiyyətini, imkanlarını və məhdudiyyətlərini izah edir. Randevu təsdiq etməklə siz bunları oxuduğunuzu və razı olduğunuzu təsdiqləyirsiniz.",
    sections: [
      {
        heading: "Teletibbin mahiyyəti",
        paragraphs: [],
        bullets: [
          "Konsultasiya real vaxtda video və çat vasitəsilə aparılır.",
          "Zərurət olduqda sənəd/şəkilləri sessiya ərzində paylaşa bilərsiniz.",
          "Konsultasiya yazılmır (video/audio qeydi aparılmır).",
        ],
      },
      {
        heading: "Məhdudiyyətlər",
        paragraphs: [
          "Onlayn konsultasiya üzbəüz müayinəni tam əvəz etmir. Həkim zərurət gördükdə sizi üzbəüz müayinəyə yönləndirə bilər. Texniki səbəblərdən (internet, səs/görüntü) konsultasiya təsirlənə bilər.",
        ],
      },
      { heading: "Təcili hallar", paragraphs: [EMERGENCY_NOTE] },
      {
        heading: "Fərdi məlumatlar",
        paragraphs: [
          "Konsultasiyanın məzmunu (video, çat, fayllar) qeydə alınmır və saxlanmır — sessiya bitdikdə itir. Əlaqə məlumatlarınız (ad, mobil nömrə, e-poçt) isə randevu tarixçəniz üçün saxlanılır. Ətraflı: Məxfilik siyasəti.",
        ],
      },
    ],
  },
  {
    slug: "mexfilik-siyaseti",
    title: "Məxfilik siyasəti",
    metaDescription:
      "kardio.az fərdi məlumatların qorunması siyasəti — Azərbaycan Respublikasının 'Şəxsi məlumatlar haqqında' Qanununa uyğun.",
    intro:
      "Fərdi məlumatlarınızın qorunması bizim üçün önəmlidir. Bu siyasət hansı məlumatları, hansı məqsədlə topladığımızı və necə qoruduğumuzu izah edir. Əsas: Azərbaycan Respublikasının 'Şəxsi məlumatlar haqqında' Qanunu.",
    sections: [
      {
        heading: "Hansı məlumatları toplayırıq",
        paragraphs: [
          "Biz minimum məlumat prinsipini tətbiq edirik. Onlayn konsultasiya üçün yalnız ad və soyadınız, mobil nömrəniz, e-poçt ünvanınız və seçdiyiniz randevu vaxtı toplanır.",
          "Bu məlumatlar sizi tanımaq, randevunu təsdiqləmək və zərurət yaranarsa (məsələn, texniki problem və ya vaxt dəyişikliyi) sizinlə əlaqə saxlamaq üçündür. Ünvan, şəxsiyyət vəsiqəsi və ya ödəniş məlumatı tələb olunmur.",
        ],
      },
      {
        heading: "Saxlama müddəti",
        paragraphs: [
          "Randevunun təfərrüatları (seçilmiş vaxt, status) konsultasiya tamamlandıqdan sonra avtomatik silinir. Konsultasiyanın məzmunu (çat, fayllar, video) ümumiyyətlə qeydə alınmır və saxlanmır.",
          "Ad və soyadınız, mobil nömrəniz, e-poçt ünvanınız və görüş sayınız pasiyent siyahımızda saxlanılır ki, təkrar müraciət etdikdə sizi tanıya bilək və müraciət tarixçənizi görək. Bu məlumat siz silinmə tələb edənə qədər saxlanılır.",
        ],
      },
      {
        heading: "Sağlamlıq məlumatı",
        paragraphs: [
          "Konsultasiya zamanı paylaşdığınız sağlamlıq məlumatı xüsusi kateqoriyalı fərdi məlumatdır və yalnız sizin açıq razılığınızla, sessiya ərzində emal olunur.",
        ],
      },
      {
        heading: "Sizin hüquqlarınız",
        paragraphs: [
          "Məlumatınıza çıxış, düzəliş və ya silinmə tələb edə, razılığı geri götürə bilərsiniz. Müraciətlərə 30 gün ərzində cavab verilir.",
        ],
      },
    ],
  },
  {
    slug: "istifade-sertleri",
    title: "İstifadə şərtləri",
    metaDescription:
      "kardio.az saytından və onlayn konsultasiya xidmətindən istifadə şərtləri.",
    intro:
      "Bu şərtlər kardio.az saytından və onlayn konsultasiya xidmətindən istifadəni tənzimləyir. Saytdan istifadə etməklə bu şərtləri qəbul etmiş olursunuz.",
    sections: [
      {
        heading: "İstifadəçinin öhdəlikləri",
        paragraphs: [],
        bullets: [
          "Randevu zamanı doğru və özünüzə aid məlumat təqdim etmək.",
          "Xidmətdən yalnız qanuni məqsədlərlə istifadə etmək.",
          "Konsultasiya prosesini pozmamaq.",
        ],
      },
      {
        heading: "Məsuliyyətin məhdudlaşdırılması",
        paragraphs: [
          "Xidmət texniki səbəblərdən müvəqqəti əlçatmaz ola bilər. Onlayn konsultasiya üzbəüz müayinənin əvəzi deyil.",
        ],
      },
      {
        heading: "Tətbiq olunan qanunvericilik",
        paragraphs: ["Bu şərtlərə Azərbaycan Respublikasının qanunvericiliyi tətbiq olunur."],
      },
    ],
  },
  {
    slug: "kuki-siyaseti",
    title: "Kuki siyasəti",
    metaDescription: "kardio.az saytında kuki (cookie) istifadəsi barədə məlumat.",
    intro:
      "Kuki (cookie) sayta daxil olduqda cihazınızda saxlanan kiçik mətn faylıdır. Saytın işləməsi və istifadə statistikası üçün istifadə olunur.",
    sections: [
      {
        heading: "Kuki növləri",
        paragraphs: [],
        bullets: [
          "Zəruri kukilər — saytın işləməsi üçün vacibdir, razılıq tələb etmir.",
          "Analitik kukilər — anonim statistika (razılıq tələb olunur).",
        ],
      },
      {
        heading: "Razılığın idarəsi",
        paragraphs: [
          "Sayta ilk daxil olduqda analitik kukiləri qəbul və ya rədd edə bilərsiniz. Qeyri-zəruri kukilər siz razılıq verməyənə qədər aktiv olmur.",
        ],
      },
    ],
  },
  {
    slug: "randevu-siyaseti",
    title: "Randevu və ləğvetmə siyasəti",
    metaDescription:
      "Onlayn randevunun yaradılması, təsdiqi, ləğvi və vaxtının dəyişdirilməsi qaydaları.",
    intro:
      "Bu siyasət onlayn randevunun yaradılması, təsdiqi, ləğvi və vaxtının dəyişdirilməsini tənzimləyir.",
    sections: [
      {
        heading: "Randevunun yaradılması",
        paragraphs: [
          "Həkim əvvəlcədən 30 dəqiqəlik boş vaxtlar açır. Slot seçdikdən sonra e-poçtunuza təsdiq linki göndərilir; təsdiqdən sonra randevu sizin adınıza bron olunur. Təsdiq təxminən 15 dəqiqə ərzində edilməzsə, slot avtomatik azad olur.",
        ],
      },
      {
        heading: "Vaxtlar",
        paragraphs: ["Bütün vaxtlar Azərbaycan vaxtı (UTC+4) ilə göstərilir."],
      },
      {
        heading: "Ləğvetmə və vaxt dəyişmə",
        paragraphs: [
          "Randevunu təsdiq e-poçtundakı unikal ləğvetmə linki ilə ləğv edə və ya başqa boş vaxta keçirə bilərsiniz. Zərurət olduqda həkim də randevunu ləğv edə bilər; bu halda sizə e-poçt ilə məlumat verilir.",
        ],
      },
    ],
  },
];

export function getLegalDoc(slug: string): LegalDoc | undefined {
  return LEGAL_DOCS.find((d) => d.slug === slug);
}
