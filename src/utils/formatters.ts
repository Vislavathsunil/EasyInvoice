import type { Currency } from '../types/invoice';

export const formatCurrency = (amount: number, currency: Currency): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const generateInvoiceNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `INV-${year}${month}-${randomSuffix}`;
};
