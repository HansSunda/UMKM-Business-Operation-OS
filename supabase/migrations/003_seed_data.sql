-- ==============================================================================
-- UMKM Business Operations OS — Demo Seed Data
-- Migration: 003_seed_data.sql
-- Business: "RuangKarya Interior" (Jasa Desain Interior & Custom Furniture)
-- ==============================================================================

DO $$
DECLARE
    v_user_id UUID := '00000000-0000-0000-0000-000000000001'::uuid;
    v_business_id UUID := '11111111-1111-1111-1111-111111111111'::uuid;
    
    -- Customer IDs
    v_c1 UUID := 'c0000000-0000-0000-0000-000000000001'::uuid;
    v_c2 UUID := 'c0000000-0000-0000-0000-000000000002'::uuid;
    v_c3 UUID := 'c0000000-0000-0000-0000-000000000003'::uuid;
    v_c4 UUID := 'c0000000-0000-0000-0000-000000000004'::uuid;
    v_c5 UUID := 'c0000000-0000-0000-0000-000000000005'::uuid;
    v_c6 UUID := 'c0000000-0000-0000-0000-000000000006'::uuid;
    v_c7 UUID := 'c0000000-0000-0000-0000-000000000007'::uuid;
    v_c8 UUID := 'c0000000-0000-0000-0000-000000000008'::uuid;
    v_c9 UUID := 'c0000000-0000-0000-0000-000000000009'::uuid;
    v_c10 UUID := 'c0000000-0000-0000-0000-000000000010'::uuid;

    -- Quotation IDs
    v_q1 UUID := 'd0000000-0000-0000-0000-000000000001'::uuid;
    v_q2 UUID := 'd0000000-0000-0000-0000-000000000002'::uuid;
    v_q3 UUID := 'd0000000-0000-0000-0000-000000000003'::uuid;
    v_q4 UUID := 'd0000000-0000-0000-0000-000000000004'::uuid;
    v_q5 UUID := 'd0000000-0000-0000-0000-000000000005'::uuid;
    v_q6 UUID := 'd0000000-0000-0000-0000-000000000006'::uuid;
    v_q7 UUID := 'd0000000-0000-0000-0000-000000000007'::uuid;
    v_q8 UUID := 'd0000000-0000-0000-0000-000000000008'::uuid;

    -- Project IDs
    v_p1 UUID := 'e0000000-0000-0000-0000-000000000001'::uuid;
    v_p2 UUID := 'e0000000-0000-0000-0000-000000000002'::uuid;
    v_p3 UUID := 'e0000000-0000-0000-0000-000000000003'::uuid;
    v_p4 UUID := 'e0000000-0000-0000-0000-000000000004'::uuid;
    v_p5 UUID := 'e0000000-0000-0000-0000-000000000005'::uuid;

    -- Invoice IDs
    v_i1 UUID := 'f0000000-0000-0000-0000-000000000001'::uuid;
    v_i2 UUID := 'f0000000-0000-0000-0000-000000000002'::uuid;
    v_i3 UUID := 'f0000000-0000-0000-0000-000000000003'::uuid;
    v_i4 UUID := 'f0000000-0000-0000-0000-000000000004'::uuid;
    v_i5 UUID := 'f0000000-0000-0000-0000-000000000005'::uuid;
    v_i6 UUID := 'f0000000-0000-0000-0000-000000000006'::uuid;
    v_i7 UUID := 'f0000000-0000-0000-0000-000000000007'::uuid;
    v_i8 UUID := 'f0000000-0000-0000-0000-000000000008'::uuid;

