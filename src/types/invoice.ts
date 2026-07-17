export type Currency = 'USD' | 'EUR' | 'INR';

export type InvoiceTemplate = 'modern' | 'classic' | 'corporate';

export interface CompanyDetails {
  name: string;
  address: string;
  logoUrl?: string;
  taxId?: string;
  email?: string;
  phone?: string;
}

export interface ClientDetails {
  name: string;
  address: string;
  email?: string;
  phone?: string;
}

export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  discount?: number; // percentage 0-100
}

export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: Currency;
  status?: 'paid' | 'pending' | 'overdue';
  company: CompanyDetails;
  client: ClientDetails;
  items: InvoiceItem[];
  taxRate: number; // percentage
  notes?: string;
  template?: InvoiceTemplate;
}

export interface SavedInvoice extends InvoiceData {
  id: string;
  createdAt: string;
  updatedAt: string;
}
