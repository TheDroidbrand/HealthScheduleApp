import { collection, query, where, getDocs, updateDoc, doc, addDoc, Timestamp, getDoc, runTransaction, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FirebaseAppointment } from '@/types/firebase';
import { medicalRecordService } from './medical-record-service';
import { userService } from './user-service';
import { auth } from '@/lib/firebase';

export const appointmentService = {
  async getDoctorAppointments(doctorId: string): Promise<FirebaseAppointment[]> {
    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', doctorId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FirebaseAppointment[];
  },

  async getPatientAppointments(patientId: string): Promise<FirebaseAppointment[]> {
    const q = query(
      collection(db, 'appointments'),
      where('patientId', '==', patientId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FirebaseAppointment[];
  },

  async updateAppointment(appointmentId: string, data: Partial<FirebaseAppointment>): Promise<void> {
    await updateDoc(doc(db, "appointments", appointmentId), {
      ...data,
      updatedAt: new Date().toISOString()
    });
  },

  async completeAppointment(appointmentId: string, medicalRecordData: {
    diagnosis: string;
    prescription?: string;
    notes?: string;
  }): Promise<void> {
    try {
      // Check if user is authenticated
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('You must be logged in to complete an appointment');
      }

      console.log('Current user:', currentUser.uid);

      // Get the appointment document
      const appointmentRef = doc(db, 'appointments', appointmentId);
      const appointmentDoc = await getDoc(appointmentRef);
      
      if (!appointmentDoc.exists()) {
        throw new Error('Appointment not found');
      }

      const appointment = appointmentDoc.data() as FirebaseAppointment;
      console.log('Appointment data:', appointment);

      // Verify the current user is the doctor for this appointment
      if (appointment.doctorId !== currentUser.uid) {
        throw new Error('You are not authorized to complete this appointment');
      }

      // Create medical record first
      console.log('Creating medical record...');
      const medicalRecordRef = doc(collection(db, 'medicalRecords'));
      const recordData = {
        appointmentId: appointmentId,
        doctorId: currentUser.uid,
        patientId: appointment.patientId,
        date: appointment.date,
        diagnosis: medicalRecordData.diagnosis,
        prescription: medicalRecordData.prescription || null,
        notes: medicalRecordData.notes || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      console.log('Medical record data:', recordData);
      
      try {
        await setDoc(medicalRecordRef, recordData);
        console.log('Medical record created successfully');

        // Create doctor-patient relationship
        console.log('Creating doctor-patient relationship...');
        const doctorPatientRef = doc(collection(db, 'doctorPatients'));
        const doctorPatientData = {
          appointmentId: appointmentId,
          doctorId: currentUser.uid,
          patientId: appointment.patientId,
          addedAt: new Date().toISOString()
        };
        console.log('Doctor-patient data:', doctorPatientData);
        await setDoc(doctorPatientRef, doctorPatientData);
        console.log('Doctor-patient relationship created successfully');

        // Finally update the appointment status
        console.log('Updating appointment status...');
        await updateDoc(appointmentRef, { 
          status: 'completed',
          updatedAt: new Date().toISOString()
        });
        console.log('Appointment status updated successfully');

      } catch (error) {
        console.error('Error in operation:', error);
        // If any operation fails, try to delete the medical record if it was created
        try {
          console.log('Attempting to rollback by deleting medical record...');
          await deleteDoc(medicalRecordRef);
          console.log('Medical record deleted successfully during rollback');
        } catch (deleteError) {
          console.error('Error deleting medical record during rollback:', deleteError);
        }
        throw error;
      }

    } catch (error) {
      console.error('Error completing appointment:', error);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to complete appointment. Please try again.');
    }
  }
}; 