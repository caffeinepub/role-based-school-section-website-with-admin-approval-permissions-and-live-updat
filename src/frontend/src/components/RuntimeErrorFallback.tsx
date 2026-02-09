import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface RuntimeErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
}

export default function RuntimeErrorFallback({ error, resetError }: RuntimeErrorFallbackProps) {
  const handleReload = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h1>
        
        <p className="text-gray-600 mb-6">
          We encountered an unexpected error. Please try reloading the page.
        </p>
        
        {error && process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-gray-50 rounded-md text-left">
            <p className="text-xs font-mono text-gray-700 break-all">
              {error.message}
            </p>
          </div>
        )}
        
        <Button onClick={handleReload} className="w-full">
          Reload Page
        </Button>
      </div>
    </div>
  );
}
