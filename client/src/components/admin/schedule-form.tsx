import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Doctor, InsertSchedule } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

// Create a form schema with zod
const formSchema = z.object({
  doctorId: z.number({ 
    required_error: "Please select a doctor",
    invalid_type_error: "Please select a doctor",
  }),
  dayOfWeek: z.number({ 
    required_error: "Please select a day",
    invalid_type_error: "Please select a day",
  }),
  startTime: z.string().min(1, { message: "Please enter a start time" }),
  endTime: z.string().min(1, { message: "Please enter an end time" }),
  isAvailable: z.boolean().default(true),
});

type ScheduleFormValues = z.infer<typeof formSchema>;

interface ScheduleFormProps {
  doctors: Doctor[];
  initialData?: Partial<InsertSchedule>;
  onSuccess?: () => void;
}

export function ScheduleForm({ doctors, initialData, onSuccess }: ScheduleFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      doctorId: initialData?.doctorId || 0,
      dayOfWeek: initialData?.dayOfWeek || 1,
      startTime: initialData?.startTime || "09:00",
      endTime: initialData?.endTime || "17:00",
      isAvailable: initialData?.isAvailable ?? true,
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: async (data: ScheduleFormValues) => {
      if (initialData && initialData.doctorId) {
        // Update existing schedule
        await apiRequest("PUT", `/api/schedules/${initialData.doctorId}`, data);
      } else {
        // Create new schedule
        await apiRequest("POST", "/api/schedules", data);
      }
    },
    onSuccess: () => {
      toast({
        title: initialData ? "Schedule updated" : "Schedule created",
        description: initialData 
          ? "The doctor's schedule has been updated successfully" 
          : "The doctor's schedule has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "There was a problem with the schedule",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  function onSubmit(data: ScheduleFormValues) {
    setIsSubmitting(true);
    scheduleMutation.mutate(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="doctorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Doctor</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(parseInt(value))} 
                defaultValue={field.value ? field.value.toString() : undefined}
                disabled={!!initialData}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      Dr. Sarah Johnson - {doctor.specialty}
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
          name="dayOfWeek"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Day of Week</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(parseInt(value))} 
                defaultValue={field.value ? field.value.toString() : undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a day" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="1">Monday</SelectItem>
                  <SelectItem value="2">Tuesday</SelectItem>
                  <SelectItem value="3">Wednesday</SelectItem>
                  <SelectItem value="4">Thursday</SelectItem>
                  <SelectItem value="5">Friday</SelectItem>
                  <SelectItem value="6">Saturday</SelectItem>
                  <SelectItem value="0">Sunday</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <input 
                    type="time" 
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    {...field} 
                  />
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
                  <input 
                    type="time" 
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="isAvailable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Available for Appointments</FormLabel>
                <FormDescription>
                  Toggle off if the doctor is unavailable during this time slot
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
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onSuccess}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialData ? "Updating..." : "Creating..."}
              </>
            ) : (
              initialData ? "Update Schedule" : "Create Schedule"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
