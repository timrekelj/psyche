import React from 'react';
import { View, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { Button, Text } from '@/components/ui';

export default function EmailConfirmedScreen() {
    const { isDark } = useTheme();

    const navigateToLogin = () => {
        router.replace('/(auth)/login');
    };

    return (
        <KeyboardAvoidingView
            className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                className="flex-1"
                contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'center',
                    paddingHorizontal: 32,
                }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View>
                    <Text
                        className={`mb-4 text-xl ${isDark ? 'text-white' : 'text-black'}`}
                    >
                        Email Confirmed
                    </Text>

                    <Text
                        className={`mb-8 text-sm ${isDark ? 'text-gray-300' : 'text-black'}`}
                    >
                        Your email address is verified. You can sign in and
                        continue.
                    </Text>
                </View>

                <Button
                    title="Back to Login"
                    onPress={navigateToLogin}
                    className="mb-4"
                />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
