import { MainLayout } from "@/components/layout/main-layout";
import { StatsCard } from "@/components/dashboard/stats-card";
import { AppointmentTable } from "@/components/admin/appointment-table";
import { OptimizationMetrics } from "@/components/admin/optimization-metrics";
import { ActivityLog } from "@/components/admin/activity-log";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, Clock, Users, TrendingUp } from "lucide-react";

interface SystemStats {
  totalAppointments: number;
  doctorsOnDuty: number;
  averageWaitTime: number;
  efficiency: number;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<SystemStats>({
    queryKey: ["/api/stats"],
  });
  
  const { data: appointments } = useQuery({
    queryKey: ["/api/appointments"],
  });

  const departmentPerformance = [
    { name: "Cardiology", efficiency: 87, appointments: 128, color: "bg-primary-500" },
    { name: "Dermatology", efficiency: 91, appointments: 95, color: "bg-secondary-500" },
    { name: "Neurology", efficiency: 83, appointments: 76, color: "bg-amber-500" },
    { name: "Pediatrics", efficiency: 94, appointments: 142, color: "bg-green-500" },
    { name: "Orthopedics", efficiency: 79, appointments: 89, color: "bg-red-500" },
  ];

  return (
    <MainLayout title="Admin Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Appointments"
          value={stats?.totalAppointments?.toString() || "0"}
          description="8% increase from yesterday"
          icon={<CalendarCheck className="h-5 w-5" />}
          iconColor="text-primary-600"
          iconBgColor="bg-primary-100"
        />
        
        <StatsCard
          title="Doctors On Duty"
          value={stats?.doctorsOnDuty?.toString() || "0"}
          description="2% decrease from yesterday"
          icon={<Users className="h-5 w-5" />}
          iconColor="text-secondary-600"
          iconBgColor="bg-secondary-100"
        />
        
        <StatsCard
          title="Avg Wait Time"
          value={`${stats?.averageWaitTime || 0} min`}
          description="15% decrease from last week"
          icon={<Clock className="h-5 w-5" />}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-100"
        />
        
        <StatsCard
          title="Efficiency"
          value={`${stats?.efficiency || 0}%`}
          description="4% increase from last week"
          icon={<TrendingUp className="h-5 w-5" />}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <AppointmentTable appointments={appointments} />
        </div>
        
        <div>
          <OptimizationMetrics />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Department Performance</h3>
            <select className="text-sm rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50">
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>
          <div className="p-5">
            <div className="space-y-4">
              {departmentPerformance.map((dept, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${dept.color} mr-3`}></div>
                    <div>
                      <div className="font-medium">{dept.name}</div>
                      <div className="text-sm text-gray-500">{dept.efficiency}% efficiency</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{dept.appointments}</div>
                    <div className="text-sm text-gray-500">appointments</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-5 pt-4 border-t border-gray-200">
              <button className="w-full px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors">
                View Detailed Report
              </button>
            </div>
          </div>
        </div>
        
        <ActivityLog />
      </div>
    </MainLayout>
  );
}
