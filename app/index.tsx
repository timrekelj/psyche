import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import SplashScreen from '../components/screens/SplashScreen';
import LoadingScreen from '@/components/screens/LoadingScreen';

export default function Index() {
    const { user, loading, showSplash } = useAuth();
    const { isDark } = useTheme();

    if (showSplash) {
        return <SplashScreen />;
    }

    if (loading) {
        return (
            <LoadingScreen
                backgroundColor={isDark ? 'bg-black' : 'bg-white'}
                circleColor={isDark ? '#ffffff' : '#000000'}
            />
        );
    }

    // If authenticated, redirect to /home
    // If not authenticated, redirect to login
    return <Redirect href={user ? '/home' : '/login'} />;
}
