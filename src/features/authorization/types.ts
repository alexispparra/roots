/**
 * Represents the approval status of a user.
 * - 'pending': The user has registered but is awaiting admin approval.
 * - 'approved': The user is fully approved and can access the application.
 * - 'rejected': The user's access has been denied by an admin.
 */
export type UserStatus = 'pending' | 'approved' | 'rejected';

/**
 * Represents the user's profile data as stored in the Firestore 'users' collection.
 */
export type DbUser = {
  uid: string;
  email: string;
  displayName: string;
  status: UserStatus;
};
