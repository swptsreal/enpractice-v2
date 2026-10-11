import { useEffect, useState } from 'react';

/**
 * Reactive window size hook (cập nhật khi resize / xoay thiết bị).
 * @returns {{ width: number, height: number }}
 */
export function useWindowSize() {
    const [size, setSize] = useState(() => ({
        width: typeof window !== 'undefined' ? window.innerWidth : 1440,
        height: typeof window !== 'undefined' ? window.innerHeight : 900,
    }));

    useEffect(() => {
        if (typeof window === 'undefined') {
            return undefined;
        }

        const updateSize = () => {
            setSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    return size;
}

export default useWindowSize;
