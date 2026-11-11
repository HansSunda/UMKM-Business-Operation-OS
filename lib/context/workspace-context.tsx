'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Business,
  Customer,
  Quotation,
  Project,
  Invoice,
  Payment,
  Profile,
} from '../types/database';
import {
  DEMO_BUSINESS,
  DEMO_USER,
  INITIAL_CUSTOMERS,
  INITIAL_QUOTATIONS,
  INITIAL_PROJECTS,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
} from '../supabase/mock-data';
import { calculateInvoiceBalance, determineInvoiceStatus } from '../utils/calculations';
import { generateDocumentNumber } from '../utils/id-generator';

interface WorkspaceContextType {
  user: Profile;
  business: Business;
  customers: Customer[];
  quotations: Quotation[];
  projects: Project[];
  invoices: Invoice[];
  payments: Payment[];
  isLoaded: boolean;
  // Customer actions
  addCustomer: (data: Omit<Customer, 'id' | 'business_id' | 'created_at' | 'updated_at'>) => Customer;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  // Quotation actions
  addQuotation: (data: Omit<Quotation, 'id' | 'business_id' | 'created_at' | 'updated_at'>) => Quotation;
  updateQuotation: (id: string, data: Partial<Quotation>) => void;
  deleteQuotation: (id: string) => void;
  convertQuotationToProject: (quotationId: string) => Project;
  // Project actions
  addProject: (data: Omit<Project, 'id' | 'business_id' | 'created_at' | 'updated_at'>) => Project;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  // Invoice actions
  addInvoice: (data: Omit<Invoice, 'id' | 'business_id' | 'created_at' | 'updated_at'>) => Invoice;
  updateInvoice: (id: string, data: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  // Payment actions
  addPayment: (data: Omit<Payment, 'id' | 'business_id' | 'created_at'>) => Payment;
  deletePayment: (id: string) => void;
  // Business settings
  updateBusiness: (data: Partial<Business>) => void;
  resetToDemoData: () => void;
  // Computed KPI Helpers
  getInvoiceWithPayments: (invoiceId: string) => Invoice | undefined;
  getProjectWithFinancials: (projectId: string) => Project | undefined;
  getCustomerSummary: (customerId: string) => {
    customer: Customer | undefined;
    quotations: Quotation[];
    projects: Project[];
    invoices: Invoice[];
    payments: Payment[];
    totalRevenue: number;
    outstandingBalance: number;
  };
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'umkm_os_';

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile>(DEMO_USER);
  const [business, setBusiness] = useState<Business>(DEMO_BUSINESS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [quotations, setQuotations] = useState<Quotation[]>(INITIAL_QUOTATIONS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Hydrate from localStorage if available
  useEffect(() => {
    try {
      const savedBusiness = localStorage.getItem(`${STORAGE_KEY_PREFIX}business`);
      const savedCustomers = localStorage.getItem(`${STORAGE_KEY_PREFIX}customers`);
      const savedQuotations = localStorage.getItem(`${STORAGE_KEY_PREFIX}quotations`);
      const savedProjects = localStorage.getItem(`${STORAGE_KEY_PREFIX}projects`);
      const savedInvoices = localStorage.getItem(`${STORAGE_KEY_PREFIX}invoices`);
      const savedPayments = localStorage.getItem(`${STORAGE_KEY_PREFIX}payments`);

      if (savedBusiness) setBusiness(JSON.parse(savedBusiness));
      if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
      if (savedQuotations) setQuotations(JSON.parse(savedQuotations));
      if (savedProjects) setProjects(JSON.parse(savedProjects));
      if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
      if (savedPayments) setPayments(JSON.parse(savedPayments));
    } catch (e) {
      console.warn('Could not read from localStorage, using initial data:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync state to localStorage
  const persistState = (key: string, data: unknown) => {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${key}`, JSON.stringify(data));
    } catch (e) {
      console.warn(`Could not save ${key} to localStorage:`, e);
    }
  };

  // Customer handlers
  const addCustomer = (data: Omit<Customer, 'id' | 'business_id' | 'created_at' | 'updated_at'>): Customer => {
    const newCustomer: Customer = {
      ...data,
      id: crypto.randomUUID(),
      business_id: business.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [newCustomer, ...customers];
    setCustomers(updated);
    persistState('customers', updated);
    return newCustomer;
  };

  const updateCustomer = (id: string, data: Partial<Customer>) => {
    const updated = customers.map((c) =>
      c.id === id ? { ...c, ...data, updated_at: new Date().toISOString() } : c
    );
    setCustomers(updated);
    persistState('customers', updated);
  };

  const deleteCustomer = (id: string) => {
    const updated = customers.filter((c) => c.id !== id);
    setCustomers(updated);
    persistState('customers', updated);
  };

  // Quotation handlers
  const addQuotation = (data: Omit<Quotation, 'id' | 'business_id' | 'created_at' | 'updated_at'>): Quotation => {
    const newQuotation: Quotation = {
      ...data,
      id: crypto.randomUUID(),
      business_id: business.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [newQuotation, ...quotations];
    setQuotations(updated);
    persistState('quotations', updated);
    return newQuotation;
  };

  const updateQuotation = (id: string, data: Partial<Quotation>) => {
    const updated = quotations.map((q) =>
      q.id === id ? { ...q, ...data, updated_at: new Date().toISOString() } : q
    );
    setQuotations(updated);
    persistState('quotations', updated);
  };

  const deleteQuotation = (id: string) => {
    const updated = quotations.filter((q) => q.id !== id);
    setQuotations(updated);
    persistState('quotations', updated);
  };

  const convertQuotationToProject = (quotationId: string): Project => {
    const quote = quotations.find((q) => q.id === quotationId);
    if (!quote) throw new Error('Quotation not found');

    // Update quotation status
    updateQuotation(quotationId, { status: 'converted' });

    // Generate project
    const newProject: Project = {
      id: crypto.randomUUID(),
      business_id: business.id,
      customer_id: quote.customer_id,
      quotation_id: quote.id,
      project_number: generateDocumentNumber('PRJ', projects.length),
      name: `Proyek: ${quote.quotation_number}`,
      description: quote.notes || 'Dibuat dari penawaran ' + quote.quotation_number,
      start_date: new Date().toISOString().split('T')[0],
      due_date: quote.valid_until,
      status: 'active',
      contract_value: quote.total,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updatedProjects = [newProject, ...projects];
    setProjects(updatedProjects);
    persistState('projects', updatedProjects);
    return newProject;
  };

  // Project handlers
  const addProject = (data: Omit<Project, 'id' | 'business_id' | 'created_at' | 'updated_at'>): Project => {
    const newProject: Project = {
      ...data,
      id: crypto.randomUUID(),
      business_id: business.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const updated = [newProject, ...projects];
    setProjects(updated);
    persistState('projects', updated);
    return newProject;
  };

  const updateProject = (id: string, data: Partial<Project>) => {
    const updated = projects.map((p) =>
      p.id === id ? { ...p, ...data, updated_at: new Date().toISOString() } : p
    );
    setProjects(updated);
    persistState('projects', updated);
  };

  const deleteProject = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    persistState('projects', updated);
  };

  // Invoice handlers
  const addInvoice = (data: Omit<Invoice, 'id' | 'business_id' | 'created_at' | 'updated_at'>): Invoice => {
    const newInvoice: Invoice = {
      ...data,
      id: crypto.randomUUID(),
      business_id: business.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      total_paid: 0,
      remaining_balance: data.total,
    };
    const updated = [newInvoice, ...invoices];
    setInvoices(updated);
    persistState('invoices', updated);
    return newInvoice;
  };

  const updateInvoice = (id: string, data: Partial<Invoice>) => {
    const updated = invoices.map((i) => {
      if (i.id === id) {
        const next = { ...i, ...data, updated_at: new Date().toISOString() };
        const invoicePayments = payments.filter((p) => p.invoice_id === id);
        const { totalPaid, remainingBalance } = calculateInvoiceBalance(next.total, invoicePayments);
        const calculatedStatus = determineInvoiceStatus(next.status, next.total, totalPaid, next.due_date);
        return {
          ...next,
          total_paid: totalPaid,
          remaining_balance: remainingBalance,
          status: calculatedStatus as Invoice['status'],
        };
      }
      return i;
    });
    setInvoices(updated);
    persistState('invoices', updated);
  };

  const deleteInvoice = (id: string) => {
    const updated = invoices.filter((i) => i.id !== id);
    setInvoices(updated);
    persistState('invoices', updated);
    // Remove related payments
    const updatedPayments = payments.filter((p) => p.invoice_id !== id);
    setPayments(updatedPayments);
    persistState('payments', updatedPayments);
  };

  // Payment handlers
  const addPayment = (data: Omit<Payment, 'id' | 'business_id' | 'created_at'>): Payment => {
    const newPayment: Payment = {
      ...data,
      id: crypto.randomUUID(),
      business_id: business.id,
      created_at: new Date().toISOString(),
    };
    const updatedPayments = [newPayment, ...payments];
    setPayments(updatedPayments);
    persistState('payments', updatedPayments);

    // Automatically recalculate invoice status & remaining balance
    const relatedInvoice = invoices.find((i) => i.id === data.invoice_id);
    if (relatedInvoice) {
      const allInvoicePayments = updatedPayments.filter((p) => p.invoice_id === data.invoice_id);
      const { totalPaid, remainingBalance } = calculateInvoiceBalance(
        relatedInvoice.total,
        allInvoicePayments
      );
      const nextStatus = determineInvoiceStatus(
        relatedInvoice.status,
        relatedInvoice.total,
        totalPaid,
        relatedInvoice.due_date
      );

      const updatedInvoices = invoices.map((inv) =>
        inv.id === data.invoice_id
          ? {
              ...inv,
              total_paid: totalPaid,
              remaining_balance: remainingBalance,
              status: nextStatus as Invoice['status'],
              updated_at: new Date().toISOString(),
            }
          : inv
      );
      setInvoices(updatedInvoices);
      persistState('invoices', updatedInvoices);
    }

    return newPayment;
  };

  const deletePayment = (id: string) => {
    const payment = payments.find((p) => p.id === id);
    const updatedPayments = payments.filter((p) => p.id !== id);
    setPayments(updatedPayments);
    persistState('payments', updatedPayments);

    if (payment) {
      const invoicePayments = updatedPayments.filter((p) => p.invoice_id === payment.invoice_id);
      const invoice = invoices.find((i) => i.id === payment.invoice_id);
      if (invoice) {
        const { totalPaid, remainingBalance } = calculateInvoiceBalance(invoice.total, invoicePayments);
        const nextStatus = determineInvoiceStatus(
          invoice.status,
          invoice.total,
          totalPaid,
          invoice.due_date
        );
        const updatedInvoices = invoices.map((inv) =>
          inv.id === payment.invoice_id
            ? {
                ...inv,
                total_paid: totalPaid,
                remaining_balance: remainingBalance,
                status: nextStatus as Invoice['status'],
              }
            : inv
        );
        setInvoices(updatedInvoices);
        persistState('invoices', updatedInvoices);
      }
    }
  };

  const updateBusiness = (data: Partial<Business>) => {
    const updated = { ...business, ...data, updated_at: new Date().toISOString() };
    setBusiness(updated);
    persistState('business', updated);
  };

  const resetToDemoData = () => {
    setBusiness(DEMO_BUSINESS);
    setCustomers(INITIAL_CUSTOMERS);
    setQuotations(INITIAL_QUOTATIONS);
    setProjects(INITIAL_PROJECTS);
    setInvoices(INITIAL_INVOICES);
    setPayments(INITIAL_PAYMENTS);
    localStorage.clear();
  };

  // Helper views
  const getInvoiceWithPayments = (invoiceId: string): Invoice | undefined => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return undefined;
    const invPayments = payments.filter((p) => p.invoice_id === invoiceId);
    const { totalPaid, remainingBalance } = calculateInvoiceBalance(inv.total, invPayments);
    return {
      ...inv,
      customer: customers.find((c) => c.id === inv.customer_id),
      project: projects.find((p) => p.id === inv.project_id),
      payments: invPayments,
      total_paid: totalPaid,
      remaining_balance: remainingBalance,
    };
  };

  const getProjectWithFinancials = (projectId: string): Project | undefined => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return undefined;

    const projInvoices = invoices.filter((i) => i.project_id === projectId && i.status !== 'cancelled');
    const totalInvoiced = projInvoices.reduce((s, i) => s + i.total, 0);

    const invoiceIds = projInvoices.map((i) => i.id);
    const projPayments = payments.filter((p) => invoiceIds.includes(p.invoice_id));
    const totalPaid = projPayments.reduce((s, p) => s + p.amount, 0);

    return {
      ...proj,
      customer: customers.find((c) => c.id === proj.customer_id),
      quotation: quotations.find((q) => q.id === proj.quotation_id),
      total_invoiced: totalInvoiced,
      total_paid: totalPaid,
      outstanding_balance: Math.max(0, proj.contract_value - totalPaid),
    };
  };

  const getCustomerSummary = (customerId: string) => {
    const cust = customers.find((c) => c.id === customerId);
    const custQuotations = quotations.filter((q) => q.customer_id === customerId);
    const custProjects = projects.filter((p) => p.customer_id === customerId);
    const custInvoices = invoices.filter((i) => i.customer_id === customerId);
    const invoiceIds = custInvoices.map((i) => i.id);
    const custPayments = payments.filter((p) => invoiceIds.includes(p.invoice_id));

    const totalRevenue = custPayments.reduce((sum, p) => sum + p.amount, 0);
    const outstandingBalance = custInvoices
      .filter((i) => i.status !== 'cancelled')
      .reduce((sum, inv) => {
        const invPay = custPayments.filter((p) => p.invoice_id === inv.id);
        const { remainingBalance } = calculateInvoiceBalance(inv.total, invPay);
        return sum + remainingBalance;
      }, 0);

    return {
      customer: cust,
      quotations: custQuotations,
      projects: custProjects,
      invoices: custInvoices,
      payments: custPayments,
      totalRevenue,
      outstandingBalance,
    };
  };

  return (
    <WorkspaceContext.Provider
      value={{
        user,
        business,
        customers,
        quotations,
        projects,
        invoices,
        payments,
        isLoaded,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addQuotation,
        updateQuotation,
        deleteQuotation,
        convertQuotationToProject,
        addProject,
        updateProject,
        deleteProject,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        addPayment,
        deletePayment,
        updateBusiness,
        resetToDemoData,
        getInvoiceWithPayments,
        getProjectWithFinancials,
        getCustomerSummary,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
