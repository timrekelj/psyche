import { Redirect } from 'expo-router';

export default function NotFound() {
    // Fallback for unknown or host-only deep links; send to app root
    return <Redirect href="/" />;
}
