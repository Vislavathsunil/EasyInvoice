import type { InvoiceItem } from '../types/invoice';

export const calculateLineTotal = (item: InvoiceItem): number => {
  const gross = item.quantity * item.price;
  if (!item.discount || item.discount <= 0) return gross;
  return gross * (1 - item.discount / 100);
};

export const calculateSubtotal = (items: InvoiceItem[]): number => {
  return items.reduce((sum, item) => sum + calculateLineTotal(item), 0);
};

export const calculateTax = (subtotal: number, taxRate: number): number => {
  return subtotal * (taxRate / 100);
};

export const calculateTotal = (subtotal: number, tax: number): number => {
  return subtotal + tax;
};
