import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import legacyFirebaseConfig from '../firebase-applet-config.json';

const getFirebaseEnv = (key: string, fallback = '') => {
  const value = import.meta.env[key];
  return value && value !== 'MY_' ? value : fallback;
};

const firebaseConfig = {
  apiKey: getFirebaseEnv('VITE_FIREBASE_API_KEY', legacyFirebaseConfig.apiKey),
  authDomain: getFirebaseEnv('VITE_FIREBASE_AUTH_DOMAIN', legacyFirebaseConfig.authDomain),
  projectId: getFirebaseEnv('VITE_FIREBASE_PROJECT_ID', legacyFirebaseConfig.projectId),
  storageBucket: getFirebaseEnv('VITE_FIREBASE_STORAGE_BUCKET', legacyFirebaseConfig.storageBucket),
  messagingSenderId: getFirebaseEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', legacyFirebaseConfig.messagingSenderId),
  appId: getFirebaseEnv('VITE_FIREBASE_APP_ID', legacyFirebaseConfig.appId),
  measurementId: getFirebaseEnv('VITE_FIREBASE_MEASUREMENT_ID', legacyFirebaseConfig.measurementId),
  oAuthClientId: getFirebaseEnv('VITE_FIREBASE_OAUTH_CLIENT_ID', legacyFirebaseConfig.oAuthClientId),
  recaptchaSiteKey: getFirebaseEnv('VITE_FIREBASE_RECAPTCHA_SITE_KEY', legacyFirebaseConfig.recaptchaSiteKey),
};

const firestoreDatabaseId = getFirebaseEnv('VITE_FIREBASE_DATABASE_ID', legacyFirebaseConfig.firestoreDatabaseId || '(default)');

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on initialization
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();
