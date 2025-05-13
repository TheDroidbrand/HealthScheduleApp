import { MainLayout } from "@/components/layout/main-layout";
import { AppointmentList } from "@/components/appointments/appointment-list";
import { useQuery } from "@tanstack/react-query";
import { Appointment } from "@shared/schema";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PatientAppointments() {
  const [filter, setFilter] = useState<string>("upcoming");
  
  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  // Filter appointments based on selected filter
  const filteredAppointments = appointments?.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (filter === "upcoming") {
      return appointmentDate >= today && appointment.status !== "cancelled";
    }
    if (filter === "past") {
      return appointmentDate < today && appointment.status !== "cancelled";
    }
    if (filter === "cancelled") {
      return appointment.status === "cancelled";
    }
    return true;
  });

  return (
    <MainLayout title="My Appointments">
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">My Appointments</h3>
          <div className="flex space-x-2">
            <Select
              value={filter}
              onValueChange={(value) => setFilter(value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="p-5">
          <AppointmentList 
            appointments={filteredAppointments} 
            isLoading={isLoading}
            type={filter}
          />
        </div>
      </div>
    </MainLayout>
  );
}
