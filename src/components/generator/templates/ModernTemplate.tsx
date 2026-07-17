import React from 'react';
import { Building } from 'lucide-react';
import type { InvoiceData, InvoiceItem } from '../../../types/invoice';
import type { Currency } from '../../../types/invoice';

interface TemplateProps {
  data: InvoiceData;
  resolvedLogoUrl: string;
  subtotal: number;
  tax: number;
  total: number;
  hasDiscounts: boolean;
  calculateLineTotal: (item: InvoiceItem) => number;
  formatCurrency: (amount: number, currency: Currency) => string;
}

export const ModernTemplate: React.FC<TemplateProps> = ({
  data, resolvedLogoUrl, subtotal, tax, total, hasDiscounts, calculateLineTotal, formatCurrency
}) => {
  return (
    <div
      id="invoice-preview"
      className="bg-white text-black p-8 sm:p-12 shadow-sm border border-gray-200 mx-auto w-full min-h-[1123px] h-auto flex flex-col relative overflow-visible text-sm"
      style={{ maxWidth: '794px' }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mt-8 mb-12">
        <div className="flex items-start gap-4 max-w-[65%] text-left">
          {resolvedLogoUrl ? (
            <img
              src={resolvedLogoUrl}
              alt="Company Logo"
              className="max-w-[100px] max-h-[80px] object-contain rounded-lg shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Building className="w-8 h-8" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-gray-900 break-words leading-tight">{data.company.name || 'Company Name'}</h2>
            <p className="text-gray-500 whitespace-pre-wrap mt-1 leading-relaxed break-words text-xs">
              {data.company.address || 'Company Address'}
            </p>
            {data.company.email && <p className="text-gray-500 mt-1 break-all text-xs">{data.company.email}</p>}
            {data.company.phone && <p className="text-gray-500 mt-0.5 text-xs">{data.company.phone}</p>}
            {data.company.taxId && <p className="text-gray-400 mt-0.5 text-[10px]">Tax ID: {data.company.taxId}</p>}
          </div>
        </div>

        <div className="text-right">
          <h1 className="text-4xl font-black text-blue-600 tracking-tighter mb-2 uppercase">Invoice</h1>
          <p className="text-gray-500 font-medium">#{data.invoiceNumber}</p>
          {data.status && (
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              data.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
              data.status === 'overdue' ? 'bg-red-100 text-red-700' :
              'bg-amber-100 text-amber-700'
            }`}>
              {data.status}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mb-12">
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Bill To</h3>
          <p className="font-bold text-gray-900 text-lg break-words">{data.client.name || 'Client Name'}</p>
          <p className="text-gray-600 whitespace-pre-wrap mt-1 leading-relaxed break-words">
            {data.client.address || 'Client Address'}
          </p>
          {data.client.email && <p className="text-gray-600 mt-1 break-all">{data.client.email}</p>}
          {data.client.phone && <p className="text-gray-600 mt-0.5">{data.client.phone}</p>}
        </div>

        <div className="flex flex-col items-end">
          <div className="w-full max-w-[200px]">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Issue Date</span>
              <span className="font-semibold text-gray-900">{data.issueDate}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Due Date</span>
              <span className="font-semibold text-gray-900">{data.dueDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-12 flex-grow">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-blue-600 bg-blue-50 text-left">
              <th className="py-3 px-3 font-bold text-blue-600 uppercase tracking-wider text-xs w-[40%] rounded-tl-sm">Description</th>
              <th className="py-3 px-2 font-bold text-blue-600 uppercase tracking-wider text-xs text-center w-[10%]">Qty</th>
              <th className="py-3 px-2 font-bold text-blue-600 uppercase tracking-wider text-xs text-right w-[15%]">Price</th>
              {hasDiscounts && <th className="py-3 px-2 font-bold text-blue-600 uppercase tracking-wider text-xs text-right w-[10%]">Disc.</th>}
              <th className="py-3 px-3 font-bold text-blue-600 uppercase tracking-wider text-xs text-right w-[20%] rounded-tr-sm">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.items.length === 0 && (
              <tr>
                <td colSpan={hasDiscounts ? 5 : 4} className="py-8 text-center text-gray-400 italic">No items added yet.</td>
              </tr>
            )}
            {data.items.map((item, index) => (
              <tr key={item.id} className={index !== data.items.length - 1 ? 'border-b border-gray-100' : ''}>
                <td className="py-4 px-3 text-gray-900 font-medium break-words">{item.name || 'Item Name'}</td>
                <td className="py-4 px-2 text-gray-600 text-center">{item.quantity}</td>
                <td className="py-4 px-2 text-gray-600 text-right">{formatCurrency(item.price, data.currency)}</td>
                {hasDiscounts && <td className="py-4 px-2 text-gray-500 text-right text-xs">{item.discount ? `${item.discount}%` : '—'}</td>}
                <td className="py-4 px-3 text-gray-900 font-semibold text-right">{formatCurrency(calculateLineTotal(item), data.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-12">
        <div className="w-full max-w-[300px]">
          <div className="flex justify-between py-2">
            <span className="text-gray-500 font-medium">Subtotal</span>
            <span className="text-gray-900 font-semibold">{formatCurrency(subtotal, data.currency)}</span>
          </div>
          {data.taxRate > 0 && (
            <div className="flex justify-between py-2">
              <span className="text-gray-500 font-medium">Tax ({data.taxRate}%)</span>
              <span className="text-gray-900 font-semibold">{formatCurrency(tax, data.currency)}</span>
            </div>
          )}
          <div className="flex justify-between py-4 px-4 mt-4 bg-blue-50 rounded-lg border-t-2 border-blue-600 items-center">
            <span className="text-lg font-bold text-blue-600 uppercase tracking-wider">Total</span>
            <span className="text-lg font-black text-blue-600">{formatCurrency(total, data.currency)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {data.notes && (
        <div className="mt-auto pt-8 border-t border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Notes</h3>
          <p className="text-gray-600 text-sm whitespace-pre-wrap break-words">{data.notes}</p>
        </div>
      )}
    </div>
  );
};
