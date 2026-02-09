import { useState } from 'react';
import { useGetHomework, useAddHomework, useUpdateHomework, useDeleteHomework } from '../hooks/useQueries';
import { useGetSectionLock, useGetItemLock } from '../hooks/useLocks';
import { useAuth } from '../auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, BookOpen, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import type { Homework } from '../backend';
import LockIndicator from '../components/LockIndicator';

export default function HomeworkPage() {
  const { data: homework = [], isLoading } = useGetHomework();
  const { data: sectionLocked = false } = useGetSectionLock('homework');
  const { canEdit } = useAuth();
  const addMutation = useAddHomework();
  const updateMutation = useUpdateHomework();
  const deleteMutation = useDeleteHomework();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingHomework, setEditingHomework] = useState<Homework | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    dueDate: '',
    subject: '',
    teacher: ''
  });

  const handleAdd = async () => {
    if (!formData.title || !formData.content || !formData.dueDate || !formData.subject || !formData.teacher) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await addMutation.mutateAsync(formData);
      toast.success('Homework added successfully');
      setIsAddOpen(false);
      setFormData({ title: '', content: '', dueDate: '', subject: '', teacher: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to add homework');
    }
  };

  const handleUpdate = async () => {
    if (!editingHomework || !formData.title || !formData.content || !formData.dueDate || !formData.subject || !formData.teacher) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: editingHomework.id,
        ...formData
      });
      toast.success('Homework updated successfully');
      setEditingHomework(null);
      setFormData({ title: '', content: '', dueDate: '', subject: '', teacher: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update homework');
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm('Are you sure you want to delete this homework?')) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Homework deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete homework');
    }
  };

  const openEditDialog = (hw: Homework) => {
    setEditingHomework(hw);
    setFormData({
      title: hw.title,
      content: hw.content,
      dueDate: hw.dueDate,
      subject: hw.subject,
      teacher: hw.teacher
    });
  };

  const sortedHomework = [...homework].sort((a, b) => Number(b.timestamp - a.timestamp));

  const HomeworkCard = ({ hw }: { hw: Homework }) => {
    const { data: itemLocked = false } = useGetItemLock('homework', hw.id);
    const isLocked = sectionLocked || itemLocked;

    return (
      <Card 
        className={`shadow-lg hover:shadow-xl transition-all duration-300 ${
          isLocked ? 'opacity-60 bg-gray-50' : ''
        }`}
      >
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-2xl">{hw.title}</CardTitle>
                {isLocked && <LockIndicator isLocked={true} />}
              </div>
              <CardDescription className="flex items-center gap-4 text-base">
                <span className="font-medium text-blue-600">{hw.subject}</span>
                <span>•</span>
                <span>{hw.teacher}</span>
              </CardDescription>
            </div>
            {canEdit && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditDialog(hw)}
                  disabled={isLocked}
                  title={isLocked ? 'This section is locked by admin.' : 'Edit homework'}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(hw.id)}
                  disabled={isLocked}
                  title={isLocked ? 'This section is locked by admin.' : 'Delete homework'}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Due: {hw.dueDate}</span>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{hw.content}</p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Homework Assignments</h1>
            <p className="text-gray-600">View and manage homework tasks</p>
          </div>
          <LockIndicator isLocked={sectionLocked} />
        </div>
        {canEdit && (
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                disabled={sectionLocked}
                title={sectionLocked ? 'This section is locked by admin.' : 'Add new homework'}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Homework
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Homework</DialogTitle>
                <DialogDescription>Create a new homework assignment</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Homework title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    placeholder="e.g., December 25, 2024"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Description</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Homework details and instructions"
                    rows={5}
                  />
                </div>
                <Button onClick={handleAdd} disabled={addMutation.isPending} className="w-full">
                  {addMutation.isPending ? 'Adding...' : 'Add Homework'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading homework...</div>
      ) : sortedHomework.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="text-center py-12">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No homework assignments</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedHomework.map((hw) => (
            <HomeworkCard key={Number(hw.id)} hw={hw} />
          ))}
        </div>
      )}

      {editingHomework && (
        <Dialog open={!!editingHomework} onOpenChange={() => setEditingHomework(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Homework</DialogTitle>
              <DialogDescription>Update homework assignment details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Homework title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-dueDate">Due Date</Label>
                <Input
                  id="edit-dueDate"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  placeholder="e.g., December 25, 2024"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-content">Description</Label>
                <Textarea
                  id="edit-content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Homework details and instructions"
                  rows={5}
                />
              </div>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending} className="w-full">
                {updateMutation.isPending ? 'Updating...' : 'Update Homework'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
