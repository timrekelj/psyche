import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { CryingService, CryEntry } from '@/lib/cryingService';
import { Button } from '@/components/ui';
import LoadingScreen from '@/components/screens/LoadingScreen';
import { emotionLabels, formatRelativeDate } from '@/lib/reflectionUtils';

export default function ReflectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [entry, setEntry] = useState<CryEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login');
      return;
    }

    if (!id) {
      router.back();
      return;
    }

    loadEntry();
  }, [user, id]);

  const loadEntry = async () => {
    if (!user || !id) return;

    try {
      const result = await CryingService.getUserCryingSessions(user.id);

      if (result.success && result.data) {
        const foundEntry = result.data.find(entry => entry.id === id);
        if (foundEntry) {
          setEntry(foundEntry);
        } else {
          Alert.alert('Error', 'Reflection not found');
          router.back();
        }
      } else {
        Alert.alert('Error', result.error || 'Failed to load reflection');
        router.back();
      }
    } catch (error) {
      console.error('Error loading entry:', error);
      Alert.alert('Error', 'An unexpected error occurred');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!entry) {
    return (
      <View className="flex-1 bg-white px-6 pt-16 justify-center items-center">
        <Text className="text-lg font-instrument-serif text-center mb-4 text-gray-600">
          Reflection not found
        </Text>
        <Button title="Go Back" onPress={handleClose} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white px-8 py-16">
      <ScrollView className="flex-1 pt-16" showsVerticalScrollIndicator={false}>
        <View className="mb-6">
          <Text className="text-2xl font-instrument-serif text-center mb-4">
            {emotionLabels[entry.emotions] || entry.emotions}
          </Text>

          <View className="p-4 text-center mb-6 items-center">
            <Text className="text-lg font-instrument-serif">
              {emotionLabels[entry.emotions] || entry.emotions}
            </Text>
            <Text className="text-lg font-instrument-serif-italic">
              brought me here {formatRelativeDate(entry.cried_at).toLowerCase()}
            </Text>
          </View>

          <Text className="text-base text-center font-instrument-serif mb-6">
            This feeling was rated {entry.feeling_intensity}/10
          </Text>

          <View className="mb-6">
            <Text className="text-base font-instrument-serif-italic mb-2">
              Other feelings about the session
            </Text>
            <Text className="text-base font-instrument-serif">
              {entry.thoughts}
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-base font-instrument-serif-italic mb-2">
              Reflection
            </Text>
            <Text className="text-base font-instrument-serif">
              {entry.recent_smile_thing}
            </Text>
          </View>
        </View>
      </ScrollView>

      <Button
        title="Close reflection journal"
        onPress={handleClose}
      />
    </View>
  );
}
