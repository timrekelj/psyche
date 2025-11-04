import React, { useState } from 'react';
import { View, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button, TextInput, Text } from '@/components/ui';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
      router.replace('/home');
    } catch (error: any) {
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const navigateToRegister = () => {
    router.replace('/(auth)/register');
  };

  const clearError = () => {
    if (error) setError('');
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
          <Text className="text-xl mb-8">
            Cry whenever you need. As much as you need
          </Text>
          <Text className="italic mb-8">
            Let it out. Breathe easier. Sleep easier. Science and soul agree-crying heals.
          </Text>
        </View>

        <TextInput
          placeholder="john.doe@example.com"
          value={email}
          error={error ? true : false}
          onChangeText={(text) => {
            setEmail(text);
            clearError();
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Password"
          value={password}
          error={error ? true : false}
          onChangeText={(text) => {
            setPassword(text);
            clearError();
          }}
          secureTextEntry
        />

        {error ? (
          <Text className="text-red-500 text-sm  mb-4 font-instrument-serif">
            {error}
          </Text>
        ) : null}

        <Button
          title="Login"
          onPress={handleLogin}
          disabled={!email || !password}
          loading={loading}
          className="mb-4"
        />

        <View className="flex-row justify-center">
          <TouchableOpacity onPress={navigateToRegister}>
            <Text>or sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
