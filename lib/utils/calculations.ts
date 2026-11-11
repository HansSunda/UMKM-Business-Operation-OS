import { Invoice, Payment, QuotationItem, InvoiceItem } from '../types/database';

export function calculateItemSubtotal(
  quantity: number,
  unitPrice: number,
  discount: number = 0
): number {
  const q = Math.max(0, Number(quantity) || 0);
  const p = Math.max(0, Number(unitPrice) || 0);
  const d = Math.max(0, Number(discount) || 0);
  return Math.max(0, q * p - d);
}

export function calculateDocumentTotals(
  items: Array<{ quantity: number; unit_price: number; discount?: number }>,
  docDiscount: number = 0,
  docTax: number = 0
): { subtotal: number; discount: number; tax: number; total: number } {
  const subtotal = items.reduce((sum, item) => {
    return sum + calculateItemSubtotal(item.quantity, item.unit_price, item.discount || 0);
  }, 0);

  const discount = Math.max(0, Number(docDiscount) || 0);
  const afterDiscount = Math.max(0, subtotal - discount);
  const tax = Math.max(0, Number(docTax) || 0);
  const total = afterDiscount + tax;

  return {
    subtotal,
    discount,
    tax,
    total,
  };
}

export function calculateInvoiceBalance(
  invoiceTotal: number,
  payments: Payment[] | Array<{ amount: number }> = []
): { totalPaid: number; remainingBalance: number } {
  const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const remainingBalance = Math.max(0, (Number(invoiceTotal) || 0) - totalPaid);

  return {
    totalPaid,
    remainingBalance,
  };
}

export function determineInvoiceStatus(
  status: string,
  total: number,
  totalPaid: number,
  dueDate: string
): string {
  if (status === 'cancelled') return 'cancelled';
  if (status === 'draft') return 'draft';

  if (totalPaid >= total && total > 0) {
    return 'paid';
  }

  if (totalPaid > 0 && totalPaid < total) {
    return 'partially_paid';
  }

  const today = new Date().toISOString().split('T')[0];
  if (dueDate && today > dueDate && totalPaid < total) {
    return 'overdue';
  }

  return 'issued';
}
