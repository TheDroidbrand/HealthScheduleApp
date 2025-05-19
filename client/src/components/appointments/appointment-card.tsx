import { useState } from "react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { appointmentService } from "@/services/appointment-service";
import { FirebaseAppointment } from "@/types/firebase";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CompleteAppointmentDialog } from "./complete-appointment-dialog";
import { Loader2 } from "lucide-react";

interface AppointmentCardProps {
  appointment: FirebaseAppointment;
  onStatusChange?: () => void;
}

export function AppointmentCard({ appointment, onStatusChange }: AppointmentCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  const cancelMutation = useMutation({
    mutationFn: async () => {
      await appointmentService.updateAppointment(appointment.id, { status: 'cancelled' });
    },
    onSuccess: () => {
      toast({
        title: "Appointment cancelled",
        description: "The appointment has been cancelled successfully.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      onStatusChange?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to cancel appointment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'confirmed':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'completed':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatAppointmentTime = (date: string) => {
    const appointmentDate = new Date(date);
    return format(appointmentDate, 'h:mm a');
  };

  const formatTime = (time: string) => {
    const appointmentDate = new Date(time);
    return format(appointmentDate, 'h:mm a');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {format(new Date(appointment.date), 'PPP')}
            </CardTitle>
            <Badge className={getStatusColor(appointment.status)}>
              {appointment.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Time:</strong> {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</p>
            <p><strong>Reason:</strong> {appointment.reason}</p>
            {appointment.notes && <p><strong>Notes:</strong> {appointment.notes}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          {appointment.status === 'confirmed' && (
            <>
              <Button
                variant="outline"
                onClick={() => setShowCompleteDialog(true)}
              >
                Complete Appointment
              </Button>
              <Button
                variant="destructive"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel Appointment"
                )}
              </Button>
            </>
          )}
        </CardFooter>
      </Card>

      <CompleteAppointmentDialog
        appointment={appointment}
        open={showCompleteDialog}
        onOpenChange={setShowCompleteDialog}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['appointments'] });
          onStatusChange?.();
        }}
      />
    </>
  );
} 