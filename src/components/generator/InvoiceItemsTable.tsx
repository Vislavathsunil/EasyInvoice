import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import type { InvoiceData } from '../../types/invoice';
import { calculateLineTotal } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';

export const InvoiceItemsTable: React.FC = () => {
  const { control, register, watch } = useFormContext<InvoiceData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items');
  const currency = watch('currency');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <h3 className="text-lg font-bold tracking-tight text-foreground/90">Line Items</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ id: Math.random().toString(), name: '', quantity: 1, price: 0, discount: 0 })}
          className="flex items-center gap-2 font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Item
        </Button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => {
          const item = watchedItems?.[index];
          const lineTotal = item ? calculateLineTotal(item) : 0;
          
          return (
            <div
              key={field.id}
              className="relative flex flex-col gap-3 bg-muted/20 hover:bg-muted/30 p-4 sm:p-5 rounded-2xl border border-border/80 shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-top-2"
            >
              {/* Row 1: Description */}
              <div className="flex items-start gap-4 pr-10">
                <div className="flex-1 space-y-2.5">
                  <Label className="text-foreground/80 font-semibold text-[clamp(0.85rem,1.1vw,0.95rem)]">Item Description</Label>
                  <Input
                    {...register(`items.${index}.name` as const)}
                    placeholder="e.g. Web Design"
                  />
                </div>
              </div>

              {/* Row 2: Qty | Price | Discount | Line Total */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end pr-10 sm:pr-0">
                <div className="space-y-2.5">
                  <Label className="text-foreground/80 font-semibold text-[clamp(0.85rem,1.1vw,0.95rem)]">Qty</Label>
                  <Input
                    type="number"
                    min="1"
                    {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-foreground/80 font-semibold text-[clamp(0.85rem,1.1vw,0.95rem)]">Unit Price</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    {...register(`items.${index}.price` as const, { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-foreground/80 font-semibold text-[clamp(0.85rem,1.1vw,0.95rem)]">Discount %</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="0"
                    {...register(`items.${index}.discount` as const, { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-foreground/80 font-semibold text-[clamp(0.85rem,1.1vw,0.95rem)]">Total</Label>
                  <div className="flex h-11 w-full items-center rounded-xl border border-border/60 bg-muted/30 px-4 text-sm font-bold text-foreground">
                    {formatCurrency(lineTotal, currency)}
                  </div>
                </div>
              </div>

              {/* Delete Button */}
              <div className="absolute top-3 right-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors duration-200"
                  onClick={() => remove(index)}
                  title="Remove Item"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}

        {fields.length === 0 && (
          <div className="text-center py-12 text-muted-foreground/60 border-2 border-dashed border-border rounded-2xl bg-muted/5 font-medium">
            No items added yet. Click "Add Item" above to begin.
          </div>
        )}
      </div>
    </div>
  );
};
