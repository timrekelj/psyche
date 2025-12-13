import React, { useState } from 'react';
import {
    View,
    ScrollView,
    Text,
    Alert,
    TouchableOpacity,
    KeyboardAvoidingView,
    KeyboardAvoidingViewComponent,
} from 'react-native';
import { router } from 'expo-router';
import { Button, TextInput } from '@/components/ui';
import { useCrying } from '@/contexts/CryingContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function CryingStep3() {
    const { sessionData, updateIntensityAndThoughts } = useCrying();
    const { isDark } = useTheme();
    const [intensity, setIntensity] = useState<number>(
        sessionData.feelingIntensity || 5
    );
    const [thoughts, setThoughts] = useState<string>(
        sessionData.thoughts || ''
    );

    const handleNext = () => {
        updateIntensityAndThoughts(intensity, thoughts.trim());
        router.push('/crying/step4_moment_of_joy');
    };

    const renderIntensityGrid = () => {
        const squares = [];

        const firstRow = [];
        for (let i = 1; i <= 5; i++) {
            firstRow.push(
                <TouchableOpacity
                    key={i}
                    onPress={() => setIntensity(i)}
                    className={`aspect-square flex-1 items-center justify-center rounded-lg border ${
                        intensity === i
                            ? isDark
                                ? 'border-white bg-white'
                                : 'border-black bg-black'
                            : isDark
                              ? 'border-gray-600 bg-black'
                              : 'border-gray-300 bg-white'
                    }`}
                >
                    <Text
                        className={`font-instrument-serif-bold text-lg ${
                            intensity === i
                                ? isDark
                                    ? 'text-black'
                                    : 'text-white'
                                : isDark
                                  ? 'text-white'
                                  : 'text-black'
                        }`}
                    >
                        {i}
                    </Text>
                </TouchableOpacity>
            );
        }

        // Second row (6-10)
        const secondRow = [];
        for (let i = 6; i <= 10; i++) {
            secondRow.push(
                <TouchableOpacity
                    key={i}
                    onPress={() => setIntensity(i)}
                    className={`aspect-square flex-1 items-center justify-center rounded-lg border ${
                        intensity === i
                            ? isDark
                                ? 'border-white bg-white'
                                : 'border-black bg-black'
                            : isDark
                              ? 'border-gray-600 bg-black'
                              : 'border-gray-300 bg-white'
                    }`}
                >
                    <Text
                        className={`font-instrument-serif-bold text-lg ${
                            intensity === i
                                ? isDark
                                    ? 'text-black'
                                    : 'text-white'
                                : isDark
                                  ? 'text-white'
                                  : 'text-black'
                        }`}
                    >
                        {i}
                    </Text>
                </TouchableOpacity>
            );
        }

        return (
            <View className="items-center px-4">
                <View className="mb-2 flex-row gap-2">{firstRow}</View>
                <View className="flex-row gap-2">{secondRow}</View>
            </View>
        );
    };

    return (
        <View
            className={`flex-1 px-8 py-16 ${isDark ? 'bg-black' : 'bg-white'}`}
        >
            <ScrollView className="flex-1 pb-8 pt-16">
                <Text
                    className={`mb-6 text-center font-instrument-serif text-2xl ${
                        isDark ? 'text-white' : 'text-black'
                    }`}
                >
                    good job
                </Text>

                <Text
                    className={`mb-8 text-center font-instrument-serif-italic text-lg leading-7 ${
                        isDark ? 'text-gray-300' : 'text-black'
                    }`}
                >
                    Take a quick survey so I can be better companion next time
                    you need me.
                </Text>

                <View className="mb-8">
                    <Text
                        className={`mb-4 font-instrument-serif text-lg ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}
                    >
                        How intense was this feeling?
                    </Text>

                    {renderIntensityGrid()}
                </View>

                <View className="mb-8">
                    <Text
                        className={`mb-3 font-instrument-serif text-lg ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}
                    >
                        How are you feeling after this session?
                    </Text>
                    <TextInput
                        value={thoughts}
                        onChangeText={setThoughts}
                        placeholder="Any other thoughts?"
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                        scrollEnabled={true}
                        style={{ height: 120 }}
                    />
                </View>
            </ScrollView>

            <Button title="Continue" onPress={handleNext} />
        </View>
    );
}
