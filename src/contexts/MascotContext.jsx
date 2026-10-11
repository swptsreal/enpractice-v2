import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { mascotApi } from '../api/mascotApi';
import { hasToken } from '../api';

const MascotContext = createContext(null);

export function MascotProvider({ children }) {
    const [mascotData, setMascotData] = useState(null);
    const [currentMood, setCurrentMood] = useState('idle');
    const [toast, setToast] = useState(null); // { text, mood }
    const toastTimerRef = useRef(null);

    // Fetch mascot data if authenticated
    useEffect(() => {
        if (!hasToken()) return;
        mascotApi.getMascotData()
            .then(data => {
                setMascotData(data);
                setCurrentMood(data.mood || 'idle');
            })
            .catch(err => console.warn('Mascot data fetch failed:', err));
    }, []);

    const setMood = useCallback((mood) => {
        setCurrentMood(mood);
        // Auto-revert to idle after 4 seconds
        setTimeout(() => setCurrentMood(prev => prev === mood ? 'idle' : prev), 4000);
    }, []);

    const showToast = useCallback((text, mood = 'happy') => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setToast({ text, mood });
        toastTimerRef.current = setTimeout(() => setToast(null), 3500);
    }, []);

    const triggerReaction = useCallback((type) => {
        const reactions = {
            correct: { mood: 'happy', messages: [
                "Nice! That's exactly right! 🎉",
                "Well done! Keep it up! ✨",
                "Band 7 answer! Great work!",
            ]},
            incorrect: { mood: 'sad', messages: [
                "Close! Look for paraphrasing in the passage.",
                "Almost! Check the keywords again.",
                "Don't worry — this is how we learn!",
            ]},
            celebrate: { mood: 'celebrate', messages: [
                "🎊 Test complete! Amazing effort!",
                "You finished it! Check your results!",
            ]},
            streak: { mood: 'excited', messages: [
                `🔥 You're on fire! Keep the streak alive!`,
                "Consistency is your superpower!",
            ]},
            thinking: { mood: 'thinking', messages: [] },
        };

        const reaction = reactions[type];
        if (!reaction) return;
        setMood(reaction.mood);
        if (reaction.messages.length > 0) {
            const msg = reaction.messages[Math.floor(Math.random() * reaction.messages.length)];
            showToast(msg, reaction.mood);
        }
    }, [setMood, showToast]);

    const value = {
        mascotData,
        currentMood,
        setMood,
        showToast,
        triggerReaction,
        toast,
        dismissToast: () => setToast(null),
    };

    return (
        <MascotContext.Provider value={value}>
            {children}
        </MascotContext.Provider>
    );
}

export function useMascot() {
    const ctx = useContext(MascotContext);
    if (!ctx) throw new Error('useMascot must be used within MascotProvider');
    return ctx;
}

export default MascotContext;
