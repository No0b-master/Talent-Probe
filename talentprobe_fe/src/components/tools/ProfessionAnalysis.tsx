import { useEffect, useState } from 'react';
import { api, type ATSCheckResult, type ProfessionAnalysisResult, type ProfessionOption } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ResultBlock, ScoreBar, KeywordChips, BulletList } from '@/components/ResultComponents';
import { ResumeLibrarySelector } from '@/components/ResumeLibrarySelector';
import { ResumeDocumentViewer } from '@/components/ResumeDocumentViewer';
import { cn } from '@/lib/utils';

function ScoreCircle({ score }: { score: number }) {
  const clamped = Math.min(100, Math.max(0, score));
  const color =
    clamped >= 70 ? 'text-primary' : clamped >= 40 ? 'text-accent' : 'text-red-500';
  const label =
    clamped >= 70 ? 'Great' : clamped >= 40 ? 'Fair' : 'Needs Work';

  return (
    <div className="flex flex-col items-center justify-center gap-1 py-2">
      <div
        className={cn(
          'flex h-28 w-28 flex-col items-center justify-center rounded-full border-4 bg-card shadow-brand-md',
          clamped >= 70
            ? 'border-primary/40'
            : clamped >= 40
            ? 'border-accent/40'
            : 'border-red-400'
        )}
      >
        <span className={cn('text-3xl font-bold', color)}>{clamped}</span>
        <span className="text-xs font-medium text-muted-foreground">/ 100</span>
      </div>
      <span className={cn('text-sm font-semibold', color)}>{label}</span>
    </div>
  );
}

