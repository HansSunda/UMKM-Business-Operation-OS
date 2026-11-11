'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Building,
  Phone,
  Mail,
  MapPin,
  FileText,
  Briefcase,
  Receipt,
  CreditCard,
  Edit2,
  Trash2,
  Plus,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useWorkspace } from '../../../lib/context/workspace-context';
import {
  formatRupiah,
  formatDateIndo,
  translateStatus,
  getStatusBadgeClass,
} from '../../../lib/utils/formatters';

export default function CustomerDetailPage() {
  const params = useParams();
  const customerId = params?.id as string;
  const router = useRouter();
  const {
    getCustomerSummary,
    updateCustomer,
    deleteCustomer,
    getInvoiceWithPayments,
  } = useWorkspace();

  const summary = getCustomerSummary(customerId);
  const customer = summary.customer;

  const [activeTab, setActiveTab] = useState<'all' | 'quotes' | 'projects' | 'invoices' | 'payments'>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(customer?.name || '');
  const [editPhone, setEditPhone] = useState(customer?.phone || '');
  const [editEmail, setEditEmail] = useState(customer?.email || '');
  const [editAddress, setEditAddress] = useState(customer?.address || '');
  const [editNotes, setEditNotes] = useState(customer?.notes || '');

  if (!customer) {
    return (
      <div className="p-12 text-center">
        <Building className="h-10 w-10 text-slate-300 mx-auto mb-2" />
        <h2 className="text-base font-semibold text-slate-800">Pelanggan tidak ditemukan</h2>
        <p className="text-xs text-slate-500 mt-1">Data pelanggan mungkin telah dihapus</p>
        <Link
          href="/customers"
          className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Direktori Pelanggan
        </Link>
      </div>
    );
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomer(customer.id, {
      name: editName.trim(),
      phone: editPhone.trim() || null,
      email: editEmail.trim() || null,
      address: editAddress.trim() || null,
      notes: editNotes.trim() || null,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm(`Yakin ingin menghapus pelanggan "${customer.name}"?`)) {
      deleteCustomer(customer.id);
      router.push('/customers');
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/customers"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Pelanggan
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">{customer.name}</h1>
          <p className="text-xs text-slate-500">Terdaftar sejak {formatDateIndo(customer.created_at)}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditName(customer.name);
              setEditPhone(customer.phone || '');
              setEditEmail(customer.email || '');
              setEditAddress(customer.address || '');
              setEditNotes(customer.notes || '');
              setIsEditing(!isEditing);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <Edit2 className="h-3.5 w-3.5" />
            {isEditing ? 'Batal Edit' : 'Edit Profil'}
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-100 transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Hapus
          </button>
        </div>
      </div>

      {/* Edit Form Modal/Card */}
      {isEditing && (
        <form onSubmit={handleSaveEdit} className="rounded-xl border border-emerald-200 bg-emerald-50/20 p-5 shadow-xs space-y-4">
          <h3 className="font-semibold text-sm text-slate-800">Edit Data Pelanggan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nama</label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Telepon / WhatsApp</label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Alamat</label>
              <input
                type="text"
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Catatan</label>
            <textarea
              rows={2}
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-emerald-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-xs text-slate-600 hover:text-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-md hover:bg-emerald-700"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      )}

      {/* Summary KPI Cards & Contact Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Contact Details Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Informasi Kontak
          </h2>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-start gap-2.5">
              <Phone className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-slate-500">Nomor WhatsApp</div>
                <div className="font-medium text-slate-800">
                  {customer.phone ? (
                    <a
                      href={`https://wa.me/${customer.phone.replace(/^0/, '62')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      {customer.phone} <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    '-'
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Mail className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-slate-500">Email</div>
                <div className="font-medium text-slate-800">{customer.email || '-'}</div>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs text-slate-500">Alamat</div>
                <div className="font-medium text-slate-800">{customer.address || '-'}</div>
              </div>
            </div>

            {customer.notes && (
              <div className="pt-2 border-t border-slate-100">
                <div className="text-xs text-slate-500 mb-1">Catatan Klien</div>
                <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {customer.notes}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Unified Financial Summary Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-medium text-slate-500">Total Pembayaran Diterima (LTV)</span>
            <div className="text-2xl font-bold text-emerald-600 mt-2">
              {formatRupiah(summary.totalRevenue)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Dari {summary.payments.length} transaksi penerimaan
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-medium text-slate-500">Sisa Tagihan Tertunggak</span>
            <div className="text-2xl font-bold text-amber-600 mt-2">
              {formatRupiah(summary.outstandingBalance)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Piutang yang belum dilunasi klien ini
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">Jumlah Penawaran</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">{summary.quotations.length}</div>
            </div>
            <Link
              href="/quotations/new"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              + Penawaran
            </Link>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500">Jumlah Proyek</span>
              <div className="text-lg font-bold text-slate-900 mt-0.5">{summary.projects.length}</div>
            </div>
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              + Proyek
            </Link>
          </div>
        </div>
      </div>

      {/* Unified Activity Tabs */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'all'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Semua Aktivitas
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'quotes'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Penawaran ({summary.quotations.length})
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'projects'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Proyek ({summary.projects.length})
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'invoices'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Tagihan / Invoice ({summary.invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'payments'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Pembayaran ({summary.payments.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5">
          {/* Quotations List */}
          {(activeTab === 'all' || activeTab === 'quotes') && (
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Daftar Penawaran
                </h3>
                <Link
                  href="/quotations/new"
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  + Buat Penawaran
                </Link>
              </div>

              {summary.quotations.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  Belum ada penawaran untuk pelanggan ini
                </div>
              ) : (
                <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {summary.quotations.map((q) => (
                    <div key={q.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <Link
                          href={`/quotations/${q.id}`}
                          className="font-semibold text-xs text-slate-900 hover:text-emerald-600"
                        >
                          {q.quotation_number}
                        </Link>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Tanggal: {formatDateIndo(q.quotation_date)} &bull; Berlaku s/d: {formatDateIndo(q.valid_until)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-xs text-slate-900">
                          {formatRupiah(q.total)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusBadgeClass(q.status)}`}>
                          {translateStatus(q.status)}
                        </span>
                        <Link
                          href={`/quotations/${q.id}`}
                          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                        >
                          Detail &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Projects List */}
          {(activeTab === 'all' || activeTab === 'projects') && (
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Daftar Proyek
                </h3>
                <Link
                  href="/projects/new"
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  + Tambah Proyek
                </Link>
              </div>

              {summary.projects.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  Belum ada proyek untuk pelanggan ini
                </div>
              ) : (
                <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {summary.projects.map((p) => (
                    <div key={p.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <Link
                          href={`/projects/${p.id}`}
                          className="font-semibold text-xs text-slate-900 hover:text-emerald-600"
                        >
                          {p.name}
                        </Link>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {p.project_number} &bull; Target Selesai: {formatDateIndo(p.due_date)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-xs text-slate-900">
                          {formatRupiah(p.contract_value)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusBadgeClass(p.status)}`}>
                          {translateStatus(p.status)}
                        </span>
                        <Link
                          href={`/projects/${p.id}`}
                          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                        >
                          Detail &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Invoices List */}
          {(activeTab === 'all' || activeTab === 'invoices') && (
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Daftar Tagihan (Invoice)
                </h3>
                <Link
                  href="/invoices/new"
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  + Buat Invoice
                </Link>
              </div>

              {summary.invoices.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  Belum ada tagihan untuk pelanggan ini
                </div>
              ) : (
                <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {summary.invoices.map((inv) => {
                    const invData = getInvoiceWithPayments(inv.id);
                    return (
                      <div key={inv.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                        <div>
                          <Link
                            href={`/invoices/${inv.id}`}
                            className="font-semibold text-xs text-slate-900 hover:text-emerald-600"
                          >
                            {inv.invoice_number}
                          </Link>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Jatuh Tempo: {formatDateIndo(inv.due_date)} &bull; Total: {formatRupiah(inv.total)}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-xs font-semibold text-slate-900">
                              Sisa: {formatRupiah(invData?.remaining_balance)}
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusBadgeClass(invData?.status || inv.status)}`}>
                            {translateStatus(invData?.status || inv.status)}
                          </span>
                          <Link
                            href={`/invoices/${inv.id}`}
                            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
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
          )}

          {/* Payments History */}
          {(activeTab === 'all' || activeTab === 'payments') && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Riwayat Pembayaran Diterima
              </h3>

              {summary.payments.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  Belum ada catatan pembayaran dari pelanggan ini
                </div>
              ) : (
                <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {summary.payments.map((pay) => (
                    <div key={pay.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <div className="font-semibold text-xs text-emerald-700">
                          {formatRupiah(pay.amount)}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {formatDateIndo(pay.payment_date)} &bull; Metode: {translateStatus(pay.payment_method)}
                          {pay.reference && ` &bull; Ref: ${pay.reference}`}
                        </div>
                        {pay.notes && (
                          <div className="text-[11px] text-slate-400 mt-0.5">{pay.notes}</div>
                        )}
                      </div>
                      <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-1 rounded">
                        Berhasil
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
