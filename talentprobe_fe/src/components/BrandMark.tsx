import { cn } from '@/lib/utils';

interface BrandMarkProps {
  className?: string;
  withText?: boolean;
}

export function BrandMark({ className, withText = false }: BrandMarkProps) {
  return (
    <div className={cn('flex items-center gap-2', className)} aria-label="TalentProbe brand mark">
      <img src="/search.svg" alt="TalentProbe" className="h-full w-auto" />
      {withText && (
        <div className="flex items-baseline gap-0.5">
          <span className="font-bold text-[#164B81]">Talent</span>
          <span className="font-bold text-[#3E9EC2]">Probe</span>
        </div>
      )}
    </div>
  );
}