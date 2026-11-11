'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  ChevronRight,
  AlertCircle,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { useWorkspace } from '../../lib/context/workspace-context';
import {
  formatRupiah,
  formatDateIndo,
  translateStatus,
  getStatusBadgeClass,
} from '../../lib/utils/formatters';

export default function InvoicesPage() {
  const { invoices, customers, projects, getInvoiceWithPayments } = useWorkspace();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const todayStr = new Date().toISOString().split('T')[0];

  const processedInvoices = invoices.map((inv) => {
    const invData = getInvoiceWithPayments(inv.id);
    return {
      ...inv,
      total_paid: invData?.total_paid || 0,
      remaining_balance: invData?.remaining_balance || 0,
      effective_status: invData?.status || inv.status,
    };
  });

  const filteredInvoices = processedInvoices.filter((inv) => {
    const cust = customers.find((c) => c.id === inv.customer_id);
    const proj = projects.find((p) => p.id === inv.project_id);

    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      (cust && cust.name.toLowerCase().includes(search.toLowerCase())) ||
      (proj && proj.name.toLowerCase().includes(search.toLowerCase())) ||
      (inv.notes && inv.notes.toLowerCase().includes(search.toLowerCase()));

    let matchesStatus = true;
    if (statusFilter === 'unpaid') {
      matchesStatus = inv.effective_status === 'issued' || inv.effective_status === 'partially_paid';
    } else if (statusFilter === 'overdue') {
      matchesStatus = inv.effective_status === 'overdue';
    } else if (statusFilter === 'paid') {
      matchesStatus = inv.effective_status === 'paid';
    } else if (statusFilter !== 'all') {
      matchesStatus = inv.effective_status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  const totalOutstanding = processedInvoices
    .filter((i) => i.effective_status !== 'cancelled' && i.effective_status !== 'paid')
    .reduce((s, i) => s + i.remaining_balance, 0);

  const totalOverdue = processedInvoices
    .filter((i) => i.effective_status === 'overdue')
    .reduce((s, i) => s + i.remaining_balance, 0);

  const statusCounts = {
    all: invoices.length,
    unpaid: processedInvoices.filter((i) => i.effective_status === 'issued' || i.effective_status === 'partially_paid').length,
    overdue: processedInvoices.filter((i) => i.effective_status === 'overdue').length,
    paid: processedInvoices.filter((i) => i.effective_status === 'paid').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tagihan & Invoice</h1>
          <p className="text-sm text-slate-500 mt-1">
            Kelola penagihan klien, pantau sisa piutang, dan catat pelunasan termin
          </p>
        </div>
        <Link
          href="/invoices/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
        >
          <Plus className="h-4 w-4" />
          Buat Invoice Baru
        </Link>
      </div>

      {/* Mini KPI Cards for Invoices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-500">Total Piutang Berjalan</span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {formatRupiah(totalOutstanding)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {statusCounts.unpaid + statusCounts.overdue} invoice belum lunas
          </div>
        </div>

        <div className="rounded-xl border border-rose-200 bg-rose-50/30 p-4 shadow-sm">
          <span className="text-xs font-semibold text-rose-700">Piutang Jatuh Tempo (Overdue)</span>
          <div className="text-xl font-bold text-rose-600 mt-1">
            {formatRupiah(totalOverdue)}
          </div>
          <div className="text-[11px] text-rose-600 mt-0.5">
            {statusCounts.overdue} invoice membutuhkan follow-up
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-xs font-medium text-slate-500">Tagihan Lunas</span>
          <div className="text-xl font-bold text-emerald-600 mt-1">
            {statusCounts.paid} Tagihan
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Pembayaran telah berhasil diterima penuh
          </div>
        </div>
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
            onClick={() => setStatusFilter('unpaid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === 'unpaid'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Menunggu Pembayaran ({statusCounts.unpaid})
          </button>
          <button
            onClick={() => setStatusFilter('overdue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === 'overdue'
                ? 'bg-rose-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Jatuh Tempo ({statusCounts.overdue})
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === 'paid'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Lunas ({statusCounts.paid})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari no invoice atau nama klien..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-slate-800">Tidak ada invoice ditemukan</h3>
            <p className="text-xs text-slate-500 mt-1">
              Buat tagihan baru untuk proyek atau jasa yang telah dilakukan
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">No. Invoice</th>
                  <th className="py-3.5 px-4">Klien & Proyek</th>
                  <th className="py-3.5 px-4">Jatuh Tempo</th>
                  <th className="py-3.5 px-4">Total Tagihan</th>
                  <th className="py-3.5 px-4">Terbayar</th>
                  <th className="py-3.5 px-4">Sisa Saldo</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => {
                  const customer = customers.find((c) => c.id === inv.customer_id);
                  const project = projects.find((p) => p.id === inv.project_id);

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-4 sm:px-6">
                        <Link
                          href={`/invoices/${inv.id}`}
                          className="font-semibold text-slate-900 hover:text-emerald-600 block"
                        >
                          {inv.invoice_number}
                        </Link>
                        {inv.notes && (
                          <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{inv.notes}</div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-xs">
                        <div className="font-semibold text-slate-800">{customer?.name || '-'}</div>
                        {project && (
                          <div className="text-slate-500 text-[11px] mt-0.5 truncate max-w-xs">
                            Proyek: {project.name}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600">
                        <div>{formatDateIndo(inv.due_date)}</div>
                        {inv.effective_status === 'overdue' && (
                          <div className="text-rose-600 font-semibold text-[10px]">Lewat Jatuh Tempo</div>
                        )}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-900 text-xs">
                        {formatRupiah(inv.total)}
                      </td>
                      <td className="py-4 px-4 text-emerald-600 font-medium text-xs">
                        {formatRupiah(inv.total_paid)}
                      </td>
                      <td className="py-4 px-4 font-semibold text-xs">
                        {inv.remaining_balance > 0 ? (
                          <span className={inv.effective_status === 'overdue' ? 'text-rose-600' : 'text-amber-600'}>
                            {formatRupiah(inv.remaining_balance)}
                          </span>
                        ) : (
                          <span className="text-slate-400">Rp 0</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${getStatusBadgeClass(inv.effective_status)}`}>
                          {translateStatus(inv.effective_status)}
                        </span>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <Link
                          href={`/invoices/${inv.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                        >
                          Buka &rarr;
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
