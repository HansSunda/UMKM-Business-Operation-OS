'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  Plus,
  Receipt,
  CreditCard,
  FileText,
  Trash2,
  Edit,
} from 'lucide-react';
import { useWorkspace } from '../../../lib/context/workspace-context';
import { ProjectStatus } from '../../../lib/types/database';
import {
  formatRupiah,
  formatDateIndo,
  translateStatus,
  getStatusBadgeClass,
} from '../../../lib/utils/formatters';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const router = useRouter();
  const {
    projects,
    customers,
    quotations,
    invoices,
    payments,
    updateProject,
    deleteProject,
    getProjectWithFinancials,
    getInvoiceWithPayments,
  } = useWorkspace();

  const project = getProjectWithFinancials(projectId);
  const quotation = quotations.find((q) => q.id === project?.quotation_id);
  const projectInvoices = invoices.filter((i) => i.project_id === projectId);
  const projectInvoiceIds = projectInvoices.map((i) => i.id);
  const projectPayments = payments.filter((p) => projectInvoiceIds.includes(p.invoice_id));

  const [isChangingStatus, setIsChangingStatus] = useState(false);

  if (!project) {
    return (
      <div className="p-12 text-center">
        <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-2" />
        <h2 className="text-base font-semibold text-slate-800">Proyek tidak ditemukan</h2>
        <Link
          href="/projects"
          className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Proyek
        </Link>
      </div>
    );
  }

  const percentPaid =
    project.contract_value > 0
      ? Math.min(100, Math.round(((project.total_paid || 0) / project.contract_value) * 100))
      : 0;

  const handleStatusChange = (newStatus: ProjectStatus) => {
    updateProject(project.id, { status: newStatus });
    setIsChangingStatus(false);
  };

  const handleDelete = () => {
    if (confirm(`Yakin ingin menghapus proyek ${project.name}?`)) {
      deleteProject(project.id);
      router.push('/projects');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar Proyek
          </Link>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{project.name}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(project.status)}`}>
              {translateStatus(project.status)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Nomor: <span className="font-mono font-semibold">{project.project_number}</span> &bull; Klien:{' '}
            <Link
              href={`/customers/${project.customer_id}`}
              className="text-emerald-600 font-medium hover:underline"
            >
              {project.customer?.name}
            </Link>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Change Status Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsChangingStatus(!isChangingStatus)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Ubah Status
            </button>
            {isChangingStatus && (
              <div className="absolute right-0 mt-1 z-20 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg text-xs">
                <button
                  onClick={() => handleStatusChange('active')}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-700"
                >
                  Aktif (Berjalan)
                </button>
                <button
                  onClick={() => handleStatusChange('completed')}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-emerald-700 font-semibold"
                >
                  Selesai
                </button>
                <button
                  onClick={() => handleStatusChange('on_hold')}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-purple-700"
                >
                  Ditunda (On Hold)
                </button>
                <button
                  onClick={() => handleStatusChange('cancelled')}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-rose-700"
                >
                  Dibatalkan
                </button>
              </div>
            )}
          </div>

          <Link
            href={`/invoices/new?project_id=${project.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <Plus className="h-4 w-4" />
            + Buat Invoice Proyek
          </Link>

          <button
            onClick={handleDelete}
            title="Hapus Proyek"
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Project Financial Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Nilai Kontrak Proyek
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {formatRupiah(project.contract_value)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Total nilai kesepakatan</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Sudah Ditagihkan
          </span>
          <div className="text-xl font-bold text-blue-700 mt-1">
            {formatRupiah(project.total_invoiced)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {projectInvoices.length} termin diterbitkan
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Sudah Terbayar
          </span>
          <div className="text-xl font-bold text-emerald-600 mt-1">
            {formatRupiah(project.total_paid)}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">{percentPaid}% dari nilai kontrak</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Sisa Belum Diterima
          </span>
          <div className="text-xl font-bold text-amber-600 mt-1">
            {formatRupiah(project.outstanding_balance)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Sisa kas yang dinanti</div>
        </div>
      </div>

      {/* Progress Bar & Details */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
            <span>Kemajuan Pembayaran Nilai Kontrak</span>
            <span>{percentPaid}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${percentPaid}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block">Jadwal Pengerjaan:</span>
            <div className="font-semibold text-slate-800 mt-0.5">
              {formatDateIndo(project.start_date)} s/d {formatDateIndo(project.due_date)}
            </div>
          </div>

          <div>
            <span className="text-slate-400 block">Dasar Penawaran:</span>
            <div className="mt-0.5">
              {quotation ? (
                <Link
                  href={`/quotations/${quotation.id}`}
                  className="text-emerald-600 font-semibold hover:underline"
                >
                  {quotation.quotation_number}
                </Link>
              ) : (
                <span className="text-slate-500">Proyek Mandiri</span>
              )}
            </div>
          </div>

          <div>
            <span className="text-slate-400 block">Lingkup Kerja:</span>
            <div className="text-slate-700 mt-0.5">{project.description || '-'}</div>
          </div>
        </div>
      </div>

      {/* Linked Invoices Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Tagihan Termin Proyek (Invoices)</h2>
            <p className="text-xs text-slate-500">Daftar tagihan yang diterbitkan untuk proyek ini</p>
          </div>
          <Link
            href={`/invoices/new?project_id=${project.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            <Plus className="h-4 w-4" /> Terbitkan Invoice Baru
          </Link>
        </div>

        {projectInvoices.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 border border-dashed rounded-lg">
            Belum ada invoice termin yang diterbitkan untuk proyek ini
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">No. Invoice</th>
                  <th className="py-2.5 px-3">Jatuh Tempo</th>
                  <th className="py-2.5 px-3">Total Tagihan</th>
                  <th className="py-2.5 px-3">Terbayar</th>
                  <th className="py-2.5 px-3">Sisa Saldo</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projectInvoices.map((inv) => {
                  const invData = getInvoiceWithPayments(inv.id);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        <Link href={`/invoices/${inv.id}`} className="hover:text-emerald-600">
                          {inv.invoice_number}
                        </Link>
                        {inv.notes && <div className="text-[11px] text-slate-400">{inv.notes}</div>}
                      </td>
                      <td className="py-3 px-3 text-slate-600">{formatDateIndo(inv.due_date)}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {formatRupiah(inv.total)}
                      </td>
                      <td className="py-3 px-3 text-emerald-600 font-medium">
                        {formatRupiah(invData?.total_paid)}
                      </td>
                      <td className="py-3 px-3 text-amber-600 font-medium">
                        {formatRupiah(invData?.remaining_balance)}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusBadgeClass(invData?.status || inv.status)}`}>
                          {translateStatus(invData?.status || inv.status)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/invoices/${inv.id}`}
                          className="font-semibold text-emerald-600 hover:text-emerald-700"
                        >
                          Buka Invoice &rarr;
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

      {/* Linked Payments Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Riwayat Pembayaran Proyek</h2>
        {projectPayments.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            Belum ada pembayaran yang dicatat untuk invoice proyek ini
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border rounded-lg">
            {projectPayments.map((pay) => (
              <div key={pay.id} className="p-3.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-emerald-700">{formatRupiah(pay.amount)}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Tanggal: {formatDateIndo(pay.payment_date)} &bull; Metode: {translateStatus(pay.payment_method)}
                    {pay.reference && ` &bull; Ref: ${pay.reference}`}
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                  Lunas Diterima
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
