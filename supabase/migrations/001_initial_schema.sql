-- ==============================================================================
-- UMKM Business Operations OS — Initial Database Schema
-- Migration: 001_initial_schema.sql
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Profiles Table (Linked to auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 2. Businesses Table (Tenants)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    business_type TEXT NOT NULL,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    phone TEXT,
    email TEXT,
    address TEXT,
    logo_url TEXT,
    bank_name TEXT,
    bank_account_number TEXT,
    bank_account_holder TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 3. Business Members Table (Multi-tenant membership and RBAC)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.business_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'staff')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(business_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_business_members_user ON public.business_members(user_id);
CREATE INDEX IF NOT EXISTS idx_business_members_business ON public.business_members(business_id);

-- ------------------------------------------------------------------------------
-- 4. Customers Table (Pelanggan)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_customers_business ON public.customers(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(business_id, name);

-- ------------------------------------------------------------------------------
-- 5. Quotations Table (Penawaran)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    quotation_number TEXT NOT NULL,
    quotation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired', 'converted')),
    subtotal NUMERIC(15,2) NOT NULL DEFAULT 0,
    discount NUMERIC(15,2) NOT NULL DEFAULT 0,
    tax NUMERIC(15,2) NOT NULL DEFAULT 0,
    total NUMERIC(15,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(business_id, quotation_number)
);

CREATE INDEX IF NOT EXISTS idx_quotations_business ON public.quotations(business_id);
CREATE INDEX IF NOT EXISTS idx_quotations_customer ON public.quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON public.quotations(business_id, status);

-- ------------------------------------------------------------------------------
-- 6. Quotation Items Table (Item Penawaran)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quotation_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT 'item',
    unit_price NUMERIC(15,2) NOT NULL DEFAULT 0,
    discount NUMERIC(15,2) NOT NULL DEFAULT 0,
    subtotal NUMERIC(15,2) NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation ON public.quotation_items(quotation_id);

-- ------------------------------------------------------------------------------
-- 7. Projects Table (Proyek / Surat Perintah Kerja)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
    project_number TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('lead', 'active', 'on_hold', 'completed', 'cancelled')),
    contract_value NUMERIC(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(business_id, project_number)
);

CREATE INDEX IF NOT EXISTS idx_projects_business ON public.projects(business_id);
CREATE INDEX IF NOT EXISTS idx_projects_customer ON public.projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(business_id, status);

-- ------------------------------------------------------------------------------
-- 8. Invoices Table (Tagihan)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'partially_paid', 'paid', 'overdue', 'cancelled')),
    subtotal NUMERIC(15,2) NOT NULL DEFAULT 0,
    discount NUMERIC(15,2) NOT NULL DEFAULT 0,
    tax NUMERIC(15,2) NOT NULL DEFAULT 0,
    total NUMERIC(15,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(business_id, invoice_number)
);

CREATE INDEX IF NOT EXISTS idx_invoices_business ON public.invoices(business_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON public.invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_project ON public.invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(business_id, status);

-- ------------------------------------------------------------------------------
-- 9. Invoice Items Table (Item Tagihan)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT 'item',
    unit_price NUMERIC(15,2) NOT NULL DEFAULT 0,
    discount NUMERIC(15,2) NOT NULL DEFAULT 0,
    subtotal NUMERIC(15,2) NOT NULL DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON public.invoice_items(invoice_id);

-- ------------------------------------------------------------------------------
-- 10. Payments Table (Pembayaran)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'e_wallet', 'other')),
    reference TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_payments_business ON public.payments(business_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(business_id, payment_date);

-- ------------------------------------------------------------------------------
-- 11. Automated Timestamps Trigger Function
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    CREATE TRIGGER set_timestamp_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    CREATE TRIGGER set_timestamp_businesses BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    CREATE TRIGGER set_timestamp_customers BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    CREATE TRIGGER set_timestamp_quotations BEFORE UPDATE ON public.quotations FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    CREATE TRIGGER set_timestamp_projects BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    CREATE TRIGGER set_timestamp_invoices BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
EXCEPTION WHEN others THEN
    NULL;
END $$;

-- ------------------------------------------------------------------------------
-- 12. Smart Financial Summary Views
-- ------------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.v_invoice_summaries AS
SELECT 
    i.*,
    COALESCE(p.total_paid, 0) AS total_paid,
    (i.total - COALESCE(p.total_paid, 0)) AS remaining_balance,
    CASE 
        WHEN i.status = 'cancelled' THEN 'cancelled'
        WHEN COALESCE(p.total_paid, 0) >= i.total THEN 'paid'
        WHEN COALESCE(p.total_paid, 0) > 0 AND COALESCE(p.total_paid, 0) < i.total THEN 'partially_paid'
        WHEN CURRENT_DATE > i.due_date AND (i.total - COALESCE(p.total_paid, 0)) > 0 THEN 'overdue'
        ELSE i.status
    END AS calculated_status
FROM public.invoices i
LEFT JOIN (
    SELECT invoice_id, SUM(amount) AS total_paid
    FROM public.payments
    GROUP BY invoice_id
) p ON i.id = p.invoice_id;

CREATE OR REPLACE VIEW public.v_project_financials AS
SELECT
    proj.*,
    COALESCE(inv.total_invoiced, 0) AS total_invoiced,
    COALESCE(pay.total_paid, 0) AS total_paid,
    (proj.contract_value - COALESCE(pay.total_paid, 0)) AS outstanding_balance
FROM public.projects proj
LEFT JOIN (
    SELECT project_id, SUM(total) AS total_invoiced
    FROM public.invoices
    WHERE status != 'cancelled'
    GROUP BY project_id
) inv ON proj.id = inv.project_id
LEFT JOIN (
    SELECT i.project_id, SUM(p.amount) AS total_paid
    FROM public.payments p
    JOIN public.invoices i ON p.invoice_id = i.id
    WHERE i.project_id IS NOT NULL AND i.status != 'cancelled'
    GROUP BY i.project_id
) pay ON proj.id = pay.project_id;
