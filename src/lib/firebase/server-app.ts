import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import 'server-only';

// Check for static mode from environment variables
const isStaticMode = process.env.NEXT_PUBLIC_STATIC_MODE === 'true';

let adminAuth: ReturnType<typeof getAuth> | null = null;
let adminDb: ReturnType<typeof getFirestore> | null = null;

if (!isStaticMode) {
    const serviceAccountStr = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || '', 'base64').toString('utf-8');

    // Prevent initialization error during build on static platforms if env var is missing
    if (serviceAccountStr && serviceAccountStr !== '{}') {
        try {
            const serviceAccount = JSON.parse(serviceAccountStr);

            const app = !getApps().length
                ? initializeApp({
                    credential: cert(serviceAccount),
                })
                : getApp();

            adminAuth = getAuth(app);
            adminDb = getFirestore(app);
        } catch (e) {
            console.error("Firebase Admin SDK initialization failed:", e);
        }
    } else {
        console.warn("FIREBASE_SERVICE_ACCOUNT_BASE64 is not set. Firebase Admin features will be disabled.");
    }
}


export const auth = adminAuth;
export const db = adminDb;

export const verifyIdToken = (idToken: string) => {
    if (isStaticMode || !adminAuth) {
        console.warn("Static mode is on or Firebase Admin not initialized. Skipping token verification.");
        // In static mode, we can't verify tokens on the server.
        // We might decode it on the client for basic info, but for security, server verification is needed.
        // For now, we return a mock decoded token.
        return Promise.resolve({ uid: 'static-user', email: 'static@example.com' });
    }
    return adminAuth.verifyIdToken(idToken);
}

export const isAdmin = (email?: string | null) => {
    // In static mode, admin features are disabled.
    if (isStaticMode) return false;

    // In development mode, bypass admin check if the env var is set
    if (process.env.DEV_MODE_NO_ADMIN_ENFORCE === 'true') {
        return true;
    }

    if (!email) return false;
    const adminEmails = (process.env.FIREBASE_ADMIN_EMAILS || '').split(',');
    return adminEmails.includes(email);
}
