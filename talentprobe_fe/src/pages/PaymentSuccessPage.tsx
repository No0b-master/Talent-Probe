import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get("plan");

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("usage:refresh"));

    const timeout = window.setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 2500);

    return () => window.clearTimeout(timeout);
  }, [navigate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <section className="w-full max-w-lg rounded-2xl border border-emerald-300/40 bg-card p-8 text-center shadow-brand-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Payment confirmed</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Your subscription has been activated{selectedPlan ? ` for ${selectedPlan}.` : "."} You will be redirected to
          your dashboard shortly.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link to="/plans">Back to plans</Link>
          </Button>
          <Button asChild variant="brand">
            <Link to="/dashboard">Go to dashboard now</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
