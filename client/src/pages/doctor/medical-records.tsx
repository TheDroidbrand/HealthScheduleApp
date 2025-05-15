import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MedicalRecord, LabResult, InsertMedicalRecord, InsertLabResult } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Form schema for medical records
const medicalRecordSchema = z.object({
  patientId: z.number(),
  diagnosis: z.string().min(1, "Diagnosis is required"),
  visitDate: z.string(),
  symptoms: z.string().optional(),
  vitalSigns: z.string().optional(),
  medications: z.string().optional(),
  allergies: z.string().optional(),
  notes: z.string().optional(),
  followUpDate: z.string().optional(),
});

// Form schema for lab results
const labResultSchema = z.object({
  medicalRecordId: z.number(),
  testName: z.string().min(1, "Test name is required"),
  testDate: z.string(),
  results: z.string().min(1, "Results are required"),
  normalRange: z.string().optional(),
  interpretation: z.string().optional(),
  performedBy: z.string().optional(),
});

type MedicalRecordFormValues = z.infer<typeof medicalRecordSchema>;
type LabResultFormValues = z.infer<typeof labResultSchema>;

export default function DoctorMedicalRecords() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRecordId, setExpandedRecordId] = useState<number | null>(null);
  const [showNewRecordDialog, setShowNewRecordDialog] = useState(false);
  const [showNewLabDialog, setShowNewLabDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  
  // Get doctor ID
  const { data: doctorData } = useQuery({
    queryKey: ["/api/doctors"],
    enabled: !!user && user.role === "doctor",
  });
  
  const doctorId = doctorData?.find(d => d.userId === user?.id)?.id;
  
  // Fetch medical records for this doctor
  const { data: records, isLoading: isLoadingRecords } = useQuery<MedicalRecord[]>({
    queryKey: ["/api/medical-records/doctor", doctorId],
    enabled: !!doctorId,
  });
  
  // Fetch appointments for patient list
  const { data: appointments } = useQuery({
    queryKey: ["/api/appointments"],
    enabled: !!user && user.role === "doctor",
  });
  
  // Get unique patients from appointments
  const uniquePatients = appointments ? 
    [...new Set(appointments.map(apt => apt.patientId))] : [];
  
  // Filter records based on search query and active tab
  const filteredRecords = records?.filter(record => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      record.diagnosis.toLowerCase().includes(query) ||
      (record.symptoms && record.symptoms.toLowerCase().includes(query)) ||
      (record.notes && record.notes.toLowerCase().includes(query));
    
    if (activeTab === "all") {
      return matchesSearch;
    } else if (activeTab === "patient" && selectedPatientId) {
      return matchesSearch && record.patientId === selectedPatientId;
    }
    
    return matchesSearch;
  });
  
  // Load lab results for a specific medical record when expanded
  const { data: labResults, isLoading: isLoadingLabResults } = useQuery<LabResult[]>({
    queryKey: ["/api/lab-results/medical-record", expandedRecordId],
    enabled: expandedRecordId !== null,
  });
  
  // Form for new medical record
  const recordForm = useForm<MedicalRecordFormValues>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: {
      patientId: selectedPatientId || undefined,
      visitDate: new Date().toISOString().split('T')[0],
      diagnosis: "",
      symptoms: "",
      vitalSigns: "",
      medications: "",
      allergies: "",
      notes: "",
      followUpDate: "",
    }
  });
  
  // Form for new lab result
  const labForm = useForm<LabResultFormValues>({
    resolver: zodResolver(labResultSchema),
    defaultValues: {
      medicalRecordId: expandedRecordId || undefined,
      testName: "",
      testDate: new Date().toISOString().split('T')[0],
      results: "",
      normalRange: "",
      interpretation: "",
      performedBy: "",
    }
  });
  
  // Create new medical record mutation
  const createRecordMutation = useMutation({
    mutationFn: async (data: MedicalRecordFormValues) => {
      // Parse stringified JSON fields
      let formattedData: any = { ...data };
      
      if (data.vitalSigns) {
        try {
          formattedData.vitalSigns = JSON.parse(data.vitalSigns);
        } catch (e) {
          formattedData.vitalSigns = { value: data.vitalSigns };
        }
      }
      
      if (data.medications) {
        try {
          formattedData.medications = JSON.parse(data.medications);
        } catch (e) {
          formattedData.medications = { medications: data.medications };
        }
      }
      
      // Add doctor ID
      formattedData.doctorId = doctorId;
      
      const res = await apiRequest("POST", "/api/medical-records", formattedData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Medical record created",
        description: "The medical record has been created successfully.",
        variant: "default",
      });
      setShowNewRecordDialog(false);
      recordForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/medical-records/doctor", doctorId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create medical record",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Create new lab result mutation
  const createLabResultMutation = useMutation({
    mutationFn: async (data: LabResultFormValues) => {
      // Parse stringified JSON fields
      let formattedData: any = { ...data };
      
      if (data.results) {
        try {
          formattedData.results = JSON.parse(data.results);
        } catch (e) {
          formattedData.results = { value: data.results };
        }
      }
      
      if (data.normalRange) {
        try {
          formattedData.normalRange = JSON.parse(data.normalRange);
        } catch (e) {
          // Keep as string if not valid JSON
        }
      }
      
      const res = await apiRequest("POST", "/api/lab-results", formattedData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Lab result added",
        description: "The lab result has been added to the medical record.",
        variant: "default",
      });
      setShowNewLabDialog(false);
      labForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/lab-results/medical-record", expandedRecordId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add lab result",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleExpandRecord = (recordId: number) => {
    setExpandedRecordId(recordId === expandedRecordId ? null : recordId);
    if (recordId !== expandedRecordId) {
      // Update the lab form with the new medical record ID
      labForm.setValue("medicalRecordId", recordId);
    }
  };
  
  const handleNewRecord = (patientId?: number) => {
    if (patientId) {
      recordForm.setValue("patientId", patientId);
      setSelectedPatientId(patientId);
    }
    setShowNewRecordDialog(true);
  };
  
  const handleNewLabResult = () => {
    if (expandedRecordId) {
      labForm.setValue("medicalRecordId", expandedRecordId);
      setShowNewLabDialog(true);
    }
  };
  
  const onSubmitRecord = (values: MedicalRecordFormValues) => {
    createRecordMutation.mutate(values);
  };
  
  const onSubmitLabResult = (values: LabResultFormValues) => {
    createLabResultMutation.mutate(values);
  };
  
  const handleSelectPatient = (patientId: number) => {
    setSelectedPatientId(patientId);
    setActiveTab("patient");
  };
  
  return (
    <MainLayout title="Patient Medical Records">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-3/4">
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
            <Button onClick={() => handleNewRecord(selectedPatientId || undefined)}>
              <Plus className="mr-2 h-4 w-4" />
              New Medical Record
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">All Records</TabsTrigger>
              <TabsTrigger value="patient" disabled={!selectedPatientId}>
                {selectedPatientId ? `Patient #${selectedPatientId}` : "Select Patient"}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
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
                      <div>
                        <CardTitle className="text-lg">{record.diagnosis}</CardTitle>
                        <CardDescription>Patient #{record.patientId}</CardDescription>
                      </div>
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
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium text-gray-500">Lab Results</h4>
                            <Button variant="outline" size="sm" onClick={handleNewLabResult}>
                              <Plus className="h-3 w-3 mr-1" />
                              Add Lab Result
                            </Button>
                          </div>
                          
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
                              <p className="text-sm">No lab results available</p>
                              <Button variant="link" size="sm" onClick={handleNewLabResult} className="mt-1">
                                Add Lab Result
                              </Button>
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
                {searchQuery 
                  ? "No medical records match your search criteria." 
                  : activeTab === "patient" && selectedPatientId
                  ? `No medical records found for Patient #${selectedPatientId}.`
                  : "You haven't created any medical records yet."}
              </p>
              {activeTab === "patient" && selectedPatientId && (
                <Button onClick={() => handleNewRecord(selectedPatientId)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Record for Patient #{selectedPatientId}
                </Button>
              )}
            </div>
          )}
        </div>
        
        {/* Patients sidebar */}
        <div className="md:w-1/4">
          <Card>
            <CardHeader className="px-4 py-3 border-b">
              <CardTitle className="text-base">Your Patients</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {uniquePatients.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <User className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm">No patients found</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {uniquePatients.map((patientId) => (
                    <li key={patientId}>
                      <Button
                        variant="ghost"
                        className={`w-full justify-start rounded-none px-4 py-3 text-left ${
                          activeTab === "patient" && selectedPatientId === patientId
                            ? "bg-primary-50 text-primary-700"
                            : ""
                        }`}
                        onClick={() => handleSelectPatient(patientId)}
                      >
                        <User className="mr-2 h-4 w-4" />
                        <span>Patient #{patientId}</span>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* New Medical Record Dialog */}
      <Dialog open={showNewRecordDialog} onOpenChange={setShowNewRecordDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Medical Record</DialogTitle>
            <DialogDescription>
              Enter the details of the patient's medical record
            </DialogDescription>
          </DialogHeader>
          
          <Form {...recordForm}>
            <form onSubmit={recordForm.handleSubmit(onSubmitRecord)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={recordForm.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient ID</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={recordForm.control}
                  name="visitDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visit Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={recordForm.control}
                name="diagnosis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Diagnosis</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={recordForm.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symptoms</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={recordForm.control}
                  name="vitalSigns"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vital Signs (JSON format)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder='{"bloodPressure": "120/80", "temperature": "98.6°F", "heartRate": "72 bpm"}' rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={recordForm.control}
                  name="medications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medications (JSON format)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder='{"medication1": "dosage", "medication2": "dosage"}' rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={recordForm.control}
                name="allergies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allergies</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={recordForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doctor's Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={recordForm.control}
                name="followUpDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Follow-up Date (if needed)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowNewRecordDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createRecordMutation.isPending}
                >
                  {createRecordMutation.isPending ? "Creating..." : "Create Record"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* New Lab Result Dialog */}
      <Dialog open={showNewLabDialog} onOpenChange={setShowNewLabDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Lab Result</DialogTitle>
            <DialogDescription>
              Enter lab test results for this medical record
            </DialogDescription>
          </DialogHeader>
          
          <Form {...labForm}>
            <form onSubmit={labForm.handleSubmit(onSubmitLabResult)} className="space-y-4">
              <input type="hidden" {...labForm.register("medicalRecordId")} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={labForm.control}
                  name="testName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={labForm.control}
                  name="testDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Test Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={labForm.control}
                name="results"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Results (JSON format)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder='{"glucose": "95 mg/dL", "cholesterol": "180 mg/dL"}' rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={labForm.control}
                name="normalRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Normal Range</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="70-100 mg/dL" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={labForm.control}
                name="interpretation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interpretation</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={labForm.control}
                name="performedBy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Performed By</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowNewLabDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createLabResultMutation.isPending}
                >
                  {createLabResultMutation.isPending ? "Adding..." : "Add Lab Result"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}