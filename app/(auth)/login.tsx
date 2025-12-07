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
import { Button, TextInput, Text } from '@/components/ui';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { signIn } = useAuth();
    const { isDark } = useTheme();

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await signIn(email, password);
            router.replace('/home');
        } catch (error: any) {
            setError(error.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const navigateToRegister = () => {
        router.replace('/(auth)/register');
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
                    placeholder="john.doe@example.com"
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
                    placeholder="Password"
                    value={password}
                    error={error ? true : false}
                    onChangeText={(text) => {
                        setPassword(text);
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
                    title="Login"
                    onPress={handleLogin}
                    disabled={!email || !password}
                    loading={loading}
                    className="mb-4"
                />

                <View className="flex-row justify-center">
                    <TouchableOpacity onPress={navigateToRegister}>
                        <Text className={isDark ? 'text-white' : 'text-black'}>
                            or sign up
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
