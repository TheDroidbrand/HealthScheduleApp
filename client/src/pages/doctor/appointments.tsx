import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime } from "@/lib/utils";
import { useState } from "react";
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
import { appointmentService, userService } from "@/lib/firebase-service";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { format } from "date-fns";
import { FirebaseAppointment, FirebaseDoctor } from "@/types/firebase";

export default function DoctorAppointments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedAppointment, setSelectedAppointment] = useState<FirebaseAppointment | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  
  // Fetch doctor profile
  const { data: doctors = [] } = useQuery<FirebaseDoctor[]>({
    queryKey: ["doctors"],
    queryFn: () => userService.getAllDoctors(),
    enabled: !!user,
  });

  // Find current doctor's profile
  const doctorProfile = doctors.find((doctor: FirebaseDoctor) => doctor.userId === user?.id);

  // Fetch appointments using the doctor's user ID directly
  const { data: appointments = [], isLoading } = useQuery<FirebaseAppointment[]>({
    queryKey: ["appointments", user?.id],
    queryFn: () => appointmentService.getDoctorAppointments(user?.id || ""),
    enabled: !!user?.id,
  });

  // Fetch patient information for each appointment
  const { data: patients = {} } = useQuery({
    queryKey: ["appointment-patients", appointments?.map(a => a.patientId) || []],
    queryFn: async () => {
      const patientData: Record<string, any> = {};
      if (!appointments) return patientData;
      
      for (const appointment of appointments) {
        if (!patientData[appointment.patientId]) {
          const patient = await userService.getCurrentUser(appointment.patientId);
          patientData[appointment.patientId] = patient;
        }
      }
      return patientData;
    },
    enabled: !!appointments && appointments.length > 0,
  });

  // Update appointment status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({id, status}: {id: string, status: "pending" | "confirmed" | "cancelled" | "completed"}) => {
      await appointmentService.updateAppointment(id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
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

  // Group appointments by date
  const appointmentsByDate = appointments.reduce((acc: Record<string, FirebaseAppointment[]>, appointment) => {
    const date = format(new Date(appointment.date), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(appointment);
    return acc;
  }, {});

  // Sort dates
  const sortedDates = Object.keys(appointmentsByDate).sort();

  const handleAcceptAppointment = (appointment: FirebaseAppointment) => {
    updateStatusMutation.mutate({
      id: appointment.id,
      status: "confirmed"
    });
  };

  const handleRejectAppointment = (appointment: FirebaseAppointment) => {
    updateStatusMutation.mutate({
      id: appointment.id,
      status: "cancelled"
    });
    setShowCancelDialog(false);
  };

  const handleDetailsClick = (appointment: FirebaseAppointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsDialog(true);
  };

  const handleCancelClick = (appointment: FirebaseAppointment) => {
    setSelectedAppointment(appointment);
    setShowCancelDialog(true);
  };

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

  const handleAppointmentClick = (appointmentId: string) => {
    setSelectedAppointment(null);
    setShowAppointmentModal(true);
  };

  return (
    <MainLayout title="Manage Appointments">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">My Appointments</h2>
          <Button onClick={() => setShowAppointmentModal(true)}>
            New Appointment
          </Button>
        </div>

        <Card>
          <CardHeader className="px-5 py-4 border-b border-gray-200">
            <CardTitle className="text-xl font-semibold">Appointments</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6 grid grid-cols-4">
                <TabsTrigger value="pending" className="relative">
                  Pending
                  {appointments.filter(a => a.status === "pending").length > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      {appointments.filter(a => a.status === "pending").length}
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
                ) : appointments.filter(a => a.status === "pending").length === 0 ? (
                  <div className="text-center p-12">
                    <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No pending appointments</h3>
                    <p className="text-gray-500">
                      You don't have any appointment requests waiting for your confirmation.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {appointments.filter(a => a.status === "pending").map((appointment) => {
                      const patient = patients[appointment.patientId];
                      return (
                        <div key={appointment.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center mb-3 sm:mb-0">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarFallback>
                                {patient?.fullName?.substring(0, 2) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{patient?.fullName || `Patient #${appointment.patientId}`}</div>
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
                              onClick={() => handleAppointmentClick(appointment.id)} 
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
                      );
                    })}
                  </div>
                )}
              </TabsContent>
              
              {/* Upcoming Appointments Tab */}
              <TabsContent value="upcoming">
                {isLoading ? (
                  <div className="p-12 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : appointments.filter(a => a.status === "confirmed").length === 0 ? (
                  <div className="text-center p-12">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No upcoming appointments</h3>
                    <p className="text-gray-500">
                      You don't have any confirmed appointments scheduled for the future.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {sortedDates.map((date) => (
                      <Card key={date}>
                        <CardHeader>
                          <CardTitle>{format(new Date(date), 'MMMM d, yyyy')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {appointmentsByDate[date].map((appointment) => {
                              const patient = patients[appointment.patientId];
                              return (
                                <div
                                  key={appointment.id}
                                  className="flex items-center justify-between p-4 border rounded-lg"
                                >
                                  <div>
                                    <p className="font-medium">
                                      {format(new Date(appointment.date), 'h:mm a')}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Patient: {patient?.fullName || `Patient #${appointment.patientId}`}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Reason: {appointment.reason}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <Badge
                                      variant={
                                        appointment.status === "confirmed"
                                          ? "default"
                                          : appointment.status === "cancelled"
                                          ? "destructive"
                                          : "secondary"
                                      }
                                    >
                                      {appointment.status}
                                    </Badge>
                                    {appointment.status === "pending" && (
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          onClick={() =>
                                            updateStatusMutation.mutate({
                                              id: appointment.id,
                                              status: "confirmed",
                                            })
                                          }
                                        >
                                          Accept
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() =>
                                            updateStatusMutation.mutate({
                                              id: appointment.id,
                                              status: "cancelled",
                                            })
                                          }
                                        >
                                          Reject
                                        </Button>
                                      </div>
                                    )}
                                    {appointment.status === "confirmed" && (
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() =>
                                          updateStatusMutation.mutate({
                                            id: appointment.id,
                                            status: "cancelled",
                                          })
                                        }
                                      >
                                        Cancel
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
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
                ) : appointments.filter(a => a.status !== "confirmed" && a.status !== "pending").length === 0 ? (
                  <div className="text-center p-12">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No past appointments</h3>
                    <p className="text-gray-500">
                      You don't have any past appointments in your history.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {sortedDates.map((date) => (
                      <Card key={date}>
                        <CardHeader>
                          <CardTitle>{format(new Date(date), 'MMMM d, yyyy')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {appointmentsByDate[date].map((appointment) => {
                              const patient = patients[appointment.patientId];
                              return (
                                <div
                                  key={appointment.id}
                                  className="flex items-center justify-between p-4 border rounded-lg"
                                >
                                  <div>
                                    <p className="font-medium">
                                      {format(new Date(appointment.date), 'h:mm a')}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Patient: {patient?.fullName || `Patient #${appointment.patientId}`}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Reason: {appointment.reason}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <Badge
                                      variant={
                                        appointment.status === "confirmed"
                                          ? "default"
                                          : appointment.status === "cancelled"
                                          ? "destructive"
                                          : "secondary"
                                      }
                                    >
                                      {appointment.status}
                                    </Badge>
                                    <Button 
                                      size="sm"
                                      onClick={() => handleAppointmentClick(appointment.id)}
                                    >
                                      <FileText className="h-4 w-4 mr-1" />
                                      Details
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
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
                ) : appointments.filter(a => a.status === "cancelled").length === 0 ? (
                  <div className="text-center p-12">
                    <XCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No cancelled appointments</h3>
                    <p className="text-gray-500">
                      You don't have any cancelled appointments in your history.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {sortedDates.map((date) => (
                      <Card key={date}>
                        <CardHeader>
                          <CardTitle>{format(new Date(date), 'MMMM d, yyyy')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {appointmentsByDate[date].map((appointment) => {
                              const patient = patients[appointment.patientId];
                              return (
                                <div
                                  key={appointment.id}
                                  className="flex items-center justify-between p-4 border rounded-lg"
                                >
                                  <div>
                                    <p className="font-medium">
                                      {format(new Date(appointment.date), 'h:mm a')}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Patient: {patient?.fullName || `Patient #${appointment.patientId}`}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Reason: {appointment.reason}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <Badge
                                      variant={
                                        appointment.status === "confirmed"
                                          ? "default"
                                          : appointment.status === "cancelled"
                                          ? "destructive"
                                          : "secondary"
                                      }
                                    >
                                      {appointment.status}
                                    </Badge>
                                    <Button 
                                      size="sm"
                                      onClick={() => handleAppointmentClick(appointment.id)}
                                    >
                                      <FileText className="h-4 w-4 mr-1" />
                                      Details
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
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
                <p className="text-sm">{patients[selectedAppointment.patientId]?.fullName || `Patient #${selectedAppointment.patientId}`}</p>
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

      <Dialog open={showAppointmentModal} onOpenChange={setShowAppointmentModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedAppointment ? 'View Appointment' : 'New Appointment'}
            </DialogTitle>
          </DialogHeader>
          <AppointmentForm
            doctorId={user?.id || ""}
            onSuccess={() => {
              setShowAppointmentModal(false);
              setSelectedAppointment(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}