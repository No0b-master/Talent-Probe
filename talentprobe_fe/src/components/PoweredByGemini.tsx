interface PoweredByGeminiProps {
  className?: string;
  muted?: boolean;
}

export function PoweredByGemini({ className, muted = true }: PoweredByGeminiProps) {
  return (
    <p
      className={[
        'text-[11px] leading-none',
        muted ? 'text-muted-foreground' : 'text-primary-foreground/85',
        className ?? '',
      ].join(' ')}
    >
      Powered by Gemini
    </p>
  );
}
