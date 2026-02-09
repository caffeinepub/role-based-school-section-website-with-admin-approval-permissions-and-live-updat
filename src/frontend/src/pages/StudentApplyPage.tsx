import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../auth/AuthContext';
import { useSubmitApplication } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

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
      toast.error(error.message || 'Failed to submit application');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (hasApplied) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">Application Submitted</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-lg text-gray-800 font-medium">
                Your request is waiting for admin approval.
              </p>
            </div>
            <p className="text-sm text-gray-600">
              You will be able to login once an administrator approves your application.
            </p>
            <Button
              onClick={() => navigate({ to: '/student-login' })}
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/' })}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="shadow-xl border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-900">Student Application</CardTitle>
            <CardDescription className="text-base">
              Fill in your details to apply for access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="className">Class</Label>
                  <Input
                    id="className"
                    value={formData.className}
                    onChange={(e) => handleChange('className', e.target.value)}
                    placeholder="e.g., 10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section">Section</Label>
                  <Input
                    id="section"
                    value={formData.section}
                    onChange={(e) => handleChange('section', e.target.value)}
                    placeholder="e.g., A"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  placeholder="Choose a username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Choose a password"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? 'Submitting...' : 'Submit Application'}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => navigate({ to: '/student-login' })}
                  className="text-sm"
                >
                  Already have an account? Login here
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
