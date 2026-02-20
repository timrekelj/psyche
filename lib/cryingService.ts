import { supabase } from './supabase';
import { CryingSessionData, EmotionType } from '@/contexts/CryingContext';
import {
    decryptForUser,
    encryptForUser,
    MissingEncryptionKeyError,
} from './clientEncryption';
import { EncryptionStatus, getEncryptionStatus } from './userEncryption';

export interface CryEntry {
    id?: string;
    user_id: string;
    cried_at: string; // ISO string format for database
    emotions: EmotionType;
    feeling_intensity: number;
    thoughts: string;
    recent_smile_thing: string;
    created_at?: string;
    updated_at?: string;
}

type CryRow = {
    id?: string;
    user_id: string;
    cried_at: string;
    emotions_enc: string;
    feeling_intensity_enc: string;
    thoughts_enc: string;
    recent_smile_thing_enc: string;
    created_at?: string;
    updated_at?: string;
};

export type CryingServiceErrorCode =
    | 'ENCRYPTION_KEY_REQUIRED'
    | 'ENCRYPTION_KEY_BACKUP_REQUIRED'
    | 'ENCRYPTION_WRONG_KEY'
    | 'UNKNOWN';

function encryptionStatusToError(status: EncryptionStatus): {
    code: CryingServiceErrorCode;
    message: string;
} | null {
    if (status.status === 'ready') return null;

    if (status.status === 'needs_backup') {
        return {
            code: 'ENCRYPTION_KEY_BACKUP_REQUIRED',
            message: 'Back up your recovery key to continue.',
        };
    }

    if (status.status === 'needs_import') {
        return {
            code: 'ENCRYPTION_KEY_REQUIRED',
            message: 'Import your recovery key to access encrypted data.',
        };
    }

    if (status.status === 'needs_new_key') {
        return {
            code: 'ENCRYPTION_KEY_REQUIRED',
            message: 'Create a new recovery key to access encrypted data.',
        };
    }

    return {
        code: 'ENCRYPTION_WRONG_KEY',
        message: 'The recovery key on this device does not match your account.',
    };
}

function parseEmotionType(value: string): EmotionType {
    const allowed: EmotionType[] = [
        'OVERWHELMED',
        'MISSING_SOMEONE',
        'STRESS',
        'LONELINESS',
        'RELATIONSHIP_ISSUES',
        'SADNESS',
        'JOY',
        'PROUD',
        'NO_REASON',
    ];

    if ((allowed as string[]).includes(value)) {
        return value as EmotionType;
    }

    return 'NO_REASON';
}

async function decryptRow(userId: string, row: CryRow): Promise<CryEntry> {
    const emotions = await decryptForUser(userId, row.emotions_enc);
    const intensity = await decryptForUser(userId, row.feeling_intensity_enc);
    const parsedIntensity = Number.parseInt(intensity, 10);

    return {
        id: row.id,
        user_id: row.user_id,
        cried_at: row.cried_at,
        emotions: parseEmotionType(emotions),
        feeling_intensity: Number.isFinite(parsedIntensity) ? parsedIntensity : 0,
        thoughts: await decryptForUser(userId, row.thoughts_enc),
        recent_smile_thing: await decryptForUser(userId, row.recent_smile_thing_enc),
        created_at: row.created_at,
        updated_at: row.updated_at,
    };
}

