import { useEffect, useState } from 'react';
import { Download, Eye, Trash2 } from 'lucide-react';

import { api, type CandidateProfile, type CandidateProfileUpdatePayload, type ResumeLibraryItem } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProfileFormState {
  full_name: string;
  dob: string;
  current_organization: string;
  current_role: string;
  experience_years: string;
  linkedin_url: string;
  github_url: string;
  twitter_url: string;
}

function isValidOptionalUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function toForm(profile: CandidateProfile): ProfileFormState {
  return {
    full_name: profile.full_name ?? '',
    dob: profile.dob ?? '',
    current_organization: profile.current_organization ?? '',
    current_role: profile.current_role ?? '',
    experience_years:
      profile.experience_years !== null && profile.experience_years !== undefined
        ? String(profile.experience_years)
        : '',
    linkedin_url: profile.linkedin_url ?? '',
    github_url: profile.github_url ?? '',
    twitter_url: profile.twitter_url ?? '',
  };
}

function ensureFileExtension(fileName: string, fileType: string): string {
  const trimmed = fileName.trim();
  const extension = fileType.trim().toLowerCase();
  if (!trimmed || !extension) {
    return trimmed || 'resume';
  }

  return trimmed.toLowerCase().endsWith(`.${extension}`) ? trimmed : `${trimmed}.${extension}`;
}

