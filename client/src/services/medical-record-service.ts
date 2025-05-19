import { collection, query, where, orderBy, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FirebaseMedicalRecord } from '@/types/firebase';

export const medicalRecordService = {
  async getPatientRecords(patientId: string): Promise<FirebaseMedicalRecord[]> {
    try {
      console.log('Fetching medical records for patient:', patientId);
      
      if (!patientId) {
        console.error('No patient ID provided');
        return [];
      }

      const recordsQuery = query(
        collection(db, "medicalRecords"),
        where("patientId", "==", patientId),
        orderBy("createdAt", "desc")
      );

      console.log('Executing Firestore query...');
      const recordsSnapshot = await getDocs(recordsQuery);
      console.log('Query returned', recordsSnapshot.size, 'records');

      const records = recordsSnapshot.docs.map((doc) => {
        const data = doc.data();
        console.log('Record data:', data);
        return {
          id: doc.id,
          ...data,
          date: data.date || data.createdAt, // Ensure we have a date field
          prescription: data.prescription || '', // Ensure we have a prescription field
        } as FirebaseMedicalRecord;
      });

      console.log('Processed records:', records);
      return records;
    } catch (error) {
      console.error('Error fetching patient medical records:', error);
      throw error;
    }
  },

  async getDoctorMedicalRecords(doctorId: string): Promise<FirebaseMedicalRecord[]> {
    try {
      console.log('Fetching medical records for doctor:', doctorId);
      
      if (!doctorId) {
        console.error('No doctor ID provided');
        return [];
      }

      const recordsQuery = query(
        collection(db, "medicalRecords"),
        where("doctorId", "==", doctorId),
        orderBy("createdAt", "desc")
      );

      console.log('Executing Firestore query...');
      const recordsSnapshot = await getDocs(recordsQuery);
      console.log('Query returned', recordsSnapshot.size, 'records');

      const records = recordsSnapshot.docs.map((doc) => {
        const data = doc.data();
        console.log('Record data:', data);
        return {
          id: doc.id,
          ...data,
          date: data.date || data.createdAt, // Ensure we have a date field
          prescription: data.prescription || '', // Ensure we have a prescription field
        } as FirebaseMedicalRecord;
      });

      console.log('Processed records:', records);
      return records;
    } catch (error) {
      console.error('Error fetching doctor medical records:', error);
      throw error;
    }
  },

  async createMedicalRecord(record: Omit<FirebaseMedicalRecord, 'id'>): Promise<FirebaseMedicalRecord> {
    try {
      console.log('Creating medical record:', record);
      
      if (!record.doctorId || !record.patientId) {
        throw new Error('Doctor ID and Patient ID are required');
      }

      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, 'medicalRecords'), {
        ...record,
        date: record.date || now.toDate().toISOString(),
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