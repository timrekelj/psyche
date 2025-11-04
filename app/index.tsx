import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import SplashScreen from '@/components/screens/SplashScreen';
import LoadingScreen from '@/components/screens/LoadingScreen';

export default function Index() {
  const { user, loading, showSplash } = useAuth();

  if (showSplash) {
    return <SplashScreen />;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  // If authenticated, redirect to /home
  // If not authenticated, redirect to login
  return <Redirect href={user ? "/home" : "/(auth)/login"} />;
}
