import { supabase } from './supabase';
import {
    clearCandidateKey,
    clearActiveKey,
    createAndStoreNewActiveKey,
    createKeyCheckCiphertext,
    exportRecoveryKeyString,
    getExistingActiveKey,
    getExistingCandidateKey,
    storeActiveKey,
    verifyKeyCheckCiphertext,
} from './clientEncryption';

export type EncryptionStatus =
    | { status: 'ready' }
    | { status: 'needs_backup' }
    | { status: 'needs_import' }
    | { status: 'needs_new_key' }
    | { status: 'wrong_key' };

type UsersDataRow = {
    id: string;
    encryption_key_check: string | null;
};

async function getUsersEncryptionData(userId: string): Promise<UsersDataRow> {
    const { data, error } = await supabase
        .from('users_data')
        .select('id,encryption_key_check')
        .eq('id', userId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!data) {
        throw new Error(`User ${userId} not found`);
    }

    return data as UsersDataRow;
}

async function upsertUsersData(
    userId: string,
    patch: Partial<UsersDataRow>
): Promise<void> {
    const { error } = await supabase
        .from('users_data')
        .upsert({ id: userId, ...patch }, { onConflict: 'id' });

    if (error) {
        throw error;
    }
}

export async function getEncryptionStatus(userId: string): Promise<EncryptionStatus> {
    const row = await getUsersEncryptionData(userId);

    const keyCheck = row.encryption_key_check;
    if (!keyCheck) {
        const existingKey = await getExistingActiveKey(userId);
        if (!existingKey) {
            await createAndStoreNewActiveKey(userId);
        }
        return { status: 'needs_backup' };
    }

    const activeKey = await getExistingActiveKey(userId);
    if (activeKey) {
        try {
            const ok = verifyKeyCheckCiphertext(userId, activeKey, keyCheck);
            if (!ok) {
                console.warn('Encryption key verification failed for user:', userId);
                return { status: 'wrong_key' };
            }

            return { status: 'ready' };
        } catch (error) {
            console.error('Encryption verification error for user', userId, ':', error);
            // If decryption fails, treat it as wrong key and prompt for key import
            return { status: 'wrong_key' };
        }
    }

    const candidateKey = await getExistingCandidateKey(userId);
    if (candidateKey) {
        try {
            const candidateOk = verifyKeyCheckCiphertext(
                userId,
                candidateKey,
                keyCheck
            );
            if (!candidateOk) {
                console.warn('Candidate key verification failed for user:', userId);
                return { status: 'wrong_key' };
            }
        } catch (error) {
            console.error('Candidate key verification error for user', userId, ':', error);
            return { status: 'wrong_key' };
        }

        await storeActiveKey(userId, candidateKey);
        await clearCandidateKey(userId);

        return { status: 'ready' };
    }

    return { status: 'needs_import' };
}

export async function markEncryptionKeyBackedUp(userId: string): Promise<void> {
    const row = await getUsersEncryptionData(userId);
    if (row.encryption_key_check) {
        return;
    }

    const activeKey = await getExistingActiveKey(userId);
    if (!activeKey) {
        throw new Error('Missing encryption key');
    }

    const keyCheck = createKeyCheckCiphertext(userId, activeKey);
    await upsertUsersData(userId, {
        encryption_key_check: keyCheck,
    });
}

export async function getRecoveryKeyString(userId: string): Promise<string> {
    const activeKey = await getExistingActiveKey(userId);
    if (!activeKey) {
        throw new Error('Missing encryption key');
    }

    return exportRecoveryKeyString(userId, activeKey);
}

export async function resetEncryptedDataAndCreateKey(
    userId: string
): Promise<void> {
    // Delete cries
    const { error: criesError } = await supabase
        .from('cries')
        .delete()
        .eq('user_id', userId);

    if (criesError) {
        throw criesError;
    }

    const { error: messagesError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', userId);

    if (messagesError) {
        throw messagesError;
    }

    const { error: sessionsError } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('user_id', userId);

    if (sessionsError) {
        throw sessionsError;
    }

    await clearActiveKey(userId);
    await clearCandidateKey(userId);

    await createAndStoreNewActiveKey(userId);

    await upsertUsersData(userId, {
        encryption_key_check: null,
    });
}
