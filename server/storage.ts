import { users, type User, type InsertUser, 
  doctors, type Doctor, type InsertDoctor,
  schedules, type Schedule, type InsertSchedule,
  appointments, type Appointment, type InsertAppointment 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interfaces for the storage
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Doctor operations
  getAllDoctors(): Promise<Doctor[]>;
  getDoctor(id: number): Promise<Doctor | undefined>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  
  // Schedule operations
  getDoctorSchedules(doctorId: number): Promise<Schedule[]>;
  createSchedule(schedule: InsertSchedule): Promise<Schedule>;
  updateSchedule(id: number, schedule: Partial<InsertSchedule>): Promise<Schedule | undefined>;
  
  // Appointment operations
  getAllAppointments(): Promise<Appointment[]>;
  getUserAppointments(userId: number): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<void>;
  
  // Stats for admin dashboard
  getSystemStats(): Promise<{
    totalAppointments: number;
    doctorsOnDuty: number;
    averageWaitTime: number;
    efficiency: number;
  }>;
  
  // Session store
  sessionStore: any; // Using any for SessionStore to avoid TypeScript errors
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private doctorsMap: Map<number, Doctor>;
  private schedulesMap: Map<number, Schedule>;
  private appointmentsMap: Map<number, Appointment>;
  private userIdCounter: number;
  private doctorIdCounter: number;
  private scheduleIdCounter: number;
  private appointmentIdCounter: number;
  sessionStore: any; // Using any type for sessionStore

  constructor() {
    this.usersMap = new Map();
    this.doctorsMap = new Map();
    this.schedulesMap = new Map();
    this.appointmentsMap = new Map();
    this.userIdCounter = 1;
    this.doctorIdCounter = 1;
    this.scheduleIdCounter = 1;
    this.appointmentIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });

    // Initialize with sample data
    this.initializeData().catch(err => {
      console.error("Failed to initialize data:", err);
    });
  }

  private async initializeData() {
    // Create initial admin user
    const adminPassword = await import('crypto').then(crypto => {
      const { scrypt, randomBytes } = crypto;
      const salt = randomBytes(16).toString("hex");
      return new Promise<string>((resolve, reject) => {
        scrypt("admin123", salt, 64, (err, derivedKey) => {
          if (err) reject(err);
          resolve(`${derivedKey.toString("hex")}.${salt}`);
        });
      });
    });

    const admin = {
      id: this.userIdCounter++,
      username: "admin",
      password: adminPassword,
      email: "admin@healthschedule.com",
      fullName: "System Administrator",
      role: "admin",
      phone: null,
      createdAt: new Date()
    };
    this.usersMap.set(admin.id, admin);

    // Create some patient users
    const patientPassword = await import('crypto').then(crypto => {
      const { scrypt, randomBytes } = crypto;
      const salt = randomBytes(16).toString("hex");
      return new Promise<string>((resolve, reject) => {
        scrypt("patient123", salt, 64, (err, derivedKey) => {
          if (err) reject(err);
          resolve(`${derivedKey.toString("hex")}.${salt}`);
        });
      });
    });

    // Patient 1
    const patient1 = {
      id: this.userIdCounter++,
      username: "patient1",
      password: patientPassword,
      email: "patient1@example.com",
      fullName: "Jane Smith",
      role: "patient",
      phone: "555-123-4567",
      createdAt: new Date()
    };
    this.usersMap.set(patient1.id, patient1);

    // Create doctor users
    const doctorPassword = await import('crypto').then(crypto => {
      const { scrypt, randomBytes } = crypto;
      const salt = randomBytes(16).toString("hex");
      return new Promise<string>((resolve, reject) => {
        scrypt("doctor123", salt, 64, (err, derivedKey) => {
          if (err) reject(err);
          resolve(`${derivedKey.toString("hex")}.${salt}`);
        });
      });
    });

    // Doctor 1 user
    const doctor1User = {
      id: this.userIdCounter++,
      username: "drjohnson",
      password: doctorPassword,
      email: "johnson@healthschedule.com",
      fullName: "Dr. Robert Johnson",
      role: "doctor",
      phone: "555-987-6543",
      createdAt: new Date()
    };
    this.usersMap.set(doctor1User.id, doctor1User);

    // Doctor 2 user
    const doctor2User = {
      id: this.userIdCounter++,
      username: "drchen",
      password: doctorPassword,
      email: "chen@healthschedule.com",
      fullName: "Dr. Emily Chen",
      role: "doctor",
      phone: "555-456-7890",
      createdAt: new Date()
    };
    this.usersMap.set(doctor2User.id, doctor2User);

    // Create doctor profiles
    const doctor1 = {
      id: this.doctorIdCounter++,
      userId: doctor1User.id,
      specialty: "Cardiology",
      bio: "Dr. Johnson is a board-certified cardiologist with over 15 years of experience in treating cardiovascular diseases.",
      education: "MD, Harvard Medical School",
      languages: "English, Spanish",
      avatarUrl: null,
      rating: 4.8,
      reviewCount: 42
    };
    this.doctorsMap.set(doctor1.id, doctor1);

    const doctor2 = {
      id: this.doctorIdCounter++,
      userId: doctor2User.id,
      specialty: "Pediatrics",
      bio: "Dr. Chen specializes in pediatric care and has been practicing for 10 years with a focus on newborn care and childhood development.",
      education: "MD, Johns Hopkins University",
      languages: "English, Mandarin",
      avatarUrl: null,
      rating: 4.9,
      reviewCount: 56
    };
    this.doctorsMap.set(doctor2.id, doctor2);

    // Create schedules for doctors
    // Doctor 1 - Monday, Wednesday, Friday
    const schedules = [
      // Monday
      {
        id: this.scheduleIdCounter++,
        doctorId: doctor1.id,
        dayOfWeek: 1, // Monday
        startTime: "09:00:00",
        endTime: "17:00:00",
        isAvailable: true
      },
      // Wednesday
      {
        id: this.scheduleIdCounter++,
        doctorId: doctor1.id,
        dayOfWeek: 3, // Wednesday
        startTime: "09:00:00",
        endTime: "17:00:00",
        isAvailable: true
      },
      // Friday
      {
        id: this.scheduleIdCounter++,
        doctorId: doctor1.id,
        dayOfWeek: 5, // Friday
        startTime: "09:00:00",
        endTime: "15:00:00",
        isAvailable: true
      },
      // Doctor 2 - Tuesday, Thursday
      {
        id: this.scheduleIdCounter++,
        doctorId: doctor2.id,
        dayOfWeek: 2, // Tuesday
        startTime: "08:00:00",
        endTime: "16:00:00",
        isAvailable: true
      },
      {
        id: this.scheduleIdCounter++,
        doctorId: doctor2.id,
        dayOfWeek: 4, // Thursday
        startTime: "08:00:00",
        endTime: "16:00:00",
        isAvailable: true
      }
    ];

    // Add all schedules
    for (const schedule of schedules) {
      this.schedulesMap.set(schedule.id, schedule);
    }

    // Create some sample appointments
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    const appointments = [
      {
        id: this.appointmentIdCounter++,
        patientId: patient1.id,
        doctorId: doctor1.id,
        date: tomorrowStr,
        startTime: "10:00:00",
        endTime: "10:30:00",
        reason: "Annual checkup",
        notes: null,
        status: "confirmed",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: this.appointmentIdCounter++,
        patientId: patient1.id,
        doctorId: doctor2.id,
        date: nextWeekStr,
        startTime: "14:00:00",
        endTime: "14:30:00",
        reason: "Followup consultation",
        notes: "Bring previous test results",
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Add all appointments
    for (const appointment of appointments) {
      this.appointmentsMap.set(appointment.id, appointment);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = {
      id,
      role: userData.role || 'patient', // Ensure role is never undefined
      username: userData.username,
      password: userData.password,
      email: userData.email,
      fullName: userData.fullName,
      phone: userData.phone || null,
      createdAt: now
    };
    this.usersMap.set(id, user);
    return user;
  }

  // Doctor operations
  async getAllDoctors(): Promise<Doctor[]> {
    return Array.from(this.doctorsMap.values());
  }

  async getDoctor(id: number): Promise<Doctor | undefined> {
    return this.doctorsMap.get(id);
  }

  async createDoctor(doctorData: InsertDoctor): Promise<Doctor> {
    const id = this.doctorIdCounter++;
    const doctor: Doctor = {
      id,
      userId: doctorData.userId,
      specialty: doctorData.specialty,
      bio: doctorData.bio || null,
      education: doctorData.education || null,
      languages: doctorData.languages || null,
      avatarUrl: doctorData.avatarUrl || null,
      rating: 0,
      reviewCount: 0
    };
    this.doctorsMap.set(id, doctor);
    return doctor;
  }

  // Schedule operations
  async getDoctorSchedules(doctorId: number): Promise<Schedule[]> {
    return Array.from(this.schedulesMap.values()).filter(
      (schedule) => schedule.doctorId === doctorId
    );
  }

  async createSchedule(scheduleData: InsertSchedule): Promise<Schedule> {
    const id = this.scheduleIdCounter++;
    const schedule: Schedule = {
      id,
      doctorId: scheduleData.doctorId,
      dayOfWeek: scheduleData.dayOfWeek,
      startTime: scheduleData.startTime,
      endTime: scheduleData.endTime,
      isAvailable: scheduleData.isAvailable !== undefined ? scheduleData.isAvailable : true
    };
    this.schedulesMap.set(id, schedule);
    return schedule;
  }

  async updateSchedule(id: number, scheduleData: Partial<InsertSchedule>): Promise<Schedule | undefined> {
    const existingSchedule = this.schedulesMap.get(id);
    if (!existingSchedule) {
      return undefined;
    }
    
    const updatedSchedule = {
      ...existingSchedule,
      ...scheduleData
    };
    this.schedulesMap.set(id, updatedSchedule);
    return updatedSchedule;
  }

  // Appointment operations
  async getAllAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointmentsMap.values());
  }

  async getUserAppointments(userId: number): Promise<Appointment[]> {
    return Array.from(this.appointmentsMap.values()).filter(
      (appointment) => appointment.patientId === userId
    );
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointmentsMap.get(id);
  }

  async createAppointment(appointmentData: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentIdCounter++;
    const now = new Date();
    const appointment: Appointment = {
      id,
      patientId: appointmentData.patientId,
      doctorId: appointmentData.doctorId,
      date: appointmentData.date,
      startTime: appointmentData.startTime,
      endTime: appointmentData.endTime,
      reason: appointmentData.reason,
      notes: appointmentData.notes || null,
      status: appointmentData.status || 'pending',
      createdAt: now,
      updatedAt: now
    };
    this.appointmentsMap.set(id, appointment);
    return appointment;
  }

  async updateAppointment(id: number, appointmentData: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const existingAppointment = this.appointmentsMap.get(id);
    if (!existingAppointment) {
      return undefined;
    }
    
    const now = new Date();
    const updatedAppointment = {
      ...existingAppointment,
      ...appointmentData,
      updatedAt: now
    };
    this.appointmentsMap.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async deleteAppointment(id: number): Promise<void> {
    this.appointmentsMap.delete(id);
  }

  // Stats for admin dashboard
  async getSystemStats(): Promise<{ totalAppointments: number; doctorsOnDuty: number; averageWaitTime: number; efficiency: number; }> {
    const appointments = Array.from(this.appointmentsMap.values());
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate total appointments for today
    const todayAppointments = appointments.filter(
      (appointment) => appointment.date.toString().split('T')[0] === today
    );
    
    // Calculate doctors on duty (unique doctors with appointments today)
    const doctorsOnDuty = new Set(
      todayAppointments.map(appointment => appointment.doctorId)
    ).size;
    
    // For a real app, these would be calculated based on actual data
    // Here we provide reasonable defaults
    return {
      totalAppointments: todayAppointments.length,
      doctorsOnDuty,
      averageWaitTime: 12, // 12 minutes average wait time
      efficiency: 89 // 89% efficiency
    };
  }
}

export const storage = new MemStorage();
