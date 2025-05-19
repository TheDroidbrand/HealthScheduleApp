import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: "AIzaSyC6KrAwJ6yajRWK2qWRCFzjVnPWwnLfXkk",
  authDomain: "healthschedulerpro.firebaseapp.com",
  projectId: "healthschedulerpro",
  storageBucket: "healthschedulerpro.firebasestorage.app",
  messagingSenderId: "780251711199",
  appId: "1:780251711199:web:ba2285a7db2f79ee6a4b6a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app; 