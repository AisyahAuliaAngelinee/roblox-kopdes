# Roblox Kopdes — Koperasi Merah Putih

Prototipe ecommerce koperasi desa yang terinspirasi pengalaman Kopdes di Roblox. Dibuat untuk eksplorasi UI dan vibecoding, bukan layanan resmi pemerintah, Roblox, atau koperasi sungguhan.

## Fitur

- Beranda dengan model bangunan 3D interaktif dan produk trending pilihan demo.
- Katalog 30 produk: pencarian, kategori, wishlist, urutan harga, dan informasi stok.
- Keranjang dengan pilihan item, kontrol jumlah, serta ringkasan belanja.
- Checkout wajib login Google, pilihan alamat, catatan pesanan, dan pengiriman gratis.
- Google Identity Services; profil, wishlist, dan hingga 20 alamat tersimpan per akun di Cloudflare D1. Alamat mendukung titik peta dan lokasi perangkat dengan izin pengguna.
- Xendit **Test**: QRIS, GoPay melalui QRIS, dan virtual account bank. Tenggat pembayaran 24 jam.
- Riwayat pesanan, pencarian/filter, rincian invoice, konfirmasi selesai, dan pesan ulang.
- Simulasi pengiriman Express (1 menit) / Regular (2 menit) setelah pembayaran.
- Notifikasi pesanan dan perubahan harga/stok, diperiksa berkala saat halaman terbuka.
- Bahasa Indonesia/Inggris, mode terang/gelap, dan halaman Karyawan.

## Teknologi

Next.js App Router, React, TypeScript, Tailwind CSS, komponen shadcn/ui, Framer Motion, Three.js, Leaflet, `xendit-node`, serta `jose`. Runtime server memakai OpenNext untuk Cloudflare Workers dan database D1.

## Menjalankan lokal

Prasyarat: Node.js **22.13 atau lebih baru** dan npm.

```bash
git clone https://github.com/AisyahAuliaAngelinee/roblox-kopdes.git
cd roblox-kopdes
npm ci
cp .env.example .env
cp .env.example .dev.vars
```

Isi kedua file lokal dengan konfigurasi yang sama:

| Variabel | Kegunaan |
| --- | --- |
| `GOOGLE_CLIENT_ID` | OAuth Client ID bertipe Web application untuk Google Identity Services |
| `SESSION_SECRET` | Nilai acak minimal 32 karakter untuk menandatangani sesi |
| `XENDIT_SECRET_KEY` | Opsional; kosong untuk demo, atau kunci `xnd_development_...` untuk Xendit Test |

Buat secret acak secara lokal dengan `openssl rand -hex 32`. Jangan commit `.env`, `.dev.vars`, atau kunci API.

Siapkan tabel D1 lokal (jalankan setiap berkas migrasi berurutan):

```bash
for migration in drizzle/000*.sql; do
  npx wrangler d1 execute DB --local --config wrangler.json --file "$migration"
done
npm run dev
```

Buka **http://localhost:5173**. Keranjang bertahan selama navigasi internal; memuat ulang halaman mengosongkan keranjang. Data akun dan pesanan disimpan di D1. Wishlist/alamat tamu tersimpan hanya pada browser dan tidak otomatis digabung saat login.

### Login Google

1. Buat OAuth Client ID **Web application** di Google Cloud Console.
2. Tambahkan `http://localhost:5173` pada **Authorized JavaScript origins**. Untuk hosting, tambahkan origin HTTPS yang dipakai, tanpa path atau garis miring di akhir.
3. Konfigurasikan consent screen dan akun penguji bila aplikasi masih berstatus Testing.
4. Isi `GOOGLE_CLIENT_ID` dan `SESSION_SECRET`, kemudian mulai ulang server.

Alur popup ini tidak memakai Client Secret. Server memverifikasi token Google dan menyimpan sesi dalam cookie HttpOnly.

### Pembayaran dan pengiriman

Tanpa kunci Xendit, checkout membuat **pesanan demo**, tanpa transaksi uang atau email. Kunci live ditolak oleh server. Dengan kunci Test, kanal pembayaran dan email invoice mengikuti konfigurasi akun Xendit. Status Test diperiksa melalui tombol pemeriksaan pembayaran; webhook belum diterapkan.

Ongkir selalu Rp0. Tracker packing → perjalanan → sampai adalah simulasi waktu, bukan posisi kurir atau estimasi lalu lintas nyata. Badge selesai hanya di website; tidak ada email konfirmasi penerimaan tambahan.

## Build dan pemeriksaan

```bash
npx tsc --noEmit
node --experimental-strip-types tests/orders.mjs
node --experimental-strip-types tests/notifications.mjs
npm run build
npm run preview:worker
```

`npm run build` menghasilkan paket Worker dan aset di `dist/`. Preview Worker berjalan di port 5173; hentikan server pengembangan lebih dahulu. `npm run build:next` hanya membangun aplikasi Next.js, belum menghasilkan paket hosting final.

## Deployment

Proyek asal menggunakan Sites dengan konfigurasi `.openai/hosting.json`. ID di file tersebut merujuk deployment milik pemilik proyek; menggandakan repository tidak otomatis membuat deployment atau menyalin database.

Untuk deployment Cloudflare mandiri, sediakan database D1 sendiri, sesuaikan konfigurasi Wrangler, terapkan migrasi, dan atur environment/secret pada server. Jangan gunakan ID database placeholder sebagai database produksi. Berkas `.dev.vars` digunakan untuk pengembangan lokal dan tidak diunggah sebagai secret produksi.

## Struktur utama

