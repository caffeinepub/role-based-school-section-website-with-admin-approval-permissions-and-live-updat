import { useState, useEffect } from 'react';
import { useGetAllApplications, useApproveApplication, useRejectApplication, usePromoteToEditor, useDemoteToStudent, useGetApprovedStudents, useGetAnnouncements, useGetHomework, useGetRoutines, useGetClassTimes } from '../hooks/useQueries';
import { useSetMasterLock, useSetSectionLock, useSetItemLock, useGetMasterLock, useGetSectionLock, useGetItemLock } from '../hooks/useLocks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, UserCog, User, Lock, Unlock, Shield, AlertCircle, Users, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import LockIndicator from '../components/LockIndicator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getErrorMessage, isAuthorizationError } from '../utils/adminErrors';

export default function AdminDashboardPage() {
  const { 
    data: applications = [], 
    isLoading: applicationsLoading, 
    error: applicationsError,
    refetch: refetchApplications 
  } = useGetAllApplications();
  
  const { 
    data: approvedStudents = [], 
    isLoading: studentsLoading, 
    error: studentsError,
    refetch: refetchStudents 
  } = useGetApprovedStudents();
  
  const { data: announcements = [] } = useGetAnnouncements();
  const { data: homework = [] } = useGetHomework();
  const { data: routines = [] } = useGetRoutines();
  const { data: classTimes = [] } = useGetClassTimes();

  const approveMutation = useApproveApplication();
  const rejectMutation = useRejectApplication();
  const promoteMutation = usePromoteToEditor();
  const demoteMutation = useDemoteToStudent();

  const { data: masterLocked = false } = useGetMasterLock();
  const { data: noticesLocked = false } = useGetSectionLock('notices');
  const { data: homeworkLocked = false } = useGetSectionLock('homework');
  const { data: routineLocked = false } = useGetSectionLock('routine');
  const { data: classTimeLocked = false } = useGetSectionLock('classTime');

  const setMasterLockMutation = useSetMasterLock();
  const setSectionLockMutation = useSetSectionLock();
  const setItemLockMutation = useSetItemLock();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#lock-controls') {
      const element = document.getElementById('lock-controls');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  const handleApprove = async (username: string) => {
    try {
      await approveMutation.mutateAsync(username);
      toast.success(`Approved ${username}`);
    } catch (error: any) {
      const errorMsg = getErrorMessage(error);
      console.error('Approve error:', errorMsg);
      toast.error(`Failed to approve: ${errorMsg}`);
    }
  };

  const handleReject = async (username: string) => {
    try {
      await rejectMutation.mutateAsync(username);
      toast.success(`Rejected ${username}`);
    } catch (error: any) {
      const errorMsg = getErrorMessage(error);
      toast.error(`Failed to reject: ${errorMsg}`);
    }
  };

  const handlePromote = async (username: string) => {
    try {
      await promoteMutation.mutateAsync(username);
      toast.success(`Promoted ${username} to editor`);
    } catch (error: any) {
      const errorMsg = getErrorMessage(error);
      toast.error(`Failed to promote: ${errorMsg}`);
    }
  };

  const handleDemote = async (username: string) => {
    try {
      await demoteMutation.mutateAsync(username);
      toast.success(`Demoted ${username} to student`);
    } catch (error: any) {
      const errorMsg = getErrorMessage(error);
      toast.error(`Failed to demote: ${errorMsg}`);
    }
  };

  const handleMasterLockToggle = async (checked: boolean) => {
    try {
      await setMasterLockMutation.mutateAsync(checked);
      toast.success(checked ? 'Master lock enabled' : 'Master lock disabled');
    } catch (error: any) {
      const errorMsg = getErrorMessage(error);
      toast.error(`Failed to toggle master lock: ${errorMsg}`);
    }
  };

  const handleSectionLockToggle = async (section: string, checked: boolean) => {
    try {
      await setSectionLockMutation.mutateAsync({ section, state: checked });
      toast.success(`${section} section ${checked ? 'locked' : 'unlocked'}`);
    } catch (error: any) {
      const errorMsg = getErrorMessage(error);
      toast.error(`Failed to toggle ${section} lock: ${errorMsg}`);
    }
  };

  const handleItemLockToggle = async (section: string, itemId: bigint, currentState: boolean) => {
    try {
      await setItemLockMutation.mutateAsync({ section, itemId, state: !currentState });
      toast.success(`Item ${!currentState ? 'locked' : 'unlocked'}`);
    } catch (error: any) {
      const errorMsg = getErrorMessage(error);
      toast.error(`Failed to toggle item lock: ${errorMsg}`);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'studentEditor':
        return <Badge variant="default" className="bg-blue-600"><UserCog className="w-3 h-3 mr-1" />Editor</Badge>;
      case 'student':
        return <Badge variant="secondary"><User className="w-3 h-3 mr-1" />Student</Badge>;
      case 'admin':
        return <Badge variant="destructive"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const renderErrorAlert = (error: unknown, title: string, refetch?: () => void) => {
    const errorMsg = getErrorMessage(error);
    const isAuthError = isAuthorizationError(error);
    
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="font-semibold">
          {isAuthError ? 'Access Denied' : 'Error Loading Data'}
        </AlertTitle>
        <AlertDescription className="space-y-2">
          <p>
            {isAuthError 
              ? 'You need to be logged in as Admin to view this data.' 
              : 'Could not load data from the server.'}
          </p>
          <p className="text-sm opacity-90">Error: {errorMsg}</p>
          {refetch && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              className="mt-2"
            >
              <RefreshCw className="w-3 h-3 mr-2" />
              Retry
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage applications, students, and content locks</p>
          </div>
        </div>

        {/* Pending Applications */}
        <Card className="shadow-lg border-2 border-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-blue-600" />
                <div>
                  <CardTitle className="text-2xl">Pending Applications</CardTitle>
                  <CardDescription>Review and approve student applications</CardDescription>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetchApplications()}
                disabled={applicationsLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${applicationsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {applicationsError && renderErrorAlert(applicationsError, 'Applications', refetchApplications)}
            
            {applicationsLoading ? (
              <div className="text-center py-8 text-gray-500">Loading applications...</div>
            ) : applications.length === 0 && !applicationsError ? (
              <div className="text-center py-8 text-gray-500">No pending applications</div>
            ) : !applicationsError && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <TableRow key={app.username}>
                        <TableCell className="font-medium">{app.name}</TableCell>
                        <TableCell>{app.className}</TableCell>
                        <TableCell>{app.section}</TableCell>
                        <TableCell>{app.username}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApprove(app.username)}
                            disabled={approveMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(app.username)}
                            disabled={rejectMutation.isPending}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approved Students */}
        <Card className="shadow-lg border-2 border-green-100">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-green-600" />
                <div>
                  <CardTitle className="text-2xl">Approved Students</CardTitle>
                  <CardDescription>Manage student roles and permissions</CardDescription>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetchStudents()}
                disabled={studentsLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${studentsLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {studentsError && renderErrorAlert(studentsError, 'Students', refetchStudents)}
            
            {studentsLoading ? (
              <div className="text-center py-8 text-gray-500">Loading students...</div>
            ) : approvedStudents.length === 0 && !studentsError ? (
              <div className="text-center py-8 text-gray-500">No approved students yet</div>
            ) : !studentsError && (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedStudents.map((student) => (
                      <TableRow key={student.principal.toString()}>
                        <TableCell className="font-medium">{student.profile.name}</TableCell>
                        <TableCell>{student.profile.username}</TableCell>
                        <TableCell>{getRoleBadge(student.profile.role)}</TableCell>
                        <TableCell className="text-right">
                          {student.profile.role === 'student' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePromote(student.profile.username)}
                              disabled={promoteMutation.isPending}
                            >
                              <UserCog className="w-4 h-4 mr-1" />
                              Promote to Editor
                            </Button>
                          ) : student.profile.role === 'studentEditor' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDemote(student.profile.username)}
                              disabled={demoteMutation.isPending}
                            >
                              <User className="w-4 h-4 mr-1" />
                              Demote to Student
                            </Button>
                          ) : (
                            <Badge variant="secondary">Admin</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lock Controls */}
        <Card id="lock-controls" className="shadow-lg border-2 border-purple-100">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <div className="flex items-center gap-3">
              <Lock className="w-6 h-6 text-purple-600" />
              <div>
                <CardTitle className="text-2xl">Content Lock Controls</CardTitle>
                <CardDescription>Control editing permissions for different sections</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Master Lock */}
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-red-600" />
                  <div>
                    <Label htmlFor="master-lock" className="text-base font-semibold text-gray-900">
                      Master Lock
                    </Label>
                    <p className="text-sm text-gray-600">Locks all content editing across the entire application</p>
                  </div>
                </div>
                <Switch
                  id="master-lock"
                  checked={masterLocked}
                  onCheckedChange={handleMasterLockToggle}
                  disabled={setMasterLockMutation.isPending}
                />
              </div>
            </div>

            <Separator />

            {/* Section Locks */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Section Locks</h3>
              
              <div className="grid gap-4">
                {[
                  { id: 'notices', label: 'Notices', locked: noticesLocked },
                  { id: 'homework', label: 'Homework', locked: homeworkLocked },
                  { id: 'routine', label: 'Class Routine', locked: routineLocked },
                  { id: 'classTime', label: 'Class Time Schedule', locked: classTimeLocked }
                ].map((section) => (
                  <div key={section.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <LockIndicator isLocked={section.locked} />
                      <Label htmlFor={`${section.id}-lock`} className="font-medium">
                        {section.label}
                      </Label>
                    </div>
                    <Switch
                      id={`${section.id}-lock`}
                      checked={section.locked}
                      onCheckedChange={(checked) => handleSectionLockToggle(section.id, checked)}
                      disabled={setSectionLockMutation.isPending || masterLocked}
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Item Locks */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Individual Item Locks</h3>
              
              {/* Notices */}
              {announcements.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Notices</h4>
                  <div className="space-y-2">
                    {announcements.map((item) => (
                      <ItemLockControl
                        key={item.id.toString()}
                        section="notices"
                        itemId={item.id}
                        title={item.title}
                        onToggle={handleItemLockToggle}
                        disabled={setItemLockMutation.isPending || masterLocked || noticesLocked}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Homework */}
              {homework.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Homework</h4>
                  <div className="space-y-2">
                    {homework.map((item) => (
                      <ItemLockControl
                        key={item.id.toString()}
                        section="homework"
                        itemId={item.id}
                        title={item.title}
                        onToggle={handleItemLockToggle}
                        disabled={setItemLockMutation.isPending || masterLocked || homeworkLocked}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Routines */}
              {routines.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Class Routines</h4>
                  <div className="space-y-2">
                    {routines.map((item) => (
                      <ItemLockControl
                        key={item.id.toString()}
                        section="routine"
                        itemId={item.id}
                        title={`Routine #${item.id}`}
                        onToggle={handleItemLockToggle}
                        disabled={setItemLockMutation.isPending || masterLocked || routineLocked}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Class Times */}
              {classTimes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Class Times</h4>
                  <div className="space-y-2">
                    {classTimes.map((item) => (
                      <ItemLockControl
                        key={item.id.toString()}
                        section="classTime"
                        itemId={item.id}
                        title={`${item.weekDay} - ${item.subject}`}
                        onToggle={handleItemLockToggle}
                        disabled={setItemLockMutation.isPending || masterLocked || classTimeLocked}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ItemLockControl({
  section,
  itemId,
  title,
  onToggle,
  disabled
}: {
  section: string;
  itemId: bigint;
  title: string;
  onToggle: (section: string, itemId: bigint, currentState: boolean) => void;
  disabled: boolean;
}) {
  const { data: locked = false } = useGetItemLock(section, itemId);

  return (
    <div className="flex items-center justify-between p-2 bg-white rounded border">
      <div className="flex items-center gap-2">
        <LockIndicator isLocked={locked} />
        <span className="text-sm">{title}</span>
      </div>
      <Switch
        checked={locked}
        onCheckedChange={() => onToggle(section, itemId, locked)}
        disabled={disabled}
      />
    </div>
  );
}
