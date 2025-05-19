import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  Timestamp,
  orderBy,
  DocumentData,
  setDoc,
  limit,
  startAfter,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  FirebaseUser, 
  FirebaseDoctor, 
  FirebaseAppointment, 
  FirebaseSchedule,
  FirebaseMedicalRecord,
  FirebaseLabResult
} from '@/types/firebase';

// Users
export const userService = {
  async getCurrentUser(userId: string): Promise<FirebaseUser | null> {
    const userDoc = await getDoc(doc(db, "users", userId));
    return userDoc.exists() ? (userDoc.data() as FirebaseUser) : null;
  },

  async getDoctorProfile(userId: string): Promise<FirebaseDoctor | null> {
    const doctorDoc = await getDoc(doc(db, "doctors", userId));
    return doctorDoc.exists() ? (doctorDoc.data() as FirebaseDoctor) : null;
  },

  async getPatientProfile(userId: string): Promise<FirebaseUser | null> {
    const patientDoc = await getDoc(doc(db, "patients", userId));
    return patientDoc.exists() ? (patientDoc.data() as FirebaseUser) : null;
  },

  async createUser(userId: string, data: FirebaseUser | FirebaseDoctor) {
    try {
      console.log('Creating document with ID:', userId);
      console.log('Document data:', data);
      
      // Create user document
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // If the data is a doctor, create a doctor document in the doctors collection
      if ('specialty' in data) {
        const doctorRef = doc(db, 'doctors', userId);
        await setDoc(doctorRef, {
          ...data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      console.log('Document created successfully');
    } catch (error: any) {
      console.error('Error creating user document:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      // Check for specific Firestore errors
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Please check your Firebase rules.');
      } else if (error.code === 'already-exists') {
        throw new Error('A document with this ID already exists.');
      } else if (error.code === 'invalid-argument') {
        throw new Error('Invalid document data provided.');
      }
      
      throw error;
    }
  },

  async updateUser(userId: string, data: Partial<FirebaseUser>) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async getUserByEmail(email: string): Promise<FirebaseUser | null> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as FirebaseUser;
      }
      return null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  },

  async getUserByUsername(username: string): Promise<FirebaseUser | null> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as FirebaseUser;
      }
      return null;
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw error;
    }
  },

  async createDoctor(userId: string, data: FirebaseDoctor) {
    try {
      console.log('Creating doctor document with ID:', userId);
      console.log('Doctor document data:', data);
      
      const doctorRef = doc(db, 'doctors', userId);
      await setDoc(doctorRef, {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      console.log('Doctor document created successfully');
    } catch (error: any) {
      console.error('Error creating doctor document:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  },

  async updateDoctor(userId: string, data: Partial<FirebaseDoctor>) {
    try {
      const doctorRef = doc(db, 'doctors', userId);
      await updateDoc(doctorRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating doctor:', error);
      throw error;
    }
  },

  async getAllDoctors(): Promise<FirebaseDoctor[]> {
    const doctorsSnapshot = await getDocs(collection(db, "doctors"));
    return doctorsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FirebaseDoctor[];
  },

  async getAllPatients(): Promise<FirebaseUser[]> {
    const patientsSnapshot = await getDocs(collection(db, "patients"));
    return patientsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FirebaseUser[];
  },

  async updateDoctorProfile(userId: string, data: Partial<FirebaseDoctor>): Promise<void> {
    await updateDoc(doc(db, "doctors", userId), data);
  },

  async updatePatientProfile(userId: string, data: Partial<FirebaseUser>): Promise<void> {
    await updateDoc(doc(db, "patients", userId), data);
  },
};

// Schedules
export const scheduleService = {
  async getDoctorSchedules(doctorId: string): Promise<FirebaseSchedule[]> {
    const schedulesRef = collection(db, 'schedules');
    const q = query(schedulesRef, where('doctorId', '==', doctorId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as FirebaseSchedule[];
  },

  async createSchedule(schedule: Omit<FirebaseSchedule, 'id'>): Promise<FirebaseSchedule> {
    const docRef = await addDoc(collection(db, 'schedules'), schedule);
    return { id: docRef.id, ...schedule };
  },

  async updateSchedule(scheduleId: string, data: Partial<FirebaseSchedule>): Promise<void> {
    const docRef = doc(db, 'schedules', scheduleId);
    await updateDoc(docRef, data);
  }
};

// Appointments
export const appointmentService = {
  async getPatientAppointments(patientId: string): Promise<FirebaseAppointment[]> {
    console.log('Fetching appointments for patient:', patientId);
    const appointmentsQuery = query(
      collection(db, "appointments"),
      where("patientId", "==", patientId)
    );
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    const appointments = appointmentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FirebaseAppointment[];
    console.log('Found appointments:', appointments);
    return appointments;
  },

  async getDoctorAppointments(doctorId: string): Promise<FirebaseAppointment[]> {
    const appointmentsQuery = query(
      collection(db, "appointments"),
      where("doctorId", "==", doctorId)
    );
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    return appointmentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FirebaseAppointment[];
  },

  async getAllAppointments(): Promise<FirebaseAppointment[]> {
    const appointmentsQuery = query(
      collection(db, "appointments")
    );
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    return appointmentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FirebaseAppointment[];
  },

  async createAppointment(appointment: Omit<FirebaseAppointment, "id">): Promise<string> {
    console.log('Creating appointment:', appointment);
    const docRef = await addDoc(collection(db, "appointments"), appointment);
    console.log('Created appointment with ID:', docRef.id);
    return docRef.id;
  },

  async updateAppointment(appointmentId: string, data: Partial<FirebaseAppointment>): Promise<void> {
    await updateDoc(doc(db, "appointments", appointmentId), data);
  },

  async deleteAppointment(appointmentId: string): Promise<void> {
    await deleteDoc(doc(db, "appointments", appointmentId));
  },
};

// Medical Records
export const medicalRecordService = {
  async getPatientRecords(patientId: string): Promise<FirebaseMedicalRecord[]> {
    const q = query(
      collection(db, 'medicalRecords'),
      where('patientId', '==', patientId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FirebaseMedicalRecord[];
  },

  async createMedicalRecord(record: Omit<FirebaseMedicalRecord, 'id'>): Promise<FirebaseMedicalRecord> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, 'medicalRecords'), {
      ...record,
      createdAt: now.toDate().toISOString(),
      updatedAt: now.toDate().toISOString()
    });
    return { id: docRef.id, ...record };
  }
};

// Lab Results
export const labResultService = {
  async getRecordLabResults(medicalRecordId: string): Promise<FirebaseLabResult[]> {
    const q = query(
      collection(db, 'labResults'),
      where('medicalRecordId', '==', medicalRecordId),
      orderBy('testDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FirebaseLabResult[];
  },

  async createLabResult(result: Omit<FirebaseLabResult, 'id'>): Promise<FirebaseLabResult> {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, 'labResults'), {
      ...result,
      createdAt: now.toDate().toISOString()
    });
    return { id: docRef.id, ...result };
  }
}; 