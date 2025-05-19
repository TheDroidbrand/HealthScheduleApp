import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Schedule, Doctor } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, AlertTriangle } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { userService, scheduleService } from "@/lib/firebase-service";
import { FirebaseDoctor, FirebaseSchedule } from "@/types/firebase";
import { Switch } from "@/components/ui/switch";
import { FormDescription } from "@/components/ui/form";

const daysOfWeek = [
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
  { value: "7", label: "Sunday" },
];

const formSchema = z.object({
  dayOfWeek: z.string(),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  isAvailable: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface EditingSchedule {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  doctorId?: string;
}

export default function DoctorSchedule() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<EditingSchedule | null>(null);

  // Initialize form with empty values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dayOfWeek: "",
      startTime: "",
      endTime: "",
      isAvailable: true,
    },
  });

  // Fetch doctor's schedules directly using user ID
  const { data: schedules, isLoading: isLoadingSchedules } = useQuery<FirebaseSchedule[]>({
    queryKey: ["schedules", user?.id],
    queryFn: () => scheduleService.getDoctorSchedules(user?.id || ""),
    enabled: !!user?.id
  });

  // Update or create schedule mutation
  const scheduleMutation = useMutation({
    mutationFn: async (data: { id?: string, schedule: any }) => {
      if (data.id) {
        // Update existing schedule
        return scheduleService.updateSchedule(data.id, data.schedule);
      } else {
        // Create new schedule
        return scheduleService.createSchedule(data.schedule);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules", user?.id] });
      setShowEditDialog(false);
      toast({
        title: currentSchedule?.id ? "Schedule updated" : "Schedule created",
        description: currentSchedule?.id 
          ? "Your schedule has been updated successfully" 
          : "Your new schedule has been created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to ${currentSchedule?.id ? "update" : "create"} schedule: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Organize schedules by day of week
  const schedulesByDay = daysOfWeek.map(day => {
    const daySchedule = schedules?.find(
      schedule => schedule.dayOfWeek === parseInt(day.value)
    );
    return {
      dayOfWeek: day,
      schedule: daySchedule,
    };
  });

  const handleEditSchedule = (schedule: FirebaseSchedule) => {
    setCurrentSchedule({
      id: schedule.id,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      isAvailable: schedule.isAvailable === true,
      doctorId: schedule.doctorId
    });
    
    form.reset({
      dayOfWeek: schedule.dayOfWeek.toString(),
      startTime: schedule.startTime.substring(0, 5),
      endTime: schedule.endTime.substring(0, 5),
      isAvailable: schedule.isAvailable === true,
    });
    
    setShowEditDialog(true);
  };

  const handleCreateSchedule = (dayOfWeek: string) => {
    const parsedDay = parseInt(dayOfWeek);
    setCurrentSchedule({
      dayOfWeek: parsedDay,
      startTime: "09:00:00",
      endTime: "17:00:00",
      isAvailable: true,
      doctorId: user?.id
    });
    
    form.reset({
      dayOfWeek: dayOfWeek,
      startTime: "09:00",
      endTime: "17:00",
      isAvailable: true,
    });
    
    setShowEditDialog(true);
  };

  const onSubmit = (data: FormValues) => {
    const scheduleData = {
      dayOfWeek: parseInt(data.dayOfWeek),
      startTime: `${data.startTime}:00`,
      endTime: `${data.endTime}:00`,
      isAvailable: data.isAvailable,
      doctorId: user?.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    scheduleMutation.mutate({
      id: currentSchedule?.id,
      schedule: scheduleData
    });
  };

  if (isLoadingSchedules) {
    return (
      <MainLayout title="My Schedule">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="My Schedule">
      <Card>
        <CardHeader className="px-5 py-4 border-b border-gray-200">
          <CardTitle className="text-lg font-semibold">Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {schedulesByDay.map(({ dayOfWeek, schedule }) => (
                <div
                  key={dayOfWeek.value}
                  className="bg-white rounded-lg border p-4 h-full flex flex-col"
                >
                  <div className="font-medium text-center mb-3">{dayOfWeek.label}</div>
                  {schedule ? (
                    <div className="flex-grow">
                      <div className="text-center mb-2">
                        {schedule.isAvailable ? (
                          <div className="text-green-600 font-medium">Available</div>
                        ) : (
                          <div className="text-gray-500 font-medium">Off</div>
                        )}
                      </div>
                      {schedule.isAvailable && (
                        <div className="text-center text-gray-600 mb-4">
                          <Clock className="inline-block h-4 w-4 mr-1" />
                          {schedule.startTime.substring(0, 5)} - {schedule.endTime.substring(0, 5)}
                        </div>
                      )}
                      <div className="flex justify-center mt-auto">
                        <Button
                          onClick={() => handleEditSchedule(schedule)}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-between flex-grow">
                      <div className="text-center text-gray-500 mb-4">
                        <Calendar className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                        <p>No schedule set</p>
                      </div>
                      <Button
                        onClick={() => handleCreateSchedule(dayOfWeek.value)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        Add Hours
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-700 mb-1">Important Note</h4>
                  <p className="text-blue-600 text-sm">
                    Changes to your schedule will only affect future appointments. Any existing appointments 
                    will not be automatically cancelled. Please update patients directly if you need to cancel 
                    or reschedule existing appointments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit/Create Schedule Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentSchedule?.id ? "Edit Schedule" : "Add Schedule"}
            </DialogTitle>
            <DialogDescription>
              {currentSchedule?.id 
                ? "Update your schedule for this day"
                : "Set your schedule for this day"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="dayOfWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of Week</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!!currentSchedule?.id}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {daysOfWeek.map((day) => (
                          <SelectItem key={day.value} value={day.value}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isAvailable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Available</FormLabel>
                      <FormDescription>
                        Set whether you are available on this day
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {currentSchedule?.id ? "Update Schedule" : "Create Schedule"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}