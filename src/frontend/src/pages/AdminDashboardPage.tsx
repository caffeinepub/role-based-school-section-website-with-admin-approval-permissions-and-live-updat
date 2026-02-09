import { useState, useEffect } from 'react';
import { useGetAllApplications, useApproveApplication, useRejectApplication, usePromoteToEditor, useDemoteToStudent, useGetAnnouncements, useGetHomework, useGetRoutines, useGetClassTimes } from '../hooks/useQueries';
import { useSetMasterLock, useSetSectionLock, useSetItemLock, useGetMasterLock, useGetSectionLock, useGetItemLock } from '../hooks/useLocks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, UserCog, User, Lock, Unlock, Shield } from 'lucide-react';
import { toast } from 'sonner';
import LockIndicator from '../components/LockIndicator';

export default function AdminDashboardPage() {
  const { data: applications = [], isLoading } = useGetAllApplications();
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
          <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-red-600" />
                <div>
                  <Label htmlFor="master-lock" className="text-lg font-semibold text-red-900">
                    Master Lock
                  </Label>
                  <p className="text-sm text-red-700">Freeze all editing across the entire system</p>
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
          <div>
            <h3 className="text-lg font-semibold mb-4">Section Locks</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <LockIndicator isLocked={noticesLocked} />
                  <Label htmlFor="notices-lock">Notices</Label>
                </div>
                <Switch
                  id="notices-lock"
                  checked={noticesLocked}
                  onCheckedChange={(checked) => handleSectionLockToggle('notices', checked)}
                  disabled={setSectionLockMutation.isPending}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <LockIndicator isLocked={homeworkLocked} />
                  <Label htmlFor="homework-lock">Homework</Label>
                </div>
                <Switch
                  id="homework-lock"
                  checked={homeworkLocked}
                  onCheckedChange={(checked) => handleSectionLockToggle('homework', checked)}
                  disabled={setSectionLockMutation.isPending}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <LockIndicator isLocked={routineLocked} />
                  <Label htmlFor="routine-lock">Class Routine</Label>
                </div>
                <Switch
                  id="routine-lock"
                  checked={routineLocked}
                  onCheckedChange={(checked) => handleSectionLockToggle('routine', checked)}
                  disabled={setSectionLockMutation.isPending}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <LockIndicator isLocked={classTimeLocked} />
                  <Label htmlFor="classtime-lock">Class Time Schedule</Label>
                </div>
                <Switch
                  id="classtime-lock"
                  checked={classTimeLocked}
                  onCheckedChange={(checked) => handleSectionLockToggle('classTime', checked)}
                  disabled={setSectionLockMutation.isPending}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Item Locks */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Individual Item Locks</h3>
            
            {/* Notices Items */}
            {announcements.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-sm text-gray-700 mb-2">Notices ({announcements.length})</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {announcements.slice(0, 10).map((item) => {
                    const ItemLockStatus = () => {
                      const { data: isLocked = false } = useGetItemLock('notices', item.id);
                      return (
                        <div className="flex items-center justify-between p-2 bg-white rounded border">
                          <div className="flex items-center gap-2 flex-1">
                            <LockIndicator isLocked={isLocked} />
                            <span className="text-sm truncate">{item.title}</span>
                          </div>
                          <Switch
                            checked={isLocked}
                            onCheckedChange={() => handleItemLockToggle('notices', item.id, isLocked)}
                            disabled={setItemLockMutation.isPending}
                          />
                        </div>
                      );
                    };
                    return <ItemLockStatus key={Number(item.id)} />;
                  })}
                </div>
              </div>
            )}

            {/* Homework Items */}
            {homework.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-sm text-gray-700 mb-2">Homework ({homework.length})</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {homework.slice(0, 10).map((item) => {
                    const ItemLockStatus = () => {
                      const { data: isLocked = false } = useGetItemLock('homework', item.id);
                      return (
                        <div className="flex items-center justify-between p-2 bg-white rounded border">
                          <div className="flex items-center gap-2 flex-1">
                            <LockIndicator isLocked={isLocked} />
                            <span className="text-sm truncate">{item.title}</span>
                          </div>
                          <Switch
                            checked={isLocked}
                            onCheckedChange={() => handleItemLockToggle('homework', item.id, isLocked)}
                            disabled={setItemLockMutation.isPending}
                          />
                        </div>
                      );
                    };
                    return <ItemLockStatus key={Number(item.id)} />;
                  })}
                </div>
              </div>
            )}

            {/* Class Times Items */}
            {classTimes.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-sm text-gray-700 mb-2">Class Times ({classTimes.length})</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {classTimes.slice(0, 10).map((item) => {
                    const ItemLockStatus = () => {
                      const { data: isLocked = false } = useGetItemLock('classTime', item.id);
                      return (
                        <div className="flex items-center justify-between p-2 bg-white rounded border">
                          <div className="flex items-center gap-2 flex-1">
                            <LockIndicator isLocked={isLocked} />
                            <span className="text-sm truncate">{item.weekDay} - {item.subject}</span>
                          </div>
                          <Switch
                            checked={isLocked}
                            onCheckedChange={() => handleItemLockToggle('classTime', item.id, isLocked)}
                            disabled={setItemLockMutation.isPending}
                          />
                        </div>
                      );
                    };
                    return <ItemLockStatus key={Number(item.id)} />;
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Student Applications */}
      <Card className="shadow-lg mb-8">
        <CardHeader>
          <CardTitle>Student Applications</CardTitle>
          <CardDescription>
            Review and manage student access requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
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
                      <TableCell>
                        <Badge variant="outline">{app.username}</Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
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

      {/* User Management */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage editor permissions for approved students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p className="mb-4">Use the buttons below to manage user roles:</p>
            <div className="space-y-2 text-sm text-left max-w-md mx-auto">
              <p><UserCog className="inline w-4 h-4 mr-2" />Promote students to editors to allow content editing</p>
              <p><User className="inline w-4 h-4 mr-2" />Demote editors back to regular students</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
