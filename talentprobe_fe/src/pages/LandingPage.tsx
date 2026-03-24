import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  CheckCircle2,
  CircleHelp,
  ClipboardCheck,
  MessageSquareQuote,
  Sparkles,
  Star,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BrandMark } from "@/components/BrandMark";
import { GoogleAuthCard } from "@/components/GoogleAuthCard";
import { CommonHeader } from "@/components/CommonHeader";
import { CommonFooter } from "@/components/CommonFooter";

const SERVICES = [
  {
    icon: ClipboardCheck,
    title: "ATS Check",
    detail:
      "Compare your resume against a real job description and get a structured ATS score, keyword alignment, section gaps, and targeted recommendations.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Profession Analysis",
    detail:
      "Run a professional analysis against a UAE benchmark for your selected role even when you do not have a job description yet.",
  },
  {
    icon: Wand2,
    title: "Resume Optimizer",
    detail:
      "Generate AI-assisted resume improvements tailored to UAE market expectations, target roles, and hiring language.",
  },
  {
    icon: Sparkles,
    title: "Keyword Gap Analysis",
    detail:
      "Identify missing high-priority keywords from job ads so your profile aligns better with recruiter and ATS screening.",
  },
];

const HOW_TO_USE = [
  "Sign up or sign in from the landing page using your Google account.",
  "Upload or choose a resume from your library and select the tool that fits your goal.",
  "Review AI-generated scores, keyword gaps, and improvement actions tailored for the UAE market.",
];

const MARKET_CHECK_POINTS = [
  "Check whether your CV is strong enough for ATS-driven hiring pipelines.",
  "See if your role positioning matches market expectations in the UAE.",
  "Get practical next steps before you apply to your next opportunity.",
];

const FAQS = [
  {
    question: "Do I need a job description to use TalentProbe?",
    answer:
      "No. You can use Profession Analysis without a job description, or run ATS Check and Keyword Gap when you have a target vacancy ready.",
  },
  {
    question: "Can I upload my resume once and reuse it across tools?",
    answer:
      "Yes. Your resume library is shared across the tool suite so you can use the same CV for ATS Check, Profession Analysis, Resume Optimizer, and Keyword Gap.",
  },
  {
    question: "Is this focused on the UAE job market only?",
    answer:
      "The product is optimized for UAE hiring expectations, but the resume analysis patterns are still useful for broader GCC and structured international hiring processes.",
  },
  {
    question: "How is sign-up handled?",
    answer:
      "Sign-up and sign-in are handled directly on the landing page through Google authentication. There is no separate auth page anymore.",
  },
];

const TESTIMONIALS = [
  {
    name: "Nadia A.",
    role: "Marketing Candidate, Dubai",
    quote:
      "The profession analysis made it obvious where my CV was too generic. I rewrote my summary and role achievements before applying again.",
  },
  {
    name: "Farhan K.",
    role: "Operations Professional, Abu Dhabi",
    quote:
      "ATS Check gave me a much clearer view of why my applications were not converting. The recommendations were direct and usable.",
  },
  {
    name: "Sara M.",
    role: "Finance Candidate, Sharjah",
    quote:
      "Resume Optimizer helped me tighten my language and add more measurable outcomes. It felt much closer to recruiter expectations after that.",
  },
];

const TYPING_FEATURES = [
  "Professional Analysis",
  "ATS Check",
  "Resume Optimizer",
];

function TypingFeatureLine() {
  const [featureIndex, setFeatureIndex] = useState(0);
  const [visibleText, setVisibleText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentFeature = TYPING_FEATURES[featureIndex];
    const isComplete = visibleText === currentFeature;
    const isCleared = visibleText.length === 0;

    const timeout = window.setTimeout(
      () => {
        if (!isDeleting && !isComplete) {
          setVisibleText(currentFeature.slice(0, visibleText.length + 1));
          return;
        }

        if (!isDeleting && isComplete) {
          setIsDeleting(true);
          return;
        }

        if (isDeleting && !isCleared) {
          setVisibleText(currentFeature.slice(0, visibleText.length - 1));
          return;
        }

        setIsDeleting(false);
        setFeatureIndex((featureIndex + 1) % TYPING_FEATURES.length);
      },
      !isDeleting && isComplete ? 1200 : isDeleting ? 45 : 85,
    );

    return () => window.clearTimeout(timeout);
  }, [featureIndex, isDeleting, visibleText]);

  return (
    <div className="inline-flex min-h-8 items-center backdrop-blur-sm">
      <span className="text-2xl font-large font-bold typing-caret">
        {visibleText}
      </span>
    </div>
  );
}

