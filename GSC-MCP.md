# Search Console → Claude Code (MCP)

Bir dəfə qurulur. Bundan sonra Claude `kardio.az`-ın sorğularını, kliklərini,
göstərilmə saylarını və indeksləmə vəziyyətini birbaşa oxuya bilir — heç bir
CSV ixracı lazım deyil.

Konfiqurasiya artıq yazılıb: [`.mcp.json`](.mcp.json). Yalnız açar faylı çatmır.

## Sizin edəcəkləriniz

### 1. `kardio.az` Search Console-da təsdiqlənib?

[search.google.com/search-console](https://search.google.com/search-console) →
property siyahısına baxın. Yoxdursa, əvvəlcə əlavə edin:

- **Domain** tipini seçin (`kardio.az`), DNS TXT qeydi tələb edir — Hostinger
  DNS zonasına əlavə olunur. Bu variant `www`, `cms` və hər iki protokolu birdən
  tutur, ona görə üstünlük verilir.
- Alternativ: **URL prefix** (`https://kardio.az/`) — HTML faylı və ya meta teq
  ilə təsdiqlənir, daha sadədir, amma yalnız o bir ünvanı əhatə edir.

Hansını seçdiyinizi mənə deyin, `siteUrl` formatı ona görə dəyişir
(`sc-domain:kardio.az` və ya `https://kardio.az/`).

### 2. Google Cloud-da servis hesabı

1. [console.cloud.google.com](https://console.cloud.google.com/) → yeni layihə
   yaradın (ad: `kardio-seo` kifayətdir).
2. **APIs & Services ▸ Library** → "Search Console API" tapın → **Enable**.
3. **APIs & Services ▸ Credentials** → **Create credentials ▸ Service account**.
   Ad: `claude-gsc`. Rol seçmək lazım deyil, boş buraxın.
4. Yaradılan hesaba klikləyin → **Keys ▸ Add key ▸ Create new key ▸ JSON**.
   Fayl avtomatik enir.
5. Hesabın e-poçtunu köçürün — `claude-gsc@kardio-seo.iam.gserviceaccount.com`
   formatındadır.

### 3. Servis hesabına Search Console-da icazə verin

Search Console → `kardio.az` property → **Settings ▸ Users and permissions ▸
Add user** → yuxarıdakı e-poçtu yapışdırın → səlahiyyət: **Full**.

> `Restricted` da işləyir (oxumaq üçün kifayətdir), amma indeksləmə sorğusu
> göndərmək lazım olsa `Full` gərəkdir.

### 4. Açar faylını yerinə qoyun

Endirdiyiniz JSON faylını bu yola köçürün və **tam bu adla** adlandırın:

```
C:\Users\User\.secrets\kardio-gsc.json
```

Qovluq yoxdursa yaradın. **Fayl layihə qovluğuna qoyulmamalıdır** — orada
qalsa git-ə düşmə riski var. `.gitignore`-a əlavə qorunma da yazılıb.

### 5. Claude Code-u yenidən başladın

`.mcp.json` yalnız sessiya başlayanda oxunur. Yenidən açanda Claude MCP
serverini təsdiqləməyinizi istəyəcək — təsdiqləyin.

## Bilməli olduğunuz iki şey

- **`mcp-server-gsc` üçüncü tərəf paketidir** (MIT, npm). Servis hesabının açarı
  ona verilir, yəni Search Console datanıza oxu icazəsi olur. Paketin
  GitHub repo linki npm-də göstərilmir. Buna görə versiya `0.3.0`-a bağlanıb —
  avtomatik yenilənmir. Bu risk sizə uyğun deyilsə, deyin, eyni işi görən
  kiçik bir server layihə daxilində özüm yazaram.
- **Servis hesabının açarı paroldur.** Kimsə onu ələ keçirsə, Search Console
  datanızı oxuya bilər (sayta yazma icazəsi vermir). İtirsəniz, Google
  Cloud-dan həmin açarı silin və yenisini yaradın.

## Qoşulandan sonra nə edəcəyik

1. Son 12 ayın sorğularını çıxarırıq — hansı açar sözlərdə göstərilirsiniz.
2. **Gap analizi**: göstərilmə var, klik yoxdur → başlıq və meta düzəlişi.
   11–20-ci mövqedə oturan sorğular → ən sürətli qazanc.
3. Bunun üzərində Phase 0.5 açar söz xəritəsi qurulur (PROJECT-PLAN §11.1).
4. Yeni deploy-dan sonra indeksləmənin nə vaxt yeniləndiyini izləyirik.
