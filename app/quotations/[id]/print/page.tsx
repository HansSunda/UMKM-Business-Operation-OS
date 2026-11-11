'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Printer, ArrowLeft } from 'lucide-react';
import { useWorkspace } from '../../../../lib/context/workspace-context';
import { formatRupiah, formatDateIndo } from '../../../../lib/utils/formatters';

export default function PrintQuotationPage() {
  const params = useParams();
  const quotationId = params?.id as string;
  const { quotations, customers, business } = useWorkspace();

  const quotation = quotations.find((q) => q.id === quotationId);
  const customer = customers.find((c) => c.id === quotation?.customer_id);

  if (!quotation) {
    return <div className="p-8 text-center">Penawaran tidak ditemukan</div>;
  }

  return (
    <div className="bg-white min-h-screen text-slate-900 text-xs p-4 sm:p-8 max-w-4xl mx-auto">
      {/* Print Control Bar (Hidden on print) */}
      <div className="no-print mb-6 flex items-center justify-between border-b pb-4">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </button>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
        >
          <Printer className="h-4 w-4" /> Cetak / Unduh PDF
        </button>
      </div>

      {/* Official Quotation Document */}
      <div className="border border-slate-200 p-8 rounded-lg print:border-none print:p-0">
        {/* Header: Company & Document Title */}
        <div className="flex justify-between items-start border-b border-slate-300 pb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">
              {business.name}
            </h1>
            <p className="text-slate-500 text-xs font-medium mt-0.5">{business.business_type}</p>
            <p className="text-slate-500 mt-1 max-w-sm">{business.address}</p>
            <p className="text-slate-500 mt-0.5">
              Telp: {business.phone} &bull; Email: {business.email}
            </p>
          </div>

          <div className="text-right">
            <h2 className="text-2xl font-black text-slate-900 tracking-wider uppercase">
              PENAWARAN HARGA
            </h2>
            <div className="text-slate-500 text-xs mt-1">QUOTATION</div>
            <div className="mt-2 text-sm font-bold font-mono text-emerald-700">
              {quotation.quotation_number}
            </div>
          </div>
        </div>

        {/* Customer & Date Info */}
        <div className="grid grid-cols-2 gap-8 my-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              KLIEN / PENERIMA:
            </span>
            <div className="font-bold text-slate-900 text-sm">{customer?.name}</div>
            <div className="text-slate-600 mt-0.5">{customer?.phone}</div>
            <div className="text-slate-600">{customer?.email}</div>
            <div className="text-slate-500 mt-1 whitespace-pre-line">{customer?.address}</div>
          </div>

          <div className="text-right space-y-1">
            <div className="text-slate-600">
              <span className="font-medium text-slate-400">Tanggal Penawaran:</span>{' '}
              <span className="font-semibold text-slate-900">{formatDateIndo(quotation.quotation_date)}</span>
            </div>
            <div className="text-slate-600">
              <span className="font-medium text-slate-400">Berlaku Hingga:</span>{' '}
              <span className="font-semibold text-rose-600">{formatDateIndo(quotation.valid_until)}</span>
            </div>
            <div className="text-slate-600">
              <span className="font-medium text-slate-400">Status:</span>{' '}
              <span className="font-bold uppercase tracking-wider">{quotation.status}</span>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <table className="w-full text-left my-6 border-collapse">
          <thead>
            <tr className="border-y-2 border-slate-900 text-[11px] font-bold uppercase text-slate-900">
              <th className="py-2.5 px-2">No</th>
              <th className="py-2.5 px-2">Deskripsi Layanan / Item</th>
              <th className="py-2.5 px-2 text-right">Qty</th>
              <th className="py-2.5 px-2">Satuan</th>
              <th className="py-2.5 px-2 text-right">Harga (IDR)</th>
              <th className="py-2.5 px-2 text-right">Diskon</th>
              <th className="py-2.5 px-2 text-right">Subtotal (IDR)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {quotation.items?.map((item, idx) => (
              <tr key={item.id || idx}>
                <td className="py-2.5 px-2 text-slate-400">{idx + 1}</td>
                <td className="py-2.5 px-2 font-medium text-slate-900">{item.description}</td>
                <td className="py-2.5 px-2 text-right">{item.quantity}</td>
                <td className="py-2.5 px-2 text-slate-500">{item.unit}</td>
                <td className="py-2.5 px-2 text-right">{formatRupiah(item.unit_price)}</td>
                <td className="py-2.5 px-2 text-right text-slate-500">
                  {item.discount > 0 ? formatRupiah(item.discount) : '-'}
                </td>
                <td className="py-2.5 px-2 text-right font-semibold">{formatRupiah(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals & Notes */}
        <div className="flex justify-between items-start my-6 pt-2">
          <div className="w-1/2 pr-6">
            <span className="font-bold text-slate-900 block mb-1">Syarat & Ketentuan Penawaran:</span>
            <div className="text-slate-600 bg-slate-50 p-3 rounded border border-slate-200 text-[11px] whitespace-pre-line">
              {quotation.notes || 'Pembayaran bertahap sesuai kesepakatan SPK.'}
            </div>
          </div>

          <div className="w-64 space-y-2 text-right">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-medium text-slate-900">{formatRupiah(quotation.subtotal)}</span>
            </div>
            {quotation.discount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Diskon Khusus:</span>
                <span>-{formatRupiah(quotation.discount)}</span>
              </div>
            )}
            {quotation.tax > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>PPN (11%):</span>
                <span>{formatRupiah(quotation.tax)}</span>
              </div>
            )}
            <div className="flex justify-between border-t-2 border-slate-900 pt-2 text-sm font-bold text-slate-900">
              <span>TOTAL PENAWARAN:</span>
              <span className="text-emerald-700 text-base">{formatRupiah(quotation.total)}</span>
            </div>
          </div>
        </div>

        {/* Signature Area */}
        <div className="mt-16 pt-8 border-t border-slate-200 grid grid-cols-2 text-center">
          <div>
            <p className="text-slate-500 mb-16">Disetujui oleh Klien,</p>
            <p className="font-bold text-slate-900 underline">{customer?.name || '(................................)'}</p>
            <p className="text-[10px] text-slate-400">Tanda Tangan & Nama Jelas</p>
          </div>

          <div>
            <p className="text-slate-500 mb-16">Hormat Kami,</p>
            <p className="font-bold text-slate-900 underline">{business.name}</p>
            <p className="text-[10px] text-slate-400">Penyedia Jasa</p>
          </div>
        </div>
      </div>
    </div>
  );
}
