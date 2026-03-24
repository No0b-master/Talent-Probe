import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Activity, LogOut } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { api, type ATSUsage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/BrandMark";
import { UAEFlagStrip } from "@/components/UAEFlag";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CommonHeaderProps {
  showProfileButton?: boolean;
}

export function CommonHeader({ showProfileButton = true }: CommonHeaderProps) {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [usage, setUsage] = useState<ATSUsage | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadUsage = async () => {
      if (!isAuthenticated) {
        setUsage(null);
        return;
      }

      setUsageLoading(true);
      try {
        const res = await api.ats.usage();
        if (mounted && res.success) {
          setUsage(res.data);
        }
      } catch {
        if (mounted) {
          setUsage(null);
        }
      } finally {
        if (mounted) {
          setUsageLoading(false);
        }
      }
    };

    void loadUsage();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const usagePercent = usage
    ? Math.min(100, Math.max(0, Math.round((usage.used_today / Math.max(usage.daily_limit, 1)) * 100)))
    : 0;

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm shadow-brand-sm">
      <UAEFlagStrip className="rounded-none h-1.5" />
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <BrandMark className="h-10 w-10" />
          <div className="flex items-baseline gap-2">
           
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-extrabold leading-none tracking-tight text-[#164B81]">Talent</span>
              <span className="text-2xl font-extrabold leading-none tracking-tight text-[#3E9EC2]">Probe</span>
            </div>
             {isAuthenticated && usage?.current_plan_name && (
              <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                {usage.current_plan_name}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="relative"
                    aria-label="View AI usage"
                  >
                    <Activity className="h-4 w-4" />
                    {usage && (
                      <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground">
                        {usage.remaining_today}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-64">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">AI Usage Today</p>
                    <p className="text-sm font-semibold text-foreground">
                      {usageLoading
                        ? "Loading..."
                        : usage
                          ? `${usage.used_today}/${usage.daily_limit}`
                          : "--/--"}
                    </p>
                    <div className="h-2 w-full rounded-full bg-secondary">
                      <div
                        className={
                          usagePercent >= 90
                            ? "h-full rounded-full bg-destructive"
                            : usagePercent >= 70
                              ? "h-full rounded-full bg-accent"
                              : "h-full rounded-full bg-primary"
                        }
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {usageLoading
                        ? "Checking quota..."
                        : usage
                          ? `${usage.remaining_today} runs remaining`
                          : "Usage unavailable"}
                    </p>
                  </div>
                </PopoverContent>
              </Popover>

              {showProfileButton && (
                <Button asChild variant="outline" size="sm" className="gap-1.5">
                  <Link to="/plans">Plans</Link>
                </Button>
              )}

              {showProfileButton && (
                <Button asChild variant="outline" size="sm" className="gap-1.5">
                  <Link to="/profile">Profile</Link>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5 text-muted-foreground hover:border-destructive hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Button asChild variant="brand">
              <Link to="/dashboard">Try for Free</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
