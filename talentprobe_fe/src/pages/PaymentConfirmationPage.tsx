import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { api } from "@/lib/api";

export default function PaymentConfirmationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planCode = searchParams.get("plan");

  useEffect(() => {
    if (!planCode) {
      navigate("/payment/error?reason=missing_plan", { replace: true });
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        const res = await api.plans.subscribe(planCode);
        if (res.success) {
          navigate(`/payment/success?plan=${encodeURIComponent(planCode)}`, { replace: true });
          return;
        }

        navigate(`/payment/error?plan=${encodeURIComponent(planCode)}&reason=confirmation_failed`, { replace: true });
      } catch (err: unknown) {
        const reason = err instanceof Error ? err.message : "confirmation_failed";
        navigate(`/payment/error?plan=${encodeURIComponent(planCode)}&reason=${encodeURIComponent(reason)}`, {
          replace: true,
        });
      }
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [navigate, planCode]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <section className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-brand-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Checking payment confirmation</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Please wait while we verify your payment status. This usually takes a few seconds.
        </p>
        <p className="mt-6 text-xs uppercase tracking-wide text-muted-foreground">Verifying in approximately 5 seconds</p>
      </section>
    </main>
  );
}
