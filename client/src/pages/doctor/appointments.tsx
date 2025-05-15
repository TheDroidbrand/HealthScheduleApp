import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Appointment, Doctor } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime } from "@/lib/utils";
import { useState } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Trash2, 
  XCircle 
} from "lucide-react";

export default function DoctorAppointments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  // Fetch all appointments
  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
    enabled: !!user,
  });

  // Fetch doctor profile
  const { data: doctors } = useQuery<Doctor[]>({
    queryKey: ["/api/doctors"],
    enabled: !!user,
  });

  // Find current doctor's profile
  const doctorProfile = doctors?.find(doctor => doctor.userId === user?.id);

  // Update appointment status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({id, status}: {id: number, status: string}) => {
      const res = await apiRequest("PUT", `/api/appointments/${id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      toast({
        title: "Appointment updated",
        description: "The appointment status has been updated successfully.",
        variant: "default",
      });
      setShowDetailsDialog(false);
      setShowCancelDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update appointment",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Filter appointments for this doctor
  const filterAppointments = (
    status: "upcoming" | "past" | "cancelled" | "pending"
  ): Appointment[] => {
    if (!appointments || !doctorProfile) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Only get appointments for this doctor
    const doctorAppointments = appointments.filter(apt => apt.doctorId === doctorProfile.id);
    
    if (status === "upcoming") {
      return doctorAppointments.filter(apt => {
        const appointmentDate = new Date(apt.date);
        return (
          appointmentDate >= today && 
          apt.status !== "cancelled" &&
          apt.status !== "pending"
        );
      }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } 
    else if (status === "past") {
      return doctorAppointments.filter(apt => {
        const appointmentDate = new Date(apt.date);
        return (
          appointmentDate < today && 
          apt.status !== "cancelled"
        );
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } 
    else if (status === "cancelled") {
      return doctorAppointments.filter(apt => 
        apt.status === "cancelled"
      ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    else if (status === "pending") {
      return doctorAppointments.filter(apt => 
        apt.status === "pending"
      ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
    
    return [];
  };

  const handleAcceptAppointment = (appointment: Appointment) => {
    updateStatusMutation.mutate({
      id: appointment.id,
      status: "confirmed"
    });
  };

  const handleRejectAppointment = (appointment: Appointment) => {
    updateStatusMutation.mutate({
      id: appointment.id,
      status: "cancelled"
    });
    setShowCancelDialog(false);
  };

  const handleDetailsClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsDialog(true);
  };

  const handleCancelClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelDialog(true);
  };

  // Get appointments for each tab
  const upcomingAppointments = filterAppointments("upcoming");
  const pastAppointments = filterAppointments("past");
  const cancelledAppointments = filterAppointments("cancelled");
  const pendingAppointments = filterAppointments("pending");

  const getAppointmentStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Confirmed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="mr-1 h-3 w-3" />
            Cancelled
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
    }
  };

  return (
    <MainLayout title="Manage Appointments">
      <Card>
        <CardHeader className="px-5 py-4 border-b border-gray-200">
          <CardTitle className="text-xl font-semibold">Appointments</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6 grid grid-cols-4">
              <TabsTrigger value="pending" className="relative">
                Pending
                {pendingAppointments.length > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    {pendingAppointments.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
            
            {/* Pending Appointments Tab */}
            <TabsContent value="pending">
              {isLoading ? (
                <div className="p-12 flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : pendingAppointments.length === 0 ? (
                <div className="text-center p-12">
                  <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No pending appointments</h3>
                  <p className="text-gray-500">
                    You don't have any appointment requests waiting for your confirmation.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {pendingAppointments.map((appointment) => (
                    <div key={appointment.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center mb-3 sm:mb-0">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarFallback>
                            {appointment.patientId.toString().substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">Patient #{appointment.patientId}</div>
                          <div className="text-sm text-gray-500 max-w-[300px] truncate">
                            {appointment.reason}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {formatDate(appointment.date)} • {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 sm:ml-4">
                        <Button 
                          onClick={() => handleDetailsClick(appointment)} 
                          variant="outline" 
                          size="sm"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        <Button 
                          onClick={() => handleAcceptAppointment(appointment)} 
                          variant="default" 
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          disabled={updateStatusMutation.isPending}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button 
                          onClick={() => handleCancelClick(appointment)} 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                          disabled={updateStatusMutation.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Upcoming Appointments Tab */}
            <TabsContent value="upcoming">
              {isLoading ? (
                <div className="p-12 flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : upcomingAppointments.length === 0 ? (
                <div className="text-center p-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No upcoming appointments</h3>
                  <p className="text-gray-500">
                    You don't have any confirmed appointments scheduled for the future.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center mb-3 sm:mb-0">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarFallback>
                            {appointment.patientId.toString().substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium">Patient #{appointment.patientId}</span>
                            <span className="ml-2">
                              {getAppointmentStatusBadge(appointment.status)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 max-w-[300px] truncate">
                            {appointment.reason}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {formatDate(appointment.date)} • {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 sm:ml-4">
                        <Button 
                          onClick={() => handleDetailsClick(appointment)} 
                          variant="outline" 
                          size="sm"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        <Button 
                          onClick={() => handleCancelClick(appointment)} 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                          disabled={updateStatusMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Past Appointments Tab */}
            <TabsContent value="past">
              {isLoading ? (
                <div className="p-12 flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : pastAppointments.length === 0 ? (
                <div className="text-center p-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No past appointments</h3>
                  <p className="text-gray-500">
                    You don't have any past appointments in your history.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {pastAppointments.map((appointment) => (
                    <div key={appointment.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center mb-3 sm:mb-0">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarFallback>
                            {appointment.patientId.toString().substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium">Patient #{appointment.patientId}</span>
                            <span className="ml-2">
                              {getAppointmentStatusBadge(appointment.status)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 max-w-[300px] truncate">
                            {appointment.reason}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {formatDate(appointment.date)} • {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 sm:ml-4">
                        <Button 
                          onClick={() => handleDetailsClick(appointment)} 
                          variant="outline" 
                          size="sm"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Cancelled Appointments Tab */}
            <TabsContent value="cancelled">
              {isLoading ? (
                <div className="p-12 flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : cancelledAppointments.length === 0 ? (
                <div className="text-center p-12">
                  <XCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No cancelled appointments</h3>
                  <p className="text-gray-500">
                    You don't have any cancelled appointments in your history.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {cancelledAppointments.map((appointment) => (
                    <div key={appointment.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center mb-3 sm:mb-0">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarFallback>
                            {appointment.patientId.toString().substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium">Patient #{appointment.patientId}</span>
                            <span className="ml-2">
                              {getAppointmentStatusBadge(appointment.status)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 max-w-[300px] truncate">
                            {appointment.reason}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {formatDate(appointment.date)} • {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 sm:ml-4">
                        <Button 
                          onClick={() => handleDetailsClick(appointment)} 
                          variant="outline" 
                          size="sm"
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Appointment Details Dialog */}
      {selectedAppointment && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
              <DialogDescription>
                Detailed information about this appointment
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-1">Status</h4>
                <div>{getAppointmentStatusBadge(selectedAppointment.status)}</div>
              </div>
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-1">Patient</h4>
                <p className="text-sm">Patient #{selectedAppointment.patientId}</p>
              </div>
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-1">Date & Time</h4>
                <p className="text-sm">{formatDate(selectedAppointment.date)}</p>
                <p className="text-sm">{formatTime(selectedAppointment.startTime)} - {formatTime(selectedAppointment.endTime)}</p>
              </div>
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-1">Reason</h4>
                <p className="text-sm">{selectedAppointment.reason}</p>
              </div>
              {selectedAppointment.notes && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Notes</h4>
                  <p className="text-sm">{selectedAppointment.notes}</p>
                </div>
              )}
            </div>
            <DialogFooter className="flex justify-between sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDetailsDialog(false)}
              >
                Close
              </Button>
              {selectedAppointment.status === "pending" && (
                <>
                  <Button 
                    variant="default" 
                    className="bg-green-600 hover:bg-green-700 ml-2"
                    onClick={() => handleAcceptAppointment(selectedAppointment)}
                    disabled={updateStatusMutation.isPending}
                  >
                    Accept
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-red-600 border-red-300 hover:bg-red-50 ml-2"
                    onClick={() => handleCancelClick(selectedAppointment)}
                    disabled={updateStatusMutation.isPending}
                  >
                    Decline
                  </Button>
                </>
              )}
              {selectedAppointment.status === "confirmed" && (
                <Button 
                  variant="outline" 
                  className="text-red-600 border-red-300 hover:bg-red-50 ml-2"
                  onClick={() => handleCancelClick(selectedAppointment)}
                  disabled={updateStatusMutation.isPending}
                >
                  Cancel
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Cancel Confirmation Dialog */}
      {selectedAppointment && (
        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedAppointment.status === "pending" ? "Decline Appointment" : "Cancel Appointment"}
              </DialogTitle>
              <DialogDescription>
                {selectedAppointment.status === "pending" 
                  ? "Are you sure you want to decline this appointment request?" 
                  : "Are you sure you want to cancel this appointment?"}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-500">
                This action cannot be undone. The patient will be notified that their
                {selectedAppointment.status === "pending" ? " request has been declined." : " appointment has been cancelled."}
              </p>
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <div className="text-sm">
                  <span className="font-medium">Date: </span>
                  {formatDate(selectedAppointment.date)}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Time: </span>
                  {formatTime(selectedAppointment.startTime)} - {formatTime(selectedAppointment.endTime)}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Reason: </span>
                  {selectedAppointment.reason}
                </div>
              </div>
            </div>
            <DialogFooter className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
                disabled={updateStatusMutation.isPending}
              >
                Keep Appointment
              </Button>
              <Button 
                variant="destructive" 
                className="ml-2"
                onClick={() => handleRejectAppointment(selectedAppointment)}
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending ? (
                  <span className="flex items-center">
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent"></span>
                    Processing...
                  </span>
                ) : (
                  selectedAppointment.status === "pending" ? "Decline Request" : "Cancel Appointment"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </MainLayout>
  );
}