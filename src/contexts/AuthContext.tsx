
"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
import type { User, Auth, UserCredential } from 'firebase/auth';
import { getFirebaseInstances } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import type { DbUser } from '@/features/authorization/types';
import { createUserProfileInDb } from '@/features/authorization/actions';

type AuthContextType = {
  user: User | null;
  userProfile: DbUser | null;
  loading: boolean;
  isAppAdmin: boolean;
  signOut: () => Promise<void>;
  signInWithEmail: (email:string, password:string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  registerWithEmail: (email:string, password:string) => Promise<UserCredential>;
  updateUserProfile: (user: User, profileData: { displayName?: string, photoURL?: string }) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  reauthenticateAndPasswordChange: (currentPassword: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- THIS IS THE CRITICAL FIX ---
// Hardcoding the admin email removes the fragile dependency on environment variables.
const ADMIN_EMAIL = 'alexispparra@gmail.com';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAppAdmin, setIsAppAdmin] = useState(false);
  const [firebaseAuth, setFirebaseAuth] = useState<Auth | null>(null);

  useEffect(() => {
    try {
      const firebase = getFirebaseInstances();
      setFirebaseAuth(firebase.auth);
      
      const authModulePromise = import('firebase/auth');
      const firestoreModulePromise = import('firebase/firestore');

      Promise.all([authModulePromise, firestoreModulePromise]).then(([{ onAuthStateChanged }, { doc, onSnapshot, updateDoc }]) => {
        const unsubscribe = onAuthStateChanged(firebase.auth, (currentUser) => {
          setUser(currentUser);
          
          if (currentUser) {
            const userDocRef = doc(firebase.db, 'users', currentUser.uid);
            const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
              if (docSnap.exists()) {
                const profile = docSnap.data() as DbUser;

                // --- ROBUST SELF-HEALING LOGIC ---
                const isAdminByEmail = profile.email === ADMIN_EMAIL;
                const isApprovedInDb = profile.status === 'approved';

                // 1. Immediate UI update: If email matches, set admin state true.
                setIsAppAdmin(isAdminByEmail);

                // 2. Background DB fix: If user is admin by email but not in DB, fix it.
                if (isAdminByEmail && !isApprovedInDb) {
                  updateDoc(userDocRef, { status: 'approved' }).catch(e => 
                    console.error("Failed to self-heal admin status:", e)
                  );
                }
                
                setUserProfile(profile);

              } else {
                 setUserProfile(null);
                 setIsAppAdmin(false);
              }
              setLoading(false);
            }, (error) => {
                console.error("Error fetching user profile:", error);
                setUserProfile(null);
                setIsAppAdmin(false);
                setLoading(false);
            });
            return () => unsubscribeProfile();
          } else {
            // User is logged out
            setUserProfile(null);
            setIsAppAdmin(false);
            setLoading(false);
          }
        });
        return () => unsubscribe();
      }).catch(err => {
          console.error("Failed to load Firebase modules", err);
          setLoading(false);
      });

    } catch (error: any) {
      console.error("CRITICAL: Firebase initialization failed.", error);
      setLoading(false);
    }
  }, []);

  const handleAuthSuccess = useCallback(async (userCredential: UserCredential) => {
    await createUserProfileInDb(userCredential.user);
    return userCredential;
  }, []);


  const authOperations = useMemo(() => {
    if (!firebaseAuth) return {
      signOut: async () => { throw new Error("Firebase no inicializado")},
      signInWithEmail: async () => { throw new Error("Firebase no inicializado")},
      signInWithGoogle: async () => { throw new Error("Firebase no inicializado")},
      registerWithEmail: async () => { throw new Error("Firebase no inicializado")},
      updateUserProfile: async () => { throw new Error("Firebase no inicializado")},
      sendPasswordReset: async () => { throw new Error("Firebase no inicializado")},
      reauthenticateAndPasswordChange: async () => { throw new Error("Firebase no inicializado")},
    };

    return {
      signOut: async () => {
        const { signOut } = await import('firebase/auth');
        return signOut(firebaseAuth);
      },
      signInWithEmail: async (email:string, password:string) => {
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
        return handleAuthSuccess(userCredential);
      },
      signInWithGoogle: async () => {
        const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(firebaseAuth, provider);
        return handleAuthSuccess(userCredential);
      },
      registerWithEmail: async (email:string, password:string) => {
          const { createUserWithEmailAndPassword } = await import('firebase/auth');
          const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
          return handleAuthSuccess(userCredential);
      },
      updateUserProfile: async (userToUpdate: User, profileData: { displayName?: string, photoURL?: string }) => {
        const { updateProfile } = await import('firebase/auth');
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = getFirebaseInstances();
        await updateProfile(userToUpdate, profileData);
        if (profileData.displayName) {
          const userDocRef = doc(db, 'users', userToUpdate.uid);
          await updateDoc(userDocRef, { displayName: profileData.displayName });
        }
      },
      sendPasswordReset: async (email: string) => {
        const { sendPasswordResetEmail } = await import("firebase/auth");
        return sendPasswordResetEmail(firebaseAuth, email);
      },
      reauthenticateAndPasswordChange: async (currentPassword: string, newPassword: string) => {
          if (!firebaseAuth.currentUser || !firebaseAuth.currentUser.email) {
              throw new Error("Usuario no autenticado o sin email.");
          }
          const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = await import("firebase/auth");
          const credential = EmailAuthProvider.credential(firebaseAuth.currentUser.email, currentPassword);
          await reauthenticateWithCredential(firebaseAuth.currentUser, credential);
          return updatePassword(firebaseAuth.currentUser, newPassword);
      }
    };
  }, [firebaseAuth, handleAuthSuccess]);
  
  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    isAppAdmin,
    ...authOperations
  };

  if (loading && !user && !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-svh bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
