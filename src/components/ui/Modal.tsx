import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-background border border-border rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in zoom-in-95">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 flex-1 overflow-auto bg-muted/20">
          {children}
        </div>
      </div>
    </div>
  );
};
