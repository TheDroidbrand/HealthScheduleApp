import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertDoctorSchema, 
  insertAppointmentSchema, 
  insertScheduleSchema,
  insertMedicalRecordSchema,
  insertLabResultSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Doctor routes
  app.get("/api/doctors", async (req, res) => {
    try {
      const doctors = await storage.getAllDoctors();
      res.json(doctors);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch doctors" });
    }
  });

  app.get("/api/doctors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const doctor = await storage.getDoctor(id);
      if (!doctor) {
        return res.status(404).json({ error: "Doctor not found" });
      }
      res.json(doctor);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch doctor" });
    }
  });

  // Doctor schedule routes
  app.get("/api/doctors/:id/schedules", async (req, res) => {
    try {
      const doctorId = parseInt(req.params.id);
      const schedules = await storage.getDoctorSchedules(doctorId);
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch doctor schedules" });
    }
  });

  app.post("/api/schedules", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const scheduleData = insertScheduleSchema.parse(req.body);
      const schedule = await storage.createSchedule(scheduleData);
      res.status(201).json(schedule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create schedule" });
    }
  });

  app.put("/api/schedules/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const id = parseInt(req.params.id);
      const scheduleData = insertScheduleSchema.parse(req.body);
      const updated = await storage.updateSchedule(id, scheduleData);
      
      if (!updated) {
        return res.status(404).json({ error: "Schedule not found" });
      }
      
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update schedule" });
    }
  });

  // Appointment routes
  app.get("/api/appointments", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      let appointments;
      if (req.user.role === "admin") {
        appointments = await storage.getAllAppointments();
      } else {
        appointments = await storage.getUserAppointments(req.user.id);
      }
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const appointmentData = insertAppointmentSchema.parse({
        ...req.body,
        patientId: req.user.role === "patient" ? req.user.id : req.body.patientId
      });
      
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create appointment" });
    }
  });

  app.put("/api/appointments/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const id = parseInt(req.params.id);
      const appointment = await storage.getAppointment(id);
      
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }

      // Check if user is authorized to update this appointment
      if (req.user.role !== "admin" && req.user.id !== appointment.patientId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const updateData = {
        ...req.body,
        // Ensure patientId doesn't change unless admin
        patientId: req.user.role === "admin" ? req.body.patientId : appointment.patientId
      };
      
      const updated = await storage.updateAppointment(id, updateData);
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update appointment" });
    }
  });

  app.delete("/api/appointments/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const id = parseInt(req.params.id);
      const appointment = await storage.getAppointment(id);
      
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }

      // Check if user is authorized to delete this appointment
      if (req.user.role !== "admin" && req.user.id !== appointment.patientId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      await storage.deleteAppointment(id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete appointment" });
    }
  });

  // Stats for admin dashboard
  app.get("/api/stats", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== "admin") {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const stats = await storage.getSystemStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch system stats" });
    }
  });

  // Electronic Health Records (EHR) routes
  
  // Medical Records
  app.get("/api/medical-records/patient/:patientId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const patientId = parseInt(req.params.patientId);
      if (isNaN(patientId)) return res.status(400).json({ error: "Invalid patient ID" });
      
      // Check authorization - only admin, the patient themselves, or their doctor can access
      const currentUser = req.user!;
      if (currentUser.role !== "admin" && 
          currentUser.id !== patientId && 
          currentUser.role !== "doctor") {
        return res.status(403).json({ error: "Not authorized to access these records" });
      }
      
      const records = await storage.getPatientMedicalRecords(patientId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch medical records" });
    }
  });
  
  app.get("/api/medical-records/doctor/:doctorId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const doctorId = parseInt(req.params.doctorId);
      if (isNaN(doctorId)) return res.status(400).json({ error: "Invalid doctor ID" });
      
      // Check authorization - only admin or the doctor themselves can access
      const currentUser = req.user!;
      const doctor = await storage.getDoctor(doctorId);
      
      if (currentUser.role !== "admin" && 
          (currentUser.role !== "doctor" || doctor?.userId !== currentUser.id)) {
        return res.status(403).json({ error: "Not authorized to access these records" });
      }
      
      const records = await storage.getDoctorMedicalRecords(doctorId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch medical records" });
    }
  });
  
  app.get("/api/medical-records/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const recordId = parseInt(req.params.id);
      if (isNaN(recordId)) return res.status(400).json({ error: "Invalid record ID" });
      
      const record = await storage.getMedicalRecord(recordId);
      if (!record) return res.status(404).json({ error: "Medical record not found" });
      
      // Check authorization - only admin, the patient, or their doctor can access
      const currentUser = req.user!;
      if (currentUser.role !== "admin" && 
          currentUser.id !== record.patientId &&
          (currentUser.role !== "doctor")) {
        return res.status(403).json({ error: "Not authorized to access this record" });
      }
      
      res.json(record);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch medical record" });
    }
  });
  
  app.post("/api/medical-records", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Only doctors and admins can create medical records
      if (req.user!.role !== "doctor" && req.user!.role !== "admin") {
        return res.status(403).json({ error: "Only doctors can create medical records" });
      }
      
      const recordData = insertMedicalRecordSchema.parse(req.body);
      
      // If a doctor is creating a record, verify it's their doctor ID
      if (req.user!.role === "doctor") {
        const doctor = await storage.getDoctor(recordData.doctorId);
        if (!doctor || doctor.userId !== req.user!.id) {
          return res.status(403).json({ error: "Doctors can only create records with their own ID" });
        }
      }
      
      const record = await storage.createMedicalRecord(recordData);
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid medical record data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create medical record" });
    }
  });
  
  app.put("/api/medical-records/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const recordId = parseInt(req.params.id);
      if (isNaN(recordId)) return res.status(400).json({ error: "Invalid record ID" });
      
      const record = await storage.getMedicalRecord(recordId);
      if (!record) return res.status(404).json({ error: "Medical record not found" });
      
      // Check authorization - only the doctor who created the record or an admin can update it
      const currentUser = req.user!;
      
      if (currentUser.role === "doctor") {
        const doctor = await storage.getDoctor(record.doctorId);
        if (!doctor || doctor.userId !== currentUser.id) {
          return res.status(403).json({ error: "Only the doctor who created this record can update it" });
        }
      } else if (currentUser.role !== "admin") {
        return res.status(403).json({ error: "Not authorized to update this record" });
      }
      
      const recordData = insertMedicalRecordSchema.partial().parse(req.body);
      const updatedRecord = await storage.updateMedicalRecord(recordId, recordData);
      
      res.json(updatedRecord);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid medical record data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update medical record" });
    }
  });
  
  // Lab Results
  app.get("/api/lab-results/medical-record/:medicalRecordId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const medicalRecordId = parseInt(req.params.medicalRecordId);
      if (isNaN(medicalRecordId)) return res.status(400).json({ error: "Invalid medical record ID" });
      
      const medicalRecord = await storage.getMedicalRecord(medicalRecordId);
      if (!medicalRecord) return res.status(404).json({ error: "Medical record not found" });
      
      // Check authorization - only admin, the patient, or their doctor can access
      const currentUser = req.user!;
      if (currentUser.role !== "admin" && 
          currentUser.id !== medicalRecord.patientId &&
          (currentUser.role !== "doctor")) {
        return res.status(403).json({ error: "Not authorized to access these lab results" });
      }
      
      const labResults = await storage.getMedicalRecordLabResults(medicalRecordId);
      res.json(labResults);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lab results" });
    }
  });
  
  app.get("/api/lab-results/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const resultId = parseInt(req.params.id);
      if (isNaN(resultId)) return res.status(400).json({ error: "Invalid lab result ID" });
      
      const result = await storage.getLabResult(resultId);
      if (!result) return res.status(404).json({ error: "Lab result not found" });
      
      // Check authorization by getting the associated medical record
      const medicalRecord = await storage.getMedicalRecord(result.medicalRecordId);
      if (!medicalRecord) return res.status(404).json({ error: "Associated medical record not found" });
      
      const currentUser = req.user!;
      if (currentUser.role !== "admin" && 
          currentUser.id !== medicalRecord.patientId &&
          (currentUser.role !== "doctor")) {
        return res.status(403).json({ error: "Not authorized to access this lab result" });
      }
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lab result" });
    }
  });
  
  app.post("/api/lab-results", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Only doctors and admins can create lab results
      if (req.user!.role !== "doctor" && req.user!.role !== "admin") {
        return res.status(403).json({ error: "Only medical staff can create lab results" });
      }
      
      const resultData = insertLabResultSchema.parse(req.body);
      
      // Verify the medical record exists
      const medicalRecord = await storage.getMedicalRecord(resultData.medicalRecordId);
      if (!medicalRecord) return res.status(404).json({ error: "Associated medical record not found" });
      
      // Additional validation for doctors
      if (req.user!.role === "doctor") {
        const doctor = await storage.getDoctor(medicalRecord.doctorId);
        if (!doctor || doctor.userId !== req.user!.id) {
          return res.status(403).json({ error: "Doctors can only add lab results to their own patients' records" });
        }
      }
      
      const result = await storage.createLabResult(resultData);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid lab result data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create lab result" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
