import { useEffect, useState } from 'react';
import { useUserProfile, useUpdateProfile } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function PatientSettings() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useUserProfile();
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setEmail(profile.email || '');
      setPhone(profile.phone || '');
      setAvatar(profile.avatar || '');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile.mutateAsync({ name, email, phone, avatar });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="mb-2">
        <Button variant="ghost" onClick={() => navigate('/patient')}>← Back to Dashboard</Button>
      </div>

      <Card className="medical-card">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6 max-w-xl">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading || updateProfile.isPending} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading || updateProfile.isPending} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isLoading || updateProfile.isPending} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input id="avatar" value={avatar} onChange={(e) => setAvatar(e.target.value)} disabled={isLoading || updateProfile.isPending} />
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="hero-gradient text-white" disabled={isLoading || updateProfile.isPending}>
                {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/patient/profile')} disabled={updateProfile.isPending}>
                View Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


