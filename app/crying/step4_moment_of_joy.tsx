import React, { useState } from 'react';
import { View, Text, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Button, TextInput } from '@/components/ui';
import { useCrying } from '@/contexts/CryingContext';
import { useAuth } from '@/contexts/AuthContext';
import { CryingService } from '@/lib/cryingService';

export default function CryingStep4() {
  const { sessionData, updateRecentSmileThing } = useCrying();
  const { user } = useAuth();
  const [recentSmileThing, setRecentSmileThing] = useState<string>(sessionData.recentSmileThing || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async () => {
    if (!recentSmileThing.trim()) {
      Alert.alert('Please share something', 'What made you smile recently, even if it was small?');
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
        recentSmileThing: recentSmileThing.trim()
      };

      // Save to Supabase
      const result = await CryingService.saveCryingSession(user.id, completeSessionData);

      if (result.success) {
        router.push('/crying/step5_session_saved');
      } else {
        Alert.alert(
          'Error Saving',
          result.error || 'Failed to save your session. Please try again.',
          [
            {
              text: 'Try Again',
              onPress: () => setIsLoading(false)
            },
            {
              text: 'Skip for Now',
              onPress: () => router.push('/crying/step5_session_saved')
            }
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
            onPress: () => setIsLoading(false)
          },
          {
            text: 'Skip for Now',
            onPress: () => router.push('/crying/step5_session_saved')
          }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-8 py-16">
      <ScrollView className="flex-1 pt-16">
        <Text className="text-2xl font-instrument-serif text-center mb-6">
          reflection space
        </Text>

        <Text className="text-lg font-instrument-serif-italic text-center mb-8 leading-7">
          What's one thing that made you smile recently?
        </Text>

        <View className="mb-8">
          <Text className="text-lg font-instrument-serif mb-3 text-gray-700">
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
        title={"Save & Continue"}
        onPress={handleNext}
        loading={isLoading}
        disabled={isLoading}
      />
    </View>
  );
}
