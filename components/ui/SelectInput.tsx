import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { EmotionType } from '@/contexts/CryingContext';

interface SelectOption {
  value: EmotionType;
  label: string;
  description?: string;
}

interface SelectInputProps {
  value: EmotionType | null;
  onChange: (value: EmotionType) => void;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
}

export default function SelectInput({
  value,
  onChange,
  options,
  label = "Select an option",
  placeholder = "Choose an option"
}: SelectInputProps) {
  return (
    <View>
      {label && (
        <Text className="text-lg font-instrument-serif mb-4 text-gray-700">
          {label}
        </Text>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            className={`mb-3 p-4 rounded-lg border ${
              value === option.value
                ? 'border-black bg-black'
                : 'border-gray-300 bg-white'
            }`}
          >
            <Text className={`font-instrument-serif text-base ${
              value === option.value ? 'text-white' : 'text-black'
            }`}>
              {option.label}
            </Text>
            {option.description && (
              <Text className={`font-instrument-serif mt-1 text-sm ${
                value === option.value ? 'text-gray-200' : 'text-gray-600'
              }`}>
                {option.description}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
