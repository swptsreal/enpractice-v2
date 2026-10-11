/**
 * Firebase Configuration
 * Khởi tạo Firebase app và Cloud Messaging
 */
import { initializeApp } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Messaging (lazy — chỉ init khi browser hỗ trợ)
let messaging = null;

export async function getFirebaseMessaging() {
    if (messaging) return messaging;
    const supported = await isSupported();
    if (supported) {
        messaging = getMessaging(app);
    }
    return messaging;
}

export default app;
