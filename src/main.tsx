import {createRoot} from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import legacyFirebaseConfig from '../firebase-applet-config.json';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('App root element was not found.');
}

const root = createRoot(rootElement);
const getFirebaseConfigValue = (key: string, fallback = '') => {
  const value = import.meta.env[key];
  return value && value !== 'MY_' ? value : fallback;
};
const requiredFirebaseConfig = {
  apiKey: getFirebaseConfigValue('VITE_FIREBASE_API_KEY', legacyFirebaseConfig.apiKey),
  authDomain: getFirebaseConfigValue('VITE_FIREBASE_AUTH_DOMAIN', legacyFirebaseConfig.authDomain),
  projectId: getFirebaseConfigValue('VITE_FIREBASE_PROJECT_ID', legacyFirebaseConfig.projectId),
  appId: getFirebaseConfigValue('VITE_FIREBASE_APP_ID', legacyFirebaseConfig.appId),
};
const missingFirebaseConfig = Object.entries(requiredFirebaseConfig)
  .filter(([, value]) => !value || value.startsWith('MY_'))
  .map(([key]) => key);

const renderStartupError = (message: string) => {
  root.render(
    <main className="flex min-h-screen items-center justify-center bg-[#FBF9F5] p-6 text-[#1C1917]">
      <section
        role="alert"
        className="w-full max-w-xl rounded-2xl border border-[#E7E2D6] bg-white p-6 shadow-lg sm:p-8"
      >
        <h1 className="font-serif text-2xl font-bold text-[#8B0000]">
          Agamani could not start
        </h1>
        <p className="mt-3 text-sm leading-6 text-stone-700">{message}</p>
        <p className="mt-4 text-sm leading-6 text-stone-700">
          Configure the Firebase values in <code>.env.local</code> for local development,
          or add them as environment variables in the hosting dashboard and redeploy.
        </p>
        {missingFirebaseConfig.length > 0 && (
          <p className="mt-3 break-words font-mono text-xs text-stone-600">
            Missing: {missingFirebaseConfig.map((key) => `VITE_FIREBASE_${key.replace(/[A-Z]/g, (letter) => `_${letter}`).toUpperCase()}`).join(', ')}
          </p>
        )}
      </section>
    </main>
  );
};

if (missingFirebaseConfig.length > 0) {
  renderStartupError('Firebase is not configured, so authentication and site data cannot load.');
} else {
  void import('./App.tsx')
    .then(({ default: App }) => {
      root.render(
        <>
          <App />
          <Analytics />
        </>
      );
    })
    .catch((error: unknown) => {
      console.error('Application startup failed:', error);
      renderStartupError(
        error instanceof Error ? error.message : 'An unexpected startup error occurred.'
      );
    });
}
