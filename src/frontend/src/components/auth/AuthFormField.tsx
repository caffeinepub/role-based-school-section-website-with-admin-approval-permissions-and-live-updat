import { ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface AuthFormFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  icon?: ReactNode;
  rightElement?: ReactNode;
}

export default function AuthFormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  disabled,
  icon,
  rightElement,
}: AuthFormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </Label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </div>
        )}
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${rightElement ? 'pr-10' : ''}
            ${error ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary'}
            ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
          `}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
          <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
          {error}
        </p>
      )}
    </div>
  );
}
