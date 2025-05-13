import { Appointment } from "@shared/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Trash2, Check, X, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AppointmentTableProps {
  appointments?: Appointment[];
  isLoading: boolean;
  isAdmin?: boolean;
}

export function AppointmentTable({ appointments, isLoading, isAdmin = false }: AppointmentTableProps) {
  const { toast } = useToast();
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PUT", `/api/appointments/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Appointment updated",
        description: "The appointment status has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update appointment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/appointments/${id}`);
    },
    onSuccess: () => {
      setShowDeleteDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({
        title: "Appointment deleted",
        description: "The appointment has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete appointment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (id: number, status: string) => {
    updateAppointmentMutation.mutate({ id, status });
  };

  const handleDeleteClick = (id: number) => {
    setSelectedAppointmentId(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedAppointmentId) {
      deleteAppointmentMutation.mutate(selectedAppointmentId);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case "confirmed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Confirmed</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">Pending</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">Cancelled</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <div className="text-center py-10">
        <Clock className="mx-auto h-10 w-10 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments</h3>
        <p className="mt-1 text-sm text-gray-500">No appointments found with the current filters.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src="" alt="Patient" />
                      <AvatarFallback>P</AvatarFallback>
                    </Avatar>
                    <div>Patient #{appointment.patientId}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src="" alt="Doctor" />
                      <AvatarFallback>DR</AvatarFallback>
                    </Avatar>
                    <div>Dr. {appointment.doctorId}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {formatDate(appointment.date)} <br />
                  <span className="text-gray-500 text-sm">
                    {appointment.startTime} - {appointment.endTime}
                  </span>
                </TableCell>
                <TableCell>
                  {getStatusBadge(appointment.status)}
                </TableCell>
                <TableCell className="text-right">
                  {isAdmin ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(appointment.id, "confirmed")}
                          disabled={appointment.status === "confirmed"}
                        >
                          <Check className="mr-2 h-4 w-4" /> Confirm
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(appointment.id, "completed")}
                          disabled={appointment.status === "completed"}
                        >
                          <Check className="mr-2 h-4 w-4" /> Mark as Completed
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(appointment.id, "cancelled")}
                          disabled={appointment.status === "cancelled"}
                        >
                          <X className="mr-2 h-4 w-4" /> Cancel
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClick(appointment.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteAppointmentMutation.isPending}
            >
              {deleteAppointmentMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
