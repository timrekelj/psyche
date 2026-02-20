import { supabase } from './supabase';
import {
    decryptForUser,
    encryptForUser,
    MissingEncryptionKeyError,
} from './clientEncryption';
import { EncryptionStatus, getEncryptionStatus } from './userEncryption';

export interface ChatMessage {
    id?: string;
    user_id: string;
    content: string;
    role: 'user' | 'assistant';
    state?: string;
    source?: 'mistral' | 'apple';
    created_at?: string;
    updated_at?: string;
}

type ChatMessageRow = {
    id?: string;
    user_id: string;
    content_enc: string;
    role_enc: string;
    state_enc?: string;
    source_enc?: string;
    created_at?: string;
    updated_at?: string;
};

export interface ChatSession {
    id?: string;
    user_id: string;
    summary?: string;
    created_at?: string;
    updated_at?: string;
}

type ChatSessionRow = {
    id?: string;
    user_id: string;
    summary_enc?: string;
    created_at?: string;
    updated_at?: string;
};

export type ChatServiceErrorCode =
    | 'ENCRYPTION_KEY_REQUIRED'
    | 'ENCRYPTION_KEY_BACKUP_REQUIRED'
    | 'ENCRYPTION_WRONG_KEY'
    | 'UNKNOWN';

function encryptionStatusToError(status: EncryptionStatus): {
    code: ChatServiceErrorCode;
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

async function encryptMessage(userId: string, message: ChatMessage): Promise<ChatMessageRow> {
    const result = {
        id: message.id,
        user_id: message.user_id,
        content_enc: await encryptForUser(userId, message.content),
        role_enc: await encryptForUser(userId, message.role),
        state_enc: message.state ? await encryptForUser(userId, message.state) : undefined,
        source_enc: message.source ? await encryptForUser(userId, message.source) : undefined,
        created_at: message.created_at,
        updated_at: message.updated_at,
    };
    return result;
}

async function decryptMessage(userId: string, row: ChatMessageRow): Promise<ChatMessage> {
    try {
        return {
            id: row.id,
            user_id: row.user_id,
            content: await decryptForUser(userId, row.content_enc),
            role: (await decryptForUser(userId, row.role_enc)) as 'user' | 'assistant',
            state: row.state_enc ? await decryptForUser(userId, row.state_enc) : undefined,
            source: row.source_enc ? (await decryptForUser(userId, row.source_enc)) as 'mistral' | 'apple' : undefined,
            created_at: row.created_at,
            updated_at: row.updated_at,
        };
    } catch (error) {
        console.error('Failed to decrypt message row:', row.id);
        console.error('content_enc:', row.content_enc?.substring(0, 100) + '...');
        console.error('role_enc:', row.role_enc?.substring(0, 100) + '...');
        throw error;
    }
}

async function encryptSession(userId: string, session: ChatSession): Promise<ChatSessionRow> {
    return {
        id: session.id,
        user_id: session.user_id,
        summary_enc: session.summary ? await encryptForUser(userId, session.summary) : undefined,
        created_at: session.created_at,
        updated_at: session.updated_at,
    };
}

async function decryptSession(userId: string, row: ChatSessionRow): Promise<ChatSession> {
    return {
        id: row.id,
        user_id: row.user_id,
        summary: row.summary_enc ? await decryptForUser(userId, row.summary_enc) : undefined,
        created_at: row.created_at,
        updated_at: row.updated_at,
    };
}

export class ChatService {
    static async getChatSession(
        userId: string
    ): Promise<{
        success: boolean;
        data?: ChatSession;
        error?: string;
        code?: ChatServiceErrorCode;
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
                .from('chat_sessions')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) {
                console.error('Error fetching chat session:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            if (!data) {
                // No session exists yet, return empty session
                return {
                    success: true,
                    data: {
                        user_id: userId,
                        summary: '',
                    },
                };
            }

            const decrypted = await decryptSession(userId, data as ChatSessionRow);

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

            console.error('Unexpected error fetching chat session:', error);
            return {
                success: false,
                code: 'UNKNOWN',
                error: 'An unexpected error occurred',
            };
        }
    }

    static async updateChatSession(
        userId: string,
        session: ChatSession
    ): Promise<{
        success: boolean;
        data?: ChatSession;
        error?: string;
        code?: ChatServiceErrorCode;
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

            const sessionData = await encryptSession(userId, session);

            const { data, error } = await supabase
                .from('chat_sessions')
                .upsert(sessionData)
                .eq('user_id', userId)
                .select()
                .maybeSingle();

            if (error) {
                console.error('Error updating chat session:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            const decrypted = await decryptSession(userId, data as ChatSessionRow);

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

            console.error('Unexpected error updating chat session:', error);
            return {
                success: false,
                code: 'UNKNOWN',
                error: 'An unexpected error occurred',
            };
        }
    }

    static async getChatMessages(
        userId: string,
        limit: number = 50
    ): Promise<{
        success: boolean;
        data?: ChatMessage[];
        error?: string;
        code?: ChatServiceErrorCode;
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
                .from('chat_messages')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: true })
                .limit(limit);

            if (error) {
                console.error('Error fetching chat messages:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            const rows = (data ?? []) as ChatMessageRow[];
            const decrypted = await Promise.all(
                rows.map((row) => decryptMessage(userId, row))
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

            console.error('Unexpected error fetching chat messages:', error);
            return {
                success: false,
                code: 'UNKNOWN',
                error: 'An unexpected error occurred',
            };
        }
    }

    static async saveChatMessage(
        userId: string,
        message: ChatMessage
    ): Promise<{
        success: boolean;
        data?: ChatMessage;
        error?: string;
        code?: ChatServiceErrorCode;
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

            const messageData = await encryptMessage(userId, message);

            const { data, error } = await supabase
                .from('chat_messages')
                .insert(messageData)
                .select()
                .single();

            if (error) {
                console.error('Error saving chat message:', error);
                return {
                    success: false,
                    error: error.message,
                };
            }

            const decrypted = await decryptMessage(userId, data as ChatMessageRow);

            // Enforce 50 message limit - delete oldest messages if we exceed the limit
            const { count: messageCount } = await supabase
                .from('chat_messages')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            if (messageCount && messageCount > 50) {
                const messagesToDelete = messageCount - 50;
                const { error: deleteError } = await supabase
                    .from('chat_messages')
                    .delete()
                    .eq('user_id', userId)
                    .order('created_at', { ascending: true })
                    .limit(messagesToDelete);

                if (deleteError) {
                    console.error('Error cleaning up old messages:', deleteError);
                }
            }

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

            console.error('Unexpected error saving chat message:', error);
            return {
                success: false,
                code: 'UNKNOWN',
                error: 'An unexpected error occurred',
            };
        }
    }

    static async clearChatMessages(
        userId: string
    ): Promise<{
        success: boolean;
        error?: string;
        code?: ChatServiceErrorCode;
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

            // Delete all messages
            const { error: deleteMessagesError } = await supabase
                .from('chat_messages')
                .delete()
                .eq('user_id', userId);

            if (deleteMessagesError) {
                console.error('Error deleting chat messages:', deleteMessagesError);
                return {
                    success: false,
                    error: deleteMessagesError.message,
                };
            }

            // Clear summary
            const { error: updateSessionError } = await supabase
                .from('chat_sessions')
                .update({ summary_enc: null })
                .eq('user_id', userId);

            if (updateSessionError) {
                console.error('Error clearing chat session summary:', updateSessionError);
                return {
                    success: false,
                    error: updateSessionError.message,
                };
            }

            return { success: true };
        } catch (error) {
            if (error instanceof MissingEncryptionKeyError) {
                return {
                    success: false,
                    code: 'ENCRYPTION_KEY_REQUIRED',
                    error: 'Import your recovery key to access encrypted data.',
                };
            }

            console.error('Unexpected error clearing chat messages:', error);
            return {
                success: false,
                code: 'UNKNOWN',
                error: 'An unexpected error occurred',
            };
        }
    }
}
