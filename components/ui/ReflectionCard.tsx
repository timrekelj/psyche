import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CryEntry } from '@/lib/cryingService';
import { emotionLabels, formatRelativeDate } from '@/lib/reflectionUtils';

interface ReflectionCardProps {
  entry: CryEntry;
  onPress: () => void;
}

export default function ReflectionCard({ entry, onPress }: ReflectionCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-lg p-5 mb-4 border border-gray-200"
    >
      <View className="flex-row justify-between items-center">
        <Text className="text-lg font-instrument-serif-bold text-black">
          {emotionLabels[entry.emotions] || entry.emotions}
        </Text>
        <Text className="text-sm font-instrument-serif text-gray-400">
          {formatRelativeDate(entry.cried_at)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
