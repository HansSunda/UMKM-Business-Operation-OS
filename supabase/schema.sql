-- ==============================================================================
-- UMKM Business Operations OS — Complete PostgreSQL Schema, Functions, Views & RLS
-- File: supabase/schema.sql
-- 
-- CARA PENGGUNAAN DI WEBSITE SUPABASE:
-- 1. Buka dashboard proyek Anda di https://supabase.com/dashboard
-- 2. Masuk ke menu "SQL Editor" di bilah navigasi kiri
-- 3. Klik "New Query", tempel (paste) seluruh isi file ini, lalu klik "Run"
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Businesses Table (Tenants)
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

-- 4. Business Members Table (Multi-tenant membership and RBAC)
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

-- 5. Customers Table (Pelanggan)
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

-- 6. Quotations Table (Penawaran)
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

-- 7. Quotation Items Table
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

-- 8. Projects Table (Proyek)
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

-- 9. Invoices Table (Tagihan)
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

-- 10. Invoice Items Table
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

-- 11. Payments Table (Pembayaran)
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

-- 12. Helper Security Functions (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_user_business_ids(p_user_id UUID)
RETURNS SETOF UUID AS $$
BEGIN
    RETURN QUERY SELECT business_id FROM public.business_members WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_role(p_business_id UUID, p_user_id UUID)
RETURNS TEXT AS $$
DECLARE v_role TEXT;
BEGIN
    SELECT role INTO v_role FROM public.business_members WHERE business_id = p_business_id AND user_id = p_user_id;
    RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 13. Smart Calculated Views
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

-- 14. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 15. RLS Policies

-- Profiles
CREATE POLICY "Users can view their own profile or fellow members"
ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid() OR id IN (
    SELECT bm.user_id FROM public.business_members bm WHERE bm.business_id IN (SELECT public.get_user_business_ids(auth.uid()))
));

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

-- Businesses
CREATE POLICY "Users can view businesses they belong to"
ON public.businesses FOR SELECT TO authenticated
USING (id IN (SELECT public.get_user_business_ids(auth.uid())));

CREATE POLICY "Authenticated users can create a business"
ON public.businesses FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners and Admins can update business details"
ON public.businesses FOR UPDATE TO authenticated
USING (public.get_user_role(id, auth.uid()) IN ('owner', 'admin'))
WITH CHECK (public.get_user_role(id, auth.uid()) IN ('owner', 'admin'));

-- Business Members
CREATE POLICY "Members can view other members in their business"
ON public.business_members FOR SELECT TO authenticated
USING (business_id IN (SELECT public.get_user_business_ids(auth.uid())));

CREATE POLICY "Owners and Admins can manage members"
ON public.business_members FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR public.get_user_role(business_id, auth.uid()) IN ('owner', 'admin'));

CREATE POLICY "Owners and Admins can update member roles"
ON public.business_members FOR UPDATE TO authenticated
USING (public.get_user_role(business_id, auth.uid()) IN ('owner', 'admin'))
WITH CHECK (public.get_user_role(business_id, auth.uid()) IN ('owner', 'admin'));

CREATE POLICY "Owners can remove members"
ON public.business_members FOR DELETE TO authenticated
USING (public.get_user_role(business_id, auth.uid()) = 'owner');

-- Customers
CREATE POLICY "Users can view customers of their business"
ON public.customers FOR SELECT TO authenticated
USING (business_id IN (SELECT public.get_user_business_ids(auth.uid())));

CREATE POLICY "Users can insert customers for their business"
ON public.customers FOR INSERT TO authenticated
WITH CHECK (business_id IN (SELECT public.get_user_business_ids(auth.uid())));

CREATE POLICY "Users can update customers of their business"
ON public.customers FOR UPDATE TO authenticated
USING (business_id IN (SELECT public.get_user_business_ids(auth.uid())));

CREATE POLICY "Owners and Admins can delete customers"
ON public.customers FOR DELETE TO authenticated
USING (public.get_user_role(business_id, auth.uid()) IN ('owner', 'admin'));

-- Quotations
CREATE POLICY "Users can view quotations of their business"
ON public.quotations FOR SELECT TO authenticated
USING (business_id IN (SELECT public.get_user_business_ids(auth.uid())));

CREATE POLICY "Users can create quotations for their business"
ON public.quotations FOR INSERT TO authenticated
WITH CHECK (business_id IN (SELECT public.get_user_business_ids(auth.uid())));

CREATE POLICY "Users can update quotations of their business"
ON public.quotations FOR UPDATE TO authenticated
USING (business_id IN (SELECT public.get_user_business_ids(auth.uid())));

