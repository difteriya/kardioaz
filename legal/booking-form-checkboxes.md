# Randevu formu — razılıq checkbox-ları (UI microcopy)

> ⚠️ **LAYİHƏ — hüquqşünas təsdiqi tələb olunur.**
> Bu, randevu formunda göstəriləcək **checkbox mətnləridir**. Randevu yalnız məcburi
> checkbox-lar işarələndikdən sonra təsdiqlənə bilər (button disabled qalır).

## Məcburi checkbox-lar (randevu üçün şərt)

**☐ 1 — Teletibb razılığı + tibbi bildiriş (məcburi)**
> Onlayn konsultasiyanın üzbəüz müayinəni əvəz etmədiyini və təcili hallar üçün nəzərdə
> tutulmadığını başa düşürəm. [Teletibb razılığı](./informed-consent-teletibb.md) və
> [Tibbi bildiriş](./tibbi-bildiris-disclaimer.md) ilə tanış oldum və razıyam.

**☐ 2 — Fərdi məlumatların emalı (məcburi)**
> Sağlamlığımla bağlı məlumat da daxil olmaqla, fərdi məlumatlarımın konsultasiya məqsədilə
> emalına və zəruri xidmət provayderlərinə (o cümlədən ölkədən kənarda) ötürülməsinə **açıq
> razılıq** verirəm. [Məxfilik siyasəti](./mexfilik-siyaseti.md) ilə tanış oldum.

**☐ 3 — İstifadə şərtləri (məcburi)**
> [İstifadə şərtləri](./istifade-sertleri.md) və
> [Randevu/ləğvetmə siyasəti](./randevu-legvetme-siyaseti.md) ilə razıyam.

## Qeyri-məcburi checkbox

**☐ 4 — Kuki (analitik) — qeyri-məcburi** *(kuki bannerində idarə olunur)*
> Saytın təkmilləşdirilməsi üçün anonim statistik kukilərə razıyam.

## Texniki qeydlər (developer üçün)

- 1–3 checkbox-ları işarələnmədən **"Randevu təsdiqlə" düyməsi aktiv olmasın**.
- Randevu formunda **ad və soyad**, **mobil nömrə** və **e-poçt** məcburidir. Nömrə AZ mobil
  formatında yoxlanılır (`050/051/055/060/070/077/010/099` + 7 rəqəm) və `+994XXXXXXXXX`
  şəklində normallaşdırılır.
- Razılıq faktı (hansı versiya + zaman möhürü) randevu qeydində saxlanılır və konsultasiyadan
  sonra randevu datası ilə birlikdə silinir. Pasiyentin əlaqə məlumatları isə pasiyent
  siyahısında qalır (bax: məxfilik siyasəti §5) — silinmə tələb edilənədək.
- Bütün siyasət linkləri yeni tabda (`target="_blank" rel="noopener"`) açılsın.
- Mətnlər Azərbaycan dilindədir (sayt AZ-only).
