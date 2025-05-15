import { pgTable, text, serial, integer, boolean, time, date, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("patient"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  role: true,
  phone: true,
});

export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  specialty: text("specialty").notNull(),
  bio: text("bio"),
  education: text("education"),
  languages: text("languages"),
  avatarUrl: text("avatar_url"),
  rating: integer("rating").default(0),
  reviewCount: integer("review_count").default(0),
});

export const insertDoctorSchema = createInsertSchema(doctors).pick({
  userId: true,
  specialty: true,
  bio: true,
  education: true,
  languages: true,
  avatarUrl: true,
});

export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").notNull().references(() => doctors.id),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Sunday, 1=Monday, etc.
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  isAvailable: boolean("is_available").default(true),
});

export const insertScheduleSchema = createInsertSchema(schedules).pick({
  doctorId: true,
  dayOfWeek: true,
  startTime: true,
  endTime: true,
  isAvailable: true,
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => users.id),
  doctorId: integer("doctor_id").notNull().references(() => doctors.id),
  date: date("date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  reason: text("reason").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("pending"), // pending, confirmed, cancelled, completed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).pick({
  patientId: true,
  doctorId: true,
  date: true,
  startTime: true,
  endTime: true,
  reason: true,
  notes: true,
  status: true,
});

// Export types for the models
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

// Electronic Health Records (EHR)
export const medicalRecords = pgTable("medical_records", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull().references(() => users.id),
  doctorId: integer("doctor_id").notNull().references(() => doctors.id),
  visitDate: date("visit_date").notNull(),
  diagnosis: text("diagnosis").notNull(),
  symptoms: text("symptoms"),
  vitalSigns: json("vital_signs"),
  medications: json("medications"),
  allergies: text("allergies"),
  notes: text("notes"),
  attachments: json("attachments"),
  followUpDate: date("follow_up_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMedicalRecordSchema = createInsertSchema(medicalRecords).pick({
  patientId: true,
  doctorId: true,
  visitDate: true,
  diagnosis: true,
  symptoms: true,
  vitalSigns: true,
  medications: true,
  allergies: true,
  notes: true,
  attachments: true,
  followUpDate: true,
});

export const labResults = pgTable("lab_results", {
  id: serial("id").primaryKey(),
  medicalRecordId: integer("medical_record_id").notNull().references(() => medicalRecords.id),
  testName: text("test_name").notNull(),
  testDate: date("test_date").notNull(),
  results: json("results").notNull(),
  normalRange: text("normal_range"),
  interpretation: text("interpretation"),
  performedBy: text("performed_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLabResultSchema = createInsertSchema(labResults).pick({
  medicalRecordId: true,
  testName: true,
  testDate: true,
  results: true,
  normalRange: true,
  interpretation: true,
  performedBy: true,
});

export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type InsertMedicalRecord = z.infer<typeof insertMedicalRecordSchema>;

export type LabResult = typeof labResults.$inferSelect;
export type InsertLabResult = z.infer<typeof insertLabResultSchema>;
