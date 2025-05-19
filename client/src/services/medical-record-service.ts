import { collection, query, where, orderBy, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FirebaseMedicalRecord } from '@/types/firebase';

export const medicalRecordService = {
  async getDoctorRecords(doctorId: string): Promise<FirebaseMedicalRecord[]> {
    console.log('Fetching medical records for doctor:', doctorId);
    if (!doctorId) {
      console.warn('No doctor ID provided');
      return [];
    }

    try {
      const q = query(
        collection(db, 'medicalRecords'),
        where('doctorId', '==', doctorId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const records = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt || new Date().toISOString(),
        updatedAt: doc.data().updatedAt || new Date().toISOString()
      })) as FirebaseMedicalRecord[];
      
      console.log('Found medical records:', records);
      return records;
    } catch (error) {
      console.error('Error fetching medical records:', error);
      throw error;
    }
  },

  async getPatientRecords(patientId: string): Promise<FirebaseMedicalRecord[]> {
    if (!patientId) {
      console.warn('No patient ID provided');
      return [];
    }

    try {
      const q = query(
        collection(db, 'medicalRecords'),
        where('patientId', '==', patientId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt || new Date().toISOString(),
        updatedAt: doc.data().updatedAt || new Date().toISOString()
      })) as FirebaseMedicalRecord[];
    } catch (error) {
      console.error('Error fetching patient records:', error);
      throw error;
    }
  },

  async createMedicalRecord(record: Omit<FirebaseMedicalRecord, 'id'>): Promise<FirebaseMedicalRecord> {
    console.log('Creating medical record:', record);
    if (!record.doctorId || !record.patientId) {
      throw new Error('Doctor ID and Patient ID are required');
    }

    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, 'medicalRecords'), {
        ...record,
        createdAt: now.toDate().toISOString(),
        updatedAt: now.toDate().toISOString()
      });
      const newRecord = { id: docRef.id, ...record };
      console.log('Created medical record:', newRecord);
      return newRecord;
    } catch (error) {
      console.error('Error creating medical record:', error);
      throw error;
    }
  }
}; 