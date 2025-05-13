import { MainLayout } from "@/components/layout/main-layout";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScheduleTable } from "@/components/admin/schedule-table";
import { Doctor, Schedule } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScheduleForm } from "@/components/admin/schedule-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OptimizationSuggestions } from "@/components/admin/optimization-suggestions";

export default function DoctorSchedules() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [showAddScheduleDialog, setShowAddScheduleDialog] = useState(false);

  const { data: doctors, isLoading: isLoadingDoctors } = useQuery<Doctor[]>({
    queryKey: ["/api/doctors"],
  });

  const { data: schedules, isLoading: isLoadingSchedules } = useQuery<Schedule[]>({
    queryKey: ["/api/schedules"],
    // This would actually fetch all schedules in a real app
    // For now it's a placeholder since we don't have that API endpoint defined
  });

  // Filter doctors based on selected specialty
  const filteredDoctors = doctors?.filter(doctor => {
    if (selectedSpecialty === "all") return true;
    return doctor.specialty === selectedSpecialty;
  });

  // Get unique specialties from doctors data
  const specialties = doctors?.reduce((acc: string[], doctor) => {
    if (!acc.includes(doctor.specialty)) {
      acc.push(doctor.specialty);
    }
    return acc;
  }, []) || [];

  return (
    <MainLayout title="Doctor Schedules">
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-5 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Doctor Schedules</h3>
          <div className="flex space-x-2">
            <Select
              value={selectedSpecialty}
              onValueChange={setSelectedSpecialty}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Doctors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.map(specialty => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty.charAt(0).toUpperCase() + specialty.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setShowAddScheduleDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Schedule
            </Button>
          </div>
        </div>
        <div className="p-5">
          <ScheduleTable 
            doctors={filteredDoctors} 
            schedules={schedules}
            isLoading={isLoadingDoctors || isLoadingSchedules} 
          />
        </div>
      </div>
      
      <OptimizationSuggestions />

      {/* Add Schedule Dialog */}
      <Dialog open={showAddScheduleDialog} onOpenChange={setShowAddScheduleDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Doctor Schedule</DialogTitle>
            <DialogDescription>
              Create a new schedule for a doctor
            </DialogDescription>
          </DialogHeader>
          <ScheduleForm 
            doctors={doctors || []} 
            onSuccess={() => setShowAddScheduleDialog(false)} 
          />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
