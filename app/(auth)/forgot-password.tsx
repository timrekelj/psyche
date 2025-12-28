import React, { useState } from 'react';
import {
    View,
    TouchableOpacity,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Button, TextInput, Text } from '@/components/ui';

export default function ForgotPasswordScreen() {
    const { resetPassword } = useAuth();
    const { isDark } = useTheme();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSendLink = async () => {
        if (!email) {
            setError('Please enter your email');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');
        try {
            await resetPassword(email.trim());
            setMessage(
                'Password reset link sent. Check your email to continue.'
            );
        } catch (err: any) {
            setError(
                err.message ||
                    'Unable to send reset email. Please try again shortly.'
            );
        } finally {
            setLoading(false);
        }
    };

    const navigateToLogin = () => {
        router.replace('/login');
    };

    const clearError = () => {
        if (error) setError('');
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
                        className={`mb-8 text-xl ${isDark ? 'text-white' : 'text-black'}`}
                    >
                        Forgot your password?
                    </Text>
                    <Text
                        className={`mb-8 italic ${isDark ? 'text-gray-300' : 'text-black'}`}
                    >
                        We'll email you a secure link to set a new one.
                    </Text>
                </View>

                <TextInput
                    placeholder="Enter your email"
                    value={email}
                    error={!!error}
                    onChangeText={(text) => {
                        setEmail(text);
                        clearError();
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                {error ? (
                    <Text className="mb-4 font-instrument-serif text-sm text-red-500">
                        {error}
                    </Text>
                ) : null}

                {message ? (
                    <Text className="mb-4 font-instrument-serif text-sm text-green-500">
                        {message}
                    </Text>
                ) : null}

                <Button
                    title="Send reset link"
                    onPress={handleSendLink}
                    disabled={!email}
                    loading={loading}
                    className="mb-4"
                />

                <View className="flex-row justify-center">
                    <TouchableOpacity onPress={navigateToLogin}>
                        <Text className={isDark ? 'text-white' : 'text-black'}>
                            Back to login
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
