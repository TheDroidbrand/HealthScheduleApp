import { collection, query, where, orderBy, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FirebaseLabResult } from '@/types/firebase';

export const labResultService = {
  async getMedicalRecordLabResults(medicalRecordId: string): Promise<FirebaseLabResult[]> {
    console.log('Fetching lab results for medical record:', medicalRecordId);
    if (!medicalRecordId) {
      console.warn('No medical record ID provided');
      return [];
    }

    try {
      const q = query(
        collection(db, 'labResults'),
        where('medicalRecordId', '==', medicalRecordId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt || new Date().toISOString(),
        updatedAt: doc.data().updatedAt || new Date().toISOString()
      })) as FirebaseLabResult[];
      
      console.log('Found lab results:', results);
      return results;
    } catch (error) {
      console.error('Error fetching lab results:', error);
      throw error;
    }
  },

  async createLabResult(result: Omit<FirebaseLabResult, 'id'>): Promise<FirebaseLabResult> {
    console.log('Creating lab result:', result);
    if (!result.medicalRecordId) {
      throw new Error('Medical Record ID is required');
    }

    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, 'labResults'), {
        ...result,
        createdAt: now.toDate().toISOString(),
        updatedAt: now.toDate().toISOString()
      });
      const newResult = { id: docRef.id, ...result };
      console.log('Created lab result:', newResult);
      return newResult;
    } catch (error) {
      console.error('Error creating lab result:', error);
      throw error;
    }
  }
}; 