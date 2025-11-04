import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { CryingService, CryEntry } from '@/lib/cryingService';
import { Button } from '@/components/ui';
import ReflectionCard from '@/components/ui/ReflectionCard';
import LoadingScreen from '@/components/screens/LoadingScreen';

export default function ReflectionsScreen() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<CryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadEntries = async (showRefreshing = false) => {
    if (!user) return;

    if (showRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const result = await CryingService.getUserCryingSessions(user.id);

      if (result.success && result.data) {
        setEntries(result.data);
      } else {
        Alert.alert('Error', result.error || 'Failed to load your reflections');
      }
    } catch (error) {
      console.error('Error loading entries:', error);
      Alert.alert('Error', 'An unexpected error occurred while loading your reflections');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login');
      return;
    }

    loadEntries();
  }, [user]);

  const handleRefresh = () => {
    loadEntries(true);
  };

  const handleBackToHome = () => {
    router.back();
  };

  const handleEntryPress = (entry: CryEntry) => {
    router.push(`/reflection/${entry.id}`);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 px-8 py-16 bg-white">
      <View className="py-16 px-8 pb-4">
        <Text className="text-2xl font-instrument-serif-bold text-center mb-4">
          reflection journal
        </Text>
        <Text className="text-lg font-instrument-serif-italic text-center text-gray-600 mb-6">
          See your reflections and how you developer over days.
        </Text>
      </View>

      {entries.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg font-instrument-serif text-center mb-4 text-gray-600">
            You haven't recorded any reflections yet.
          </Text>
          <Text className="text-base font-instrument-serif text-center mb-8 text-gray-500">
            When you complete a crying session, it will appear here for you to revisit and reflect upon.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {entries.map((entry) => (
            <ReflectionCard
              key={entry.id}
              entry={entry}
              onPress={() => handleEntryPress(entry)}
            />
          ))}

          <View className="pb-8 pt-4">
            <Text className="text-xs font-instrument-serif text-center text-gray-400 mb-4">
              Pull down to refresh
            </Text>
          </View>
        </ScrollView>
      )}

      <Button
        title="Close reflection journal"
        onPress={handleBackToHome}
      />
    </View>
  );
}
