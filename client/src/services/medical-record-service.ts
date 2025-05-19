import { collection, query, where, orderBy, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FirebaseMedicalRecord } from '@/types/firebase';

export const medicalRecordService = {
  async getDoctorRecords(doctorId: string): Promise<FirebaseMedicalRecord[]> {
    const q = query(
      collection(db, 'medicalRecords'),
      where('doctorId', '==', doctorId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FirebaseMedicalRecord[];
  },

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