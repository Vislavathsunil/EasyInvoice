import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInvoiceContext } from '../context/InvoiceContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { calculateSubtotal, calculateTax, calculateTotal } from '../utils/calculations';
import type { SavedInvoice, Currency } from '../types/invoice';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { 
  FileText, 
  Plus, 
  Download, 
  History, 
  Calendar,
  Edit, 
  Copy, 
  Trash2
} from 'lucide-react';

// Pure React Count-Up Component
const CountUp: React.FC<{ value: number; decimals?: number; prefix?: string; suffix?: string }> = ({ 
  value, 
  decimals = 0, 
  prefix = '', 
  suffix = '' 
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const duration = 800; // ms
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = (end - start) / steps;

    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{prefix}{displayValue.toFixed(decimals)}{suffix}</span>;
};

// Pure React Count-Up Currency Component
const CountUpCurrency: React.FC<{ value: number; currency: Currency }> = ({ value, currency }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const start = 0;
    const end = value;
    if (start === end) {
      setDisplayValue(end);
      return;
    }

    const duration = 800; // ms
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = (end - start) / steps;

    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{formatCurrency(displayValue, currency)}</span>;
};

// Currency Converter Helper (Mock Exchange Rates)
const convertCurrency = (amount: number, from: Currency, to: Currency): number => {
  if (from === to) return amount;
  
  // Normalize to USD
  let amountInUSD = amount;
  if (from === 'EUR') amountInUSD = amount / 0.92;
  else if (from === 'INR') amountInUSD = amount / 83.5;
  
  // Convert from USD to target
  if (to === 'EUR') return amountInUSD * 0.92;
  if (to === 'INR') return amountInUSD * 83.5;
  return amountInUSD;
};

// Skeleton Loader
const SkeletonLoader = () => (
  <div className="animate-pulse space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-28 bg-muted/30 dark:bg-[#1e293b]/50 rounded-2xl border border-border/40" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="h-[320px] bg-muted/30 dark:bg-[#1e293b]/50 rounded-2xl border border-border/40 lg:col-span-2" />
      <div className="h-[320px] bg-muted/30 dark:bg-[#1e293b]/50 rounded-2xl border border-border/40" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="h-80 bg-muted/30 dark:bg-[#1e293b]/50 rounded-2xl border border-border/40 lg:col-span-2" />
      <div className="h-80 bg-muted/30 dark:bg-[#1e293b]/50 rounded-2xl border border-border/40" />
    </div>
  </div>
);

type FilterRange = 'today' | 'week' | 'month' | 'last_month' | 'year' | 'custom';

export const Dashboard: React.FC = () => {
  const { history, loadInvoice, createNewInvoice, deleteInvoice, userSettings } = useInvoiceContext();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterRange>('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const preferredCurrency = (userSettings?.currency || 'USD') as Currency;

  // Loading indicator fake timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Filter history based on dates
  const filteredInvoices = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const getStartOfWeek = (d: Date) => {
      const date = new Date(d);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      return new Date(date.setDate(diff));
    };

    return history.filter(inv => {
      const invDate = new Date(inv.issueDate);
      if (isNaN(invDate.getTime())) return false;
      
      switch (filter) {
        case 'today':
          return inv.issueDate === todayStr;
        case 'week': {
          const startOfWeek = getStartOfWeek(now);
          startOfWeek.setHours(0, 0, 0, 0);
          return invDate >= startOfWeek && invDate <= now;
        }
        case 'month': {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          return invDate >= startOfMonth && invDate <= now;
        }
        case 'last_month': {
          const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
          return invDate >= startOfLastMonth && invDate <= endOfLastMonth;
        }
        case 'year': {
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          return invDate >= startOfYear && invDate <= now;
        }
        case 'custom': {
          if (!customStartDate || !customEndDate) return true;
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          return invDate >= start && invDate <= end;
        }
        default:
          return true;
      }
    });
  }, [history, filter, customStartDate, customEndDate]);

  // Compute Statistics
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let overdueCount = 0;
    const uniqueClients = new Set<string>();

    filteredInvoices.forEach(inv => {
      const subtotal = calculateSubtotal(inv.items);
      const tax = calculateTax(subtotal, inv.taxRate);
      const totalAmt = calculateTotal(subtotal, tax);
      const convertedAmt = convertCurrency(totalAmt, inv.currency, preferredCurrency);

      // Determine invoice status (backward compatibility support)
      const status = inv.status || (new Date(inv.dueDate) < new Date() ? 'overdue' : 'pending');

      if (status === 'paid') {
        totalRevenue += convertedAmt;
        paidCount++;
      } else if (status === 'overdue') {
        overdueCount++;
      } else {
        pendingCount++;
      }

      if (inv.client.name) {
        uniqueClients.add(inv.client.name.trim());
      }
    });

    return {
      totalRevenue,
      totalCount: filteredInvoices.length,
      paidCount,
      pendingCount,
      overdueCount,
      customerCount: uniqueClients.size
    };
  }, [filteredInvoices, preferredCurrency]);

  // Group Invoices by Month for Charts (Last 6 Months or all)
  const monthlyData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const groups: { [key: string]: { created: number; revenue: number } } = {};

    // Get last 6 months list
    const last6Months: string[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      last6Months.push(label);
      groups[label] = { created: 0, revenue: 0 };
    }

    filteredInvoices.forEach(inv => {
      const invDate = new Date(inv.issueDate);
      if (isNaN(invDate.getTime())) return;
      const monthLabel = `${monthNames[invDate.getMonth()]} ${invDate.getFullYear().toString().slice(-2)}`;

      const subtotal = calculateSubtotal(inv.items);
      const tax = calculateTax(subtotal, inv.taxRate);
      const totalAmt = calculateTotal(subtotal, tax);
      const convertedAmt = convertCurrency(totalAmt, inv.currency, preferredCurrency);

      if (!groups[monthLabel]) {
        groups[monthLabel] = { created: 0, revenue: 0 };
      }
      
      groups[monthLabel].created += 1;
      
      const status = inv.status || (new Date(inv.dueDate) < new Date() ? 'overdue' : 'pending');
      if (status === 'paid') {
        groups[monthLabel].revenue += convertedAmt;
      }
    });

    // Extract sorted array
    return Object.entries(groups).map(([name, data]) => ({
      name,
      created: data.created,
      revenue: Math.round(data.revenue)
    })).slice(-6); // Only show last 6 months
  }, [filteredInvoices, preferredCurrency]);

  // Top Customers computation
  const topCustomers = useMemo(() => {
    const clients: { [key: string]: { invoices: number; revenue: number } } = {};

    filteredInvoices.forEach(inv => {
      if (!inv.client.name) return;
      const clientName = inv.client.name.trim();
      
      const subtotal = calculateSubtotal(inv.items);
      const tax = calculateTax(subtotal, inv.taxRate);
      const totalAmt = calculateTotal(subtotal, tax);
      const convertedAmt = convertCurrency(totalAmt, inv.currency, preferredCurrency);

      if (!clients[clientName]) {
        clients[clientName] = { invoices: 0, revenue: 0 };
      }
      clients[clientName].invoices += 1;
      
      const status = inv.status || (new Date(inv.dueDate) < new Date() ? 'overdue' : 'pending');
      if (status === 'paid') {
        clients[clientName].revenue += convertedAmt;
      }
    });

    return Object.entries(clients)
      .map(([name, data]) => ({
        name,
        invoices: data.invoices,
        revenue: data.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5); // Limit to top 5
  }, [filteredInvoices, preferredCurrency]);

  // Actions
  const handleEdit = (inv: SavedInvoice) => {
    loadInvoice(inv);
    navigate('/generator');
  };

  const handleDuplicate = async (inv: SavedInvoice) => {
    const { id, createdAt, updatedAt, invoiceNumber, ...rest } = inv;
    const duplicated: any = {
      ...rest,
      id: crypto.randomUUID(),
      invoiceNumber: `INV-DUP-${Date.now().toString().slice(-4)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Save locally or cloud based on auth
    try {
      if (user) {
        const { db, isFirebaseConfigured } = await import('../config/firebase');
        const { doc, setDoc } = await import('firebase/firestore');
        if (isFirebaseConfigured) {
          await setDoc(doc(db, 'users', user.uid, 'invoices', duplicated.id), duplicated);
        } else {
          const key = `mock_db_invoices_${user.uid}`;
          const current = JSON.parse(localStorage.getItem(key) || '[]');
          localStorage.setItem(key, JSON.stringify([duplicated, ...current]));
        }
      } else {
        const current = JSON.parse(localStorage.getItem('invoice_history') || '[]');
        localStorage.setItem('invoice_history', JSON.stringify([duplicated, ...current]));
      }
      alert('Invoice duplicated successfully!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadPDF = (inv: SavedInvoice) => {
    loadInvoice(inv);
    navigate('/generator');
    setTimeout(() => {
      window.print();
    }, 800);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      await deleteInvoice(id);
    }
  };

  // CSV Report Downloader
  const handleDownloadReport = () => {
    if (filteredInvoices.length === 0) return;
    
    const headers = ['Invoice Number', 'Client Name', 'Issue Date', 'Due Date', 'Currency', 'Amount', 'Status'];
    const rows = filteredInvoices.map(inv => {
      const subtotal = calculateSubtotal(inv.items);
      const tax = calculateTax(subtotal, inv.taxRate);
      const total = calculateTotal(subtotal, tax);
      const status = inv.status || (new Date(inv.dueDate) < new Date() ? 'overdue' : 'pending');
      
      return [
        inv.invoiceNumber,
        `"${inv.client.name.replace(/"/g, '""')}"`,
        inv.issueDate,
        inv.dueDate,
        inv.currency,
        total.toFixed(2),
        status.toUpperCase()
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `invoice_report_${filter}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Chart Rendering Math Computations
  const maxCreated = Math.max(...monthlyData.map(d => d.created), 1);
  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 100);

  // Doughnut Chart Angles
  const doughnutTotal = stats.paidCount + stats.pendingCount + stats.overdueCount;
  const paidPct = doughnutTotal ? (stats.paidCount / doughnutTotal) * 100 : 0;
  const pendingPct = doughnutTotal ? (stats.pendingCount / doughnutTotal) * 100 : 0;
  const overduePct = doughnutTotal ? (stats.overdueCount / doughnutTotal) * 100 : 0;

  // Doughnut segment strokeDasharray math (Circumference of radius 50 is 314.16)
  const circ = 2 * Math.PI * 50; // 314.16
  const paidDash = (paidPct / 100) * circ;
  const pendingDash = (pendingPct / 100) * circ;
  const overdueDash = (overduePct / 100) * circ;

  const paidOffset = circ;
  const pendingOffset = circ - paidDash;
  const overdueOffset = circ - paidDash - pendingDash;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Billing Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time analytics, revenue trends, and business insights.
          </p>
        </div>
        
        {/* Quick Date Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl bg-muted/60 p-1 border border-border/40 overflow-x-auto max-w-full">
            {(['today', 'week', 'month', 'last_month', 'year'] as FilterRange[]).map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFilter(f);
                  setShowCustomPicker(false);
                }}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${filter === f ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
            <button
              onClick={() => {
                setFilter('custom');
                setShowCustomPicker(!showCustomPicker);
              }}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${filter === 'custom' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Calendar className="w-3 h-3" />
              Custom
            </button>
          </div>
        </div>
      </div>

      {/* Custom Date Range Selection Panel */}
      {showCustomPicker && filter === 'custom' && (
        <Card className="mb-6 border-border/80 shadow-md max-w-md animate-in slide-in-from-top-3 duration-200">
          <CardContent className="pt-4 grid grid-cols-2 gap-4">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-muted-foreground uppercase">Start Date</label>
              <Input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} />
            </div>
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-muted-foreground uppercase">End Date</label>
              <Input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} />
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <SkeletonLoader />
      ) : history.length === 0 ? (
        // Empty State Layout
        <Card className="border-border/60 py-16 text-center max-w-xl mx-auto shadow-sm rounded-[18px]">
          <CardContent className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-5">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No invoices yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm mt-2 mb-6">
              Create your very first professional invoice with logo branding, taxes, and automatic A4 preview.
            </p>
            <Button onClick={() => { createNewInvoice(); navigate('/generator'); }} className="rounded-xl shadow-md font-bold px-6">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Invoice
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* 6 Statistic Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-5">
            {/* Revenue Card */}
            <Card className="border-border/65 rounded-[18px] shadow-sm hover:-translate-y-0.5 transition-transform duration-200 text-left">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
                  <span className="text-lg">💰</span>
                </div>
                <div className="mt-4">
                  <div className="text-xl font-extrabold text-foreground leading-none">
                    <CountUpCurrency value={stats.totalRevenue} currency={preferredCurrency} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">Earnings from paid invoices</p>
                </div>
              </CardContent>
            </Card>

            {/* Created Card */}
            <Card className="border-border/65 rounded-[18px] shadow-sm hover:-translate-y-0.5 transition-transform duration-200 text-left">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider">Created</span>
                  <span className="text-lg">📄</span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-extrabold text-foreground leading-none">
                    <CountUp value={stats.totalCount} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">Total invoices in range</p>
                </div>
              </CardContent>
            </Card>

            {/* Paid Card */}
            <Card className="border-border/65 rounded-[18px] shadow-sm hover:-translate-y-0.5 transition-transform duration-200 text-left">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider">Paid</span>
                  <span className="text-lg">✅</span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-extrabold text-green-500 leading-none">
                    <CountUp value={stats.paidCount} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">Settled invoice transactions</p>
                </div>
              </CardContent>
            </Card>

            {/* Pending Card */}
            <Card className="border-border/65 rounded-[18px] shadow-sm hover:-translate-y-0.5 transition-transform duration-200 text-left">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider">Pending</span>
                  <span className="text-lg">⏳</span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-extrabold text-amber-500 leading-none">
                    <CountUp value={stats.pendingCount} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">Awaiting customer payment</p>
                </div>
              </CardContent>
            </Card>

            {/* Overdue Card */}
            <Card className="border-border/65 rounded-[18px] shadow-sm hover:-translate-y-0.5 transition-transform duration-200 text-left">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider">Overdue</span>
                  <span className="text-lg">⚠️</span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-extrabold text-red-500 leading-none">
                    <CountUp value={stats.overdueCount} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">Invoices past due date</p>
                </div>
              </CardContent>
            </Card>

            {/* Customers Card */}
            <Card className="border-border/65 rounded-[18px] shadow-sm hover:-translate-y-0.5 transition-transform duration-200 text-left">
              <CardContent className="p-5 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-xs font-bold uppercase tracking-wider">Customers</span>
                  <span className="text-lg">👥</span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-extrabold text-foreground leading-none">
                    <CountUp value={stats.customerCount} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">Unique clients invoiced</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Charts Dashboard Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart 1: Bar Chart of Created Invoices */}
            <Card className="border-border/60 shadow-sm rounded-[18px] lg:col-span-2 text-left">
              <CardHeader className="pb-3 border-b border-border/40 flex justify-between items-center">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Monthly Invoices Created</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 h-64">
                <div className="w-full h-full flex items-end justify-between px-2 gap-4">
                  {monthlyData.map((m) => {
                    const pct = (m.created / maxCreated) * 80 + 10; // min 10% height
                    return (
                      <div key={m.name} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                        {/* Custom Tooltip */}
                        <div className="absolute bottom-full mb-2 bg-foreground text-background text-[10px] px-2 py-1 rounded-md font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                          {m.created} {m.created === 1 ? 'invoice' : 'invoices'}
                        </div>
                        {/* Rounded Bar */}
                        <div 
                          className="w-full bg-primary/20 group-hover:bg-primary/45 rounded-t-lg transition-all duration-300 relative overflow-hidden" 
                          style={{ height: `${pct}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-primary/30" />
                        </div>
                        <span className="text-[10px] font-semibold text-muted-foreground mt-2 truncate w-full text-center">
                          {m.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Chart 3: Doughnut Chart Breakdown */}
            <Card className="border-border/60 shadow-sm rounded-[18px] text-left">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Invoice Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 flex flex-col items-center justify-center h-64">
                {doughnutTotal === 0 ? (
                  <p className="text-xs text-muted-foreground font-medium">No invoices for status breakdown</p>
                ) : (
                  <div className="flex items-center gap-6 w-full justify-center px-4">
                    {/* SVG doughnut */}
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg className="w-32 h-32 transform -rotate-90">
                        {/* Paid Segment */}
                        {paidPct > 0 && (
                          <circle
                            cx="64"
                            cy="64"
                            r="50"
                            fill="transparent"
                            stroke="#10b981"
                            strokeWidth="12"
                            strokeDasharray={`${paidDash} ${circ - paidDash}`}
                            strokeDashoffset={paidOffset}
                            className="transition-all duration-500"
                          />
                        )}
                        {/* Pending Segment */}
                        {pendingPct > 0 && (
                          <circle
                            cx="64"
                            cy="64"
                            r="50"
                            fill="transparent"
                            stroke="#f59e0b"
                            strokeWidth="12"
                            strokeDasharray={`${pendingDash} ${circ - pendingDash}`}
                            strokeDashoffset={pendingOffset}
                            className="transition-all duration-500"
                          />
                        )}
                        {/* Overdue Segment */}
                        {overduePct > 0 && (
                          <circle
                            cx="64"
                            cy="64"
                            r="50"
                            fill="transparent"
                            stroke="#ef4444"
                            strokeWidth="12"
                            strokeDasharray={`${overdueDash} ${circ - overdueDash}`}
                            strokeDashoffset={overdueOffset}
                            className="transition-all duration-500"
                          />
                        )}
                      </svg>
                      {/* Doughnut Middle Text */}
                      <div className="absolute text-center">
                        <span className="text-lg font-black text-foreground leading-none">{doughnutTotal}</span>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Total</p>
                      </div>
                    </div>

                    {/* Legends */}
                    <div className="flex flex-col gap-2.5 text-xs text-left">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                        <span className="font-semibold">Paid ({paidPct.toFixed(0)}%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span className="font-semibold">Pending ({pendingPct.toFixed(0)}%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        <span className="font-semibold">Overdue ({overduePct.toFixed(0)}%)</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chart 2: Revenue Trend Line Graph */}
          <Card className="border-border/60 shadow-sm rounded-[18px] text-left">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Revenue Trend ({preferredCurrency})</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 h-64 relative">
              {monthlyData.length === 0 ? (
                <p className="text-xs text-muted-foreground font-medium text-center pt-10">No revenue data</p>
              ) : (
                <div className="w-full h-full flex flex-col justify-between">
                  {/* Clean SVG Area Line Chart */}
                  <div className="w-full h-44 relative">
                    <svg className="w-full h-full" viewBox="0 0 600 150" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#2563eb" stopOpacity="0.00" />
                        </linearGradient>
                      </defs>
                      
                      {/* Dotted Grid lines */}
                      <line x1="0" y1="37.5" x2="600" y2="37.5" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" className="text-border/40" />
                      <line x1="0" y1="75" x2="600" y2="75" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" className="text-border/40" />
                      <line x1="0" y1="112.5" x2="600" y2="112.5" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" className="text-border/40" />
                      
                      {/* Calculate points path */}
                      {(() => {
                        const widthStep = 600 / (monthlyData.length - 1 || 1);
                        const points = monthlyData.map((m, idx) => {
                          const x = idx * widthStep;
                          const y = 140 - (m.revenue / maxRevenue) * 110; // scaled y
                          return { x, y, label: m.name, val: m.revenue };
                        });
                        
                        const pathD = `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`;
                        const areaD = `${pathD} L ${points[points.length - 1].x} 150 L 0 150 Z`;
                        
                        return (
                          <>
                            {/* Area Gradient */}
                            <path d={areaD} fill="url(#areaGradient)" />
                            {/* Line Path */}
                            <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="2.5" />
                            
                            {/* Dots and interactive triggers */}
                            {points.map((p, idx) => (
                              <g key={idx} className="group cursor-pointer">
                                <circle cx={p.x} cy={p.y} r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
                                <circle cx={p.x} cy={p.y} r="8" fill="transparent" />
                                <title>{p.label}: {formatCurrency(p.val, preferredCurrency)}</title>
                              </g>
                            ))}
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                  
                  {/* Axis labels */}
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground font-semibold px-2">
                    {monthlyData.map(m => (
                      <span key={m.name}>{m.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tables Section: Recent Invoices & Top Customers & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Recent Invoices Table (Col Span 2) */}
            <Card className="border-border/60 shadow-sm rounded-[18px] lg:col-span-2 text-left">
              <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Recent Invoices</CardTitle>
                <Button onClick={handleDownloadReport} size="sm" variant="outline" className="h-8 rounded-lg text-xs font-semibold gap-1">
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-xs text-left min-w-[700px]">
                    <thead className="bg-muted/30 text-muted-foreground border-b border-border/30 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-3">Number</th>
                        <th className="px-5 py-3">Client</th>
                        <th className="px-5 py-3">Issue Date</th>
                        <th className="px-5 py-3">Due Date</th>
                        <th className="px-5 py-3 text-right">Amount</th>
                        <th className="px-5 py-3 text-center">Status</th>
                        <th className="px-5 py-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30 font-medium">
                      {filteredInvoices.map((inv) => {
                        const subtotal = calculateSubtotal(inv.items);
                        const tax = calculateTax(subtotal, inv.taxRate);
                        const total = calculateTotal(subtotal, tax);
                        const status = inv.status || (new Date(inv.dueDate) < new Date() ? 'overdue' : 'pending');

                        return (
                          <tr key={inv.id} className="hover:bg-muted/10 transition-colors">
                            <td className="px-5 py-3.5 font-bold text-foreground">{inv.invoiceNumber}</td>
                            <td className="px-5 py-3.5 max-w-[150px] truncate">{inv.client.name}</td>
                            <td className="px-5 py-3.5 text-muted-foreground">{inv.issueDate}</td>
                            <td className="px-5 py-3.5 text-muted-foreground">{inv.dueDate}</td>
                            <td className="px-5 py-3.5 text-right font-bold text-foreground">
                              {formatCurrency(total, inv.currency)}
                            </td>
                            <td className="px-5 py-3.5 text-center whitespace-nowrap">
                              {status === 'paid' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                                  🟢 Paid
                                </span>
                              )}
                              {status === 'pending' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                  🟡 Pending
                                </span>
                              )}
                              {status === 'overdue' && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20">
                                  🔴 Overdue
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3.5 text-center">
                              <div className="flex justify-center items-center gap-1.5">
                                <button 
                                  onClick={() => handleEdit(inv)}
                                  className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-md transition-colors text-muted-foreground cursor-pointer"
                                  title="View / Edit"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleDuplicate(inv)}
                                  className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-md transition-colors text-muted-foreground cursor-pointer"
                                  title="Duplicate"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleDownloadPDF(inv)}
                                  className="p-1.5 hover:bg-primary/10 hover:text-primary rounded-md transition-colors text-muted-foreground cursor-pointer"
                                  title="Print PDF"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleDelete(inv.id)}
                                  className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors text-muted-foreground cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions & Top Customers (Col Span 1) */}
            <div className="space-y-6">
              
              {/* Quick Actions Card */}
              <Card className="border-border/60 shadow-sm rounded-[18px] text-left">
                <CardHeader className="pb-3 border-b border-border/40">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="pt-5 flex flex-col gap-3">
                  <Button 
                    onClick={() => { createNewInvoice(); navigate('/generator'); }} 
                    className="w-full rounded-xl font-bold shadow-sm flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create New Invoice
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleDownloadReport}
                    className="w-full rounded-xl font-bold shadow-sm flex items-center justify-center gap-2 border-border/70 text-foreground"
                  >
                    <Download className="w-4 h-4" />
                    Download Reports (CSV)
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/generator')}
                    className="w-full rounded-xl font-bold shadow-sm flex items-center justify-center gap-2 border-border/70 text-foreground"
                  >
                    <History className="w-4 h-4" />
                    View Invoice History
                  </Button>
                </CardContent>
              </Card>

              {/* Top Customers Card */}
              <Card className="border-border/60 shadow-sm rounded-[18px] text-left">
                <CardHeader className="pb-3 border-b border-border/40">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Top Customers</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {topCustomers.length === 0 ? (
                    <div className="p-5 text-center text-xs text-muted-foreground font-semibold">No customers to display</div>
                  ) : (
                    <div className="divide-y divide-border/30 text-xs font-semibold">
                      {topCustomers.map((cust, idx) => (
                        <div key={idx} className="flex justify-between items-center px-5 py-3 hover:bg-muted/5 transition-colors">
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                              {idx + 1}
                            </span>
                            <span className="text-foreground max-w-[120px] truncate">{cust.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-muted-foreground block text-[10px]">{cust.invoices} {cust.invoices === 1 ? 'Invoice' : 'Invoices'}</span>
                            <span className="text-foreground font-bold">{formatCurrency(cust.revenue, preferredCurrency)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
