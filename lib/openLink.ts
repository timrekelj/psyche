import { Alert, Linking } from 'react-native';

export async function openExternalLink(url: string) {
    try {
        const supported = await Linking.canOpenURL(url);

        if (!supported) {
            throw new Error('Unsupported URL');
        }

        await Linking.openURL(url);
    } catch (error) {
        console.error('Failed to open link', error);
        Alert.alert('Unable to open link', 'Please try again later.');
    }
}
