import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useInvoiceContext } from '../../context/InvoiceContext';
import { useCustomers } from '../../context/CustomerContext';
import { useAuth } from '../../context/AuthContext';
import { isFirebaseConfigured, storage } from '../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { saveLocalLogo, getLocalLogo, deleteLocalLogo } from '../../utils/logoStorage';
import type { InvoiceData } from '../../types/invoice';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Button } from '../ui/Button';
import { InvoiceItemsTable } from './InvoiceItemsTable';
import { calculateSubtotal, calculateTax, calculateTotal } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Upload, Trash2, Loader2, RefreshCw, Users, ChevronDown } from 'lucide-react';

export const InvoiceForm: React.FC = () => {
  const { register, setValue, watch } = useFormContext<InvoiceData>();
  const { companyProfile, updateCompanyProfile } = useInvoiceContext();
  const { customers } = useCustomers();
  const { user } = useAuth();

  const items = watch('items') || [];
  const currency = watch('currency') || 'USD';
  const taxRate = watch('taxRate') || 0;

  // Sanitize items for calculations to avoid NaN issues
  const sanitizedItems = items.map(item => ({
    ...item,
    quantity: isNaN(item?.quantity) || !item?.quantity ? 0 : item.quantity,
    price: isNaN(item?.price) || !item?.price ? 0 : item.price,
    discount: isNaN(item?.discount ?? 0) ? 0 : (item.discount || 0)
  }));

  const subtotal = calculateSubtotal(sanitizedItems);
  const tax = calculateTax(subtotal, isNaN(taxRate) ? 0 : taxRate);
  const total = calculateTotal(subtotal, tax);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const logoUrl = watch('company.logoUrl');
  const [resolvedLogo, setResolvedLogo] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [clientSearch, setClientSearch] = useState('');

  // Resolve logo URL asynchronously
  useEffect(() => {
    if (!logoUrl) {
      const timer = setTimeout(() => setResolvedLogo(''), 0);
      return () => clearTimeout(timer);
    }

    if (logoUrl.startsWith('local:')) {
      let active = true;
      getLocalLogo(logoUrl).then(url => {
        if (active) {
          setResolvedLogo(url || '');
        }
      }).catch(err => {
        console.error("Failed to load local logo", err);
      });
      return () => {
        active = false;
      };
    } else {
      const timer = setTimeout(() => setResolvedLogo(logoUrl), 0);
      return () => clearTimeout(timer);
    }
  }, [logoUrl]);

  // Sync profile logo to form if form is empty
  const companyProfileLogo = companyProfile?.logoUrl;
  useEffect(() => {
    if (companyProfileLogo && !logoUrl) {
      setValue('company.logoUrl', companyProfileLogo);
    }
  }, [companyProfileLogo, logoUrl, setValue]);

  const handleFile = async (file: File) => {
    setErrorMsg('');

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Unsupported format. Support: PNG, JPG, JPEG, SVG, WEBP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File exceeds 5 MB size limit.');
      return;
    }

    setIsUploading(true);

    try {
      let finalUrl = '';
      if (isFirebaseConfigured && user) {
        const fileExtension = file.name.split('.').pop() || 'png';
        const logoRef = ref(storage, `users/${user.uid}/logos/logo_${Date.now()}.${fileExtension}`);
        const snapshot = await uploadBytes(logoRef, file);
        finalUrl = await getDownloadURL(snapshot.ref);
      } else {
        const localKey = `local:logo_${user?.uid || 'anonymous'}_${Date.now()}`;
        await saveLocalLogo(localKey, file);
        finalUrl = localKey;
      }

      setValue('company.logoUrl', finalUrl);

      const currentCompany = watch('company');
      await updateCompanyProfile({
        name: currentCompany?.name || '',
        address: currentCompany?.address || '',
        email: currentCompany?.email || '',
        phone: currentCompany?.phone || '',
        taxId: currentCompany?.taxId || '',
        logoUrl: finalUrl
      });
    } catch (err) {
      const error = err as Error;
      console.error("Logo upload error:", error);
      setErrorMsg('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = async () => {
    const prevLogoUrl = logoUrl;
    setValue('company.logoUrl', '');
    const currentCompany = watch('company');
    await updateCompanyProfile({
      name: currentCompany?.name || '',
      address: currentCompany?.address || '',
      email: currentCompany?.email || '',
      phone: currentCompany?.phone || '',
      taxId: currentCompany?.taxId || '',
      logoUrl: ''
    });
    if (prevLogoUrl && prevLogoUrl.startsWith('local:')) {
      await deleteLocalLogo(prevLogoUrl);
    }
    setResolvedLogo('');
  };

  const handleSelectClient = (customer: typeof customers[0]) => {
    setValue('client.name', customer.name);
    setValue('client.email', customer.email || '');
    setValue('client.phone', customer.phone || '');
    setValue('client.address', customer.address || '');
    setShowClientDropdown(false);
    setClientSearch('');
  };

  const filteredClients = customers.filter(c =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(clientSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 md:space-y-10">
      {/* General Details */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2.5">
            <Label className="text-foreground/80 font-semibold text-[clamp(0.85rem,1.1vw,0.95rem)]">Invoice Number</Label>
            <Input {...register('invoiceNumber')} />
          </div>
          <div className="space-y-2.5">
            <Label className="text-foreground/80 font-semibold text-[clamp(0.85rem,1.1vw,0.95rem)]">Status</Label>
            <select
              {...register('status')}
              className="flex h-11 w-full rounded-xl border border-input bg-transparent px-4 py-2.5 text-sm shadow-sm transition-all hover:border-muted-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-ring"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div className="space-y-2.5">
            <Label className="text-foreground/80 font-semibold text-[clamp(0.85rem,1.1vw,0.95rem)]">Currency</Label>
            <select
              {...register('currency')}
              className="flex h-11 w-full rounded-xl border border-input bg-transparent px-4 py-2.5 text-sm shadow-sm transition-all hover:border-muted-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-ring"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
          <div className="space-y-2.5">
            <Label className="text-foreground/80 font-semibold text-[clamp(0.85rem,1.1vw,0.95rem)]">Issue Date</Label>
            <Input type="date" {...register('issueDate')} />
          </div>
          <div className="space-y-2.5">
            <Label className="text-foreground/80 font-semibold text-[clamp(0.85rem,1.1vw,0.95rem)]">Due Date</Label>
            <Input type="date" {...register('dueDate')} />
          </div>
          <div className="space-y-2.5">
            <Label className="text-foreground/80 font-semibold text-[clamp(0.85rem,1.1vw,0.95rem)]">Template</Label>
            <select
              {...register('template')}
              className="flex h-11 w-full rounded-xl border border-input bg-transparent px-4 py-2.5 text-sm shadow-sm transition-all hover:border-muted-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-ring"
            >
              <option value="modern">Modern (Blue)</option>
              <option value="classic">Classic (Minimal)</option>
              <option value="corporate">Corporate (Dark)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-10">
        {/* Company Details */}
        <Card>
          <CardHeader>
            <CardTitle>Your Company</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            <div className="space-y-2.5">
              <Label className="text-foreground/80 font-semibold text-[clamp(0.85rem,1.1vw,0.95rem)]">Name</Label>
              <Input {...register('company.name')} placeholder="Your Company Name" />
            </div>
            <div className="space-y-2.5">
              <Label className="text-foreground/80 font-semibold text-[clamp(0.85rem,1.1vw,0.95rem)]">Address</Label>
              <textarea
                {...register('company.address')}
                rows={4}
                className="flex min-h-[120px] w-full rounded-xl border border-input bg-transparent px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground hover:border-muted-foreground/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-ring resize-none"
                placeholder="Company Address"
              />
            </div>
            <div className="space-y-2.5">
              <Label className="text-foreground/80 font-semibold text-[clamp(0.85rem,1.1vw,0.95rem)]">Email</Label>
              <Input type="email" {...register('company.email')} placeholder="Email Address" />
            </div>
            <div className="space-y-2.5">
              <Label className="text-foreground/80 font-semibold text-[clamp(0.85rem,1.1vw,0.95rem)]">Phone Number</Label>
              <Input {...register('company.phone')} placeholder="Phone Number" />
            </div>
            <div className="space-y-2.5">
              <Label className="text-foreground/80 font-semibold text-[clamp(0.85rem,1.1vw,0.95rem)]">Tax ID / VAT Number</Label>
              <Input {...register('company.taxId')} placeholder="Tax ID" />
            </div>
          </CardContent>
        </Card>

        {/* Client Details */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Bill To</CardTitle>
            {customers.length > 0 && (
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowClientDropdown(!showClientDropdown)}
                  className="gap-1.5 text-xs font-semibold h-8 rounded-lg"
                >
                  <Users className="w-3.5 h-3.5" />
                  Saved Clients
                  <ChevronDown className="w-3 h-3" />
                </Button>
                {showClientDropdown && (
                  <div className="absolute top-full right-0 mt-1 w-72 bg-card border border-border rounded-xl shadow-xl z-20 overflow-hidden">
                    <div className="p-2 border-b border-border/60">
                      <input
                        type="text"
                        placeholder="Search clients..."
                        value={clientSearch}
                        onChange={e => setClientSearch(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-muted/30 border border-border/60 rounded-lg focus:outline-none focus:ring-1 focus:ring-ring"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-56 overflow-y-auto">
                      {filteredClients.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center p-4 font-medium">No clients found</p>
                      ) : (
                        filteredClients.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleSelectClient(c)}
                            className="w-full text-left px-4 py-3 hover:bg-muted/40 transition-colors border-b border-border/20 last:border-0"
                          >
                            <p className="text-xs font-bold text-foreground">{c.name}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{c.email}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2.5">
              <Label className="text-foreground/80 font-semibold text-[clamp(0.85rem,1.1vw,0.95rem)]">Client Name</Label>
              <Input {...register('client.name')} placeholder="Client Name" />
            </div>
            <div className="space-y-2.5">
              <Label className="text-foreground/80 font-semibold text-[clamp(0.85rem,1.1vw,0.95rem)]">Address</Label>
              <textarea
                {...register('client.address')}
                rows={4}
                className="flex min-h-[120px] w-full rounded-xl border border-input bg-transparent px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground hover:border-muted-foreground/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-ring resize-none"
                placeholder="Client Address"
              />
            </div>
            <div className="space-y-2.5">
              <Label className="text-foreground/80 font-semibold text-[clamp(0.85rem,1.1vw,0.95rem)]">Email</Label>
              <Input type="email" {...register('client.email')} placeholder="Client Email" />
            </div>
            <div className="space-y-2.5">
              <Label className="text-foreground/80 font-semibold text-[clamp(0.85rem,1.1vw,0.95rem)]">Phone Number</Label>
              <Input {...register('client.phone')} placeholder="Client Phone" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6 md:pt-8 space-y-6">
          <InvoiceItemsTable />

          <div className="mt-6 sm:mt-8 flex flex-col md:flex-row md:justify-between items-start md:items-end gap-6 pt-6 border-t border-border/60">
            <div className="w-full sm:w-56 space-y-2.5">
              <Label className="text-foreground/80 font-semibold text-[clamp(0.85rem,1.1vw,0.95rem)]">Tax Rate (%)</Label>
              <Input type="number" min="0" step="0.1" {...register('taxRate', { valueAsNumber: true })} />
            </div>

            <div className="w-full md:w-80 bg-muted/20 border border-border/60 rounded-2xl p-5 space-y-3.5 shadow-sm ml-auto">
              <div className="flex justify-between items-center text-sm text-foreground/80">
                <span className="text-muted-foreground font-medium">Subtotal</span>
                <span className="text-foreground font-semibold">{formatCurrency(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-foreground/80">
                <span className="text-muted-foreground font-medium">Tax ({isNaN(taxRate) ? 0 : taxRate}%)</span>
                <span className="text-foreground font-semibold">{formatCurrency(tax, currency)}</span>
              </div>
              <div className="border-t border-border/60 pt-3 flex justify-between items-center">
                <span className="text-sm font-bold text-foreground/90 uppercase tracking-wider">Total Due ({currency})</span>
                <span className="text-lg font-black text-foreground">{formatCurrency(total, currency)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            {...register('notes')}
            rows={3}
            className="flex min-h-[100px] w-full rounded-xl border border-input bg-transparent px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground hover:border-muted-foreground/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-ring resize-none"
            placeholder="Payment terms, thank you message, etc."
          />
        </CardContent>
      </Card>
    </div>
  );
};
