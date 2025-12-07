import React, { useEffect } from 'react';
import { View, Text, Alert, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui';
import LoadingScreen from '@/components/screens/LoadingScreen';
import { Sun, Moon, Smartphone, Check } from 'lucide-react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeOptionProps {
    mode: ThemeMode;
    label: string;
    icon: React.ReactNode;
    isSelected: boolean;
    onPress: () => void;
    isDark: boolean;
}

function ThemeOption({
    mode,
    label,
    icon,
    isSelected,
    onPress,
    isDark,
}: ThemeOptionProps) {
    return (
        <Pressable
            onPress={onPress}
            className={`mb-2 flex-row items-center justify-between rounded-lg px-4 py-4 ${
                isSelected
                    ? isDark
                        ? 'bg-white/10'
                        : 'bg-black/5'
                    : isDark
                      ? 'bg-white/5'
                      : 'bg-gray-50'
            }`}
        >
            <View className="flex-row items-center">
                <View className="mr-3">{icon}</View>
                <Text
                    className={`font-instrument-serif text-lg ${
                        isDark ? 'text-white' : 'text-black'
                    }`}
                >
                    {label}
                </Text>
            </View>
            {isSelected && (
                <Check
                    width={20}
                    height={20}
                    color={isDark ? '#ffffff' : '#000000'}
                />
            )}
        </Pressable>
    );
}

export default function SettingsScreen() {
    const { user, signOut, loading } = useAuth();
    const { theme, setTheme, isDark } = useTheme();

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/(auth)/login');
        }
    }, [user, loading]);

    if (loading) {
        return <LoadingScreen />;
    }

    const handleBackToHome = () => {
        router.back();
    };

    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await signOut();
                        router.replace('/(auth)/login');
                    } catch (error: any) {
                        Alert.alert(
                            'Error',
                            'Failed to logout. Please try again.'
                        );
                    }
                },
            },
        ]);
    };

    const handleThemeChange = async (newTheme: ThemeMode) => {
        try {
            await setTheme(newTheme);
        } catch (error) {
            Alert.alert('Error', 'Failed to save theme preference.');
        }
    };

    const iconColor = isDark ? '#ffffff' : '#000000';

    return (
        <View
            className={`flex-1 px-8 py-16 ${isDark ? 'bg-black' : 'bg-white'}`}
        >
            <View className="px-8 py-16 pb-4">
                <Text
                    className={`font-instrument-serif-bold mb-4 text-center text-2xl ${
                        isDark ? 'text-white' : 'text-black'
                    }`}
                >
                    settings
                </Text>
            </View>

            {/* Theme Section */}
            <View className="mb-8">
                <Text
                    className={`mb-4 font-instrument-serif-italic text-lg ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}
                >
                    Appearance
                </Text>

                <ThemeOption
                    mode="light"
                    label="Light"
                    icon={<Sun width={22} height={22} color={iconColor} />}
                    isSelected={theme === 'light'}
                    onPress={() => handleThemeChange('light')}
                    isDark={isDark}
                />

                <ThemeOption
                    mode="dark"
                    label="Dark"
                    icon={<Moon width={22} height={22} color={iconColor} />}
                    isSelected={theme === 'dark'}
                    onPress={() => handleThemeChange('dark')}
                    isDark={isDark}
                />

                <ThemeOption
                    mode="system"
                    label="System"
                    icon={
                        <Smartphone width={22} height={22} color={iconColor} />
                    }
                    isSelected={theme === 'system'}
                    onPress={() => handleThemeChange('system')}
                    isDark={isDark}
                />
            </View>

            {/* Logout Button */}
            <View className="mb-4">
                <Pressable
                    onPress={handleLogout}
                    className={`rounded-lg px-4 py-4 ${
                        isDark ? 'bg-red-900/30' : 'bg-red-50'
                    }`}
                >
                    <Text
                        className={`text-center font-instrument-serif text-lg ${
                            isDark ? 'text-red-400' : 'text-red-600'
                        }`}
                    >
                        Logout
                    </Text>
                </Pressable>
            </View>

            <View className="mt-auto">
                <Button title="Close settings" onPress={handleBackToHome} />
            </View>
        </View>
    );
}
