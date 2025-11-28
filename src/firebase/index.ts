'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (getApps().length > 0) {
    return getSdks(getApp());
  }

  // The Vercel build process might not have access to environment variables
  // in the same way as the runtime. This try-catch block prevents the build
  // from crashing if the Firebase config is incomplete.
  try {
    const app = initializeApp(firebaseConfig);
    return getSdks(app);
  } catch (e) {
    console.error("Firebase initialization failed. This may be expected during a build process if environment variables are not yet available.", e);
    // Return a dummy object or null to allow the build to continue.
    // The app will not function correctly without Firebase, but it will build.
    return {
      firebaseApp: null,
      auth: null,
      firestore: null
    };
  }
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';