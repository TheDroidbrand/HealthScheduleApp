import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { StatsCard } from "@/components/dashboard/stats-card";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, MessageSquare, Stethoscope } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime } from "@/lib/utils";
import { format } from "date-fns";
import { appointmentService, userService } from "@/lib/firebase-service";
import { Link } from "wouter";
import { FirebaseAppointment, FirebaseDoctor } from "@/types/firebase";
import { SpecialtyCard } from "@/components/dashboard/specialty-card";

export default function DoctorDashboard() {
  const { user } = useAuth();

  const { data: appointments = [], isLoading: isLoadingAppointments } = useQuery<FirebaseAppointment[]>({
    queryKey: ["appointments", user?.id],
    queryFn: () => appointmentService.getDoctorAppointments(user?.id || ""),
    enabled: !!user?.id,
  });

  const { data: doctors = [] } = useQuery<FirebaseDoctor[]>({
    queryKey: ["doctors"],
    queryFn: () => userService.getAllDoctors(),
  });

  // Filter appointments by status and date
  const upcomingAppointments = appointments?.filter(
    (appointment) => 
      new Date(appointment.date) > new Date() && 
      appointment.status !== "completed" && 
      appointment.status !== "cancelled"
  ) || [];

  const todayAppointments = appointments?.filter(
    (appointment) =>
      format(new Date(appointment.date), "yyyy-MM-dd") ===
      format(new Date(), "yyyy-MM-dd") &&
      appointment.status !== "completed" &&
      appointment.status !== "cancelled"
  ) || [];

  const completedAppointments = appointments?.filter(
    (appointment) => 
      appointment.status === "completed" || 
      appointment.status === "cancelled"
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];

  const nextAppointment = upcomingAppointments[0];

  // Get unique specialties from doctors
  const specialties = doctors?.reduce((acc: { title: string; icon: typeof Stethoscope; specialty: string; count: number }[], doctor) => {
    const existingSpecialty = acc.find(s => s.specialty === doctor.specialty);
    if (existingSpecialty) {
      existingSpecialty.count++;
    } else {
      acc.push({
        title: doctor.specialty,
        icon: Stethoscope,
        specialty: doctor.specialty,
        count: 1
      });
    }
    return acc;
  }, []) || [];

  return (
    <MainLayout title="Doctor Dashboard">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/doctor/appointments">View All Appointments</Link>
            </Button>
            <Button asChild>
              <Link href="/doctor/medical-records">View Patients</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Today's Appointments"
            value={todayAppointments.length.toString()}
            icon={Calendar}
            description="Scheduled for today"
          />
          <StatsCard
            title="Upcoming Appointments"
            value={upcomingAppointments.length.toString()}
            icon={Clock}
            description="Scheduled for future"
          />
          <StatsCard
            title="Past Appointments"
            value={(appointments.length - upcomingAppointments.length).toString()}
            icon={MessageSquare}
            description="Completed appointments"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Next Appointment</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAppointments ? (
                <div>Loading appointments...</div>
              ) : nextAppointment ? (
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={nextAppointment.patientAvatar} />
                    <AvatarFallback>
                      {nextAppointment.patientName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{nextAppointment.patientName}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(nextAppointment.date)} at{" "}
                      {formatTime(nextAppointment.time)}
                    </div>
                    <div className="mt-2">
                      <Badge variant="secondary">
                        {nextAppointment.type}
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">No upcoming appointments</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAppointments ? (
                <div>Loading schedule...</div>
              ) : todayAppointments.length > 0 ? (
                <div className="space-y-4">
                  {todayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={appointment.patientAvatar} />
                          <AvatarFallback>
                            {appointment.patientName
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {appointment.patientName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatTime(appointment.time)}
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary">{appointment.type}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground">No appointments scheduled for today</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {specialties.map(({ title, icon, specialty, count }) => (
            <SpecialtyCard
              key={specialty}
              title={title}
              icon={icon}
              specialty={specialty}
              count={count}
            />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}