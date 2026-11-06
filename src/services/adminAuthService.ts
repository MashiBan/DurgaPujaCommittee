import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const AUTHORIZED_ADMIN_EMAIL = 'nonchalantlycool0@gmail.com';

const AUTH_COLLECTION = 'system_auth';
const AUTH_DOC_ID = 'admin_credentials';

/**
 * Computes a standard SHA-256 hex digest for secure password storage.
 * Runs in any modern browser via native Web Crypto API.
 */
async function hashPassword(plainText: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText.trim() + '_agamani_durga_puja_muradnagar_secure_salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface AdminCredentialsDoc {
  email: string;
  passwordHash: string;
  updatedAt: string;
  lastLoginAt?: string;
}

/**
 * Checks whether an admin password has already been established in Cloud Firestore backend.
 */
export async function getAdminPasswordRecord(): Promise<AdminCredentialsDoc | null> {
  try {
    const docRef = doc(db, AUTH_COLLECTION, AUTH_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as AdminCredentialsDoc;
    }
    return null;
  } catch (error) {
    console.warn('Could not read admin_credentials from backend:', error);
    return null;
  }
}

/**
 * Saves a new password hash to Cloud Firestore backend.
 */
export async function saveAdminPasswordToBackend(newPlainPassword: string): Promise<boolean> {
  try {
    const passwordHash = await hashPassword(newPlainPassword);
    const docRef = doc(db, AUTH_COLLECTION, AUTH_DOC_ID);
    await setDoc(docRef, {
      email: AUTHORIZED_ADMIN_EMAIL,
      passwordHash,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Failed to save admin password to backend Firestore:', error);
    throw error;
  }
}

/**
 * Verifies the entered password against the backend Firestore document.
 * If no password exists yet in the backend, this entered password is automatically
 * stored in the backend as the established admin password!
 */
export async function verifyOrInitializeAdminPassword(
  inputPassword: string
): Promise<{ success: boolean; isInitialSetup: boolean; message: string }> {
  if (!inputPassword || inputPassword.trim().length === 0) {
    return { success: false, isInitialSetup: false, message: 'Please enter a password.' };
  }

  try {
    const existingRecord = await getAdminPasswordRecord();

    // If no password exists in the backend yet, establish this password in the backend now!
    if (!existingRecord || !existingRecord.passwordHash) {
      await saveAdminPasswordToBackend(inputPassword);
      return {
        success: true,
        isInitialSetup: true,
        message: 'Admin password established and saved to Cloud Firestore backend! You are now logged in.',
      };
    }

    // Verify against existing hash
    const inputHash = await hashPassword(inputPassword);
    if (inputHash === existingRecord.passwordHash) {
      // Update last login
      const docRef = doc(db, AUTH_COLLECTION, AUTH_DOC_ID);
      await setDoc(
        docRef,
        { lastLoginAt: new Date().toISOString() },
        { merge: true }
      ).catch(() => {});

      return {
        success: true,
        isInitialSetup: false,
        message: 'Authentication successful.',
      };
    } else {
      return {
        success: false,
        isInitialSetup: false,
        message: 'Incorrect password. Click "Reset Password" below if you wish to set a new password.',
      };
    }
  } catch (error: any) {
    console.warn('Backend password verification note:', error);
    // In case of any network timeout, fallback to resetting and saving
    return {
      success: false,
      isInitialSetup: false,
      message: error?.message || 'Authentication error. Please retry or click Reset Password.',
    };
  }
}

/**
 * Resets the admin password in backend Firestore to whatever the user enters.
 */
export async function resetAdminPasswordInBackend(
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  if (!newPassword || newPassword.trim().length < 3) {
    return { success: false, message: 'Password must be at least 3 characters long.' };
  }

  try {
    await saveAdminPasswordToBackend(newPassword);
    return {
      success: true,
      message: 'Admin password successfully reset and saved in Cloud Firestore backend!',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || 'Failed to update backend password. Please check connection.',
    };
  }
}
