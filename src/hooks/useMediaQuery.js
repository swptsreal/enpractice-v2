import { useEffect, useState } from 'react';

/**
 * Reactive media query hook dùng matchMedia.
 * @param {string} query - CSS media query, ví dụ '(max-width: 768px)'
 * @returns {boolean}
 */
export function useMediaQuery(query) {
    const [matches, setMatches] = useState(() => {
        if (
            typeof window === 'undefined' ||
            typeof window.matchMedia !== 'function'
        ) {
            return false;
        }

        return window.matchMedia(query).matches;
    });

    useEffect(() => {
        if (
            typeof window === 'undefined' ||
            typeof window.matchMedia !== 'function'
        ) {
            return undefined;
        }

        const mediaQuery = window.matchMedia(query);
        const updateMatches = (event) => {
            setMatches(event.matches);
        };

        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', updateMatches);

            return () => {
                mediaQuery.removeEventListener('change', updateMatches);
            };
        }

        mediaQuery.addListener(updateMatches);

        return () => {
            mediaQuery.removeListener(updateMatches);
        };
    }, [query]);

    return matches;
}

const MOBILE_BREAKPOINT = '(max-width: 768px)';

/**
 * Hook dùng chung cho toàn app để xác định viewport mobile.
 * Breakpoint thống nhất: 768px (khớp với shell drawer, CSS tweak).
 * @returns {boolean}
 */
export function useIsMobile() {
    return useMediaQuery(MOBILE_BREAKPOINT);
}

export default useIsMobile;
