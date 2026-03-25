import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import PaymentPlansPage from "./pages/PaymentPlansPage";
import PaymentConfirmationPage from "./pages/PaymentConfirmationPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentErrorPage from "./pages/PaymentErrorPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import RefundPolicyPage from "./pages/RefundPolicyPage";
import UserDataPrivacyPolicyPage from "./pages/UserDataPrivacyPolicyPage";
import TermsAndConditionsPage from "./pages/TermsAndConditionsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Redirect authenticated users away from public entry routes
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/plans"
        element={
          <ProtectedRoute>
            <PaymentPlansPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment/confirmation"
        element={
          <ProtectedRoute>
            <PaymentConfirmationPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment/success"
        element={
          <ProtectedRoute>
            <PaymentSuccessPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment/error"
        element={
          <ProtectedRoute>
            <PaymentErrorPage />
          </ProtectedRoute>
        }
      />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/refund-policy" element={<RefundPolicyPage />} />
      <Route path="/user-data-privacy-policy" element={<UserDataPrivacyPolicyPage />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
      <Route path="/terms-and-condition" element={<TermsAndConditionsPage />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
