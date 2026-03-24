import { useEffect, useState } from "react";

import { CommonHeader } from "@/components/CommonHeader";
import { CommonFooter } from "@/components/CommonFooter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api, type CurrentSubscription, type SubscriptionPlan } from "@/lib/api";

function formatPrice(priceUsd: number): string {
  if (priceUsd <= 0) {
    return "Free";
  }
  return `$${priceUsd.toFixed(0)}`;
}

export default function PaymentPlansPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submittingCode, setSubmittingCode] = useState<string | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [current, setCurrent] = useState<CurrentSubscription | null>(null);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const [plansRes, currentRes] = await Promise.all([
        api.plans.list(),
        api.plans.current(),
      ]);
      if (plansRes.success) {
        setPlans(plansRes.data);
      }
      if (currentRes.success) {
        setCurrent(currentRes.data);
      }
    } catch (err: unknown) {
      toast({
        title: "Unable to load plans",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPlans();
  }, []);

  const handleSubscribe = async (planCode: string) => {
    setSubmittingCode(planCode);
    try {
      const res = await api.plans.subscribe(planCode);
      if (res.success) {
        setCurrent(res.data);
        toast({
          title: "Plan activated",
          description: `${res.data.current_plan_name} is active for 30 days.`,
        });
      }
    } catch (err: unknown) {
      toast({
        title: "Unable to activate plan",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setSubmittingCode(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <CommonHeader />

      <main className="mx-auto max-w-7xl px-3 py-8 sm:px-5">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Payment Plans & Packages</h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Choose a plan for a 30-day period. After expiry, your account resets to Basic automatically.
          </p>
          {current && (
            <p className="mt-3 inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              Current Plan: {current.current_plan_name} ({current.daily_limit} scans/day)
            </p>
          )}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-brand-sm">
            <p className="text-sm text-muted-foreground">Loading plans...</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => {
              const isCurrent = current?.current_plan_code === plan.plan_code;
              return (
                <article
                  key={plan.plan_code}
                  className={`rounded-2xl border bg-card p-6 shadow-brand-sm ${isCurrent ? "border-primary" : "border-border"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-xl font-bold text-foreground">{plan.plan_name}</h2>
                    {isCurrent && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                        Active
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-3xl font-extrabold text-foreground">{formatPrice(plan.price_usd)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Per 30 days</p>

                  <ul className="mt-5 space-y-2 text-sm text-foreground">
                    <li>{plan.daily_limit} AI scans per day</li>
                    <li>Plan duration: {plan.duration_days} days</li>
                    <li>Auto reset to Basic after expiry</li>
                  </ul>

                  <Button
                    type="button"
                    variant={isCurrent ? "outline" : "brand"}
                    className="mt-6 w-full"
                    disabled={isCurrent || submittingCode === plan.plan_code}
                    onClick={() => handleSubscribe(plan.plan_code)}
                  >
                    {isCurrent
                      ? "Current Plan"
                      : submittingCode === plan.plan_code
                        ? "Activating..."
                        : `Choose ${plan.plan_name}`}
                  </Button>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <CommonFooter />
    </div>
  );
}
