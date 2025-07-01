
"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
import type { User, Auth, UserCredential } from 'firebase/auth';
import { getFirebaseInstances, APP_ADMIN_EMAIL } from '@/lib/firebase';
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
            // --- NEW LOGIC: IMMEDIATE ADMIN RECOGNITION ---
            // The UI should not wait for the database. If the email matches, they are an admin.
            const isAdminByEmail = currentUser.email === APP_ADMIN_EMAIL;
            setIsAppAdmin(isAdminByEmail);

            const userDocRef = doc(firebase.db, 'users', currentUser.uid);
            const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
              if (docSnap.exists()) {
                const profile = docSnap.data() as DbUser;

                // --- BACKGROUND SELF-HEALING ---
                // If the user is an admin (by email) but their DB status is not 'approved', fix it.
                // This does not block the UI, which already knows they are an admin.
                if (isAdminByEmail && profile.status !== 'approved') {
                  updateDoc(userDocRef, { status: 'approved' }).catch(e => 
                    console.error("Failed to self-heal admin status in DB:", e)
                  );
                }
                
                setUserProfile(profile);

              } else {
                 // Profile doesn't exist, likely a new login. Let's create it as a backup.
                 // This is also handled by the login/register flows, but serves as a safety net.
                 const userData = {
                   uid: currentUser.uid,
                   email: currentUser.email,
                   displayName: currentUser.displayName
                 };
                 createUserProfileInDb(userData);
                 setUserProfile(null); // Will be populated by the next snapshot after creation
              }
              setLoading(false);
            }, (error) => {
                console.error("Error fetching user profile:", error);
                setUserProfile(null);
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
        return signInWithEmailAndPassword(firebaseAuth, email, password);
      },
      signInWithGoogle: async () => {
        const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(firebaseAuth, provider);
        // The onAuthStateChanged listener handles profile creation now.
        return userCredential;
      },
      registerWithEmail: async (email:string, password:string) => {
          const { createUserWithEmailAndPassword } = await import('firebase/auth');
          // Profile creation is now handled explicitly on the register page.
          return createUserWithEmailAndPassword(firebaseAuth, email, password);
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
  }, [firebaseAuth]);
  
  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    isAppAdmin,
    ...authOperations
  };

  if (loading) {
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