export class CryingService {
    static async saveCryingSession(
        userId: string,
        sessionData: CryingSessionData
    ): Promise<{
        success: boolean;
        data?: CryEntry;
        error?: string;
        code?: CryingServiceErrorCode;
    }> {
        try {
            const encryptionStatus = await getEncryptionStatus(userId);
            const encryptionError = encryptionStatusToError(encryptionStatus);
            if (encryptionError) {
                return {
                    success: false,
                    code: encryptionError.code,
                    error: encryptionError.message,
                };
            }

            // Validate session data
            if (
                !sessionData.criedAt ||
                !sessionData.emotions ||
                sessionData.feelingIntensity === null ||
                !sessionData.recentSmileThing.trim()
            ) {
                return {
                    success: false,
                    error: 'Incomplete session data',
                };
            }

            // Prepare data for database
            const cryData: Omit<CryRow, 'id'> = {
                user_id: userId,
                cried_at: sessionData.criedAt.toISOString(),
                emotions_enc: await encryptForUser(userId, sessionData.emotions),
                feeling_intensity_enc: await encryptForUser(
                    userId,
                    String(sessionData.feelingIntensity)
                ),
                thoughts_enc: await encryptForUser(
                    userId,
                    sessionData.thoughts.trim()
                ),
                recent_smile_thing_enc: await encryptForUser(
                    userId,
                    sessionData.recentSmileThing.trim()
                ),
            };

            // Insert into Supabase
            const { data, error } = await supabase
                .from('cries')
                .insert(cryData)
                .select()
                .single();

            if (error) {
                console.error('Error saving crying session:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            const decrypted = await decryptRow(userId, data as CryRow);

            return {
                success: true,
                data: decrypted,
            };
        } catch (error) {
            if (error instanceof MissingEncryptionKeyError) {
                return {
                    success: false,
                    code: 'ENCRYPTION_KEY_REQUIRED',
                    error: 'Import your recovery key to access encrypted data.',
                };
            }

            console.error('Unexpected error saving crying session:', error);
            return {
                success: false,
                code: 'UNKNOWN',
                error: 'An unexpected error occurred',
            };
        }
    }

    static async getUserCryingSessions(
        userId: string,
        limit: number = 50
    ): Promise<{
        success: boolean;
        data?: CryEntry[];
        error?: string;
        code?: CryingServiceErrorCode;
    }> {
        try {
            const encryptionStatus = await getEncryptionStatus(userId);
            const encryptionError = encryptionStatusToError(encryptionStatus);
            if (encryptionError) {
                return {
                    success: false,
                    code: encryptionError.code,
                    error: encryptionError.message,
                };
            }

            const { data, error } = await supabase
                .from('cries')
                .select('*')
                .eq('user_id', userId)
                .order('cried_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('Error fetching crying sessions:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            const rows = (data ?? []) as CryRow[];
            const decrypted = await Promise.all(
                rows.map((row) => decryptRow(userId, row))
            );

            return {
                success: true,
                data: decrypted,
            };
        } catch (error) {
            if (error instanceof MissingEncryptionKeyError) {
                return {
                    success: false,
                    code: 'ENCRYPTION_KEY_REQUIRED',
                    error: 'Import your recovery key to access encrypted data.',
                };
            }

            console.error('Unexpected error fetching crying sessions:', error);
            return {
                success: false,
                code: 'UNKNOWN',
                error: 'An unexpected error occurred',
            };
        }
    }

    static async updateCryingSession(
        userId: string,
        entryId: string,
        sessionData: CryingSessionData
    ): Promise<{
        success: boolean;
        data?: CryEntry;
        error?: string;
        code?: CryingServiceErrorCode;
    }> {
        try {
            const encryptionStatus = await getEncryptionStatus(userId);
            const encryptionError = encryptionStatusToError(encryptionStatus);
            if (encryptionError) {
                return {
                    success: false,
                    code: encryptionError.code,
                    error: encryptionError.message,
                };
            }

            if (
                !sessionData.criedAt ||
                !sessionData.emotions ||
                sessionData.feelingIntensity === null ||
                !sessionData.recentSmileThing.trim()
            ) {
                return {
                    success: false,
                    error: 'Incomplete session data',
                };
            }

            const cryData: Partial<CryRow> = {
                cried_at: sessionData.criedAt.toISOString(),
                emotions_enc: await encryptForUser(userId, sessionData.emotions),
                feeling_intensity_enc: await encryptForUser(
                    userId,
                    String(sessionData.feelingIntensity)
                ),
                thoughts_enc: await encryptForUser(
                    userId,
                    sessionData.thoughts.trim()
                ),
                recent_smile_thing_enc: await encryptForUser(
                    userId,
                    sessionData.recentSmileThing.trim()
                ),
            };

            const { data, error } = await supabase
                .from('cries')
                .update(cryData)
                .eq('id', entryId)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) {
                console.error('Error updating crying session:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            const decrypted = await decryptRow(userId, data as CryRow);

            return {
                success: true,
                data: decrypted,
            };
        } catch (error) {
            if (error instanceof MissingEncryptionKeyError) {
                return {
                    success: false,
                    code: 'ENCRYPTION_KEY_REQUIRED',
                    error: 'Import your recovery key to access encrypted data.',
                };
            }

            console.error('Unexpected error updating crying session:', error);
            return {
                success: false,
                code: 'UNKNOWN',
                error: 'An unexpected error occurred',
            };
        }
    }

    static async deleteCryingSession(
        userId: string,
        entryId: string
    ): Promise<{
        success: boolean;
        error?: string;
    }> {
        try {
            const { data, error } = await supabase
                .from('cries')
                .delete()
                .eq('id', entryId)
                .eq('user_id', userId)
                .select('id');

            if (error) {
                console.error('Error deleting crying session:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            if (!data || data.length === 0) {
                return {
                    success: false,
                    error: 'Reflection not found',
                };
            }

            return { success: true };
        } catch (error) {
            console.error('Unexpected error deleting crying session:', error);
            return {
                success: false,
                error: 'An unexpected error occurred',
            };
        }
    }
}
