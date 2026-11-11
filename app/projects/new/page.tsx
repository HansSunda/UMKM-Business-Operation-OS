'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Briefcase, Calendar, DollarSign, Building } from 'lucide-react';
import { useWorkspace } from '../../../lib/context/workspace-context';
import { ProjectStatus } from '../../../lib/types/database';
import { generateDocumentNumber } from '../../../lib/utils/id-generator';

export default function NewProjectPage() {
  const router = useRouter();
  const { customers, quotations, projects, addProject } = useWorkspace();

  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [quotationId, setQuotationId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [contractValue, setContractValue] = useState<number>(10000000);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const defaultDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  const [dueDate, setDueDate] = useState(defaultDueDate);
  const [status, setStatus] = useState<ProjectStatus>('active');
  const [error, setError] = useState('');

  const handleQuotationSelect = (qId: string) => {
    setQuotationId(qId);
    if (!qId) return;
    const selectedQuote = quotations.find((q) => q.id === qId);
    if (selectedQuote) {
      setCustomerId(selectedQuote.customer_id);
      setName(`Pekerjaan: ${selectedQuote.quotation_number}`);
      setContractValue(selectedQuote.total);
      if (selectedQuote.notes) setDescription(selectedQuote.notes);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama proyek wajib diisi');
      return;
    }
    if (!customerId) {
      setError('Pilih klien untuk proyek ini');
      return;
    }

    try {
      const created = addProject({
        customer_id: customerId,
        quotation_id: quotationId || null,
        project_number: generateDocumentNumber('PRJ', projects.length),
        name: name.trim(),
        description: description.trim() || null,
        start_date: startDate || null,
        due_date: dueDate || null,
        status,
        contract_value: Number(contractValue) || 0,
      });

      router.push(`/projects/${created.id}`);
    } catch {
      setError('Gagal membuat proyek baru');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Proyek
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">Buat Proyek Baru</h1>
        <p className="text-sm text-slate-500">
          Daftarkan pekerjaan jasa baru untuk memantau waktu pengerjaan dan penerbitan invoice
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        {/* Optional: Pick Quotation */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Tautkan Dari Penawaran (Opsional)
          </label>
          <select
            value={quotationId}
            onChange={(e) => handleQuotationSelect(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-800 focus:outline-emerald-500"
          >
            <option value="">-- Buat proyek mandiri (tanpa penawaran) --</option>
            {quotations.map((q) => {
              const cust = customers.find((c) => c.id === q.customer_id);
              return (
                <option key={q.id} value={q.id}>
                  {q.quotation_number} - {cust?.name} ({q.status})
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Nama Proyek / Pekerjaan <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Fit-Out Interior Ruang Meeting atau Pembuatan Website Company Profile"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            className="w-full rounded-lg border border-slate-300 py-2 px-3 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
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
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Nilai Kontrak (Rp) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              step="1000"
              value={contractValue}
              onChange={(e) => setContractValue(parseFloat(e.target.value) || 0)}
              className="w-full rounded-lg border border-slate-300 py-2 px-3 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:outline-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Target Selesai (Due Date)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-800 focus:outline-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Status Awal
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs text-slate-800 focus:outline-emerald-500"
            >
              <option value="lead">Prospek / Lead</option>
              <option value="active">Aktif (Sedang Dikerjakan)</option>
              <option value="on_hold">Ditunda</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Deskripsi / Lingkup Pekerjaan
          </label>
          <textarea
            rows={3}
            placeholder="Rincian lingkup kerja, catatan SPK, atau instruksi pengerjaan..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-slate-300 p-2.5 text-xs text-slate-800 focus:outline-emerald-500"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link
            href="/projects"
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
          >
            Batal
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <Save className="h-4 w-4" />
            Simpan Proyek
          </button>
        </div>
      </form>
    </div>
  );
}
