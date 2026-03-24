import { Facebook, Instagram, Linkedin, Mail, Phone, Youtube } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";

export function CommonFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-primary-foreground/10 bg-gradient-hero text-primary-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid w-full gap-8 lg:grid-cols-[1.2fr_1fr] lg:text-left">
          <div>
            <div className="flex items-center justify-center gap-3 lg:justify-start">
              <BrandMark className="h-12 w-12 border border-primary-foreground/15 bg-card/10 text-sm shadow-brand-sm" />
              <div>
                <h2 className="text-xl font-bold text-primary-foreground">TalentProbe</h2>
                <p className="text-sm text-primary-foreground/90">AI resume intelligence for the UAE market</p>
              </div>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-primary-foreground/92">
              Built to help candidates understand whether their CV is ready for ATS screening, profession-fit analysis,
              and role-specific improvement before they apply.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-primary-foreground/90">Contact Us</h3>
            <div className="mt-4 space-y-3 text-sm text-primary-foreground/92">
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>Phone: +971 503093218</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Email: info@taleeftech.com</span>
              </p>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-primary-foreground/92">
              Need help or have a question?
              <br />
              Contact us at: info@taleeftech.com
            </p>

            <div className="mt-6 flex items-center gap-3 text-primary-foreground">
              <a
                href="#"
                aria-label="Facebook"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary-foreground/30 text-primary-foreground transition hover:bg-primary-foreground/12"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary-foreground/30 text-primary-foreground transition hover:bg-primary-foreground/12"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary-foreground/30 text-primary-foreground transition hover:bg-primary-foreground/12"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary-foreground/30 text-primary-foreground transition hover:bg-primary-foreground/12"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-primary-foreground/85">
          Copyright {"\u00A9"} {year} Taleef Technologies. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
