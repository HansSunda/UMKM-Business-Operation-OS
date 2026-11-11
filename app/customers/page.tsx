'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  Receipt,
  Briefcase,
  FileText,
} from 'lucide-react';
import { useWorkspace } from '../../lib/context/workspace-context';
import { formatRupiah } from '../../lib/utils/formatters';

export default function CustomersPage() {
  const { customers, getCustomerSummary } = useWorkspace();
  const [search, setSearch] = useState('');

  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.notes && c.notes.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Direktori Pelanggan</h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola data kontak, riwayat penawaran, proyek, dan tagihan setiap klien
          </p>
        </div>
        <Link
          href="/customers/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
        >
          <Plus className="h-4 w-4" />
          Tambah Pelanggan
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari nama pelanggan, telepon, atau catatan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Customer List Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-slate-800">Tidak ada pelanggan ditemukan</h3>
            <p className="text-xs text-slate-500 mt-1">
              Coba kata kunci pencarian lain atau tambahkan pelanggan baru
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Nama Pelanggan</th>
                  <th className="py-3.5 px-4">Kontak</th>
                  <th className="py-3.5 px-4">Aktivitas Terkait</th>
                  <th className="py-3.5 px-4">Total Belanja</th>
                  <th className="py-3.5 px-4">Sisa Piutang</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((customer) => {
                  const summary = getCustomerSummary(customer.id);

                  return (
                    <tr key={customer.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-4 sm:px-6">
                        <Link
                          href={`/customers/${customer.id}`}
                          className="font-semibold text-slate-900 hover:text-emerald-600 block"
                        >
                          {customer.name}
                        </Link>
                        {customer.notes && (
                          <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                            {customer.notes}
                          </div>
                        )}
                        {customer.address && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate max-w-xs">{customer.address}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-xs space-y-1">
                        {customer.phone && (
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Phone className="h-3 w-3 text-slate-400" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                        {customer.email && (
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Mail className="h-3 w-3 text-slate-400" />
                            <span className="truncate max-w-[160px]">{customer.email}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-xs">
                        <div className="flex items-center gap-3 text-slate-600">
                          <span className="inline-flex items-center gap-1" title="Jumlah Penawaran">
                            <FileText className="h-3.5 w-3.5 text-slate-400" />
                            {summary.quotations.length}
                          </span>
                          <span className="inline-flex items-center gap-1" title="Jumlah Proyek">
                            <Briefcase className="h-3.5 w-3.5 text-blue-500" />
                            {summary.projects.length}
                          </span>
                          <span className="inline-flex items-center gap-1" title="Jumlah Tagihan">
                            <Receipt className="h-3.5 w-3.5 text-emerald-500" />
                            {summary.invoices.length}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-900 text-xs">
                        {formatRupiah(summary.totalRevenue)}
                      </td>
                      <td className="py-4 px-4 text-xs">
                        {summary.outstandingBalance > 0 ? (
                          <span className="font-semibold text-amber-600">
                            {formatRupiah(summary.outstandingBalance)}
                          </span>
                        ) : (
                          <span className="text-slate-400">Tidak ada piutang</span>
                        )}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <Link
                          href={`/customers/${customer.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                        >
                          Lihat Profil <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
