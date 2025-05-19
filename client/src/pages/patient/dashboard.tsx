import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { appointmentService, userService } from "@/lib/firebase-service";
import { FirebaseAppointment, FirebaseDoctor } from "@/types/firebase";
import { formatDate, formatTime } from "@/lib/utils";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User } from "lucide-react";
import { Link } from "wouter";

export default function PatientDashboard() {
  const { user } = useAuth();

  // Fetch appointments using the user's ID directly
  const { data: appointments = [], isLoading } = useQuery<FirebaseAppointment[]>({
    queryKey: ["appointments", user?.id],
    queryFn: () => appointmentService.getPatientAppointments(user?.id || ""),
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds instead of 5
    staleTime: 15000, // Consider data fresh for 15 seconds
    gcTime: 5 * 60 * 1000, // Keep data in cache for 5 minutes
  });

  const { data: doctors = [] } = useQuery<FirebaseDoctor[]>({
    queryKey: ["doctors"],
    queryFn: () => userService.getAllDoctors(),
  });

  // Filter appointments by status and date
  const upcomingAppointments = (appointments || []).filter(
    (appointment: FirebaseAppointment) => {
      const appointmentDate = new Date(appointment.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return appointmentDate >= today && 
             appointment.status !== "completed" && 
             appointment.status !== "cancelled";
    }
  ).sort((a: FirebaseAppointment, b: FirebaseAppointment) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastAppointments = (appointments || []).filter(
    (appointment: FirebaseAppointment) => {
      const appointmentDate = new Date(appointment.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return appointmentDate < today || 
             appointment.status === "completed" || 
             appointment.status === "cancelled";
    }
  ).sort((a: FirebaseAppointment, b: FirebaseAppointment) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    return doctor ? `Dr. ${doctor.fullName}` : "Unknown Doctor";
  };

  return (
    <MainLayout title="Patient Dashboard">
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Upcoming Appointments</h3>
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">No upcoming appointments</p>
                <Button asChild>
                  <Link href="/patient/doctors">Find a Doctor</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.slice(0, 3).map((appointment) => (
                  <div key={appointment.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{getDoctorName(appointment.doctorId)}</span>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(appointment.date)}
                      </div>
                      <div className="flex items-center mt-1">
                        <Clock className="h-4 w-4 mr-2" />
                        {formatTime(appointment.time)}
                      </div>
                    </div>
                  </div>
                ))}
                {upcomingAppointments.length > 3 && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/patient/appointments">View All</Link>
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Recent Appointments</h3>
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : pastAppointments.length === 0 ? (
              <p className="text-muted-foreground">No past appointments</p>
            ) : (
              <div className="space-y-4">
                {pastAppointments.slice(0, 3).map((appointment) => (
                  <div key={appointment.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{getDoctorName(appointment.doctorId)}</span>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(appointment.date)}
                      </div>
                      <div className="flex items-center mt-1">
                        <Clock className="h-4 w-4 mr-2" />
                        {formatTime(appointment.time)}
                      </div>
                    </div>
                  </div>
                ))}
                {pastAppointments.length > 3 && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/patient/appointments">View All</Link>
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
            <div className="space-y-4">
              <Button className="w-full" asChild>
                <Link href="/patient/doctors">Book New Appointment</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/patient/appointments">View All Appointments</Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/patient/profile">Update Profile</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
