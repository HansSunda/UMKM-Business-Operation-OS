'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Printer,
  CreditCard,
  Plus,
  Trash2,
  Calendar,
  Building,
  CheckCircle,
  Clock,
  AlertCircle,
  Receipt,
  X,
} from 'lucide-react';
import { useWorkspace } from '../../../lib/context/workspace-context';
import { PaymentMethod } from '../../../lib/types/database';
import {
  formatRupiah,
  formatDateIndo,
  translateStatus,
  getStatusBadgeClass,
} from '../../../lib/utils/formatters';

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params?.id as string;
  const router = useRouter();
  const {
    invoices,
    customers,
    projects,
    payments,
    getInvoiceWithPayments,
    addPayment,
    deletePayment,
    deleteInvoice,
  } = useWorkspace();

  const invoice = getInvoiceWithPayments(invoiceId);
  const customer = customers.find((c) => c.id === invoice?.customer_id);
  const project = projects.find((p) => p.id === invoice?.project_id);

  // Modal State for Recording Payment
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [reference, setReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentError, setPaymentError] = useState('');

  if (!invoice) {
    return (
      <div className="p-12 text-center">
        <Receipt className="h-10 w-10 text-slate-300 mx-auto mb-2" />
        <h2 className="text-base font-semibold text-slate-800">Invoice tidak ditemukan</h2>
        <Link
          href="/invoices"
          className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Invoice
        </Link>
      </div>
    );
  }

  const remainingBalance = invoice.remaining_balance || 0;
  const totalPaid = invoice.total_paid || 0;
  const percentPaid =
    invoice.total > 0 ? Math.min(100, Math.round((totalPaid / invoice.total) * 100)) : 0;

  const openPaymentModal = () => {
    setPaymentAmount(remainingBalance);
    setReference(`TRF-${Math.floor(10000 + Math.random() * 90000)}`);
    setPaymentNotes('');
    setPaymentError('');
    setShowPaymentModal(true);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) {
      setPaymentError('Nominal pembayaran harus lebih besar dari Rp 0');
      return;
    }

    if (paymentAmount > remainingBalance) {
      setPaymentError(
        `Nominal pembayaran (${formatRupiah(paymentAmount)}) tidak boleh melebihi sisa saldo invoice (${formatRupiah(remainingBalance)})`
      );
      return;
    }

    try {
      addPayment({
        invoice_id: invoice.id,
        payment_date: paymentDate,
        amount: Number(paymentAmount),
        payment_method: paymentMethod,
        reference: reference.trim() || null,
        notes: paymentNotes.trim() || null,
      });

      setShowPaymentModal(false);
    } catch {
      setPaymentError('Gagal mencatat pembayaran');
    }
  };

  const handleDelete = () => {
    if (confirm(`Yakin ingin menghapus invoice ${invoice.invoice_number}?`)) {
      deleteInvoice(invoice.id);
      router.push('/invoices');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/invoices"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar Invoice
          </Link>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {invoice.invoice_number}
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(invoice.status)}`}>
              {translateStatus(invoice.status)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Terbit: {formatDateIndo(invoice.issue_date)} &bull; Jatuh Tempo:{' '}
            <span className={invoice.status === 'overdue' ? 'font-bold text-rose-600' : 'text-slate-700'}>
              {formatDateIndo(invoice.due_date)}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/invoices/${invoice.id}/print`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <Printer className="h-4 w-4" />
            Cetak / PDF
          </Link>

          {remainingBalance > 0 && (
            <button
              onClick={openPaymentModal}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              <CreditCard className="h-4 w-4" />
              Catat Pembayaran
            </button>
          )}

          <button
            onClick={handleDelete}
            title="Hapus Invoice"
            className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Financial Status Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Tagihan
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1">{formatRupiah(invoice.total)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Termasuk pajak & potongan</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Sudah Dibayar
          </span>
          <div className="text-xl font-bold text-emerald-600 mt-1">{formatRupiah(totalPaid)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {invoice.payments?.length || 0} transaksi masuk
          </div>
        </div>

        <div className={`rounded-xl border p-4 shadow-sm ${
          invoice.status === 'overdue' ? 'border-rose-200 bg-rose-50/20' : 'border-slate-200 bg-white'
        }`}>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Sisa Saldo Belum Lunas
          </span>
          <div className={`text-xl font-bold mt-1 ${
            remainingBalance > 0 ? (invoice.status === 'overdue' ? 'text-rose-600' : 'text-amber-600') : 'text-slate-500'
          }`}>
            {formatRupiah(remainingBalance)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {remainingBalance === 0 ? 'Lunas Sepenuhnya' : 'Menunggu Pelunasan Klien'}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
          <span>Status Pelunasan Tagihan</span>
          <span>{percentPaid}%</span>
        </div>
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              percentPaid === 100 ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
            style={{ width: `${percentPaid}%` }}
          />
        </div>
      </div>

      {/* Client and Project Info Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Ditagihkan Kepada:
          </span>
          <div className="font-bold text-sm text-slate-900 mt-0.5">{customer?.name}</div>
          <div className="text-xs text-slate-500 mt-0.5">
            {customer?.phone && `Telp: ${customer.phone}`}
            {customer?.email && ` • ${customer.email}`}
          </div>
          {customer?.address && <div className="text-xs text-slate-400 mt-0.5">{customer.address}</div>}
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Keterkaitan Proyek:
          </span>
          {project ? (
            <div className="mt-0.5">
              <Link
                href={`/projects/${project.id}`}
                className="font-bold text-sm text-emerald-600 hover:underline block"
              >
                {project.name}
              </Link>
              <div className="text-xs text-slate-500">
                Nomor Proyek: {project.project_number} &bull; Nilai Kontrak: {formatRupiah(project.contract_value)}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 mt-0.5">Tagihan Mandiri (Tanpa Proyek)</div>
          )}
        </div>
      </div>

      {/* Invoice Line Items */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Rincian Item Tagihan
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="py-2.5 px-3">No</th>
                <th className="py-2.5 px-3">Deskripsi</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3">Satuan</th>
                <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                <th className="py-2.5 px-3 text-right">Diskon</th>
                <th className="py-2.5 px-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((item, idx) => (
                  <tr key={item.id || idx}>
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
                    Tidak ada item rincian
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Calculation summary */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div className="w-full sm:w-1/2">
            <span className="text-xs font-semibold text-slate-600">Catatan & Rekening Bank:</span>
            <div className="mt-1 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-line">
              {invoice.notes || 'Pembayaran via transfer bank.'}
            </div>
          </div>

          <div className="w-full sm:w-72 rounded-lg bg-slate-50 p-4 border border-slate-200/70 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-800">{formatRupiah(invoice.subtotal)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Diskon:</span>
                <span>-{formatRupiah(invoice.discount)}</span>
              </div>
            )}
            {invoice.tax > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>PPN 11%:</span>
                <span>{formatRupiah(invoice.tax)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
              <span>Total Tagihan:</span>
              <span className="text-slate-900">{formatRupiah(invoice.total)}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-emerald-600">
              <span>Sudah Dibayar:</span>
              <span>{formatRupiah(totalPaid)}</span>
            </div>
            <div className="pt-1 border-t border-slate-200 flex justify-between text-sm font-bold">
              <span>Sisa Tagihan:</span>
              <span className={remainingBalance > 0 ? 'text-amber-600' : 'text-slate-400'}>
                {formatRupiah(remainingBalance)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Riwayat Pembayaran Diterima</h2>
          {remainingBalance > 0 && (
            <button
              onClick={openPaymentModal}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              <Plus className="h-4 w-4" /> Catat Pembayaran
            </button>
          )}
        </div>

        {!invoice.payments || invoice.payments.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            Belum ada pembayaran yang dicatat untuk invoice ini
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border rounded-lg overflow-hidden">
            {invoice.payments.map((p) => (
              <div key={p.id} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50">
                <div>
                  <div className="font-semibold text-emerald-700">{formatRupiah(p.amount)}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Tanggal: {formatDateIndo(p.payment_date)} &bull; Metode: {translateStatus(p.payment_method)}
                    {p.reference && ` &bull; Ref: ${p.reference}`}
                  </div>
                  {p.notes && <div className="text-[11px] text-slate-400 mt-0.5">{p.notes}</div>}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    Lunas
                  </span>
                  <button
                    onClick={() => {
                      if (confirm('Hapus pencatatan pembayaran ini?')) {
                        deletePayment(p.id);
                      }
                    }}
                    title="Batalkan pembayaran"
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900">Catat Pembayaran Masuk</h3>
                <p className="text-xs text-slate-500">Invoice {invoice.invoice_number}</p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {paymentError && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
                {paymentError}
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nominal Pembayaran (Rp) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={remainingBalance}
                  step="1000"
                  value={paymentAmount}
                  onChange={(e) => {
                    setPaymentAmount(parseFloat(e.target.value) || 0);
                    if (paymentError) setPaymentError('');
                  }}
                  className="w-full rounded-lg border border-slate-300 py-2 px-3 text-sm font-semibold text-slate-900 focus:outline-emerald-500"
                />
                <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                  <span>Maksimal sisa saldo:</span>
                  <span className="font-semibold text-slate-700">{formatRupiah(remainingBalance)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Pembayaran
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 py-1.5 px-2.5 text-xs text-slate-800 focus:outline-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Metode Pembayaran
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full rounded-lg border border-slate-300 py-1.5 px-2.5 text-xs text-slate-800 focus:outline-emerald-500"
                  >
                    <option value="bank_transfer">Transfer Bank</option>
                    <option value="cash">Tunai (Cash)</option>
                    <option value="e_wallet">E-Wallet (QRIS/GoPay)</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nomor Referensi / ID Transaksi
                </label>
                <input
                  type="text"
                  placeholder="Contoh: TRF-BCA-10293 atau No Bukti"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 py-1.5 px-2.5 text-xs text-slate-800 focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan Transaksi
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan rekening pengirim atau termin..."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 focus:outline-emerald-500"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 shadow-sm"
                >
                  Simpan Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