```text
app/          Halaman, komponen, dan endpoint API
components/   Komponen UI
lib/          Katalog, autentikasi, terjemahan, dan tipe domain
db/           Akses database dan penyimpanan
drizzle/      Migrasi database
public/       Logo, gambar produk, dan gambar karyawan
scripts/      Build dan alat pengembangan
tests/        Pengujian pesanan dan notifikasi
```

## Batasan prototipe

Harga, stok, trending, dan pengiriman merupakan contoh. Proyek belum ditujukan untuk transaksi produksi; pembayaran produksi membutuhkan konfigurasi merchant, webhook tervalidasi, idempotensi checkout, dan proses pemenuhan pesanan yang nyata.

## Lisensi dan aset

Kode proyek dilisensikan dengan [MIT License](LICENSE), Copyright © 2026 Vincentius Clarishna.

Logo, merek, kemasan produk, foto, dan tangkapan layar Roblox dapat memiliki hak terpisah milik pemiliknya. Lisensi MIT kode tidak memberikan hak atas merek atau aset pihak ketiga tersebut. Sumber gambar katalog tercatat di `public/catalog/sources.json` bila tersedia. Dependency mengikuti lisensinya masing-masing.

## Mode admin internal

Area admin tersedia di `/admin`, login di `/admin/login`, dan pendaftaran di `/admin/register`. Akun admin terpisah dari login Google pelanggan. Semua API admin memeriksa sesi server; pelanggan dan tamu tidak diberi hak admin.

- Set secret server `ADMIN_INVITE_CODE` berupa nilai acak minimal 32 karakter untuk undangan pertama. Undangan pertama berlaku 7 hari sejak percobaan pendaftaran pertama dan hanya dapat dikonsumsi satu kali. Tidak ada akun/password bawaan.
- Admin yang sudah masuk dapat membuat kode undangan baru (24 jam, sekali pakai). Setiap admin memiliki hak pengelolaan toko dan undangan; hanya bagikan kepada staf berwenang.
- Password disimpan sebagai hash PBKDF2-SHA256 dengan salt acak. Sesi opaque disimpan sebagai hash, kedaluwarsa 8 jam, cookie HttpOnly/SameSite dan Secure di HTTPS. Logout mencabut sesi. Login/register dibatasi per email dan alamat IP.
- Produk disimpan di D1: tambah item, ubah harga/gambar/kategori, tambah atau set stok, tandai stok kosong dan trending. Stok otomatis berkurang sekali saat pembayaran dikonfirmasi (simulasi demo atau pemeriksaan invoice Xendit). Klaim pesanan, pengurangan stok, dan status PAID menggunakan transaksi D1; konfirmasi berulang tidak memotong stok lagi. Pesanan lama yang sudah dibayar tidak dipotong ulang. Demo menolak pembayaran jika stok tak cukup; konfirmasi Xendit tetap mencatat pembayaran dan menandai kekurangan stok di dashboard admin tanpa membuat stok negatif. Stok belum direservasi selama invoice menunggu pembayaran.
- Editor karyawan mendukung peran/nama/deskripsi/gambar, visibilitas. Foto produk dan karyawan dapat diunggah dari perangkat atau diimpor dari URL HTTPS publik. Format PNG/JPG/JPEG, maksimal 12 MB per gambar; byte diperiksa di server, disimpan permanen di R2 `IMAGES`, dan baru ditayangkan setelah perubahan produk/karyawan disimpan. URL yang tidak dapat diambil menampilkan opsi untuk unggah file.
- Grafik garis di beranda admin menampilkan 30 hari WIB, berdasarkan jumlah unit di pesanan PAID/COMPLETED. Data demo dan Xendit Test dipisahkan; tidak ada transaksi live. Kategori disalin pada checkout baru; pesanan lama memakai kategori katalog terkini sebagai fallback.
- Katalog publik diperbarui tiap 30 detik atau saat tab kembali aktif. Checkout memakai harga dan stok server terkini. Penyimpanan memakai versi untuk menolak pembaruan dari tab lama.

Terapkan migrasi `0004_clammy_magus.sql` untuk database lokal. Pengujian integrasi admin: jalankan server lokal, lalu `node tests/admin-api.mjs`. Pengujian ini membuat fixture akun/produk/pesanan hanya pada D1 lokal. Jangan jalankan terhadap produksi. Untuk lokal, isi `ADMIN_INVITE_CODE` di `.env` dan `.dev.vars`; kode untuk produksi harus berbeda.

### Filter analytics admin

Dashboard mendukung All-time, Daily, Weekly (Senin–Minggu), Monthly, Yearly, dan rentang tanggal inklusif dengan zona GMT+7. Filter kategori dan status berlaku pada ringkasan serta grafik garis. Barang terjual dan nilai pembelian hanya dihitung dari pembayaran terkonfirmasi; filter gagal menampilkan jumlah pesanan gagal tanpa mencatatnya sebagai penjualan. Grafik batang sukses/gagal memiliki periode Weekly/Monthly/Yearly tersendiri dan mengikuti kategori serta sumber data, sehingga kedua status tetap dapat dibandingkan. Sukses mencakup PAID/COMPLETED; gagal mencakup FAILED/EXPIRED/CANCELLED dan pembayaran pending kedaluwarsa. Dalam pengiriman mencakup PAID yang belum diselesaikan. Jam berjalan realtime; data pesanan dimuat ulang saat filter berubah atau tombol Perbarui ditekan.

Konfigurasi data akun untuk domain Vercel dan perbedaan dengan staging: [panduan Vercel dan migrasi data](docs/vercel-data.md).
