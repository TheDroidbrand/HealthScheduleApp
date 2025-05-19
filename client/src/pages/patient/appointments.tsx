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

export default function PatientAppointments() {
  const { user } = useAuth();

  // Fetch appointments using the user's ID directly
  const { data: appointments = [], isLoading } = useQuery<FirebaseAppointment[]>({
    queryKey: ["appointments", user?.id],
    queryFn: () => appointmentService.getPatientAppointments(user?.id || ""),
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
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
    <MainLayout title="My Appointments">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Appointments</h1>
          <Button asChild>
            <Link href="/patient/doctors">Book New Appointment</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading appointments...</p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
                {upcomingAppointments.length === 0 ? (
                  <p className="text-muted-foreground">No upcoming appointments</p>
                ) : (
                  <div className="grid gap-4">
                    {upcomingAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="bg-white rounded-lg shadow p-4 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <User className="h-8 w-8 text-primary" />
                            <div>
                              <h3 className="font-medium">
                                {getDoctorName(appointment.doctorId)}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {appointment.type}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(appointment.status)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {formatDate(appointment.date)}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {formatTime(appointment.time)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Past Appointments</h2>
                {pastAppointments.length === 0 ? (
                  <p className="text-muted-foreground">No past appointments</p>
                ) : (
                  <div className="grid gap-4">
                    {pastAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="bg-white rounded-lg shadow p-4 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <User className="h-8 w-8 text-primary" />
                            <div>
                              <h3 className="font-medium">
                                {getDoctorName(appointment.doctorId)}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {appointment.type}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(appointment.status)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {formatDate(appointment.date)}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {formatTime(appointment.time)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
