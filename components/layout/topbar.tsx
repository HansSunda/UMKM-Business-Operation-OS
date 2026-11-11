'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, Plus, RefreshCw, User, ChevronDown, FileText, Receipt, Users, CreditCard } from 'lucide-react';
import { useWorkspace } from '../../lib/context/workspace-context';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, business, resetToDemoData } = useWorkspace();
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const handleReset = () => {
    resetToDemoData();
    setResetConfirm(false);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      {/* Left section: Mobile menu + Business breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-slate-800">{business.name}</span>
          <span className="text-slate-300">/</span>
          <span className="text-xs rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
            {business.business_type}
          </span>
        </div>
      </div>

      {/* Right section: Action Buttons & User Profile */}
      <div className="flex items-center gap-3">
        {/* Reset Demo Data Button (Helper for testing) */}
        {resetConfirm ? (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-rose-600">Reset data?</span>
            <button
              onClick={handleReset}
              className="px-2 py-1 bg-rose-600 text-white rounded font-medium hover:bg-rose-700"
            >
              Ya
            </button>
            <button
              onClick={() => setResetConfirm(false)}
              className="px-2 py-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
            >
              Batal
            </button>
          </div>
        ) : (
          <button
            onClick={() => setResetConfirm(true)}
            title="Reset ke data awal demo"
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset Data Demo
          </button>
        )}

        {/* Quick Actions Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs sm:text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Buat Baru</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-80" />
          </button>

          {showQuickMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowQuickMenu(false)}
              />
              <div className="absolute right-0 mt-2 z-50 w-52 rounded-xl border border-slate-100 bg-white py-1.5 shadow-xl shadow-slate-200/50">
                <Link
                  href="/quotations/new"
                  onClick={() => setShowQuickMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50"
                >
                  <FileText className="h-4 w-4 text-emerald-600" />
                  Buat Penawaran
                </Link>
                <Link
                  href="/invoices/new"
                  onClick={() => setShowQuickMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Receipt className="h-4 w-4 text-blue-600" />
                  Buat Invoice
                </Link>
                <Link
                  href="/customers/new"
                  onClick={() => setShowQuickMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Users className="h-4 w-4 text-purple-600" />
                  Tambah Pelanggan
                </Link>
                <Link
                  href="/payments"
                  onClick={() => setShowQuickMenu(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50"
                >
                  <CreditCard className="h-4 w-4 text-amber-600" />
                  Catat Pembayaran
                </Link>
              </div>
            </>
          )}
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200">
            {user.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div className="hidden md:block text-left text-xs">
            <div className="font-semibold text-slate-800 leading-none">{user.full_name}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Pemilik Bisnis</div>
          </div>
        </div>
      </div>
    </header>
  );
}
