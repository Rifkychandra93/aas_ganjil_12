# Concertify Mobile App 📱🎶

Aplikasi mobile resmi untuk pemesanan tiket konser musik **Concertify**, dibangun dengan **React Native + Expo SDK 58**. Aplikasi ini terhubung langsung secara real-time ke backend yang sama dengan website Concertify.

---

## 🎨 Konsistensi Desain & Warna dengan Website

Tampilan mobile mengadopsi identitas visual yang sama persis dengan antarmuka web:
- **Warna Utama (Brand Primary)**: `#7C3AED` (Violet 600)
- **Gradien Khas**: `#6D28D9` (Violet 700) hingga `#8B5CF6` (Violet 500)
- **Aksen Lembut**: `#F5F3FF` (Purple 50) & `#EDE9FE`
- **Warna Status Pesanan & Tiket**:
  - `PAID` (Lunas): Hijau Emerald (`#10B981`)
  - `PENDING` (Menunggu Pembayaran): Kuning/Oranye Amber (`#F59E0B`)
  - `USED` (Sudah Digunakan): Biru (`#3B82F6`)
  - `CANCELLED` (Dibatalkan): Merah (`#EF4444`)

---

## 🚀 Fitur Utama

1. **Beranda Konser (Home)**:
   - Banner promo live concert 2026.
   - Pencarian konser, musisi, atau venue secara instan.
   - Kategori genre musik (Pop Rock, Indie, Pop, Pop Idol, Folk).
   - Daftar **Artis Populer** (tersinkronisasi dari API `/api/artists`).
   - Daftar **Konser Mendatang** (tersinkronisasi dari API `/api/events`).
   - Fitur **Pull-to-refresh** untuk menarik data terbaru langsung dari server.

2. **Detail Konser (Event Detail)**:
   - Poster konser dengan resolusi penuh.
   - Jadwal tanggal konser dan lokasi venue.
   - Deskripsi profil konser & musisi.
   - Pemilihan kategori tiket (VIP, Regular, Festival, dll.) lengkap dengan sisa kuota dan harga.
   - Counter penambahan jumlah tiket dengan batas proteksi.

3. **Pemesanan Tiket & Checkout**:
   - Ringkasan tiket yang dipesan dan data pembeli.
   - Pilihan metode pembayaran (Midtrans Snap, QRIS Dinamis, Transfer).
   - Fitur **Simulasi Sandbox Instan** untuk demonstrasi langsung verifikasi tiket LUNAS (PAID) di database backend.
   - Terhubung langsung ke API `/api/orders`.

4. **Tiket Saya (My Tickets)**:
   - Filter tab: *Semua*, *Aktif (Akan Datang)*, *Selesai*, dan *Dibatalkan*.
   - Kartu tiket berdesain perforasi khas tiket konser.
   - Tombol **Tampilkan E-Tiket & Barcode**: membuka modal visual e-tiket dengan QR Code dan Barcode unik untuk verifikasi pintu masuk.
   - Aksi pembayaran & sinkronisasi status pembayaran dari backend.

5. **Scanner Tiket Pintu Masuk (Guard & Staff)**:
   - Validasi kode tiket langsung di mobile.
   - Menampilkan status tiket: VALID & DITERIMA, SUDAH DIGUNAKAN, atau TIDAK VALID.

6. **Akun & Pengaturan Server Backend**:
   - Informasi user yang sedang masuk (Customer/Guard/Admin).
   - **Pengaturan IP Server Dinamis**: memungkinkan mengganti URL backend (misal dari `192.168.1.19:5000` ke IP Wi-Fi lain atau emulator) langsung dari dalam aplikasi tanpa perlu rebuild.
   - Tombol **Uji Sambungan** untuk memastikan koneksi ke server berhasil.

---

## 🛠️ Cara Menjalankan Aplikasi Mobile

1. **Buka terminal dan masuk ke folder mobile**:
   ```bash
   cd aas_ganjil_12/mobile
   ```

2. **Jalankan Expo Dev Server**:
   ```bash
   npm start
   # atau: npx expo start
   ```

3. **Membuka di Perangkat**:
   - **Di HP Fisik**: Buka aplikasi **Expo Go** (Android / iOS), lalu scan QR Code yang muncul di terminal.
   - **Di Android Emulator**: Tekan tombol `a` di terminal.
   - **Di Web Preview**: Tekan tombol `w` di terminal.

---

## 🔄 Pembuktian Sinkronisasi Web & Mobile

Karena aplikasi mobile dan website menggunakan satu backend REST API & database Neon PostgreSQL yang sama:
- Ketika Anda membuat event baru atau artis baru melalui dashboard Admin di web, tarik layar ke bawah (*pull to refresh*) di Beranda mobile: **event baru langsung otomatis tampil**.
- Ketika Anda memesan tiket dari aplikasi mobile, data tiket tersebut langsung tersimpan di database dan dapat dicek di riwayat tiket web maupun di scanner penjaga pintu.
