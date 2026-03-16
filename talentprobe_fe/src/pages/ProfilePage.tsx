import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UAEFlagStrip } from '@/components/UAEFlag';
import { ProfileSection } from '@/components/ProfileSection';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm shadow-brand-sm">
        <UAEFlagStrip className="rounded-none h-1.5" />
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-5 py-3">
          <div className="flex items-center gap-3">
            <img src="/welkdock_logo.png" alt="Welkdock Technologies logo" className="h-9 w-9 rounded-lg object-contain" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-foreground leading-none">Talent Probe Profile</span>
                <span className="inline-flex items-center gap-0.5 rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-semibold text-foreground uppercase tracking-wide">
                  UAE
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">by Welkdock Technologies</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-1.5 text-muted-foreground hover:text-destructive hover:border-destructive"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 sm:px-5 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Candidate Profile & Resume Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your candidate details and up to five resumes used by ATS and optimization tools.
          </p>
        </div>

        <ProfileSection />
      </main>
    </div>
  );
}
