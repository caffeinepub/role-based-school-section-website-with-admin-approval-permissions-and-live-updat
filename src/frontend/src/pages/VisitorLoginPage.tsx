import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react';
import AuthScreenLayout from '@/components/auth/AuthScreenLayout';
import AuthFormField from '@/components/auth/AuthFormField';
import AuthPrimaryButton from '@/components/auth/AuthPrimaryButton';

const VISITOR_PASSWORD = 'dolon';

export default function VisitorLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password === VISITOR_PASSWORD) {
      login('visitor', 'Visitor');
      navigate({ to: '/home' });
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <AuthScreenLayout>
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/' })}
        className="mb-6 hover:bg-white/60 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <Card className="shadow-2xl border-2 border-gray-200 backdrop-blur-sm bg-white/90 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500" />
        
        <CardHeader className="text-center space-y-4 pt-8 pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:rotate-3 transition-transform duration-300">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Visitor Access
          </CardTitle>
          <CardDescription className="text-base md:text-lg text-gray-600">
            Enter the visitor password to continue
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-8 px-6 md:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <AuthFormField
              id="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
              placeholder="Enter visitor password"
              error={error}
              icon={<Lock className="w-4 h-4" />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <AuthPrimaryButton type="submit" variant="sky">
              Enter Portal
            </AuthPrimaryButton>
          </form>
        </CardContent>
      </Card>
    </AuthScreenLayout>
  );
}
