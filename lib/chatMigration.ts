import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatService, type ChatMessage } from './chatService';
import { decryptForUser, encryptForUser } from './clientEncryption';

const STORAGE_KEY = 'therapyst-messages';
const SUMMARY_KEY = 'therapyst-summary';
const STATE_KEY = 'therapyst-state';

function getStorageKey(base: string, userId?: string | null) {
    return userId ? `${base}-${userId}` : base;
}

export async function migrateChatDataFromAsyncStorage(userId: string): Promise<{
    success: boolean;
    migratedMessages?: number;
    migratedSummary?: boolean;
    error?: string;
}> {
    try {
        let migratedMessages = 0;
        let migratedSummary = false;

        // Migrate messages
        const messagesKey = getStorageKey(STORAGE_KEY, userId);
        const savedMessages = await AsyncStorage.getItem(messagesKey);
        
        if (savedMessages) {
            try {
                const messages = JSON.parse(savedMessages);
                if (Array.isArray(messages) && messages.length > 0) {
                    // Clear existing messages in database
                    await ChatService.clearChatMessages(userId);
                    
                    // Save each message to database
                    for (const message of messages) {
                        if (message.role && message.content) {
                            await ChatService.saveChatMessage(userId, {
                                user_id: userId,
                                content: message.content,
                                role: message.role,
                                state: message.state,
                                source: message.source,
                                created_at: message.createdAt || new Date().toISOString(),
                            });
                            migratedMessages++;
                        }
                    }
                }
            } catch (err) {
                console.error('Failed to parse or migrate messages:', err);
            }
        }

        // Migrate summary
        const summaryKey = getStorageKey(SUMMARY_KEY, userId);
        const savedSummary = await AsyncStorage.getItem(summaryKey);
        
        if (savedSummary) {
            try {
                const sessionResult = await ChatService.getChatSession(userId);
                if (sessionResult.success) {
                    const currentSession = sessionResult.data || { user_id: userId, summary: '' };
                    const updatedSession = { ...currentSession, summary: savedSummary };
                    
                    await ChatService.updateChatSession(userId, updatedSession);
                    migratedSummary = true;
                }
            } catch (err) {
                console.error('Failed to migrate summary:', err);
            }
        }

        // Clear AsyncStorage after successful migration
        if (migratedMessages > 0 || migratedSummary) {
            await AsyncStorage.multiRemove([
                getStorageKey(STORAGE_KEY, userId),
                getStorageKey(SUMMARY_KEY, userId),
            ]);
        }

        return {
            success: true,
            migratedMessages,
            migratedSummary,
        };
    } catch (error) {
        console.error('Chat migration failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown migration error',
        };
    }
}

export async function checkAndMigrateChatData(userId: string): Promise<void> {
    try {
        // Check if there's data in AsyncStorage that needs migration
        const messagesKey = getStorageKey(STORAGE_KEY, userId);
        const hasMessages = await AsyncStorage.getItem(messagesKey);
        
        if (hasMessages) {
            console.log('Found existing chat data in AsyncStorage, attempting migration...');
            const result = await migrateChatDataFromAsyncStorage(userId);
            
            if (result.success) {
                console.log(`Successfully migrated ${result.migratedMessages} messages and ${result.migratedSummary ? 'summary' : 'no summary'}`);
            } else {
                console.error('Migration failed:', result.error);
            }
        }
    } catch (error) {
        console.error('Migration check failed:', error);
    }
}