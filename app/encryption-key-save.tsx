import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Share, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button, Text, TextInput, ToggleButton } from '@/components/ui';
import {
    EncryptionStatus,
    getEncryptionStatus,
    getRecoveryKeyString,
    markEncryptionKeyBackedUp,
} from '@/lib/userEncryption';
import { setEncryptionSetupComplete } from '@/lib/encryptionDevice';

export default function EncryptionKeySaveScreen() {
    const { user } = useAuth();
    const { isDark } = useTheme();

    const [status, setStatus] = useState<EncryptionStatus | null>(null);
    const [loading, setLoading] = useState(true);

    const [recoveryKey, setRecoveryKey] = useState<string>('');
    const [revealKey, setRevealKey] = useState(false);
    const [confirmSaved, setConfirmSaved] = useState(false);
    const canContinue =
        confirmSaved &&
        (status?.status === 'needs_backup' || status?.status === 'ready');

    const load = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const nextStatus = await getEncryptionStatus(user.id);

            setStatus(nextStatus);

            if (
                nextStatus.status === 'needs_backup' ||
                nextStatus.status === 'ready'
            ) {
                try {
                    const key = await getRecoveryKeyString(user.id);
                    setRecoveryKey(key);
                } catch {
                    setRecoveryKey('');
                }
            } else {
                setRecoveryKey('');
            }
        } catch (error: any) {
            Alert.alert(
                'Error',
                error.message || 'Failed to load encryption status.'
            );
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

    const handleContinue = async () => {
        if (!user) return;

        if (!confirmSaved) return;
        if (
            status?.status !== 'needs_backup' &&
            status?.status !== 'ready'
        ) {
            router.replace('/encryption-key-import' as any);
            return;
        }

        try {
            await markEncryptionKeyBackedUp(user.id);
            await setEncryptionSetupComplete(user.id, true);
            router.replace('/home');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to continue.');
        }
    };

    if (loading) {
        return (
            <View className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`} />
        );
    }

    return (
        <View
            className={`flex-1 px-8 py-16 ${isDark ? 'bg-black' : 'bg-white'}`}
        >
            <View className="flex-1">
                <Text
                    className={`mb-4 font-instrument-serif-bold text-center text-xl ${
                        isDark ? 'text-white' : 'text-black'
                    }`}
                >
                    save recovery key
                </Text>

                <Text
                    className={`mb-4 text-center font-instrument-serif text-base ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                >
                    Save this key now. You will need it to unlock your encrypted
                    data on another device. Make sure to store it somewhere
                    safe.
                </Text>

                <TextInput
                    value={
                        revealKey
                            ? recoveryKey
                            : recoveryKey
                              ? '••••••••••••••••••••••••••••••••'
                              : ''
                    }
                    editable={false}
                    placeholder="Generating…"
                />

                <View className="flex-row gap-4 mb-4">
                    <Button
                        title={revealKey ? 'Hide' : 'Reveal'}
                        onPress={() => setRevealKey((v) => !v)}
                        disabled={!recoveryKey}
                        className="flex-1"
                    />
                    <Button
                        title="Share"
                        onPress={() =>
                            recoveryKey
                                ? Share.share({ message: recoveryKey })
                                : undefined
                        }
                        disabled={!recoveryKey}
                        className="flex-1"
                    />
                </View>

                <ToggleButton
                    onPress={() => setConfirmSaved((v) => !v)}
                    selected={confirmSaved}
                    label="I saved my recovery key"
                />
            </View>

            <View
                className="absolute bottom-0 left-0 right-0 px-8 pb-8 pt-4 gap-4"
                style={{ backgroundColor: isDark ? '#000000' : '#ffffff' }}
            >
                {status?.status !== 'needs_backup' ? (
                    <Text
                        className={`text-center ${isDark ? 'text-white' : 'text-black'}`}
                        onPress={() => router.replace('/encryption-key-import')}
                    >
                        Do you remember your old recovery key?
                    </Text>
                ) : null}
                <Button
                    title="Continue"
                    onPress={handleContinue}
                    disabled={!canContinue}
                />
            </View>
        </View>
    );
}
