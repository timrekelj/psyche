import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
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
import { openai } from '@ai-sdk/openai';

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

import { apple } from '@react-native-ai/apple';
import { generateText } from 'ai';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Message = {
    role: 'user' | 'assistant';
    content: string;
    source?: 'openai' | 'apple';
};

const STORAGE_KEY = 'therapyst-messages';

export default function TherapystScreen() {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastModelSource, setLastModelSource] = useState<
        'openai' | 'apple' | null
    >(null);

    const scrollRef = useRef<ScrollView | null>(null);

    useEffect(() => {
        if (!user) {
            router.replace('/login');
        }
    }, [user]);

    useEffect(() => {
        let isMounted = true;

        (async () => {
            try {
                const saved = await AsyncStorage.getItem(STORAGE_KEY);
                if (saved && isMounted) {
                    setMessages(JSON.parse(saved));
                }
            } catch (err) {
                console.error('Failed to load saved messages', err);
            }
        })();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages)).catch(
            (err) => {
                console.error('Failed to persist messages', err);
            },
        );
    }, [messages]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || sending) return;

        const userMessage: Message = { role: 'user', content: trimmed };
        const nextMessages = [...messages, userMessage];
        setMessages(nextMessages);
        setInput('');
        setSending(true);
        setError(null);
        let attemptedSource: 'openai' | 'apple' = 'apple';

        try {
            const prompt = [
                'You are Therapyst, a concise and empathetic therapist.',
                'Keep replies short (2-3 sentences) and actionable.',
                '',
                nextMessages
                    .map((m) => `${m.role === 'user' ? 'User' : 'Therapyst'}: ${m.content}`)
                    .join('\n'),
                'Therapyst:',
            ].join('\n');

            const result = await (async () => {
                try {
                    attemptedSource = 'apple';
                    const response = await generateText({
                        model: apple(),
                        prompt,
                    });
                    return { text: response.text.trim(), source: 'apple' as const };
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
                        'Apple model unavailable, falling back to OpenAI',
                        err,
                    );

                    attemptedSource = 'openai';
                    const fallback = await generateText({
                        model: openai('gpt-4o-mini'),
                        prompt,
                    });
                    return { text: fallback.text.trim(), source: 'openai' as const };
                }
            })();

            const assistantMessage: Message = {
                role: 'assistant',
                content: result.text,
                source: result.source,
            };

            setLastModelSource(result.source);
            setMessages([...nextMessages, assistantMessage]);
        } catch (err) {
            console.error('Failed to send message', err);
            const sourceLabel =
                attemptedSource === 'openai' ? 'OpenAI' : 'On-device';
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
        try {
            await AsyncStorage.removeItem(STORAGE_KEY);
        } catch (err) {
            console.error('Failed to delete chat', err);
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
                        {messages.length === 0 ? (
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
                            messages.map((message, index) => (
                                <View
                                    key={`${message.role}-${index}`}
                                    className={`max-w-[85%] rounded-2xl px-4 py-3 gap-2 ${
                                        message.role === 'user'
                                            ? isDark
                                                ? 'self-end bg-white/10'
                                                : 'self-end bg-black/10'
                                            : isDark
                                            ? 'self-start bg-white/5 border border-white/10'
                                            : 'self-start bg-white border border-black/10'
                                    }`}
                                >
                                    <Text
                                        className={`text-base font-instrument-serif ${
                                            isDark ? 'text-white' : 'text-black'
                                        }`}
                                    >
                                        {message.content}
                                    </Text>
                                    {message.role === 'assistant' ? (
                                        <Text
                                            className={`text-xs font-instrument-serif ${
                                                isDark
                                                    ? 'text-white/60'
                                                    : 'text-black/50'
                                            }`}
                                        >
                                            {message.source === 'openai'
                                                ? 'OpenAI'
                                                : 'On-device'}
                                        </Text>
                                    ) : null}
                                </View>
                            ))
                        )}

                        {error ? (
                            <Text className="text-center font-instrument-serif text-red-500">
                                {error}
                            </Text>
                        ) : null}

                        {sending ? (
                            <View className="items-center">
                                <ActivityIndicator
                                    size="small"
                                    color={isDark ? '#ffffff' : '#000000'}
                                />
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
