'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Building,
  Calendar,
  DollarSign,
  Percent,
  FileText,
} from 'lucide-react';
import { useWorkspace } from '../../../lib/context/workspace-context';
import { QuotationItem, QuotationStatus } from '../../../lib/types/database';
import { calculateDocumentTotals, calculateItemSubtotal } from '../../../lib/utils/calculations';
import { formatRupiah } from '../../../lib/utils/formatters';
import { generateDocumentNumber } from '../../../lib/utils/id-generator';

interface FormItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount: number;
}

export default function NewQuotationPage() {
  const router = useRouter();
  const { customers, quotations, addQuotation } = useWorkspace();

  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [quotationNumber] = useState(generateDocumentNumber('QT', quotations.length));
  const [quotationDate, setQuotationDate] = useState(new Date().toISOString().split('T')[0]);
  const defaultValidUntil = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  const [validUntil, setValidUntil] = useState(defaultValidUntil);
  const [notes, setNotes] = useState('Penawaran berlaku 14 hari kerja sejak diterbitkan. Pembayaran bertahap: DP 50%, Pelunasan 50% setelah pekerjaan selesai.');
  const [docDiscount, setDocDiscount] = useState<number>(0);
  const [includePPN, setIncludePPN] = useState<boolean>(false);
  const [status, setStatus] = useState<QuotationStatus>('draft');
  const [error, setError] = useState('');

  // Line items
  const [items, setItems] = useState<FormItem[]>([
    {
      id: crypto.randomUUID(),
      description: 'Layanan / Pekerjaan Desain Utama',
      quantity: 1,
      unit: 'paket',
      unit_price: 15000000,
      discount: 0,
    },
  ]);

  const addItem = () => {
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        description: '',
        quantity: 1,
        unit: 'unit',
        unit_price: 0,
        discount: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof FormItem, value: unknown) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  // Calculations
  const calculatedItems = items.map((i, index) => ({
    ...i,
    sort_order: index + 1,
    subtotal: calculateItemSubtotal(i.quantity, i.unit_price, i.discount),
  }));

  const itemsSubtotal = calculatedItems.reduce((sum, i) => sum + i.subtotal, 0);
  const afterDiscount = Math.max(0, itemsSubtotal - (Number(docDiscount) || 0));
  const taxAmount = includePPN ? Math.round(afterDiscount * 0.11) : 0;
  const finalTotal = afterDiscount + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setError('Pilih pelanggan terlebih dahulu');
      return;
    }

    if (items.some((i) => !i.description.trim())) {
      setError('Deskripsi setiap baris item wajib diisi');
      return;
    }

    try {
      const quotationItems: QuotationItem[] = calculatedItems.map((ci) => ({
        id: ci.id,
        quotation_id: '',
        description: ci.description,
        quantity: Number(ci.quantity) || 1,
        unit: ci.unit || 'unit',
        unit_price: Number(ci.unit_price) || 0,
        discount: Number(ci.discount) || 0,
        subtotal: ci.subtotal,
        sort_order: ci.sort_order,
      }));

      const created = addQuotation({
        customer_id: customerId,
        quotation_number: quotationNumber,
        quotation_date: quotationDate,
        valid_until: validUntil,
        status,
        subtotal: itemsSubtotal,
        discount: Number(docDiscount) || 0,
        tax: taxAmount,
        total: finalTotal,
        notes,
        items: quotationItems,
      });

      router.push(`/quotations/${created.id}`);
    } catch {
      setError('Gagal membuat penawaran');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <Link
          href="/quotations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Penawaran
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">Buat Penawaran Harga Baru</h1>
        <p className="text-sm text-slate-500">
          Susun item pekerjaan, hitung otomatis subtotal & PPN, lalu terbitkan dokumen untuk calon klien
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Document Meta Information */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Informasi Dokumen Penawaran
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pilih Pelanggan / Klien <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-800 focus:outline-emerald-500"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Penawaran (Auto)
              </label>
              <input
                type="text"
                readOnly
                value={quotationNumber}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-mono font-semibold text-slate-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Awal
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as QuotationStatus)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-800 focus:outline-emerald-500"
              >
                <option value="draft">Draf (Internal)</option>
                <option value="sent">Langsung Terkirim ke Klien</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Penawaran
              </label>
              <input
                type="date"
                required
                value={quotationDate}
                onChange={(e) => setQuotationDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-800 focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Masa Berlaku Hingga
              </label>
              <input
                type="date"
                required
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-800 focus:outline-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Rincian Item & Jasa Layanan
            </h2>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              <Plus className="h-4 w-4" /> Tambah Baris
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-2.5 px-3 min-w-[200px]">Deskripsi Pekerjaan / Produk</th>
                  <th className="py-2.5 px-2 w-20">Jumlah</th>
                  <th className="py-2.5 px-2 w-24">Satuan</th>
                  <th className="py-2.5 px-2 w-32">Harga Satuan</th>
                  <th className="py-2.5 px-2 w-28">Diskon (Rp)</th>
                  <th className="py-2.5 px-3 w-32 text-right">Subtotal</th>
                  <th className="py-2.5 px-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => {
                  const itemSubtotal = calculateItemSubtotal(
                    item.quantity,
                    item.unit_price,
                    item.discount
                  );

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          required
                          placeholder="Nama item atau jasa..."
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 focus:outline-emerald-500"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          step="any"
                          min="0.01"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs text-slate-800 focus:outline-emerald-500"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          placeholder="unit/set/m2"
                          value={item.unit}
                          onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                          className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs text-slate-800 focus:outline-emerald-500"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={item.unit_price}
                          onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs text-slate-800 focus:outline-emerald-500"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={item.discount}
                          onChange={(e) => updateItem(item.id, 'discount', parseFloat(e.target.value) || 0)}
                          className="w-full rounded border border-slate-300 px-2 py-1.5 text-xs text-slate-800 focus:outline-emerald-500"
                        />
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-slate-800">
                        {formatRupiah(itemSubtotal)}
                      </td>
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                          className="text-slate-400 hover:text-rose-600 disabled:opacity-20"
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

          {/* Document Totals Breakdown */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="w-full sm:w-1/2 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Syarat & Ketentuan / Catatan
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 focus:outline-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includePPN"
                  checked={includePPN}
                  onChange={(e) => setIncludePPN(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="includePPN" className="text-xs font-medium text-slate-700">
                  Tambahkan PPN 11% (Pajak Pertambahan Nilai)
                </label>
              </div>
            </div>

            <div className="w-full sm:w-80 rounded-lg bg-slate-50 p-4 border border-slate-200/70 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal Item:</span>
                <span className="font-semibold text-slate-800">{formatRupiah(itemsSubtotal)}</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600">Diskon Khusus (Rp):</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={docDiscount}
                  onChange={(e) => setDocDiscount(parseFloat(e.target.value) || 0)}
                  className="w-28 text-right rounded border border-slate-300 px-2 py-1 text-xs text-slate-800 focus:outline-emerald-500"
                />
              </div>

              {includePPN && (
                <div className="flex items-center justify-between text-slate-600">
                  <span>PPN 11%:</span>
                  <span className="font-semibold text-slate-800">{formatRupiah(taxAmount)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-bold text-slate-900">
                <span>Total Penawaran:</span>
                <span className="text-base text-emerald-600">{formatRupiah(finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/quotations"
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
          >
            Batal
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <Save className="h-4 w-4" />
            Simpan & Terbitkan Penawaran
          </button>
        </div>
      </form>
    </div>
  );
}
