import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';
import * as Linking from 'expo-linking';
import {
    configureReanimatedLogger,
    ReanimatedLogLevel,
} from 'react-native-reanimated';

import { useFonts } from 'expo-font';
import '../global.css';

import { AuthProvider } from '../contexts/AuthContext';
import { CryingProvider } from '../contexts/CryingContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

// Configure Reanimated logger
configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: true, // Reanimated runs in strict mode by default
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
    const { resolvedTheme, isDark } = useTheme();

    useEffect(() => {
        const handleUrl = (incomingUrl: string | null) => {
            if (!incomingUrl) return;
            const parsed = Linking.parse(incomingUrl);
            const path = parsed.path ? `/${parsed.path}` : null;
            if (!path) return;

            const searchParams = new URLSearchParams(
                (parsed.queryParams || {}) as Record<string, string>
            ).toString();
            const destination = searchParams ? `${path}?${searchParams}` : path;

            router.replace(destination);
        };

        Linking.getInitialURL().then(handleUrl);
        const sub = Linking.addEventListener('url', ({ url }) =>
            handleUrl(url)
        );
        return () => sub.remove();
    }, []);

    return (
        <View className={`flex-1 ${isDark ? 'dark' : ''}`}>
            <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="home" />
                    <Stack.Screen name="therapyst" />
                    <Stack.Screen name="crying" />
                    <Stack.Screen name="reflections" />
                    <Stack.Screen name="reflection" />
                    <Stack.Screen name="settings" />
                </Stack>
                <StatusBar style={isDark ? 'light' : 'dark'} />
            </NavigationThemeProvider>
        </View>
    );
}

export default function RootLayout() {
    // Load the Instrument Serif font
    const [fontsLoaded] = useFonts({
        'InstrumentSerif-Regular': require('../assets/fonts/InstrumentSerif-Regular.ttf'),
        'InstrumentSerif-Italic': require('../assets/fonts/InstrumentSerif-Italic.ttf'),
    });

    useEffect(() => {
        if (fontsLoaded) {
            // Hide the native splash screen immediately after fonts are loaded
            // Let the custom splash screen handle the timing
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    // Don't render the app until fonts are loaded
    if (!fontsLoaded) {
        return null;
    }

    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <AuthProvider>
                    <CryingProvider>
                        <RootLayoutContent />
                    </CryingProvider>
                </AuthProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
}
