import { Appointment } from "@shared/schema";
import { formatDate, formatTime } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, MapPinIcon } from "lucide-react";

interface UpcomingAppointmentsProps {
  appointments?: Appointment[];
  isLoading: boolean;
}

export function UpcomingAppointments({ appointments, isLoading }: UpcomingAppointmentsProps) {
  const { toast } = useToast();
  
  const cancelMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/appointments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Appointment cancelled",
        description: "Your appointment has been successfully cancelled",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to cancel appointment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rescheduleMutation = useMutation({
    mutationFn: async (id: number) => {
      // This would typically show a modal for rescheduling
      // For now, we'll just update the status
      await apiRequest("PUT", `/api/appointments/${id}`, { status: "pending" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Reschedule requested",
        description: "Your request to reschedule has been submitted",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to request reschedule",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Upcoming Appointments</h3>
        </div>
        <div className="p-5">
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between border rounded-lg p-4">
                <div className="flex items-center mb-3 sm:mb-0">
                  <Skeleton className="h-12 w-12 rounded-full mr-4" />
                  <div>
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div>
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-8 w-full sm:w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-5 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold">Upcoming Appointments</h3>
      </div>
      <div className="p-5">
        {appointments && appointments.length > 0 ? (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="flex flex-col sm:flex-row sm:items-center justify-between border rounded-lg p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center mb-3 sm:mb-0">
                  <Avatar className="h-12 w-12 mr-4">
                    <AvatarImage src="" alt="Doctor" />
                    <AvatarFallback>DR</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-medium">Dr. Sarah Johnson</h4>
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {appointment.status === "confirmed" ? "Confirmed" : "Pending"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">Cardiology</p>
                    <div className="flex items-center text-sm text-gray-700 mt-1">
                      <CalendarIcon className="mr-2 h-4 w-4" /> 
                      {formatDate(appointment.date)} at {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                    </div>
                    <div className="flex items-center text-sm text-gray-700 mt-1">
                      <MapPinIcon className="mr-2 h-4 w-4" /> 
                      City Medical Center, Building A, Room 305
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 self-end sm:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => rescheduleMutation.mutate(appointment.id)}
                    disabled={rescheduleMutation.isPending}
                  >
                    Reschedule
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 border-red-300 hover:bg-red-50 hover:text-red-600"
                    onClick={() => cancelMutation.mutate(appointment.id)}
                    disabled={cancelMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">You don't have any upcoming appointments</p>
            <Button className="mt-4" asChild>
              <a href="/doctors">Find a Doctor</a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
