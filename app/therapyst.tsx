import React, { useEffect, useMemo, useRef, useState } from 'react';
import { z } from 'zod';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { router } from 'expo-router';
import { SendHorizonal, Trash2 } from 'lucide-react-native';
import { createMistral } from '@ai-sdk/mistral';

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { CryingService, CryEntry } from '@/lib/cryingService';
import LoadingIndicator from '@/components/ui/LoadingIndicator';
// Configure Mistral AI with API key
const mistralProvider = createMistral({
    apiKey: process.env.EXPO_PUBLIC_MISTRAL_API_KEY,
});

import {
    buildTherapystPrompt,
    generateSummary,
    formatTranscript,
    type ChatMessage as TherapystChatMessage,
    type ChatState,
    DEFAULT_STATE,
    CHAT_STATES,
} from '@/lib/therapystPrompt';
import { ChatService, type ChatMessage as ChatServiceMessage } from '@/lib/chatService';
import { checkAndMigrateChatData } from '@/lib/chatMigration';

import { apple } from '@react-native-ai/apple';
import { generateText, Output } from 'ai';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Message = TherapystChatMessage & {
    source?: 'mistral' | 'apple';
    state?: ChatState; // State when this message was sent
};

const CRY_LIMIT = 5;
const SUMMARY_MESSAGE_LIMIT = 8;

type CryContext = {
    entries: CryEntry[];
    status: 'idle' | 'loading' | 'ready' | 'error';
    error?: string;
};

function getStorageKey(base: string, userId?: string | null) {
    return userId ? `${base}-${userId}` : base;
}

const STORAGE_KEY = 'therapyst-messages';
const SUMMARY_KEY = 'therapyst-summary';
const STATE_KEY = 'therapyst-state';

function formatCryEntry(entry: CryEntry) {
    const criedAt = entry.cried_at
        ? new Date(entry.cried_at).toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
          })
        : 'Unknown time';

    return [
        `- ${criedAt}`,
        `  emotions: ${entry.emotions}`,
        `  intensity: ${entry.feeling_intensity}`,
        `  thoughts: ${entry.thoughts || '(none)'}`,
        `  recent smile: ${entry.recent_smile_thing || '(none)'}`,
    ].join('\n');
}

