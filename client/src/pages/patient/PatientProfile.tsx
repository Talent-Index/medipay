import { useUserProfile } from '@/hooks/useApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function PatientProfile() {
  const navigate = useNavigate();
  const { data: profile, isLoading, error } = useUserProfile();

  const initials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    const first = parts[0]?.[0] || '';
    const second = parts[1]?.[0] || '';
    return (first + second || first || 'U').toUpperCase();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/patient')}>← Back to Dashboard</Button>
      </div>

      <Card className="medical-card">
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
          <CardDescription>View and manage your account information</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <div>Loading profile...</div>}
          {error && <div className="text-destructive">Failed to load profile.</div>}
          {profile && (
            <div className="flex items-start gap-6">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.avatar || ''} alt={profile.name} />
                <AvatarFallback>{initials(profile.name)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="text-xl font-semibold">{profile.name}</div>
                <div className="text-muted-foreground">{profile.email}</div>
                <div className="text-sm text-muted-foreground">Role: {profile.role?.toLowerCase?.() || 'patient'}</div>
                <div className="text-sm font-mono break-all">Address: {profile.address}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


