'use server';

import { getFirebaseInstances } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import type { DbUser } from './types';

/**
 * Creates or updates a user profile document in Firestore.
 * - If the profile doesn't exist, it's created with a 'status' ('approved' for admin, 'pending' for others).
 * - If the profile exists, it checks if the 'status' field is missing and adds it.
 * - It also updates the displayName if it has changed in the auth provider (e.g., Google).
 * @param user The Firebase Auth user object.
 */
export async function createUserProfileInDb(user: User): Promise<void> {
  const { db } = getFirebaseInstances();
  const userRef = doc(db, 'users', user.uid);

  try {
    const docSnap = await getDoc(userRef);
    const userEmail = (user.email || "").trim().toLowerCase();

    if (!docSnap.exists()) {
      // Profile does not exist, create it from scratch
      const adminEmail = (process.env.NEXT_PUBLIC_APP_ADMIN_EMAIL || "").trim().toLowerCase();
      
      const newUserProfile: DbUser = {
        uid: user.uid,
        email: userEmail,
        displayName: user.displayName || userEmail.split('@')[0],
        status: adminEmail && userEmail === adminEmail ? 'approved' : 'pending',
      };
      await setDoc(userRef, newUserProfile);
    } else {
      // Profile exists, check for missing fields or updates.
      const existingData = docSnap.data() as Partial<DbUser>;
      const updates: Partial<DbUser> = {};

      // If status is missing, add it. This is the fix for the admin account.
      if (!existingData.status) {
        const adminEmail = (process.env.NEXT_PUBLIC_APP_ADMIN_EMAIL || "").trim().toLowerCase();
        updates.status = adminEmail && userEmail === adminEmail ? 'approved' : 'pending';
      }

      // If displayName has been updated in the auth provider, sync it.
      if (user.displayName && user.displayName !== existingData.displayName) {
        updates.displayName = user.displayName;
      }
      
      // Only write to the database if there are actual updates to perform.
      if (Object.keys(updates).length > 0) {
        await updateDoc(userRef, updates);
      }
    }
  } catch (error) {
    console.error('Error creating/updating user profile in Firestore:', error);
    // We don't re-throw the error to avoid breaking the login/register flow.
    // Error logging is sufficient here.
  }
}
