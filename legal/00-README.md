# Hüquqi sənədlər / Legal documents — kardio.az

> ⚠️ **STATUS: LAYİHƏ (DRAFT).** Bu sənədlər şablondur və **hüquqşünas təsdiqi olmadan
> dərc edilməməlidir** (bax: PROJECT-PLAN.md §14.9). Claude hüquqşünas deyil — bunlar
> peşəkar hüquqi məsləhəti əvəz etmir.

Sayt Azərbaycan dilində olduğu üçün bütün pasiyentə yönəlik sənədlər **Azərbaycan dilindədir**.

## Sənədlərin siyahısı

| Fayl | Nə üçün | Harada göstərilir |
|---|---|---|
| [informed-consent-teletibb.md](./informed-consent-teletibb.md) | Teletibb üçün məlumatlandırılmış razılıq | Randevu formu (checkbox + tam mətn linki) |
| [tibbi-bildiris-disclaimer.md](./tibbi-bildiris-disclaimer.md) | Tibbi bildiriş (disclaimer) | Bütün tibbi səhifələr, konsultasiya otağı |
| [mexfilik-siyaseti.md](./mexfilik-siyaseti.md) | Məxfilik siyasəti (fərdi məlumatlar) | Footer + randevu formu |
| [istifade-sertleri.md](./istifade-sertleri.md) | İstifadə şərtləri | Footer + randevu formu |
| [kuki-siyaseti.md](./kuki-siyaseti.md) | Kuki (cookie) siyasəti | Footer + kuki banneri |
| [randevu-legvetme-siyaseti.md](./randevu-legvetme-siyaseti.md) | Randevu, ləğvetmə və vaxt dəyişmə şərtləri | Randevu formu |
| [booking-form-checkboxes.md](./booking-form-checkboxes.md) | Formadakı razılıq checkbox-larının mətni | Randevu formu (UI microcopy) |

## Doldurulmalı yerlər (bütün sənədlərdə)

Aşağıdakılar `[DOLDURULMALI: ...]` şəklində qeyd olunub — dərcdən əvvəl real məlumatla əvəz edilməlidir:
- Hüquqi şəxs / fərdi sahibkar adı və VÖEN
- Rəsmi ünvan
- Əlaqə e-poçtu (məs. `info@kardio.az`), telefon
- Məlumat operatorunun dövlət reyestrində qeydiyyat nömrəsi (varsa)
- Yürürlük (qüvvəyə minmə) tarixi

## Əsas uyğunluq prinsipləri (bu sənədlərin dayandığı təməl)

- **Data minimizasiyası:** tibbi məlumat saxlanmır; konsultasiya sessiya əsaslıdır; randevunun
  təfərrüatları konsultasiyadan sonra avtomatik silinir (PROJECT-PLAN §14.3).
- **⚠️ Foto materialı — pasiyent şəkilləri (2026-07-17):** sahibkarın verdiyi Google Drive
  qovluqlarında (80 şəkil) **tanınan real pasiyentlərin** fotoları var — qəbul zamanı üzü
  görünən pasiyentlər (qovluq B) və prosedur masasında olan pasiyent (qovluq D).
  **Sayta yalnız həkim/komanda/avadanlıq şəkilləri qoyulub**, pasiyent üzü görünən heç bir
  şəkil istifadə edilməyib. Tanınan pasiyentin şəklini dərc etmək üçün **həmin pasiyentin
  yazılı razılığı** tələb olunur — bizdə yoxdur. Sahibkar razılıq sənədlərini təqdim edərsə,
  bu şəkillər də istifadə oluna bilər. Hüquqşünas baxışında təsdiqlənməlidir.
- **İstisna — pasiyent siyahısı (2026-07-17 qərarı):** pasiyentin **ad və soyadı, mobil
  nömrəsi, e-poçt ünvanı və müraciət tarixçəsi** (görüş sayı, ilk/son tarix) təkrar müraciəti
  tanımaq və əlaqə saxlamaq üçün müddətsiz saxlanılır.
  Bu, sahibkarın qərarıdır və məxfilik siyasətində açıqlanıb. Tibbi məlumat hələ də saxlanmır.
  ⚠️ Hüquqşünas yoxlaması zamanı **xüsusi diqqət** tələb edir: saxlama müddəti, hüquqi əsas
  (razılıq) və silinmə tələbinin icrası.
- **Açıq razılıq:** sağlamlıq datası xüsusi kateqoriyadır → açıq razılıq + hüquqi əsas
  ("Şəxsi məlumatlar haqqında" Qanun).
- **Video yazılmır** (recording yoxdur).
- **Supabase EU regionu** + ciddi RLS.
