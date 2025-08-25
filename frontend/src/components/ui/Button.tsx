import React, { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-primary-light dark:focus-visible:ring-offset-dark-bg disabled:opacity-50 disabled:pointer-events-none active:scale-95',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary/90 dark:bg-primary-light dark:hover:bg-primary-light/90 shadow-lg hover:shadow-xl',
        destructive: 'bg-status-rejected text-white hover:bg-status-rejected/90 shadow-lg hover:shadow-xl',
        outline: 'border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-white dark:border-primary-light dark:text-primary-light dark:hover:bg-primary-light dark:hover:text-dark-bg',
        secondary: 'bg-secondary text-white hover:bg-secondary/80 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white',
        ghost: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white',
        link: 'text-primary underline-offset-4 hover:underline dark:text-primary-light',
        gradient: 'bg-gradient-to-r from-primary to-primary-light text-white hover:from-primary/90 hover:to-primary-light/90 shadow-lg hover:shadow-xl hover:-translate-y-0.5',
        // Role-specific variants with enhanced dark mode support
        admin: 'bg-admin text-white hover:bg-admin/90 dark:bg-admin-dark dark:hover:bg-admin-dark/90 shadow-lg',
        agent: 'bg-agent text-white hover:bg-agent/90 dark:bg-agent-dark dark:hover:bg-agent-dark/90 shadow-lg',
        supplier: 'bg-supplier text-white hover:bg-supplier/90 dark:bg-supplier-dark dark:hover:bg-supplier-dark/90 shadow-lg',
        buyer: 'bg-buyer text-white hover:bg-buyer/90 dark:bg-buyer-dark dark:hover:bg-buyer-dark/90 shadow-lg',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-8 text-base',
        xl: 'h-14 px-10 text-lg',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
