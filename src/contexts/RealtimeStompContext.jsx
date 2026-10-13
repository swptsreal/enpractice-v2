import { Client } from "@stomp/stompjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ensureValidAccessToken } from "../api";
import { guestSessionApi } from "../api/guestSessionApi";
import {
    GUEST_ERROR_CODES,
    GUEST_TRIAL_STATUSES,
    REALTIME_MODES,
} from "../features/guest-ai-trial/guestAiTrialConstants";
import { createGuestSessionManager } from "../features/guest-ai-trial/guestAiTrialSession";
import {
    getGuestErrorAction,
    getGuestRetryDelay,
    getRealtimeAuthAction,
    parseGuestErrorCode,
} from "../features/guest-ai-trial/guestAiTrialState";
import { createRealtimeStompSubscriptions } from "../features/realtime/realtimeStompSubscriptions";
import { createRealtimeTransportController } from "../features/realtime/realtimeTransportController";
import { resolveWsUrl } from "../lib/wsUrl";
import { useAuth } from "./AuthContext";
import RealtimeStompContext from "./RealtimeStompContextCore";

const INITIAL_SNAPSHOT = {
    mode: REALTIME_MODES.IDLE,
    isConnected: false,
    guestSession: null,
    connectionVersion: 0,
};

function getRealtimeStompUrl() {
    /* `VITE_API_URL` là đường dẫn tương đối (`/api`) khi dev server làm proxy — chính là cấu
       hình mặc định. Khi đó phải lấy scheme + host từ chính trang, để trang https thành
       `wss:` và đi qua proxy `/ws` thay vì gọi thẳng cổng 8082: một socket `ws://` từ trang
       https bị browser chặn vì mixed content TRƯỚC khi gửi frame nào, và đó chính là lý do
       `/ai-chat`, speaking, custom-speaking không có phản hồi (broker log: 0 session).
       Quy tắc này nằm trong `lib/wsUrl.js` để socket speech dùng chung, không lặp lại lần 3. */
    return resolveWsUrl("/ws/realtime-chat");
}

