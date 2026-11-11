'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Search,
  Filter,
  ChevronRight,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import { useWorkspace } from '../../lib/context/workspace-context';
import {
  formatRupiah,
  formatDateIndo,
  translateStatus,
  getStatusBadgeClass,
} from '../../lib/utils/formatters';

export default function QuotationsPage() {
  const { quotations, customers } = useWorkspace();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredQuotations = quotations.filter((q) => {
    const cust = customers.find((c) => c.id === q.customer_id);
    const matchesSearch =
      q.quotation_number.toLowerCase().includes(search.toLowerCase()) ||
      (cust && cust.name.toLowerCase().includes(search.toLowerCase())) ||
      (q.notes && q.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: quotations.length,
    draft: quotations.filter((q) => q.status === 'draft').length,
    sent: quotations.filter((q) => q.status === 'sent').length,
    accepted: quotations.filter((q) => q.status === 'accepted').length,
    converted: quotations.filter((q) => q.status === 'converted').length,
    rejected: quotations.filter((q) => q.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Penawaran Harga (Quotation)</h1>
          <p className="text-sm text-slate-500 mt-1">
            Buat, kirim, dan pantau status penawaran harga kepada calon klien
          </p>
        </div>
        <Link
          href="/quotations/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
        >
          <Plus className="h-4 w-4" />
          Buat Penawaran Baru
        </Link>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex overflow-x-auto border-b border-slate-200 sm:border-0 gap-1 pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Semua ({statusCounts.all})
          </button>
          <button
            onClick={() => setStatusFilter('sent')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === 'sent'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Terkirim ({statusCounts.sent})
          </button>
          <button
            onClick={() => setStatusFilter('accepted')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === 'accepted'
                ? 'bg-amber-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Disetujui ({statusCounts.accepted})
          </button>
          <button
            onClick={() => setStatusFilter('converted')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === 'converted'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Jadi Proyek ({statusCounts.converted})
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === 'draft'
                ? 'bg-slate-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Draf ({statusCounts.draft})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nomor atau klien..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Quotations Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {filteredQuotations.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-slate-800">Tidak ada penawaran ditemukan</h3>
            <p className="text-xs text-slate-500 mt-1">
              {search ? 'Coba ganti kata kunci pencarian' : 'Mulai dengan membuat penawaran baru untuk klien'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">No. Penawaran</th>
                  <th className="py-3.5 px-4">Klien</th>
                  <th className="py-3.5 px-4">Tanggal & Masa Berlaku</th>
                  <th className="py-3.5 px-4">Nilai Penawaran</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuotations.map((quotation) => {
                  const customer = customers.find((c) => c.id === quotation.customer_id);

                  return (
                    <tr key={quotation.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-4 sm:px-6">
                        <Link
                          href={`/quotations/${quotation.id}`}
                          className="font-semibold text-slate-900 hover:text-emerald-600 block"
                        >
                          {quotation.quotation_number}
                        </Link>
                        {quotation.notes && (
                          <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {quotation.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-xs">
                        <div className="font-medium text-slate-800">{customer?.name || '-'}</div>
                        {customer?.phone && (
                          <div className="text-slate-400 text-[11px] mt-0.5">{customer.phone}</div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600 space-y-0.5">
                        <div>Dibuat: {formatDateIndo(quotation.quotation_date)}</div>
                        <div className="text-slate-400 text-[11px]">
                          Berlaku s/d: {formatDateIndo(quotation.valid_until)}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-900 text-xs">
                        {formatRupiah(quotation.total)}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${getStatusBadgeClass(quotation.status)}`}>
                          {translateStatus(quotation.status)}
                        </span>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <Link
                          href={`/quotations/${quotation.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                        >
                          Lihat Detail <ChevronRight className="h-3.5 w-3.5" />
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
