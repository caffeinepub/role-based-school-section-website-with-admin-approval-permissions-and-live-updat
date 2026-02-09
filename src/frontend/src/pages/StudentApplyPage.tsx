import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../auth/AuthContext';
import { useSubmitApplication } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, School, Users as UsersIcon, Lock, CheckCircle2, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import AuthScreenLayout from '@/components/auth/AuthScreenLayout';
import AuthFormField from '@/components/auth/AuthFormField';
import AuthPrimaryButton from '@/components/auth/AuthPrimaryButton';
import { getErrorMessage } from '../utils/adminErrors';

export default function StudentApplyPage() {
  const [formData, setFormData] = useState({
    name: '',
    className: '',
    section: '',
    username: '',
    password: ''
  });
  const [hasApplied, setHasApplied] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const submitMutation = useSubmitApplication();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.className || !formData.section || !formData.username || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await submitMutation.mutateAsync(formData);
      login('pending', formData.username);
      setHasApplied(true);
      toast.success('Application submitted successfully!');
    } catch (error: any) {
      const errorMsg = getErrorMessage(error);
      console.error('Application submission error:', errorMsg);
      toast.error(`Failed to submit application: ${errorMsg}`);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (hasApplied) {
    return (
      <AuthScreenLayout>
        <Card className="shadow-2xl border-2 border-green-200 backdrop-blur-sm bg-white/90 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600" />
          
          <CardHeader className="text-center space-y-4 pt-8 pb-6">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl animate-in zoom-in duration-500">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">
              Application Submitted
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-6 pb-8 px-6 md:px-8">
            <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-6 rounded-xl border border-blue-100">
              <p className="text-lg text-gray-800 font-medium mb-2">
                Your request is waiting for admin approval.
              </p>
              <p className="text-sm text-gray-600 mb-3">
                You will be able to login once an administrator approves your application.
              </p>
              <p className="text-xs text-gray-500">
                The admin will see your application in their dashboard and can approve it.
              </p>
            </div>
            
            <AuthPrimaryButton
              onClick={() => navigate({ to: '/student-login' })}
              variant="blue"
            >
              Go to Login
            </AuthPrimaryButton>
          </CardContent>
        </Card>
      </AuthScreenLayout>
    );
  }

  return (
    <AuthScreenLayout>
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/' })}
        className="mb-6 hover:bg-white/60 transition-colors"
        disabled={submitMutation.isPending}
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
            Student Application
          </CardTitle>
          <CardDescription className="text-base md:text-lg text-gray-600">
            Fill in your details to apply for access
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-8 px-6 md:px-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <AuthFormField
              id="name"
              label="Full Name"
              value={formData.name}
              onChange={(value) => handleChange('name', value)}
              placeholder="Enter your full name"
              disabled={submitMutation.isPending}
              icon={<User className="w-4 h-4" />}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AuthFormField
                id="className"
                label="Class"
                value={formData.className}
                onChange={(value) => handleChange('className', value)}
                placeholder="e.g., 10"
                disabled={submitMutation.isPending}
                icon={<School className="w-4 h-4" />}
              />

              <AuthFormField
                id="section"
                label="Section"
                value={formData.section}
                onChange={(value) => handleChange('section', value)}
                placeholder="e.g., A"
                disabled={submitMutation.isPending}
                icon={<UsersIcon className="w-4 h-4" />}
              />
            </div>

            <AuthFormField
              id="username"
              label="Username"
              value={formData.username}
              onChange={(value) => handleChange('username', value)}
              placeholder="Choose a username"
              disabled={submitMutation.isPending}
              icon={<User className="w-4 h-4" />}
            />

            <AuthFormField
              id="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={(value) => handleChange('password', value)}
              placeholder="Choose a password"
              disabled={submitMutation.isPending}
              icon={<Lock className="w-4 h-4" />}
            />

            <div className="pt-2">
              <AuthPrimaryButton
                type="submit"
                loading={submitMutation.isPending}
                disabled={submitMutation.isPending}
                variant="blue"
              >
                Submit Application
              </AuthPrimaryButton>
            </div>

            <div className="text-center pt-2">
              <Button
                type="button"
                variant="link"
                onClick={() => navigate({ to: '/student-login' })}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                disabled={submitMutation.isPending}
              >
                Already have an account? Login here
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthScreenLayout>
  );
}
