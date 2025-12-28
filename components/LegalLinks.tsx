import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from '../constants/legal';
import { openExternalLink } from '../lib/openLink';
import { Text } from './ui';

interface LegalLinksProps {
    className?: string;
}

export default function LegalLinks({ className = '' }: LegalLinksProps) {
    const { isDark } = useTheme();
    const descriptionColor = isDark ? 'text-gray-300' : 'text-gray-600';
    const linkColor = isDark ? 'text-white' : 'text-black';

    return (
        <View className={`mt-6 flex-row flex-wrap justify-center ${className}`}>
            <Text className={`text-sm ${descriptionColor}`}>
                By continuing, you agree to our
            </Text>
            <Pressable
                onPress={() => openExternalLink(TERMS_OF_SERVICE_URL)}
                className="mx-1"
            >
                <Text variant="link" className={`text-sm ${linkColor}`}>
                    Terms of Service
                </Text>
            </Pressable>
            <Text className={`text-sm ${descriptionColor}`}>and</Text>
            <Pressable
                onPress={() => openExternalLink(PRIVACY_POLICY_URL)}
                className="mx-1"
            >
                <Text variant="link" className={`text-sm ${linkColor}`}>
                    Privacy Policy
                </Text>
            </Pressable>
            <Text className={`text-sm ${descriptionColor}`}>.</Text>
        </View>
    );
}
