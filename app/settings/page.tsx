'use client';

import React, { useState } from 'react';
import {
  Building2,
  Save,
  CreditCard,
  Users,
  Shield,
  RefreshCw,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { useWorkspace } from '../../lib/context/workspace-context';

export default function SettingsPage() {
  const { business, user, updateBusiness, resetToDemoData } = useWorkspace();

  const [name, setName] = useState(business.name);
  const [businessType, setBusinessType] = useState(business.business_type);
  const [phone, setPhone] = useState(business.phone || '');
  const [email, setEmail] = useState(business.email || '');
  const [address, setAddress] = useState(business.address || '');

  // Bank Info
  const [bankName, setBankName] = useState(business.bank_name || 'BCA');
  const [bankAccountNumber, setBankAccountNumber] = useState(business.bank_account_number || '');
  const [bankAccountHolder, setBankAccountHolder] = useState(business.bank_account_holder || '');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusiness({
      name: name.trim(),
      business_type: businessType.trim(),
      phone: phone.trim() || null,
      email: email.trim() || null,
      address: address.trim() || null,
      bank_name: bankName.trim() || null,
      bank_account_number: bankAccountNumber.trim() || null,
      bank_account_holder: bankAccountHolder.trim() || null,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pengaturan Bisnis</h1>
        <p className="text-sm text-slate-500 mt-1">
          Atur identitas UMKM, rekening pembayaran invoice, dan izin akses tim kerja
        </p>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          Pengaturan bisnis berhasil disimpan dan diperbarui!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identitas Bisnis */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-3 text-slate-900">
            <Building2 className="h-5 w-5 text-emerald-600" />
            <h2 className="font-bold text-sm">Profil & Identitas Perusahaan / Usaha</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Nama Usaha / Brand <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Kategori / Bidang Jasa <span className="text-rose-500">*</span>
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-900 focus:outline-emerald-500"
              >
                <option value="Desain Interior & Custom Furniture">Desain Interior & Custom Furniture</option>
                <option value="Jasa Arsitektur & Perencanaan">Jasa Arsitektur & Perencanaan</option>
                <option value="Wedding Organizer & Event Planner">Wedding Organizer & Event Planner</option>
                <option value="Percetakan & Digital Printing">Percetakan & Digital Printing</option>
                <option value="Studio Fotografi & Videografi">Studio Fotografi & Videografi</option>
                <option value="Katering & Kuliner Acara">Katering & Kuliner Acara</option>
                <option value="Kontraktor Skala Kecil / Renovasi">Kontraktor Skala Kecil / Renovasi</option>
                <option value="Agensi Kreatif & Digital Marketing">Agensi Kreatif & Digital Marketing</option>
                <option value="Lainnya">Layanan Bisnis Lainnya</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Nomor Telepon / WhatsApp Resmi
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email Bisnis
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:outline-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Alamat Lengkap Workshop / Kantor
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:outline-emerald-500"
            />
          </div>
        </div>

        {/* Rekening Pembayaran */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-3 text-slate-900">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <div>
              <h2 className="font-bold text-sm">Rekening Pembayaran Invoice</h2>
              <p className="text-[11px] text-slate-500">
                Informasi ini otomatis tercetak pada dokumen penawaran dan invoice untuk klien
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Bank Penerima
              </label>
              <input
                type="text"
                placeholder="BCA / Mandiri / BRI / BNI"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Nomor Rekening
              </label>
              <input
                type="text"
                placeholder="8830192837"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs font-mono font-semibold text-slate-900 focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Nama Pemilik Rekening
              </label>
              <input
                type="text"
                placeholder="PT Ruang Karya Nusantara"
                value={bankAccountHolder}
                onChange={(e) => setBankAccountHolder(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-900 focus:outline-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Tim & Anggota Workspace */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-3 text-slate-900">
            <Users className="h-5 w-5 text-purple-600" />
            <h2 className="font-bold text-sm">Anggota Tim & Hak Akses (Multi-Tenant RBAC)</h2>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800">{user.full_name}</span>
                <span className="text-slate-400 ml-1.5">(Anda)</span>
                <div className="text-[11px] text-slate-500">{user.phone}</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                Pemilik (Owner)
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800">Siti Rahmawati</span>
                <div className="text-[11px] text-slate-500">081299887766</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10px]">
                Admin Operasional
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800">Doni Setiawan</span>
                <div className="text-[11px] text-slate-500">081377665544</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                Staf Lapangan
              </span>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <Save className="h-4 w-4" />
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}
