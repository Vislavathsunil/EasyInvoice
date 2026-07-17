import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning';
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'error', duration = 4000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-top-4 duration-300 backdrop-blur-md",
      {
        "bg-destructive/10 border-destructive/25 text-destructive": type === 'error',
        "bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400": type === 'success',
        "bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-400": type === 'warning',
      }
    )}>
      {type === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
      {type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
      {type === 'warning' && <Info className="w-5 h-5 shrink-0" />}
      
      <p className="text-sm font-medium pr-2 leading-snug">{message}</p>
      
      <button onClick={onClose} className="p-0.5 rounded-lg hover:bg-foreground/10 transition-colors" aria-label="Close message">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
