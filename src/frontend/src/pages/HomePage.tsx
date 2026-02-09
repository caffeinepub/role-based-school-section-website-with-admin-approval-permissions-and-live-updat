import { useAuth } from '../auth/AuthContext';
import { useGetAnnouncements, useGetRoutines, useGetAllApplications } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Calendar, BookOpen, Clock, Users, Lock, Shield } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

export default function HomePage() {
  const { username, sessionRole, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { data: announcements = [] } = useGetAnnouncements();
  const { data: routines = [] } = useGetRoutines();
  
  // Only fetch applications if user is admin
  const { data: applications = [] } = useGetAllApplications({ 
    enabled: isAdmin 
  });

  // Handle hash navigation on mount
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const elementId = hash.substring(1);
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  const latestAnnouncements = announcements.slice(0, 3);
  const todayRoutine = routines[0];
  const pendingCount = applications.length;

  const getRoleDisplay = () => {
    switch (sessionRole) {
      case 'admin':
        return 'Administrator';
      case 'studentEditor':
        return 'Student Editor';
      case 'student':
        return 'Student';
      case 'visitor':
        return 'Visitor';
      default:
        return 'Guest';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {username || 'Guest'}!</h1>
          <p className="text-blue-100 text-lg">Role: {getRoleDisplay()}</p>
        </div>

        {/* Admin-only sections */}
        {isAdmin && (
          <>
            {/* Pending Approvals Card */}
            {pendingCount > 0 && (
              <Card className="shadow-lg border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-orange-600" />
                    <div>
                      <CardTitle className="text-2xl text-orange-900">Pending Approvals</CardTitle>
                      <CardDescription className="text-orange-700">
                        {pendingCount} student application{pendingCount !== 1 ? 's' : ''} waiting for review
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate({ to: '/admin' })}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Review Applications
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Admin Quick Actions */}
            <Card className="shadow-lg border-2 border-purple-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-purple-600" />
                  <div>
                    <CardTitle className="text-2xl">Admin Quick Actions</CardTitle>
                    <CardDescription>Manage your school portal</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col items-start gap-2"
                    onClick={() => navigate({ to: '/admin', hash: 'lock-controls' })}
                  >
                    <Lock className="w-5 h-5 text-purple-600" />
                    <div className="text-left">
                      <div className="font-semibold">Lock Controls</div>
                      <div className="text-xs text-gray-600">Manage content editing permissions</div>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-4 flex flex-col items-start gap-2"
                    onClick={() => navigate({ to: '/admin' })}
                  >
                    <Users className="w-5 h-5 text-blue-600" />
                    <div className="text-left">
                      <div className="font-semibold">Manage Students</div>
                      <div className="text-xs text-gray-600">View and manage student roles</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Latest Announcements */}
        <Card className="shadow-lg border-2 border-blue-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-blue-600" />
              <div>
                <CardTitle className="text-2xl">Latest Announcements</CardTitle>
                <CardDescription>Stay updated with recent notices</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {latestAnnouncements.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No announcements yet</p>
            ) : (
              <div className="space-y-4">
                {latestAnnouncements.map((announcement) => (
                  <div key={announcement.id.toString()} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-lg text-gray-900">{announcement.title}</h3>
                    <p className="text-gray-700 mt-2">{announcement.content}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(Number(announcement.timestamp) / 1000000).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate({ to: '/notices' })}
                >
                  View All Notices
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Routine */}
        <Card className="shadow-lg border-2 border-green-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-green-600" />
              <div>
                <CardTitle className="text-2xl">Today's Routine</CardTitle>
                <CardDescription>Your class schedule for today</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!todayRoutine ? (
              <p className="text-gray-500 text-center py-4">No routine available</p>
            ) : (
              <div className="space-y-2">
                {todayRoutine.routines[0]?.periods.slice(0, 3).map((period) => (
                  <div key={period.periodNumber.toString()} className="p-3 bg-green-50 rounded-lg border border-green-200 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">{period.subject}</p>
                      <p className="text-sm text-gray-600">{period.teacher}</p>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <p>{period.startTime} - {period.endTime}</p>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate({ to: '/routine' })}
                >
                  View Full Routine
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-2 border-purple-200" onClick={() => navigate({ to: '/homework' })}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-purple-600" />
                <CardTitle>Homework</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">View and manage homework assignments</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-2 border-orange-200" onClick={() => navigate({ to: '/schedule' })}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-orange-600" />
                <CardTitle>Class Schedule</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Check your class timings</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer border-2 border-blue-200" onClick={() => navigate({ to: '/notices' })}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-blue-600" />
                <CardTitle>All Notices</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Browse all announcements</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
