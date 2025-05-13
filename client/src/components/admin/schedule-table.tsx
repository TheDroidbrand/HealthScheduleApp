import { useState } from "react";
import { Doctor, Schedule } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScheduleForm } from "@/components/admin/schedule-form";

interface ScheduleTableProps {
  doctors?: Doctor[];
  schedules?: Schedule[];
  isLoading: boolean;
}

export function ScheduleTable({ doctors, schedules, isLoading }: ScheduleTableProps) {
  const { toast } = useToast();
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const deleteScheduleMutation = useMutation({
    mutationFn: async (id: number) => {
      // This would delete the schedule in a real app
      await new Promise(resolve => setTimeout(resolve, 500));
      return id;
    },
    onSuccess: () => {
      setShowDeleteDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      toast({
        title: "Schedule deleted",
        description: "The schedule has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete schedule",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditClick = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setShowEditDialog(true);
  };

  const handleDeleteClick = (id: number) => {
    setSelectedScheduleId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedScheduleId) {
      deleteScheduleMutation.mutate(selectedScheduleId);
    }
  };

  // Map day number to day name
  const getDayName = (dayNumber: number) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[dayNumber];
  };

  // Sample schedules for the UI
  const sampleSchedules = [
    { doctorId: 1, dayOfWeek: 1, startTime: "09:00:00", endTime: "17:00:00", isAvailable: true },
    { doctorId: 1, dayOfWeek: 2, startTime: "09:00:00", endTime: "17:00:00", isAvailable: true },
    { doctorId: 1, dayOfWeek: 3, startTime: "09:00:00", endTime: "13:00:00", isAvailable: true },
    { doctorId: 1, dayOfWeek: 4, startTime: "09:00:00", endTime: "17:00:00", isAvailable: true },
    { doctorId: 1, dayOfWeek: 5, startTime: "09:00:00", endTime: "17:00:00", isAvailable: true },
    { doctorId: 2, dayOfWeek: 1, startTime: "10:00:00", endTime: "18:00:00", isAvailable: true },
    { doctorId: 2, dayOfWeek: 2, startTime: "10:00:00", endTime: "18:00:00", isAvailable: true },
    { doctorId: 2, dayOfWeek: 3, startTime: "10:00:00", endTime: "18:00:00", isAvailable: true },
    { doctorId: 3, dayOfWeek: 1, startTime: "08:00:00", endTime: "16:00:00", isAvailable: true },
    { doctorId: 3, dayOfWeek: 2, startTime: "08:00:00", endTime: "16:00:00", isAvailable: true },
  ];

  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monday</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tuesday</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wednesday</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thursday</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Friday</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[1, 2, 3].map((_, index) => (
              <tr key={index}>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="ml-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32 mt-1" />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Skeleton className="h-4 w-20" />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right">
                  <Skeleton className="h-4 w-16 ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Group schedules by doctor
  // In a real app, we would use the actual schedules from the API
  // For now, we'll use the doctors list with sample schedules
  const doctorSchedules = doctors?.map(doctor => {
    const doctorSampleSchedules = sampleSchedules.filter(s => s.doctorId === doctor.id);
    return {
      doctor,
      schedules: doctorSampleSchedules
    };
  }) || [];

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monday</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tuesday</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wednesday</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thursday</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Friday</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {doctorSchedules.length > 0 ? (
              doctorSchedules.map(({ doctor, schedules }) => (
                <tr key={doctor.id}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={doctor.avatarUrl || ""} alt={`Dr. ${doctor.id}`} />
                        <AvatarFallback>DR</AvatarFallback>
                      </Avatar>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">Dr. Sarah Johnson</div>
                        <div className="text-sm text-gray-500">sarah.johnson@example.com</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{doctor.specialty}</div>
                  </td>
                  {[1, 2, 3, 4, 5].map(day => {
                    const schedule = schedules.find(s => s.dayOfWeek === day);
                    return (
                      <td key={day} className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {schedule ? (
                          schedule.isAvailable ? `${schedule.startTime.substring(0, 5)} - ${schedule.endTime.substring(0, 5)}` : "Off"
                        ) : "Off"}
                      </td>
                    );
                  })}
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="ghost" className="text-primary-600 hover:text-primary-900 mr-2" onClick={() => handleEditClick(schedules[0])}>
                      Edit
                    </Button>
                    <Button variant="ghost" className="text-red-600 hover:text-red-900" onClick={() => handleDeleteClick(doctor.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-500">
                  No doctor schedules found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Schedule Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Doctor Schedule</DialogTitle>
            <DialogDescription>
              Update the schedule for this doctor
            </DialogDescription>
          </DialogHeader>
          <ScheduleForm 
            doctors={doctors || []}
            initialData={editingSchedule ? { 
              doctorId: editingSchedule.doctorId,
              dayOfWeek: editingSchedule.dayOfWeek,
              startTime: editingSchedule.startTime,
              endTime: editingSchedule.endTime,
              isAvailable: editingSchedule.isAvailable,
            } : undefined}
            onSuccess={() => setShowEditDialog(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Schedule</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this doctor's schedule? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteScheduleMutation.isPending}
            >
              {deleteScheduleMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
