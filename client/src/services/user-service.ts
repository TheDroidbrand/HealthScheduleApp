import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FirebaseUser } from '@/types/firebase';

export const userService = {
  async getDoctorPatients(doctorId: string): Promise<FirebaseUser[]> {
    // First get all appointments for this doctor
    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('doctorId', '==', doctorId)
    );
    const appointmentsSnapshot = await getDocs(appointmentsQuery);
    
    // Get unique patient IDs
    const patientIds = Array.from(new Set(appointmentsSnapshot.docs.map(doc => doc.data().patientId)));
    
    // Get patient details for each unique patient ID
    const patients: FirebaseUser[] = [];
    for (const patientId of patientIds) {
      const userQuery = query(
        collection(db, 'users'),
        where('id', '==', patientId)
      );
      const userSnapshot = await getDocs(userQuery);
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data() as FirebaseUser;
        patients.push(userData);
      }
    }
    
    return patients;
  }
}; 