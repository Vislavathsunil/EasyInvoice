import React, { useState, useRef, useEffect } from 'react';
import { FormProvider } from 'react-hook-form';
import { Printer, Save } from 'lucide-react';
import { useInvoiceContext } from '../context/InvoiceContext';
import { InvoiceForm } from '../components/generator/InvoiceForm';
import { InvoicePreview } from '../components/generator/InvoicePreview';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';

export const Generator: React.FC = () => {
  const { methods, currentInvoiceId, saveInvoice } = useInvoiceContext();
  const { showToast } = useToast();
  const formData = methods.watch();

  const [scale, setScale] = useState(1);
  const [previewHeight, setPreviewHeight] = useState(1123);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  

  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveInvoice();
    } catch (e) {
      showToast('Failed to save invoice.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

 

  // 1. Observe parent width to adjust scale ratio
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const parentWidth = containerRef.current.clientWidth;
        const style = window.getComputedStyle(containerRef.current);
        const paddingLeft = parseFloat(style.paddingLeft) || 16;
        const paddingRight = parseFloat(style.paddingRight) || 16;
        const borderLeft = parseFloat(style.borderLeftWidth) || 0;
        const borderRight = parseFloat(style.borderRightWidth) || 0;

        const availableWidth = parentWidth - paddingLeft - paddingRight - borderLeft - borderRight;
        const newScale = Math.min(availableWidth / 794, 1);
        setScale(newScale > 0 ? newScale : 0.8);
      }
    };

    if (containerRef.current) {
      const observer = new ResizeObserver(() => handleResize());
      observer.observe(containerRef.current);
      handleResize();
      return () => observer.disconnect();
    }
  }, []);

  // 2. Observe inner sheet's scrollHeight to adjust parent wrapper height dynamically
  useEffect(() => {
    const handleHeightChange = () => {
      if (previewRef.current) {
        setPreviewHeight(previewRef.current.scrollHeight);
      }
    };

    if (previewRef.current) {
      const observer = new ResizeObserver(() => handleHeightChange());
      observer.observe(previewRef.current);
      handleHeightChange();
      return () => observer.disconnect();
    }
  }, [formData]);

  return (
    <FormProvider {...methods}>
      {/* Screen-Only Editor View */}
      <div className="flex-1 bg-muted/15 pb-24 print:hidden">
        {/* Action Bar */}
        <div className="sticky top-0 z-40 bg-card border-b border-border shadow-sm py-3">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between gap-3">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground/90 shrink-0">Invoice Editor</h2>
            <div className="flex gap-2 flex-wrap justify-end">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                variant="outline"
                className="gap-1.5 shadow-sm px-3 sm:px-5 h-10 sm:h-11 text-xs sm:text-sm font-semibold"
              >
                <Save className="w-4 h-4 shrink-0" />
                <span className="hidden min-[450px]:inline">{isSaving ? 'Saving...' : currentInvoiceId ? 'Update' : 'Save'}</span>
              </Button>
          
              <Button
                onClick={handlePrint}
                className="gap-1.5 shadow-sm px-3 sm:px-5 h-10 sm:h-11 text-xs sm:text-sm font-semibold"
              >
                <Printer className="w-4 h-4 shrink-0" />
                <span className="hidden min-[400px]:inline">Print</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 mt-6 sm:mt-8 md:mt-12">
          {/* Mobile/Tablet View Toggle (hidden on desktop >= xl) */}
          <div className="xl:hidden flex mb-6 p-1 bg-muted/40 border border-border/80 rounded-2xl max-w-md mx-auto shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'edit'
                  ? 'bg-card text-foreground shadow-md shadow-black/[0.04] border border-border/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Edit Form
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-card text-foreground shadow-md shadow-black/[0.04] border border-border/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Live Preview
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.75fr] gap-6 md:gap-10 items-start">
            {/* Left Column: Form */}
            <div className={`space-y-6 sm:space-y-8 xl:block ${activeTab === 'edit' ? 'block' : 'hidden'}`}>
              <form onSubmit={(e) => e.preventDefault()}>
                <InvoiceForm />
              </form>
            </div>

            {/* Right Column: Live Preview */}
            <div className={`sticky top-28 space-y-4 xl:block ${activeTab === 'preview' ? 'block' : 'hidden'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-muted-foreground/80 tracking-tight">Live Preview</h3>
              </div>

              {/* Wrapper to scale preview sheet dynamically */}
              <div
                ref={containerRef}
                className="bg-card border border-border rounded-2xl p-4 md:p-6 shadow-sm overflow-hidden flex justify-center w-full transition-all duration-200"
              >
                <div
                  style={{
                    width: `${794 * scale}px`,
                    height: `${previewHeight * scale}px`,
                    position: 'relative'
                  }}
                  className="overflow-hidden transition-all duration-200"
                >
                  <div
                    ref={previewRef}
                    style={{
                      transform: `scale(${scale})`,
                      transformOrigin: 'top left',
                      width: '794px',
                      position: 'absolute',
                      top: 0,
                      left: 0
                    }}
                    className="transition-transform duration-200 ease-out"
                  >
                    <InvoicePreview data={formData} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print-Only View */}
      <div className="hidden print:block">
        <InvoicePreview data={formData} />
      </div>
    </FormProvider>
  );
};
