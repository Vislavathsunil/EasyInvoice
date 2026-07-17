import React from 'react';
import { Building } from 'lucide-react';
import type { InvoiceData, InvoiceItem, Currency } from '../../../types/invoice';

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

export const ClassicTemplate: React.FC<TemplateProps> = ({
  data, resolvedLogoUrl, subtotal, tax, total, hasDiscounts, calculateLineTotal, formatCurrency
}) => {
  return (
    <div
      id="invoice-preview"
      className="bg-white text-black p-10 sm:p-14 shadow-sm border border-gray-200 mx-auto w-full min-h-[1123px] h-auto flex flex-col relative overflow-visible"
      style={{ maxWidth: '794px', fontFamily: 'Georgia, serif' }}
    >
      {/* Top bar */}
      <div className="border-b-4 border-black pb-8 mb-10 flex justify-between items-start">
        <div className="flex items-start gap-5 max-w-[65%] text-left">
          {resolvedLogoUrl ? (
            <img src={resolvedLogoUrl} alt="Logo" className="max-w-[100px] max-h-[80px] object-contain shrink-0" />
          ) : (
            <div className="w-16 h-16 border-2 border-black flex items-center justify-center text-black shrink-0">
              <Building className="w-8 h-8" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-black uppercase tracking-wider leading-tight">{data.company.name || 'Company'}</h2>
            <p className="text-gray-600 text-xs whitespace-pre-wrap mt-1 leading-relaxed">{data.company.address}</p>
            {data.company.email && <p className="text-gray-500 text-xs mt-0.5">{data.company.email}</p>}
            {data.company.phone && <p className="text-gray-500 text-xs mt-0.5">{data.company.phone}</p>}
            {data.company.taxId && <p className="text-gray-400 text-[10px] mt-0.5 font-mono">Tax ID: {data.company.taxId}</p>}
          </div>
        </div>
        <div className="text-right flex flex-col items-end shrink-0">
          <h1 className="text-4xl font-black uppercase tracking-tight text-black">INVOICE</h1>
          <p className="text-gray-500 text-sm mt-1 font-mono">#{data.invoiceNumber}</p>
          {data.status && (
            <span className="inline-block mt-2 border-2 border-black px-3 py-0.5 text-xs font-black uppercase tracking-widest">
              {data.status}
            </span>
          )}
        </div>
      </div>

      {/* Meta info */}
      <div className="grid grid-cols-2 gap-12 mb-10">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Bill To</p>
          <p className="font-bold text-gray-900 text-base">{data.client.name || 'Client Name'}</p>
          <p className="text-gray-600 text-xs whitespace-pre-wrap mt-1 leading-relaxed">{data.client.address}</p>
          {data.client.email && <p className="text-gray-500 text-xs mt-0.5">{data.client.email}</p>}
          {data.client.phone && <p className="text-gray-500 text-xs mt-0.5">{data.client.phone}</p>}
        </div>
        <div className="flex flex-col items-end gap-2 text-xs">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-right w-full max-w-[200px]">
            <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] text-left">Issue Date</span>
            <span className="text-gray-900 font-semibold">{data.issueDate}</span>
            <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] text-left">Due Date</span>
            <span className="text-gray-900 font-semibold">{data.dueDate}</span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-10 flex-grow">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-t-2 border-b-2 border-black text-left">
              <th className="py-2.5 px-2 font-black uppercase text-[10px] tracking-widest text-black w-[40%]">Description</th>
              <th className="py-2.5 px-2 font-black uppercase text-[10px] tracking-widest text-black text-center w-[10%]">Qty</th>
              <th className="py-2.5 px-2 font-black uppercase text-[10px] tracking-widest text-black text-right w-[15%]">Rate</th>
              {hasDiscounts && <th className="py-2.5 px-2 font-black uppercase text-[10px] tracking-widest text-black text-right w-[10%]">Disc.</th>}
              <th className="py-2.5 px-2 font-black uppercase text-[10px] tracking-widest text-black text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.length === 0 && (
              <tr>
                <td colSpan={hasDiscounts ? 5 : 4} className="py-8 text-center text-gray-400 italic text-sm">No items added yet.</td>
              </tr>
            )}
            {data.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="py-3.5 px-2 text-gray-900">{item.name}</td>
                <td className="py-3.5 px-2 text-gray-600 text-center">{item.quantity}</td>
                <td className="py-3.5 px-2 text-gray-600 text-right">{formatCurrency(item.price, data.currency)}</td>
                {hasDiscounts && <td className="py-3.5 px-2 text-gray-400 text-right text-xs">{item.discount ? `${item.discount}%` : '—'}</td>}
                <td className="py-3.5 px-2 text-gray-900 font-bold text-right">{formatCurrency(calculateLineTotal(item), data.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-10">
        <div className="w-60 text-sm">
          <div className="flex justify-between py-1.5">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-semibold">{formatCurrency(subtotal, data.currency)}</span>
          </div>
          {data.taxRate > 0 && (
            <div className="flex justify-between py-1.5">
              <span className="text-gray-600">Tax ({data.taxRate}%)</span>
              <span className="font-semibold">{formatCurrency(tax, data.currency)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 border-t-4 border-black mt-2">
            <span className="font-black text-base uppercase tracking-wider">Total Due</span>
            <span className="font-black text-base">{formatCurrency(total, data.currency)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {data.notes && (
        <div className="mt-auto pt-8 border-t-2 border-gray-200">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Notes</p>
          <p className="text-gray-600 text-xs whitespace-pre-wrap leading-relaxed">{data.notes}</p>
        </div>
      )}
    </div>
  );
};
