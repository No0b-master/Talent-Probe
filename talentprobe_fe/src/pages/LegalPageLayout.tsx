import { CommonHeader } from "@/components/CommonHeader";
import { CommonFooter } from "@/components/CommonFooter";

interface LegalSection {
  title: string;
  paragraphs: string[];
}

interface LegalPageLayoutProps {
  title: string;
  effectiveDate: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
}

export default function LegalPageLayout({
  title,
  effectiveDate,
  lastUpdated,
  intro,
  sections,
}: LegalPageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <CommonHeader showProfileButton={false} />

      <main className="flex-1">
        <section className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-10">
            <header className="border-b border-border pb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Legal</p>
              <h1 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl">{title}</h1>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                <p>Effective date: {effectiveDate}</p>
                <p>Last updated: {lastUpdated}</p>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{intro}</p>
            </header>

            <div className="mt-8 space-y-7">
              {sections.map((section) => (
                <section key={section.title} className="space-y-3">
                  <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-7 text-muted-foreground sm:text-base">
                      {paragraph}
                    </p>
                  ))}
                </section>
              ))}
            </div>

            <div className="mt-10 rounded-xl border border-amber-300/50 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
              These policy pages are provided for transparency and user notice. They are not legal advice. Please review
              them with a qualified legal professional to ensure full compliance for your company and jurisdictions.
            </div>
          </div>
        </section>
      </main>

      <CommonFooter />
    </div>
  );
}
