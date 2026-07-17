import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const resolveOklchColor = (colorStr: string): string => {
  if (!colorStr || typeof colorStr !== 'string' || !colorStr.includes('oklch')) {
    return colorStr;
  }
  
  return colorStr.replace(/oklch\([^)]+\)/g, (match) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (!ctx) return match;
      ctx.fillStyle = match;
      return ctx.fillStyle; // browser resolves this to hex or rgb
    } catch (e) {
      return match;
    }
  });
};

export const generateInvoicePDFBlob = async (elementId: string): Promise<Blob> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id ${elementId} not found`);
  }

  // Temporarily reset transform scale for rendering capturing
  const originalTransform = element.style.transform;
  const originalTransformOrigin = element.style.transformOrigin;
  const originalPosition = element.style.position;
  const originalTop = element.style.top;
  const originalLeft = element.style.left;

  element.style.transform = 'none';
  element.style.transformOrigin = 'initial';
  element.style.position = 'relative';
  element.style.top = '0';
  element.style.left = '0';

  // Save original getComputedStyle
  const originalGetComputedStyle = window.getComputedStyle;

  // Find all <style> elements and store their original contents
  const styleElements = Array.from(document.querySelectorAll('style'));
  const originalStyles = styleElements.map(el => ({
    element: el,
    content: el.textContent
  }));

  // CSSStyleSheet rule descriptors
  const originalCssRulesDescriptor = Object.getOwnPropertyDescriptor(CSSStyleSheet.prototype, 'cssRules');
  const originalRulesDescriptor = Object.getOwnPropertyDescriptor(CSSStyleSheet.prototype, 'rules');

  const wrapRules = (rules: CSSRuleList | null) => {
    if (!rules) return rules;
    return new Proxy(rules, {
      get(target, prop) {
        if (prop === 'length') {
          return target.length;
        }
        const index = Number(prop);
        if (!isNaN(index)) {
          const rule = target[index];
          if (!rule) return rule;
          return new Proxy(rule, {
            get(ruleTarget, ruleProp) {
              if (ruleProp === 'cssText') {
                const cssText = ruleTarget.cssText;
                if (cssText && cssText.includes('oklch')) {
                  return resolveOklchColor(cssText);
                }
                return cssText;
              }
              const val = (ruleTarget as any)[ruleProp];
              return typeof val === 'function' ? val.bind(ruleTarget) : val;
            }
          });
        }
        const val = (target as any)[prop];
        return typeof val === 'function' ? val.bind(target) : val;
      }
    }) as any;
  };

  try {
    // 1. Resolve OKLCH in style elements
    styleElements.forEach(el => {
      if (el.textContent && el.textContent.includes('oklch')) {
        el.textContent = resolveOklchColor(el.textContent);
      }
    });

    // 2. Intercept CSSOM stylesheet rule getters for adopted/external sheets
    if (originalCssRulesDescriptor) {
      Object.defineProperty(CSSStyleSheet.prototype, 'cssRules', {
        get() {
          const rules = originalCssRulesDescriptor.get!.call(this);
          return wrapRules(rules);
        },
        configurable: true
      });
    }
    if (originalRulesDescriptor) {
      Object.defineProperty(CSSStyleSheet.prototype, 'rules', {
        get() {
          const rules = originalRulesDescriptor.get!.call(this);
          return wrapRules(rules);
        },
        configurable: true
      });
    }

    // 3. Override getComputedStyle to resolve oklch values for inline styles
    window.getComputedStyle = function (elt, pseudoElt) {
      const style = originalGetComputedStyle.call(window, elt, pseudoElt);
      return new Proxy(style, {
        get(target, prop) {
          const val = target[prop as any] as any;
          if (typeof val === 'string' && val.includes('oklch')) {
            return resolveOklchColor(val);
          }
          if (typeof val === 'function') {
            if (prop === 'getPropertyValue') {
              return function(property: string) {
                const res = target.getPropertyValue(property);
                if (typeof res === 'string' && res.includes('oklch')) {
                  return resolveOklchColor(res);
                }
                return res;
              };
            }
            return val.bind(target);
          }
          return val;
        }
      });
    };

    const canvas = await html2canvas(element, {
      scale: 2, // High resolution
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    return pdf.output('blob');
  } finally {
    // Restore CSSOM descriptors
    if (originalCssRulesDescriptor) {
      Object.defineProperty(CSSStyleSheet.prototype, 'cssRules', originalCssRulesDescriptor);
    }
    if (originalRulesDescriptor) {
      Object.defineProperty(CSSStyleSheet.prototype, 'rules', originalRulesDescriptor);
    }

    // Restore style element contents
    originalStyles.forEach(item => {
      item.element.textContent = item.content;
    });

    // Restore getComputedStyle
    window.getComputedStyle = originalGetComputedStyle;

    // Restore styling properties
    element.style.transform = originalTransform;
    element.style.transformOrigin = originalTransformOrigin;
    element.style.position = originalPosition;
    element.style.top = originalTop;
    element.style.left = originalLeft;
  }
};
