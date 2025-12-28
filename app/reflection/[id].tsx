import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { CryingService, CryEntry } from '../../lib/cryingService';
import { Button } from '@/components/ui';
import LoadingScreen from '@/components/screens/LoadingScreen';
import { emotionLabels, formatRelativeDate } from '@/lib/reflectionUtils';

export default function ReflectionDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user } = useAuth();
    const { isDark } = useTheme();
    const [entry, setEntry] = useState<CryEntry | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.replace('/login');
            return;
        }

        if (!id) {
            router.back();
            return;
        }

        loadEntry();
    }, [user, id]);

    const loadEntry = async () => {
        if (!user || !id) return;

        try {
            const result = await CryingService.getUserCryingSessions(user.id);

            if (result.success && result.data) {
                const foundEntry = result.data.find((entry) => entry.id === id);
                if (foundEntry) {
                    setEntry(foundEntry);
                } else {
                    Alert.alert('Error', 'Reflection not found');
                    router.back();
                }
            } else {
                Alert.alert(
                    'Error',
                    result.error || 'Failed to load reflection'
                );
                router.back();
            }
        } catch (error) {
            console.error('Error loading entry:', error);
            Alert.alert('Error', 'An unexpected error occurred');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        router.back();
    };

    if (loading) {
        return (
            <LoadingScreen
                backgroundColor={isDark ? 'bg-black' : 'bg-white'}
                circleColor={isDark ? '#ffffff' : '#000000'}
            />
        );
    }

    if (!entry) {
        return (
            <View
                className={`flex-1 items-center justify-center px-6 pt-16 ${
                    isDark ? 'bg-black' : 'bg-white'
                }`}
            >
                <Text
                    className={`mb-4 text-center font-instrument-serif text-lg ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}
                >
                    Reflection not found
                </Text>
                <Button title="Go Back" onPress={handleClose} />
            </View>
        );
    }

    return (
        <View
            className={`flex-1 px-8 py-16 ${isDark ? 'bg-black' : 'bg-white'}`}
        >
            <ScrollView
                className="flex-1 pt-16"
                showsVerticalScrollIndicator={false}
            >
                <View className="mb-6">
                    <Text
                        className={`mb-4 text-center font-instrument-serif text-2xl ${
                            isDark ? 'text-white' : 'text-black'
                        }`}
                    >
                        {emotionLabels[entry.emotions] || entry.emotions}
                    </Text>

                    <View className="mb-6 items-center p-4 text-center">
                        <Text
                            className={`font-instrument-serif text-lg ${
                                isDark ? 'text-white' : 'text-black'
                            }`}
                        >
                            {emotionLabels[entry.emotions] || entry.emotions}
                        </Text>
                        <Text
                            className={`font-instrument-serif-italic text-lg ${
                                isDark ? 'text-gray-300' : 'text-black'
                            }`}
                        >
                            brought me here{' '}
                            {formatRelativeDate(entry.cried_at).toLowerCase()}
                        </Text>
                    </View>

                    <Text
                        className={`mb-6 text-center font-instrument-serif text-base ${
                            isDark ? 'text-gray-300' : 'text-black'
                        }`}
                    >
                        This feeling was rated {entry.feeling_intensity}/10
                    </Text>

                    <View className="mb-6">
                        <Text
                            className={`mb-2 font-instrument-serif-italic text-base ${
                                isDark ? 'text-gray-400' : 'text-black'
                            }`}
                        >
                            Other feelings about the session
                        </Text>
                        <Text
                            className={`font-instrument-serif text-base ${
                                isDark ? 'text-white' : 'text-black'
                            }`}
                        >
                            {entry.thoughts}
                        </Text>
                    </View>

                    <View className="mb-6">
                        <Text
                            className={`mb-2 font-instrument-serif-italic text-base ${
                                isDark ? 'text-gray-400' : 'text-black'
                            }`}
                        >
                            Reflection
                        </Text>
                        <Text
                            className={`font-instrument-serif text-base ${
                                isDark ? 'text-white' : 'text-black'
                            }`}
                        >
                            {entry.recent_smile_thing}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <Button title="Close reflection journal" onPress={handleClose} />
        </View>
    );
}