BEGIN
    -- 1. Create or ensure demo profile
    INSERT INTO public.profiles (id, full_name, phone)
    VALUES (v_user_id, 'Budi Santoso', '081234567890')
    ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

    -- 2. Create demo business
    INSERT INTO public.businesses (
        id, name, business_type, owner_id, phone, email, address,
        bank_name, bank_account_number, bank_account_holder
    ) VALUES (
        v_business_id,
        'RuangKarya Interior',
        'Desain Interior & Custom Furniture',
        v_user_id,
        '081122334455',
        'halo@ruangkaryainterior.co.id',
        'Jl. Wijaya Kusuma No. 45, Kebayoran Baru, Jakarta Selatan',
        'BCA',
        '8830192837',
        'PT Ruang Karya Nusantara'
    ) ON CONFLICT (id) DO NOTHING;

    -- 3. Business Member
    INSERT INTO public.business_members (business_id, user_id, role)
    VALUES (v_business_id, v_user_id, 'owner')
    ON CONFLICT (business_id, user_id) DO NOTHING;

    -- 4. 10 Realistic UMKM Customers
    INSERT INTO public.customers (id, business_id, name, phone, email, address, notes) VALUES
    (v_c1, v_business_id, 'PT Citra Graha Nusantara', '081211112222', 'procurement@citragraha.id', 'SCBD Sudirman Kav 52, Lt 18, Jakarta', 'Klien korporat renovasi kantor cabang'),
    (v_c2, v_business_id, 'dr. Anisa Rahmawati, Sp.A', '081333334444', 'anisa.rahma@gmail.com', 'Pondok Indah Bukit Hijau VII No. 12, Jakarta', 'Renovasi klinik anak & interior rumah tinggal'),
    (v_c3, v_business_id, 'Kopi Cerita Senja (Owner: Reza)', '081855556666', 'reza.ceritasenja@yahoo.com', 'Jl. Tebet Timur Dalam Raya No. 29, Jakarta', 'Interior coffee shop 2 lantai'),
    (v_c4, v_business_id, 'Bambang Sudiro', '081777778888', 'bambang.sudiro@gmail.com', 'Cluster Harmoni C5 No. 8, BSD City', 'Custom kitchen set & backdrop TV ruang keluarga'),
    (v_c5, v_business_id, 'Law Firm Siregar & Partners', '081199990000', 'admin@siregarpartners.com', 'Mega Kuningan Barat Blok E, Jakarta', 'Partisi kaca & meeting room acoustics'),
    (v_c6, v_business_id, 'Maya Pratiwi', '081244445555', 'maya.pratiwi92@gmail.com', 'Apartemen Sudirman Suites Tower B unit 2201', 'Full furnish apartemen 2BR studio minimalist'),
    (v_c7, v_business_id, 'PT Solusi Finansial Mandiri', '081388889999', 'office@solusifin.co.id', 'AIA Central Lt. 12, Jl. Jend Sudirman', 'Workstation 24 pax + breakout lounge'),
    (v_c8, v_business_id, 'Hendro Wibowo', '081912345678', 'hendro.wib@gmail.com', 'Menteng Residence No. 88, Jakarta Pusat', 'Walk-in closet master bedroom & vanity table'),
    (v_c9, v_business_id, 'Boutique Cantik Hijab (Ibu Dewi)', '081623456789', 'dewi.boutiquecantik@gmail.com', 'Bintaro Jaya Sektor 7 Blok B No. 3', 'Display rack & lighting toko busana muslim'),
    (v_c10, v_business_id, 'Fajar Ramadhan', '081534567890', 'fajar.ramadhan@hotmail.com', 'Graha Bintaro Cluster Cendana 2 No. 15', 'Custom kamar tidur anak tema Scandinavian')
    ON CONFLICT (id) DO NOTHING;

    -- 5. 8 Realistic Quotations (Lifecycle: draft, sent, accepted, converted, rejected)
    INSERT INTO public.quotations (id, business_id, customer_id, quotation_number, quotation_date, valid_until, status, subtotal, discount, tax, total, notes) VALUES
    (v_q1, v_business_id, v_c1, 'QT-2026-0001', CURRENT_DATE - INTERVAL '40 days', CURRENT_DATE - INTERVAL '10 days', 'converted', 45000000, 2000000, 4730000, 47730000, 'Renovasi meeting room & direksi. PPN 11% dimasukkan.'),
    (v_q2, v_business_id, v_c2, 'QT-2026-0002', CURRENT_DATE - INTERVAL '35 days', CURRENT_DATE - INTERVAL '5 days', 'converted', 65000000, 0, 0, 65000000, 'Interior klinik ramah anak. Non-PPN sesuai kesepakatan.'),
    (v_q3, v_business_id, v_c3, 'QT-2026-0003', CURRENT_DATE - INTERVAL '25 days', CURRENT_DATE + INTERVAL '5 days', 'converted', 38000000, 1000000, 0, 37000000, 'Coffee bar counter + seating area industrial look.'),
    (v_q4, v_business_id, v_c4, 'QT-2026-0004', CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE + INTERVAL '10 days', 'converted', 28500000, 500000, 0, 28000000, 'Kitchen set HPL taco putih doff + marmer sintetis.'),
    (v_q5, v_business_id, v_c5, 'QT-2026-0005', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '15 days', 'converted', 55000000, 2500000, 5775000, 58275000, 'Ruang sidang partner & lemari arsip kedap suara.'),
    (v_q6, v_business_id, v_c6, 'QT-2026-0006', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days', 'accepted', 32000000, 1000000, 0, 31000000, 'Furnishing apartemen unit 2201. Menunggu SPK & DP.'),
    (v_q7, v_business_id, v_c7, 'QT-2026-0007', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '25 days', 'sent', 78000000, 3000000, 8250000, 83250000, 'Paket workstation open office 24 orang + cabling tray.'),
    (v_q8, v_business_id, v_c9, 'QT-2026-0008', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '28 days', 'draft', 18500000, 0, 0, 18500000, 'Display busana muslim bahan kayu jati belanda refinished.')
    ON CONFLICT (id) DO NOTHING;

    -- Quotation Line Items
    INSERT INTO public.quotation_items (quotation_id, description, quantity, unit, unit_price, discount, subtotal, sort_order) VALUES
    (v_q1, 'Meja Konferensi Direksi Kayu Jati 10 Seat + Power Hub', 1, 'unit', 18000000, 0, 18000000, 1),
    (v_q1, 'Acoustic Wall Panel fabric padded', 35, 'm2', 600000, 0, 21000000, 2),
    (v_q1, 'Credenza Back Cabinet 300x50x85 HPL Taco', 1, 'unit', 6000000, 0, 6000000, 3),

    (v_q2, 'Custom Ruang Periksa Dokter Anak & Wallpaper Custom', 1, 'paket', 35000000, 0, 35000000, 1),
    (v_q2, 'Play Area & Ruang Tunggu Pasien Anak', 1, 'paket', 30000000, 0, 30000000, 2),

    (v_q4, 'Kitchen Set Bawah Multiplek 18mm Fin HPL Taco', 4.5, 'meter lari', 3200000, 0, 14400000, 1),
    (v_q4, 'Kitchen Set Atas LED strip hidden', 4.5, 'meter lari', 2800000, 0, 12600000, 2),
    (v_q4, 'Top Table Solid Surface Hitam Bintik', 1, 'unit', 1500000, 0, 1500000, 3)
    ON CONFLICT DO NOTHING;

    -- 6. 5 Realistic Projects Converted from Quotations
    INSERT INTO public.projects (id, business_id, customer_id, quotation_id, project_number, name, description, start_date, due_date, status, contract_value) VALUES
    (v_p1, v_business_id, v_c1, v_q1, 'PRJ-2026-0001', 'Renovasi Ruang Meeting PT Citra Graha', 'Pengerjaan interior ruang meeting lt. 18', CURRENT_DATE - INTERVAL '35 days', CURRENT_DATE - INTERVAL '5 days', 'completed', 47730000),
    (v_p2, v_business_id, v_c2, v_q2, 'PRJ-2026-0002', 'Fit-Out Klinik Anak dr. Anisa', 'Pengerjaan ruang periksa & ruang tunggu anak', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '15 days', 'active', 65000000),
    (v_p3, v_business_id, v_c3, v_q3, 'PRJ-2026-0003', 'Interior Kopi Cerita Senja Tebet', 'Pekerjaan meja bar & bangku industrial', CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE + INTERVAL '20 days', 'active', 37000000),
    (v_p4, v_business_id, v_c4, v_q4, 'PRJ-2026-0004', 'Kitchen Set Modern Rumah Pak Bambang', 'Kitchen set HPL & kabinet kulkas', CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '5 days', 'active', 28000000),
    (v_p5, v_business_id, v_c5, v_q5, 'PRJ-2026-0005', 'Partisi Akustik Siregar & Partners', 'Penyekat ruangan kedap suara ruang sidang', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '30 days', 'active', 58275000)
    ON CONFLICT (id) DO NOTHING;

    -- 7. 8 Realistic Invoices
    INSERT INTO public.invoices (id, business_id, customer_id, project_id, invoice_number, issue_date, due_date, status, subtotal, discount, tax, total, notes) VALUES
    -- Project 1 (Fully Paid)
    (v_i1, v_business_id, v_c1, v_p1, 'INV-2026-0001', CURRENT_DATE - INTERVAL '35 days', CURRENT_DATE - INTERVAL '20 days', 'paid', 23865000, 0, 0, 23865000, 'DP 50% Pekerjaan Ruang Meeting'),
    (v_i2, v_business_id, v_c1, v_p1, 'INV-2026-0002', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE - INTERVAL '2 days', 'paid', 23865000, 0, 0, 23865000, 'Pelunasan 50% Serah Terima BAST Ruang Meeting'),

    -- Project 2 (Partially Paid)
    (v_i3, v_business_id, v_c2, v_p2, 'INV-2026-0003', CURRENT_DATE - INTERVAL '28 days', CURRENT_DATE - INTERVAL '14 days', 'paid', 32500000, 0, 0, 32500000, 'Termin 1 (DP 50%) Fit-Out Klinik'),
    (v_i4, v_business_id, v_c2, v_p2, 'INV-2026-0004', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '10 days', 'issued', 32500000, 0, 0, 32500000, 'Termin 2 (Progress 50% Furniture onsite)'),

    -- Project 3 (Partially Paid)
    (v_i5, v_business_id, v_c3, v_p3, 'INV-2026-0005', CURRENT_DATE - INTERVAL '18 days', CURRENT_DATE - INTERVAL '4 days', 'partially_paid', 18500000, 0, 0, 18500000, 'DP 50% Bar Counter Kopi Cerita Senja'),

    -- Project 4 (Overdue Invoice!)
    (v_i6, v_business_id, v_c4, v_p4, 'INV-2026-0006', CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '5 days', 'overdue', 14000000, 0, 0, 14000000, 'DP 50% Kitchen Set BSD - Lewat jatuh tempo'),

    -- Project 5 (Issued)
    (v_i7, v_business_id, v_c5, v_p5, 'INV-2026-0007', CURRENT_DATE - INTERVAL '8 days', CURRENT_DATE + INTERVAL '7 days', 'issued', 29137500, 0, 0, 29137500, 'DP 50% Partisi Akustik Kuningan'),

    -- Ad-hoc Service Invoice
    (v_i8, v_business_id, v_c8, NULL, 'INV-2026-0008', CURRENT_DATE - INTERVAL '3 days', CURRENT_DATE + INTERVAL '11 days', 'issued', 4500000, 0, 0, 4500000, 'Jasa Desain 3D Rendering & Gambar Kerja Master Bedroom')
    ON CONFLICT (id) DO NOTHING;

    -- 8. Multiple Payments
    INSERT INTO public.payments (business_id, invoice_id, payment_date, amount, payment_method, reference, notes) VALUES
    (v_business_id, v_i1, CURRENT_DATE - INTERVAL '33 days', 23865000, 'bank_transfer', 'TRF-BCA-98124', 'Lunas DP PT Citra Graha'),
    (v_business_id, v_i2, CURRENT_DATE - INTERVAL '4 days', 23865000, 'bank_transfer', 'TRF-BCA-10492', 'Lunas Pelunasan BAST'),
    (v_business_id, v_i3, CURRENT_DATE - INTERVAL '26 days', 32500000, 'bank_transfer', 'TRF-MDR-77182', 'DP dr. Anisa klinik'),
    (v_business_id, v_i5, CURRENT_DATE - INTERVAL '15 days', 10000000, 'bank_transfer', 'TRF-BCA-55219', 'Cicilan pertama DP Kopi Cerita Senja (Kurang 8.5jt)')
    ON CONFLICT DO NOTHING;

END $$;