export function RealtimeStompProvider({ children }) {
    const { isAuthenticated, loading } = useAuth();
    const [snapshot, setSnapshot] = useState(INITIAL_SNAPSHOT);
    const [guestTrialStatus, setGuestTrialStatus] = useState(
        GUEST_TRIAL_STATUSES.IDLE,
    );
    const guestRetryRef = useRef({ attempt: 0, retryAt: 0 });
    const guestRenewPromiseRef = useRef(null);
    const [guestManager] = useState(() =>
        createGuestSessionManager({
            createSession: guestSessionApi.createSession,
        }),
    );
    const [subscriptions] = useState(createRealtimeStompSubscriptions);

    /**
     * THE CLIENT AND ITS CONTROLLER ARE CREATED TOGETHER, IN ONE INITIALIZER, AND THAT IS
     * LOAD-BEARING.
     *
     * They used to be two separate lazy `useState` initializers, which React StrictMode invokes
     * TWICE. The second invocation of `new Client(...)` produced a discarded client, but the second
     * `createRealtimeTransportController({ client })` received the FIRST client and re-assigned its
     * `beforeConnect` / `onConnect` / `onDisconnect` callbacks. So the live controller drove
     * `client.activate()` while the callbacks belonged to a discarded controller with its own
     * `targetMode` — which read `idle`, threw "Realtime target mode is idle", and left the promise
     * `connect()` returned UNSETTLED (its `pendingConnection` had already been nulled, so
     * `rejectPending` was a no-op).
     *
     * The symptom was exactly what was reported and had NO error anywhere: no WebSocket was ever
     * constructed (`page.on('websocket')` saw only Vite's HMR socket) and the screen sat on
     * "Đang kết nối tới máy chủ AI…" forever. Traced by tagging each controller with an id — the
     * `activating` log came from one instance and the `beforeConnect` log from another.
     *
     * Creating both here means a discarded second pass produces a SELF-CONSISTENT discarded pair
     * (its own client AND its own controller), so it cannot reach into the live one.
     */
    const [realtime] = useState(() => {
        const client = new Client({
            brokerURL: getRealtimeStompUrl(),
            reconnectDelay: 5000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
        });
        const controller = createRealtimeTransportController({
            client,
            subscriptions,
            getAuthToken: ensureValidAccessToken,
            getGuestSession: (options) => guestManager.getOrCreate(options),
            onSnapshot: setSnapshot,
        });
        return { client, controller };
    });
    const { controller } = realtime;

    const markGuestUnavailable = useCallback(() => {
        const attempt = guestRetryRef.current.attempt;
        guestRetryRef.current = {
            attempt: attempt + 1,
            retryAt: Date.now() + getGuestRetryDelay(attempt),
        };
        setGuestTrialStatus(GUEST_TRIAL_STATUSES.UNAVAILABLE);
    }, []);

    const handleGuestError = useCallback(
        async (value) => {
            const errorCode = parseGuestErrorCode(value);
            const action = getGuestErrorAction(errorCode);

            if (action === "disable") {
                setGuestTrialStatus(GUEST_TRIAL_STATUSES.DISABLED);
                await controller.deactivate();
                return false;
            }
            if (action === "renew") {
                if (!guestRenewPromiseRef.current) {
                    guestManager.clear();
                    guestRenewPromiseRef.current = controller
                        .renewGuestConnection()
                        .finally(() => {
                            guestRenewPromiseRef.current = null;
                        });
                }
                try {
                    await guestRenewPromiseRef.current;
                    guestRetryRef.current = { attempt: 0, retryAt: 0 };
                    setGuestTrialStatus(GUEST_TRIAL_STATUSES.AVAILABLE);
                    return true;
                } catch {
                    markGuestUnavailable();
                    return false;
                }
            }
            if (action === "backoff") {
                markGuestUnavailable();
            }
            return false;
        },
        [controller, guestManager, markGuestUnavailable],
    );

    useEffect(() => {
        controller.setErrorHandler(handleGuestError);
        return () => controller.setErrorHandler();
    }, [controller, handleGuestError]);

    const ensureConnected = useCallback(async () => {
        if (isAuthenticated) {
            return controller.connectAuthenticated();
        }
        if (guestTrialStatus === GUEST_TRIAL_STATUSES.DISABLED) {
            const error = new Error("Guest AI trial is disabled");
            error.code = GUEST_ERROR_CODES.TRIAL_DISABLED;
            throw error;
        }
        if (guestRetryRef.current.retryAt > Date.now()) {
            const error = new Error("Guest AI trial retry is delayed");
            error.code = GUEST_ERROR_CODES.TRIAL_UNAVAILABLE;
            throw error;
        }

        try {
            const nextSnapshot = await controller.ensureGuestConnected();
            guestRetryRef.current = { attempt: 0, retryAt: 0 };
            setGuestTrialStatus(GUEST_TRIAL_STATUSES.AVAILABLE);
            return nextSnapshot;
        } catch (error) {
            await handleGuestError(error);
            throw error;
        }
    }, [controller, guestTrialStatus, handleGuestError, isAuthenticated]);

    useEffect(() => {
        const action = getRealtimeAuthAction({ loading, isAuthenticated });
        if (action === "wait") return undefined;
        let cancelled = false;

        const syncMode = async () => {
            if (action === "connect-authenticated") {
                await controller.connectAuthenticated();
                return;
            }
            await controller.deactivate();
            if (!cancelled) {
                setGuestTrialStatus(GUEST_TRIAL_STATUSES.IDLE);
            }
        };

        syncMode().catch((error) => {
            if (!cancelled && action === "connect-authenticated") {
                console.error(
                    "Failed to connect authenticated realtime",
                    error,
                );
            }
        });
        return () => {
            cancelled = true;
        };
    }, [controller, isAuthenticated, loading]);

    useEffect(
        () => () => {
            controller.deactivate();
        },
        [controller],
    );

    const subscribe = useCallback(
        (destination, handler) => subscriptions.subscribe(destination, handler),
        [subscriptions],
    );

    const value = useMemo(
        () => ({
            mode: snapshot.mode,
            guestSession: snapshot.guestSession,
            isConnected: snapshot.isConnected,
            connectionVersion: snapshot.connectionVersion,
            guestTrialStatus,
            subscribe,
            publish: controller.publish,
            ensureConnected,
            handleGuestError,
        }),
        [
            controller.publish,
            ensureConnected,
            guestTrialStatus,
            handleGuestError,
            snapshot,
            subscribe,
        ],
    );

    return (
        <RealtimeStompContext.Provider value={value}>
            {children}
        </RealtimeStompContext.Provider>
    );
}
