# 🚀 ALTOMEDIA — Plinko Cash Release Package

**App:** Plinko Cash  
**Package:** `com.altomedia.plinkocash`  
**Version:** 1.0.0 (versionCode: 1)  
**Developer:** ALTOMEDIA  
**Target SDK:** 35 (Android 15) | Min SDK: 26 (Android 8.0)  

---

## ✅ Status Build EAS

| Tipe | Profile | Status | Link |
|------|---------|--------|------|
| AAB (Play Store) | `production-aab` | ⏳ Building | https://expo.dev/accounts/altomedia/projects/plinkocash/builds/4423484a-d795-4c69-a201-b939f8936d3c |
| APK (Testing) | `production` | ⏳ Building | https://expo.dev/accounts/altomedia/projects/plinkocash/builds/05f487df-b2b6-4708-b562-c7ecd8f3b9f3 |

> Build estimasi selesai ~15–20 menit. Pantau di dashboard Expo.  
> Setelah selesai, download dan simpan ke folder `release/`.

**Credentials:** EAS menggunakan keystore yang di-manage cloud (Build Credentials Te5rW5VXhg).  
File `plinkocash.keystore` di folder `release/` adalah backup lokal — simpan dengan aman.

---

## 📁 Struktur Folder

```
ALTOMEDIA/
├── listing/
│   ├── images/
│   │   ├── icon-512x512.png             ← App Icon (512×512 PNG)
│   │   ├── feature-graphic-1024x500.png ← Feature Graphic (1024×500)
│   │   ├── screenshot-1-gameplay.png    ← Screenshot 1 (portrait)
│   │   ├── screenshot-2-prize-win.png   ← Screenshot 2 (portrait)
│   │   ├── screenshot-3-spinwheel.png   ← Screenshot 3 (portrait)
│   │   └── screenshot-4-rewards.png     ← Screenshot 4 (portrait)
│   ├── store-listing-id.md              ← Teks listing Bahasa Indonesia
│   ├── store-listing-en.md              ← Teks listing English
│   ├── content-rating-answers.md        ← Jawaban kuesioner rating konten
│   └── privacy-policy.html              ← Halaman Privacy Policy
├── release/
│   ├── plinkocash-v1.0.0.aab            ← ⭐ Download dari EAS setelah build selesai
│   ├── plinkocash-v1.0.0.apk            ← Download dari EAS setelah build selesai
│   ├── plinkocash.keystore              ← JKS Keystore backup lokal (JAGA RAHASIA!)
│   └── keystore-info.txt               ← Info alias & password
└── README-RELEASE.md                    ← File ini
```

---

## 📤 Langkah Upload ke Play Console

### 1. Download Build Setelah Selesai
- Buka link build di atas → klik **"Download"**
- Simpan sebagai `release/plinkocash-v1.0.0.aab` dan `release/plinkocash-v1.0.0.apk`

### 2. Buat App di Play Console
- Buka https://play.google.com/console
- Klik **"Create app"**
- App name: **Plinko Cash**
- Language: Indonesian
- App or game: **Game**
- Free or paid: **Free**

### 3. Store Listing
Upload semua dari folder `listing/`:
- **App icon:** `images/icon-512x512.png` (512×512 PNG)
- **Feature graphic:** `images/feature-graphic-1024x500.png` (1024×500)
- **Phone screenshots:** semua 4 screenshot (min 2 wajib)
- **Title & deskripsi:** dari `store-listing-id.md`

### 4. Content Rating
- Isi kuesioner IARC sesuai `content-rating-answers.md`
- Expected result: **Everyone** atau **Teen**

### 5. Data Safety
- Isi sesuai bagian "Data Safety" di `content-rating-answers.md`
- Advertising ID: YES (shared with Google AdMob)

### 6. Privacy Policy
- Host `privacy-policy.html` di GitHub Pages:
  ```
  URL: https://kdsmedia.github.io/CashPlinko/privacy-policy.html
  ```
  Atau hosting lain yang bisa diakses publik.

### 7. Upload AAB
- Pilih track **Internal testing** dulu untuk verifikasi
- Upload `release/plinkocash-v1.0.0.aab` ← **GUNAKAN AAB ini**
- APK hanya untuk testing/sideload langsung

### 8. App Category
- Category: **Games → Casual**
- Tags: plinko, prize, reward, casual

### 9. Minimum Requirements (Play Console 2025)
- ✅ Target SDK: 35 (Android 15) — wajib per Agustus 2025
- ✅ Min SDK: 26 (Android 8.0)
- ✅ 64-bit support: YES (React Native default)
- ✅ Privacy Policy: wajib
- ✅ Content Rating: wajib diisi
- ✅ Data Safety: wajib diisi
- ✅ App icon: 512×512 PNG
- ✅ Feature graphic: 1024×500
- ✅ Screenshots: min 2 portrait

---

## 🔑 Keystore Info

⚠️ **JAGA KERAHASIAAN FILE KEYSTORE!**  
Detail ada di `release/keystore-info.txt`

EAS juga menyimpan keystore di cloud (Build Credentials Te5rW5VXhg).  
Untuk update app di masa depan, gunakan profile EAS yang sama.

---

## 🔗 Dashboard EAS

Pantau semua build di:  
https://expo.dev/accounts/altomedia/projects/plinkocash/builds

---

## 📞 Kontak Developer
**ALTOMEDIA**  
Email: altomedia.dev@gmail.com  
GitHub: https://github.com/kdsmedia/CashPlinko
