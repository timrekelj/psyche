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
        const result = await SecureStore.getItemAsync(storageKey);
        if (result) {
            console.log('Debug - Loaded key from storage, length:', result.length);
        }
        return result;
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
    try {
        const decrypted = decryptWithKey(key, value);
        const expected = `${KEY_CHECK_PLAINTEXT_PREFIX}:${userId}`;
        return decrypted === expected;
    } catch (error) {
        console.error('Key verification failed:', error);
        return false;
    }
}

/**
 * Estimates the maximum encrypted size for a given plaintext
 * Used to validate that data will fit in database columns before encryption
 * @param plaintext The text to be encrypted
 * @returns Estimated maximum size of encrypted data in characters
 */
export function estimateEncryptedSize(plaintext: string): number {
    // XChaCha20-Poly1305 adds 16 bytes authentication tag
    // Hex encoding doubles the size
    // Plus prefix and nonce (24 bytes -> 48 hex chars)
    const plaintextBytes = new TextEncoder().encode(plaintext).length;
    const ciphertextBytes = plaintextBytes + 16; // plaintext + auth tag
    const ciphertextHex = ciphertextBytes * 2; // hex encoding
    const nonceHex = 24 * 2; // 24 byte nonce -> 48 hex chars
    const prefix = CIPHER_PREFIX.length + 1; // "enc_v1:" + colon

    return prefix + nonceHex + ciphertextHex;
}

export function encryptWithKey(key: Uint8Array, plaintext: string): string {
    const nonce = randomBytes(24);
    const cipher = xchacha20poly1305(key, nonce);
    const messageBytes = new TextEncoder().encode(plaintext);
    const ciphertext = cipher.encrypt(messageBytes);
    const result = `${CIPHER_PREFIX}:${bytesToHex(nonce)}:${bytesToHex(ciphertext)}`;
    return result;
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

    // Enhanced validation with better error messages
    let validationPassed = true;
    let errorMessage = 'Invalid ciphertext encoding';

    if (!isValidHex(nonceHex, 24)) {
        console.error('Invalid nonce hex. Length:', nonceHex.length, 'Content:', nonceHex);
        errorMessage = 'Invalid nonce encoding';
        validationPassed = false;
    }

    if (!isValidHex(ciphertextHex)) {
        console.error('Invalid ciphertext hex. Length:', ciphertextHex.length, 'First 50 chars:', ciphertextHex.substring(0, 50));
        errorMessage = 'Invalid ciphertext encoding';
        validationPassed = false;
    }

    // Check for potential truncation
    if (ciphertextHex.length < 32) {
        console.error('Ciphertext appears truncated. Length:', ciphertextHex.length);
        errorMessage = 'Ciphertext appears truncated - database column may be too small';
        validationPassed = false;
    }

    // Check if ciphertext length is suspicious (likely truncated)
    if (ciphertextHex.length % 2 !== 0) {
        console.error('Ciphertext has odd length, likely corrupted. Length:', ciphertextHex.length);
        errorMessage = 'Ciphertext has odd length - likely corrupted or truncated';
        validationPassed = false;
    }

    // Check for common database truncation patterns
    if (ciphertextHex.length === 255 || ciphertextHex.length === 512 || ciphertextHex.length === 1024) {
        console.error('Ciphertext length matches common database limit. Length:', ciphertextHex.length);
        errorMessage = `Ciphertext length (${ciphertextHex.length}) suggests database column truncation`;
        validationPassed = false;
    }

    if (!validationPassed) {
        // Provide more detailed guidance for database issues
        const detailedMessage = `${errorMessage}.

Possible solutions:
1. Check database column sizes for encrypted fields (content_enc, role_enc, etc.)
2. Minimum recommended size: 1000+ characters for TEXT fields
3. Run database migration: ALTER TABLE chat_messages ALTER COLUMN content_enc TYPE TEXT;
4. Run database migration: ALTER TABLE chat_messages ALTER COLUMN role_enc TYPE TEXT;
5. If data is not critical, clear and re-encrypt affected records
6. Check for existing database migrations that may need to be applied`;
        throw new Error(detailedMessage);
    }

    try {
        const nonce = hexToBytes(nonceHex);
        const ciphertext = hexToBytes(ciphertextHex);
        const cipher = xchacha20poly1305(key, nonce);
        const plaintext = cipher.decrypt(ciphertext);
        return new TextDecoder().decode(plaintext);
    } catch (error) {
        console.error('Decryption failed:', error);
        if (error instanceof Error && error.message.includes('invalid tag')) {
            throw new Error('Decryption failed: invalid tag. Possible causes: wrong key, corrupted data, or tampered ciphertext.');
        }
        throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
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
