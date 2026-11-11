-- ==============================================================================
-- UMKM Business Operations OS — Row Level Security (RLS) Policies
-- Migration: 002_rls_policies.sql
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Helper Security Functions (SECURITY DEFINER to avoid circular RLS checks)
-- ------------------------------------------------------------------------------

-- Returns all business IDs that the given user belongs to
CREATE OR REPLACE FUNCTION public.get_user_business_ids(p_user_id UUID)
RETURNS SETOF UUID AS $$
BEGIN
    RETURN QUERY
    SELECT business_id
    FROM public.business_members
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Returns the role of the user within a specific business
CREATE OR REPLACE FUNCTION public.get_user_role(p_business_id UUID, p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_role TEXT;
BEGIN
    SELECT role INTO v_role
    FROM public.business_members
    WHERE business_id = p_business_id AND user_id = p_user_id;
    RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ------------------------------------------------------------------------------
-- 2. Enable Row Level Security (RLS) on all tables
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 3. Profiles Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view their own profile or fellow members"
ON public.profiles FOR SELECT
TO authenticated
USING (
    id = auth.uid() OR
    id IN (
        SELECT bm.user_id 
        FROM public.business_members bm 
        WHERE bm.business_id IN (SELECT public.get_user_business_ids(auth.uid()))
    )
);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- ------------------------------------------------------------------------------
-- 4. Businesses Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view businesses they belong to"
ON public.businesses FOR SELECT
TO authenticated
USING (id IN (SELECT public.get_user_business_ids(auth.uid())));

CREATE POLICY "Authenticated users can create a business"
ON public.businesses FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners and Admins can update business details"
ON public.businesses FOR UPDATE
TO authenticated
USING (public.get_user_role(id, auth.uid()) IN ('owner', 'admin'))
WITH CHECK (public.get_user_role(id, auth.uid()) IN ('owner', 'admin'));

-- ------------------------------------------------------------------------------
-- 5. Business Members Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Members can view other members in their business"
ON public.business_members FOR SELECT
TO authenticated
USING (business_id IN (SELECT public.get_user_business_ids(auth.uid())));

CREATE POLICY "Owners and Admins can manage members"
ON public.business_members FOR INSERT
TO authenticated
WITH CHECK (
    -- Allow the creator to add themselves as owner on business creation
    user_id = auth.uid() OR 
    public.get_user_role(business_id, auth.uid()) IN ('owner', 'admin')
);

CREATE POLICY "Owners and Admins can update member roles"
ON public.business_members FOR UPDATE
TO authenticated
USING (public.get_user_role(business_id, auth.uid()) IN ('owner', 'admin'))
WITH CHECK (public.get_user_role(business_id, auth.uid()) IN ('owner', 'admin'));

CREATE POLICY "Owners can remove members"
ON public.business_members FOR DELETE
TO authenticated
USING (public.get_user_role(business_id, auth.uid()) = 'owner');

-- ------------------------------------------------------------------------------
-- 6. Customers Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view customers of their business"
ON public.customers FOR SELECT
TO authenticated
USING (business_id IN (SELECT public.get_user_business_ids(auth.uid())));

CREATE POLICY "Users can insert customers for their business"
ON public.customers FOR INSERT
TO authenticated
WITH CHECK (business_id IN (SELECT public.get_user_business_ids(auth.uid())));

CREATE POLICY "Users can update customers of their business"
ON public.customers FOR UPDATE
TO authenticated
USING (business_id IN (SELECT public.get_user_business_ids(auth.uid())));

CREATE POLICY "Owners and Admins can delete customers"
ON public.customers FOR DELETE
TO authenticated
USING (public.get_user_role(business_id, auth.uid()) IN ('owner', 'admin'));

-- ------------------------------------------------------------------------------
-- 7. Quotations Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view quotations of their business"
ON public.quotations FOR SELECT
TO authenticated
USING (business_id IN (SELECT public.get_user_business_ids(auth.uid())));

CREATE POLICY "Users can create quotations for their business"
ON public.quotations FOR INSERT
TO authenticated
WITH CHECK (business_id IN (SELECT public.get_user_business_ids(auth.uid())));

CREATE POLICY "Users can update quotations of their business"
ON public.quotations FOR UPDATE
TO authenticated
USING (business_id IN (SELECT public.get_user_business_ids(auth.uid())));

CREATE POLICY "Owners and Admins can delete quotations"
ON public.quotations FOR DELETE
TO authenticated
USING (public.get_user_role(business_id, auth.uid()) IN ('owner', 'admin'));

-- ------------------------------------------------------------------------------
-- 8. Quotation Items Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view quotation items"
ON public.quotation_items FOR SELECT
TO authenticated
USING (
    quotation_id IN (
        SELECT id FROM public.quotations 
        WHERE business_id IN (SELECT public.get_user_business_ids(auth.uid()))
    )
);

CREATE POLICY "Users can insert quotation items"
ON public.quotation_items FOR INSERT
TO authenticated
WITH CHECK (
    quotation_id IN (
        SELECT id FROM public.quotations 
        WHERE business_id IN (SELECT public.get_user_business_ids(auth.uid()))
    )
);

CREATE POLICY "Users can update quotation items"
ON public.quotation_items FOR UPDATE
TO authenticated
USING (
    quotation_id IN (
        SELECT id FROM public.quotations 
        WHERE business_id IN (SELECT public.get_user_business_ids(auth.uid()))
    )
);

CREATE POLICY "Users can delete quotation items"
ON public.quotation_items FOR DELETE
TO authenticated
USING (
    quotation_id IN (
        SELECT id FROM public.quotations 
        WHERE business_id IN (SELECT public.get_user_business_ids(auth.uid()))
    )
);

-- ------------------------------------------------------------------------------
-- 9. Projects Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view projects of their business"
ON public.projects FOR SELECT
TO authenticated
USING (business_id IN (SELECT public.get_user_business_ids(auth.uid())));

CREATE POLICY "Users can create projects for their business"
ON public.projects FOR INSERT
TO authenticated
WITH CHECK (business_id IN (SELECT public.get_user_business_ids(auth.uid())));

CREATE POLICY "Users can update projects of their business"
ON public.projects FOR UPDATE
TO authenticated
USING (business_id IN (SELECT public.get_user_business_ids(auth.uid())));

CREATE POLICY "Owners and Admins can delete projects"
ON public.projects FOR DELETE
TO authenticated
USING (public.get_user_role(business_id, auth.uid()) IN ('owner', 'admin'));

-- ------------------------------------------------------------------------------
-- 10. Invoices Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view invoices of their business"
ON public.invoices FOR SELECT
TO authenticated
USING (business_id IN (SELECT public.get_user_business_ids(auth.uid())));

CREATE POLICY "Users can create invoices for their business"
ON public.invoices FOR INSERT
TO authenticated
WITH CHECK (business_id IN (SELECT public.get_user_business_ids(auth.uid())));

CREATE POLICY "Users can update invoices of their business"
ON public.invoices FOR UPDATE
TO authenticated
USING (business_id IN (SELECT public.get_user_business_ids(auth.uid())));

CREATE POLICY "Owners and Admins can delete invoices"
ON public.invoices FOR DELETE
TO authenticated
USING (public.get_user_role(business_id, auth.uid()) IN ('owner', 'admin'));

-- ------------------------------------------------------------------------------
-- 11. Invoice Items Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view invoice items"
ON public.invoice_items FOR SELECT
TO authenticated
USING (
    invoice_id IN (
        SELECT id FROM public.invoices 
        WHERE business_id IN (SELECT public.get_user_business_ids(auth.uid()))
    )
);

CREATE POLICY "Users can insert invoice items"
ON public.invoice_items FOR INSERT
TO authenticated
WITH CHECK (
    invoice_id IN (
        SELECT id FROM public.invoices 
        WHERE business_id IN (SELECT public.get_user_business_ids(auth.uid()))
    )
);

CREATE POLICY "Users can update invoice items"
ON public.invoice_items FOR UPDATE
TO authenticated
USING (
    invoice_id IN (
        SELECT id FROM public.invoices 
        WHERE business_id IN (SELECT public.get_user_business_ids(auth.uid()))
    )
);

CREATE POLICY "Users can delete invoice items"
ON public.invoice_items FOR DELETE
TO authenticated
USING (
    invoice_id IN (
        SELECT id FROM public.invoices 
        WHERE business_id IN (SELECT public.get_user_business_ids(auth.uid()))
    )
);

-- ------------------------------------------------------------------------------
-- 12. Payments Policies
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view payments of their business"
ON public.payments FOR SELECT
TO authenticated
USING (business_id IN (SELECT public.get_user_business_ids(auth.uid())));

CREATE POLICY "Users can record payments for their business"
ON public.payments FOR INSERT
TO authenticated
WITH CHECK (business_id IN (SELECT public.get_user_business_ids(auth.uid())));

CREATE POLICY "Owners and Admins can update payment records"
ON public.payments FOR UPDATE
TO authenticated
USING (public.get_user_role(business_id, auth.uid()) IN ('owner', 'admin'));

CREATE POLICY "Owners and Admins can delete payment records"
ON public.payments FOR DELETE
TO authenticated
USING (public.get_user_role(business_id, auth.uid()) IN ('owner', 'admin'));
