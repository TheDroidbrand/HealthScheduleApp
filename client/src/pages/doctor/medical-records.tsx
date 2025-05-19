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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { medicalRecordService, userService } from "@/services";

// Form schema for medical records
const medicalRecordSchema = z.object({
  patientId: z.string(),
  date: z.string(),
  diagnosis: z.string().min(1, "Diagnosis is required"),
  prescription: z.string().optional(),
  notes: z.string().optional(),
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
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  
  // Get doctor ID
  const { data: doctorData } = useQuery({
    queryKey: ["/api/doctors"],
    enabled: !!user && user.role === "doctor",
  });
  
  const doctorId = doctorData?.find(d => d.userId === user?.id)?.id;
  
  // Fetch medical records for this doctor
  const { data: records, isLoading: isLoadingRecords } = useQuery<FirebaseMedicalRecord[]>({
    queryKey: ["medical-records", doctorId],
    queryFn: () => medicalRecordService.getDoctorRecords(doctorId || ""),
    enabled: !!doctorId,
  });
  
  // Fetch patients for this doctor
  const { data: patients = [] } = useQuery({
    queryKey: ["patients", doctorId],
    queryFn: () => userService.getDoctorPatients(doctorId || ""),
    enabled: !!doctorId,
  });
  
  // Filter records based on search query and active tab
  const filteredRecords = records?.filter(record => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      record.diagnosis.toLowerCase().includes(query) ||
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
      patientId: selectedPatientId || "",
      date: new Date().toISOString().split('T')[0],
      diagnosis: "",
      prescription: "",
      notes: "",
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
      if (!doctorId) throw new Error("Doctor ID not found");
      
      const appointmentData = {
        doctorId,
        patientId: data.patientId,
        date: data.date,
        diagnosis: data.diagnosis,
        prescription: data.prescription,
        notes: data.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return await medicalRecordService.createMedicalRecord(appointmentData);
    },
    onSuccess: () => {
      toast({
        title: "Medical record created",
        description: "The medical record has been created successfully.",
        variant: "default",
      });
      setShowNewRecordDialog(false);
      recordForm.reset();
      queryClient.invalidateQueries({ queryKey: ["medical-records", doctorId] });
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
  
  const handleExpandRecord = (recordId: string) => {
    setExpandedRecordId(recordId === expandedRecordId ? null : recordId);
  };
  
  const handleNewRecord = (patientId?: string) => {
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
  
  const handleSelectPatient = (patientId: string) => {
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
                        {formatDate(record.date)}
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
                          
                          {record.prescription && (
                            <div>
                              <h4 className="text-sm font-medium mb-1 text-gray-500">Prescription</h4>
                              <p className="text-gray-900 whitespace-pre-line">{record.prescription}</p>
                            </div>
                          )}
                          
                          {record.notes && (
                            <div>
                              <h4 className="text-sm font-medium mb-1 text-gray-500">Doctor's Notes</h4>
                              <p className="text-gray-900 whitespace-pre-line">{record.notes}</p>
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
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No medical records</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new medical record.
              </p>
            </div>
          )}
        </div>
        
        {/* Patient List Sidebar */}
        <div className="md:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle>Patients</CardTitle>
              <CardDescription>Select a patient to view their records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {patients.map((patient) => (
                  <Button
                    key={patient.id}
                    variant={selectedPatientId === patient.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handleSelectPatient(patient.id)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    {patient.fullName}
                  </Button>
                ))}
              </div>
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
                      <FormLabel>Patient</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a patient" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={recordForm.control}
                  name="date"
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
                name="prescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prescription</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
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