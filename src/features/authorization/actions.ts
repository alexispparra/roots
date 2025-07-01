'use server';

import { getFirebaseInstances } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import type { DbUser } from './types';

/**
 * Creates a user profile document in Firestore if it doesn't already exist.
 * The admin email gets 'approved' status by default, others get 'pending'.
 * @param user The Firebase Auth user object.
 */
export async function createUserProfileInDb(user: User): Promise<void> {
  const { db } = getFirebaseInstances();
  const userRef = doc(db, 'users', user.uid);

  try {
    const docSnap = await getDoc(userRef);
    // Only create the profile if it doesn't exist.
    // This prevents overwriting the status of an existing user who signs in with a new method.
    if (!docSnap.exists()) {
      const adminEmail = (process.env.NEXT_PUBLIC_APP_ADMIN_EMAIL || "").trim().toLowerCase();
      const userEmail = (user.email || "").trim().toLowerCase();

      const newUserProfile: DbUser = {
        uid: user.uid,
        email: userEmail,
        displayName: user.displayName || userEmail.split('@')[0],
        status: adminEmail && userEmail === adminEmail ? 'approved' : 'pending',
      };

      await setDoc(userRef, newUserProfile);
    }
  } catch (error) {
    console.error('Error creating user profile in Firestore:', error);
    // We don't re-throw the error to avoid breaking the login/register flow.
    // Error logging is sufficient here.
  }
}
