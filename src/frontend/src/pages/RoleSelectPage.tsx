import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Users, Shield } from 'lucide-react';
import AuthScreenLayout from '@/components/auth/AuthScreenLayout';

export default function RoleSelectPage() {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'student',
      title: 'Student',
      icon: GraduationCap,
      description: 'Apply for access or login',
      gradient: 'from-blue-500 via-blue-600 to-blue-700',
      hoverGradient: 'hover:from-blue-600 hover:via-blue-700 hover:to-blue-800',
      borderColor: 'hover:border-blue-300',
      shadowColor: 'hover:shadow-blue-500/25',
      path: '/student-apply'
    },
    {
      id: 'visitor',
      title: 'Visitor',
      icon: Users,
      description: 'View school information',
      gradient: 'from-sky-500 via-sky-600 to-cyan-600',
      hoverGradient: 'hover:from-sky-600 hover:via-sky-700 hover:to-cyan-700',
      borderColor: 'hover:border-sky-300',
      shadowColor: 'hover:shadow-sky-500/25',
      path: '/visitor-login'
    },
    {
      id: 'admin',
      title: 'Admin',
      icon: Shield,
      description: 'Manage school content',
      gradient: 'from-indigo-500 via-indigo-600 to-purple-600',
      hoverGradient: 'hover:from-indigo-600 hover:via-indigo-700 hover:to-purple-700',
      borderColor: 'hover:border-indigo-300',
      shadowColor: 'hover:shadow-indigo-500/25',
      path: '/admin-login'
    }
  ];

  return (
    <AuthScreenLayout maxWidth="xl">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
          Welcome to School Portal
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Select your role to continue
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {roles.map((role, index) => {
          const Icon = role.icon;
          return (
            <Card
              key={role.id}
              className={`
                group cursor-pointer 
                transition-all duration-300 ease-out
                hover:scale-105 
                border-2 border-gray-200 ${role.borderColor}
                shadow-lg hover:shadow-2xl ${role.shadowColor}
                backdrop-blur-sm bg-white/80
                role-card-enter
              `}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => navigate({ to: role.path })}
            >
              <CardContent className="p-8 md:p-10">
                <div className={`
                  w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 
                  rounded-2xl bg-gradient-to-br ${role.gradient} ${role.hoverGradient}
                  flex items-center justify-center 
                  transition-all duration-300 
                  shadow-lg group-hover:shadow-xl
                  transform group-hover:rotate-3 group-hover:scale-110
                `}>
                  <Icon className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 text-center group-hover:text-gray-800 transition-colors">
                  {role.title}
                </h2>
                <p className="text-gray-600 text-center text-base md:text-lg group-hover:text-gray-700 transition-colors">
                  {role.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AuthScreenLayout>
  );
}
