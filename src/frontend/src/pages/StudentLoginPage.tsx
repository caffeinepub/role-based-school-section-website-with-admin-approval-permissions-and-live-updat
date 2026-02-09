import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../auth/AuthContext';
import { useStudentLogin } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Lock, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import AuthScreenLayout from '@/components/auth/AuthScreenLayout';
import AuthFormField from '@/components/auth/AuthFormField';
import AuthPrimaryButton from '@/components/auth/AuthPrimaryButton';

export default function StudentLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const loginMutation = useStudentLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error('Please enter both username and password');
      return;
    }

    try {
      const result = await loginMutation.mutateAsync({ username, password });

      if (result.__kind__ === 'approved') {
        // Map backend role to session role
        let sessionRole: 'student' | 'studentEditor' = 'student';
        if (result.approved.role === 'studentEditor') {
          sessionRole = 'studentEditor';
        }

        login(sessionRole, username);
        toast.success(`Welcome back, ${result.approved.name}!`);
        navigate({ to: '/home' });
      } else if (result.__kind__ === 'pending') {
        login('pending', username);
        navigate({ to: '/pending-approval' });
      } else if (result.__kind__ === 'rejected') {
        toast.error('Your application has been rejected. Please contact an administrator.');
      } else if (result.__kind__ === 'invalidCredentials') {
        toast.error('Invalid username or password');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Failed to login. Please try again.');
    }
  };

  return (
    <AuthScreenLayout>
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/' })}
        className="mb-6 hover:bg-white/60 transition-colors"
        disabled={loginMutation.isPending}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <Card className="shadow-2xl border-2 border-blue-200 backdrop-blur-sm bg-white/90 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700" />
        
        <CardHeader className="text-center space-y-4 pt-8 pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg transform hover:rotate-3 transition-transform duration-300">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Student Login
          </CardTitle>
          <CardDescription className="text-base md:text-lg text-gray-600">
            Login with your approved credentials
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-8 px-6 md:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <AuthFormField
              id="username"
              label="Username"
              value={username}
              onChange={setUsername}
              placeholder="Enter your username"
              disabled={loginMutation.isPending}
              icon={<User className="w-4 h-4" />}
            />

            <AuthFormField
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Enter your password"
              disabled={loginMutation.isPending}
              icon={<Lock className="w-4 h-4" />}
            />

            <AuthPrimaryButton
              type="submit"
              loading={loginMutation.isPending}
              disabled={loginMutation.isPending}
              variant="blue"
            >
              Login
            </AuthPrimaryButton>

            <div className="text-center pt-2">
              <Button
                type="button"
                variant="link"
                onClick={() => navigate({ to: '/student-apply' })}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                disabled={loginMutation.isPending}
              >
                Don't have an account? Apply here
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthScreenLayout>
  );
}
