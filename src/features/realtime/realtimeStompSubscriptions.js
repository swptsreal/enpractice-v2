export function createRealtimeStompSubscriptions() {
    let nextId = 0;
    let client = null;
    const entries = new Map();

    const attach = (entry) => {
        if (!client) return;
        entry.subscription = client.subscribe(entry.destination, entry.handler);
    };

    return {
        get size() {
            return entries.size;
        },
        subscribe(destination, handler) {
            const id = ++nextId;
            const entry = {
                destination,
                handler,
                subscription: null,
            };
            entries.set(id, entry);
            attach(entry);

            return () => {
                entry.subscription?.unsubscribe();
                entries.delete(id);
            };
        },
        bind(nextClient) {
            client = nextClient;
            entries.forEach(attach);
        },
        unbind() {
            entries.forEach((entry) => {
                entry.subscription?.unsubscribe();
                entry.subscription = null;
            });
            client = null;
        },
    };
}
