import { db } from './firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  DOCTORS: 'doctors',
  SCHEDULES: 'schedules',
  APPOINTMENTS: 'appointments',
  MEDICAL_RECORDS: 'medicalRecords',
  LAB_RESULTS: 'labResults'
};

// Create initial admin user
export async function createInitialAdmin(email: string, password: string) {
  try {
    // Create admin user document
    const adminUser = {
      id: 'admin',
      username: 'admin',
      email: email,
      fullName: 'System Administrator',
      role: 'admin',
      phone: null,
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, COLLECTIONS.USERS, 'admin'), adminUser);
    console.log('Initial admin user created successfully');
  } catch (error) {
    console.error('Error creating initial admin:', error);
    throw error;
  }
}

// Create Firestore indexes
export async function createIndexes() {
  try {
    // Create indexes for appointments
    const appointmentsRef = collection(db, COLLECTIONS.APPOINTMENTS);
    await setDoc(doc(db, '_indexes', 'appointments'), {
      fields: [
        { fieldPath: 'patientId', order: 'ASCENDING' },
        { fieldPath: 'date', order: 'DESCENDING' }
      ]
    });

    await setDoc(doc(db, '_indexes', 'doctor_appointments'), {
      fields: [
        { fieldPath: 'doctorId', order: 'ASCENDING' },
        { fieldPath: 'date', order: 'DESCENDING' }
      ]
    });

    // Create indexes for medical records
    await setDoc(doc(db, '_indexes', 'medical_records'), {
      fields: [
        { fieldPath: 'patientId', order: 'ASCENDING' },
        { fieldPath: 'createdAt', order: 'DESCENDING' }
      ]
    });

    // Create indexes for schedules
    await setDoc(doc(db, '_indexes', 'doctor_schedules'), {
      fields: [
        { fieldPath: 'doctorId', order: 'ASCENDING' },
        { fieldPath: 'dayOfWeek', order: 'ASCENDING' }
      ]
    });

    console.log('Firestore indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
    throw error;
  }
}

// Initialize database with required collections
export async function initializeDatabase() {
  try {
    // Create collections if they don't exist
    const collections = Object.values(COLLECTIONS);
    for (const collectionName of collections) {
      const collectionRef = collection(db, collectionName);
      await setDoc(doc(collectionRef, '_init'), { initialized: true });
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
} 