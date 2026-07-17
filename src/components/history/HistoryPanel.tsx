import React, { useState } from 'react';
import { X, Search, FileText, Trash2, Eye } from 'lucide-react';
import { useInvoiceContext } from '../../context/InvoiceContext';
import { calculateSubtotal, calculateTax, calculateTotal } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, onClose }) => {
  const { history, loadInvoice, deleteInvoice, currentInvoiceId } = useInvoiceContext();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredHistory = history.filter(invoice => 
    invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLoad = (invoice: any) => {
    loadInvoice(invoice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="relative w-[85%] sm:w-full max-w-xs sm:max-w-md bg-card h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Invoice History
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by client or invoice number..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No invoices found.</p>
            </div>
          ) : (
            filteredHistory.map((invoice) => {
              const subtotal = calculateSubtotal(invoice.items);
              const tax = calculateTax(subtotal, invoice.taxRate);
              const total = calculateTotal(subtotal, tax);

              const isCurrent = invoice.id === currentInvoiceId;

              return (
                <div 
                  key={invoice.id} 
                  className={`p-4 rounded-xl border transition-all ${isCurrent ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/50 hover:shadow-md'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-foreground">{invoice.client.name || 'Unknown Client'}</h3>
                      <p className="text-xs text-muted-foreground">#{invoice.invoiceNumber} • {invoice.issueDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{formatCurrency(total, invoice.currency)}</p>
                      {isCurrent && <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Active</span>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                    <button 
                      onClick={() => handleLoad(invoice)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                    <button 
                      onClick={() => deleteInvoice(invoice.id)}
                      className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                      title="Delete Invoice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
