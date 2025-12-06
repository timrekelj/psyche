import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui';

export default function ReflectionsScreen() {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            router.replace('/(auth)/login');
            return;
        }
    }, [user]);

    const handleBackToHome = () => {
        router.back();
    };

    return (
        <View className="flex-1 bg-white px-8 py-16">
            <View className="px-8 py-16 pb-4">
                <Text className="font-instrument-serif-bold mb-4 text-center text-2xl">
                    settings
                </Text>
                <Text className="mb-6 text-center font-instrument-serif-italic text-lg text-gray-600">
                    Settings
                </Text>
            </View>

            <Button title="Close settings" onPress={handleBackToHome} />
        </View>
    );
}