export function ProfileSection() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    full_name: '',
    dob: '',
    current_organization: '',
    current_role: '',
    experience_years: '',
    linkedin_url: '',
    github_url: '',
    twitter_url: '',
  });
  const [resumes, setResumes] = useState<ResumeLibraryItem[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [profileRes, resumesRes] = await Promise.all([api.profile.get(), api.resumes.list()]);
        if (profileRes.success) {
          setProfileForm(toForm(profileRes.data));
        }
        if (resumesRes.success) {
          setResumes(resumesRes.data);
        }
      } catch (err: unknown) {
        toast({
          title: 'Unable to load profile',
          description: err instanceof Error ? err.message : 'Please refresh and try again',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const setField = (key: keyof ProfileFormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileForm(prev => ({ ...prev, [key]: e.target.value }));
  };

  const handleSaveProfile = async (ev: React.FormEvent) => {
    ev.preventDefault();

    if (!profileForm.full_name.trim()) {
      toast({
        title: 'Name is required',
        description: 'Please provide your full name before saving.',
        variant: 'destructive',
      });
      return;
    }

    if (!isValidOptionalUrl(profileForm.linkedin_url)) {
      toast({
        title: 'Invalid LinkedIn URL',
        description: 'Use a valid full URL, for example: https://linkedin.com/in/username',
        variant: 'destructive',
      });
      return;
    }

    if (!isValidOptionalUrl(profileForm.github_url)) {
      toast({
        title: 'Invalid GitHub URL',
        description: 'Use a valid full URL, for example: https://github.com/username',
        variant: 'destructive',
      });
      return;
    }

    if (!isValidOptionalUrl(profileForm.twitter_url)) {
      toast({
        title: 'Invalid Twitter/X URL',
        description: 'Use a valid full URL, for example: https://x.com/username',
        variant: 'destructive',
      });
      return;
    }

    const exp = profileForm.experience_years.trim();
    if (exp && !/^\d{1,2}(\.\d{1,2})?$/.test(exp)) {
      toast({
        title: 'Invalid experience format',
        description: 'Experience must be a number like 3, 4.5, or 10.25 years.',
        variant: 'destructive',
      });
      return;
    }

    if (exp && Number(exp) > 60) {
      toast({
        title: 'Invalid experience range',
        description: 'Experience years should be between 0 and 60.',
        variant: 'destructive',
      });
      return;
    }

    const payload: CandidateProfileUpdatePayload = {
      full_name: profileForm.full_name.trim(),
      dob: profileForm.dob || null,
      current_organization: profileForm.current_organization.trim() || null,
      current_role: profileForm.current_role.trim() || null,
      experience_years: profileForm.experience_years ? Number(profileForm.experience_years) : null,
      linkedin_url: profileForm.linkedin_url.trim() || null,
      github_url: profileForm.github_url.trim() || null,
      twitter_url: profileForm.twitter_url.trim() || null,
    };

    setSaving(true);
    try {
      const res = await api.profile.update(payload);
      if (res.success) {
        setProfileForm(toForm(res.data));
        toast({ title: 'Profile updated' });
      }
    } catch (err: unknown) {
      toast({
        title: 'Unable to save profile',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteResume = async (resumeId: number) => {
    setDeletingId(resumeId);
    try {
      const res = await api.resumes.delete(resumeId);
      if (res.success) {
        setResumes(prev => prev.filter(item => item.resume_id !== resumeId));
        toast({ title: 'Resume removed' });
      }
    } catch (err: unknown) {
      toast({
        title: 'Unable to delete resume',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownloadResume = async (resumeId: number, fallbackName: string, fileType: string) => {
    try {
      const res = await api.resumes.download(resumeId);
      const blob = res instanceof Blob ? res : res.blob;
      const fileName = ensureFileExtension(
        res instanceof Blob ? fallbackName : (res.fileName || fallbackName),
        fileType
      );

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err: unknown) {
      toast({
        title: 'Unable to download resume',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleViewResume = async (resumeId: number) => {
    try {
      const res = await api.resumes.download(resumeId);
      const blob = res instanceof Blob ? res : res.blob;

      const blobUrl = window.URL.createObjectURL(blob);
      const opened = window.open(blobUrl, '_blank', 'noopener,noreferrer');

      if (!opened) {
        toast({
          title: 'Popup blocked',
          description: 'Please allow popups to preview the resume, or use Download.',
          variant: 'destructive',
        });
      }

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 60000);
    } catch (err: unknown) {
      toast({
        title: 'Unable to view resume',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 shadow-brand-sm">
        <p className="text-sm text-muted-foreground">Loading profile…</p>
      </div>
    );
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] animate-fade-up">
      <form onSubmit={handleSaveProfile} className="rounded-2xl border border-border bg-card p-5 shadow-brand-sm space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Candidate Profile</h2>
          <p className="text-xs text-muted-foreground">Keep your details updated for better resume guidance.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="profile-name">Name</Label>
            <Input id="profile-name" value={profileForm.full_name} onChange={setField('full_name')} />
          </div>
          <div>
            <Label htmlFor="profile-dob">Date of Birth</Label>
            <Input id="profile-dob" type="date" value={profileForm.dob} onChange={setField('dob')} />
          </div>
          <div>
            <Label htmlFor="profile-org">Current Organization</Label>
            <Input id="profile-org" value={profileForm.current_organization} onChange={setField('current_organization')} />
          </div>
          <div>
            <Label htmlFor="profile-role">Current Role</Label>
            <Input id="profile-role" value={profileForm.current_role} onChange={setField('current_role')} />
          </div>
          <div>
            <Label htmlFor="profile-exp">Experience (years)</Label>
            <Input id="profile-exp" type="number" min="0" step="0.1" value={profileForm.experience_years} onChange={setField('experience_years')} />
          </div>
          <div>
            <Label htmlFor="profile-linkedin">LinkedIn</Label>
            <Input id="profile-linkedin" value={profileForm.linkedin_url} onChange={setField('linkedin_url')} placeholder="https://linkedin.com/in/username" />
          </div>
          <div>
            <Label htmlFor="profile-github">GitHub</Label>
            <Input id="profile-github" value={profileForm.github_url} onChange={setField('github_url')} placeholder="https://github.com/username" />
          </div>
          <div>
            <Label htmlFor="profile-twitter">Twitter/X</Label>
            <Input id="profile-twitter" value={profileForm.twitter_url} onChange={setField('twitter_url')} placeholder="https://x.com/username" />
          </div>
        </div>

        <Button type="submit" variant="brand" disabled={saving} className="w-full sm:w-auto">
          {saving ? 'Saving…' : 'Save Profile'}
        </Button>
      </form>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-brand-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">Your Resumes</h3>
          <span className="text-xs text-muted-foreground">{resumes.length}/5</span>
        </div>

        {resumes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No resumes uploaded yet. Upload from any tool panel to build your resume library.
          </p>
        ) : (
          <TooltipProvider>
            <ul className="space-y-2">
              {resumes.map(resume => (
                <li key={resume.resume_id} className="rounded-lg border border-border bg-background px-3 py-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{resume.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {resume.file_type.toUpperCase()} • {resume.character_count} chars
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleDownloadResume(resume.resume_id, resume.file_name, resume.file_type)}
                            aria-label="Download resume"
                          >
                            <Download />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Download</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewResume(resume.resume_id)}
                            aria-label="View resume"
                          >
                            <Eye />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteResume(resume.resume_id)}
                            disabled={deletingId === resume.resume_id}
                            aria-label="Delete resume"
                          >
                            <Trash2 />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{deletingId === resume.resume_id ? 'Deleting...' : 'Delete'}</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </TooltipProvider>
        )}
      </div>
    </section>
  );
}
