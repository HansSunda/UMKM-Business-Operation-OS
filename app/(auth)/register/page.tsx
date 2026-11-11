'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { createClient } from '../../../lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // Proceed to onboarding
      router.push('/onboarding');
    } catch {
      // In local demo mode, proceed to onboarding directly
      router.push('/onboarding');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white mx-auto shadow-md shadow-emerald-500/20">
            <Building2 className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Daftar Akun UMKM Baru
          </h1>
          <p className="text-xs text-slate-500">
            Mulai kelola alur pelanggan, penawaran, proyek, dan penagihan
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Nama Lengkap Pemilik
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Budi Santoso"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-xs text-slate-900 focus:outline-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="budi@perusahaan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-xs text-slate-900 focus:outline-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password (Minimal 6 karakter)
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-xs text-slate-900 focus:outline-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 px-4 font-semibold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-50 text-xs mt-2"
          >
            <span>{loading ? 'Mendaftarkan...' : 'Lanjutkan ke Info Bisnis'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t">
          Sudah memiliki akun?{' '}
          <Link href="/login" className="font-semibold text-emerald-600 hover:underline">
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}
