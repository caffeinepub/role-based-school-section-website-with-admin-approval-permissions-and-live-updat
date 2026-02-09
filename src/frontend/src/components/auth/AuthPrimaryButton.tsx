import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface AuthPrimaryButtonProps {
  type?: 'button' | 'submit';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: ReactNode;
  variant?: 'blue' | 'indigo' | 'sky';
  fullWidth?: boolean;
}

export default function AuthPrimaryButton({
  type = 'button',
  onClick,
  disabled,
  loading,
  children,
  variant = 'blue',
  fullWidth = true,
}: AuthPrimaryButtonProps) {
  const variantClasses = {
    blue: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40',
    indigo: 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40',
    sky: 'bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40',
  };

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${fullWidth ? 'w-full' : ''}
        ${variantClasses[variant]}
        transition-all duration-300
        transform hover:scale-[1.02] active:scale-[0.98]
        disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
        font-medium text-white
      `}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </Button>
  );
}
