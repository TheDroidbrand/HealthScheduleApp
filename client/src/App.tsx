import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import AuthPage from "@/pages/auth-page";

// Patient Pages
import PatientDashboard from "@/pages/patient/dashboard";
import PatientDoctors from "@/pages/patient/doctors";
import PatientAppointments from "@/pages/patient/appointments";
import PatientProfile from "@/pages/patient/profile";

// Doctor Pages
import DoctorDashboard from "@/pages/doctor/dashboard";
import DoctorAppointments from "@/pages/doctor/appointments";

// Admin Pages
import AdminDashboard from "@/pages/admin/dashboard";
import AdminAppointments from "@/pages/admin/appointments";
import AdminDoctorSchedules from "@/pages/admin/doctor-schedules";
import AdminAnalytics from "@/pages/admin/analytics";
import AdminSettings from "@/pages/admin/settings";

import { useAuth } from "@/hooks/use-auth";

function Router() {
  const { user } = useAuth();
  
  // Determine homepage based on user role
  const HomePage = () => {
    if (!user) return <Redirect to="/auth" />;
    
    switch (user.role) {
      case "doctor":
        return <Redirect to="/doctor" />;
      case "admin":
        return <Redirect to="/admin" />;
      default:
        return <PatientDashboard />;
    }
  };
  
  return (
    <Switch>
      {/* Auth Routes */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Home Route - Redirects based on user role */}
      <ProtectedRoute path="/" component={HomePage} />
      
      {/* Patient Routes */}
      <ProtectedRoute path="/patient" component={PatientDashboard} />
      <ProtectedRoute path="/doctors" component={PatientDoctors} />
      <ProtectedRoute path="/appointments" component={PatientAppointments} />
      <ProtectedRoute path="/profile" component={PatientProfile} />
      
      {/* Doctor Routes */}
      <ProtectedRoute path="/doctor" component={DoctorDashboard} />
      <ProtectedRoute path="/doctor/appointments" component={DoctorAppointments} />
      
      {/* Admin Routes */}
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <ProtectedRoute path="/admin/appointments" component={AdminAppointments} />
      <ProtectedRoute path="/admin/schedules" component={AdminDoctorSchedules} />
      <ProtectedRoute path="/admin/analytics" component={AdminAnalytics} />
      <ProtectedRoute path="/admin/settings" component={AdminSettings} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
