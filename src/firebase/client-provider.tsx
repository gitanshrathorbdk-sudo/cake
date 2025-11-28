'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

// This helper function encapsulates the full initialization logic.
function initializeFirebaseServices(): {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
} {
  // Check if all required environment variables are present.
  const isConfigComplete =
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId;

  if (!isConfigComplete) {
    console.error("Firebase configuration is incomplete. This may be expected during a build process if environment variables are not yet available, but the app will not function correctly without them.");
    return { firebaseApp: null, auth: null, firestore: null };
  }
  
  try {
    // Initialize app if it doesn't exist.
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    return { firebaseApp: app, auth, firestore };
  } catch (e) {
    console.error("Firebase initialization failed:", e);
    return { firebaseApp: null, auth: null, firestore: null };
  }
}


export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    // The initialization now only runs on the client-side, once per component mount.
    // This completely avoids running it during the server-side build.
    return initializeFirebaseServices();
  }, []); // Empty dependency array ensures this runs only once.

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