function formatScoreLabel(label: string): string {
  return label
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function ProfessionResults({ result }: { result: ProfessionAnalysisResult }) {
  const analysis: ATSCheckResult = result.analysis;
  const breakdown = analysis.breakdown ?? analysis.score_breakdown ?? {};
  const matched = analysis.matched_keywords ?? [];
  const missing = analysis.missing_keywords ?? [];
  const gaps = analysis.section_gaps ?? [];
  const recs = analysis.recommendations ?? [];

  const summaryText = [
    `Profession: ${result.profession_name}`,
    `ATS Overall Score: ${analysis.overall_score}/100`,
    '',
    'Matched Keywords: ' + matched.join(', '),
    'Missing Keywords: ' + missing.join(', '),
    '',
    'Section Gaps: ' + gaps.join(', '),
    '',
    'Recommendations:',
    ...recs.map((r, i) => `${i + 1}. ${r}`),
  ].join('\n');

  return (
    <div className="space-y-4 animate-fade-up">
      <ResultBlock label="UAE Market Benchmark Basis" copyText={result.analysis_basis}>
        <p className="text-sm text-muted-foreground leading-relaxed">{result.analysis_basis}</p>
      </ResultBlock>

      <ResultBlock label={`Overall Fit for ${result.profession_name}`}>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ScoreCircle score={analysis.overall_score} />
          {Object.keys(breakdown).length > 0 && (
            <div className="flex-1 w-full space-y-3">
              {Object.entries(breakdown).map(([key, val]) => (
                <ScoreBar key={key} label={formatScoreLabel(key)} value={val} />
              ))}
            </div>
          )}
        </div>
      </ResultBlock>

      <div className="grid sm:grid-cols-2 gap-4">
        <ResultBlock label={`Matched Keywords (${matched.length})`} copyText={matched.join(', ')}>
          <KeywordChips keywords={matched} variant="matched" />
        </ResultBlock>
        <ResultBlock label={`Missing Keywords (${missing.length})`} copyText={missing.join(', ')}>
          <KeywordChips keywords={missing} variant="missing" />
        </ResultBlock>
      </div>

      {gaps.length > 0 && (
        <ResultBlock label="Section Gaps" copyText={gaps.join('\n')}>
          <KeywordChips keywords={gaps} variant="priority" />
        </ResultBlock>
      )}

      {recs.length > 0 && (
        <ResultBlock label="Recommendations" copyText={summaryText}>
          <BulletList items={recs} />
        </ResultBlock>
      )}
    </div>
  );
}

interface ProfessionAnalysisProps {
  onUsageUpdated?: () => void;
}

export function ProfessionAnalysis({ onUsageUpdated }: ProfessionAnalysisProps) {
  const { toast } = useToast();
  const [resumeText, setResumeText] = useState('');
  const [professionId, setProfessionId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [professions, setProfessions] = useState<ProfessionOption[]>([]);
  const [professionsLoading, setProfessionsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProfessionAnalysisResult | null>(null);
  const [selectedResumeMeta, setSelectedResumeMeta] = useState<{
    resumeId: number;
    fileName: string;
    fileType: string;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadProfessions = async () => {
      setProfessionsLoading(true);
      try {
        const res = await api.ats.professions();
        if (mounted && res.success) {
          setProfessions(res.data);
        }
      } catch {
        if (mounted) {
          setProfessions([]);
        }
      } finally {
        if (mounted) {
          setProfessionsLoading(false);
        }
      }
    };

    void loadProfessions();

    return () => {
      mounted = false;
    };
  }, []);

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!resumeText.trim() || resumeText.trim().length < 50) {
      nextErrors.resume_text = 'Resume text must be at least 50 characters';
    }
    if (!professionId) {
      nextErrors.profession_id = 'Please select a profession';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await api.ats.professionAnalysis({
        resume_text: resumeText.trim(),
        profession_id: Number(professionId),
        ...(selectedResumeMeta?.resumeId && { resume_id: selectedResumeMeta.resumeId }),
        ...(selectedResumeMeta?.fileName && { resume_file_name: selectedResumeMeta.fileName }),
        ...(selectedResumeMeta?.fileType && { resume_file_type: selectedResumeMeta.fileType }),
      });

      if (res.success) {
        setResult(res.data);
        toast({ title: 'UAE profession analysis complete ✓' });
        onUsageUpdated?.();
      }
    } catch (err: unknown) {
      toast({
        title: 'Analysis failed',
        description: err instanceof Error ? err.message : 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2 items-start">
      <div className="space-y-4 lg:sticky lg:top-24 animate-fade-up">
        {loading ? (
          <ResultBlock label="AI Analysis In Progress">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-3 w-3 animate-ping rounded-full bg-primary" />
                <p className="text-sm font-medium text-foreground">
                  Building your UAE profession-fit analysis from CV data...
                </p>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full w-1/3 animate-pulse rounded-full bg-primary" />
              </div>
            </div>
          </ResultBlock>
        ) : result ? (
          <ProfessionResults result={result} />
        ) : (
          <ResultBlock label="Profession Analysis Results">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Select a profession and run analysis to get a generic UAE market fit score without needing a job description.
            </p>
          </ResultBlock>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 animate-slide-in-right rounded-2xl border border-border bg-card px-4 py-5 shadow-brand-sm">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Profession Analysis</h3>
          <p className="text-xs text-muted-foreground">No job description required</p>
        </div>

        <div>
          <Label htmlFor="profession-select">Profession *</Label>
          <select
            id="profession-select"
            value={professionId}
            onChange={(e) => {
              setProfessionId(e.target.value);
              setErrors(prev => ({ ...prev, profession_id: '' }));
            }}
            disabled={loading || professionsLoading}
            className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">
              {professionsLoading ? 'Loading professions...' : 'Select profession...'}
            </option>
            {professions.map((option) => (
              <option key={option.profession_id} value={String(option.profession_id)}>
                {option.profession_name}
              </option>
            ))}
          </select>
          {errors.profession_id && (
            <p className="mt-1 text-xs text-destructive">{errors.profession_id}</p>
          )}
        </div>

        <div>
          <Label>Resume *</Label>
          <div className="mt-2 mb-2">
            <ResumeLibrarySelector
              disabled={loading}
              onResumeLoaded={(selection) => {
                setResumeText(selection.resumeText);
                setErrors(prev => ({ ...prev, resume_text: '' }));
                setSelectedResumeMeta({
                  resumeId: selection.resumeId,
                  fileName: selection.fileName,
                  fileType: selection.fileType,
                });
              }}
            />
          </div>

          {selectedResumeMeta ? (
            <ResumeDocumentViewer
              resumeId={selectedResumeMeta.resumeId}
              fileName={selectedResumeMeta.fileName}
              fileType={selectedResumeMeta.fileType}
            />
          ) : (
            <p className="rounded-md border border-dashed border-border bg-background p-3 text-sm text-muted-foreground">
              Select or upload a resume to preview it here. Extracted text is used internally for analysis and is not displayed.
            </p>
          )}

          {errors.resume_text && (
            <p className="mt-1 text-xs text-destructive">{errors.resume_text}</p>
          )}
        </div>

        <Button type="submit" variant="brand" disabled={loading || professionsLoading} className="w-full sm:w-auto">
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Analyzing...
            </>
          ) : (
            'Run Profession Analysis'
          )}
        </Button>
      </form>
    </div>
  );
}