export default function TherapystScreen() {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [chatState, setChatState] = useState<ChatState>(DEFAULT_STATE);

    // Ensure we always have a valid state value for storage
    const safeChatState = chatState ?? DEFAULT_STATE;

    // Helper function to validate and sanitize chat state
    const validateChatState = (state: string | undefined): ChatState => {
        if (!state || (CHAT_STATES && !CHAT_STATES.includes(state))) {
            return DEFAULT_STATE;
        }
        return state;
    };

    // Validate that safeChatState is always a valid state
    useEffect(() => {
        if (!safeChatState || (CHAT_STATES && !CHAT_STATES.includes(safeChatState))) {
            console.warn(`Invalid state detected: ${safeChatState}, resetting to default`);
            setChatState(DEFAULT_STATE);
        }
    }, [safeChatState]);
    const [summary, setSummary] = useState('');
    const [cryContext, setCryContext] = useState<CryContext>({
        entries: [],
        status: 'idle',
    });
    const [summarizing, setSummarizing] = useState(false);
    const [lastModelSource, setLastModelSource] = useState<
        'mistral' | 'apple' | null
    >(null);
    const [loadingChat, setLoadingChat] = useState(true);

    const scrollRef = useRef<ScrollView | null>(null);

    useEffect(() => {
        if (!user) {
            router.replace('/login');
        }
    }, [user]);

    // Load chat data from database
    useEffect(() => {
        if (!user?.id) return;

        let isMounted = true;

        (async () => {
            try {
                setLoadingChat(true);

                // Check and migrate data from AsyncStorage if needed
                await checkAndMigrateChatData(user.id);

                // Load messages
                const messagesResult = await ChatService.getChatMessages(user.id);
                if (messagesResult.success && messagesResult.data && isMounted) {
                    const loadedMessages = messagesResult.data.map(msg => ({
                        role: msg.role,
                        content: msg.content,
                        state: msg.state,
                        source: msg.source,
                        createdAt: msg.created_at || new Date().toISOString(),
                    }));
                    setMessages(loadedMessages);
                }

                // Load session (summary)
                const sessionResult = await ChatService.getChatSession(user.id);
                if (sessionResult.success && sessionResult.data && isMounted) {
                    setSummary(sessionResult.data.summary || '');
                }

                // Load chat state from AsyncStorage (for backward compatibility)
                const savedState = await AsyncStorage.getItem(getStorageKey(STATE_KEY, user.id));
                if (savedState && isMounted) {
                    // Validate the saved state before using it
                    const validatedState = CHAT_STATES && CHAT_STATES.includes(savedState) ? savedState : DEFAULT_STATE;
                    setChatState(validatedState);
                }

            } catch (err) {
                console.error('Failed to load chat data from database', err);
            } finally {
                if (isMounted) {
                    setLoadingChat(false);
                }
            }
        })();

        return () => {
            isMounted = false;
        };
    }, [user?.id]);

    // Save chat state to AsyncStorage (for backward compatibility)
    useEffect(() => {
        const key = getStorageKey(STATE_KEY, user?.id);
        // Double-check that we have a valid state before storing
        if (safeChatState) {
            AsyncStorage.setItem(key, safeChatState).catch((err) => {
                console.error('Failed to persist chat state', err);
            });
        }
    }, [safeChatState, user?.id]);

    // Save summary to database
    useEffect(() => {
        if (!user?.id || loadingChat) return;

        (async () => {
            try {
                const sessionResult = await ChatService.getChatSession(user.id);
                if (!sessionResult.success) {
                    console.error('Failed to get chat session for summary update');
                    return;
                }

                const currentSession = sessionResult.data || { user_id: user.id, summary: '' };
                const updatedSession = { ...currentSession, summary };

                await ChatService.updateChatSession(user.id, updatedSession);
            } catch (err) {
                console.error('Failed to persist summary to database', err);
            }
        })();
    }, [summary, user?.id, loadingChat]);

    useEffect(() => {
        if (!user?.id) return;
        setCryContext((prev) =>
            prev.status === 'loading'
                ? prev
                : { ...prev, status: 'loading', error: undefined }
        );

        let cancelled = false;
        (async () => {
            const result = await CryingService.getUserCryingSessions(
                user.id,
                CRY_LIMIT
            );
            if (cancelled) return;
            if (!result.success) {
                setCryContext({
                    entries: [],
                    status: 'error',
                    error: result.error ?? 'Unable to load cries.',
                });
                return;
            }

            setCryContext({
                entries: result.data ?? [],
                status: 'ready',
            });
        })();

        return () => {
            cancelled = true;
        };
    }, [user?.id]);

    useEffect(() => {
        const key = getStorageKey(STATE_KEY, user?.id);
        // Double-check that we have a valid state before storing
        if (safeChatState) {
            AsyncStorage.setItem(key, safeChatState).catch((err) => {
                console.error('Failed to persist chat state', err);
            });
        }
    }, [safeChatState, user?.id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    // Scroll to bottom when chat finishes loading
    useEffect(() => {
        if (!loadingChat && scrollRef.current) {
            setTimeout(() => {
                scrollRef.current?.scrollToEnd({ animated: true });
            }, 100); // Small delay to ensure content is rendered
        }
    }, [loadingChat]);

    const cryContextText = useMemo(() => {
        if (cryContext.status === 'error') {
            return `Crying log unavailable: ${cryContext.error ?? 'Unknown error'}`;
        }
        if (cryContext.entries.length === 0) {
            return 'Crying log: none recorded.';
        }

        return [
            'Recent crying log entries (decrypted):',
            ...cryContext.entries.map(formatCryEntry),
        ].join('\n');
    }, [cryContext]);

    const refreshSummary = async (nextMessages: Message[]) => {
        if (summarizing) return;
        setSummarizing(true);
        let attemptedSource: 'mistral' | 'apple' = 'apple';

        try {
            // Generate summary prompt
            const summaryPrompt = await generateSummary(nextMessages, summary);

            const result = await (async () => {
                try {
                    attemptedSource = 'apple';
                    const response = await generateText({
                        model: apple(),
                        prompt: summaryPrompt,
                    });
                    return response.text.trim();
                } catch (err: any) {
                    const message =
                        typeof err?.message === 'string'
                            ? err.message.toLowerCase()
                            : '';
                    const shouldFallback = message.includes('unsafe');

                    if (!shouldFallback) {
                        throw err;
                    }

                    attemptedSource = 'mistral';
                    const fallback = await generateText({
                        model: mistralProvider('mistral-small-latest'),
                        prompt: summaryPrompt,
                    });
                    return fallback.text.trim();
                }
            })();

            if (result) {
                setSummary(result);
            }
        } catch (err) {
            console.error(
                `Failed to update summary (${attemptedSource})`,
                err
            );
        } finally {
            setSummarizing(false);
        }
    };



    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || sending) return;

        const userMessage: Message = {
            role: 'user',
            content: trimmed,
            createdAt: new Date().toISOString(),
        };
        const nextMessages = [...messages, userMessage];
        setMessages(nextMessages);
        setInput('');
        setSending(true);
        setError(null);
        let attemptedSource: 'mistral' | 'apple';

        try {
            // Step 1: Generate/update summary
            await refreshSummary(nextMessages);

            // Step 2: Build complete prompt with all variables
            const prompt = await buildTherapystPrompt({
                messages: nextMessages,
                summary,
                chatState: safeChatState,
            }).catch(error => {
                console.error('Failed to build prompt, falling back to simple mode:', error);
                // Fallback to simple prompt if database prompts fail
                return nextMessages[nextMessages.length - 1].content;
            });
            console.debug('Therapyst prompt:', prompt);

            // Step 3: Get AI response
            const result = await (async () => {
                try {
                    attemptedSource = 'apple';
                    const response = await generateText({
                        model: apple(),
                        prompt,
                        output: Output.object({
                            schema: z.object({
                                state: z.string(),
                                answer: z.string(),
                            })
                        }),
                    });

                    const parsedResponse = JSON.parse(response.text)

                    return {
                        answer: parsedResponse.answer,
                        state: validateChatState(parsedResponse.state),
                        source: 'apple' as const
                    };

                } catch (err: any) {
                    const message =
                        typeof err?.message === 'string'
                            ? err.message.toLowerCase()
                            : '';
                    const shouldFallback = message.includes('unsafe')

                    if (!shouldFallback) {
                        throw err;
                    }

                    console.warn(
                        'Apple model unavailable, falling back to Mistral',
                        err,
                    );

                    attemptedSource = 'mistral';
                    const fallback = await generateText({
                        model: mistralProvider('mistral-small-latest'),
                        prompt,
                        output: Output.object({
                            schema: z.object({
                                state: z.string(),
                                answer: z.string(),
                            })
                        }),
                    });
                    const parsedFallback = JSON.parse(fallback.text);
                    return {
                        answer: parsedFallback.answer,
                        state: validateChatState(parsedFallback.state),
                        source: 'mistral' as const
                    };
                }
            })();

            const assistantMessage: Message = {
                role: 'assistant',
                content: result.answer, // Show only the answer part to user
                source: result.source,
                state: result.state, // Store the state determined by AI
                createdAt: new Date().toISOString(),
            };

            setLastModelSource(result.source);
            // Update state to what the AI determined (with validation)
            const newState = validateChatState(result.state);
            setChatState(newState);

            // Also ensure the assistant message has a valid state
            assistantMessage.state = newState;

            const updatedMessages = [...nextMessages, assistantMessage];
            setMessages(updatedMessages);

            // Save both messages to database
            if (user?.id) {
                try {
                    // Save user message
                    await ChatService.saveChatMessage(user.id, {
                        user_id: user.id,
                        content: userMessage.content,
                        role: userMessage.role as 'user' | 'assistant',
                        created_at: userMessage.createdAt,
                    } as ChatServiceMessage);

                    // Save assistant message
                    await ChatService.saveChatMessage(user.id, {
                        user_id: user.id,
                        content: assistantMessage.content,
                        role: assistantMessage.role as 'user' | 'assistant',
                        state: assistantMessage.state,
                        source: assistantMessage.source,
                        created_at: assistantMessage.createdAt,
                    } as ChatServiceMessage);
                } catch (err) {
                    console.error('Failed to save messages to database', err);
                }
            }
        } catch (err) {
            console.error('Failed to send message', err);
            const sourceLabel =
                attemptedSource === 'mistral' ? 'Mistral' : 'On-device';
            const details =
                typeof (err as any)?.message === 'string'
                    ? (err as any).message
                    : 'Could not get a response. Please try again.';
            setError(
                `${sourceLabel}: ${details}`,
            );
        } finally {
            setSending(false);
        }
    };

    const handleClearChat = async () => {
        setMessages([]);
        setInput('');
        setError(null);
        setSummary('');
        setChatState(DEFAULT_STATE);

        if (user?.id) {
            try {
                // Clear messages from database
                await ChatService.clearChatMessages(user.id);

                // Clear AsyncStorage for backward compatibility
                const key = getStorageKey(STORAGE_KEY, user?.id);
                const summaryKey = getStorageKey(SUMMARY_KEY, user?.id);
                const stateKey = getStorageKey(STATE_KEY, user?.id);
                await AsyncStorage.multiRemove([key, summaryKey, stateKey]);
            } catch (err) {
                console.error('Failed to delete chat', err);
            }
        }
    };

    return (
        <View className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}>
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View className="relative flex-1 px-6 pb-6 pt-12">
                    {messages.length === 0 ? null : (
                        <Animated.View
                            entering={FadeIn.duration(200)}
                            exiting={FadeOut.duration(200)}
                            className="z-10 mb-6 flex-row items-center justify-between"
                        >
                            <View>
                                <Text
                                    className={`font-instrument-serif-bold text-2xl ${
                                        isDark ? 'text-white' : 'text-black'
                                    }`}
                                >
                                    therapyst
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() =>
                                    Alert.alert(
                                        'Delete chat?',
                                        'This will remove your history. Are you sure?',
                                        [
                                            { text: 'Cancel', style: 'cancel' },
                                            {
                                                text: 'Delete',
                                                style: 'destructive',
                                                onPress: () => handleClearChat(),
                                            },
                                        ],
                                    )
                                }
                                className="rounded-full p-2"
                            >
                                <Trash2
                                    size={22}
                                    color={isDark ? '#ffffff' : '#000000'}
                                />
                            </TouchableOpacity>
                        </Animated.View>
                    )}

                    <ScrollView
                        ref={scrollRef}
                        className="flex-1"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            flexGrow: 1,
                            paddingVertical: 12,
                            gap: 12,
                        }}
                    >
                        {loadingChat ? (
                            <View className="flex-1 items-center justify-center">
                                <LoadingIndicator size="large" />
                                <Text className={`mt-4 text-center font-instrument-serif ${
                                    isDark ? 'text-white/80' : 'text-black/70'
                                }`}>
                                    Loading chat history...
                                </Text>
                            </View>
                        ) : messages.length === 0 ? (
                            <Animated.View
                                entering={FadeIn.duration(200)}
                                exiting={FadeOut.duration(200)}
                                className="flex-1 items-center justify-center"
                            >
                                <Text
                                    className={`text-center text-5xl font-instrument-serif-bold ${
                                        isDark ? 'text-white' : 'text-black'
                                    }`}
                                >
                                    therapyst
                                </Text>
                                <Text
                                    className={`mt-2 text-center text-base font-instrument-serif ${
                                        isDark ? 'text-white/80' : 'text-black/70'
                                    }`}
                                >
                                    A concise, empathetic space to talk things through. Start typing to begin.
                                </Text>
                            </Animated.View>
                        ) : (
                            messages.map((message, index) => {
                                // Get the state for this specific message (stored when the message was created)
                                const messageState = message.role === 'assistant' ? message.state : null;

                                return (
                                    <View
                                        key={`${message.role}-${index}`}
                                        className={`max-w-[85%] rounded-2xl px-4 py-3 gap-2 ${
                                            message.role === 'user'
                                                ? isDark
                                                    ? 'self-end bg-white/10'
                                                    : 'self-end bg-black/10'
                                                : isDark
                                                ? 'self-start border border-white/10'
                                                : 'self-start border border-black/10'
                                        }`}
                                    >
                                        <Text
                                            className={`text-base font-instrument-serif`}
                                            style={isDark ? { color: '#FFFFFF' } : { color: '#000000' }}
                                        >
                                            {message.content}
                                        </Text>
                                        {message.role === 'assistant' ? (
                                            <View className="flex-row justify-between items-center">
                                                <Text
                                                    className={`text-xs font-instrument-serif ${
                                                        isDark
                                                            ? 'text-white/60'
                                                            : 'text-black/50'
                                                    }`}
                                                >
                                                    {messageState || safeChatState}
                                                </Text>
                                                <Text
                                                    className={`text-xs font-instrument-serif ${
                                                        isDark
                                                            ? 'text-white/60'
                                                            : 'text-black/50'
                                                    }`}
                                                >
                                                    {message.source === 'mistral'
                                                        ? 'Mistral'
                                                        : 'On-device'}
                                                </Text>
                                            </View>
                                        ) : null}
                                    </View>
                                );
                            })
                        )}

                        {error ? (
                            <Text className="text-center font-instrument-serif text-red-500">
                                {error}
                            </Text>
                        ) : null}

                        {sending ? (
                            <View className="items-start px-6 py-4">
                                <LoadingIndicator size="medium" />
                            </View>
                        ) : null}
                    </ScrollView>

                    <View
                        className={`mt-2 rounded-2xl border p-3 ${
                            isDark
                                ? 'border-white/15 bg-white/5'
                                : 'border-black/10 bg-black/5'
                        }`}
                    >
                        <View className="flex-row items-end gap-3">
                            <TextInput
                                value={input}
                                onChangeText={setInput}
                                placeholder="Tell Therapyst what's on your mind..."
                                placeholderTextColor={
                                    isDark ? 'rgba(255,255,255,0.4)' : '#555'
                                }
                                multiline
                                className={`flex-1 rounded-xl px-3 py-2 font-instrument-serif text-base ${
                                    isDark ? 'text-white' : 'text-black'
                                }`}
                            />

                            <TouchableOpacity
                                onPress={handleSend}
                                disabled={sending}
                                className="mb-1 rounded-full p-2"
                            >
                                <SendHorizonal
                                    size={22}
                                    color={isDark ? '#ffffff' : '#000000'}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
