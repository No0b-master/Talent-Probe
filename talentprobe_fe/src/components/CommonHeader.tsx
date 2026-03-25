import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Activity, Home, LogOut, User } from "lucide-react";

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
  const location = useLocation();
  const [usage, setUsage] = useState<ATSUsage | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);

  const loadUsage = useCallback(async () => {
    if (!isAuthenticated) {
      setUsage(null);
      return;
    }

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
  }, [isAuthenticated]);

  useEffect(() => {
    void loadUsage();
  }, [loadUsage, location.pathname]);

  useEffect(() => {
    const handleUsageRefresh = () => {
      void loadUsage();
    };

    window.addEventListener("usage:refresh", handleUsageRefresh);
    return () => {
      window.removeEventListener("usage:refresh", handleUsageRefresh);
    };
  }, [loadUsage]);

  const usagePercent = usage
    ? Math.min(100, Math.max(0, Math.round((usage.used_today / Math.max(usage.daily_limit, 1)) * 100)))
    : 0;
  const remainingScans = usage ? Math.max(0, usage.remaining_today) : null;
  const isUsageExceeded = usage ? remainingScans === 0 || usage.used_today >= usage.daily_limit : false;

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm shadow-brand-sm">
      <UAEFlagStrip className="rounded-none h-1.5" />
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-3 sm:px-5">
        <Link
          to={isAuthenticated ? "/dashboard" : "/"}
          className="flex items-center gap-3"
          aria-label={isAuthenticated ? "Go to dashboard" : "Go to home"}
        >
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
        </Link>

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
                      <span
                        className={
                          isUsageExceeded
                            ? "absolute -right-1 -top-1 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-semibold leading-none text-destructive-foreground"
                            : "absolute -right-1 -top-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground"
                        }
                      >
                        {isUsageExceeded ? "!" : remainingScans}
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
                          ? isUsageExceeded
                            ? "Daily limit reached. No scans left today."
                            : `${remainingScans} runs remaining`
                          : "Usage unavailable"}
                    </p>
                    {!usageLoading && usage && isUsageExceeded && (
                      <p className="rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
                        Scan quota exhausted for today. Please try again tomorrow or upgrade your plan.
                      </p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              <Button asChild variant="outline" size="icon" aria-label="Go to dashboard">
                <Link to="/dashboard">
                  <Home className="h-4 w-4" />
                </Link>
              </Button>

              {showProfileButton && (
                <Button asChild variant="outline" size="sm" className="gap-1.5">
                  <Link to="/plans">Plans</Link>
                </Button>
              )}

              {showProfileButton && (
                <Button asChild variant="outline" size="icon" aria-label="Go to profile">
                  <Link to="/profile">
                    <User className="h-4 w-4" />
                  </Link>
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
