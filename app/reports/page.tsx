'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  Briefcase,
  FileText,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { useWorkspace } from '../../lib/context/workspace-context';
import { formatRupiah, formatDateIndo, translateStatus } from '../../lib/utils/formatters';

export default function ReportsPage() {
  const {
    customers,
    quotations,
    projects,
    invoices,
    payments,
    getInvoiceWithPayments,
    getProjectWithFinancials,
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState<'revenue' | 'sales' | 'receivables' | 'projects'>('revenue');

  // --- 1. REVENUE CALCULATIONS ---
  // Revenue by Month (Group payments by YYYY-MM)
  const monthlyRevenueMap: Record<string, number> = {};
  payments.forEach((p) => {
    const key = p.payment_date.substring(0, 7); // 'YYYY-MM'
    monthlyRevenueMap[key] = (monthlyRevenueMap[key] || 0) + p.amount;
  });

  const monthlyRevenueList = Object.entries(monthlyRevenueMap)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([month, total]) => {
      const [y, m] = month.split('-');
      const date = new Date(parseInt(y), parseInt(m) - 1, 1);
      const label = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date);
      return { month, label, total };
    });

  const maxMonthRevenue = Math.max(...monthlyRevenueList.map((m) => m.total), 1);

  // Revenue by Customer
  const customerRevenueMap: Record<string, number> = {};
  payments.forEach((p) => {
    const inv = invoices.find((i) => i.id === p.invoice_id);
    if (inv) {
      customerRevenueMap[inv.customer_id] = (customerRevenueMap[inv.customer_id] || 0) + p.amount;
    }
  });

  const customerRevenueList = Object.entries(customerRevenueMap)
    .map(([custId, total]) => {
      const cust = customers.find((c) => c.id === custId);
      return {
        id: custId,
        name: cust?.name || 'Pelanggan Tidak Dikenal',
        total,
      };
    })
    .sort((a, b) => b.total - a.total);

  // Revenue by Project
  const projectRevenueMap: Record<string, number> = {};
  payments.forEach((p) => {
    const inv = invoices.find((i) => i.id === p.invoice_id);
    if (inv && inv.project_id) {
      projectRevenueMap[inv.project_id] = (projectRevenueMap[inv.project_id] || 0) + p.amount;
    }
  });

  const projectRevenueList = Object.entries(projectRevenueMap)
    .map(([projId, total]) => {
      const proj = projects.find((p) => p.id === projId);
      return {
        id: projId,
        name: proj?.name || 'Proyek Tidak Dikenal',
        project_number: proj?.project_number,
        contract_value: proj?.contract_value || 0,
        total,
      };
    })
    .sort((a, b) => b.total - a.total);

  // --- 2. SALES & QUOTATION CALCULATIONS ---
  const totalQuotationsCount = quotations.length;
  const acceptedCount = quotations.filter((q) => q.status === 'accepted').length;
  const convertedCount = quotations.filter((q) => q.status === 'converted').length;
  const rejectedCount = quotations.filter((q) => q.status === 'rejected').length;
  const draftCount = quotations.filter((q) => q.status === 'draft').length;
  const sentCount = quotations.filter((q) => q.status === 'sent').length;

  const totalWon = acceptedCount + convertedCount;
  const conversionRate = totalQuotationsCount > 0 ? Math.round((totalWon / totalQuotationsCount) * 100) : 0;

  // --- 3. RECEIVABLES & AGING CALCULATIONS ---
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  let totalInvoicedAmount = 0;
  let totalPaidAmount = 0;
  let totalOutstandingAmount = 0;
  let totalOverdueAmount = 0;

  invoices.forEach((inv) => {
    if (inv.status !== 'cancelled') {
      const invData = getInvoiceWithPayments(inv.id);
      totalInvoicedAmount += inv.total;
      totalPaidAmount += invData?.total_paid || 0;
      const remaining = invData?.remaining_balance || 0;
      totalOutstandingAmount += remaining;

      if (remaining > 0 && inv.due_date < todayStr) {
        totalOverdueAmount += remaining;
      }
    }
  });

  // --- 4. PROJECTS OPERATIONAL CALCULATIONS ---
  const activeProjectsCount = projects.filter((p) => p.status === 'active').length;
  const completedProjectsCount = projects.filter((p) => p.status === 'completed').length;
  const cancelledProjectsCount = projects.filter((p) => p.status === 'cancelled').length;
  const onHoldProjectsCount = projects.filter((p) => p.status === 'on_hold').length;
  const leadProjectsCount = projects.filter((p) => p.status === 'lead').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Laporan & Analitik Bisnis</h1>
        <p className="text-sm text-slate-500 mt-1">
          Analisis mendalam mengenai pendapatan kas, efisiensi penagihan piutang, dan tingkat konversi penjualan
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('revenue')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'revenue'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          Pendapatan (Revenue)
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'sales'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="h-4 w-4" />
          Penjualan & Konversi
        </button>
        <button
          onClick={() => setActiveTab('receivables')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'receivables'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          Piutang & Jatuh Tempo
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition ${
            activeTab === 'projects'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="h-4 w-4" />
          Status Operasional Proyek
        </button>
      </div>

      {/* TAB 1: REVENUE REPORT */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          {/* Revenue by Month Bar Graph */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Penerimaan Pendapatan Kas per Bulan</h2>
            <p className="text-xs text-slate-500">
              Total pembayaran yang telah diterima ke rekening bank atau kas bisnis
            </p>

            <div className="space-y-3 pt-2">
              {monthlyRevenueList.map((m) => {
                const percent = Math.round((m.total / maxMonthRevenue) * 100);
                return (
                  <div key={m.month} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700">{m.label}</span>
                      <span className="font-bold text-emerald-600">{formatRupiah(m.total)}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenue by Customer & Revenue by Project */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* By Customer */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900">Kontribusi Pendapatan per Klien</h2>
              <div className="divide-y divide-slate-100">
                {customerRevenueList.slice(0, 6).map((c, idx) => (
                  <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-medium w-4">{idx + 1}.</span>
                      <span className="font-semibold text-slate-800">{c.name}</span>
                    </div>
                    <span className="font-bold text-emerald-600">{formatRupiah(c.total)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* By Project */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900">Realisasi Pendapatan per Proyek</h2>
              <div className="divide-y divide-slate-100">
                {projectRevenueList.slice(0, 6).map((p, idx) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-medium w-4">{idx + 1}.</span>
                      <div>
                        <span className="font-semibold text-slate-800">{p.name}</span>
                        <div className="text-[10px] text-slate-400">
                          Kontrak: {formatRupiah(p.contract_value)}
                        </div>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-600">{formatRupiah(p.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SALES & CONVERSION */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">Total Penawaran Dibuat</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">{totalQuotationsCount}</div>
              <div className="text-xs text-slate-400 mt-1">Keseluruhan prospek penawaran</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">Penawaran Diterima & Jadi Proyek</span>
              <div className="text-2xl font-bold text-emerald-600 mt-1">{totalWon}</div>
              <div className="text-xs text-slate-400 mt-1">{convertedCount} telah konversi jadi proyek</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">Penawaran Ditolak</span>
              <div className="text-2xl font-bold text-rose-600 mt-1">{rejectedCount}</div>
              <div className="text-xs text-slate-400 mt-1">Prospek tidak berlanjut</div>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-5 shadow-sm">
              <span className="text-xs text-emerald-800 font-medium">Tingkat Konversi (Win Rate)</span>
              <div className="text-3xl font-black text-emerald-600 mt-1">{conversionRate}%</div>
              <div className="text-xs text-emerald-700 mt-1">Rasio keberhasilan penutupan penjualan</div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Distribusi Status Penawaran</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
                <span className="text-xs text-slate-500">Draf</span>
                <div className="text-lg font-bold text-slate-800 mt-1">{draftCount}</div>
              </div>
              <div className="rounded-lg bg-blue-50 p-3 border border-blue-100">
                <span className="text-xs text-blue-700">Terkirim</span>
                <div className="text-lg font-bold text-blue-800 mt-1">{sentCount}</div>
              </div>
              <div className="rounded-lg bg-amber-50 p-3 border border-amber-100">
                <span className="text-xs text-amber-700">Disetujui</span>
                <div className="text-lg font-bold text-amber-800 mt-1">{acceptedCount}</div>
              </div>
              <div className="rounded-lg bg-emerald-50 p-3 border border-emerald-100">
                <span className="text-xs text-emerald-700">Jadi Proyek</span>
                <div className="text-lg font-bold text-emerald-800 mt-1">{convertedCount}</div>
              </div>
              <div className="rounded-lg bg-rose-50 p-3 border border-rose-100">
                <span className="text-xs text-rose-700">Ditolak</span>
                <div className="text-lg font-bold text-rose-800 mt-1">{rejectedCount}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RECEIVABLES & AGING */}
      {activeTab === 'receivables' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">Total Nilai Tagihan Terbit</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">{formatRupiah(totalInvoicedAmount)}</div>
              <div className="text-xs text-slate-400 mt-1">Akumulasi seluruh invoice aktif</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">Total Berhasil Diterima</span>
              <div className="text-2xl font-bold text-emerald-600 mt-1">{formatRupiah(totalPaidAmount)}</div>
              <div className="text-xs text-emerald-600 mt-1">
                {totalInvoicedAmount > 0
                  ? Math.round((totalPaidAmount / totalInvoicedAmount) * 100)
                  : 0}% rasio penagihan kas
              </div>
            </div>

            <div className="rounded-xl border border-rose-200 bg-rose-50/30 p-5 shadow-sm">
              <span className="text-xs text-rose-700 font-semibold">Total Piutang Jatuh Tempo (Overdue)</span>
              <div className="text-2xl font-bold text-rose-600 mt-1">{formatRupiah(totalOverdueAmount)}</div>
              <div className="text-xs text-rose-600 mt-1">Memerlukan penagihan segera</div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Daftar Piutang yang Perlu Ditindaklanjuti</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="py-2.5 px-3">No. Invoice</th>
                    <th className="py-2.5 px-3">Pelanggan</th>
                    <th className="py-2.5 px-3">Jatuh Tempo</th>
                    <th className="py-2.5 px-3">Total Invoice</th>
                    <th className="py-2.5 px-3">Sisa Piutang</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices
                    .filter((i) => {
                      const data = getInvoiceWithPayments(i.id);
                      return (data?.remaining_balance || 0) > 0 && i.status !== 'cancelled';
                    })
                    .map((inv) => {
                      const cust = customers.find((c) => c.id === inv.customer_id);
                      const invData = getInvoiceWithPayments(inv.id);
                      const isOverdue = inv.due_date < todayStr;

                      return (
                        <tr key={inv.id} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-semibold text-slate-900">
                            <Link href={`/invoices/${inv.id}`} className="hover:text-emerald-600">
                              {inv.invoice_number}
                            </Link>
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-800">{cust?.name}</td>
                          <td className="py-3 px-3">
                            <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                              {formatDateIndo(inv.due_date)}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-900">{formatRupiah(inv.total)}</td>
                          <td className="py-3 px-3 font-bold text-amber-600">
                            {formatRupiah(invData?.remaining_balance)}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                              isOverdue ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {isOverdue ? 'Jatuh Tempo' : 'Menunggu Pelunasan'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PROJECTS OPERATIONAL */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4">
              <span className="text-xs font-semibold text-blue-700">Proyek Aktif</span>
              <div className="text-2xl font-bold text-blue-900 mt-1">{activeProjectsCount}</div>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
              <span className="text-xs font-semibold text-emerald-700">Selesai</span>
              <div className="text-2xl font-bold text-emerald-900 mt-1">{completedProjectsCount}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="text-xs font-semibold text-slate-600">Prospek / Lead</span>
              <div className="text-2xl font-bold text-slate-800 mt-1">{leadProjectsCount}</div>
            </div>
            <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-4">
              <span className="text-xs font-semibold text-purple-700">Ditunda (Hold)</span>
              <div className="text-2xl font-bold text-purple-900 mt-1">{onHoldProjectsCount}</div>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4">
              <span className="text-xs font-semibold text-rose-700">Dibatalkan</span>
              <div className="text-2xl font-bold text-rose-900 mt-1">{cancelledProjectsCount}</div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Ikhtisar Nilai Kontrak Seluruh Proyek</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="py-2.5 px-3">Proyek</th>
                    <th className="py-2.5 px-3">Klien</th>
                    <th className="py-2.5 px-3">Nilai Kontrak</th>
                    <th className="py-2.5 px-3">Total Ditagihkan</th>
                    <th className="py-2.5 px-3">Sisa Belum Ditagih</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {projects.map((p) => {
                    const projData = getProjectWithFinancials(p.id);
                    const unbilled = Math.max(0, p.contract_value - (projData?.total_invoiced || 0));

                    return (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          <Link href={`/projects/${p.id}`} className="hover:text-emerald-600">
                            {p.name}
                          </Link>
                          <div className="text-[10px] text-slate-400">{p.project_number}</div>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-800">{projData?.customer?.name}</td>
                        <td className="py-3 px-3 font-semibold text-slate-900">{formatRupiah(p.contract_value)}</td>
                        <td className="py-3 px-3 text-blue-600">{formatRupiah(projData?.total_invoiced)}</td>
                        <td className="py-3 px-3 text-slate-600">{formatRupiah(unbilled)}</td>
                        <td className="py-3 px-3 font-medium">
                          <span className="capitalize">{translateStatus(p.status)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
