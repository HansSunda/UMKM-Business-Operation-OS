'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Building, Phone, Mail, MapPin, FileText } from 'lucide-react';
import { useWorkspace } from '../../../lib/context/workspace-context';

export default function NewCustomerPage() {
  const router = useRouter();
  const { addCustomer } = useWorkspace();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama pelanggan wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = addCustomer({
        name: name.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
        address: address.trim() || null,
        notes: notes.trim() || null,
      });

      router.push(`/customers/${created.id}`);
    } catch {
      setError('Gagal menambahkan pelanggan');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/customers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Direktori Pelanggan
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">Tambah Pelanggan Baru</h1>
        <p className="text-sm text-slate-500">
          Masukkan informasi kontak klien untuk memudahkan pembuatan penawaran dan penagihan
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Nama Pelanggan / Perusahaan <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              required
              placeholder="Contoh: PT Citra Mandiri atau Ibu Siti Rahayu"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nomor WhatsApp / Telepon
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="tel"
                placeholder="081234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                placeholder="nama@perusahaan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Alamat Kantor / Rumah
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Jl. Jenderal Sudirman No. 12, Jakarta"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Catatan Tambahan
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <textarea
              rows={3}
              placeholder="Catatan preferensi klien, jenis layanan yang diminati, PIC yang dapat dihubungi..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link
            href="/customers"
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Menyimpan...' : 'Simpan Pelanggan'}
          </button>
        </div>
      </form>
    </div>
  );
}
