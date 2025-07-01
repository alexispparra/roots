'use server';

import { getFirebaseInstances } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import type { DbUser } from './types';

const ADMIN_EMAIL = 'alexispparra@gmail.com';

type UserData = {
  uid: string;
  email: string | null;
  displayName: string | null;
}

/**
 * Ensures a user profile document exists in Firestore.
 * Can be called safely from client components as it only accepts serializable data.
 * If the profile doesn't exist, it's created.
 * If it exists, it only syncs the displayName if it has been updated in the auth provider.
 * @param userData A plain object containing the user's serializable data.
 */
export async function createUserProfileInDb(userData: UserData): Promise<void> {
  const { db } = getFirebaseInstances();
  const userRef = doc(db, 'users', userData.uid);

  try {
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      // --- Profile does not exist, create it from scratch ---
      const userEmail = (userData.email || "").trim().toLowerCase();
      
      const newUserProfile: DbUser = {
        uid: userData.uid,
        email: userEmail,
        displayName: userData.displayName || userEmail.split('@')[0] || "Usuario",
        status: userEmail === ADMIN_EMAIL ? 'approved' : 'pending',
      };
      await setDoc(userRef, newUserProfile);
    } else {
      // --- Profile exists, just sync displayName if it has been updated in the auth provider ---
      const existingData = docSnap.data() as Partial<DbUser>;
      if (userData.displayName && userData.displayName !== existingData.displayName) {
        await updateDoc(userRef, { displayName: userData.displayName });
      }
    }
  } catch (error) {
    console.error('Error ensuring user profile in Firestore:', error);
    // We don't re-throw the error to avoid breaking the login/register flow.
  }
}
