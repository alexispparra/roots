'use server';

import { getFirebaseInstances } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import type { DbUser } from './types';

/**
 * Ensures a user profile document exists in Firestore.
 * - If the profile doesn't exist, it's created with a 'status' ('approved' for admin, 'pending' for others).
 * - If it exists, it only syncs the displayName if it has changed (e.g., after a Google sign-in).
 * This function is designed to be called after a successful authentication event.
 * @param user The Firebase Auth user object.
 */
export async function createUserProfileInDb(user: User): Promise<void> {
  const { db } = getFirebaseInstances();
  const userRef = doc(db, 'users', user.uid);

  try {
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      // --- Profile does not exist, create it from scratch ---
      const userEmail = (user.email || "").trim().toLowerCase();
      const adminEmail = (process.env.NEXT_PUBLIC_APP_ADMIN_EMAIL || "").trim().toLowerCase();
      
      const newUserProfile: DbUser = {
        uid: user.uid,
        email: userEmail,
        displayName: user.displayName || userEmail.split('@')[0],
        status: adminEmail && userEmail === adminEmail ? 'approved' : 'pending',
      };
      await setDoc(userRef, newUserProfile);
    } else {
      // --- Profile exists, just sync displayName if it has been updated in the auth provider ---
      const existingData = docSnap.data() as Partial<DbUser>;
      if (user.displayName && user.displayName !== existingData.displayName) {
        await updateDoc(userRef, { displayName: user.displayName });
      }
    }
  } catch (error) {
    console.error('Error ensuring user profile in Firestore:', error);
    // We don't re-throw the error to avoid breaking the login/register flow.
    // Error logging is sufficient here.
  }
}
