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

export default function ResetPasswordScreen() {
    const { completePasswordReset, isPasswordRecovery } = useAuth();
    const { isDark } = useTheme();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleReset = async () => {
        if (!isPasswordRecovery) {
            setError('Open the reset link from your email to continue.');
            return;
        }

        if (!password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');
        setMessage('');
        try {
            await completePasswordReset(password);
            setMessage('Password updated. Redirecting you home.');
            router.replace('/home');
        } catch (err: any) {
            setError(
                err.message ||
                    'Unable to update password. Please try again shortly.'
            );
        } finally {
            setLoading(false);
        }
    };

    const clearError = () => {
        if (error) setError('');
    };

    const navigateToForgot = () => {
        router.replace('/forgot-password');
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
                        Set a new password
                    </Text>
                    <Text
                        className={`mb-8 italic ${isDark ? 'text-gray-300' : 'text-black'}`}
                    >
                        This screen opens after you tap the reset link in your
                        email.
                    </Text>
                </View>

                <TextInput
                    placeholder="New password"
                    value={password}
                    error={!!error}
                    onChangeText={(text) => {
                        setPassword(text);
                        clearError();
                    }}
                    secureTextEntry
                />

                <TextInput
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    error={!!error}
                    onChangeText={(text) => {
                        setConfirmPassword(text);
                        clearError();
                    }}
                    secureTextEntry
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
                    title="Update password"
                    onPress={handleReset}
                    disabled={!password || !confirmPassword}
                    loading={loading}
                    className="mb-4"
                />

                <View className="flex-row justify-center">
                    <TouchableOpacity onPress={navigateToForgot}>
                        <Text className={isDark ? 'text-white' : 'text-black'}>
                            Need a new link?
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
