import React, { useEffect } from 'react';
import { View, Text, Alert, Image, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/screens/LoadingScreen';
import { Button } from '@/components/ui';
import { BookIcon, SettingsIcon } from '@/components/icons';

export default function HomeScreen() {
  const { user, signOut, loading } = useAuth();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.replace('/(auth)/login');
    }
  }, [user, loading]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/login');
            } catch (error: any) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
      <View className="flex-1 bg-white justify-center">
        <View className="w-full px-10 mb-[200px]">
          <Text className="text-2xl text-center font-instrument-serif-bold mb-4">psyche</Text>
          <Text className="text-center mb-4 text-lg font-instrument-serif-italic">
            A gentle space to feel your emotions. I'm here to sit with you through whatever you're experiencing.
          </Text>
          <Button
            className="w-full"
            title="Hi friend, I am here when you need to cry"
            onPress={() => router.push('/crying/step1_datetime')}
          />

          <TouchableOpacity
            onPress={() => router.push('/reflections')}
            className="mt-3 flex-row items-center"
          >
            <View className="mr-2">
              <BookIcon width={20} height={20} color="black" />
            </View>
            <Text className="text-lg font-instrument-serif text-black">
              Past reflections
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/settings')}
            className="mt-3 flex-row items-center"
          >
            <View className="mr-2">
              <SettingsIcon width={20} height={20} color="black" />
            </View>
            <Text className="text-lg font-instrument-serif text-black">
              Settings
            </Text>
          </TouchableOpacity>
        </View>

        {/* Circle positioned so only upper half is visible */}
        <View className="absolute bottom-0 w-full items-center">
          <View className="rounded-full w-[800px] h-[800px] bg-black absolute -bottom-[550px]"/>
          <Image
            source={require('../assets/images/sad_face.png')}
            className="absolute bottom-[50px] w-[150px]"
            resizeMode="contain"
          />
        </View>
      </View>
  );
}
