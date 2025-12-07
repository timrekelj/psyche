import React, { useEffect } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import LoadingScreen from '@/components/screens/LoadingScreen';
import { Button } from '@/components/ui';
import { BookText, Cog } from 'lucide-react-native';

export default function HomeScreen() {
    const { user, loading } = useAuth();
    const { isDark } = useTheme();

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!loading && !user) {
            router.replace('/(auth)/login');
        }
    }, [user, loading]);

    if (loading) {
        return (
            <LoadingScreen
                backgroundColor={isDark ? 'bg-black' : 'bg-white'}
                circleColor={isDark ? '#ffffff' : '#000000'}
            />
        );
    }

    if (!user) {
        return null; // Will redirect in useEffect
    }

    const iconColor = isDark ? '#ffffff' : '#000000';

    return (
        <View
            className={`h-full flex-1 justify-center ${isDark ? 'bg-black' : 'bg-white'}`}
        >
            <View className="mb-[200px] w-full px-10">
                <Text
                    className={`font-instrument-serif-bold mb-4 text-center text-2xl ${
                        isDark ? 'text-white' : 'text-black'
                    }`}
                >
                    psyche
                </Text>
                <Text
                    className={`mb-4 text-center font-instrument-serif-italic text-lg ${
                        isDark ? 'text-gray-300' : 'text-black'
                    }`}
                >
                    A gentle space to feel your emotions. I'm here to sit with
                    you through whatever you're experiencing.
                </Text>
                <Button
                    className="w-full"
                    title="Hi friend, I am here when you need to cry"
                    onPress={() => router.push('/crying/step1_datetime')}
                />

                <TouchableOpacity
                    onPress={() => router.push('/reflections')}
                    className="mt-3 flex-row items-center"
                >
                    <View className="mr-2">
                        <BookText width={20} height={20} color={iconColor} />
                    </View>
                    <Text
                        className={`font-instrument-serif text-lg ${
                            isDark ? 'text-white' : 'text-black'
                        }`}
                    >
                        Past reflections
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => router.push('/settings')}
                    className="mt-3 flex-row items-center"
                >
                    <View className="mr-2">
                        <Cog width={20} height={20} color={iconColor} />
                    </View>
                    <Text
                        className={`font-instrument-serif text-lg ${
                            isDark ? 'text-white' : 'text-black'
                        }`}
                    >
                        Settings
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Circle positioned so only upper half is visible */}
            <View className="absolute bottom-0 h-1/2 w-full items-center">
                <View
                    className={`absolute -bottom-[500px] h-[800px] w-[800px] rounded-full ${
                        isDark ? 'bg-white' : 'bg-black'
                    }`}
                />
                <Image
                    source={
                        isDark
                            ? require('../assets/images/sad_face_black.png')
                            : require('../assets/images/sad_face.png')
                    }
                    className="-bottom-20 w-[200px]"
                    resizeMode="contain"
                />
            </View>
        </View>
    );
}
