import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button, Text, TextInput } from '@/components/ui';
import {
    EncryptionStatus,
    getEncryptionStatus,
    resetEncryptedDataAndCreateKey,
} from '@/lib/userEncryption';
import {
    InvalidRecoveryKeyError,
    parseRecoveryKeyString,
    storeCandidateKey,
} from '@/lib/clientEncryption';
import { setEncryptionSetupComplete } from '@/lib/encryptionDevice';

export default function EncryptionKeyImportScreen() {
    const { user } = useAuth();
    const { isDark } = useTheme();

    const [status, setStatus] = useState<EncryptionStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [resetting, setResetting] = useState(false);

    const [importValue, setImportValue] = useState('');

    const load = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const nextStatus = await getEncryptionStatus(user.id);
            if (nextStatus.status === 'needs_backup') {
                router.replace('/encryption-key-save' as any);
                return;
            }

            setStatus(nextStatus);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to load encryption status.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) {
            router.replace('/login');
            return;
        }

        load();
    }, [user?.id]);

    const canContinue = status?.status === 'ready';

    const handleImport = async () => {
        if (!user) return;

        const trimmed = importValue.trim();
        if (!trimmed) {
            Alert.alert('Missing key', 'Paste your recovery key to import it.');
            return;
        }

        try {
            const parsed = parseRecoveryKeyString(trimmed);
            await storeCandidateKey(user.id, parsed.key);

            if (parsed.userId !== user.id) {
                Alert.alert(
                    'Warning',
                    'This key appears to belong to a different account. It will be kept, but will not unlock your data unless it matches.'
                );
                await load();
            } else {
                if (!user || !canContinue) return;

                await setEncryptionSetupComplete(user.id, true);
                router.replace('/home');
            }

            await load();
        } catch (error) {
            if (error instanceof InvalidRecoveryKeyError) {
                Alert.alert('Invalid key', error.message);
                return;
            }

            Alert.alert('Error', 'Failed to import the recovery key.');
        }
    };

    const resetAndRedirect = async () => {
        if (!user) return;

        setResetting(true);
        try {
            await resetEncryptedDataAndCreateKey(user.id);
            router.replace('/encryption-key-save' as any);
        } catch (error: any) {
            Alert.alert(
                'Error',
                error.message || 'Failed to reset encrypted data.'
            );
        } finally {
            setResetting(false);
        }
    };

    const handleForgot = () => {
        Alert.alert(
            'Forgot recovery key',
            'This will delete all encrypted data and generate a new recovery key.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: () => {
                        void resetAndRedirect();
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`} />
        );
    }

    return (
        <View className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}>
            <ScrollView
                className="flex-1 px-8"
                contentContainerStyle={{ paddingTop: 64, paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                <Text
                    className={`mb-4 text-center font-instrument-serif-bold text-xl ${
                        isDark ? 'text-white' : 'text-black'
                    }`}
                >
                    import recovery key
                </Text>

                <View className="mb-10">
                    <Text
                        className={`mb-2 font-instrument-serif-italic text-lg ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}
                    >
                        Import
                    </Text>

                    <Text
                        className={`mb-4 font-instrument-serif text-sm ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}
                    >
                        Paste your recovery key from another device.
                    </Text>

                    <TextInput
                        value={importValue}
                        onChangeText={setImportValue}
                        placeholder="psyche_recovery_v1:..."
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                </View>
            </ScrollView>

            <View
                className="absolute bottom-0 left-0 right-0 px-8 pb-8 pt-4 gap-4"
                style={{ backgroundColor: isDark ? '#000000' : '#ffffff' }}
            >
                <Text
                    className={`text-center ${isDark ? 'text-white' : 'text-black'}`}
                    onPress={handleForgot}
                    disabled={resetting}
                >
                    Forgot your key? You can reset your data here.
                </Text>

                <Button
                    title="Import & Verify"
                    onPress={handleImport}
                    disabled={!canContinue}
                />
            </View>
        </View>
    );
}
