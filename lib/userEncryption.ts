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
        const ok = verifyKeyCheckCiphertext(userId, activeKey, keyCheck);
        if (!ok) {
            return { status: 'wrong_key' };
        }

        return { status: 'ready' };
    }

    const candidateKey = await getExistingCandidateKey(userId);
    if (candidateKey) {
        const candidateOk = verifyKeyCheckCiphertext(
            userId,
            candidateKey,
            keyCheck
        );
        if (!candidateOk) {
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
    const { error } = await supabase
        .from('cries')
        .delete()
        .eq('user_id', userId);

    if (error) {
        throw error;
    }

    await clearActiveKey(userId);
    await clearCandidateKey(userId);

    await createAndStoreNewActiveKey(userId);

    await upsertUsersData(userId, {
        encryption_key_check: null,
    });
}
