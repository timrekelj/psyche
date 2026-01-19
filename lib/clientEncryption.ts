import 'react-native-get-random-values';
import * as SecureStore from 'expo-secure-store';
import { xchacha20poly1305 } from '@noble/ciphers/chacha';
import { bytesToHex, hexToBytes, randomBytes } from '@noble/hashes/utils';

const ACTIVE_KEY_PREFIX = 'enc_key_v1_';
const CANDIDATE_KEY_PREFIX = 'enc_key_candidate_v1_';
const CIPHER_PREFIX = 'enc_v1';

const RECOVERY_KEY_PREFIX = 'psyche_recovery_v1';
const KEY_CHECK_PLAINTEXT_PREFIX = 'psyche_key_check_v1';

export class MissingEncryptionKeyError extends Error {
    constructor(message: string = 'Missing encryption key') {
        super(message);
        this.name = 'MissingEncryptionKeyError';
    }
}

export class InvalidRecoveryKeyError extends Error {
    constructor(message: string = 'Invalid recovery key') {
        super(message);
        this.name = 'InvalidRecoveryKeyError';
    }
}

function isValidHex(value: string, expectedBytes?: number): boolean {
    if (!/^[0-9a-fA-F]*$/.test(value)) return false;
    if (value.length % 2 !== 0) return false;
    if (expectedBytes !== undefined && value.length !== expectedBytes * 2) {
        return false;
    }
    return true;
}

function activeStorageKey(userId: string): string {
    return `${ACTIVE_KEY_PREFIX}${userId}`;
}

function candidateStorageKey(userId: string): string {
    return `${CANDIDATE_KEY_PREFIX}${userId}`;
}

async function loadKeyHex(storageKey: string): Promise<string | null> {
    try {
        return await SecureStore.getItemAsync(storageKey);
    } catch {
        return null;
    }
}

async function storeKeyHex(storageKey: string, keyHex: string): Promise<void> {
    await SecureStore.setItemAsync(storageKey, keyHex, {
        keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    });
}

export async function getExistingActiveKey(userId: string): Promise<Uint8Array | null> {
    const stored = await loadKeyHex(activeStorageKey(userId));
    if (!stored) return null;
    if (!isValidHex(stored, 32)) return null;
    try {
        return hexToBytes(stored);
    } catch {
        return null;
    }
}

export async function hasActiveKey(userId: string): Promise<boolean> {
    return (await getExistingActiveKey(userId)) !== null;
}

export async function createAndStoreNewActiveKey(userId: string): Promise<Uint8Array> {
    const key = randomBytes(32);
    await storeKeyHex(activeStorageKey(userId), bytesToHex(key));
    return key;
}

export async function storeActiveKey(userId: string, key: Uint8Array): Promise<void> {
    if (key.length !== 32) {
        throw new Error('Encryption key must be 32 bytes');
    }
    await storeKeyHex(activeStorageKey(userId), bytesToHex(key));
}

export async function clearActiveKey(userId: string): Promise<void> {
    try {
        await SecureStore.deleteItemAsync(activeStorageKey(userId));
    } catch {
        // ignore
    }
}

export async function getExistingCandidateKey(userId: string): Promise<Uint8Array | null> {
    const stored = await loadKeyHex(candidateStorageKey(userId));
    if (!stored) return null;
    if (!isValidHex(stored, 32)) return null;
    try {
        return hexToBytes(stored);
    } catch {
        return null;
    }
}

export async function hasCandidateKey(userId: string): Promise<boolean> {
    return (await getExistingCandidateKey(userId)) !== null;
}

export async function storeCandidateKey(userId: string, key: Uint8Array): Promise<void> {
    if (key.length !== 32) {
        throw new Error('Encryption key must be 32 bytes');
    }
    await storeKeyHex(candidateStorageKey(userId), bytesToHex(key));
}

export async function clearCandidateKey(userId: string): Promise<void> {
    try {
        await SecureStore.deleteItemAsync(candidateStorageKey(userId));
    } catch {
        // ignore
    }
}

export function createKeyCheckCiphertext(userId: string, key: Uint8Array): string {
    const nonce = randomBytes(24);
    const cipher = xchacha20poly1305(key, nonce);
    const plaintext = `${KEY_CHECK_PLAINTEXT_PREFIX}:${userId}`;
    const messageBytes = new TextEncoder().encode(plaintext);
    const ciphertext = cipher.encrypt(messageBytes);
    return `${CIPHER_PREFIX}:${bytesToHex(nonce)}:${bytesToHex(ciphertext)}`;
}

export function verifyKeyCheckCiphertext(userId: string, key: Uint8Array, value: string): boolean {
    const decrypted = decryptWithKey(key, value);
    return decrypted === `${KEY_CHECK_PLAINTEXT_PREFIX}:${userId}`;
}

export function encryptWithKey(key: Uint8Array, plaintext: string): string {
    const nonce = randomBytes(24);
    const cipher = xchacha20poly1305(key, nonce);
    const messageBytes = new TextEncoder().encode(plaintext);
    const ciphertext = cipher.encrypt(messageBytes);
    return `${CIPHER_PREFIX}:${bytesToHex(nonce)}:${bytesToHex(ciphertext)}`;
}

export function decryptWithKey(key: Uint8Array, value: string): string {
    if (!value.startsWith(`${CIPHER_PREFIX}:`)) {
        return value;
    }

    const parts = value.split(':');
    if (parts.length !== 3) {
        throw new Error('Invalid ciphertext format');
    }

    const nonceHex = parts[1];
    const ciphertextHex = parts[2];
    if (!isValidHex(nonceHex, 24) || !isValidHex(ciphertextHex)) {
        throw new Error('Invalid ciphertext encoding');
    }

    const nonce = hexToBytes(nonceHex);
    const ciphertext = hexToBytes(ciphertextHex);
    const cipher = xchacha20poly1305(key, nonce);
    const plaintext = cipher.decrypt(ciphertext);
    return new TextDecoder().decode(plaintext);
}

export async function encryptForUser(userId: string, plaintext: string): Promise<string> {
    const key = await getExistingActiveKey(userId);
    if (!key) {
        throw new MissingEncryptionKeyError();
    }

    if (plaintext.length === 0) {
        return plaintext;
    }

    return encryptWithKey(key, plaintext);
}

export async function decryptForUser(userId: string, value: string): Promise<string> {
    if (!value.startsWith(`${CIPHER_PREFIX}:`)) {
        return value;
    }

    const key = await getExistingActiveKey(userId);
    if (!key) {
        throw new MissingEncryptionKeyError();
    }

    return decryptWithKey(key, value);
}

export function exportRecoveryKeyString(userId: string, key: Uint8Array): string {
    return `${RECOVERY_KEY_PREFIX}:${userId}:${bytesToHex(key)}`;
}

export function parseRecoveryKeyString(recoveryKey: string): {
    userId: string;
    key: Uint8Array;
} {
    const parts = recoveryKey.trim().split(':');
    if (parts.length !== 3) {
        throw new InvalidRecoveryKeyError('Recovery key has wrong format');
    }

    const [prefix, userId, keyHex] = parts;
    if (prefix !== RECOVERY_KEY_PREFIX) {
        throw new InvalidRecoveryKeyError('Recovery key prefix is invalid');
    }

    if (!userId) {
        throw new InvalidRecoveryKeyError('Recovery key userId is missing');
    }

    if (!isValidHex(keyHex, 32)) {
        throw new InvalidRecoveryKeyError('Recovery key is not valid hex');
    }

    return { userId, key: hexToBytes(keyHex) };
}
