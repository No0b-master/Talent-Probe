import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UAEFlagStrip } from '@/components/UAEFlag';
import { GoogleAuthCard } from '@/components/GoogleAuthCard';

const FEATURES = [
  {
    title: 'ATS Check',
    detail:
      'Upload your resume text and compare it against a job description with a clear ATS compatibility score and recommendations.',
  },
  {
    title: 'Resume Optimizer',
    detail:
      'Generate AI-assisted resume improvements tailored to UAE market expectations, role context, and hiring language.',
  },
  {
    title: 'Keyword Gap Analysis',
    detail:
      'Identify missing high-priority keywords from job ads so your profile aligns better with recruiter and ATS screening.',
  },
];

const METRICS = [
  { label: 'Integrated tools', value: '3' },
  { label: 'Auth method', value: 'Google SSO' },
  { label: 'Market focus', value: 'UAE' },
];

const WORKFLOW = [
  'Authenticate securely with your Google account.',
  'Select ATS Check, Resume Optimizer, or Keyword Gap.',
  'Paste resume and job content to get targeted guidance.',
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-24 top-14 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm shadow-brand-sm">
        <UAEFlagStrip className="rounded-none h-1.5" />
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-5 py-3">
          <div className="flex items-center gap-3">
            <img src="/welkdock_logo.png" alt="Welkdock Technologies logo" className="h-10 w-10 rounded-lg object-contain" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-foreground leading-none">Talent Probe</span>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-gold-muted px-2 py-0.5 text-[10px] font-semibold text-accent-foreground uppercase tracking-wide">
                  🇦🇪 UAE
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">by Welkdock Technologies</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="brand">
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-3 sm:px-5 py-10 sm:py-12 space-y-8 sm:space-y-10">
        <section className="grid gap-8 lg:gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="space-y-7 sm:space-y-8 animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Welkdock Technologies Platform
            </div>

            <h1 className="max-w-3xl text-4xl font-bold leading-[1.12] text-foreground sm:text-5xl lg:text-[3.35rem]">
              Professional ATS and Resume Intelligence for the UAE Job Market
            </h1>

            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              Talent Probe helps candidates optimize resumes, close keyword gaps, and improve interview readiness with clear, practical guidance aligned to UAE hiring expectations.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button asChild variant="brand" size="lg">
                <Link to="/auth">Start Free Analysis</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/auth">View Secure Sign-In</Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:gap-4 sm:grid-cols-3 pt-1">
              {METRICS.map(metric => (
                <article key={metric.label} className="rounded-xl border border-border bg-card p-4 shadow-brand-sm">
                  <p className="text-xl font-bold text-foreground">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-4 sm:space-y-5 lg:pt-2">
            <GoogleAuthCard />

            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-brand-md">
              <div className="bg-gradient-hero px-5 py-4 text-primary-foreground">
                <p className="text-[11px] font-semibold uppercase tracking-wider opacity-85">Readiness Snapshot</p>
                <h3 className="mt-1 text-base font-semibold">Candidate Profile Scoreboard</h3>
              </div>

              <div className="space-y-4 px-5 py-5 sm:py-6">
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Keyword Coverage</span>
                    <span className="font-semibold text-foreground">82%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary">
                    <div className="h-full w-[82%] rounded-full bg-primary" />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Section Completeness</span>
                    <span className="font-semibold text-foreground">76%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary">
                    <div className="h-full w-[76%] rounded-full bg-accent" />
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-gradient-card p-3">
                  <p className="text-xs text-muted-foreground">Most requested improvement</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">Role-specific measurable achievements</p>
                </div>
              </div>
            </div>
          </aside>
        </section>

        <section className="grid gap-4 sm:gap-5 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-brand-sm">
            <h2 className="text-lg font-semibold text-foreground">Platform Capabilities</h2>
            <div className="mt-4 grid gap-3 sm:gap-4">
              {FEATURES.map(feature => (
                <article key={feature.title} className="rounded-xl border border-border bg-background p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{feature.detail}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-brand-sm">
            <h2 className="text-lg font-semibold text-foreground">How It Works</h2>
            <ol className="mt-4 space-y-3 sm:space-y-3.5">
              {WORKFLOW.map((step, index) => (
                <li key={step} className="flex items-start gap-3 rounded-xl border border-border bg-background p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <p className="text-sm text-muted-foreground">{step}</p>
                </li>
              ))}
            </ol>

            <div className="mt-5 rounded-xl border border-border bg-gradient-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Professional Focus</p>
              <p className="mt-1 text-sm font-medium text-foreground">
                Built for candidates targeting structured hiring pipelines and ATS-driven screening in the UAE.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
