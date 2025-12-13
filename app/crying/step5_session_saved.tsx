import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui';
import { useCrying } from '@/contexts/CryingContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function CryingStep5() {
    const { resetSession } = useCrying();
    const { isDark } = useTheme();

    useEffect(() => {
        // Auto-navigate to home after 10 seconds
        const timer = setTimeout(() => {
            handleGoHome();
        }, 10000);
        return () => clearTimeout(timer);
    }, []);

    const handleGoHome = () => {
        resetSession(); // Clear the session data
        router.replace('/home');
    };

    return (
        <View
            className={`flex-1 px-6 py-16 ${isDark ? 'bg-black' : 'bg-white'}`}
        >
            <View className="flex-1 pt-16">
                <Text
                    className={`font-instrument-serif-bold mb-6 text-center text-2xl ${
                        isDark ? 'text-white' : 'text-black'
                    }`}
                >
                    Your session has been saved
                </Text>

                <Text
                    className={`mb-8 text-center font-instrument-serif text-lg leading-7 ${
                        isDark ? 'text-gray-300' : 'text-black'
                    }`}
                >
                    Thank you for sharing your feelings with me. Your emotions
                    are valid, and you've taken a brave step by acknowledging
                    them.
                </Text>
            </View>

            <Button title="Return Home" onPress={handleGoHome} />
        </View>
    );
}
