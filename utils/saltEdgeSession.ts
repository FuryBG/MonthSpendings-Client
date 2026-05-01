import * as SecureStore from 'expo-secure-store';

const PENDING_SALT_EDGE_SESSION_ID_KEY = 'pendingSaltEdgeSessionId';

export const savePendingSaltEdgeSessionId = async (localSessionId: string) => {
    await SecureStore.setItemAsync(PENDING_SALT_EDGE_SESSION_ID_KEY, localSessionId);
};

export const getPendingSaltEdgeSessionId = async () => {
    return await SecureStore.getItemAsync(PENDING_SALT_EDGE_SESSION_ID_KEY);
};

export const clearPendingSaltEdgeSessionId = async () => {
    await SecureStore.deleteItemAsync(PENDING_SALT_EDGE_SESSION_ID_KEY);
};
