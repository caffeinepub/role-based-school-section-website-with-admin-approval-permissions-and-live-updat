import { ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, Bell, BookOpen, Calendar, Clock, Shield, LogOut, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SiCoffeescript } from 'react-icons/si';
import { BackgroundMusicPlayer } from '../music/BackgroundMusicPlayer';
import AssistantWidget from './assistant/AssistantWidget';

export default function AppLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { sessionRole, username, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
    navigate({ to: '/' });
  };

  const navItems = [
    { label: 'Home', icon: Home, path: '/home' },
    { label: 'Notices', icon: Bell, path: '/notices' },
    { label: 'Homework', icon: BookOpen, path: '/homework' },
    { label: 'Class Routine', icon: Calendar, path: '/routine' },
    { label: 'Class Schedule', icon: Clock, path: '/schedule' }
  ];

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Button
            key={item.path}
            variant="ghost"
            onClick={() => navigate({ to: item.path })}
            className="justify-start"
          >
            <Icon className="w-4 h-4 mr-2" />
            {item.label}
          </Button>
        );
      })}
      {isAdmin && (
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/admin' })}
          className="justify-start text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
        >
          <Shield className="w-4 h-4 mr-2" />
          Admin Dashboard
        </Button>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64">
                  <div className="flex flex-col gap-2 mt-8">
                    <NavLinks />
                  </div>
                </SheetContent>
              </Sheet>
              
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent">
                School Portal
              </h1>
            </div>

            <nav className="hidden md:flex items-center gap-2">
              <NavLinks />
            </nav>

            <div className="flex items-center gap-4">
              {username && (
                <span className="text-sm text-gray-600 hidden sm:inline">
                  Welcome, <span className="font-medium">{username}</span>
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-180px)]">
        {children}
      </main>

      <BackgroundMusicPlayer />
      <AssistantWidget />

      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>
            © 2026. Built with <SiCoffeescript className="inline w-4 h-4 text-red-500" /> using{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              caffeine.ai
            </a>
          </p>
          <p className="mt-2">
            <span className="shine-text font-medium text-blue-700">
              Made By Sunyad Ahmed Shrabon
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}
