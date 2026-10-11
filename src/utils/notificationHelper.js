/**
 * Push Notification Helper
 * Xin quyền notification, lấy FCM token, lắng nghe foreground messages
 */
import { getToken, onMessage } from 'firebase/messaging';
import { getFirebaseMessaging } from '../firebase';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

/**
 * Xin quyền notification và lấy FCM token
 * @returns {Promise<string|null>} FCM token hoặc null nếu user từ chối / browser không hỗ trợ
 */
export async function requestNotificationPermission() {
    try {
        // Kiểm tra browser có hỗ trợ Notification API không
        if (!('Notification' in window)) {
            console.warn('[Notification] Browser không hỗ trợ Notification API');
            return null;
        }

        // Xin quyền
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.warn('[Notification] User từ chối quyền notification');
            return null;
        }

        // Lấy Firebase Messaging instance
        const messaging = await getFirebaseMessaging();
        if (!messaging) {
            console.warn('[Notification] Firebase Messaging không được hỗ trợ trên browser này');
            return null;
        }

        // Đăng ký service worker
        const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('[Notification] Service Worker đã đăng ký:', swRegistration);

        // Lấy FCM token
        const fcmToken = await getToken(messaging, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: swRegistration,
        });

        if (fcmToken) {
            console.log('[Notification] FCM Token:', fcmToken);
            return fcmToken;
        } else {
            console.warn('[Notification] Không lấy được FCM token');
            return null;
        }
    } catch (error) {
        console.error('[Notification] Lỗi khi xin quyền notification:', error);
        return null;
    }
}

/**
 * Lắng nghe foreground messages (khi app đang mở)
 * @param {function} callback — gọi khi nhận được message
 * @returns {function|null} unsubscribe function
 */
export async function onForegroundMessage(callback) {
    try {
        const messaging = await getFirebaseMessaging();
        if (!messaging) return null;

        return onMessage(messaging, (payload) => {
            console.log('[Notification] Foreground message:', payload);
            callback(payload);
        });
    } catch (error) {
        console.error('[Notification] Lỗi khi lắng nghe foreground message:', error);
        return null;
    }
}
