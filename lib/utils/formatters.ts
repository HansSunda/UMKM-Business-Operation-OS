/**
 * Indonesian Currency and Date formatting utilities
 */

export function formatRupiah(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0';
  }
  return new Intl.NumberFormat('id-ID').format(amount);
}

export function formatDateIndo(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatShortDateIndo(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getStatusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'completed':
    case 'accepted':
    case 'converted':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20';
    case 'partially_paid':
    case 'active':
    case 'sent':
      return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20';
    case 'draft':
    case 'lead':
      return 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-600/20';
    case 'overdue':
    case 'rejected':
    case 'cancelled':
      return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20';
    case 'on_hold':
    case 'expired':
      return 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-600/20';
    case 'issued':
      return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}

export function translateStatus(status: string): string {
  const map: Record<string, string> = {
    // Quotations
    draft: 'Draf',
    sent: 'Terkirim',
    accepted: 'Diterima',
    rejected: 'Ditolak',
    expired: 'Kadaluarsa',
    converted: 'Menjadi Proyek',
    // Projects
    lead: 'Prospek',
    active: 'Aktif',
    on_hold: 'Ditunda',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
    // Invoices
    issued: 'Diterbitkan',
    partially_paid: 'Dibayar Sebagian',
    paid: 'Lunas',
    overdue: 'Jatuh Tempo',
    // Payments
    cash: 'Tunai',
    bank_transfer: 'Transfer Bank',
    e_wallet: 'E-Wallet',
    other: 'Lainnya',
  };

  return map[status.toLowerCase()] || status;
}
