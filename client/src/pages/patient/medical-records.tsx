import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { medicalRecordService, userService } from "@/lib/firebase-service";
import { FirebaseMedicalRecord, FirebaseDoctor } from "@/types/firebase";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Download, FileText, User } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PatientMedicalRecords() {
  const { user } = useAuth();
  const [selectedRecord, setSelectedRecord] = useState<FirebaseMedicalRecord | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Add debug logging for user
  useEffect(() => {
    console.log('Current user:', user);
  }, [user]);

  const { data: records = [], isLoading, error } = useQuery<FirebaseMedicalRecord[]>({
    queryKey: ["medical-records", user?.id],
    queryFn: async () => {
      console.log('Fetching records for user ID:', user?.id);
      const result = await medicalRecordService.getPatientRecords(user?.id || "");
      console.log('Fetched records:', result);
      return result;
    },
    enabled: !!user?.id,
    refetchInterval: 30000,
    staleTime: 15000,
    gcTime: 5 * 60 * 1000,
  });

  // Add debug logging for records
  useEffect(() => {
    console.log('Current records:', records);
    if (error) {
      console.error('Error fetching records:', error);
    }
  }, [records, error]);

  const { data: doctors = [] } = useQuery<FirebaseDoctor[]>({
    queryKey: ["doctors"],
    queryFn: () => userService.getAllDoctors(),
  });

  // Add debug logging for doctors
  useEffect(() => {
    console.log('Available doctors:', doctors);
  }, [doctors]);

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    return doctor ? `Dr. ${doctor.fullName}` : "Unknown Doctor";
  };

  const handleViewRecord = (record: FirebaseMedicalRecord) => {
    console.log('Viewing record:', record);
    setSelectedRecord(record);
    setShowDetailsDialog(true);
  };

  const handlePrintRecord = (record: FirebaseMedicalRecord) => {
    console.log('Printing record:', record);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Medical Record - ${formatDate(record.date)}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { text-align: center; margin-bottom: 20px; }
              .section { margin-bottom: 15px; }
              .label { font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Medical Record</h1>
              <p>Date: ${formatDate(record.date)}</p>
            </div>
            <div class="section">
              <p class="label">Doctor:</p>
              <p>${getDoctorName(record.doctorId)}</p>
            </div>
            <div class="section">
              <p class="label">Diagnosis:</p>
              <p>${record.diagnosis}</p>
            </div>
            <div class="section">
              <p class="label">Prescription:</p>
              <p>${record.prescription || 'No prescription'}</p>
            </div>
            <div class="section">
              <p class="label">Notes:</p>
              <p>${record.notes || 'No additional notes'}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <MainLayout title="My Medical Records">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Medical Records</h1>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading medical records...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Error loading medical records. Please try again later.</p>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No medical records found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {records.map((record) => (
              <div
                key={record.id}
                className="bg-white rounded-lg shadow p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <FileText className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-medium">
                        {getDoctorName(record.doctorId)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(record.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewRecord(record)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePrintRecord(record)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedRecord && (
          <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Medical Record Details</DialogTitle>
                <DialogDescription>
                  {formatDate(selectedRecord.date)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Doctor</h4>
                  <p>{getDoctorName(selectedRecord.doctorId)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Diagnosis</h4>
                  <p>{selectedRecord.diagnosis}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Prescription</h4>
                  <p>{selectedRecord.prescription || 'No prescription'}</p>
                </div>
                {selectedRecord.notes && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Notes</h4>
                    <p>{selectedRecord.notes}</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
}