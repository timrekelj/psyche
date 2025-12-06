import { Stack } from 'expo-router';

export default function AuthLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="step1_datetime" />
            <Stack.Screen name="step2_emotion" />
            <Stack.Screen name="step3_intensity" />
            <Stack.Screen name="step4_moment_of_joy" />
            <Stack.Screen name="step5_session_saved" />
        </Stack>
    );
}
