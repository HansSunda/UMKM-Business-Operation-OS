# UMKM Business Operations OS (Sistem Operasi Bisnis UMKM)

SaaS operasi bisnis terpadu untuk UMKM berbasis jasa di Indonesia (desain interior, arsitektur, wedding/event organizer, percetakan, fotografi, katering, kontraktor renovasi, dan agensi kreatif).

Aplikasi ini menggantikan alur kerja manual dan terfragmentasi (WhatsApp + Excel + Nota Kertas) menjadi satu sistem operasional terintegrasi:

```
Pelanggan (Customer)
       ↓
Penawaran (Quotation)
       ↓
Proyek (Project / SPK)
       ↓
Invoice (Tagihan Termin)
       ↓
Pembayaran (Payment)
       ↓
Pendapatan & Dashboard Bisnis
```

---

## 🌟 Fitur Utama

1. **Dashboard Eksekutif Real-time**:
   - Pendapatan bulan berjalan (IDR)
   - Total piutang belum tertagih (Outstanding)
   - Jumlah proyek aktif vs selesai
   - Ekspektasi kas masuk (Pipeline piutang + sisa kontrak proyek aktif)
   - Pipeline penawaran & win rate rasio konversi (Draf → Terkirim → Disetujui → Jadi Proyek)
   - Notifikasi tagihan lewat jatuh tempo (Overdue Alerts)

2. **Manajemen Pelanggan (Direktori Klien)**:
   - Kontak lengkap (WhatsApp, Email, Alamat kantor/rumah)
   - **Unified Customer Profile**: Satu halaman riwayat terpadu yang menampilkan seluruh penawaran, proyek berjalan, invoice termin, dan riwayat pembayaran pelanggan tersebut beserta LTV dan sisa tunggakan.

3. **Sistem Penawaran Harga (Quotation)**:
   - Penomoran otomatis (`QT-2026-0001`)
   - Penyusunan rincian item dinamis (Deskripsi, Kuantitas, Satuan, Harga Satuan, Diskon Item, Subtotal)
   - Diskon dokumen & perhitungan PPN 11% otomatis
   - Siklus status: `Draf` → `Terkirim` → `Disetujui` / `Ditolak` → `Menjadi Proyek`
   - **1-Click Convert to Project**: Konversi penawaran yang disetujui klien langsung menjadi proyek aktif beserta nilai kontraknya.
   - Dokumen formal siap cetak / PDF dengan kop surat dan kolom tanda tangan kesepakatan.

4. **Manajemen Proyek (Work Order / SPK)**:
   - Penomoran otomatis (`PRJ-2026-0001`)
   - Pelacakan nilai kontrak, tanggal mulai, dan target selesai (due date)
   - **Financial Health Tracker Proyek**: Membandingkan Nilai Kontrak vs Total Invoice Ditagihkan vs Kas Terbayar vs Sisa Piutang dengan bar visual interaktif.
   - Tombol cepat terbitkan invoice termin proyek (`+ Buat Invoice Proyek`).

5. **Sistem Penagihan (Invoice & Faktur)**:
   - Penomoran otomatis (`INV-2026-0001`)
   - Integrasi ke proyek atau tagihan langsung mandiri
   - Kalkulasi status cerdas (`issued`, `partially_paid`, `paid`, `overdue`, `cancelled`)
   - Dokumen faktur resmi siap cetak / PDF lengkap dengan instruksi transfer bank (BCA, nomor rekening, atas nama).

6. **Pencatatan Pembayaran & Buku Kas**:
   - Dukungan metode: Transfer Bank, Tunai (Cash), E-Wallet (QRIS), Lainnya
   - **Validasi Ketat Anti-Overpayment**: Mencegah kesalahan input nominal pembayaran melebihi sisa saldo tagihan invoice.
   - Ledger kas masuk terintegrasi langsung ke riwayat invoice, klien, dan proyek.

7. **Laporan & Analitik Bisnis**:
   - Tren penerimaan kas per bulan
   - Kontribusi pendapatan per klien & per proyek
   - Tingkat konversi penjualan penawaran
   - Analisis usia piutang (Aging Receivables & Overdue)
   - Distribusi status operasional seluruh proyek

8. **Pengaturan Usaha & Multi-Tenant RBAC**:
   - Profil UMKM, kategori jasa, rekening bank resmi untuk invoice
   - Manajemen anggota tim dengan isolasi hak akses (`owner`, `admin`, `staff`)
   - Tombol reset data demo untuk evaluasi instan.

---

## 🛠️ Tech Stack & Arsitektur

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript (Strict), Tailwind CSS
- **Ikon**: Lucide React
- **Backend & Database**: Supabase PostgreSQL + Auth + Storage
- **Keamanan Multi-Tenant**: Row Level Security (RLS) pada seluruh tabel (`customers`, `quotations`, `quotation_items`, `projects`, `invoices`, `invoice_items`, `payments`) dengan isolasi berbasis `business_id`
- **Format Lokal**: Bahasa Indonesia, format Rupiah (`Rp 12.500.000`), penanggalan lokal (`12 November 2026`)
- **Mode Demo Terbina (Built-in)**: Termasuk dataset realistis *"RuangKarya Interior"* (10 pelanggan, 8 penawaran, 5 proyek, 8 invoice, transaksi pembayaran) yang tersimpan di `localStorage` klien sehingga seluruh fitur dapat diuji coba seketika tanpa konfigurasi database awal!

---

## 🚀 Panduan Menjalankan Proyek (Local Development)

### 1. Prasyarat
- Node.js (versi 18+)
- npm / pnpm

### 2. Instalasi & Menjalankan Dev Server
```bash
# Clone atau buka direktori proyek
cd Projectks

# Install dependencies
npm install

# Jalankan server pengembangan
npm run dev
```

Buka peramban di `http://localhost:3000`.

---

## 🗄️ Setup Database Supabase

Jika ingin menghubungkan ke database Supabase Anda sendiri:

1. Buat proyek baru di [Supabase Dashboard](https://app.supabase.com).
2. Buka menu **SQL Editor** pada dashboard Supabase Anda.
3. Jalankan file migrasi terpadu:
   - `supabase/schema.sql` (Atau jalankan `001_initial_schema.sql`, `002_rls_policies.sql`, dan `003_seed_data.sql` secara berurutan).
4. Buat file `.env.local` di root proyek dan masukkan kredensial:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```
5. Jalankan `npm run build` dan deploy ke **Vercel** dengan 1-klik.

---

## 📁 Struktur Direktori

```
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── customers/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx
│   ├── quotations/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── print/page.tsx
│   ├── projects/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx
│   ├── invoices/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── print/page.tsx
│   ├── payments/
│   │   └── page.tsx
│   ├── reports/
│   │   └── page.tsx
│   ├── settings/
│   │   └── page.tsx
│   ├── onboarding/
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   └── layout/
│       ├── sidebar.tsx
│       ├── topbar.tsx
│       └── app-shell.tsx
├── lib/
│   ├── types/
│   │   └── database.ts
│   ├── context/
│   │   └── workspace-context.tsx
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── mock-data.ts
│   └── utils/
│       ├── calculations.ts
│       ├── formatters.ts
│       └── id-generator.ts
├── supabase/
│   ├── schema.sql
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_rls_policies.sql
│       └── 003_seed_data.sql
└── docs/
    ├── ARCHITECTURE.md
    └── DEVLOG.md
```

