import { MainLayout } from "@/components/layout/main-layout";
import { useState } from "react";
import { AppointmentTable } from "@/components/admin/appointment-table";
import { Button } from "@/components/ui/button";
import { Calendar, Filter, RefreshCw } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Appointment } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AppointmentForm } from "@/components/appointments/appointment-form";

export default function AdminAppointments() {
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");
  const [showAddAppointmentDialog, setShowAddAppointmentDialog] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number>(1);

  const { data: appointments, isLoading, refetch } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  const appointmentCounts = {
    all: appointments?.length || 0,
    confirmed: appointments?.filter(a => a.status === "confirmed").length || 0,
    pending: appointments?.filter(a => a.status === "pending").length || 0,
    cancelled: appointments?.filter(a => a.status === "cancelled").length || 0,
    completed: appointments?.filter(a => a.status === "completed").length || 0,
  };

  // Filter appointments based on selected filter
  const filteredAppointments = appointments?.filter(appointment => {
    if (filter === "all") return true;
    return appointment.status === filter;
  });

  const refreshAppointments = () => {
    refetch();
    toast({
      title: "Refreshed",
      description: "Appointment list has been refreshed",
    });
  };

  return (
    <MainLayout title="Manage Appointments">
      <div className="bg-white rounded-lg shadow mb-6 p-5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex space-x-2">
            <Select
              value={filter}
              onValueChange={setFilter}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Appointments ({appointmentCounts.all})</SelectItem>
                <SelectItem value="confirmed">Confirmed ({appointmentCounts.confirmed})</SelectItem>
                <SelectItem value="pending">Pending ({appointmentCounts.pending})</SelectItem>
                <SelectItem value="cancelled">Cancelled ({appointmentCounts.cancelled})</SelectItem>
                <SelectItem value="completed">Completed ({appointmentCounts.completed})</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={refreshAppointments}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => setShowAddAppointmentDialog(true)}>
            <Calendar className="mr-2 h-4 w-4" />
            Add Appointment
          </Button>
        </div>

        <AppointmentTable 
          appointments={filteredAppointments} 
          isLoading={isLoading} 
          isAdmin={true}
        />
      </div>

      {/* Add Appointment Dialog */}
      <Dialog open={showAddAppointmentDialog} onOpenChange={setShowAddAppointmentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
            <DialogDescription>
              Create a new appointment for a patient
            </DialogDescription>
          </DialogHeader>
          <AppointmentForm 
            doctorId={selectedDoctorId} 
            onSuccess={() => {
              setShowAddAppointmentDialog(false);
              queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
            }} 
          />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
