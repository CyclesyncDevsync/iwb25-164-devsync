import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: SelectOption[];
  error?: string;
  label?: string;
  onChange?: (value: string) => void;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, error, label, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
            {label}
          </label>
        )}
        <select
          className={cn(
            'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-status-rejected focus:ring-status-rejected/30 focus:border-status-rejected',
            className
          )}
          ref={ref}
          onChange={handleChange}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-xs text-status-rejected">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
