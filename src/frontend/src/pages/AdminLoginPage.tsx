import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, EyeOff, Shield, Lock } from 'lucide-react';
import AuthScreenLayout from '@/components/auth/AuthScreenLayout';
import AuthFormField from '@/components/auth/AuthFormField';
import AuthPrimaryButton from '@/components/auth/AuthPrimaryButton';

const ADMIN_PASSWORD = 'dolon.admin';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password === ADMIN_PASSWORD) {
      login('admin', 'Admin');
      navigate({ to: '/home' });
    } else {
      setError('Incorrect admin password');
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

      <Card className="shadow-2xl border-2 border-indigo-200 backdrop-blur-sm bg-white/90 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600" />
        
        <CardHeader className="text-center space-y-4 pt-8 pb-6">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl transform hover:rotate-3 transition-transform duration-300">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Admin Access
          </CardTitle>
          <CardDescription className="text-base md:text-lg text-gray-600">
            Enter the admin password to continue
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-8 px-6 md:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <AuthFormField
              id="password"
              label="Admin Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
              placeholder="Enter admin password"
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

            <AuthPrimaryButton type="submit" variant="indigo">
              Login as Admin
            </AuthPrimaryButton>
          </form>
        </CardContent>
      </Card>
    </AuthScreenLayout>
  );
}
