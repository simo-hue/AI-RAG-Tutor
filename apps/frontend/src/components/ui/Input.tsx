import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | unknown;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-secondary-700 mb-1"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-3 py-2 border rounded-lg transition-colors duration-200',
            'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
            'placeholder:text-secondary-400',
            error
              ? 'border-error-500 focus:ring-error-500 focus:border-error-500'
              : 'border-secondary-300',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-error-600">
            {typeof error === 'string' ? error : 'An error occurred'}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-secondary-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';