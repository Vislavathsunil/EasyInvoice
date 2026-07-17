import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import {
  Zap,
  Printer,
  ArrowRight,
  Check,
  ChevronDown,
  Star,
  FileText,
  Cloud,
  Smartphone,
  Lock,
  Building2,
  Briefcase,
  Rocket,
  MessageSquare,
  Code,
  Palette,
  ShoppingBag,
  CheckCircle2,
  Mail,
  User
} from 'lucide-react';

export const Home: React.FC = () => {
  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const scrollToDemo = () => {
    const element = document.getElementById('demo-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqs = [
    {
      q: "Is EasyInvoice free?",
      a: "Yes, EasyInvoice is 100% free to use. You can generate, print, and export as many invoices as you need without any hidden fees or limitations."
    },
    {
      q: "Do I need an account?",
      a: "No registration is required to create and download invoices. However, creating a free account allows you to securely save your billing history, manage templates, and access your invoices from any device."
    },
    {
      q: "Can I download PDF?",
      a: "Absolutely! You can download your invoice as a perfectly formatted, high-quality PDF or print it directly from your browser with a single click."
    },
    {
      q: "Can I edit invoices later?",
      a: "Yes, if you sign up for a free account, all your saved invoices are stored in your secure cloud history, allowing you to load, edit, and re-download them anytime."
    },
    {
      q: "Can I use my company logo?",
      a: "Yes, you can fully customize your invoices with your company details, address, client info, and payment notes. You can upload your company logo once and automatically use it on every invoice."
    },
    {
      q: "Is my data secure?",
      a: "Yes. Your privacy and security are our top priorities. We use secure cloud infrastructure to keep your billing history safe and private, and we never share your data."
    }
  ];

  return (
    <div className="flex-1 bg-background text-foreground transition-colors duration-300 selection:bg-primary/10 selection:text-primary">

      {/* SECTION 1 — HERO */}
      <section className="relative overflow-hidden py-14 sm:py-20 md:py-32 lg:pb-36 bg-gradient-to-b from-[#EEF2F6]/50 to-background dark:from-slate-900/30">
        {/* Glow Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#3B82F6]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-[#2563EB]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 items-center">

          {/* Left Hero Column */}
          <div className="space-y-8 text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">
              <Zap className="w-3.5 h-3.5 fill-primary animate-pulse" />
              <span>Version 1.0 is Live</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none text-slate-900 dark:text-white">
              Create Professional <br />
              <span className="bg-gradient-to-r from-primary via-[#3B82F6] to-[#1D4ED8] bg-clip-text text-transparent">
                Invoices in Seconds
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Generate beautiful invoices, download PDFs instantly, manage your billing history, and get paid faster—all from one simple platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link to="/generator">
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base bg-primary hover:bg-primary/95 text-primary-foreground rounded-full shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all font-bold">
                  Create Free Invoice
                  <ArrowRight className="w-4 h-4 ml-2 animate-in slide-in-from-left-1" />
                </Button>
              </Link>
              <button
                onClick={scrollToDemo}
                className="w-full sm:w-auto h-14 px-8 text-base text-foreground bg-card border border-border rounded-full hover:bg-muted transition-all font-bold shadow-sm cursor-pointer"
              >
                View Demo
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 border-t border-border grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[3]" />
                <span>✓ No Registration</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[3]" />
                <span>✓ PDF Export</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[3]" />
                <span>✓ Cloud Storage</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 stroke-[3]" />
                <span>✓ Mobile Friendly</span>
              </div>
            </div>
          </div>

          {/* Right Hero Column: Premium Mockup */}
          <div className="relative hidden sm:flex justify-center lg:justify-end animate-in fade-in zoom-in-95 duration-500">
            {/* Background Blob behind card */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#3B82F6]/20 to-[#2563EB]/10 rounded-3xl rotate-3 scale-95 blur-sm" />

            {/* Main Mockup Sheet */}
            <div className="relative bg-card text-card-foreground p-6 sm:p-8 rounded-2xl shadow-xl border border-border w-full max-w-[480px] select-none transform hover:-translate-y-2 transition-transform duration-500 ease-out group">
              {/* Fake Ribbon */}
              <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
                Paid
              </div>

              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-1.5 text-primary font-black text-sm uppercase tracking-wider">
                    <FileText className="w-4 h-4" />
                    <span>EasyInvoice</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 font-mono">#INV-2026-1029</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-foreground">Acme Agency</div>
                  <div className="text-[10px] text-muted-foreground">hello@acme.com</div>
                </div>
              </div>

              <div className="h-px bg-border w-full mb-6" />

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Bill To</div>
                  <div className="text-xs font-bold text-foreground mt-1">Globex Corp</div>
                  <div className="text-[10px] text-muted-foreground">billing@globex.com</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Due Date</div>
                  <div className="text-xs font-bold text-foreground mt-1">July 29, 2026</div>
                </div>
              </div>

              {/* Table items mock */}
              <div className="space-y-3 mb-6">
                <div className="text-[10px] font-bold text-muted-foreground uppercase grid grid-cols-[1fr_50px_80px] border-b border-border pb-1.5 text-left">
                  <span>Description</span>
                  <span className="text-center">Qty</span>
                  <span className="text-right">Amount</span>
                </div>
                <div className="text-xs grid grid-cols-[1fr_50px_80px] font-medium text-foreground/80 text-left">
                  <span>SaaS UI Redesign</span>
                  <span className="text-center text-muted-foreground">1</span>
                  <span className="text-right">₹4,500.00</span>
                </div>
                <div className="text-xs grid grid-cols-[1fr_50px_80px] font-medium text-foreground/80 text-left">
                  <span>Vite React Development</span>
                  <span className="text-center text-muted-foreground">1</span>
                  <span className="text-right">₹2,000.00</span>
                </div>
              </div>

              {/* Totals mock */}
              <div className="border-t border-border pt-4 flex justify-end">
                <div className="w-40 space-y-2">
                  <div className="flex justify-between text-xs font-medium text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹6,500.00</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium text-muted-foreground">
                    <span>Tax (10%)</span>
                    <span>₹650.00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-black text-primary bg-primary/5 dark:bg-primary/20 px-2.5 py-2 rounded-lg border-t-2 border-primary">
                    <span>Total</span>
                    <span>₹7,150.00</span>
                  </div>
                </div>
              </div>

              {/* Floating decorative elements */}
              <div className="absolute -bottom-5 -left-5 bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 rounded-xl shadow-xl hidden min-[500px]:flex items-center gap-3 border border-slate-800 animate-bounce [animation-duration:4s]">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <div className="text-[11px] font-bold tracking-tight">Invoice Paid • ₹7,150.00</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2 — WHY CHOOSE EASYINVOICE */}
      <section className="py-24 sm:py-32 bg-card border-y border-border transition-colors duration-300">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center">

          <div className="max-w-2xl mx-auto space-y-4 mb-20">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">Benefits</h2>
            <p className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              Why Thousands Choose EasyInvoice
            </p>
            <p className="text-base sm:text-lg text-muted-foreground">
              Streamline your invoicing process with tools designed to get you paid quickly and securely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-background border border-border p-8 rounded-2xl shadow-sm text-left hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/20 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 fill-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">⚡ Lightning Fast</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Generate invoices in less than a minute. Our streamlined editor pre-fills client info and calculates totals automatically.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-background border border-border p-8 rounded-2xl shadow-sm text-left hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/20 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">📄 Professional Templates</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Impress your customers with gorgeous, print-ready layouts tailored specifically for freelancers, consultants, and teams.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-background border border-border p-8 rounded-2xl shadow-sm text-left hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/20 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Cloud className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">☁ Cloud Sync</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                Your invoices are automatically saved and synchronized securely, so you never lose your work history.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-background border border-border p-8 rounded-2xl shadow-sm text-left hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/20 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">📱 Works Everywhere</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                Create and manage invoices on the go. The entire application is fully optimized for Mobile, Tablet, and Desktop.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group bg-background border border-border p-8 rounded-2xl shadow-sm text-left hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/20 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Printer className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">🖨 Export & Print</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                Download high-fidelity PDFs or trigger standard system printing dialogue with a single tap of a button.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group bg-background border border-border p-8 rounded-2xl shadow-sm text-left hover:-translate-y-1.5 hover:shadow-xl hover:border-primary/20 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3">🔒 Secure</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                Your data is secure and confidential. We enforce strict data policies so that your invoice documents are always private.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 3 — HOW IT WORKS */}
      <section className="py-24 sm:py-32 bg-background border-b border-border">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center">

          <div className="max-w-2xl mx-auto space-y-4 mb-20">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">Process</h2>
            <p className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              Create an Invoice in 3 Simple Steps
            </p>
            <p className="text-base sm:text-lg text-muted-foreground">
              Get professional billing files ready for your clients without any technical setup.
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 items-start max-w-4xl mx-auto">
            {/* Process Step 1 */}
            <div className="relative flex flex-col items-center group">
              <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-black shadow-lg shadow-primary/20 mb-6 z-10">
                1
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Add Business Details</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px]">
                Enter your company and customer details.
              </p>

              {/* Connector line */}
              <div className="hidden md:block absolute top-7 left-[calc(50%+2.5rem)] right-[calc(-50%+2.5rem)] h-0.5 bg-gradient-to-r from-primary to-border z-0" />
            </div>

            {/* Process Step 2 */}
            <div className="relative flex flex-col items-center group">
              <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-black shadow-lg shadow-primary/20 mb-6 z-10">
                2
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Add Line Items</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px]">
                Add products, services, taxes and discounts.
              </p>

              {/* Connector line */}
              <div className="hidden md:block absolute top-7 left-[calc(50%+2.5rem)] right-[calc(-50%+2.5rem)] h-0.5 bg-gradient-to-r from-primary to-border z-0" />
            </div>

            {/* Process Step 3 */}
            <div className="relative flex flex-col items-center">
              <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-black shadow-lg shadow-primary/20 mb-6 z-10">
                3
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Download or Send</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px]">
                Generate PDF instantly and email it directly.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 4 — WHO IS THIS FOR */}
      <section className="py-24 sm:py-32 bg-card border-b border-border transition-colors duration-300">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center">

          <div className="max-w-2xl mx-auto space-y-4 mb-20">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">Audience</h2>
            <p className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              Built For Everyone
            </p>
            <p className="text-base sm:text-lg text-muted-foreground">
              Tailored workflows that empower diverse professionals to structure their revenue streams.
            </p>
          </div>

          <div className="grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {/* Freelancers */}
            <div className="bg-background border border-border p-6 rounded-xl text-left hover:-translate-y-1 hover:border-primary/25 hover:shadow-md transition-all duration-300">
              <User className="w-6 h-6 text-primary mb-4" />
              <h3 className="font-bold text-foreground text-sm sm:text-base">Freelancers</h3>
              <p className="text-xs text-muted-foreground mt-2">Manage individual clients and contract jobs with ease.</p>
            </div>

            {/* Small Businesses */}
            <div className="bg-background border border-border p-6 rounded-xl text-left hover:-translate-y-1 hover:border-primary/25 hover:shadow-md transition-all duration-300">
              <Building2 className="w-6 h-6 text-primary mb-4" />
              <h3 className="font-bold text-foreground text-sm sm:text-base">Small Businesses</h3>
              <p className="text-xs text-muted-foreground mt-2">Generate clean receipts and monitor business transactions.</p>
            </div>

            {/* Agencies */}
            <div className="bg-background border border-border p-6 rounded-xl text-left hover:-translate-y-1 hover:border-primary/25 hover:shadow-md transition-all duration-300">
              <Briefcase className="w-6 h-6 text-primary mb-4" />
              <h3 className="font-bold text-foreground text-sm sm:text-base">Agencies</h3>
              <p className="text-xs text-muted-foreground mt-2">Track multiple active service contracts and bill retainer client retainers.</p>
            </div>

            {/* Startups */}
            <div className="bg-background border border-border p-6 rounded-xl text-left hover:-translate-y-1 hover:border-primary/25 hover:shadow-md transition-all duration-300">
              <Rocket className="w-6 h-6 text-primary mb-4" />
              <h3 className="font-bold text-foreground text-sm sm:text-base">Startups</h3>
              <p className="text-xs text-muted-foreground mt-2">Issue clean billing statements to vendors and early investors.</p>
            </div>

            {/* Consultants */}
            <div className="bg-background border border-border p-6 rounded-xl text-left hover:-translate-y-1 hover:border-primary/25 hover:shadow-md transition-all duration-300">
              <MessageSquare className="w-6 h-6 text-primary mb-4" />
              <h3 className="font-bold text-foreground text-sm sm:text-base">Consultants</h3>
              <p className="text-xs text-muted-foreground mt-2">Structure consulting hours and project milestones professionally.</p>
            </div>

            {/* Developers */}
            <div className="bg-background border border-border p-6 rounded-xl text-left hover:-translate-y-1 hover:border-primary/25 hover:shadow-md transition-all duration-300">
              <Code className="w-6 h-6 text-primary mb-4" />
              <h3 className="font-bold text-foreground text-sm sm:text-base">Developers</h3>
              <p className="text-xs text-muted-foreground mt-2">Detail software releases and custom development schedules.</p>
            </div>

            {/* Designers */}
            <div className="bg-background border border-border p-6 rounded-xl text-left hover:-translate-y-1 hover:border-primary/25 hover:shadow-md transition-all duration-300">
              <Palette className="w-6 h-6 text-primary mb-4" />
              <h3 className="font-bold text-foreground text-sm sm:text-base">Designers</h3>
              <p className="text-xs text-muted-foreground mt-2">Clean breakdowns for design systems, wireframes and logo revisions.</p>
            </div>

            {/* Online Sellers */}
            <div className="bg-background border border-border p-6 rounded-xl text-left hover:-translate-y-1 hover:border-primary/25 hover:shadow-md transition-all duration-300">
              <ShoppingBag className="w-6 h-6 text-primary mb-4" />
              <h3 className="font-bold text-foreground text-sm sm:text-base">Online Sellers</h3>
              <p className="text-xs text-muted-foreground mt-2">Instantly provide custom product sales receipts to retail buyers.</p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 5 — ANALYTICS ILLUSTRATION */}
      <section className="py-24 sm:py-32 bg-background border-b border-border">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 items-center">

          {/* Left: Mini Dashboard Illustration */}
          <div className="bg-card border border-border p-6 rounded-2xl shadow-xl space-y-6 select-none relative group transform hover:-translate-y-1 transition-all duration-300 text-left">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Billing Dashboard</h4>
                  <p className="text-[10px] text-muted-foreground">Monthly Invoice Analytics</p>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded bg-muted text-foreground text-[9px] font-bold">2026</div>
            </div>

            {/* Metric Blocks */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-background p-3 rounded-lg border border-border">
                <div className="text-[9px] font-bold text-muted-foreground uppercase">Total Sent</div>
                <div className="text-sm font-black text-foreground mt-1">₹24,900.00</div>
              </div>
              <div className="bg-background p-3 rounded-lg border border-border">
                <div className="text-[9px] font-bold text-muted-foreground uppercase">Received</div>
                <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1">₹18,450.00</div>
              </div>
              <div className="bg-background p-3 rounded-lg border border-border">
                <div className="text-[9px] font-bold text-muted-foreground uppercase">Pending</div>
                <div className="text-sm font-black text-amber-600 dark:text-amber-400 mt-1">₹6,450.00</div>
              </div>
            </div>

            {/* Analytics Graph representation */}
            <div className="space-y-2.5">
              <h5 className="text-[10px] font-bold text-muted-foreground uppercase">Revenue Distribution</h5>
              <div className="h-16 flex items-end gap-2 pt-2 border-b border-border px-2">
                <div className="w-full bg-muted h-[30%] rounded-t-sm" />
                <div className="w-full bg-muted h-[45%] rounded-t-sm" />
                <div className="w-full bg-primary h-[85%] rounded-t-sm relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-foreground text-background text-[8px] px-1.5 py-0.5 rounded font-mono font-bold">₹12.4k</div>
                </div>
                <div className="w-full bg-muted h-[60%] rounded-t-sm" />
                <div className="w-full bg-muted h-[75%] rounded-t-sm" />
              </div>
            </div>

            {/* Mini invoice queue */}
            <div className="space-y-2">
              <h5 className="text-[10px] font-bold text-muted-foreground uppercase">Recent Documents</h5>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs p-2 rounded bg-background border border-border">
                  <span className="font-semibold">Globex Corporation</span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Paid</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2 rounded bg-background border border-border">
                  <span className="font-semibold">Initech Corp</span>
                  <span className="text-[10px] text-amber-600 font-bold bg-amber-500/10 px-2 py-0.5 rounded">Pending</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Feature Checklist */}
          <div className="space-y-8 text-left">
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary">Capabilities</h2>
              <p className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">Everything You Need</p>
              <p className="text-base text-muted-foreground">
                We bundle all professional invoicing requirements into a lightweight and lightning-fast client.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-sm font-semibold text-foreground/80">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 stroke-[2.5]" />
                <span>Custom Invoice Number</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-semibold text-foreground/80">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 stroke-[2.5]" />
                <span>Auto Date Calculations</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-semibold text-foreground/80">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 stroke-[2.5]" />
                <span>Flexible Tax Support</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-semibold text-foreground/80">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 stroke-[2.5]" />
                <span>Multiple Currency Support</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-semibold text-foreground/80">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 stroke-[2.5]" />
                <span>Notes & Payment Terms</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-semibold text-foreground/80">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 stroke-[2.5]" />
                <span>One-time Logo Upload</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-semibold text-foreground/80">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 stroke-[2.5]" />
                <span>Customer Database</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-semibold text-foreground/80">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 stroke-[2.5]" />
                <span>Real-time Preview A4</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-semibold text-foreground/80">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 stroke-[2.5]" />
                <span>Responsive Editor</span>
              </div>
              <div className="flex items-center gap-3 text-sm font-semibold text-foreground/80">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 stroke-[2.5]" />
                <span>Email Invoices Directly</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 6 — SAMPLE INVOICE */}
      <section id="demo-section" className="py-24 sm:py-32 bg-card border-b border-border transition-colors duration-300">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center">

          <div className="max-w-2xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">Preview Showcase</h2>
            <p className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              Professional Invoice Preview
            </p>
            <p className="text-base sm:text-lg text-muted-foreground">
              This is exactly what your clients will receive. Sleek, clean, and perfectly formatted.
            </p>
          </div>

          {/* Browser / Laptop Frame */}
          <div className="relative max-w-4xl mx-auto bg-card border border-border rounded-2xl shadow-xl overflow-hidden transform hover:-translate-y-1 transition-all duration-500 ease-out">
            {/* Window Top Bar */}
            <div className="bg-muted px-4 py-3 flex items-center gap-2 select-none border-b border-border">
              {/* Window dots */}
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                <div className="w-3 h-3 rounded-full bg-[#10B981]" />
              </div>
              {/* Search bar mockup */}
              <div className="bg-background border border-border rounded px-3 py-1 text-[10px] text-muted-foreground font-mono mx-auto w-40 sm:w-80 text-left truncate">
                easyinvoice.app/preview/inv-2026-001
              </div>
            </div>

            {/* A4 Sheet Mockup Content */}
            <div className="p-4 sm:p-8 md:p-12 lg:p-16 max-w-[700px] mx-auto text-left text-slate-800 text-[10px] sm:text-xs md:text-sm bg-white select-none shadow-sm my-4 sm:my-8 border border-gray-150">

              {/* Invoice Top header */}
              <div className="flex justify-between items-start mb-6 sm:mb-12">
                <div className="space-y-1">
                  <h1 className="text-xl sm:text-3xl font-black text-blue-600 tracking-tighter uppercase">INVOICE</h1>
                  <p className="text-gray-500 font-mono">#INV-2026-001</p>
                </div>
                <div className="text-right space-y-1">
                  <h3 className="font-bold text-sm text-gray-900">Initech Consulting</h3>
                  <p className="text-gray-500 leading-relaxed">
                    100 Corporate Parkway<br />
                    Suite 500, Tech Valley
                  </p>
                  <p className="text-gray-500">billing@initech.com</p>
                </div>
              </div>

              {/* Bill Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-12">
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Bill To</h4>
                  <div className="font-bold text-gray-900 text-base">Globex Corporation</div>
                  <p className="text-gray-600 leading-relaxed">
                    456 Client Avenue<br />
                    Townsburg, ST 67890
                  </p>
                  <p className="text-gray-500">accounts@globex.com</p>
                </div>
                <div className="flex flex-col items-end justify-center">
                  <div className="w-full max-w-[200px] space-y-2 border-y border-gray-100 py-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Issue Date</span>
                      <span className="font-semibold text-gray-900">07/15/2026</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Due Date</span>
                      <span className="font-semibold text-gray-900">07/29/2026</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice table */}
              <div className="mb-12">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-blue-600 bg-blue-50/50 text-blue-600 text-[10px] uppercase font-bold tracking-wider">
                      <th className="py-2.5 px-3 rounded-l">Item Description</th>
                      <th className="py-2.5 px-2 text-center w-16">Qty</th>
                      <th className="py-2.5 px-2 text-right w-24">Price</th>
                      <th className="py-2.5 px-3 text-right w-28 rounded-r">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs sm:text-sm text-gray-800">
                    <tr>
                      <td className="py-3 px-3 font-semibold text-gray-900">Full-Stack Web Development</td>
                      <td className="py-3 px-2 text-gray-500 text-center font-medium">1</td>
                      <td className="py-3 px-2 text-gray-500 text-right font-medium">₹4,500.00</td>
                      <td className="py-3 px-3 text-gray-900 text-right font-bold">₹4,500.00</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-semibold text-gray-900">Brand Identity & UI Design</td>
                      <td className="py-3 px-2 text-gray-500 text-center font-medium">1</td>
                      <td className="py-3 px-2 text-gray-500 text-right font-medium">₹1,500.00</td>
                      <td className="py-3 px-3 text-gray-900 text-right font-bold">₹1,500.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-full max-w-[240px] space-y-2.5">
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span>Subtotal</span>
                    <span>₹6,000.00</span>
                  </div>
                  <div className="flex justify-between text-gray-500 font-medium">
                    <span>Tax (10.0%)</span>
                    <span>₹600.00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-black text-blue-600 bg-blue-50 px-3 py-2.5 rounded-lg border-t-2 border-blue-600">
                    <span>Total Due</span>
                    <span>₹6,600.00</span>
                  </div>
                </div>
              </div>

              {/* Footer / Notes */}
              <div className="border-t border-gray-100 pt-6 space-y-1.5">
                <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Notes & Payment Terms</h5>
                <p className="text-gray-500 text-[11px] leading-relaxed">
                  Thank you for your business. Please remit payment via bank transfer to Initech Consulting account number ending in 9876 within 14 days of due date.
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* SECTION 7 — TESTIMONIALS */}
      <section className="py-24 sm:py-32 bg-background border-b border-border">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center">

          <div className="max-w-2xl mx-auto space-y-4 mb-20">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">Reviews</h2>
            <p className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              Loved by Professionals
            </p>
            <p className="text-base sm:text-lg text-muted-foreground">
              Hear from freelancers and small businesses who upgraded their billing experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-card border border-border p-8 rounded-2xl shadow-sm text-left flex flex-col justify-between hover:shadow-lg hover:border-primary/20 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex gap-1 text-amber-450">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
                <p className="text-sm text-foreground/95 italic leading-relaxed font-semibold">
                  "EasyInvoice saved me hours every week. Beautiful interface and really fast."
                </p>
              </div>
              <div className="pt-6 border-t border-border mt-6">
                <div className="font-bold text-foreground text-sm">— Sarah</div>
                <div className="text-xs text-muted-foreground">Freelancer</div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-card border border-border p-8 rounded-2xl shadow-sm text-left flex flex-col justify-between hover:shadow-lg hover:border-primary/20 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex gap-1 text-amber-450">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
                <p className="text-sm text-foreground/95 italic leading-relaxed font-semibold">
                  "Professional PDFs and extremely simple. Our clients love the clean layout."
                </p>
              </div>
              <div className="pt-6 border-t border-border mt-6">
                <div className="font-bold text-foreground text-sm">— Michael</div>
                <div className="text-xs text-muted-foreground">Agency Owner</div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-card border border-border p-8 rounded-2xl shadow-sm text-left flex flex-col justify-between hover:shadow-lg hover:border-primary/20 transition-all duration-300">
              <div className="space-y-4">
                <div className="flex gap-1 text-amber-455">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
                <p className="text-sm text-foreground/95 italic leading-relaxed font-semibold">
                  "The best free invoice generator I've used. Love the secure dashboard too."
                </p>
              </div>
              <div className="pt-6 border-t border-border mt-6">
                <div className="font-bold text-foreground text-sm">— Daniel</div>
                <div className="text-xs text-muted-foreground">Startup Founder</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 8 — FAQ */}
      <section className="py-24 sm:py-32 bg-card border-b border-border transition-colors duration-300">
        <div className="max-w-[768px] mx-auto px-6 text-center">

          <div className="space-y-4 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-primary">FAQ</h2>
            <p className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
              Frequently Asked Questions
            </p>
            <p className="text-base text-muted-foreground">
              Everything you need to know about using EasyInvoice.
            </p>
          </div>

          <div className="space-y-4 text-left">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="border border-border rounded-xl overflow-hidden bg-background transition-all"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-5 text-sm sm:text-base font-bold text-left text-foreground hover:bg-muted/50 transition-colors focus:outline-none cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="p-5 pt-0 border-t border-border text-sm text-muted-foreground leading-relaxed bg-card animate-in slide-in-from-top-1">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SECTION 9 — FINAL CTA */}
      <section className="py-24 sm:py-32 bg-gradient-to-tr from-primary via-[#3B82F6] to-[#1D4ED8] text-white relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute top-[-50%] right-[-10%] w-[80%] h-[150%] bg-white/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6 sm:space-y-8">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-none text-white">
            Ready to Create Your First Invoice?
          </h2>
          <p className="text-[#EEF2F6]/95 leading-relaxed max-w-2xl mx-auto text-sm sm:text-base md:text-lg">
            Start creating professional invoices today. No installation. No complicated setup.
          </p>
          <div className="pt-4 flex justify-center">
            <Link to="/generator">
              <Button size="lg" className="h-14 px-8 text-base bg-white hover:bg-[#EEF2F6] text-primary rounded-full shadow-xl hover:shadow-2xl transition-all font-bold">
                Create Free Invoice
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 10 — FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800 transition-colors duration-300">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-12">
            {/* Footer Logo Column */}
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-2 text-xl font-black uppercase tracking-wider text-white">
                <FileText className="w-6 h-6 text-primary" />
                <span>EasyInvoice</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-[200px]">
                Create and download professional invoices in seconds. Safe, reliable, and completely free.
              </p>
            </div>

            {/* Quick Links Column */}
            <div className="text-left space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Quick Links</h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
                <li><a href="#demo-section" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="mailto:support@easyinvoice.app" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div className="text-left space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Resources</h4>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
              </ul>
            </div>

            {/* Social Links & Mail */}
            <div className="text-left space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Connect</h4>
              <div className="flex gap-4">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-lg hover:bg-primary/20 hover:text-primary transition-colors text-slate-300" aria-label="GitHub">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-lg hover:bg-primary/20 hover:text-primary transition-colors text-slate-300" aria-label="LinkedIn">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-800 rounded-lg hover:bg-primary/20 hover:text-primary transition-colors text-slate-300" aria-label="Twitter">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="mailto:support@easyinvoice.app" className="p-2 bg-slate-800 rounded-lg hover:bg-primary/20 hover:text-primary transition-colors text-slate-300" aria-label="Email">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
            <div>© 2026 EasyInvoice. All Rights Reserved.</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};
