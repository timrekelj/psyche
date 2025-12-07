import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import { Button, SelectInput } from '@/components/ui';
import { useCrying } from '@/contexts/CryingContext';
import { useTheme } from '@/contexts/ThemeContext';
import { EmotionType } from '@/contexts/CryingContext';

const emotionOptions = [
    {
        value: 'OVERWHELMED' as EmotionType,
        label: 'Overwhelmed',
    },
    {
        value: 'MISSING_SOMEONE' as EmotionType,
        label: 'Missing Someone',
    },
    {
        value: 'STRESS' as EmotionType,
        label: 'Stress',
    },
    {
        value: 'LONELINESS' as EmotionType,
        label: 'Loneliness',
    },
    {
        value: 'RELATIONSHIP_ISSUES' as EmotionType,
        label: 'Relationship Issues',
    },
    {
        value: 'SADNESS' as EmotionType,
        label: 'Sadness',
    },
    {
        value: 'JOY' as EmotionType,
        label: 'Joy',
    },
    {
        value: 'PROUD' as EmotionType,
        label: 'Pride',
    },
    {
        value: 'NO_REASON' as EmotionType,
        label: 'No Specific Reason',
    },
];

export default function CryingStep2() {
    const { sessionData, updateEmotions } = useCrying();
    const { isDark } = useTheme();
    const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(
        sessionData.emotions
    );

    const handleNext = () => {
        if (!selectedEmotion) {
            Alert.alert(
                'Please select an emotion',
                'What were you feeling that led to crying?'
            );
            return;
        }

        updateEmotions(selectedEmotion);
        router.push('/crying/step3_intensity');
    };

    const handleEmotionChange = (emotion: EmotionType) => {
        setSelectedEmotion(emotion);
    };

    return (
        <View
            className={`flex-1 px-8 py-16 ${isDark ? 'bg-black' : 'bg-white'}`}
        >
            <View className="flex-1 py-16">
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

                <View className="mb-8 flex-1">
                    <SelectInput
                        value={selectedEmotion}
                        onChange={handleEmotionChange}
                        options={emotionOptions}
                        label="What brought you here today?"
                    />
                </View>
            </View>

            <Button
                title="Continue"
                disabled={!selectedEmotion}
                onPress={handleNext}
            />
        </View>
    );
}
