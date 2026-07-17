import React from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          {
            "bg-primary text-primary-foreground shadow hover:bg-primary/95 hover:shadow-md": variant === 'default',
            "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20": variant === 'outline',
            "hover:bg-accent hover:text-accent-foreground": variant === 'ghost',
            "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90": variant === 'destructive',
            "h-11 px-6 py-2": size === 'default',
            "h-9 rounded-lg px-4 text-xs": size === 'sm',
            "h-12 rounded-xl px-8 text-base": size === 'lg',
            "h-11 w-11": size === 'icon',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
