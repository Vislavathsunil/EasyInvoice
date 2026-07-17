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

export const CorporateTemplate: React.FC<TemplateProps> = ({
  data,
  resolvedLogoUrl,
  subtotal,
  tax,
  total,
  hasDiscounts,
  calculateLineTotal,
  formatCurrency
}) => {
  return (
    <div
      id="invoice-preview"
      className="bg-white text-slate-800 p-10 sm:p-12 shadow-md border border-slate-200 mx-auto w-full min-h-[1123px] h-auto flex flex-col relative overflow-visible text-sm font-sans"
      style={{ maxWidth: '794px' }}
    >
      {/* Top Banner Accent */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-slate-900" />

      {/* Corporate Header Section */}
      <div className="flex justify-between items-start mt-6 mb-10 pb-8 border-b border-slate-200">
        <div className="flex items-start gap-4 max-w-[65%] text-left">
          {resolvedLogoUrl ? (
            <img
              src={resolvedLogoUrl}
              alt="Logo"
              className="max-w-[100px] max-h-[80px] object-contain rounded shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
              <Building className="w-8 h-8" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {data.company.name || 'Company Name'}
            </h2>
            <p className="text-slate-500 text-xs whitespace-pre-wrap mt-1 leading-relaxed">
              {data.company.address}
            </p>
            {data.company.email && <p className="text-slate-400 text-[11px] mt-1 truncate">{data.company.email}</p>}
            {data.company.phone && <p className="text-slate-400 text-[11px]">{data.company.phone}</p>}
            {data.company.taxId && <p className="text-slate-400 text-[11px]">Tax ID: {data.company.taxId}</p>}
          </div>
        </div>

        <div className="text-right flex flex-col items-end">
          <div className="bg-slate-100 px-4 py-2 rounded mb-3 text-right">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Invoice Reference</span>
            <span className="text-base font-mono font-bold text-slate-900">#{data.invoiceNumber}</span>
          </div>
          
          {data.status && (
            <span
              className={`inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                data.status === 'paid'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : data.status === 'overdue'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {data.status}
            </span>
          )}
        </div>
      </div>

      {/* Invoice Meta Grid */}
      <div className="grid grid-cols-3 gap-6 mb-10 bg-slate-50 p-5 rounded-lg border border-slate-150">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Prepared For</span>
          <p className="font-bold text-slate-800">{data.client.name || 'Client Name'}</p>
          <p className="text-slate-500 text-xs whitespace-pre-wrap mt-1 leading-relaxed">
            {data.client.address}
          </p>
          {data.client.email && <p className="text-slate-400 text-[11px] mt-1 truncate">{data.client.email}</p>}
          {data.client.phone && <p className="text-slate-400 text-[11px]">{data.client.phone}</p>}
        </div>

        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Issue Date</span>
          <p className="font-semibold text-slate-700 text-xs">{data.issueDate}</p>
        </div>

        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Due Date</span>
          <p className="font-bold text-slate-900 text-xs">{data.dueDate}</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="mb-10 flex-grow">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-900 bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4 w-[45%]">Item & Description</th>
              <th className="py-3 px-2 text-center w-[10%]">Qty</th>
              <th className="py-3 px-3 text-right w-[15%]">Unit Price</th>
              {hasDiscounts && (
                <th className="py-3 px-2 text-right w-[10%]">Discount</th>
              )}
              <th className="py-3 px-4 text-right">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.length === 0 && (
              <tr>
                <td
                  colSpan={hasDiscounts ? 5 : 4}
                  className="py-8 text-center text-slate-400 italic bg-slate-50/50"
                >
                  No items added yet.
                </td>
              </tr>
            )}
            {data.items.map((item, index) => (
              <tr
                key={item.id}
                className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${
                  index % 2 === 1 ? 'bg-slate-50/30' : ''
                }`}
              >
                <td className="py-3.5 px-4 text-slate-800 font-semibold break-words">
                  {item.name || 'Item Name'}
                </td>
                <td className="py-3.5 px-2 text-center text-slate-600">
                  {item.quantity}
                </td>
                <td className="py-3.5 px-3 text-right text-slate-600">
                  {formatCurrency(item.price, data.currency)}
                </td>
                {hasDiscounts && (
                  <td className="py-3.5 px-2 text-right text-slate-500">
                    {item.discount ? `${item.discount}%` : '—'}
                  </td>
                )}
                <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                  {formatCurrency(calculateLineTotal(item), data.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Financials & Summary */}
      <div className="flex justify-end mb-8">
        <div className="w-72 bg-slate-50 border border-slate-200 rounded p-4 text-xs space-y-2">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-800">
              {formatCurrency(subtotal, data.currency)}
            </span>
          </div>
          {data.taxRate > 0 && (
            <div className="flex justify-between text-slate-600 border-b border-slate-200 pb-2">
              <span>Tax ({data.taxRate}%)</span>
              <span className="font-semibold text-slate-800">
                {formatCurrency(tax, data.currency)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 text-slate-900">
            <span className="font-bold uppercase tracking-wider text-[10px]">Total Due ({data.currency})</span>
            <span className="text-base font-black">
              {formatCurrency(total, data.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Notes / Footer */}
      {data.notes && (
        <div className="mt-auto pt-6 border-t border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Terms & Notes</span>
          <p className="text-slate-600 text-xs whitespace-pre-wrap leading-relaxed">
            {data.notes}
          </p>
        </div>
      )}
    </div>
  );
};
