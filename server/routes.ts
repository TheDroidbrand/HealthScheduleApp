import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertDoctorSchema, insertAppointmentSchema, insertScheduleSchema } from "@shared/schema";
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

  const httpServer = createServer(app);
  return httpServer;
}
