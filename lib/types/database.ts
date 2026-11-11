export type UserRole = 'owner' | 'admin' | 'staff';

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';

export type ProjectStatus = 'lead' | 'active' | 'on_hold' | 'completed' | 'cancelled';

export type InvoiceStatus = 'draft' | 'issued' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'e_wallet' | 'other';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  phone?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  name: string;
  business_type: string;
  owner_id: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  logo_url?: string | null;
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_account_holder?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessMember {
  id: string;
  business_id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  profile?: Profile;
}

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuotationItem {
  id: string;
  quotation_id: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount: number;
  subtotal: number;
  sort_order: number;
}

export interface Quotation {
  id: string;
  business_id: string;
  customer_id: string;
  quotation_number: string;
  quotation_date: string;
  valid_until: string;
  status: QuotationStatus;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  items?: QuotationItem[];
}

export interface Project {
  id: string;
  business_id: string;
  customer_id: string;
  quotation_id?: string | null;
  project_number: string;
  name: string;
  description?: string | null;
  start_date?: string | null;
  due_date?: string | null;
  status: ProjectStatus;
  contract_value: number;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  quotation?: Quotation;
  // Computed stats
  total_invoiced?: number;
  total_paid?: number;
  outstanding_balance?: number;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  discount: number;
  subtotal: number;
  sort_order: number;
}

export interface Invoice {
  id: string;
  business_id: string;
  customer_id: string;
  project_id?: string | null;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  status: InvoiceStatus;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  project?: Project;
  items?: InvoiceItem[];
  payments?: Payment[];
  // Computed balances
  total_paid?: number;
  remaining_balance?: number;
}

export interface Payment {
  id: string;
  business_id: string;
  invoice_id: string;
  payment_date: string;
  amount: number;
  payment_method: PaymentMethod;
  reference?: string | null;
  notes?: string | null;
  created_at: string;
  invoice?: Invoice;
}
