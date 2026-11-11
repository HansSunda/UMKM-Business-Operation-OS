'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  Briefcase,
  CreditCard,
  BarChart3,
  Settings,
  Building2,
  X,
} from 'lucide-react';
import { useWorkspace } from '../../lib/context/workspace-context';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { business } = useWorkspace();

  const navSections = [
    {
      title: null,
      items: [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      ],
    },
    {
      title: 'PENJUALAN',
      items: [
        { name: 'Pelanggan', href: '/customers', icon: Users },
        { name: 'Penawaran', href: '/quotations', icon: FileText },
        { name: 'Invoice', href: '/invoices', icon: Receipt },
      ],
    },
    {
      title: 'OPERASIONAL',
      items: [
        { name: 'Proyek', href: '/projects', icon: Briefcase },
        { name: 'Pembayaran', href: '/payments', icon: CreditCard },
      ],
    },
    {
      title: 'LAINNYA',
      items: [
        { name: 'Laporan', href: '/reports', icon: BarChart3 },
        { name: 'Pengaturan', href: '/settings', icon: Settings },
      ],
    },
  ];

  const isLinkActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm shadow-emerald-500/20">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-slate-900">OperasiUMKM</span>
              <span className="ml-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">OS</span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Active Workspace Info Card */}
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Bisnis Aktif</div>
          <div className="font-medium text-sm text-slate-800 truncate">{business.name}</div>
          <div className="text-xs text-slate-500 truncate">{business.business_type}</div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {navSections.map((section, idx) => (
            <div key={idx}>
              {section.title && (
                <h3 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  {section.title}
                </h3>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const active = isLinkActive(item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => {
                          if (window.innerWidth < 1024) onClose();
                        }}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          active
                            ? 'bg-emerald-50 text-emerald-700 font-semibold'
                            : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                        }`}
                      >
                        <Icon className={`h-4 w-4 ${active ? 'text-emerald-600' : 'text-slate-400'}`} />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer info */}
        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Versi MVP 1.0</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              Aktif
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
