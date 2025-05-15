import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { StatsCard } from "@/components/dashboard/stats-card";
import { useQuery } from "@tanstack/react-query";
import { Appointment, Doctor } from "@shared/schema";
import { Calendar, Users, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime } from "@/lib/utils";

export default function DoctorDashboard() {
  const { user } = useAuth();
  
  // Fetch all appointments
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
    enabled: !!user,
  });

  // Fetch doctor profile
  const { data: doctors } = useQuery<Doctor[]>({
    queryKey: ["/api/doctors"],
    enabled: !!user,
  });

  // Find current doctor's profile
  const doctorProfile = doctors?.find(doctor => doctor.userId === user?.id);

  // Filter today's appointments for this doctor
  const today = new Date().toISOString().split('T')[0];
  const todaysAppointments = appointments?.filter(apt => 
    apt.doctorId === doctorProfile?.id && 
    apt.date === today
  ).sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Filter upcoming appointments (not today, but in the future)
  const upcomingAppointments = appointments?.filter(apt => {
    const appointmentDate = new Date(apt.date);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    
    // Only appointments for this doctor
    if (apt.doctorId !== doctorProfile?.id) return false;
    
    // Only future dates, not today
    return appointmentDate > todayDate && apt.date !== today;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Get pending appointments that need confirmation
  const pendingAppointments = appointments?.filter(apt => 
    apt.doctorId === doctorProfile?.id && 
    apt.status === "pending"
  );

  return (
    <MainLayout title="Doctor Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatsCard 
          title="Today's Patients"
          value={`${todaysAppointments?.length || 0}`}
          description="Appointments scheduled for today"
          icon={<Users className="h-5 w-5" />}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        
        <StatsCard 
          title="Pending Requests"
          value={`${pendingAppointments?.length || 0}`}
          description="Appointments waiting for confirmation"
          icon={<AlertCircle className="h-5 w-5" />}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-100"
        />
        
        <StatsCard 
          title="Availability"
          value="3 days"
          description="Mon, Wed, Fri - 9AM to 5PM"
          icon={<Calendar className="h-5 w-5" />}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        
        <StatsCard 
          title="Average Visit Time"
          value="25 min"
          description="Based on your last 30 days"
          icon={<Clock className="h-5 w-5" />}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100"
        />
      </div>
      
      {/* Today's Schedule */}
      <Card className="mb-6">
        <CardHeader className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Today's Schedule</CardTitle>
          <Button variant="outline">View Full Calendar</Button>
        </CardHeader>
        <CardContent className="p-0">
          {todaysAppointments && todaysAppointments.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {todaysAppointments.map((appointment) => (
                <div key={appointment.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarFallback>
                        {appointment.patientId.toString().substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">Patient #{appointment.patientId}</div>
                      <div className="text-sm text-gray-500">{appointment.reason}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium">{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</div>
                      <Badge 
                        variant="outline" 
                        className={
                          appointment.status === "confirmed" 
                            ? "bg-green-100 text-green-800 border-green-200" 
                            : appointment.status === "pending" 
                            ? "bg-amber-100 text-amber-800 border-amber-200"
                            : "bg-red-100 text-red-800 border-red-200"
                        }
                      >
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <h3 className="font-medium text-lg mb-1">No appointments today</h3>
              <p className="text-gray-500 mb-4">You don't have any appointments scheduled for today.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Pending Appointments */}
      <Card className="mb-6">
        <CardHeader className="px-5 py-4 border-b border-gray-200">
          <CardTitle className="text-lg font-semibold">Pending Appointment Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {pendingAppointments && pendingAppointments.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {pendingAppointments.map((appointment) => (
                <div key={appointment.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarFallback>
                        {appointment.patientId.toString().substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">Patient #{appointment.patientId}</div>
                      <div className="text-sm text-gray-500">{appointment.reason}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right mr-4">
                      <div className="font-medium">{formatDate(appointment.date)}</div>
                      <div className="text-sm text-gray-500">{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</div>
                    </div>
                    <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700">
                      Accept
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <h3 className="font-medium text-lg mb-1">No pending requests</h3>
              <p className="text-gray-500">You don't have any appointment requests waiting for your confirmation.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Upcoming Appointments */}
      <Card>
        <CardHeader className="px-5 py-4 border-b border-gray-200">
          <CardTitle className="text-lg font-semibold">Upcoming Appointments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {upcomingAppointments && upcomingAppointments.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {upcomingAppointments.slice(0, 3).map((appointment) => (
                <div key={appointment.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarFallback>
                        {appointment.patientId.toString().substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">Patient #{appointment.patientId}</div>
                      <div className="text-sm text-gray-500">{appointment.reason}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium">{formatDate(appointment.date)}</div>
                      <div className="text-sm text-gray-500">{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</div>
                    </div>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <h3 className="font-medium text-lg mb-1">No upcoming appointments</h3>
              <p className="text-gray-500">You don't have any appointments scheduled for the future.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
}