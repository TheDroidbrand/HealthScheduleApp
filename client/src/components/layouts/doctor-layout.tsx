import { ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { DoctorSidebar } from "@/components/doctors/doctor-sidebar";
import { DoctorHeader } from "@/components/doctors/doctor-header";

interface DoctorLayoutProps {
  children: ReactNode;
}

export function DoctorLayout({ children }: DoctorLayoutProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // Redirect if not a doctor
  if (!user || user.role !== 'doctor') {
    setLocation('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DoctorHeader />
      <div className="flex">
        <DoctorSidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 