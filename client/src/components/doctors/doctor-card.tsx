import { useState } from "react";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Star, StarHalf, GraduationCap, Languages } from "lucide-react";
import { FirebaseDoctor } from "@/types/firebase";
import { useQuery } from "@tanstack/react-query";
import { userService } from "@/lib/firebase-service";

interface DoctorCardProps {
  doctor: FirebaseDoctor;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  
  // Fetch doctor's user data to get their full name
  const { data: userData } = useQuery({
    queryKey: ["user", doctor.userId],
    queryFn: () => userService.getCurrentUser(doctor.userId),
  });

  // Get doctor's full name from either the doctor data or user data
  const doctorFullName = doctor.fullName || userData?.fullName || "Doctor";

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-5 border-b">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={doctor.avatarUrl || ""} alt={doctorFullName} />
                <AvatarFallback>
                  {doctorFullName.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">Dr. {doctorFullName}</h3>
                <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                <div className="flex items-center mt-1">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <StarHalf className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <span className="text-sm text-muted-foreground ml-2">
                    {doctor.rating || 4.5} ({doctor.reviewCount || 0} reviews)
                  </span>
                </div>
              </div>
            </div>
            <Button onClick={() => setShowAppointmentModal(true)}>
              Book Appointment
            </Button>
          </div>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Education</h4>
              <div className="flex items-center text-sm text-muted-foreground">
                <GraduationCap className="h-4 w-4 mr-2" />
                {doctor.education || "Not specified"}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Languages</h4>
              <div className="flex items-center text-sm text-muted-foreground">
                <Languages className="h-4 w-4 mr-2" />
                {doctor.languages || "English"}
              </div>
            </div>
          </div>

          {doctor.bio && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">About</h4>
              <p className="text-sm text-muted-foreground">{doctor.bio}</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showAppointmentModal} onOpenChange={setShowAppointmentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Appointment with Dr. {doctorFullName}</DialogTitle>
            <DialogDescription>
              Select a date and time for your appointment
            </DialogDescription>
          </DialogHeader>
          <AppointmentForm
            doctorId={doctor.id}
            onSuccess={() => setShowAppointmentModal(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
