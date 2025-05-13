import { useState } from "react";
import { Doctor } from "@shared/schema";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, StarHalf } from "lucide-react";

interface DoctorCardProps {
  doctor: Doctor;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  
  // Example time slots - in a real app these would come from the doctor's schedule
  const timeSlots = [
    "Today, 2:30 PM",
    "Today, 4:15 PM",
    "Tomorrow, 9:00 AM",
    "Tomorrow, 11:30 AM"
  ];

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-5 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center">
              <Avatar className="h-16 w-16 mr-4">
                <AvatarImage src={doctor.avatarUrl || ""} alt={`Dr. ${doctor.id}`} />
                <AvatarFallback>DR</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">Dr. Sarah Johnson</h3>
                <p className="text-primary-700 font-medium">{doctor.specialty}</p>
                <div className="flex items-center mt-1">
                  <div className="flex">
                    {[...Array(4)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-amber-400 fill-current" />
                    ))}
                    <StarHalf className="h-4 w-4 text-amber-400 fill-current" />
                  </div>
                  <span className="ml-1 text-sm text-gray-500">4.7 (128 reviews)</span>
                </div>
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button onClick={() => setShowAppointmentModal(true)}>
                Book Appointment
              </Button>
            </div>
          </div>
        </div>
        <div className="px-5 py-4 bg-gray-50">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
              <span className="mr-1.5 h-2 w-2 rounded-full bg-green-500"></span>
              Available today
            </Badge>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
              Shortest wait time
            </Badge>
            <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200">
              English, Spanish
            </Badge>
          </div>
        </div>
        <div className="p-5">
          <h4 className="font-medium mb-2">About</h4>
          <p className="text-sm text-gray-600 mb-4">
            {doctor.bio || "No bio available"}
          </p>
          
          <h4 className="font-medium mb-2">Next Available Slots</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
            {timeSlots.map((slot, index) => (
              <Button 
                key={index} 
                variant="outline" 
                className="text-sm justify-center"
                onClick={() => setShowAppointmentModal(true)}
              >
                {slot}
              </Button>
            ))}
          </div>
          <Button variant="link" className="p-0 h-auto">
            See more available times
          </Button>
        </div>
      </div>

      {/* Appointment Booking Modal */}
      <Dialog open={showAppointmentModal} onOpenChange={setShowAppointmentModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Book Appointment with Dr. Sarah Johnson</DialogTitle>
          </DialogHeader>
          <AppointmentForm doctorId={doctor.id} onSuccess={() => setShowAppointmentModal(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
