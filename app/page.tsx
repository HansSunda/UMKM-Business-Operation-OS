'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  AlertCircle,
  Briefcase,
  FileCheck,
  Clock,
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Users,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useWorkspace } from '../lib/context/workspace-context';
import { formatRupiah, formatDateIndo, translateStatus, getStatusBadgeClass } from '../lib/utils/formatters';

export default function DashboardPage() {
  const {
    business,
    customers,
    quotations,
    projects,
    invoices,
    payments,
    getInvoiceWithPayments,
    getProjectWithFinancials,
  } = useWorkspace();

  // 1. Financial KPIs
  // Monthly revenue: payments received in current month
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const thisMonthPayments = payments.filter((p) => {
    const pDate = new Date(p.payment_date);
    return pDate.getFullYear() === currentYear && pDate.getMonth() === currentMonth;
  });
  const revenueThisMonth = thisMonthPayments.reduce((sum, p) => sum + p.amount, 0);

  // All time total collected
  const totalCollectedAllTime = payments.reduce((sum, p) => sum + p.amount, 0);

  // Total Outstanding on non-cancelled invoices
  const outstandingInvoices = invoices.filter((i) => i.status !== 'cancelled' && i.status !== 'paid');
  const totalOutstanding = outstandingInvoices.reduce((sum, i) => {
    const invData = getInvoiceWithPayments(i.id);
    return sum + (invData?.remaining_balance || 0);
  }, 0);

  // Expected Revenue from active projects + outstanding receivables
  const activeProjects = projects.filter((p) => p.status === 'active');
  const activeProjectsUnbilled = activeProjects.reduce((sum, p) => {
    const pData = getProjectWithFinancials(p.id);
    const unbilled = Math.max(0, p.contract_value - (pData?.total_invoiced || 0));
    return sum + unbilled;
  }, 0);
  const totalExpectedRevenue = totalOutstanding + activeProjectsUnbilled;

  // 2. Operational KPIs
  const completedProjectsCount = projects.filter((p) => p.status === 'completed').length;
  const pendingQuotations = quotations.filter((q) => q.status === 'sent' || q.status === 'draft');
  const overdueInvoices = invoices.filter((i) => {
    const inv = getInvoiceWithPayments(i.id);
    return inv?.status === 'overdue' || (inv && inv.due_date < now.toISOString().split('T')[0] && (inv.remaining_balance || 0) > 0);
  });

  // 3. Sales Pipeline Funnel Counts
  const draftQuotes = quotations.filter((q) => q.status === 'draft');
  const sentQuotes = quotations.filter((q) => q.status === 'sent');
  const acceptedQuotes = quotations.filter((q) => q.status === 'accepted');
  const convertedQuotes = quotations.filter((q) => q.status === 'converted');
  const winCount = acceptedQuotes.length + convertedQuotes.length;
  const conversionRate = quotations.length > 0 ? Math.round((winCount / quotations.length) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Ringkasan Operasional & Keuangan
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Status bisnis real-time untuk <span className="font-semibold text-slate-700">{business.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/quotations/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <Plus className="h-4 w-4" />
            Buat Penawaran
          </Link>
          <Link
            href="/invoices/new"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <Plus className="h-4 w-4" />
            Buat Invoice
          </Link>
        </div>
      </div>

      {/* Financial KPI Cards */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
          Metrik Keuangan Utama
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Revenue this month */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Pendapatan Bulan Ini</span>
              <span className="rounded-md bg-emerald-50 p-2 text-emerald-600">
                <TrendingUp className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
              {formatRupiah(revenueThisMonth)}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Dari {thisMonthPayments.length} transaksi penerimaan pembayaran
            </div>
          </div>

          {/* Card 2: Outstanding Receivables */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Piutang Belum Tertagih</span>
              <span className="rounded-md bg-amber-50 p-2 text-amber-600">
                <Clock className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 text-2xl font-bold tracking-tight text-amber-600">
              {formatRupiah(totalOutstanding)}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              {outstandingInvoices.length} tagihan belum lunas / bertahap
            </div>
          </div>

          {/* Card 3: Active Projects */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Proyek Berjalan</span>
              <span className="rounded-md bg-blue-50 p-2 text-blue-600">
                <Briefcase className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
              {activeProjects.length}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              {completedProjectsCount} proyek telah berhasil diselesaikan
            </div>
          </div>

          {/* Card 4: Expected Total Cash Pipeline */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Ekspektasi Kas Masuk</span>
              <span className="rounded-md bg-purple-50 p-2 text-purple-600">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3 text-2xl font-bold tracking-tight text-purple-700">
              {formatRupiah(totalExpectedRevenue)}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Piutang tagihan + sisa kontrak proyek aktif
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline & Overdue Alerts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sales Pipeline Funnel (2 cols on lg) */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900">Pipeline Penawaran & Konversi</h3>
              <p className="text-xs text-slate-500">Pergerakan prospek dari draf penawaran hingga menjadi proyek</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Tingkat Konversi</span>
              <div className="text-lg font-bold text-emerald-600">{conversionRate}%</div>
            </div>
          </div>

          {/* Pipeline Visual Stages */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-100">
              <div className="text-xs text-slate-500 font-medium">1. Draf</div>
              <div className="text-xl font-bold text-slate-800 mt-1">{draftQuotes.length}</div>
              <div className="text-[11px] text-slate-400 mt-1">
                {formatRupiah(draftQuotes.reduce((s, q) => s + q.total, 0))}
              </div>
            </div>

            <div className="rounded-lg bg-blue-50/60 p-3.5 border border-blue-100">
              <div className="text-xs text-blue-700 font-medium">2. Terkirim</div>
              <div className="text-xl font-bold text-blue-900 mt-1">{sentQuotes.length}</div>
              <div className="text-[11px] text-blue-600/80 mt-1">
                {formatRupiah(sentQuotes.reduce((s, q) => s + q.total, 0))}
              </div>
            </div>

            <div className="rounded-lg bg-amber-50/60 p-3.5 border border-amber-100">
              <div className="text-xs text-amber-700 font-medium">3. Disetujui</div>
              <div className="text-xl font-bold text-amber-900 mt-1">{acceptedQuotes.length}</div>
              <div className="text-[11px] text-amber-600/80 mt-1">
                {formatRupiah(acceptedQuotes.reduce((s, q) => s + q.total, 0))}
              </div>
            </div>

            <div className="rounded-lg bg-emerald-50/80 p-3.5 border border-emerald-100">
              <div className="text-xs text-emerald-700 font-medium">4. Jadi Proyek</div>
              <div className="text-xl font-bold text-emerald-900 mt-1">{convertedQuotes.length}</div>
              <div className="text-[11px] text-emerald-600/80 mt-1">
                {formatRupiah(convertedQuotes.reduce((s, q) => s + q.total, 0))}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Total {quotations.length} penawaran tercatat</span>
            <Link
              href="/quotations"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
            >
              Lihat Semua Penawaran <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Overdue Invoices Alert Box (1 col on lg) */}
        <div className="rounded-xl border border-rose-200/80 bg-rose-50/30 p-6 shadow-sm">
          <div className="flex items-center gap-2 text-rose-700 mb-3">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-semibold text-slate-900">Perhatian: Jatuh Tempo</h3>
          </div>
          <p className="text-xs text-slate-600 mb-4">
            Tagihan yang melewati batas tanggal pembayaran dan membutuhkan tindak lanjut (follow-up WhatsApp / Telepon):
          </p>

          {overdueInvoices.length === 0 ? (
            <div className="rounded-lg bg-white p-4 text-center border border-slate-200">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-1" />
              <p className="text-xs font-medium text-slate-700">Tidak ada tagihan yang jatuh tempo</p>
              <p className="text-[11px] text-slate-400">Semua pembayaran pelanggan berjalan lancar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {overdueInvoices.slice(0, 3).map((inv) => {
                const invData = getInvoiceWithPayments(inv.id);
                return (
                  <div
                    key={inv.id}
                    className="rounded-lg bg-white p-3 border border-rose-200 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-900">{inv.invoice_number}</span>
                      <span className="text-xs font-bold text-rose-600">
                        {formatRupiah(invData?.remaining_balance)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1 truncate">
                      {invData?.customer?.name || 'Pelanggan'}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                      <span>Jatuh Tempo: {formatDateIndo(inv.due_date)}</span>
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="font-medium text-emerald-600 hover:text-emerald-700"
                      >
                        Detail &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Active Projects Tracker */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900">Proyek Berjalan & Status Keuangan</h3>
            <p className="text-xs text-slate-500">Monitor kemajuan penagihan dan pembayaran untuk setiap proyek</p>
          </div>
          <Link
            href="/projects"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
          >
            Lihat Semua Proyek <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="pb-3">Proyek & Klien</th>
                <th className="pb-3">Nilai Kontrak</th>
                <th className="pb-3">Tertagih</th>
                <th className="pb-3">Terbayar</th>
                <th className="pb-3">Sisa Piutang</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeProjects.slice(0, 5).map((project) => {
                const projData = getProjectWithFinancials(project.id);
                const percentPaid =
                  project.contract_value > 0
                    ? Math.min(100, Math.round(((projData?.total_paid || 0) / project.contract_value) * 100))
                    : 0;

                return (
                  <tr key={project.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 pr-4">
                      <div className="font-medium text-slate-900">{project.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {projData?.customer?.name} &bull; {project.project_number}
                      </div>
                    </td>
                    <td className="py-3.5 font-medium text-slate-900">
                      {formatRupiah(project.contract_value)}
                    </td>
                    <td className="py-3.5 text-slate-600 text-xs">
                      {formatRupiah(projData?.total_invoiced)}
                    </td>
                    <td className="py-3.5">
                      <div className="font-medium text-emerald-600 text-xs">
                        {formatRupiah(projData?.total_paid)}
                      </div>
                      <div className="w-24 bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${percentPaid}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 font-medium text-amber-600 text-xs">
                      {formatRupiah(projData?.outstanding_balance)}
                    </td>
                    <td className="py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${getStatusBadgeClass(project.status)}`}>
                        {translateStatus(project.status)}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                      >
                        Detail &rarr;
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
