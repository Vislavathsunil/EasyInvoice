import { useForm } from 'react-hook-form';
import type { InvoiceData } from '../types/invoice';
import { generateInvoiceNumber } from '../utils/formatters';

const defaultValues: InvoiceData = {
  invoiceNumber: generateInvoiceNumber(),
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  currency: 'USD',
  company: {
    name: 'Acme Corp',
    address: '123 Business Rd\nCityville, ST 12345',
    email: 'billing@acme.com',
  },
  client: {
    name: 'Globex Corporation',
    address: '456 Client Ave\nTownsburg, ST 67890',
    email: 'accounts@globex.com',
  },
  items: [
    { id: '1', name: '', quantity: 1, price: 1500 },
    // { id: '2', name: 'Web Development', quantity: 40, price: 50 },
  ],
  taxRate: 10,
  notes: 'Thank you for your business!',
};

export const useInvoiceForm = () => {
  return useForm<InvoiceData>({
    defaultValues,
    mode: 'onChange',
  });
};
