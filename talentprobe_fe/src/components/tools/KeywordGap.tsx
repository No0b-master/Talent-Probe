import { useState } from 'react';
import { api, type KeywordGapResult } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ResultBlock, ScoreBar, KeywordChips } from '@/components/ResultComponents';
import { ResumeLibrarySelector } from '@/components/ResumeLibrarySelector';
import { ResumeDocumentViewer } from '@/components/ResumeDocumentViewer';

function KeywordGapResults({ result }: { result: KeywordGapResult }) {
  const missing = result.missing_keywords ?? [];
  const priority = result.high_priority_keywords ?? [];
  const coverage = result.coverage_percentage ?? 0;

  const copyText = [
    `Coverage: ${coverage}%`,
    '',
    'High-Priority Missing Keywords:',
    priority.join(', '),
    '',
    'All Missing Keywords:',
    missing.join(', '),
  ].join('\n');

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Coverage */}
      <ResultBlock label="Keyword Coverage">
        <div className="space-y-3">
          <ScoreBar label="Overall Coverage" value={coverage} />
          <p className="text-xs text-muted-foreground">
            {coverage >= 70
              ? 'Your resume covers most keywords in this job description.'
              : coverage >= 40
              ? 'You\'re partially aligned — consider adding the keywords below.'
              : 'Significant keyword gaps detected. Adding these will greatly improve your match rate.'}
          </p>
        </div>
      </ResultBlock>

      {/* High priority */}
      {priority.length > 0 && (
        <ResultBlock
          label={`High-Priority Keywords (${priority.length})`}
          copyText={priority.join(', ')}
        >
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Add these first — they appear frequently in the job description.
            </p>
            <KeywordChips keywords={priority} variant="priority" />
          </div>
        </ResultBlock>
      )}

      {/* All missing */}
      {missing.length > 0 && (
        <ResultBlock
          label={`All Missing Keywords (${missing.length})`}
          copyText={copyText}
        >
          <KeywordChips keywords={missing} variant="missing" />
        </ResultBlock>
      )}

      {missing.length === 0 && priority.length === 0 && (
        <ResultBlock>
          <p className="text-sm text-green-600 font-medium text-center py-2">
            ✓ No significant keyword gaps detected!
          </p>
        </ResultBlock>
      )}
    </div>
  );
}

export function KeywordGap() {
  const { toast } = useToast();
  const [form, setForm] = useState({ resume_text: '', job_description: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<KeywordGapResult | null>(null);
  const [selectedResumeMeta, setSelectedResumeMeta] = useState<{
    resumeId: number;
    fileName: string;
    fileType: string;
  } | null>(null);

  const set = (key: string) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [key]: e.target.value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.resume_text.trim() || form.resume_text.trim().length < 50)
      e.resume_text = 'Resume text must be at least 50 characters';
    if (!form.job_description.trim() || form.job_description.trim().length < 30)
      e.job_description = 'Job description must be at least 30 characters';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.resume.keywordGap({
        resume_text: form.resume_text.trim(),
        job_description: form.job_description.trim(),
      });
      if (res.success) {
        setResult(res.data);
        toast({ title: 'Keyword gap analysis complete ✓' });
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
        {result ? (
          <KeywordGapResults result={result} />
        ) : (
          <ResultBlock label="Keyword Gap Results">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Run analysis to view coverage score, high-priority keywords, and missing keyword list here.
            </p>
          </ResultBlock>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 animate-slide-in-right">
        <div>
          <Label>Resume *</Label>
          <div className="mt-2 mb-2">
            <ResumeLibrarySelector
              disabled={loading}
              onResumeLoaded={(selection) => {
                setForm(prev => ({ ...prev, resume_text: selection.resumeText }));
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
              Select or upload a resume to preview it here. Extracted text is used internally for keyword analysis and is not displayed.
            </p>
          )}

          {errors.resume_text && (
            <p className="mt-1 text-xs text-destructive">{errors.resume_text}</p>
          )}
        </div>

        <div>
          <Label htmlFor="kw-jd">Job Description *</Label>
          <Textarea
            id="kw-jd"
            placeholder="Paste the job description here…"
            value={form.job_description}
            onChange={set('job_description')}
            rows={5}
            disabled={loading}
            className="resize-none"
          />
          {errors.job_description && (
            <p className="mt-1 text-xs text-destructive">{errors.job_description}</p>
          )}
        </div>

        <Button type="submit" variant="brand" disabled={loading} className="w-full sm:w-auto">
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              Analyzing…
            </>
          ) : (
            'Analyze Keyword Gap'
          )}
        </Button>
      </form>
    </div>
  );
}
