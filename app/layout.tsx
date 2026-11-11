import type { Metadata } from 'next';
import './globals.css';
import { WorkspaceProvider } from '../lib/context/workspace-context';
import { AppShell } from '../components/layout/app-shell';

export const metadata: Metadata = {
  title: 'UMKM Business Operations OS',
  description: 'Sistem Operasi Bisnis UMKM Jasa: Pelanggan, Penawaran, Proyek, Invoice & Pembayaran',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <WorkspaceProvider>
          <AppShell>{children}</AppShell>
        </WorkspaceProvider>
      </body>
    </html>
  );
}
