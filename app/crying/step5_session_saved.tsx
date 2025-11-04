import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { Button } from '@/components/ui';
import { useCrying } from '@/contexts/CryingContext';

export default function CryingStep5() {
  const { resetSession } = useCrying();

  useEffect(() => {
    // Auto-navigate to home after 10 seconds
    const timer = setTimeout(() => {
      handleGoHome();
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const handleGoHome = () => {
    resetSession(); // Clear the session data
    router.push('/home');
  };

  return (
    <View className="flex-1 bg-white px-6 py-16">
      <View className="flex-1 pt-16">
        <Text className="text-2xl font-instrument-serif-bold text-center mb-6">
          Your session has been saved
        </Text>

        <Text className="text-lg font-instrument-serif text-center mb-8 leading-7">
          Thank you for sharing your feelings with me. Your emotions are valid, and you've taken a brave step by acknowledging them.
        </Text>
      </View>

      <Button
        title="Return Home"
        onPress={handleGoHome}
      />
    </View>
  );
}
