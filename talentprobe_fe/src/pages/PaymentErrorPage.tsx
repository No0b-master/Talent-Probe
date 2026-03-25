import { AlertTriangle } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/button";

function formatReason(reason: string | null): string {
  if (!reason) {
    return "Payment confirmation failed. Please try again.";
  }

  if (reason === "missing_plan") {
    return "No plan was selected for confirmation. Please choose a plan again.";
  }

  if (reason === "confirmation_failed") {
    return "We could not verify your payment status. Please try again.";
  }

  return reason;
}

export default function PaymentErrorPage() {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get("reason");

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <section className="w-full max-w-lg rounded-2xl border border-destructive/40 bg-card p-8 text-center shadow-brand-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Payment not confirmed</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{formatReason(reason)}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild variant="outline">
            <Link to="/dashboard">Back to dashboard</Link>
          </Button>
          <Button asChild variant="brand">
            <Link to="/plans">Try payment again</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
