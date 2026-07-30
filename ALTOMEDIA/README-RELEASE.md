# 🚀 ALTOMEDIA — Plinko Cash Release Package

**App:** Plinko Cash  
**Package:** `com.altomedia.plinkocash`  
**Version:** 1.0.0 (versionCode: 1)  
**Developer:** ALTOMEDIA  
**Target SDK:** 35 (Android 15) | Min SDK: 26 (Android 8.0)  

---

## 📁 Struktur Folder

```
ALTOMEDIA/
├── listing/
│   ├── images/
│   │   ├── icon-512x512.png           ← App Icon (512×512 PNG)
│   │   ├── feature-graphic-1024x500.png ← Feature Graphic (1024×500)
│   │   ├── screenshot-1-gameplay.png  ← Screenshot 1 (portrait)
│   │   ├── screenshot-2-prize-win.png ← Screenshot 2 (portrait)
│   │   ├── screenshot-3-spinwheel.png ← Screenshot 3 (portrait)
│   │   └── screenshot-4-rewards.png   ← Screenshot 4 (portrait)
│   ├── store-listing-id.md            ← Teks listing Bahasa Indonesia
│   ├── store-listing-en.md            ← Teks listing English
│   ├── content-rating-answers.md      ← Jawaban kuesioner rating konten
│   └── privacy-policy.html            ← Halaman Privacy Policy (host di GitHub Pages)
├── release/
│   ├── plinkocash-v1.0.0.apk          ← APK untuk distribusi/sideload
│   ├── plinkocash-v1.0.0.aab          ← AAB untuk upload Play Console ⭐
│   ├── plinkocash.keystore             ← JKS Keystore (simpan AMAN!)
│   └── keystore-info.txt              ← Info alias & password keystore
└── README-RELEASE.md                  ← File ini
```

---

## 📤 Langkah Upload ke Play Console

### 1. Buat App di Play Console
- Buka https://play.google.com/console
- Klik **"Create app"**
- App name: **Plinko Cash**
- Language: Indonesian
- App or game: **Game**
- Free or paid: **Free**

### 2. Store Listing
Upload semua dari folder `listing/`:
- **App icon:** `images/icon-512x512.png` (512×512 PNG)
- **Feature graphic:** `images/feature-graphic-1024x500.png` (1024×500)
- **Phone screenshots:** semua 4 screenshot (min 2 wajib)
- **Title:** dari `store-listing-id.md`
- **Short/Full description:** dari `store-listing-id.md`

### 3. Content Rating
- Isi kuesioner IARC sesuai `content-rating-answers.md`
- Expected result: **Everyone** atau **Teen**

### 4. Data Safety
- Isi sesuai bagian "Data Safety" di `content-rating-answers.md`
- Advertising ID: YES (shared with Google AdMob)
- No other data shared externally

### 5. Privacy Policy
- Host `privacy-policy.html` di GitHub Pages:
  ```
  Repo: kdsmedia/CashPlinko → Settings → Pages → dari folder /docs
  URL: https://kdsmedia.github.io/CashPlinko/privacy-policy.html
  ```
- Atau buat repo baru: `altomedia.github.io` untuk custom domain

### 6. Upload APK/AAB
- Pilih **Production** track (atau Internal/Closed testing dulu)
- Upload `release/plinkocash-v1.0.0.aab` ← **GUNAKAN AAB**
- APK hanya untuk testing/sideload

### 7. App Category
- Category: **Games → Casual**
- Tags: plinko, prize, reward, casual

### 8. Minimum Requirements Check (Play Console 2025)
- ✅ Target SDK: 35 (Android 15) — wajib per Agustus 2025
- ✅ Min SDK: 26 (Android 8.0)
- ✅ 64-bit support: YES (React Native default)
- ✅ Privacy Policy: wajib (link ke URL di atas)
- ✅ Content Rating: wajib diisi
- ✅ Data Safety: wajib diisi
- ✅ App icon: 512×512 PNG
- ✅ Feature graphic: 1024×500
- ✅ Screenshots: min 2 portrait

---

## 🔑 Keystore Info

⚠️ **JAGA KERAHASIAAN FILE KEYSTORE!**  
Jika hilang, kamu tidak bisa update app di Play Store.

Detail ada di `release/keystore-info.txt`

---

## 🔗 EAS Build Links

Build dipicu via Expo EAS. Pantau progress di:
https://expo.dev/accounts/altomedia/projects/plinkocash/builds

Download APK/AAB dari dashboard setelah build selesai (~15-20 menit).

---

## 📞 Kontak Developer
**ALTOMEDIA**  
Email: altomedia.dev@gmail.com  
GitHub: https://github.com/kdsmedia/CashPlinko
