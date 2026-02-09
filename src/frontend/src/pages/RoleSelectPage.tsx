import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Users, Shield } from 'lucide-react';

export default function RoleSelectPage() {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'student',
      title: 'Student',
      icon: GraduationCap,
      description: 'Apply for access or login',
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700',
      path: '/student-apply'
    },
    {
      id: 'visitor',
      title: 'Visitor',
      icon: Users,
      description: 'View school information',
      color: 'from-sky-500 to-sky-600',
      hoverColor: 'hover:from-sky-600 hover:to-sky-700',
      path: '/visitor-login'
    },
    {
      id: 'admin',
      title: 'Admin',
      icon: Shield,
      description: 'Manage school content',
      color: 'from-indigo-500 to-indigo-600',
      hoverColor: 'hover:from-indigo-600 hover:to-indigo-700',
      path: '/admin-login'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to School Portal
          </h1>
          <p className="text-lg text-gray-600">
            Select your role to continue
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <Card
                key={role.id}
                className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 border-transparent hover:border-blue-200 animate-in fade-in slide-in-from-bottom-4`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => navigate({ to: role.path })}
              >
                <CardContent className="p-8">
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${role.color} ${role.hoverColor} flex items-center justify-center transition-all duration-300 shadow-lg`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                    {role.title}
                  </h2>
                  <p className="text-gray-600 text-center">
                    {role.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
