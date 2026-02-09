import { useState } from 'react';
import { useGetAnnouncements, useAddAnnouncement, useUpdateAnnouncement, useDeleteAnnouncement } from '../hooks/useQueries';
import { useGetSectionLock, useGetItemLock } from '../hooks/useLocks';
import { useAuth } from '../auth/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2, Bell } from 'lucide-react';
import { toast } from 'sonner';
import type { Announcement } from '../backend';
import LockIndicator from '../components/LockIndicator';

export default function NoticesPage() {
  const { data: announcements = [], isLoading } = useGetAnnouncements();
  const { data: sectionLocked = false } = useGetSectionLock('notices');
  const { canEdit } = useAuth();
  const addMutation = useAddAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '' });

  const handleAdd = async () => {
    if (!formData.title || !formData.content) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await addMutation.mutateAsync(formData);
      toast.success('Notice added successfully');
      setIsAddOpen(false);
      setFormData({ title: '', content: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to add notice');
    }
  };

  const handleUpdate = async () => {
    if (!editingAnnouncement || !formData.title || !formData.content) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: editingAnnouncement.id,
        title: formData.title,
        content: formData.content
      });
      toast.success('Notice updated successfully');
      setEditingAnnouncement(null);
      setFormData({ title: '', content: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update notice');
    }
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Notice deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete notice');
    }
  };

  const openEditDialog = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({ title: announcement.title, content: announcement.content });
  };

  const sortedAnnouncements = [...announcements].sort((a, b) => Number(b.timestamp - a.timestamp));

  const AnnouncementCard = ({ announcement }: { announcement: Announcement }) => {
    const { data: itemLocked = false } = useGetItemLock('notices', announcement.id);
    const isLocked = sectionLocked || itemLocked;

    return (
      <Card 
        key={Number(announcement.id)} 
        className={`shadow-lg hover:shadow-xl transition-all duration-300 ${
          isLocked ? 'opacity-60 bg-gray-50' : ''
        }`}
      >
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-2xl">{announcement.title}</CardTitle>
                {isLocked && <LockIndicator isLocked={true} />}
              </div>
              <p className="text-sm text-gray-500">
                {new Date(Number(announcement.timestamp) / 1000000).toLocaleDateString()}
              </p>
            </div>
            {canEdit && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditDialog(announcement)}
                  disabled={isLocked}
                  title={isLocked ? 'This section is locked by admin.' : 'Edit notice'}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(announcement.id)}
                  disabled={isLocked}
                  title={isLocked ? 'This section is locked by admin.' : 'Delete notice'}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Notices & Announcements</h1>
            <p className="text-gray-600">Stay updated with the latest school news</p>
          </div>
          <LockIndicator isLocked={sectionLocked} />
        </div>
        {canEdit && (
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                disabled={sectionLocked}
                title={sectionLocked ? 'This section is locked by admin.' : 'Add new notice'}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Notice
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Notice</DialogTitle>
                <DialogDescription>Create a new announcement for students and visitors</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter notice title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Enter notice content"
                    rows={5}
                  />
                </div>
                <Button onClick={handleAdd} disabled={addMutation.isPending} className="w-full">
                  {addMutation.isPending ? 'Adding...' : 'Add Notice'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading notices...</div>
      ) : sortedAnnouncements.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="text-center py-12">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No notices available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedAnnouncements.map((announcement) => (
            <AnnouncementCard key={Number(announcement.id)} announcement={announcement} />
          ))}
        </div>
      )}

      {editingAnnouncement && (
        <Dialog open={!!editingAnnouncement} onOpenChange={() => setEditingAnnouncement(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Notice</DialogTitle>
              <DialogDescription>Update the announcement details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter notice title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-content">Content</Label>
                <Textarea
                  id="edit-content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter notice content"
                  rows={5}
                />
              </div>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending} className="w-full">
                {updateMutation.isPending ? 'Updating...' : 'Update Notice'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
