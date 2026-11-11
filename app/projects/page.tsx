'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  ChevronRight,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useWorkspace } from '../../lib/context/workspace-context';
import {
  formatRupiah,
  formatDateIndo,
  translateStatus,
  getStatusBadgeClass,
} from '../../lib/utils/formatters';

export default function ProjectsPage() {
  const { projects, customers, getProjectWithFinancials } = useWorkspace();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredProjects = projects.filter((p) => {
    const cust = customers.find((c) => c.id === p.customer_id);
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.project_number.toLowerCase().includes(search.toLowerCase()) ||
      (cust && cust.name.toLowerCase().includes(search.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: projects.length,
    active: projects.filter((p) => p.status === 'active').length,
    completed: projects.filter((p) => p.status === 'completed').length,
    lead: projects.filter((p) => p.status === 'lead').length,
    on_hold: projects.filter((p) => p.status === 'on_hold').length,
  };

  const totalContractValue = projects.reduce((s, p) => s + p.contract_value, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manajemen Proyek</h1>
          <p className="text-sm text-slate-500 mt-1">
            Pantau pekerjaan aktif, deadline penyelesaian, dan penagihan termin proyek
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
        >
          <Plus className="h-4 w-4" />
          Tambah Proyek Baru
        </Link>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex overflow-x-auto border-b border-slate-200 sm:border-0 gap-1 pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Semua ({statusCounts.all})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === 'active'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Aktif ({statusCounts.active})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === 'completed'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Selesai ({statusCounts.completed})
          </button>
          <button
            onClick={() => setStatusFilter('lead')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === 'lead'
                ? 'bg-slate-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Prospek ({statusCounts.lead})
          </button>
          <button
            onClick={() => setStatusFilter('on_hold')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === 'on_hold'
                ? 'bg-purple-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Ditunda ({statusCounts.on_hold})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama proyek atau klien..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Projects Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {filteredProjects.length === 0 ? (
          <div className="p-12 text-center">
            <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-slate-800">Tidak ada proyek ditemukan</h3>
            <p className="text-xs text-slate-500 mt-1">
              Tambahkan proyek baru atau konversikan penawaran harga yang disetujui
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Nama Proyek</th>
                  <th className="py-3.5 px-4">Klien</th>
                  <th className="py-3.5 px-4">Nilai Kontrak</th>
                  <th className="py-3.5 px-4">Progres Penagihan</th>
                  <th className="py-3.5 px-4">Target Deadline</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.map((project) => {
                  const projData = getProjectWithFinancials(project.id);
                  const percentPaid =
                    project.contract_value > 0
                      ? Math.min(100, Math.round(((projData?.total_paid || 0) / project.contract_value) * 100))
                      : 0;

                  return (
                    <tr key={project.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-4 sm:px-6">
                        <Link
                          href={`/projects/${project.id}`}
                          className="font-semibold text-slate-900 hover:text-emerald-600 block"
                        >
                          {project.name}
                        </Link>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {project.project_number}
                          {project.description && ` • ${project.description}`}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-slate-800">
                        {projData?.customer?.name || '-'}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-900 text-xs">
                        {formatRupiah(project.contract_value)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-emerald-600 font-semibold">
                            {formatRupiah(projData?.total_paid)}
                          </span>
                          <span className="text-slate-400">{percentPaid}%</span>
                        </div>
                        <div className="w-28 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${percentPaid}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Sisa: {formatRupiah(projData?.outstanding_balance)}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600">
                        {formatDateIndo(project.due_date)}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${getStatusBadgeClass(project.status)}`}>
                          {translateStatus(project.status)}
                        </span>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <Link
                          href={`/projects/${project.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                        >
                          Lihat Proyek <ChevronRight className="h-3.5 w-3.5" />
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
    </div>
  );
}
