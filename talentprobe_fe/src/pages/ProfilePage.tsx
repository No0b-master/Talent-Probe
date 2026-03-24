import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CommonHeader } from '@/components/CommonHeader';
import { ProfileSection } from '@/components/ProfileSection';
import { CommonFooter } from '@/components/CommonFooter';


export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <CommonHeader showProfileButton={false} />

      <main className="mx-auto max-w-7xl px-3 sm:px-5 py-8 space-y-6">
        <div>
          <Button asChild variant="outline" size="sm" className="mb-4 gap-1.5">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Candidate Profile & Resume Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your candidate details and up to five resumes used by ATS and optimization tools.
          </p>
        </div>

        <ProfileSection />
      </main>
      <CommonFooter />
    </div>
  );
}
