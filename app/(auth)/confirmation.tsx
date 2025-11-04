import React from 'react';
import { View, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Button, Text } from '@/components/ui';

export default function ConfirmationScreen() {
  const navigateToLogin = () => {
    router.replace('/(auth)/login');
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Text className="text-xl mb-4">
            Check Your Email
          </Text>

          <Text className="text-sm mb-8">
            Don't see the email? Check your spam folder or wait a few minutes for it to arrive.
          </Text>
        </View>

        <Button
          title="Back to Login"
          onPress={navigateToLogin}
          className="mb-4"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
