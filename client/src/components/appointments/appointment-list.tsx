import { Appointment } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, MapPinIcon, ClockIcon, FileText, CalendarPlus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

interface AppointmentListProps {
  appointments?: Appointment[];
  isLoading: boolean;
  type: "upcoming" | "past" | "cancelled";
}

export function AppointmentList({ appointments, isLoading, type }: AppointmentListProps) {
  const { toast } = useToast();
  
  const cancelMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PUT", `/api/appointments/${id}`, { status: "cancelled" });
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
      // This would typically open a modal to reschedule
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
      <div className="space-y-4">
        {[1, 2, 3].map((index) => (
          <div key={index} className="flex flex-col md:flex-row md:items-center justify-between border rounded-lg p-4">
            <div className="flex items-center mb-3 md:mb-0">
              <div className="mr-4 text-center">
                <Skeleton className="h-6 w-10 mb-1" />
                <Skeleton className="h-8 w-10 mb-1" />
                <Skeleton className="h-4 w-10" />
              </div>
              <div>
                <Skeleton className="h-5 w-40 mb-1" />
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-4 w-36 mb-1" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <div className="flex space-x-2 self-end md:self-auto">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 mb-4">No {type} appointments found</p>
        {type !== "upcoming" && (
          <Button asChild>
            <a href="/doctors">Find a Doctor</a>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => {
        const appointmentDate = new Date(appointment.date);
        const month = appointmentDate.toLocaleString('default', { month: 'short' }).toUpperCase();
        const day = appointmentDate.getDate();
        const weekday = appointmentDate.toLocaleString('default', { weekday: 'short' }).toUpperCase();
        
        return (
          <div key={appointment.id} className="flex flex-col md:flex-row md:items-center justify-between border rounded-lg p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-center mb-3 md:mb-0">
              <div className="mr-4 text-center">
                <div className="text-sm font-medium text-gray-700">{month}</div>
                <div className="text-2xl font-bold text-primary-700">{day}</div>
                <div className="text-xs text-gray-500">{weekday}</div>
              </div>
              <div>
                <div className="flex items-center">
                  <h4 className="font-medium">Dr. Sarah Johnson</h4>
                  <Badge 
                    variant="outline" 
                    className={
                      appointment.status === "confirmed" 
                        ? "ml-2 bg-green-100 text-green-800 hover:bg-green-100 border-green-200" 
                        : appointment.status === "cancelled" 
                        ? "ml-2 bg-red-100 text-red-800 hover:bg-red-100 border-red-200"
                        : "ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200"
                    }
                  >
                    {appointment.status === "confirmed" ? "Confirmed" : 
                     appointment.status === "cancelled" ? "Cancelled" : "Pending"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">Cardiology</p>
                <div className="flex items-center text-sm text-gray-700 mt-1">
                  <ClockIcon className="mr-2 h-4 w-4" /> 
                  {appointment.startTime} - {appointment.endTime}
                </div>
                <div className="flex items-center text-sm text-gray-700 mt-1">
                  <MapPinIcon className="mr-2 h-4 w-4" /> 
                  City Medical Center, Building A, Room 305
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              {type === "upcoming" ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => rescheduleMutation.mutate(appointment.id)}
                    disabled={rescheduleMutation.isPending}
                  >
                    <CalendarIcon className="mr-1 h-4 w-4" /> Reschedule
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-red-700 border-red-300 hover:bg-red-50"
                    onClick={() => cancelMutation.mutate(appointment.id)}
                    disabled={cancelMutation.isPending}
                  >
                    <ClockIcon className="mr-1 h-4 w-4" /> Cancel
                  </Button>
                </>
              ) : type === "past" ? (
                <>
                  <Button variant="outline" size="sm" className="bg-primary-100 text-primary-700 hover:bg-primary-200 border-primary-200">
                    <FileText className="mr-1 h-4 w-4" /> View Summary
                  </Button>
                  <Button variant="outline" size="sm" className="bg-secondary-100 text-secondary-700 hover:bg-secondary-200 border-secondary-200">
                    <CalendarPlus className="mr-1 h-4 w-4" /> Book Again
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
