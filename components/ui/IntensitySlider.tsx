import React from 'react';
import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';

interface IntensitySliderProps {
    value: number;
    onChange: (value: number) => void;
    label?: string;
    min?: number;
    max?: number;
}

export default function IntensitySlider({
    value,
    onChange,
    label = 'Intensity Level',
    min = 1,
    max = 10,
}: IntensitySliderProps) {
    const getIntensityDescription = (intensity: number) => {
        if (intensity <= 2) return 'Very mild';
        if (intensity <= 4) return 'Mild';
        if (intensity <= 6) return 'Moderate';
        if (intensity <= 8) return 'Strong';
        return 'Very intense';
    };

    return (
        <View>
            {label && (
                <Text className="mb-3 font-instrument-serif text-lg text-gray-700">
                    {label}
                </Text>
            )}

            <View className="rounded-lg border-2 border-gray-300 bg-white p-6">
                <View className="mb-4 flex-row items-center justify-between">
                    <Text className="font-instrument-serif-bold text-3xl text-black">
                        {value}
                    </Text>
                    <Text className="font-instrument-serif text-base text-gray-600">
                        {getIntensityDescription(value)}
                    </Text>
                </View>

                <Slider
                    style={{ width: '100%', height: 40 }}
                    minimumValue={min}
                    maximumValue={max}
                    step={1}
                    value={value}
                    onValueChange={onChange}
                    minimumTrackTintColor="#000000"
                    maximumTrackTintColor="#d1d5db"
                    thumbStyle={{
                        backgroundColor: '#000000',
                        width: 24,
                        height: 24,
                    }}
                />

                <View className="mt-2 flex-row justify-between">
                    <Text className="font-instrument-serif text-sm text-gray-500">
                        {min}
                    </Text>
                    <Text className="font-instrument-serif text-sm text-gray-500">
                        {max}
                    </Text>
                </View>
            </View>
        </View>
    );
}
