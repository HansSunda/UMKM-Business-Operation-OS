'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Trash2,
  Receipt,
  Building,
  CheckCircle,
  X,
} from 'lucide-react';
import { useWorkspace } from '../../lib/context/workspace-context';
import { PaymentMethod } from '../../lib/types/database';
import {
  formatRupiah,
  formatDateIndo,
  translateStatus,
} from '../../lib/utils/formatters';

export default function PaymentsPage() {
  const {
    payments,
    invoices,
    customers,
    addPayment,
    deletePayment,
    getInvoiceWithPayments,
  } = useWorkspace();

  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Payment Form state
  const unpaidInvoices = invoices.filter((i) => {
    const invData = getInvoiceWithPayments(i.id);
    return (invData?.remaining_balance || 0) > 0 && invData?.status !== 'cancelled';
  });

  const [selectedInvoiceId, setSelectedInvoiceId] = useState(unpaidInvoices[0]?.id || '');
  const [amount, setAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [modalError, setModalError] = useState('');

  const selectedInvoice = unpaidInvoices.find((i) => i.id === selectedInvoiceId);
  const selectedInvoiceData = selectedInvoice ? getInvoiceWithPayments(selectedInvoice.id) : undefined;
  const currentRemaining = selectedInvoiceData?.remaining_balance || 0;

  const handleOpenAdd = () => {
    if (unpaidInvoices.length > 0) {
      const first = unpaidInvoices[0];
      setSelectedInvoiceId(first.id);
      const data = getInvoiceWithPayments(first.id);
      setAmount(data?.remaining_balance || 0);
      setReference(`TRF-${Math.floor(10000 + Math.random() * 90000)}`);
      setNotes('');
      setModalError('');
      setShowAddModal(true);
    } else {
      alert('Semua invoice saat ini telah lunas! Tidak ada tagihan tertunggak.');
    }
  };

  const handleInvoiceChange = (invId: string) => {
    setSelectedInvoiceId(invId);
    const data = getInvoiceWithPayments(invId);
    setAmount(data?.remaining_balance || 0);
  };

  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId) {
      setModalError('Pilih invoice yang akan dibayarkan');
      return;
    }
    if (amount <= 0) {
      setModalError('Nominal pembayaran harus lebih besar dari Rp 0');
      return;
    }
    if (amount > currentRemaining) {
      setModalError(
        `Nominal (${formatRupiah(amount)}) melebihi sisa tagihan (${formatRupiah(currentRemaining)})`
      );
      return;
    }

    try {
      addPayment({
        invoice_id: selectedInvoiceId,
        payment_date: paymentDate,
        amount: Number(amount),
        payment_method: paymentMethod,
        reference: reference.trim() || null,
        notes: notes.trim() || null,
      });

      setShowAddModal(false);
    } catch {
      setModalError('Gagal mencatat pembayaran');
    }
  };

  // Filtered payments
  const filteredPayments = payments.filter((p) => {
    const inv = invoices.find((i) => i.id === p.invoice_id);
    const cust = inv ? customers.find((c) => c.id === inv.customer_id) : undefined;

    const matchesSearch =
      (p.reference && p.reference.toLowerCase().includes(search.toLowerCase())) ||
      (inv && inv.invoice_number.toLowerCase().includes(search.toLowerCase())) ||
      (cust && cust.name.toLowerCase().includes(search.toLowerCase())) ||
      (p.notes && p.notes.toLowerCase().includes(search.toLowerCase()));

    const matchesMethod = methodFilter === 'all' || p.payment_method === methodFilter;

    return matchesSearch && matchesMethod;
  });

  const totalCollected = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Buku Kas & Pembayaran Masuk</h1>
          <p className="text-sm text-slate-500 mt-1">
            Riwayat penerimaan pembayaran kas, transfer bank, dan e-wallet dari klien
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
        >
          <Plus className="h-4 w-4" />
          Catat Pembayaran Baru
        </button>
      </div>

      {/* KPI Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm max-w-sm">
        <span className="text-xs font-medium text-slate-500">Total Pembayaran Berhasil Masuk</span>
        <div className="text-2xl font-bold text-emerald-600 mt-1">
          {formatRupiah(totalCollected)}
        </div>
        <div className="text-xs text-slate-400 mt-0.5">
          Dari {payments.length} transaksi penerimaan kas
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex overflow-x-auto border-b border-slate-200 sm:border-0 gap-1 pb-1 sm:pb-0">
          <button
            onClick={() => setMethodFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              methodFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Semua Metode
          </button>
          <button
            onClick={() => setMethodFilter('bank_transfer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              methodFilter === 'bank_transfer'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Transfer Bank
          </button>
          <button
            onClick={() => setMethodFilter('cash')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              methodFilter === 'cash'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Tunai
          </button>
          <button
            onClick={() => setMethodFilter('e_wallet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              methodFilter === 'e_wallet'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            E-Wallet / QRIS
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari referensi, invoice, klien..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Payments Ledger Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-slate-800">Tidak ada pembayaran ditemukan</h3>
            <p className="text-xs text-slate-500 mt-1">
              Catat pembayaran yang diterima dari klien untuk memperbarui saldo invoice
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Tanggal Pembayaran</th>
                  <th className="py-3.5 px-4">Invoice & Klien</th>
                  <th className="py-3.5 px-4">Nominal Diterima</th>
                  <th className="py-3.5 px-4">Metode & Referensi</th>
                  <th className="py-3.5 px-4">Catatan</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((p) => {
                  const inv = invoices.find((i) => i.id === p.invoice_id);
                  const cust = inv ? customers.find((c) => c.id === inv.customer_id) : undefined;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-4 sm:px-6 font-semibold text-slate-800 text-xs">
                        {formatDateIndo(p.payment_date)}
                      </td>
                      <td className="py-4 px-4 text-xs">
                        {inv ? (
                          <Link
                            href={`/invoices/${inv.id}`}
                            className="font-semibold text-slate-900 hover:text-emerald-600 block"
                          >
                            {inv.invoice_number}
                          </Link>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                        <div className="text-slate-500 text-[11px] mt-0.5">{cust?.name || '-'}</div>
                      </td>
                      <td className="py-4 px-4 font-bold text-emerald-600 text-sm">
                        {formatRupiah(p.amount)}
                      </td>
                      <td className="py-4 px-4 text-xs">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {translateStatus(p.payment_method)}
                        </span>
                        {p.reference && (
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                            Ref: {p.reference}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-500 max-w-xs truncate">
                        {p.notes || '-'}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <button
                          onClick={() => {
                            if (confirm('Hapus transaksi pembayaran ini?')) {
                              deletePayment(p.id);
                            }
                          }}
                          className="text-slate-400 hover:text-rose-600 p-1"
                          title="Hapus pembayaran"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Catat Pembayaran Masuk</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalError && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreatePayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Invoice Tertunggak <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedInvoiceId}
                  onChange={(e) => handleInvoiceChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-800 focus:outline-emerald-500"
                >
                  {unpaidInvoices.map((inv) => {
                    const cust = customers.find((c) => c.id === inv.customer_id);
                    const invData = getInvoiceWithPayments(inv.id);
                    return (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoice_number} - {cust?.name} (Sisa: {formatRupiah(invData?.remaining_balance)})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nominal Pembayaran (Rp) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={currentRemaining}
                  step="1000"
                  value={amount}
                  onChange={(e) => {
                    setAmount(parseFloat(e.target.value) || 0);
                    if (modalError) setModalError('');
                  }}
                  className="w-full rounded-lg border border-slate-300 py-2 px-3 text-sm font-semibold text-slate-900 focus:outline-emerald-500"
                />
                <div className="text-[11px] text-slate-400 mt-1 flex justify-between">
                  <span>Maksimal sisa tagihan:</span>
                  <span className="font-semibold text-slate-700">{formatRupiah(currentRemaining)}</span>
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
                    <option value="e_wallet">E-Wallet (QRIS)</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nomor Referensi Transaksi
                </label>
                <input
                  type="text"
                  placeholder="TRF-BCA-98124"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 py-1.5 px-2.5 text-xs text-slate-800 focus:outline-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan Pembayaran
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan rekening atau pelunasan..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-800 focus:outline-emerald-500"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
