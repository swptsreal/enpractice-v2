import { createContext, useContext } from "react";

const RealtimeStompContext = createContext(null);

export function useRealtimeStomp() {
    const value = useContext(RealtimeStompContext);
    if (!value) {
        throw new Error(
            "useRealtimeStomp must be used inside RealtimeStompProvider"
        );
    }
    return value;
}

export default RealtimeStompContext;
