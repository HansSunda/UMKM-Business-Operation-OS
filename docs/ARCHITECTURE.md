# UMKM Business Operations OS — System Architecture & Design Specification

## 1. Executive Overview

**UMKM Business Operations OS** is a specialized, multi-tenant SaaS platform built to unify and streamline day-to-day operations for Indonesian service-based small and medium enterprises (UMKM / Usaha Mikro, Kecil, dan Menengah). 

Unlike generic Point of Sale (POS) or complex enterprise ERP software, this system addresses the fragmented workflow common to service businesses (architecture/interior design, creative agencies, wedding organizers, catering, contractors, event organizers, custom manufacturing):

```
Pelanggan (Customer)
       ↓
Penawaran (Quotation)
       ↓
Proyek (Project / Work Order)
       ↓
Invoice (Tagihan)
       ↓
Pembayaran (Payment)
       ↓
Pendapatan & Laporan (Revenue & Executive Business Insights)
```

---

## 2. Multi-Tenant Architecture & Data Isolation

### 2.1 Workspace Model
- Every business account represents an isolated workspace (`businesses`).
- Users (`profiles`) can be members of one or more businesses via `business_members`.
- All operational data (`customers`, `quotations`, `projects`, `invoices`, `payments`) strictly contains a `business_id` foreign key.

### 2.2 Row Level Security (RLS) Strategy
- RLS is enabled on **all** business tables.
- Helper function `get_user_business_ids(auth.uid())` marked `SECURITY DEFINER` retrieves authorized businesses without circular RLS evaluation.
- RLS Policies enforce:
  ```sql
  -- Example SELECT policy
  CREATE POLICY "Users can only access their business customers"
  ON customers FOR SELECT
  USING (business_id IN (SELECT get_user_business_ids(auth.uid())));
  ```
- Roles supported:
  - `owner`: Full workspace administrative rights, billing, and member management.
  - `admin`: Full operational management (customers, quotes, projects, invoices, payments, reports).
  - `staff`: Creation and viewing of daily operational records; restricted from destructive workspace actions.

---

## 3. Database Schema Blueprint (PostgreSQL)

### 3.1 Core Entities

1. **`profiles`**: User details linked to Supabase `auth.users`.
2. **`businesses`**: Tenant workspace details, business type, contact info, bank account details for invoice templates.
3. **`business_members`**: Join table linking users to businesses with role designation (`owner`, `admin`, `staff`).
4. **`customers`**: Client directory with contact numbers, addresses, and unified history.
5. **`quotations`**: Quotation documents with status tracking (`draft`, `sent`, `accepted`, `rejected`, `expired`, `converted`).
6. **`quotation_items`**: Line items for quotations (description, quantity, unit, unit_price, discount, subtotal).
7. **`projects`**: Operational deliverables linked to accepted quotations and customers with contract value and timelines.
8. **`invoices`**: Invoices generated from projects or direct work with statuses (`draft`, `issued`, `partially_paid`, `paid`, `overdue`, `cancelled`).
9. **`invoice_items`**: Line items for invoices.
10. **`payments`**: Transaction records allocated to invoices (`cash`, `bank_transfer`, `e_wallet`, `other`).

### 3.2 Relational Diagram

```
[auth.users] ──< [profiles]
                    │
                    ├──< [business_members] >── [businesses]
                                                    │
         ┌──────────────────┬───────────────────────┼──────────────────┬─────────────────┐
         │                  │                       │                  │                 │
    [customers]        [quotations]             [projects]         [invoices]        [payments]
         │                  │                       │                  │                 │
         │                  ├──< [quotation_items]  │                  ├──< [invoice_items]
         │                  │                       │                  │                 │
         └──────────────────┴───────────────────────┴──────────────────┴─────────────────┘
```

---

## 4. Financial Calculation & Validation Rules

1. **Quotation & Invoice Line Item**:
   $$\text{subtotal} = (\text{quantity} \times \text{unit\_price}) - \text{discount}$$
2. **Document Total**:
   $$\text{total} = \left(\sum \text{item subtotals}\right) - \text{document\_discount} + \text{tax}$$
3. **Invoice Balance & Status Lifecycle**:
   $$\text{remaining\_balance} = \text{invoice\_total} - \sum \text{payments}$$
   - When $\text{payments} = 0$: `issued` (or `overdue` if $\text{current\_date} > \text{due\_date}$)
   - When $0 < \text{payments} < \text{total}$: `partially_paid`
   - When $\text{payments} \ge \text{total}$: `paid`
   - Overpayment protection: $\text{payment\_amount} \le \text{remaining\_balance}$

---

## 5. UI/UX Design System for Indonesian UMKM

- **Language**: Bahasa Indonesia for primary UI labels (Pelanggan, Penawaran, Proyek, Tagihan / Invoice, Pembayaran, Pendapatan, Pengaturan).
- **Currency**: Indonesian Rupiah formatted as `Rp 12.500.000` with Indonesian grouping punctuation.
- **Date Format**: `dd MMMM yyyy` (e.g., `12 November 2026`).
- **Responsive Layout**: Clean desktop sidebar navigation with mobile drawer support and touch-friendly action cards.
- **Visual Clarity**: High-contrast KPI metrics, clear status pill badges (Green for Paid/Accepted, Amber for Partially Paid/Sent, Red for Overdue/Rejected).
