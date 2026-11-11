'use client';

import React, { useState } from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { useWorkspace } from '../../lib/context/workspace-context';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isLoaded } = useWorkspace();

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent mx-auto"></div>
          <p className="mt-3 text-sm text-slate-500 font-medium">Memuat sistem operasi UMKM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex min-h-screen flex-col lg:pl-64">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
