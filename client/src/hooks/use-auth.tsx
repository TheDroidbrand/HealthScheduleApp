import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseAuthUser
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { FirebaseUser } from '@/types/firebase';
import { userService } from '@/lib/firebase-service';
import { COLLECTIONS } from '@/lib/firebase-setup';

type RegisterUserData = Partial<FirebaseUser> & { specialty?: string };

interface AuthContextType {
  user: FirebaseUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<FirebaseUser>;
  register: (email: string, password: string, userData: RegisterUserData) => Promise<FirebaseUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseAuthUser | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userData = await userService.getCurrentUser(firebaseUser.uid);
          if (userData) {
            // Ensure we have the email from either userData or the Firebase user
            const userEmail = userData.email || firebaseUser.email || '';
            const username = userData.username || userEmail.split('@')[0];
            const fullName = userData.fullName || username;

            const updatedUser = {
              id: userData.id,
              username,
              email: userEmail,
              fullName,
              role: userData.role || 'patient',
              phone: userData.phone || null,
              createdAt: userData.createdAt,
              updatedAt: userData.updatedAt
            };

            setUser(updatedUser);
          } else {
            setUser(null);
            setLocation('/auth');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
          setLocation('/auth');
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [setLocation]);

  const login = async (email: string, password: string): Promise<FirebaseUser> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userData = await userService.getCurrentUser(userCredential.user.uid);
      
      if (!userData) {
        throw new Error('User data not found');
      }

      // Ensure we have the email from either userData or the login credentials
      const userEmail = userData.email || email;
      const username = userData.username || userEmail.split('@')[0];
      const fullName = userData.fullName || username;

      const user: FirebaseUser = {
        id: userData.id,
        username,
        email: userEmail,
        fullName,
        role: userData.role || 'patient',
        phone: userData.phone || null,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      };

      setUser(user);

      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });

      return user;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Error',
        description: 'Failed to log in. Please check your credentials.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const register = async (email: string, password: string, userData: RegisterUserData): Promise<FirebaseUser> => {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document in Firestore
      const newUser: FirebaseUser = {
        id: userCredential.user.uid,
        username: userData.username || email.split('@')[0],
        email,
        fullName: userData.fullName || email.split('@')[0],
        role: userData.role || 'patient',
        phone: userData.phone || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await userService.createUser(userCredential.user.uid, newUser);

      // If user is a doctor, create a doctor document
      if (userData.role === 'doctor') {
        const doctorData = {
          id: userCredential.user.uid,
          userId: userCredential.user.uid,
          email: email,
          username: userData.username || email.split('@')[0],
          fullName: userData.fullName || email.split('@')[0],
          specialty: userData.specialty || 'General Medicine',
          bio: null,
          education: null,
          languages: null,
          avatarUrl: null,
          rating: null,
          reviewCount: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await userService.createDoctor(userCredential.user.uid, doctorData);
      }

      // Set the user state
      setUser(newUser);

      toast({
        title: 'Success',
        description: 'Account created successfully',
      });

      return newUser;
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please use a different email.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password accounts are not enabled. Please contact support.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      toast({
        title: 'Success',
        description: 'Logged out successfully',
      });
      setLocation('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
