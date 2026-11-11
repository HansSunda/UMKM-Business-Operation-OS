'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Printer,
  CheckCircle,
  XCircle,
  Send,
  Briefcase,
  Building,
  Calendar,
  FileText,
  Clock,
  Trash2,
} from 'lucide-react';
import { useWorkspace } from '../../../lib/context/workspace-context';
import {
  formatRupiah,
  formatDateIndo,
  translateStatus,
  getStatusBadgeClass,
} from '../../../lib/utils/formatters';

export default function QuotationDetailPage() {
  const params = useParams();
  const quotationId = params?.id as string;
  const router = useRouter();
  const {
    quotations,
    customers,
    projects,
    updateQuotation,
    deleteQuotation,
    convertQuotationToProject,
  } = useWorkspace();

  const quotation = quotations.find((q) => q.id === quotationId);
  const customer = customers.find((c) => c.id === quotation?.customer_id);
  const linkedProject = projects.find((p) => p.quotation_id === quotation?.id);

  if (!quotation) {
    return (
      <div className="p-12 text-center">
        <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
        <h2 className="text-base font-semibold text-slate-800">Penawaran tidak ditemukan</h2>
        <Link
          href="/quotations"
          className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Penawaran
        </Link>
      </div>
    );
  }

  const handleStatusChange = (newStatus: 'sent' | 'accepted' | 'rejected') => {
    updateQuotation(quotation.id, { status: newStatus });
  };

  const handleConvertToProject = () => {
    if (confirm('Konversi penawaran ini menjadi Proyek aktif?')) {
      const newProj = convertQuotationToProject(quotation.id);
      router.push(`/projects/${newProj.id}`);
    }
  };

  const handleDelete = () => {
    if (confirm(`Hapus penawaran ${quotation.quotation_number}?`)) {
      deleteQuotation(quotation.id);
      router.push('/quotations');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/quotations"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar Penawaran
          </Link>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {quotation.quotation_number}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(quotation.status)}`}>
              {translateStatus(quotation.status)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Diterbitkan pada {formatDateIndo(quotation.quotation_date)} &bull; Berlaku hingga{' '}
            {formatDateIndo(quotation.valid_until)}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/quotations/${quotation.id}/print`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <Printer className="h-4 w-4" />
            Cetak / PDF
          </Link>

          {quotation.status === 'draft' && (
            <button
              onClick={() => handleStatusChange('sent')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
            >
              <Send className="h-4 w-4" />
              Tandai Terkirim
            </button>
          )}

          {quotation.status === 'sent' && (
            <>
              <button
                onClick={() => handleStatusChange('accepted')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
              >
                <CheckCircle className="h-4 w-4" />
                Klien Setuju
              </button>
              <button
                onClick={() => handleStatusChange('rejected')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition"
              >
                <XCircle className="h-4 w-4" />
                Tolak
              </button>
            </>
          )}

          {quotation.status === 'accepted' && (
            <button
              onClick={handleConvertToProject}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              <Briefcase className="h-4 w-4" />
              Konversi Jadi Proyek
            </button>
          )}

          {quotation.status === 'converted' && linkedProject && (
            <Link
              href={`/projects/${linkedProject.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
            >
              <Briefcase className="h-4 w-4" />
              Lihat Proyek ({linkedProject.project_number})
            </Link>
          )}

          <button
            onClick={handleDelete}
            title="Hapus Penawaran"
            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Customer summary card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Penawaran Diajukan Kepada:
          </span>
          <div className="text-base font-bold text-slate-900 mt-0.5">
            {customer?.name || 'Pelanggan'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {customer?.phone && `Telp: ${customer.phone}`}
            {customer?.email && ` • Email: ${customer.email}`}
          </div>
          {customer?.address && (
            <div className="text-xs text-slate-400 mt-0.5">{customer.address}</div>
          )}
        </div>

        {customer && (
          <Link
            href={`/customers/${customer.id}`}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Lihat Profil Lengkap Pelanggan &rarr;
          </Link>
        )}
      </div>

      {/* Line Items Details Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Rincian Penawaran Harga
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="py-2.5 px-3">No</th>
                <th className="py-2.5 px-3">Deskripsi Pekerjaan / Layanan</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3">Satuan</th>
                <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                <th className="py-2.5 px-3 text-right">Diskon</th>
                <th className="py-2.5 px-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotation.items && quotation.items.length > 0 ? (
                quotation.items.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-3 font-medium text-slate-900">{item.description}</td>
                    <td className="py-3 px-3 text-right text-slate-700">{item.quantity}</td>
                    <td className="py-3 px-3 text-slate-500">{item.unit}</td>
                    <td className="py-3 px-3 text-right text-slate-700">
                      {formatRupiah(item.unit_price)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-500">
                      {item.discount > 0 ? formatRupiah(item.discount) : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-900">
                      {formatRupiah(item.subtotal)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-slate-400">
                    Tidak ada rincian item
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Calculation summary */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div className="w-full sm:w-1/2">
            <span className="text-xs font-semibold text-slate-600">Catatan & Ketentuan:</span>
            <div className="mt-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-line">
              {quotation.notes || 'Tidak ada catatan tambahan.'}
            </div>
          </div>

          <div className="w-full sm:w-72 rounded-lg bg-slate-50 p-4 border border-slate-200/70 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-800">{formatRupiah(quotation.subtotal)}</span>
            </div>
            {quotation.discount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Diskon:</span>
                <span className="font-semibold text-rose-600">-{formatRupiah(quotation.discount)}</span>
              </div>
            )}
            {quotation.tax > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>PPN (11%):</span>
                <span className="font-semibold text-slate-800">{formatRupiah(quotation.tax)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
              <span>Total Akhir:</span>
              <span className="text-emerald-600 text-base">{formatRupiah(quotation.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
