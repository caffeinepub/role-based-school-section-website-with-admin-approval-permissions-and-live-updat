import { useState } from 'react';
import { useGetClassTimes, useAddClassTime, useUpdateClassTime, useDeleteClassTime } from '../hooks/useQueries';
import { useGetSectionLock, useGetItemLock } from '../hooks/useLocks';
import { useAuth } from '../auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import type { ClassTime } from '../backend';
import LockIndicator from '../components/LockIndicator';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ClassTimeSchedulePage() {
  const { data: classTimes = [], isLoading } = useGetClassTimes();
  const { data: sectionLocked = false } = useGetSectionLock('classTime');
  const { canEdit } = useAuth();
  const addMutation = useAddClassTime();
  const updateMutation = useUpdateClassTime();
  const deleteMutation = useDeleteClassTime();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingClassTime, setEditingClassTime] = useState<ClassTime | null>(null);
  const [formData, setFormData] = useState({
    weekDay: '',
    startTime: '',
    endTime: '',
    subject: '',
    teacher: ''
  });

  const handleAdd = async () => {
    if (!formData.weekDay || !formData.startTime || !formData.endTime || !formData.subject || !formData.teacher) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await addMutation.mutateAsync(formData);
      toast.success('Class time added successfully');
      setIsAddOpen(false);
      setFormData({ weekDay: '', startTime: '', endTime: '', subject: '', teacher: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to add class time');
    }
  };

  const handleUpdate = async () => {
    if (!editingClassTime || !formData.weekDay || !formData.startTime || !formData.endTime || !formData.subject || !formData.teacher) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: editingClassTime.id,
        ...formData
      });
      toast.success('Class time updated successfully');
      setEditingClassTime(null);
      setFormData({ weekDay: '', startTime: '', endTime: '', subject: '', teacher: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update class time');
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm('Are you sure you want to delete this class time?')) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Class time deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete class time');
    }
  };

  const openEditDialog = (ct: ClassTime) => {
    setEditingClassTime(ct);
    setFormData({
      weekDay: ct.weekDay,
      startTime: ct.startTime,
      endTime: ct.endTime,
      subject: ct.subject,
      teacher: ct.teacher
    });
  };

  const groupedByDay = WEEKDAYS.map(day => ({
    day,
    times: classTimes.filter(ct => ct.weekDay === day).sort((a, b) => a.startTime.localeCompare(b.startTime))
  }));

  const ClassTimeItem = ({ ct }: { ct: ClassTime }) => {
    const { data: itemLocked = false } = useGetItemLock('classTime', ct.id);
    const isLocked = sectionLocked || itemLocked;

    return (
      <div 
        className={`p-4 bg-white rounded-lg border-2 hover:border-blue-300 transition-all duration-300 ${
          isLocked ? 'opacity-60 bg-gray-50 border-gray-200' : 'border-gray-200'
        }`}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg text-blue-700">{ct.subject}</h3>
              {isLocked && <LockIndicator isLocked={true} />}
            </div>
            <p className="text-sm text-gray-600 mb-1">{ct.teacher}</p>
            <p className="text-sm text-gray-500">
              <Clock className="inline w-4 h-4 mr-1" />
              {ct.startTime} - {ct.endTime}
            </p>
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => openEditDialog(ct)}
                disabled={isLocked}
                title={isLocked ? 'This section is locked by admin.' : 'Edit class time'}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(ct.id)}
                disabled={isLocked}
                title={isLocked ? 'This section is locked by admin.' : 'Delete class time'}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Class Time Schedule</h1>
            <p className="text-gray-600">Daily class schedule organized by day</p>
          </div>
          <LockIndicator isLocked={sectionLocked} />
        </div>
        {canEdit && (
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                disabled={sectionLocked}
                title={sectionLocked ? 'This section is locked by admin.' : 'Add new class time'}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Class Time
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Class Time</DialogTitle>
                <DialogDescription>Create a new class session</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="weekDay">Day of Week</Label>
                  <Select value={formData.weekDay} onValueChange={(value) => setFormData({ ...formData, weekDay: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {WEEKDAYS.map(day => (
                        <SelectItem key={day} value={day}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      placeholder="e.g., 09:00 AM"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input
                      id="endTime"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      placeholder="e.g., 10:00 AM"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., Mathematics"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher">Teacher</Label>
                  <Input
                    id="teacher"
                    value={formData.teacher}
                    onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                    placeholder="Teacher name"
                  />
                </div>
                <Button onClick={handleAdd} disabled={addMutation.isPending} className="w-full">
                  {addMutation.isPending ? 'Adding...' : 'Add Class Time'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading schedule...</div>
      ) : classTimes.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="text-center py-12">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No class times scheduled</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedByDay.map(({ day, times }) => (
            times.length > 0 && (
              <Card key={day} className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl text-orange-700">{day}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {times.map((ct) => (
                      <ClassTimeItem key={Number(ct.id)} ct={ct} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          ))}
        </div>
      )}

      {editingClassTime && (
        <Dialog open={!!editingClassTime} onOpenChange={() => setEditingClassTime(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Class Time</DialogTitle>
              <DialogDescription>Update class session details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-weekDay">Day of Week</Label>
                <Select value={formData.weekDay} onValueChange={(value) => setFormData({ ...formData, weekDay: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {WEEKDAYS.map(day => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-startTime">Start Time</Label>
                  <Input
                    id="edit-startTime"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    placeholder="e.g., 09:00 AM"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-endTime">End Time</Label>
                  <Input
                    id="edit-endTime"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    placeholder="e.g., 10:00 AM"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-subject">Subject</Label>
                <Input
                  id="edit-subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., Mathematics"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-teacher">Teacher</Label>
                <Input
                  id="edit-teacher"
                  value={formData.teacher}
                  onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                  placeholder="Teacher name"
                />
              </div>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending} className="w-full">
                {updateMutation.isPending ? 'Updating...' : 'Update Class Time'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
