export interface FirebaseUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'patient' | 'doctor' | 'admin';
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FirebaseDoctor {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  email: string;
  specialty: string;
  bio: string | null;
  education: string | null;
  languages: string | null;
  avatarUrl: string | null;
  rating: number | null;
  reviewCount: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface FirebaseAppointment {
  id: string;
  doctorId: string;
  patientId: string;
  date: string;
  time: string;
  startTime: string;
  endTime: string;
  type: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  reason?: string;
  notes?: string;
  patientName: string;
  patientAvatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FirebaseSchedule {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FirebaseMedicalRecord {
  id: string;
  doctorId: string;
  patientId: string;
  date: string;
  diagnosis: string;
  prescription: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FirebaseLabResult {
  id: string;
  medicalRecordId: string;
  testName: string;
  testDate: string;
  results: Record<string, string> | string;
  normalRange?: Record<string, string> | string;
  interpretation?: string;
  performedBy?: string;
  createdAt: string;
  updatedAt: string;
} 