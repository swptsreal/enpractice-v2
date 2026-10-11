import { useState, useEffect, useCallback, useRef } from 'react';

const TIMER_STORAGE_PREFIX = 'ielts_timer_';

/**
 * Countdown timer hook with localStorage persistence
 * @param {number} timeLimitMinutes - thời gian giới hạn (phút)
 * @param {Function} onTimeout - callback khi hết giờ
 * @param {string} [storageKey] - unique key for localStorage (e.g. attemptId)
 * @returns {{ remaining, display, isWarning, pause, resume, cleanup }}
 */
export function useTimer(timeLimitMinutes, onTimeout, storageKey) {
    const fullKey = storageKey ? `${TIMER_STORAGE_PREFIX}${storageKey}` : null;

    const getInitialRemaining = () => {
        if (fullKey) {
            const saved = localStorage.getItem(fullKey);
            if (saved) {
                const { remaining: savedRemaining, savedAt } = JSON.parse(saved);
                // Trừ thời gian đã trôi qua kể từ lần save cuối
                const elapsed = Math.floor((Date.now() - savedAt) / 1000);
                const adjusted = savedRemaining - elapsed;
                return Math.max(adjusted, 0);
            }
        }
        return timeLimitMinutes * 60;
    };

    const [remaining, setRemaining] = useState(getInitialRemaining);
    const [paused, setPaused] = useState(false);
    const onTimeoutRef = useRef(onTimeout);
    onTimeoutRef.current = onTimeout;

    useEffect(() => {
        if (!fullKey || !localStorage.getItem(fullKey)) {
            setRemaining(timeLimitMinutes * 60);
        }
    }, [fullKey, timeLimitMinutes]);

    // Persist remaining to localStorage mỗi giây
    useEffect(() => {
        if (fullKey && remaining > 0) {
            localStorage.setItem(fullKey, JSON.stringify({
                remaining,
                savedAt: Date.now(),
            }));
        }
    }, [remaining, fullKey]);

    useEffect(() => {
        if (paused) return;

        const interval = setInterval(() => {
            setRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onTimeoutRef.current?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [paused]);

    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    const display = `${minutes}:${String(seconds).padStart(2, '0')}`;
    const isWarning = remaining > 0 && remaining < 300; // < 5 minutes

    const pause = useCallback(() => setPaused(true), []);
    const resume = useCallback(() => setPaused(false), []);

    // Cleanup localStorage khi submit/stop xong
    const cleanup = useCallback(() => {
        if (fullKey) localStorage.removeItem(fullKey);
    }, [fullKey]);

    return { remaining, display, isWarning, pause, resume, cleanup };
}
