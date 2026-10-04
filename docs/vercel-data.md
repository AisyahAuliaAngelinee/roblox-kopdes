# Data akun pada Vercel dan staging Sites

Google login memverifikasi identitas. Alamat, wishlist, pesanan, katalog, dan akun admin disimpan dalam database D1, bukan pada Google. ID akun memakai claim Google `sub`, sehingga akun yang sama dapat membaca data yang sama jika server memakai database yang sama. Cookie login dan data tamu di browser terpisah untuk setiap domain.

## Periksa Vercel

Buka proyek Vercel → Settings → Environment Variables, pilih Production. Periksa tiga variabel server berikut:

| Variabel | Asal |
| --- | --- |
| `CLOUDFLARE_ACCOUNT_ID` | Account ID akun Cloudflare pemilik database |
| `CLOUDFLARE_D1_DATABASE_ID` | Cloudflare → Workers & Pages → D1 → pilih database → Overview → Database ID |
| `CLOUDFLARE_API_TOKEN` | Token Cloudflare dengan akses D1 untuk akun tersebut; simpan sebagai secret hanya di server |

Jangan gunakan prefix NEXT_PUBLIC_ untuk token. Jangan menyalin ID placeholder `00000000-0000-4000-8000-000000000000`. ID database dalam Wrangler bukan bukti bahwa Vercel memakai database itu: Vercel membaca variabel di atas.

Setelah memperbarui variabel Production, lakukan Redeploy. Login ulang menggunakan akun Google yang sama. Client ID Google sudah dikonfigurasi di domain `https://roblox-kopdes.clarishna.my.id`; origin ini juga harus diizinkan pada Google Cloud Console.

## Data staging tidak muncul

Database staging `chatgpt.site` disediakan dan dikelola Sites. Jangan menganggap database ini terdaftar pada akun Cloudflare pribadi, dan jangan menggunakan token Cloudflare pribadi untuk mencoba mengaksesnya. Jika menggunakan database pribadi baru, data lama perlu diekspor dan dimigrasikan; konfigurasi Google tidak memindahkan data.

Sebelum migrasi, tentukan database tujuan dan cadangkan data yang sudah ada. Pertahankan `kopdes_profiles.user_id` dan `kopdes_orders.owner` agar kepemilikan akun Google tetap sama, serta ID produk yang dirujuk wishlist/pesanan. Jangan menimpa data baru tanpa rekonsiliasi. Berkas gambar upload harus ikut dipindahkan dari penyimpanan R2 staging ke penyimpanan gambar produksi. Ini adalah migrasi terencana, bukan sinkronisasi otomatis dua database.

Jika hanya data tamu yang disimpan sebelum login, data itu ada di localStorage domain lama dan tidak otomatis ikut akun Google atau domain baru.

## Acuan

- https://developers.google.com/identity/openid-connect/openid-connect
- https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/get/
- https://vercel.com/docs/environment-variables

## Login berhasil tetapi profil gagal dimuat / wishlist terkunci

Periksa Vercel → Logs untuk request `/api/profile`. Kode mencatat kategori tanpa isi profil atau credential:

- `database_configuration_missing`: tiga variabel D1 belum lengkap pada deployment aktif.
- `database_schema_missing`: koneksi ada tetapi tabel belum dibuat.
- `database_connection_or_permission_failed`: periksa token, Account ID, Database ID dan izin.
- `database_or_profile_validation_failed`: periksa schema profil atau koneksi lainnya.

Untuk database D1 **baru**, buka Console database Cloudflare dan jalankan isi [d1-initial-schema.sql](d1-initial-schema.sql). Berkas ini hanya membuat tabel/index; tidak memindahkan data staging. Untuk database lama gunakan migrasi berurutan dari `drizzle`, bukan snapshot ini. Setelah env benar dan tabel siap, Redeploy di Vercel lalu klik Coba lagi pada panel akun.
