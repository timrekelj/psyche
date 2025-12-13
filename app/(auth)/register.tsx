import React, { useState } from 'react';
import {
    View,
    TouchableOpacity,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import LegalLinks from '@/components/LegalLinks';
import { Button, TextInput, Text } from '@/components/ui';

export default function RegisterScreen() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { signUp } = useAuth();
    const { isDark } = useTheme();

    const handleRegister = async () => {
        if (
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !confirmPassword
        ) {
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
        try {
            await signUp(email, password, firstName, lastName);
            router.replace('/(auth)/confirmation');
        } catch (error: any) {
            setError(error.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const navigateToLogin = () => {
        router.replace('/(auth)/login');
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
                        Cry whenever you need. As much as you need
                    </Text>
                    <Text
                        className={`mb-8 italic ${isDark ? 'text-gray-300' : 'text-black'}`}
                    >
                        Let it out. Breathe easier. Sleep easier. Science and
                        soul agree-crying heals.
                    </Text>
                </View>

                <TextInput
                    placeholder="Enter your first name"
                    value={firstName}
                    error={error ? true : false}
                    onChangeText={(text) => {
                        setFirstName(text);
                        clearError();
                    }}
                />

                <TextInput
                    placeholder="Enter your last name"
                    value={lastName}
                    error={error ? true : false}
                    onChangeText={(text) => {
                        setLastName(text);
                        clearError();
                    }}
                />

                <TextInput
                    placeholder="Enter your email"
                    value={email}
                    error={error ? true : false}
                    onChangeText={(text) => {
                        setEmail(text);
                        clearError();
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <TextInput
                    placeholder="Enter your password"
                    value={password}
                    error={error ? true : false}
                    onChangeText={(text) => {
                        setPassword(text);
                        clearError();
                    }}
                    secureTextEntry
                />

                <TextInput
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    error={error ? true : false}
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

                <Button
                    title="Create Account"
                    onPress={handleRegister}
                    loading={loading}
                    disabled={
                        !firstName ||
                        !lastName ||
                        !email ||
                        !password ||
                        !confirmPassword
                    }
                    className="mb-4"
                />

                <LegalLinks className='mb-4' />

                <View className="flex-row justify-center">
                    <TouchableOpacity onPress={navigateToLogin}>
                        <Text className={isDark ? 'text-white' : 'text-black'}>
                            or sign in
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
