import { useState } from 'react';
import { useNotificationCenter } from '../features/notification/useNotificationCenter';

export function useNotificationBell() {
    const notificationCenter = useNotificationCenter();
    const [open, setOpen] = useState(false);

    return {
        ...notificationCenter,
        open: notificationCenter.isAuthenticated ? open : false,
        setOpen: (nextOpen) => {
            setOpen(notificationCenter.isAuthenticated ? nextOpen : false);
        },
    };
}

export default useNotificationBell;
