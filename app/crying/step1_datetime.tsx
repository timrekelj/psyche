import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import { Button, DatePicker, TimePicker } from '@/components/ui';
import { useCrying } from '@/contexts/CryingContext';

export default function CryingStep1() {
  const { sessionData, updateCriedAt } = useCrying();
  const [selectedDate, setSelectedDate] = useState<Date | null>(sessionData.criedAt || new Date());

  const handleNext = () => {
    if (!selectedDate) {
      Alert.alert('Please select a date', 'When did you cry or feel like crying?');
      return;
    }

    updateCriedAt(selectedDate);
    router.push('/crying/step2_emotion');
  };

  const handleDateChange = (date: Date) => {
    if (selectedDate) {
      // Preserve the existing time when changing date
      const newDateTime = new Date(date);
      newDateTime.setHours(selectedDate.getHours());
      newDateTime.setMinutes(selectedDate.getMinutes());
      newDateTime.setSeconds(selectedDate.getSeconds());
      setSelectedDate(newDateTime);
    } else {
      setSelectedDate(date);
    }
  };

  const handleTimeChange = (time: Date) => {
    if (selectedDate) {
      // Preserve the existing date when changing time
      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(time.getHours());
      newDateTime.setMinutes(time.getMinutes());
      newDateTime.setSeconds(time.getSeconds());
      setSelectedDate(newDateTime);
    } else {
      setSelectedDate(time);
    }
  };

  return (
    <View className="flex-1 bg-white px-8 py-16">
      <View className="flex-1 py-16">
        <Text className="text-2xl font-instrument-serif-bold text-center mb-8">
          When did this happen?
        </Text>

        <Text className="text-lg font-instrument-serif text-center mb-8 leading-7">
          Let's start by remembering when you cried or felt like crying.
        </Text>

        <View className="mb-12">
          <View className="gap-4">
            <DatePicker
              value={selectedDate}
              onChange={handleDateChange}
              placeholder="Select date"
            />

            <TimePicker
              value={selectedDate}
              onChange={handleTimeChange}
              placeholder="Select time"
            />
          </View>
        </View>

        <Text className="text-base font-instrument-serif text-center text-gray-600">
          It's okay if you can't remember the exact date and time - choose the closest one you can recall.
        </Text>
      </View>

      <Button
        title="Continue"
        onPress={handleNext}
      />
    </View>
  );
}
