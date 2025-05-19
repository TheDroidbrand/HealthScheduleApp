import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "@/lib/protected-route";
import AuthPage from "@/pages/auth-page";
import { FirebaseUser } from "@/types/firebase";

// Patient Pages
import PatientDashboard from "@/pages/patient/dashboard";
import PatientDoctors from "@/pages/patient/doctors";
import PatientAppointments from "@/pages/patient/appointments";
import PatientProfile from "@/pages/patient/profile";
import PatientMedicalRecords from "@/pages/patient/medical-records";

// Doctor Pages
import DoctorDashboard from "@/pages/doctor/dashboard";
import DoctorAppointments from "@/pages/doctor/appointments";
import DoctorSchedule from "@/pages/doctor/schedule";
import DoctorMedicalRecords from "@/pages/doctor/medical-records";
import DoctorOnboarding from "@/pages/doctor/onboarding";

// Admin Pages
import AdminDashboard from "@/pages/admin/dashboard";
import AdminAppointments from "@/pages/admin/appointments";
import AdminDoctorSchedules from "@/pages/admin/doctor-schedules";
import AdminAnalytics from "@/pages/admin/analytics";
import AdminSettings from "@/pages/admin/settings";

function RootRedirect() {
  const { user } = useAuth();
  
  if (!user) {
    return <AuthPage />;
  }

  switch (user.role) {
    case "doctor":
      return <DoctorDashboard />;
    case "admin":
      return <AdminDashboard />;
    default:
      return <PatientDashboard />;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Switch>
            <Route path="/auth" component={AuthPage} />

            {/* Patient Routes */}
            <Route path="/patient">
              <ProtectedRoute requiredRole="patient">
                <PatientDashboard />
              </ProtectedRoute>
            </Route>
            <Route path="/patient/doctors">
              <ProtectedRoute requiredRole="patient">
                <PatientDoctors />
              </ProtectedRoute>
            </Route>
            <Route path="/patient/appointments">
              <ProtectedRoute requiredRole="patient">
                <PatientAppointments />
              </ProtectedRoute>
            </Route>
            <Route path="/patient/profile">
              <ProtectedRoute requiredRole="patient">
                <PatientProfile />
              </ProtectedRoute>
            </Route>
            <Route path="/patient/medical-records">
              <ProtectedRoute requiredRole="patient">
                <PatientMedicalRecords />
              </ProtectedRoute>
            </Route>

            {/* Doctor Routes */}
            <Route path="/doctor">
              <ProtectedRoute requiredRole="doctor">
                <DoctorDashboard />
              </ProtectedRoute>
            </Route>
            <Route path="/doctor/appointments">
              <ProtectedRoute requiredRole="doctor">
                <DoctorAppointments />
              </ProtectedRoute>
            </Route>
            <Route path="/doctor/schedule">
              <ProtectedRoute requiredRole="doctor">
                <DoctorSchedule />
              </ProtectedRoute>
            </Route>
            <Route path="/doctor/medical-records">
              <ProtectedRoute requiredRole="doctor">
                <DoctorMedicalRecords />
              </ProtectedRoute>
            </Route>
            <Route path="/doctor/onboarding">
              <ProtectedRoute requiredRole="doctor">
                <DoctorOnboarding />
              </ProtectedRoute>
            </Route>

            {/* Admin Routes */}
            <Route path="/admin">
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            </Route>
            <Route path="/admin/appointments">
              <ProtectedRoute requiredRole="admin">
                <AdminAppointments />
              </ProtectedRoute>
            </Route>
            <Route path="/admin/doctor-schedules">
              <ProtectedRoute requiredRole="admin">
                <AdminDoctorSchedules />
              </ProtectedRoute>
            </Route>
            <Route path="/admin/analytics">
              <ProtectedRoute requiredRole="admin">
                <AdminAnalytics />
              </ProtectedRoute>
            </Route>
            <Route path="/admin/settings">
              <ProtectedRoute requiredRole="admin">
                <AdminSettings />
              </ProtectedRoute>
            </Route>

            {/* Redirect root to appropriate dashboard */}
            <Route path="/">
              <ProtectedRoute>
                <RootRedirect />
              </ProtectedRoute>
            </Route>

            <Route component={NotFound} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