CREATE POLICY "Owners and Admins can delete quotations"
ON public.quotations FOR DELETE TO authenticated
USING (public.get_user_role(business_id, auth.uid()) IN ('owner', 'admin'));

-- Quotation Items
CREATE POLICY "Users can view quotation items"
ON public.quotation_items FOR SELECT TO authenticated
USING (quotation_id IN (SELECT id FROM public.quotations WHERE business_id IN (SELECT public.get_user_business_ids(auth.uid()))));

CREATE POLICY "Users can insert quotation items"
ON public.quotation_items FOR INSERT TO authenticated
WITH CHECK (quotation_id IN (SELECT id FROM public.quotations WHERE business_id IN (SELECT public.get_user_business_ids(auth.uid()))));

CREATE POLICY "Users can update quotation items"
ON public.quotation_items FOR UPDATE TO authenticated
USING (quotation_id IN (SELECT id FROM public.quotations WHERE business_id IN (SELECT public.get_user_business_ids(auth.uid()))));

CREATE POLICY "Users can delete quotation items"
ON public.quotation_items FOR DELETE TO authenticated
USING (quotation_id IN (SELECT id FROM public.quotations WHERE business_id IN (SELECT public.get_user_business_ids(auth.uid()))));

-- Projects
CREATE POLICY "Users can view projects of their business"
ON public.projects FOR SELECT TO authenticated
USING (business_id IN (SELECT public.get_user_business_ids(auth.uid())));

CREATE POLICY "Users can create projects for their business"
ON public.projects FOR INSERT TO authenticated
WITH CHECK (business_id IN (SELECT public.get_user_business_ids(auth.uid())));

CREATE POLICY "Users can update projects of their business"
ON public.projects FOR UPDATE TO authenticated
USING (business_id IN (SELECT public.get_user_business_ids(auth.uid())));

CREATE POLICY "Owners and Admins can delete projects"
ON public.projects FOR DELETE TO authenticated
USING (public.get_user_role(business_id, auth.uid()) IN ('owner', 'admin'));

-- Invoices
CREATE POLICY "Users can view invoices of their business"
ON public.invoices FOR SELECT TO authenticated
USING (business_id IN (SELECT public.get_user_business_ids(auth.uid())));

CREATE POLICY "Users can create invoices for their business"
ON public.invoices FOR INSERT TO authenticated
WITH CHECK (business_id IN (SELECT public.get_user_business_ids(auth.uid())));

CREATE POLICY "Users can update invoices of their business"
ON public.invoices FOR UPDATE TO authenticated
USING (business_id IN (SELECT public.get_user_business_ids(auth.uid())));

CREATE POLICY "Owners and Admins can delete invoices"
ON public.invoices FOR DELETE TO authenticated
USING (public.get_user_role(business_id, auth.uid()) IN ('owner', 'admin'));

-- Invoice Items
CREATE POLICY "Users can view invoice items"
ON public.invoice_items FOR SELECT TO authenticated
USING (invoice_id IN (SELECT id FROM public.invoices WHERE business_id IN (SELECT public.get_user_business_ids(auth.uid()))));

CREATE POLICY "Users can insert invoice items"
ON public.invoice_items FOR INSERT TO authenticated
WITH CHECK (invoice_id IN (SELECT id FROM public.invoices WHERE business_id IN (SELECT public.get_user_business_ids(auth.uid()))));

CREATE POLICY "Users can update invoice items"
ON public.invoice_items FOR UPDATE TO authenticated
USING (invoice_id IN (SELECT id FROM public.invoices WHERE business_id IN (SELECT public.get_user_business_ids(auth.uid()))));

CREATE POLICY "Users can delete invoice items"
ON public.invoice_items FOR DELETE TO authenticated
USING (invoice_id IN (SELECT id FROM public.invoices WHERE business_id IN (SELECT public.get_user_business_ids(auth.uid()))));

-- Payments
CREATE POLICY "Users can view payments of their business"
ON public.payments FOR SELECT TO authenticated
USING (business_id IN (SELECT public.get_user_business_ids(auth.uid())));

CREATE POLICY "Users can record payments for their business"
ON public.payments FOR INSERT TO authenticated
WITH CHECK (business_id IN (SELECT public.get_user_business_ids(auth.uid())));

CREATE POLICY "Owners and Admins can update payment records"
ON public.payments FOR UPDATE TO authenticated
USING (public.get_user_role(business_id, auth.uid()) IN ('owner', 'admin'));

CREATE POLICY "Owners and Admins can delete payment records"
ON public.payments FOR DELETE TO authenticated
USING (public.get_user_role(business_id, auth.uid()) IN ('owner', 'admin'));
