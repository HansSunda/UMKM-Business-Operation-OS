'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, Mail, Lock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { createClient } from '../../../lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // If demo mode or credentials not matched, show message or allow demo entry
        setError(signInError.message || 'Login gagal, periksa email & password.');
        setLoading(false);
        return;
      }

      router.push('/');
    } catch {
      // In offline / local demo environment, redirect to dashboard
      router.push('/');
    }
  };

  const handleDemoLogin = () => {
    // 1-click entry as Budi Santoso / RuangKarya Interior
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
            Masuk ke OperasiUMKM OS
          </h1>
          <p className="text-xs text-slate-500">
            Sistem operasi terpadu alur kerja bisnis jasa UMKM
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        {/* 1-Click Demo Login Pill */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full flex items-center justify-between rounded-xl bg-emerald-50/80 border border-emerald-200/80 p-3 text-left hover:bg-emerald-100/70 transition"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <div className="text-xs font-bold text-emerald-900">
                Akses Langsung Akun Demo (1-Click)
              </div>
              <div className="text-[11px] text-emerald-700">
                Budi Santoso &bull; RuangKarya Interior (Data Siap Pakai)
              </div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-emerald-600" />
        </button>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <span className="relative bg-white px-3 text-[11px] uppercase tracking-wider text-slate-400">
            atau masuk dengan email
          </span>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Bisnis
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="nama@bisnis.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-xs text-slate-900 focus:outline-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
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
            <span>{loading ? 'Memproses...' : 'Masuk'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t">
          Belum memiliki akun bisnis?{' '}
          <Link href="/register" className="font-semibold text-emerald-600 hover:underline">
            Daftar Usaha Baru
          </Link>
        </div>
      </div>
    </div>
  );
}