interface ParallaxSectionProps {
  scrollY: number;
  speed: number;
  id?: string;
  className?: string;
  children: ReactNode;
}

function ParallaxSection({
  scrollY,
  speed,
  id,
  className,
  children,
}: ParallaxSectionProps) {
  const translateY = Math.round(scrollY * speed);

  return (
    <section id={id} className={className}>
      <div
        className="will-change-transform"
        style={{ transform: `translate3d(0, ${translateY}px, 0)` }}
      >
        {children}
      </div>
    </section>
  );
}

function SectionInner({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto flex w-full max-w-7xl flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-20 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) {
        return;
      }

      ticking = true;
      window.requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute inset-y-0 right-0 w-full bg-cover bg-center bg-no-repeat opacity-75 [transform:scaleX(-1)] lg:w-[70%]"
          style={{ backgroundImage: "url(/office_stock.jpg)" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--background)/0.98)_0%,hsl(var(--background)/0.9)_22%,hsl(var(--background)/0.46)_54%,hsl(var(--background)/0.18)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--background)/0.18)_0%,transparent_18%,transparent_74%,hsl(var(--background)/0.68)_100%)]" />
        <div className="absolute inset-y-0 left-0 w-full bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.16),transparent_38%),radial-gradient(circle_at_right,hsl(var(--accent)/0.12),transparent_28%)]" />
        <div className="absolute -left-24 top-14 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <CommonHeader />

      <main className="relative z-10 space-y-0">
        <ParallaxSection
          scrollY={scrollY}
          speed={0.04}
          className="bg-gradient-hero text-primary-foreground"
        >
          <SectionInner className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:text-left">
            <div className="space-y-7 animate-fade-up lg:justify-self-start">
              <div className="flex items-center justify-center gap-4 lg:justify-start">
                <BrandMark className="h-14 w-14" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground/80">
                    TalentProbe
                  </p>
                  <h1 className="mt-1 text-3xl font-bold text-primary-foreground sm:text-4xl">
                    AI Career Toolkit for UAE Hiring
                  </h1>
                </div>
              </div>

              <TypingFeatureLine />

              {/* <h2 className="max-w-4xl text-4xl font-bold leading-[1.08] text-primary-foreground sm:text-5xl lg:text-[3.6rem]">
                Professional Resume Intelligence for ATS Checks, Role Analysis, and UAE Hiring Readiness
              </h2> */}

              <p className="max-w-2xl text-base leading-7 text-primary-foreground/90 sm:text-lg">
                TalentProbe helps candidates benchmark resumes against job
                descriptions, run professional analysis by role, close keyword
                gaps, and optimize CV content with clear AI guidance aligned to
                UAE hiring expectations.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-1 lg:justify-start">
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="text-foreground"
                >
                  <Link to="/dashboard">Try for Free</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <a href="#google-sign-in">Continue with Google</a>
                </Button>
              </div>
            </div>

            <aside className="space-y-5 lg:pt-10 lg:justify-self-end">
              <GoogleAuthCard
                title="Sign up with Google"
                description="Create your TalentProbe account with Google and go straight to the dashboard."
              />

              <div className="border-t border-primary-foreground/20 pt-5 lg:border-l-2 lg:border-t-0 lg:pl-5 lg:pt-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/80">
                  Primary feature
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-primary-foreground">
                  Professional Analysis
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-primary-foreground/90">
                  Use your existing CV to check how well it fits a professional
                  role benchmark before you even shortlist a job description.
                </p>
              </div>
            </aside>
          </SectionInner>
        </ParallaxSection>

        <ParallaxSection
          scrollY={scrollY}
          speed={-0.02}
          className="bg-background"
        >
          <SectionInner>
            <h2 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
              How to Use TalentProbe ?
            </h2>
            <div className="mt-8 grid w-full items-stretch gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="overflow-hidden rounded-2xl">
                <img
                  src="/how_to_use.png"
                  alt="How to use TalentProbe"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="flex flex-col justify-center text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Quick onboarding flow
                </p>
                <h3 className="mt-2 text-2xl font-bold text-foreground">
                  Start in minutes with a clear guided process
                </h3>
                <div className="mt-5 space-y-4">
                  {HOW_TO_USE.map((step, index) => (
                    <article key={step} className="py-2">
                      <div className="flex items-start gap-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                          {index + 1}
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {step}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </SectionInner>
        </ParallaxSection>

        <ParallaxSection
          scrollY={scrollY}
          speed={0.03}
          className="bg-gradient-hero text-primary-foreground"
        >
          <SectionInner className="lg:text-left">
            <div className="mt-2 grid w-full items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">
                  What Services We Offer
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-primary-foreground/85 sm:text-base">
                  A practical suite designed to improve resume quality, role
                  fit, and interview readiness with clear, actionable feedback.
                </p>

                <div className="mt-7 space-y-5">
                  {SERVICES.map((service) => {
                    const Icon = service.icon;
                    return (
                      <article
                        key={service.title}
                        className="border-b border-primary-foreground/20 pb-4 last:border-b-0 last:pb-0"
                      >
                        <div className="flex items-start gap-4">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15 text-primary-foreground">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-primary-foreground">
                              {service.title}
                            </h3>
                            <p className="mt-1.5 text-sm leading-relaxed text-primary-foreground/88">
                              {service.detail}
                            </p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>

              <div className="relative flex items-center justify-center lg:justify-end">
                <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
                  <div className="relative h-60 w-60">
                    <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-[65%] -translate-y-[70%] rounded-full bg-blue-300/50" />
                    <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-[5%] -translate-y-[60%] rounded-full bg-blue-400/50" />
                    <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-[50%] -translate-y-[5%] rounded-full bg-blue-200/50" />
                    <div className="absolute left-1/2 top-1/2 h-88 w-88 -translate-x-[2%] -translate-y-[2%] rounded-full bg-blue-500/40" />
                  </div>
                </div>
                <img
                  src="/service_we_offer.png"
                  alt="TalentProbe services overview"
                  className="relative z-10 h-full w-full max-w-[520px] object-contain [transform:scaleX(-1)]"
                  loading="lazy"
                />
              </div>
            </div>
          </SectionInner>
        </ParallaxSection>

        <ParallaxSection
          scrollY={scrollY}
          speed={-0.025}
          className="bg-background"
        >
          <SectionInner>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
              Is Your Resume Good Enough for the Market?
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Check it out before you apply. See whether your CV matches the
              expectations of recruiters, ATS filters, and hiring teams in the
              UAE.
            </p>

            <div className="mt-6 grid w-full gap-3 lg:grid-cols-3">
              {MARKET_CHECK_POINTS.map((point) => (
                <div
                  key={point}
                  className="rounded-2xl border border-border bg-card p-5 shadow-brand-sm"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {point}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild variant="brand" size="lg">
                <a href="#google-sign-in">Check It Out</a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/dashboard">Try the Dashboard</Link>
              </Button>
            </div>
          </SectionInner>
        </ParallaxSection>

        <ParallaxSection
          scrollY={scrollY}
          speed={0.018}
          className="bg-gradient-hero text-primary-foreground"
        >
          <SectionInner className="lg:text-left">
            <div className="mt-2 grid w-full items-start gap-8 lg:grid-cols-[1fr_1fr]">
              <div>
                <div className="flex items-center justify-center gap-3 lg:justify-start">
                  <CircleHelp className="h-5 w-5 text-primary-foreground" />
                  <h2 className="text-3xl font-bold text-primary-foreground sm:text-4xl">
                    FAQ
                  </h2>
                </div>
                <p className="mt-3 max-w-xl text-sm leading-7 text-primary-foreground/88 sm:text-base">
                  Find quick answers about how TalentProbe works, when to use each tool, and how to get started fast.
                </p>
              </div>

              <Accordion type="single" collapsible className="w-full">
                {FAQS.map((item, index) => (
                  <AccordionItem
                    key={item.question}
                    value={`faq-${index}`}
                    className="border-b border-primary-foreground/25 text-left"
                  >
                    <AccordionTrigger className="text-left text-base font-semibold text-white hover:no-underline">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-white/90">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </SectionInner>
        </ParallaxSection>

        <ParallaxSection
          scrollY={scrollY}
          speed={-0.015}
          className="bg-background"
        >
          <SectionInner>
            <div className="flex items-center justify-center gap-3">
              <MessageSquareQuote className="h-5 w-5 text-primary" />
            </div>
            <h2 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
              Testimonials and Review
            </h2>
            <div className="mt-8 grid w-full gap-5 lg:grid-cols-3">
              {TESTIMONIALS.map((item) => (
                <article
                  key={item.name}
                  className="rounded-2xl border border-border bg-card p-6 shadow-brand-sm"
                >
                  <div className="flex items-center justify-center gap-1 text-gold-light">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={`${item.name}-${index}`}
                        className="h-4 w-4 fill-current"
                      />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    “{item.quote}”
                  </p>
                  <div className="mt-5">
                    <p className="text-sm font-semibold text-foreground">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.role}</p>
                  </div>
                </article>
              ))}
            </div>
          </SectionInner>
        </ParallaxSection>

        <CommonFooter />
      </main>
    </div>
  );
}
