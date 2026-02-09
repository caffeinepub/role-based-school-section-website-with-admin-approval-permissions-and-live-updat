import { useAuth } from '../auth/AuthContext';
import { useGetAnnouncements, useGetRoutines, useGetAllApplications } from '../hooks/useQueries';
import { useGetSectionLock } from '../hooks/useLocks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BookOpen, Calendar, Clock, Users, Lock, Unlock, Shield } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import LockIndicator from '../components/LockIndicator';

export default function HomePage() {
  const { sessionRole, username, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { data: announcements = [] } = useGetAnnouncements();
  const { data: routines = [] } = useGetRoutines();
  const { data: applications = [] } = useGetAllApplications();

  const { data: noticesLocked = false } = useGetSectionLock('notices');
  const { data: homeworkLocked = false } = useGetSectionLock('homework');
  const { data: routineLocked = false } = useGetSectionLock('routine');
  const { data: classTimeLocked = false } = useGetSectionLock('classTime');

  // Get latest 3 announcements
  const latestAnnouncements = [...announcements]
    .sort((a, b) => Number(b.timestamp - a.timestamp))
    .slice(0, 3);

  // Get today's routine
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const latestRoutine = routines.length > 0 ? routines[routines.length - 1] : null;
  const todayRoutine = latestRoutine?.routines.find(r => r.dayName === today);

  const pendingCount = applications.length;

  const roleDisplay = sessionRole === 'admin' ? 'Admin' : sessionRole === 'student' ? 'Student' : 'Visitor';

  const quickAccessCards = [
    { title: 'Notices', icon: Bell, path: '/notices', color: 'from-blue-500 to-blue-600' },
    { title: 'Homework', icon: BookOpen, path: '/homework', color: 'from-green-500 to-green-600' },
    { title: 'Class Routine', icon: Calendar, path: '/routine', color: 'from-purple-500 to-purple-600' }
  ];

  const handleLockControlsClick = () => {
    navigate({ to: '/admin' });
    setTimeout(() => {
      const element = document.getElementById('lock-controls');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="container mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Header */}
      <div className="mb-8 text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent mb-3">
          Welcome to Class 8 (DOLON)
        </h1>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline" className="text-lg px-4 py-1">
            {roleDisplay}
          </Badge>
          {username && (
            <span className="text-gray-600">• {username}</span>
          )}
        </div>
      </div>

      {/* Admin-only Cards */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Pending Approvals */}
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Users className="w-5 h-5" />
                Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-orange-600 mb-4">{pendingCount}</div>
              <Button 
                onClick={() => navigate({ to: '/admin' })}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                View Applications
              </Button>
            </CardContent>
          </Card>

          {/* Lock Status Overview */}
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-indigo-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-700">
                <Shield className="w-5 h-5" />
                Lock Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Notices</span>
                  <LockIndicator isLocked={noticesLocked} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Homework</span>
                  <LockIndicator isLocked={homeworkLocked} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Routine</span>
                  <LockIndicator isLocked={routineLocked} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Class Time</span>
                  <LockIndicator isLocked={classTimeLocked} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Edit Shortcuts */}
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Shield className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                onClick={handleLockControlsClick}
                variant="outline"
                className="w-full justify-start"
              >
                <Lock className="w-4 h-4 mr-2" />
                Lock Controls
              </Button>
              <Button 
                onClick={() => navigate({ to: '/notices' })}
                variant="outline"
                className="w-full justify-start"
              >
                <Bell className="w-4 h-4 mr-2" />
                Manage Notices
              </Button>
              <Button 
                onClick={() => navigate({ to: '/schedule' })}
                variant="outline"
                className="w-full justify-start"
              >
                <Clock className="w-4 h-4 mr-2" />
                Manage Schedule
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Latest Notices Preview */}
      <Card className="shadow-lg mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-6 h-6 text-blue-600" />
              Latest Notices
            </CardTitle>
            <Button 
              variant="link" 
              onClick={() => navigate({ to: '/notices' })}
              className="text-blue-600"
            >
              View All →
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {latestAnnouncements.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No notices available</p>
          ) : (
            <div className="space-y-3">
              {latestAnnouncements.map((announcement) => (
                <div 
                  key={Number(announcement.id)} 
                  className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                  onClick={() => navigate({ to: '/notices' })}
                >
                  <h3 className="font-semibold text-gray-900 mb-1">{announcement.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{announcement.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(Number(announcement.timestamp) / 1000000).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Class Routine */}
      <Card className="shadow-lg mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-600" />
            Today's Class Routine ({today})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!todayRoutine ? (
            <p className="text-gray-500 text-center py-4">No routine available for today</p>
          ) : (
            <div className="space-y-2">
              {todayRoutine.periods.map((period) => (
                <div 
                  key={Number(period.periodNumber)} 
                  className="flex items-center justify-between p-3 bg-purple-50 rounded-lg"
                >
                  <div>
                    <span className="font-semibold text-purple-900">Period {Number(period.periodNumber)}</span>
                    <span className="text-gray-600 ml-3">{period.subject}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {period.startTime} - {period.endTime}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickAccessCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card 
              key={card.path}
              className="shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
              onClick={() => navigate({ to: card.path })}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${card.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Open {card.title} →
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
