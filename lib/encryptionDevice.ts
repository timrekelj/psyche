import AsyncStorage from '@react-native-async-storage/async-storage';

const ENCRYPTION_SETUP_PREFIX = 'encryption_setup_complete_v1_';

function storageKey(userId: string): string {
    return `${ENCRYPTION_SETUP_PREFIX}${userId}`;
}

export async function getEncryptionSetupComplete(userId: string): Promise<boolean> {
    try {
        const value = await AsyncStorage.getItem(storageKey(userId));
        return value === 'true';
    } catch {
        return false;
    }
}

export async function setEncryptionSetupComplete(
    userId: string,
    complete: boolean
): Promise<void> {
    try {
        if (complete) {
            await AsyncStorage.setItem(storageKey(userId), 'true');
        } else {
            await AsyncStorage.setItem(storageKey(userId), 'false');
        }
    } catch {
        // ignore storage errors
    }
}
