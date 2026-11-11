'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, ArrowRight, Sparkles } from 'lucide-react';
import { useWorkspace } from '../../lib/context/workspace-context';

export default function OnboardingPage() {
  const router = useRouter();
  const { updateBusiness } = useWorkspace();

  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Desain Interior & Custom Furniture');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;

    setIsSubmitting(true);
    updateBusiness({
      name: businessName.trim(),
      business_type: businessType,
      phone: phone.trim() || null,
    });

    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white mx-auto shadow-md shadow-emerald-500/20">
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Selamat Datang di OperasiUMKM OS
          </h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Satu langkah singkat untuk menyiapkan ruang kerja operasional bisnis Anda.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Usaha / Bisnis Anda <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: RuangKarya Interior / Studio Foto Senja"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm text-slate-900 focus:outline-emerald-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Bidang Jasa <span className="text-rose-500">*</span>
            </label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-xs text-slate-900 focus:outline-emerald-500"
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

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nomor WhatsApp Bisnis
            </label>
            <input
              type="tel"
              placeholder="081234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm text-slate-900 focus:outline-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !businessName.trim()}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 px-4 font-semibold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-50 text-sm mt-2"
          >
            <span>Mulai Operasional</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
