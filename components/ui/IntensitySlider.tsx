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
  label = "Intensity Level",
  min = 1,
  max = 10
}: IntensitySliderProps) {
  const getIntensityDescription = (intensity: number) => {
    if (intensity <= 2) return "Very mild";
    if (intensity <= 4) return "Mild";
    if (intensity <= 6) return "Moderate";
    if (intensity <= 8) return "Strong";
    return "Very intense";
  };

  return (
    <View>
      {label && (
        <Text className="text-lg font-instrument-serif mb-3 text-gray-700">
          {label}
        </Text>
      )}
      
      <View className="bg-white rounded-lg p-6 border-2 border-gray-300">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-3xl font-instrument-serif-bold text-black">
            {value}
          </Text>
          <Text className="text-base font-instrument-serif text-gray-600">
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
        
        <View className="flex-row justify-between mt-2">
          <Text className="text-sm font-instrument-serif text-gray-500">
            {min}
          </Text>
          <Text className="text-sm font-instrument-serif text-gray-500">
            {max}
          </Text>
        </View>
      </View>
    </View>
  );
}