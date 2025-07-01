
'use server';

import { getFirebaseInstances } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import type { DbUser } from './types';

const ADMIN_EMAIL = 'alexispparra@gmail.com';

/**
 * Ensures a user profile document exists in Firestore upon registration or first Google sign-in.
 * - If the profile doesn't exist, it's created with a 'status'.
 * - If it exists, it only syncs the displayName if it has changed.
 * The logic to self-heal an existing admin profile now lives in AuthContext.
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
      
      const newUserProfile: DbUser = {
        uid: user.uid,
        email: userEmail,
        displayName: user.displayName || userEmail.split('@')[0],
        status: userEmail === ADMIN_EMAIL ? 'approved' : 'pending',
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
  }
}
