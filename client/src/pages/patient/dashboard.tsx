import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { StatsCard } from "@/components/dashboard/stats-card";
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments";
import { SpecialtyCard } from "@/components/dashboard/specialty-card";
import { Calendar, Cross, Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Appointment } from "@shared/schema";

export default function PatientDashboard() {
  const { user } = useAuth();
  
  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
    enabled: !!user,
  });

  // Get upcoming appointments from today onwards
  const upcomingAppointments = appointments?.filter(a => {
    const appointmentDate = new Date(a.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointmentDate >= today;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Get the next upcoming appointment
  const nextAppointment = upcomingAppointments?.[0];

  return (
    <MainLayout title="Patient Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatsCard 
          title="Upcoming Appointment"
          value={nextAppointment ? "Tomorrow" : "None"}
          description={nextAppointment ? "10:30 AM with Dr. Johnson" : "No upcoming appointments"}
          icon={<Calendar className="h-5 w-5" />}
          iconColor="text-primary-600"
          iconBgColor="bg-primary-100"
        />
        
        <StatsCard 
          title="Last Checkup"
          value="2 weeks ago"
          description="Dr. Michael Lee"
          icon={<Cross className="h-5 w-5" />}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        
        <StatsCard 
          title="Health Status"
          value="Good"
          description="No urgent issues"
          icon={<Heart className="h-5 w-5" />}
          iconColor="text-amber-500"
          iconBgColor="bg-amber-100"
        />
      </div>
      
      <UpcomingAppointments 
        appointments={upcomingAppointments} 
        isLoading={isLoading}
      />
      
      <div className="bg-white rounded-lg shadow mt-6">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Recommended Specialists</h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <SpecialtyCard 
              title="Cardiology"
              description="Heart health specialists"
              imageUrl="https://images.unsplash.com/photo-1551076805-e1869033e561?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
            />
            
            <SpecialtyCard 
              title="Neurology"
              description="Brain and nervous system"
              imageUrl="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            />
            
            <SpecialtyCard 
              title="Dermatology"
              description="Skin, hair and nails"
              imageUrl="https://images.unsplash.com/photo-1530497610245-94d3c16cda28?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
