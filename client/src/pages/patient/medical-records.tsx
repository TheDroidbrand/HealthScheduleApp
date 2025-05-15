import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { MedicalRecord, LabResult } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  Plus,
  Search,
  User
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function PatientMedicalRecords() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRecordId, setExpandedRecordId] = useState<number | null>(null);
  
  // Fetch medical records for the current patient
  const { data: records, isLoading: isLoadingRecords } = useQuery<MedicalRecord[]>({
    queryKey: ["/api/medical-records/patient", user?.id],
    enabled: !!user,
  });
  
  // Filter records based on search query
  const filteredRecords = records?.filter(record => {
    const query = searchQuery.toLowerCase();
    return (
      record.diagnosis.toLowerCase().includes(query) ||
      (record.symptoms && record.symptoms.toLowerCase().includes(query)) ||
      (record.notes && record.notes.toLowerCase().includes(query))
    );
  });
  
  // Load lab results for a specific medical record when expanded
  const { data: labResults, isLoading: isLoadingLabResults } = useQuery<LabResult[]>({
    queryKey: ["/api/lab-results/medical-record", expandedRecordId],
    enabled: expandedRecordId !== null,
  });
  
  const handleExpandRecord = (recordId: number) => {
    setExpandedRecordId(recordId === expandedRecordId ? null : recordId);
  };
  
  return (
    <MainLayout title="My Medical Records">
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search medical records..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {isLoadingRecords ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredRecords && filteredRecords.length > 0 ? (
        <div className="space-y-6">
          {filteredRecords.map((record) => (
            <Card key={record.id} className={expandedRecordId === record.id ? "border-primary" : ""}>
              <CardHeader className="px-6 py-4 flex flex-row items-center justify-between cursor-pointer"
                onClick={() => handleExpandRecord(record.id)}>
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-primary mr-2" />
                  <CardTitle className="text-lg">{record.diagnosis}</CardTitle>
                </div>
                <div className="flex items-center">
                  <div className="text-sm text-gray-500 mr-4">
                    <Calendar className="inline-block mr-1 h-4 w-4" />
                    {formatDate(record.visitDate)}
                  </div>
                  {expandedRecordId === record.id ? 
                    <ChevronDown className="h-5 w-5" /> : 
                    <ChevronRight className="h-5 w-5" />
                  }
                </div>
              </CardHeader>
              
              {expandedRecordId === record.id && (
                <CardContent className="px-6 pb-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1 text-gray-500">Diagnosis</h4>
                        <p className="text-gray-900">{record.diagnosis}</p>
                      </div>
                      
                      {record.symptoms && (
                        <div>
                          <h4 className="text-sm font-medium mb-1 text-gray-500">Symptoms</h4>
                          <p className="text-gray-900">{record.symptoms}</p>
                        </div>
                      )}
                      
                      {record.notes && (
                        <div>
                          <h4 className="text-sm font-medium mb-1 text-gray-500">Doctor's Notes</h4>
                          <p className="text-gray-900 whitespace-pre-line">{record.notes}</p>
                        </div>
                      )}
                      
                      {record.vitalSigns && typeof record.vitalSigns === 'object' && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 text-gray-500">Vital Signs</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {Object.entries(record.vitalSigns).map(([key, value]) => (
                              <div key={key} className="bg-gray-50 p-3 rounded-md">
                                <div className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                                <div className="font-medium">{value}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {record.medications && typeof record.medications === 'object' && (
                        <div>
                          <h4 className="text-sm font-medium mb-2 text-gray-500">Medications</h4>
                          {Array.isArray(record.medications) ? (
                            <div className="space-y-2">
                              {record.medications.map((medication, i) => (
                                <div key={i} className="bg-gray-50 p-3 rounded-md">
                                  <div className="font-medium">{medication.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {medication.dosage} • {medication.frequency}
                                  </div>
                                  {medication.instructions && (
                                    <div className="text-sm mt-1">{medication.instructions}</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {Object.entries(record.medications).map(([key, value]) => (
                                <div key={key} className="bg-gray-50 p-3 rounded-md">
                                  <div className="font-medium">{key}</div>
                                  <div className="text-sm">{value}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {record.allergies && (
                        <div>
                          <h4 className="text-sm font-medium mb-1 text-gray-500">Allergies</h4>
                          <p className="text-gray-900">{record.allergies}</p>
                        </div>
                      )}
                      
                      {record.followUpDate && (
                        <div className="flex items-center mt-4 p-3 bg-blue-50 text-blue-700 rounded-md">
                          <AlertCircle className="h-5 w-5 mr-2 text-blue-500" />
                          <div>
                            <span className="font-medium">Follow-up appointment: </span>
                            {formatDate(record.followUpDate)}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-gray-500">Attending Physician</h4>
                      <div className="bg-gray-50 p-4 rounded-md mb-6 flex items-center">
                        <div className="h-10 w-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mr-3">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">Dr. #{record.doctorId}</div>
                          <div className="text-sm text-gray-500">Visit date: {formatDate(record.visitDate)}</div>
                        </div>
                      </div>
                      
                      <h4 className="text-sm font-medium mb-2 text-gray-500">Lab Results</h4>
                      {isLoadingLabResults ? (
                        <div className="text-center p-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                        </div>
                      ) : labResults && labResults.length > 0 ? (
                        <Accordion type="single" collapsible className="bg-gray-50 rounded-md">
                          {labResults.map((labResult) => (
                            <AccordionItem key={labResult.id} value={`lab-${labResult.id}`}>
                              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                <div className="flex flex-col items-start text-left">
                                  <div className="font-medium">{labResult.testName}</div>
                                  <div className="text-xs text-gray-500">{formatDate(labResult.testDate)}</div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-4">
                                <div className="space-y-2">
                                  {typeof labResult.results === 'object' ? (
                                    Object.entries(labResult.results).map(([key, value]) => (
                                      <div key={key} className="grid grid-cols-12 gap-2 text-sm">
                                        <div className="col-span-6 text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                                        <div className="col-span-3 font-medium">{value}</div>
                                        {labResult.normalRange && (
                                          <div className="col-span-3 text-gray-500 text-xs">
                                            {typeof labResult.normalRange === 'object' ? 
                                              labResult.normalRange[key] : labResult.normalRange}
                                          </div>
                                        )}
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-sm">{String(labResult.results)}</div>
                                  )}
                                  
                                  {labResult.interpretation && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                      <div className="text-sm font-medium mb-1">Interpretation</div>
                                      <div className="text-sm">{labResult.interpretation}</div>
                                    </div>
                                  )}
                                  
                                  {labResult.performedBy && (
                                    <div className="text-xs text-gray-500 mt-2">
                                      Performed by: {labResult.performedBy}
                                    </div>
                                  )}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      ) : (
                        <div className="bg-gray-50 rounded-md p-4 text-center text-gray-500">
                          <ClipboardList className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <p>No lab results available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium mb-2">No medical records found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {searchQuery ? "No medical records match your search criteria." : "You don't have any medical records yet."}
          </p>
        </div>
      )}
    </MainLayout>
  );
}