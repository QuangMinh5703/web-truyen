import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validating config to ensure we don't crash if env vars are missing
const isFirebaseConfigured = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

let app;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
    try {
        // Avoid initializing twice in development (hot reload support)
        app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        db = getFirestore(app);
        console.log('[Firebase] Initialized successfully');
    } catch (error) {
        console.error('[Firebase] Initialization error:', error);
    }
} else {
    // Only warn in development to avoid spamming production logs if intended
    if (process.env.NODE_ENV === 'development') {
        console.warn('[Firebase] Config missing. View tracking will be disabled.');
    }
}

export { db, isFirebaseConfigured };
