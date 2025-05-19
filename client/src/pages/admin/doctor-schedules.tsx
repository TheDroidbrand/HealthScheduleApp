import { MainLayout } from "@/components/layout/main-layout";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ScheduleTable } from "@/components/admin/schedule-table";
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
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { userService, scheduleService } from "@/lib/firebase-service";
import { FirebaseDoctor, FirebaseSchedule } from "@/types/firebase";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

export default function DoctorSchedules() {
  const { user } = useAuth();
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("all");
  const [showAddScheduleDialog, setShowAddScheduleDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const { data: doctors, isLoading: isLoadingDoctors } = useQuery<FirebaseDoctor[]>({
    queryKey: ["doctors"],
    queryFn: () => userService.getAllDoctors(),
  });

  const { data: schedules, isLoading: isLoadingSchedules } = useQuery<FirebaseSchedule[]>({
    queryKey: ["schedules"],
    queryFn: () => scheduleService.getDoctorSchedules(user?.id.toString() || ""),
    enabled: !!user?.id
  });

  // Filter doctors based on selected specialty
  const filteredDoctors = doctors?.filter((doctor: FirebaseDoctor) => {
    if (selectedSpecialty === "all") return true;
    return doctor.specialty === selectedSpecialty;
  });

  // Get unique specialties from doctors data
  const specialties = doctors?.reduce((acc: string[], doctor: FirebaseDoctor) => {
    if (!acc.includes(doctor.specialty)) {
      acc.push(doctor.specialty);
    }
    return acc;
  }, []) || [];

  // Get schedules for the selected date
  const selectedDateSchedules = schedules?.filter((schedule: FirebaseSchedule) => {
    if (!selectedDate) return false;
    const scheduleDate = new Date(schedule.startTime);
    return scheduleDate.toDateString() === selectedDate.toDateString();
  }) || [];

  return (
    <MainLayout title="Doctor Schedules">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Select
            value={selectedSpecialty}
            onValueChange={setSelectedSpecialty}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Specialties</SelectItem>
              {specialties.map((specialty: string) => (
                <SelectItem key={specialty} value={specialty}>
                  {specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowAddScheduleDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Schedule
        </Button>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>
                  {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDateSchedules.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No schedules for this date
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedDateSchedules.map((schedule: FirebaseSchedule) => (
                      <div
                        key={schedule.id}
                        className="flex items-center justify-between p-4 bg-muted rounded-lg"
                      >
                        <div>
                          <div className="font-medium">
                            {format(new Date(schedule.startTime), "h:mm a")} -{" "}
                            {format(new Date(schedule.endTime), "h:mm a")}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {schedule.isAvailable ? "Available" : "Unavailable"}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="table">
          <ScheduleTable
            doctors={filteredDoctors}
            schedules={schedules}
            isLoading={isLoadingDoctors || isLoadingSchedules}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={showAddScheduleDialog} onOpenChange={setShowAddScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Schedule</DialogTitle>
            <DialogDescription>
              Add a new schedule for the selected doctor.
            </DialogDescription>
          </DialogHeader>
          <ScheduleForm
            doctors={doctors || []}
            onSuccess={() => setShowAddScheduleDialog(false)}
            onCancel={() => setShowAddScheduleDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
