import React, { useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Button, TextInput } from '@/components/ui';
import { useCrying } from '../../contexts/CryingContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { CryingService } from '@/lib/cryingService';

export default function CryingStep4() {
    const { sessionData, updateRecentSmileThing } = useCrying();
    const { user } = useAuth();
    const { isDark } = useTheme();
    const [recentSmileThing, setRecentSmileThing] = useState<string>(
        sessionData.recentSmileThing || ''
    );
    const [isLoading, setIsLoading] = useState(false);

    const handleNext = async () => {
        if (!recentSmileThing.trim()) {
            Alert.alert(
                'Please share something',
                'What made you smile recently, even if it was small?'
            );
            return;
        }

        if (!user) {
            Alert.alert('Error', 'You must be logged in to save your session.');
            return;
        }

        setIsLoading(true);

        try {
            // Update the session data
            updateRecentSmileThing(recentSmileThing.trim());

            // Create the complete session data
            const completeSessionData = {
                ...sessionData,
                recentSmileThing: recentSmileThing.trim(),
            };

            // Save to Supabase
            const result = await CryingService.saveCryingSession(
                user.id,
                completeSessionData
            );

            if (result.success) {
                router.push('/crying/step5_session_saved');
            } else {
                Alert.alert(
                    'Error Saving',
                    result.error ||
                        'Failed to save your session. Please try again.',
                    [
                        {
                            text: 'Try Again',
                            onPress: () => setIsLoading(false),
                        },
                        {
                            text: 'Skip for Now',
                            onPress: () =>
                                router.push('/crying/step5_session_saved'),
                        },
                    ]
                );
            }
        } catch (error) {
            console.error('Error in handleNext:', error);
            Alert.alert(
                'Unexpected Error',
                'Something went wrong while saving. Please try again.',
                [
                    {
                        text: 'Try Again',
                        onPress: () => setIsLoading(false),
                    },
                    {
                        text: 'Skip for Now',
                        onPress: () =>
                            router.push('/crying/step5_session_saved'),
                    },
                ]
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View
            className={`flex-1 px-8 py-16 ${isDark ? 'bg-black' : 'bg-white'}`}
        >
            <ScrollView className="flex-1 pt-16">
                <Text
                    className={`mb-6 text-center font-instrument-serif text-2xl ${
                        isDark ? 'text-white' : 'text-black'
                    }`}
                >
                    reflection space
                </Text>

                <Text
                    className={`mb-8 text-center font-instrument-serif-italic text-lg leading-7 ${
                        isDark ? 'text-gray-300' : 'text-black'
                    }`}
                >
                    What's one thing that made you smile recently?
                </Text>

                <View className="mb-8">
                    <Text
                        className={`mb-3 font-instrument-serif text-lg ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}
                    >
                        Something that made you smile
                    </Text>
                    <TextInput
                        value={recentSmileThing}
                        onChangeText={setRecentSmileThing}
                        placeholder="A song, a memory, a pet, a friend's message, a beautiful sunset..."
                        multiline
                        numberOfLines={10}
                        textAlignVertical="top"
                        style={{ height: 300 }}
                    />
                </View>
            </ScrollView>

            <Button
                title={'Save & Continue'}
                onPress={handleNext}
                loading={isLoading}
                disabled={isLoading}
            />
        </View>
    );
}
