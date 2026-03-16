import { useEffect, useRef, useState } from 'react';
import { renderAsync } from 'docx-preview';

import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ResumeDocumentViewerProps {
  resumeId: number | null;
  fileName: string;
  fileType: string;
}

export function ResumeDocumentViewer({ resumeId, fileName, fileType }: ResumeDocumentViewerProps) {
  const { toast } = useToast();
  const docxContainerRef = useRef<HTMLDivElement | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [docxBlob, setDocxBlob] = useState<Blob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resumeId) {
      setBlobUrl(null);
      setDocxBlob(null);
      setError(null);
      return;
    }

    let isCancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const response = await api.resumes.download(resumeId);
        const blob = response.blob;

        if (isCancelled) {
          return;
        }

        const nextUrl = window.URL.createObjectURL(blob);
        setBlobUrl(prev => {
          if (prev) {
            window.URL.revokeObjectURL(prev);
          }
          return nextUrl;
        });

        setDocxBlob(fileType.toLowerCase() === 'docx' ? blob : null);
      } catch (err: unknown) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load document preview');
          toast({
            title: 'Preview unavailable',
            description: err instanceof Error ? err.message : 'Unable to load document preview',
            variant: 'destructive',
          });
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [fileType, resumeId, toast]);

  useEffect(() => {
    if (fileType.toLowerCase() !== 'docx' || !docxBlob || !docxContainerRef.current) {
      return;
    }

    const container = docxContainerRef.current;
    container.innerHTML = '';

    void (async () => {
      try {
        const arrayBuffer = await docxBlob.arrayBuffer();
        await renderAsync(arrayBuffer, container, undefined, {
          inWrapper: true,
          ignoreHeight: false,
          ignoreWidth: false,
          breakPages: true,
        });
      } catch {
        setError('Unable to render DOCX preview. You can still download the file.');
      }
    })();
  }, [docxBlob, fileType]);

  useEffect(() => {
    return () => {
      if (blobUrl) {
        window.URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  const pdfPreviewUrl = blobUrl ? `${blobUrl}#toolbar=0&navpanes=0&statusbar=0` : null;

  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="truncate text-sm font-medium text-foreground">{fileName}</p>
        <span className="text-xs uppercase tracking-wide text-muted-foreground">{fileType}</span>
      </div>

      {loading && <p className="text-xs text-muted-foreground">Preparing preview...</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}

      {!loading && !error && pdfPreviewUrl && fileType.toLowerCase() === 'pdf' && (
        <iframe
          src={pdfPreviewUrl}
          title="Resume PDF preview"
          className="h-[480px] w-full rounded-md border border-border bg-white"
        />
      )}

      {!loading && !error && fileType.toLowerCase() === 'docx' && (
        <div className="max-h-[480px] overflow-auto rounded-md border border-border bg-white p-3">
          <div ref={docxContainerRef} />
        </div>
      )}
    </div>
  );
}
