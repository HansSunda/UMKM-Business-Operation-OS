'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Building,
  Calendar,
  Receipt,
  Briefcase,
} from 'lucide-react';
import { useWorkspace } from '../../../lib/context/workspace-context';
import { InvoiceItem, InvoiceStatus } from '../../../lib/types/database';
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

function NewInvoiceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedProjectId = searchParams.get('project_id');

  const { customers, projects, invoices, addInvoice } = useWorkspace();

  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [projectId, setProjectId] = useState(preselectedProjectId || '');
  const [invoiceNumber] = useState(generateDocumentNumber('INV', invoices.length));
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const defaultDueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  const [dueDate, setDueDate] = useState(defaultDueDate);
  const [notes, setNotes] = useState('Pembayaran mohon ditransfer ke rekening resmi BCA PT Ruang Karya Nusantara. Bukti transfer mohon dikirimkan via WhatsApp.');
  const [docDiscount, setDocDiscount] = useState<number>(0);
  const [includePPN, setIncludePPN] = useState<boolean>(false);
  const [error, setError] = useState('');

  // If preselected project, synchronize customer and default description
  useEffect(() => {
    if (preselectedProjectId) {
      const proj = projects.find((p) => p.id === preselectedProjectId);
      if (proj) {
        setCustomerId(proj.customer_id);
        setProjectId(proj.id);
        setItems([
          {
            id: crypto.randomUUID(),
            description: `Pembayaran Termin Proyek: ${proj.name}`,
            quantity: 1,
            unit: 'termin',
            unit_price: Math.round(proj.contract_value * 0.5),
            discount: 0,
          },
        ]);
      }
    }
  }, [preselectedProjectId, projects]);

  // Line items
  const [items, setItems] = useState<FormItem[]>([
    {
      id: crypto.randomUUID(),
      description: 'Jasa Pengerjaan / Termin Pembayaran',
      quantity: 1,
      unit: 'termin',
      unit_price: 10000000,
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
        unit: 'item',
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

  const availableProjects = projects.filter((p) => p.customer_id === customerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setError('Pilih klien untuk invoice ini');
      return;
    }
    if (items.some((i) => !i.description.trim())) {
      setError('Deskripsi item invoice wajib diisi');
      return;
    }

    try {
      const invoiceItems: InvoiceItem[] = calculatedItems.map((ci) => ({
        id: ci.id,
        invoice_id: '',
        description: ci.description,
        quantity: Number(ci.quantity) || 1,
        unit: ci.unit || 'item',
        unit_price: Number(ci.unit_price) || 0,
        discount: Number(ci.discount) || 0,
        subtotal: ci.subtotal,
        sort_order: ci.sort_order,
      }));

      const created = addInvoice({
        customer_id: customerId,
        project_id: projectId || null,
        invoice_number: invoiceNumber,
        issue_date: issueDate,
        due_date: dueDate,
        status: 'issued',
        subtotal: itemsSubtotal,
        discount: Number(docDiscount) || 0,
        tax: taxAmount,
        total: finalTotal,
        notes,
        items: invoiceItems,
      });

      router.push(`/invoices/${created.id}`);
    } catch {
      setError('Gagal membuat invoice');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Invoice
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">Buat Tagihan (Invoice) Baru</h1>
        <p className="text-sm text-slate-500">
          Terbitkan invoice resmi untuk penagihan termin proyek atau pekerjaan langsung kepada klien
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Meta Details */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Informasi Dokumen Invoice
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Klien / Pelanggan <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={customerId}
                onChange={(e) => {
                  setCustomerId(e.target.value);
                  setProjectId('');
                }}
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
                Tautkan Proyek (Opsional)
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-800 focus:outline-emerald-500"
              >
                <option value="">-- Bukan bagian dari proyek --</option>
                {availableProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.project_number})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Invoice (Auto)
              </label>
              <input
                type="text"
                readOnly
                value={invoiceNumber}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-mono font-semibold text-slate-700 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Terbit (Issue Date)
              </label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-800 focus:outline-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jatuh Tempo (Due Date)
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-800 focus:outline-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Invoice Line Items */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Rincian Item Tagihan
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
                  <th className="py-2.5 px-3 min-w-[200px]">Deskripsi Tagihan / Pekerjaan</th>
                  <th className="py-2.5 px-2 w-20">Jumlah</th>
                  <th className="py-2.5 px-2 w-24">Satuan</th>
                  <th className="py-2.5 px-2 w-32">Harga Satuan</th>
                  <th className="py-2.5 px-2 w-28">Diskon</th>
                  <th className="py-2.5 px-3 w-32 text-right">Subtotal</th>
                  <th className="py-2.5 px-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => {
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
                          placeholder="Termin 1 / Nama jasa..."
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
                          placeholder="termin/paket/unit"
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

          {/* Invoice Summary & PPN */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="w-full sm:w-1/2 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Pembayaran & Rekening
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
                  id="includePPNInv"
                  checked={includePPN}
                  onChange={(e) => setIncludePPN(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="includePPNInv" className="text-xs font-medium text-slate-700">
                  Tambahkan PPN 11%
                </label>
              </div>
            </div>

            <div className="w-full sm:w-80 rounded-lg bg-slate-50 p-4 border border-slate-200/70 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal Tagihan:</span>
                <span className="font-semibold text-slate-800">{formatRupiah(itemsSubtotal)}</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600">Potongan Diskon:</span>
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
                <span>Total Invoice:</span>
                <span className="text-base text-emerald-600">{formatRupiah(finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href="/invoices"
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
          >
            Batal
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <Save className="h-4 w-4" />
            Terbitkan Invoice
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Memuat formulir...</div>}>
      <NewInvoiceForm />
    </Suspense>
  );
}
