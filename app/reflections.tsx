import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { CryingService, CryEntry } from '@/lib/cryingService';
import { Button } from '@/components/ui';
import ReflectionCard from '@/components/ui/ReflectionCard';
import LoadingScreen from '@/components/screens/LoadingScreen';

export default function ReflectionsScreen() {
    const { user } = useAuth();
    const [entries, setEntries] = useState<CryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadEntries = async (showRefreshing = false) => {
        if (!user) return;

        if (showRefreshing) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const result = await CryingService.getUserCryingSessions(user.id);

            if (result.success && result.data) {
                setEntries(result.data);
            } else {
                Alert.alert(
                    'Error',
                    result.error || 'Failed to load your reflections'
                );
            }
        } catch (error) {
            console.error('Error loading entries:', error);
            Alert.alert(
                'Error',
                'An unexpected error occurred while loading your reflections'
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (!user) {
            router.replace('/(auth)/login');
            return;
        }

        loadEntries();
    }, [user]);

    const handleRefresh = () => {
        loadEntries(true);
    };

    const handleBackToHome = () => {
        router.back();
    };

    const handleEntryPress = (entry: CryEntry) => {
        router.push(`/reflection/${entry.id}`);
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <View className="flex-1 bg-white px-8 py-16">
            <View className="px-8 py-16 pb-4">
                <Text className="font-instrument-serif-bold mb-4 text-center text-2xl">
                    reflection journal
                </Text>
                <Text className="mb-6 text-center font-instrument-serif-italic text-lg text-gray-600">
                    See your reflections and how you developer over days.
                </Text>
            </View>

            {entries.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <Text className="mb-4 text-center font-instrument-serif text-lg text-gray-600">
                        You haven't recorded any reflections yet.
                    </Text>
                    <Text className="mb-8 text-center font-instrument-serif text-base text-gray-500">
                        When you complete a crying session, it will appear here
                        for you to revisit and reflect upon.
                    </Text>
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                        />
                    }
                >
                    {entries.map((entry) => (
                        <ReflectionCard
                            key={entry.id}
                            entry={entry}
                            onPress={() => handleEntryPress(entry)}
                        />
                    ))}

                    <View className="pb-8 pt-4">
                        <Text className="mb-4 text-center font-instrument-serif text-xs text-gray-400">
                            Pull down to refresh
                        </Text>
                    </View>
                </ScrollView>
            )}

            <Button
                title="Close reflection journal"
                onPress={handleBackToHome}
            />
        </View>
    );
}
