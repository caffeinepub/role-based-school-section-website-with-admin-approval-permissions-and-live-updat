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
import { CheckCircle, XCircle, UserCog, User, Lock, Unlock, Shield, AlertCircle, Users } from 'lucide-react';
import { toast } from 'sonner';
import LockIndicator from '../components/LockIndicator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getErrorMessage, isAuthorizationError } from '../utils/adminErrors';

export default function AdminDashboardPage() {
  const { data: applications = [], isLoading: applicationsLoading, error: applicationsError } = useGetAllApplications();
  const { data: approvedStudents = [], isLoading: studentsLoading, error: studentsError } = useGetApprovedStudents();
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

  // Log errors for debugging
  useEffect(() => {
    if (applicationsError) {
      console.error('Applications query error:', applicationsError);
    }
  }, [applicationsError]);

  useEffect(() => {
    if (studentsError) {
      console.error('Students query error:', studentsError);
    }
  }, [studentsError]);

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
      toast.error(error.message || 'Failed to approve application');
    }
  };

  const handleReject = async (username: string) => {
    try {
      await rejectMutation.mutateAsync(username);
      toast.success(`Rejected ${username}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject application');
    }
  };

  const handlePromote = async (username: string) => {
    try {
      await promoteMutation.mutateAsync(username);
      toast.success(`Promoted ${username} to editor`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to promote user');
    }
  };

  const handleDemote = async (username: string) => {
    try {
      await demoteMutation.mutateAsync(username);
      toast.success(`Demoted ${username} to student`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to demote user');
    }
  };

  const handleMasterLockToggle = async (checked: boolean) => {
    try {
      await setMasterLockMutation.mutateAsync(checked);
      toast.success(checked ? 'Master lock enabled' : 'Master lock disabled');
    } catch (error: any) {
      toast.error(error.message || 'Failed to toggle master lock');
    }
  };

  const handleSectionLockToggle = async (section: string, checked: boolean) => {
    try {
      await setSectionLockMutation.mutateAsync({ section, state: checked });
      toast.success(`${section} section ${checked ? 'locked' : 'unlocked'}`);
    } catch (error: any) {
      toast.error(error.message || `Failed to toggle ${section} lock`);
    }
  };

  const handleItemLockToggle = async (section: string, itemId: bigint, currentState: boolean) => {
    try {
      await setItemLockMutation.mutateAsync({ section, itemId, state: !currentState });
      toast.success(`Item ${!currentState ? 'locked' : 'unlocked'}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to toggle item lock');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive">Admin</Badge>;
      case 'studentEditor':
        return <Badge variant="secondary">Editor</Badge>;
      case 'student':
        return <Badge variant="outline">Student</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  // Helper to render error alerts
  const renderErrorAlert = (error: unknown) => {
    const isAuthError = isAuthorizationError(error);
    const errorMessage = getErrorMessage(error);

    if (isAuthError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to view this section. Only administrators can access this data.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Could not load data</AlertTitle>
        <AlertDescription>
          {errorMessage}
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage student applications, permissions, and content locks</p>
      </div>

      {/* Lock Control Dashboard */}
      <Card className="shadow-lg mb-8" id="lock-controls">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600" />
            Lock Control Dashboard
          </CardTitle>
          <CardDescription>
            Control editing permissions for sections and individual items
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master Lock */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border-2 border-red-200">
            <div className="flex items-center gap-3">
              <Lock className="w-6 h-6 text-red-600" />
              <div>
                <Label htmlFor="master-lock" className="text-base font-semibold text-gray-900">
                  Master Lock
                </Label>
                <p className="text-sm text-gray-600">Lock all editing across the entire application</p>
              </div>
            </div>
            <Switch
              id="master-lock"
              checked={masterLocked}
              onCheckedChange={handleMasterLockToggle}
            />
          </div>

          <Separator />

          {/* Section Locks */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Section Locks</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <LockIndicator isLocked={noticesLocked} />
                  <Label htmlFor="notices-lock" className="font-medium">Notices</Label>
                </div>
                <Switch
                  id="notices-lock"
                  checked={noticesLocked}
                  onCheckedChange={(checked) => handleSectionLockToggle('notices', checked)}
                  disabled={masterLocked}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <LockIndicator isLocked={homeworkLocked} />
                  <Label htmlFor="homework-lock" className="font-medium">Homework</Label>
                </div>
                <Switch
                  id="homework-lock"
                  checked={homeworkLocked}
                  onCheckedChange={(checked) => handleSectionLockToggle('homework', checked)}
                  disabled={masterLocked}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <LockIndicator isLocked={routineLocked} />
                  <Label htmlFor="routine-lock" className="font-medium">Class Routine</Label>
                </div>
                <Switch
                  id="routine-lock"
                  checked={routineLocked}
                  onCheckedChange={(checked) => handleSectionLockToggle('routine', checked)}
                  disabled={masterLocked}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <LockIndicator isLocked={classTimeLocked} />
                  <Label htmlFor="classTime-lock" className="font-medium">Class Schedule</Label>
                </div>
                <Switch
                  id="classTime-lock"
                  checked={classTimeLocked}
                  onCheckedChange={(checked) => handleSectionLockToggle('classTime', checked)}
                  disabled={masterLocked}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Item-Level Locks */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Item-Level Locks</h3>
            
            {/* Notices Items */}
            {announcements.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Notices</h4>
                <div className="space-y-2">
                  {announcements.map((announcement) => (
                    <ItemLockRow
                      key={announcement.id.toString()}
                      section="notices"
                      itemId={announcement.id}
                      title={announcement.title}
                      onToggle={handleItemLockToggle}
                      disabled={masterLocked || noticesLocked}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Homework Items */}
            {homework.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Homework</h4>
                <div className="space-y-2">
                  {homework.map((hw) => (
                    <ItemLockRow
                      key={hw.id.toString()}
                      section="homework"
                      itemId={hw.id}
                      title={hw.title}
                      onToggle={handleItemLockToggle}
                      disabled={masterLocked || homeworkLocked}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Routine Items */}
            {routines.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Class Routines</h4>
                <div className="space-y-2">
                  {routines.map((routine) => (
                    <ItemLockRow
                      key={routine.id.toString()}
                      section="routine"
                      itemId={routine.id}
                      title={`Routine #${routine.id}`}
                      onToggle={handleItemLockToggle}
                      disabled={masterLocked || routineLocked}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Class Time Items */}
            {classTimes.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Class Schedule</h4>
                <div className="space-y-2">
                  {classTimes.map((classTime) => (
                    <ItemLockRow
                      key={classTime.id.toString()}
                      section="classTime"
                      itemId={classTime.id}
                      title={`${classTime.weekDay} - ${classTime.subject}`}
                      onToggle={handleItemLockToggle}
                      disabled={masterLocked || classTimeLocked}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Applications */}
      <Card className="shadow-lg mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600" />
            Pending Applications
          </CardTitle>
          <CardDescription>Review and approve student applications</CardDescription>
        </CardHeader>
        <CardContent>
          {applicationsError ? (
            renderErrorAlert(applicationsError)
          ) : applicationsLoading ? (
            <div className="text-center py-8 text-gray-500">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No pending applications</div>
          ) : (
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
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6 text-green-600" />
            Approved Students
          </CardTitle>
          <CardDescription>Manage roles and permissions for approved students</CardDescription>
        </CardHeader>
        <CardContent>
          {studentsError ? (
            renderErrorAlert(studentsError)
          ) : studentsLoading ? (
            <div className="text-center py-8 text-gray-500">Loading students...</div>
          ) : approvedStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No approved students yet</div>
          ) : (
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
                      <TableCell className="text-right space-x-2">
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
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for item lock rows
function ItemLockRow({
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
  const { data: isLocked = false } = useGetItemLock(section, itemId);

  return (
    <div className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
      <div className="flex items-center gap-2">
        <LockIndicator isLocked={isLocked} />
        <span className="text-sm text-gray-700">{title}</span>
      </div>
      <Switch
        checked={isLocked}
        onCheckedChange={() => onToggle(section, itemId, isLocked)}
        disabled={disabled}
      />
    </div>
  );
}
