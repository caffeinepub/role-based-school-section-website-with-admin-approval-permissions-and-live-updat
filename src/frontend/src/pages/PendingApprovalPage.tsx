import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export default function PendingApprovalPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate({ to: '/' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Pending Approval</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-blue-50 p-6 rounded-lg">
            <p className="text-lg text-gray-800 font-medium">
              Your request is waiting for admin approval.
            </p>
          </div>
          <p className="text-sm text-gray-600">
            An administrator will review your application soon. You will be able to access the portal once approved.
          </p>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full"
          >
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
