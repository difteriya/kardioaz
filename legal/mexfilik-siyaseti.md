# Məxfilik siyasəti (Fərdi məlumatların qorunması)

> ⚠️ **LAYİHƏ — hüquqşünas təsdiqi tələb olunur.** Yürürlük tarixi: [DOLDURULMALI].
> Hüquqi əsas: Azərbaycan Respublikasının **"Şəxsi məlumatlar haqqında"** Qanunu.

## 1. Məlumat operatoru

[DOLDURULMALI: hüquqi şəxs / fərdi sahibkar adı, VÖEN, ünvan]. Əlaqə: [DOLDURULMALI: e-poçt, telefon].

## 2. Hansı məlumatları toplayırıq

Biz **minimum məlumat** prinsipini tətbiq edirik:

| Məqsəd | Toplanan məlumat | Saxlanma |
|---|---|---|
| Onlayn konsultasiyaya qeydiyyat / giriş | **Ad və soyad**, **mobil nömrə**, **e-poçt ünvanı** | Pasiyent siyahısında saxlanılır (silinmə tələbinədək) |
| Təkrar müraciətin tanınması | Ad, mobil nömrə, e-poçt, görüş sayı, ilk/son müraciət tarixi | Silinmə tələbinədək |
| Randevu ilə bağlı əlaqə (texniki problem, vaxt dəyişikliyi) | Mobil nömrə, e-poçt | Silinmə tələbinədək |
| Randevunun idarəsi | Seçilmiş vaxt, randevu statusu | Konsultasiyadan sonra silinir |
| Sayta baxış statistikası | Anonim/aqreqat analitika (GA4) | Analitika provayderinin şərtlərinə uyğun |

**Toplamadıqlarımız:** biz konsultasiyanın məzmununu (video, çat, paylaşılan faylları) **saxlamırıq**;
video **yazılmır**; ayrıca tibbi qeyd (kartı) aparılmır.

## 3. Sağlamlıq məlumatı (xüsusi kateqoriya)

Konsultasiya zamanı könüllü paylaşdığınız sağlamlıqla bağlı məlumat **xüsusi kateqoriyalı fərdi
məlumatdır**. Bu məlumat yalnız:
- sizin **açıq razılığınız** əsasında, və
- konsultasiyanın həyata keçirilməsi məqsədilə **sessiya ərzində** emal olunur,
- sessiya bitdikdən sonra **saxlanmadan silinir**.

## 4. Emalın hüquqi əsası

- Xidmətin göstərilməsi üçün **razılıq** (randevu formunda checkbox ilə verilir);
- Qanunla nəzərdə tutulmuş hallar;
- Subyektin həyat və sağlamlığının qorunması.

## 5. Məlumatın saxlanma müddəti (data retention)

- **Ad və soyad, mobil nömrə, e-poçt ünvanı və müraciət tarixçəsi** (görüş sayı, ilk/son
  müraciət tarixi) — pasiyent siyahımızda **müddətsiz saxlanılır** ki, təkrar müraciət
  etdiyiniz zaman sizi tanıya bilək.
  İstənilən vaxt **silinmə tələb edə bilərsiniz** (bax: §8) — tələb icra olunduqda bu qeyd
  tamamilə silinir.
- Randevunun təfərrüatları (seçilmiş vaxt, status) — **konsultasiya tamamlandıqdan sonra
  avtomatik silinir**.
- Təsdiqlənməmiş (pending) randevular — tutma müddəti (~15 dəqiqə) bitdikdən sonra ləğv olunur.
- Konsultasiya məzmunu (video, çat, fayllar) — **qeydə alınmır və saxlanmır**.

> **Qeyd:** əlaqə məlumatlarınız (ad, mobil nömrə, e-poçt) yalnız randevu, əlaqə və tanınma
> məqsədilə saxlanılır. Bu məlumatlarla marketinq/reklam mesajları göndərilmir, SMS
> kampaniyalarında istifadə olunmur və üçüncü tərəflərə satılmır.

## 6. Məlumatın ötürülməsi və üçüncü tərəflər

Xidməti göstərmək üçün aşağıdakı provayderlərdən istifadə olunur (yalnız zəruri məlumat həcmində):

| Provayder | Məqsəd | Qeyd |
|---|---|---|
| **Supabase** | Autentifikasiya + müvəqqəti randevu datası | **EU regionu** |
| **Daily.co** | Video konsultasiya bağlantısı | Konsultasiya yazılmır |
| E-poçt provayderi [DOLDURULMALI] | Təsdiq/bildiriş e-poçtları | — |
| Google Analytics (GA4) | Anonim sayt statistikası | Bax: [Kuki siyasəti](./kuki-siyaseti.md) |

Bəzi provayderlərin serverləri Azərbaycandan kənarda yerləşə bilər (**sərhədkənar ötürmə**).
Randevu formunda razılıq verməklə bu ötürməyə razılıq vermiş olursunuz.

## 7. Sizin hüquqlarınız

Fərdi məlumatlarınızla bağlı:
- məlumatın emal olunub-olunmadığını öyrənmək və nüsxəsini almaq;
- düzəliş və ya silinmə tələb etmək;
- razılığı geri götürmək.

Müraciətlərə **30 təqvim günü** ərzində cavab verilir. Müraciət üçün: [DOLDURULMALI: e-poçt].

## 8. Təhlükəsizlik

Məlumat şifrələnmiş bağlantı (HTTPS) ilə ötürülür; verilənlər bazasında sətir səviyyəli
məhdudiyyət (RLS) tətbiq olunur — hər istifadəçi yalnız öz məlumatına çıxış əldə edir.

## 9. Dəyişikliklər

Bu siyasət yenilənə bilər. Dəyişikliklər bu səhifədə dərc olunacaq.

Sonuncu yenilənmə: [DOLDURULMALI].
