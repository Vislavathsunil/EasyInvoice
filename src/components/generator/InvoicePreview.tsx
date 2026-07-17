import React, { useState, useEffect } from 'react';
import type { InvoiceData } from '../../types/invoice';
import { calculateSubtotal, calculateTax, calculateTotal, calculateLineTotal } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';
import { ModernTemplate } from './templates/ModernTemplate';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { CorporateTemplate } from './templates/CorporateTemplate';

interface InvoicePreviewProps {
  data: InvoiceData;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ data }) => {
  const [resolvedLogoUrl, setResolvedLogoUrl] = useState<string>('');

  useEffect(() => {
    if (!data.company.logoUrl) {
      setResolvedLogoUrl('');
      return;
    }

    if (data.company.logoUrl.startsWith('local:')) {
      import('../../utils/logoStorage').then(({ getLocalLogo }) => {
        getLocalLogo(data.company.logoUrl!).then((url) => {
          setResolvedLogoUrl(url || '');
        });
      }).catch(err => {
        console.error("Failed to load logoStorage module", err);
      });
    } else {
      setResolvedLogoUrl(data.company.logoUrl);
    }
  }, [data.company.logoUrl]);

  const subtotal = calculateSubtotal(data.items);
  const tax = calculateTax(subtotal, data.taxRate);
  const total = calculateTotal(subtotal, tax);
  const hasDiscounts = data.items.some(item => item.discount && item.discount > 0);

  const templateProps = { data, resolvedLogoUrl, subtotal, tax, total, hasDiscounts, calculateLineTotal, formatCurrency };

  const template = data.template || 'modern';

  if (template === 'classic') return <ClassicTemplate {...templateProps} />;
  if (template === 'corporate') return <CorporateTemplate {...templateProps} />;
  return <ModernTemplate {...templateProps} />;
};
