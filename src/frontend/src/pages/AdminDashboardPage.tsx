import { useState, useEffect } from 'react';
import { useGetAllApplications, useApproveApplication, useRejectApplication, usePromoteToEditor, useDemoteToStudent, useGetApprovedStudents, useGetAnnouncements, useGetHomework, useGetRoutines, useGetClassTimes } from '../hooks/useQueries';
import { useSetMasterLock, useSetSectionLock, useSetItemLock, useGetMasterLock, useGetSectionLocks, useGetItemLocksBySection } from '../hooks/useLocks';
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
import { getUserFacingMessage } from '../utils/adminErrors';

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

  // Lock state queries - independent queries for each lock level
  const { data: masterLocked = false } = useGetMasterLock();
  const { data: sectionLocks } = useGetSectionLocks();
  const { data: noticesItemLocks = [] } = useGetItemLocksBySection('notices');
  const { data: homeworkItemLocks = [] } = useGetItemLocksBySection('homework');
  const { data: routineItemLocks = [] } = useGetItemLocksBySection('routine');
  const { data: classTimeItemLocks = [] } = useGetItemLocksBySection('classTime');

  const setMasterLockMutation = useSetMasterLock();
  const setSectionLockMutation = useSetSectionLock();
  const setItemLockMutation = useSetItemLock();

  // Log errors to console for debugging
  useEffect(() => {
    if (applicationsError) {
      console.error('Pending Applications load failure:', applicationsError);
    }
  }, [applicationsError]);

  useEffect(() => {
    if (studentsError) {
      console.error('Approved Students load failure:', studentsError);
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
      console.error('Approve error:', error);
      toast.error('Failed to approve. Please try again.');
    }
  };

  const handleReject = async (username: string) => {
    try {
      await rejectMutation.mutateAsync(username);
      toast.success(`Rejected ${username}`);
    } catch (error: any) {
      console.error('Reject error:', error);
      toast.error('Failed to reject. Please try again.');
    }
  };

  const handlePromote = async (username: string) => {
    try {
      await promoteMutation.mutateAsync(username);
      toast.success(`Promoted ${username} to editor`);
    } catch (error: any) {
      console.error('Promote error:', error);
      toast.error('Failed to promote. Please try again.');
    }
  };

  const handleDemote = async (username: string) => {
    try {
      await demoteMutation.mutateAsync(username);
      toast.success(`Demoted ${username} to student`);
    } catch (error: any) {
      console.error('Demote error:', error);
      toast.error('Failed to demote. Please try again.');
    }
  };

  const handleMasterLockToggle = async (checked: boolean) => {
    try {
      await setMasterLockMutation.mutateAsync(checked);
      toast.success(checked ? 'Master lock enabled' : 'Master lock disabled');
    } catch (error: any) {
      console.error('Master lock toggle error:', error);
      toast.error('Failed to toggle master lock. Please try again.');
    }
  };

  const handleSectionLockToggle = async (section: string, checked: boolean) => {
    try {
      await setSectionLockMutation.mutateAsync({ section, state: checked });
      toast.success(`${section} section ${checked ? 'locked' : 'unlocked'}`);
    } catch (error: any) {
      console.error(`Section lock toggle error (${section}):`, error);
      toast.error(`Failed to toggle ${section} lock. Please try again.`);
    }
  };

  const handleItemLockToggle = async (section: string, itemId: bigint, currentState: boolean) => {
    try {
      await setItemLockMutation.mutateAsync({ section, itemId, state: !currentState });
      toast.success(`Item ${!currentState ? 'locked' : 'unlocked'}`);
    } catch (error: any) {
      console.error('Item lock toggle error:', error);
      toast.error('Failed to toggle item lock. Please try again.');
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

  const renderErrorAlert = (error: unknown, refetch?: () => void) => {
    const userMessage = getUserFacingMessage(error);
    
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="font-semibold">
          Error Loading Data
        </AlertTitle>
        <AlertDescription className="space-y-2">
          <p>{userMessage}</p>
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

  // Helper to check if an item is locked
  const isItemLocked = (section: string, itemId: bigint): boolean => {
    let itemLocks: Array<[bigint, boolean]> = [];
    switch (section) {
      case 'notices':
        itemLocks = noticesItemLocks;
        break;
      case 'homework':
        itemLocks = homeworkItemLocks;
        break;
      case 'routine':
        itemLocks = routineItemLocks;
        break;
      case 'classTime':
        itemLocks = classTimeItemLocks;
        break;
    }
    const lockEntry = itemLocks.find(([id]) => id === itemId);
    return lockEntry ? lockEntry[1] : false;
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
            {applicationsError ? (
              renderErrorAlert(applicationsError, refetchApplications)
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
            {studentsError ? (
              renderErrorAlert(studentsError, refetchStudents)
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
                <CardDescription>Manage editing permissions for different sections</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Master Lock */}
            <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border-2 border-red-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-red-600" />
                  <div>
                    <Label htmlFor="master-lock" className="text-lg font-semibold text-gray-900">
                      Master Lock
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      When enabled, all content editing is disabled for everyone except admins
                    </p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Notices Section */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="notices-lock" className="font-medium">Notices</Label>
                    <Switch
                      id="notices-lock"
                      checked={sectionLocks?.notices || false}
                      onCheckedChange={(checked) => handleSectionLockToggle('notices', checked)}
                      disabled={setSectionLockMutation.isPending}
                    />
                  </div>
                  <LockIndicator isLocked={sectionLocks?.notices || false} />
                </div>

                {/* Homework Section */}
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="homework-lock" className="font-medium">Homework</Label>
                    <Switch
                      id="homework-lock"
                      checked={sectionLocks?.homework || false}
                      onCheckedChange={(checked) => handleSectionLockToggle('homework', checked)}
                      disabled={setSectionLockMutation.isPending}
                    />
                  </div>
                  <LockIndicator isLocked={sectionLocks?.homework || false} />
                </div>

                {/* Routine Section */}
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="routine-lock" className="font-medium">Class Routine</Label>
                    <Switch
                      id="routine-lock"
                      checked={sectionLocks?.routine || false}
                      onCheckedChange={(checked) => handleSectionLockToggle('routine', checked)}
                      disabled={setSectionLockMutation.isPending}
                    />
                  </div>
                  <LockIndicator isLocked={sectionLocks?.routine || false} />
                </div>

                {/* Class Time Section */}
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="classTime-lock" className="font-medium">Class Time Schedule</Label>
                    <Switch
                      id="classTime-lock"
                      checked={sectionLocks?.classTime || false}
                      onCheckedChange={(checked) => handleSectionLockToggle('classTime', checked)}
                      disabled={setSectionLockMutation.isPending}
                    />
                  </div>
                  <LockIndicator isLocked={sectionLocks?.classTime || false} />
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
                  <h4 className="font-medium text-gray-700">Notices</h4>
                  <div className="space-y-2">
                    {announcements.map((notice) => (
                      <div key={notice.id.toString()} className="flex items-center justify-between p-3 bg-white rounded border">
                        <span className="text-sm">{notice.title}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleItemLockToggle('notices', notice.id, isItemLocked('notices', notice.id))}
                          disabled={setItemLockMutation.isPending}
                        >
                          {isItemLocked('notices', notice.id) ? (
                            <><Unlock className="w-3 h-3 mr-1" />Unlock</>
                          ) : (
                            <><Lock className="w-3 h-3 mr-1" />Lock</>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Homework Items */}
              {homework.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Homework</h4>
                  <div className="space-y-2">
                    {homework.map((hw) => (
                      <div key={hw.id.toString()} className="flex items-center justify-between p-3 bg-white rounded border">
                        <span className="text-sm">{hw.title}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleItemLockToggle('homework', hw.id, isItemLocked('homework', hw.id))}
                          disabled={setItemLockMutation.isPending}
                        >
                          {isItemLocked('homework', hw.id) ? (
                            <><Unlock className="w-3 h-3 mr-1" />Unlock</>
                          ) : (
                            <><Lock className="w-3 h-3 mr-1" />Lock</>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Routine Items */}
              {routines.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Class Routines</h4>
                  <div className="space-y-2">
                    {routines.map((routine) => (
                      <div key={routine.id.toString()} className="flex items-center justify-between p-3 bg-white rounded border">
                        <span className="text-sm">Routine #{routine.id.toString()}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleItemLockToggle('routine', routine.id, isItemLocked('routine', routine.id))}
                          disabled={setItemLockMutation.isPending}
                        >
                          {isItemLocked('routine', routine.id) ? (
                            <><Unlock className="w-3 h-3 mr-1" />Unlock</>
                          ) : (
                            <><Lock className="w-3 h-3 mr-1" />Lock</>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Class Time Items */}
              {classTimes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Class Times</h4>
                  <div className="space-y-2">
                    {classTimes.map((ct) => (
                      <div key={ct.id.toString()} className="flex items-center justify-between p-3 bg-white rounded border">
                        <span className="text-sm">{ct.weekDay} - {ct.subject}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleItemLockToggle('classTime', ct.id, isItemLocked('classTime', ct.id))}
                          disabled={setItemLockMutation.isPending}
                        >
                          {isItemLocked('classTime', ct.id) ? (
                            <><Unlock className="w-3 h-3 mr-1" />Unlock</>
                          ) : (
                            <><Lock className="w-3 h-3 mr-1" />Lock</>
                          )}
                        </Button>
                      </div>
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
