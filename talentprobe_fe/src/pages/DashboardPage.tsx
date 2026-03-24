import { useEffect, useState } from 'react';
import { ATSCheck } from '@/components/tools/ATSCheck';
import { ResumeOptimizer } from '@/components/tools/ResumeOptimizer';
import { KeywordGap } from '@/components/tools/KeywordGap';
import { ProfessionAnalysis } from '@/components/tools/ProfessionAnalysis';
import { Button } from '@/components/ui/button';
import { FileSearch2, Wand2, BarChart3, ChevronDown, BriefcaseBusiness } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CommonHeader } from '@/components/CommonHeader';
import { CommonFooter } from '@/components/CommonFooter';

import { api, type ATSUsage, type RegisteredUser } from '@/lib/api';

// ─── Tool definitions ─────────────────────────────────────────────────────────

const TOOLS = [
  {
    id: 'ats',
    label: 'ATS Check',
    description: 'Score your resume against a job description for ATS compatibility.',
    icon: FileSearch2,
    badge: 'Popular',
  },
  {
    id: 'profession-analysis',
    label: 'Profession Analysis',
    description: 'Analyze your CV against a generic UAE benchmark for your selected profession.',
    icon: BriefcaseBusiness,
    badge: 'UAE',
  },
  {
    id: 'optimizer',
    label: 'Resume Optimizer',
    description: 'AI-powered rewrite tailored to UAE roles and emirates.',
    icon: Wand2,
    badge: 'AI',
  },
  {
    id: 'keyword-gap',
    label: 'Keyword Gap',
    description: 'Find missing keywords that recruiters and ATS systems look for.',
    icon: BarChart3,
    badge: null,
  },
] as const;

type ToolId = (typeof TOOLS)[number]['id'];

// ─── Tool card ────────────────────────────────────────────────────────────────

interface ToolCardProps {
  tool: (typeof TOOLS)[number];
  active: boolean;
  onClick: () => void;
}

function ToolCard({ tool, active, onClick }: ToolCardProps) {
  const Icon = tool.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative w-full rounded-xl border p-5 text-left transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        active
          ? 'border-primary bg-primary text-primary-foreground shadow-brand-lg'
          : 'border-border bg-card text-card-foreground shadow-brand-sm hover:border-primary/40 hover:shadow-brand-md'
      )}
    >
      {tool.badge && (
        <span
          className={cn(
            'absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
            active
              ? 'bg-primary-foreground/20 text-primary-foreground'
              : 'bg-gold-muted text-accent'
          )}
        >
          {tool.badge}
        </span>
      )}
      <Icon
        className={cn(
          'mb-3 h-6 w-6 transition-colors',
          active ? 'text-primary-foreground' : 'text-primary'
        )}
      />
      <p className={cn('font-semibold text-sm', active && 'text-white')}>{tool.label}</p>
      <p
        className={cn(
          'mt-1 text-xs leading-snug',
          active ? 'text-white/95' : 'text-muted-foreground'
        )}
      >
        {tool.description}
      </p>
      {active && (
        <ChevronDown className="absolute bottom-3 right-3 h-4 w-4 text-white/85" />
      )}
    </button>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [activeTool, setActiveTool] = useState<ToolId>('profession-analysis');
  const [profile, setProfile] = useState<RegisteredUser | null>(null);
  const [usage, setUsage] = useState<ATSUsage | null>(null);
  const [usageLoading, setUsageLoading] = useState(true);

  const loadUsage = async () => {
    setUsageLoading(true);
    try {
      const res = await api.ats.usage();
      if (res.success) {
        setUsage(res.data);
      }
    } catch {
      setUsage(null);
    } finally {
      setUsageLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const loadHeaderData = async () => {
      try {
        const [profileRes, usageRes] = await Promise.all([api.auth.me(), api.ats.usage()]);
        if (!mounted) {
          return;
        }

        if (profileRes.success) {
          setProfile(profileRes.data);
        }

        if (usageRes.success) {
          setUsage(usageRes.data);
        }
      } catch {
        if (mounted) {
          setProfile(null);
          setUsage(null);
        }
      } finally {
        if (mounted) {
          setUsageLoading(false);
        }
      }
    };

    void loadHeaderData();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleTool = (id: ToolId) => {
    setActiveTool(id);
  };

  const usagePercent = usage
    ? Math.min(100, Math.max(0, Math.round((usage.used_today / Math.max(usage.daily_limit, 1)) * 100)))
    : 0;

  const handleUsageUpdated = () => {
    void loadUsage();
  };

  return (
    <div className="min-h-screen bg-background">
      <CommonHeader />

      {/* ── Main ── */}
      <main className="mx-auto max-w-7xl px-3 sm:px-5 py-8 space-y-8">
        {/* Welcome */}
        <div className="animate-fade-up">
          <h1 className="text-2xl font-bold text-foreground">Your Resume Tools</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a tool below to optimize your job search in the UAE market.
          </p>
        </div>

        

        {/* Tool selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 animate-fade-up">
          {TOOLS.map(tool => (
            <ToolCard
              key={tool.id}
              tool={tool}
              active={activeTool === tool.id}
              onClick={() => toggleTool(tool.id)}
            />
          ))}
        </div>

        {/* Active tool panel */}
        <div className="animate-fade-up rounded-2xl border border-border bg-card shadow-brand-md overflow-hidden">
          {/* Panel header */}
          <div className="border-b border-border bg-gradient-card px-6 py-4">
            {(() => {
              const tool = TOOLS.find(t => t.id === activeTool)!;
              const Icon = tool.icon;
              return (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">{tool.label}</h2>
                    <p className="text-xs text-muted-foreground">{tool.description}</p>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Panel content */}
          <div className="px-4 py-5">
            {activeTool === 'ats' && <ATSCheck onUsageUpdated={handleUsageUpdated} />}
            {activeTool === 'profession-analysis' && <ProfessionAnalysis onUsageUpdated={handleUsageUpdated} />}
            {activeTool === 'optimizer' && <ResumeOptimizer onUsageUpdated={handleUsageUpdated} />}
            {activeTool === 'keyword-gap' && <KeywordGap onUsageUpdated={handleUsageUpdated} />}
          </div>
        </div>
      </main>
      <CommonFooter />
    </div>
  );
}
