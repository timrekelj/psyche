import React, { useState } from 'react';
import { View, ScrollView, Text, Alert, TouchableOpacity, KeyboardAvoidingView, KeyboardAvoidingViewComponent } from 'react-native';
import { router } from 'expo-router';
import { Button, TextInput } from '@/components/ui';
import { useCrying } from '@/contexts/CryingContext';

export default function CryingStep3() {
  const { sessionData, updateIntensityAndThoughts } = useCrying();
  const [intensity, setIntensity] = useState<number>(sessionData.feelingIntensity || 5);
  const [thoughts, setThoughts] = useState<string>(sessionData.thoughts || '');

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
          className={`flex-1 aspect-square rounded-lg border items-center justify-center ${
            intensity === i
              ? 'bg-black border-black'
              : 'bg-white border-gray-300'
          }`}
        >
          <Text className={`text-lg font-instrument-serif-bold ${
            intensity === i ? 'text-white' : 'text-black'
          }`}>
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
          className={`flex-1 aspect-square rounded-lg border items-center justify-center ${
            intensity === i
              ? 'bg-black border-black'
              : 'bg-white border-gray-300'
          }`}
        >
          <Text className={`text-lg font-instrument-serif-bold ${
            intensity === i ? 'text-white' : 'text-black'
          }`}>
            {i}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View className="items-center px-4">
        <View className="flex-row gap-2 mb-2">
          {firstRow}
        </View>
        <View className="flex-row gap-2">
          {secondRow}
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white px-8 py-16">
      <ScrollView className="flex-1 pt-16 pb-8">
        <Text className="text-2xl font-instrument-serif text-center mb-6">
          good job
        </Text>

        <Text className="text-lg font-instrument-serif-italic text-center mb-8 leading-7">
          Take a quick survey so I can be better companion next time you need me.
        </Text>

        <View className="mb-8">
          <Text className="text-lg font-instrument-serif mb-4 text-gray-700">
            How intense was this feeling?
          </Text>

          {renderIntensityGrid()}
        </View>

        <View className="mb-8">
          <Text className="text-lg font-instrument-serif mb-3 text-gray-700">
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

      <Button
        title="Continue"
        onPress={handleNext}
      />
    </View>
  );
}
