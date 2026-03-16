import { useEffect, useMemo, useState } from 'react';

import { api, type ResumeLibraryItem } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface LoadedResumeSelection {
  resumeId: number;
  fileName: string;
  fileType: string;
  resumeText: string;
}

interface ResumeLibrarySelectorProps {
  onResumeLoaded: (selection: LoadedResumeSelection) => void;
  disabled?: boolean;
}

export function ResumeLibrarySelector({ onResumeLoaded, disabled = false }: ResumeLibrarySelectorProps) {
  const { toast } = useToast();
  const [resumes, setResumes] = useState<ResumeLibraryItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingSelected, setLoadingSelected] = useState(false);

  const resumeCountLabel = useMemo(() => `${resumes.length}/5 saved resumes`, [resumes.length]);

  const loadResumes = async () => {
    setLoading(true);
    try {
      const res = await api.resumes.list();
      if (res.success) {
        setResumes(res.data);
      }
    } catch (err: unknown) {
      toast({
        title: 'Unable to load resumes',
        description: err instanceof Error ? err.message : 'Failed to load resume library',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadResumes();
  }, []);

  const handleUseSelectedResume = async () => {
    const resumeId = Number(selectedId);
    if (!resumeId) {
      toast({
        title: 'Select a resume first',
        description: 'Choose one of your uploaded resumes to continue.',
      });
      return;
    }

    setLoadingSelected(true);
    try {
      const res = await api.resumes.get(resumeId);
      if (res.success) {
        onResumeLoaded({
          resumeId: res.data.resume_id,
          fileName: res.data.file_name,
          fileType: res.data.file_type,
          resumeText: res.data.extracted_text,
        });
        toast({
          title: 'Resume loaded',
          description: `${res.data.file_name} is selected for this tool.`,
        });
      }
    } catch (err: unknown) {
      toast({
        title: 'Unable to load selected resume',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoadingSelected(false);
    }
  };

  const handleUpload = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    if (!(lowerName.endsWith('.pdf') || lowerName.endsWith('.docx'))) {
      toast({
        title: 'Unsupported file type',
        description: 'Please upload PDF or DOCX only.',
        variant: 'destructive',
      });
      ev.target.value = '';
      return;
    }

    setUploading(true);
    try {
      const res = await api.resumes.upload(file);
      if (res.success) {
        const latest = res.data;
        setResumes(prev => [
          {
            resume_id: latest.resume_id,
            file_name: latest.file_name,
            file_type: latest.file_type,
            character_count: latest.character_count,
            created_at: latest.created_at,
          },
          ...prev,
        ]);
        setSelectedId(String(latest.resume_id));
        onResumeLoaded({
          resumeId: latest.resume_id,
          fileName: latest.file_name,
          fileType: latest.file_type,
          resumeText: latest.extracted_text,
        });
        toast({
          title: 'Resume uploaded',
          description: `${latest.file_name} uploaded and selected for this tool.`,
        });
      }
    } catch (err: unknown) {
      toast({
        title: 'Resume upload failed',
        description: err instanceof Error ? err.message : 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      ev.target.value = '';
    }
  };

  return (
    <div className="rounded-xl border border-border bg-background p-3 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="resume-library-select" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Resume Library
        </Label>
        <span className="text-xs text-muted-foreground">{resumeCountLabel}</span>
      </div>

      <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
        <select
          id="resume-library-select"
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
          disabled={disabled || loading || resumes.length === 0}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">{resumes.length ? 'Select uploaded resume…' : 'No resumes uploaded yet'}</option>
          {resumes.map(resume => (
            <option key={resume.resume_id} value={resume.resume_id}>
              {resume.file_name} ({resume.file_type.toUpperCase()})
            </option>
          ))}
        </select>

        <Button
          type="button"
          variant="outline"
          onClick={handleUseSelectedResume}
          disabled={disabled || loadingSelected || !selectedId}
          className="w-full sm:w-auto"
        >
          {loadingSelected ? 'Loading…' : 'Use Resume'}
        </Button>
      </div>

      <div>
        <Input
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleUpload}
          disabled={disabled || uploading}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Upload up to 5 resumes. Uploaded files are reusable across ATS Check, Optimizer, and Keyword Gap.
        </p>
      </div>
    </div>
  );
}
