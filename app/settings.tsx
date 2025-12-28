import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Alert,
    Pressable,
    ScrollView,
    Modal,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from '../constants/legal';
import { openExternalLink } from '@/lib/openLink';
import { Button, TextInput } from '@/components/ui';
import LoadingScreen from '@/components/screens/LoadingScreen';
import {
    Sun,
    Moon,
    Smartphone,
    Check,
    User,
    Mail,
    Lock,
    Trash2,
    ChevronRight,
    X,
    LogOut,
    FileText,
    ShieldCheck,
} from 'lucide-react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeOptionProps {
    mode: ThemeMode;
    label: string;
    icon: React.ReactNode;
    isSelected: boolean;
    onPress: () => void;
    isDark: boolean;
}

function ThemeOption({
    mode,
    label,
    icon,
    isSelected,
    onPress,
    isDark,
}: ThemeOptionProps) {
    return (
        <Pressable
            onPress={onPress}
            className={`mb-2 flex-row items-center justify-between rounded-lg px-4 py-4 ${
                isSelected
                    ? isDark
                        ? 'bg-white/10'
                        : 'bg-black/5'
                    : isDark
                      ? 'bg-white/5'
                      : 'bg-gray-50'
            }`}
        >
            <View className="flex-row items-center">
                <View className="mr-3">{icon}</View>
                <Text
                    className={`font-instrument-serif text-lg ${
                        isDark ? 'text-white' : 'text-black'
                    }`}
                >
                    {label}
                </Text>
            </View>
            {isSelected && (
                <Check
                    width={20}
                    height={20}
                    color={isDark ? '#ffffff' : '#000000'}
                />
            )}
        </Pressable>
    );
}

interface SettingsRowProps {
    icon: React.ReactNode;
    label: string;
    value?: string;
    onPress: () => void;
    isDark: boolean;
    isDelete?: boolean;
    isLogout?: boolean;
}

function SettingsRow({
    icon,
    label,
    value,
    onPress,
    isDark,
    isDelete = false,
    isLogout = false,
}: SettingsRowProps) {
    return (
        <Pressable
            onPress={onPress}
            className={`mb-2 flex-row items-center justify-between rounded-lg px-4 py-4 ${
                isDelete
                    ? isDark
                        ? 'bg-red-900/30'
                        : 'bg-red-50'
                    : isDark
                      ? 'bg-white/5'
                      : 'bg-gray-50'
            }`}
        >
            <View className="flex-1 flex-row items-center">
                <View className="mr-3">{icon}</View>
                <View className="flex-1">
                    <Text
                        className={`font-instrument-serif text-lg ${
                            isDelete
                                ? isDark
                                    ? 'text-red-400'
                                    : 'text-red-600'
                                : isDark
                                  ? 'text-white'
                                  : 'text-black'
                        }`}
                    >
                        {label}
                    </Text>
                    {value && (
                        <Text
                            className={`font-instrument-serif text-sm ${
                                isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}
                            numberOfLines={1}
                        >
                            {value}
                        </Text>
                    )}
                </View>
            </View>
            {!isDelete && !isLogout && (
                <ChevronRight
                    width={20}
                    height={20}
                    color={isDark ? '#9ca3af' : '#6b7280'}
                />
            )}
        </Pressable>
    );
}

interface EditModalProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    isDark: boolean;
    children: React.ReactNode;
}

function EditModal({
    visible,
    onClose,
    title,
    isDark,
    children,
}: EditModalProps) {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="formSheet"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}
            >
                <View className="flex-1 px-6 pt-4">
                    <View className="mb-6 flex-row items-center justify-between">
                        <Text
                            className={`font-instrument-serif-bold text-xl ${
                                isDark ? 'text-white' : 'text-black'
                            }`}
                        >
                            {title}
                        </Text>
                        <Pressable onPress={onClose} className="p-2">
                            <X
                                width={24}
                                height={24}
                                color={isDark ? '#ffffff' : '#000000'}
                            />
                        </Pressable>
                    </View>
                    {children}
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

export default function SettingsScreen() {
    const {
        user,
        signOut,
        loading,
        updateProfile,
        updateEmail,
        updatePassword,
        deleteAccount,
    } = useAuth();
    const { theme, setTheme, isDark } = useTheme();

    // Modal states
    const [nameModalVisible, setNameModalVisible] = useState(false);
    const [emailModalVisible, setEmailModalVisible] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);

    // Form states
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        }
    }, [user, loading]);

    useEffect(() => {
        if (user) {
            setFirstName(user.user_metadata?.first_name || '');
            setLastName(user.user_metadata?.last_name || '');
            setNewEmail(user.email || '');
        }
    }, [user]);

    if (loading) {
        return (
            <LoadingScreen
                backgroundColor={isDark ? 'bg-black' : 'bg-white'}
                circleColor={isDark ? '#ffffff' : '#000000'}
            />
        );
    }

    const handleBackToHome = () => {
        router.back();
    };

    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'delete',
                onPress: async () => {
                    try {
                        await signOut();
                        router.replace('/login');
                    } catch (error: any) {
                        Alert.alert(
                            'Error',
                            'Failed to logout. Please try again.'
                        );
                    }
                },
            },
        ]);
    };

    const handleThemeChange = async (newTheme: ThemeMode) => {
        try {
            await setTheme(newTheme);
        } catch (error) {
            Alert.alert('Error', 'Failed to save theme preference.');
        }
    };

    const handleUpdateName = async () => {
        if (!firstName.trim() || !lastName.trim()) {
            Alert.alert('Error', 'Please enter both first and last name.');
            return;
        }

        setIsUpdating(true);
        try {
            await updateProfile(firstName.trim(), lastName.trim());
            setNameModalVisible(false);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update name.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdateEmail = async () => {
        if (!newEmail.trim()) {
            Alert.alert('Error', 'Please enter a valid email address.');
            return;
        }

        setIsUpdating(true);
        try {
            await updateEmail(newEmail.trim());
            Alert.alert(
                'Verification Required',
                'A verification email has been sent to your new email address. Please check your inbox to confirm the change.'
            );
            setEmailModalVisible(false);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update email.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdatePassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters.');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        setIsUpdating(true);
        try {
            await updatePassword(newPassword);
            setPasswordModalVisible(false);
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update password.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert(
                            'Confirm Deletion',
                            'This is your last chance. Are you absolutely sure?',
                            [
                                { text: 'Cancel', style: 'cancel' },
                                {
                                    text: 'Yes, Delete My Account',
                                    style: 'delete',
                                    onPress: async () => {
                                        try {
                                            await deleteAccount();
                                            router.replace('/login');
                                        } catch (error: any) {
                                            Alert.alert(
                                                'Error',
                                                error.message ||
                                                    'Failed to delete account. Please contact support.'
                                            );
                                        }
                                    },
                                },
                            ]
                        );
                    },
                },
            ]
        );
    };

    const iconColor = isDark ? '#ffffff' : '#000000';
    const userName =
        user?.user_metadata?.first_name && user?.user_metadata?.last_name
            ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
            : 'Not set';

    return (
        <View className={`flex-1 ${isDark ? 'bg-black' : 'bg-white'}`}>
            <ScrollView
                className="flex-1 px-8"
                contentContainerStyle={{ paddingTop: 64, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="pb-4">
                    <Text
                        className={`font-instrument-serif-bold mb-4 text-center text-2xl ${
                            isDark ? 'text-white' : 'text-black'
                        }`}
                    >
                        settings
                    </Text>
                </View>

                {/* Account Section */}
                <View className="mb-8">
                    <Text
                        className={`mb-4 font-instrument-serif-italic text-lg ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}
                    >
                        Account
                    </Text>

                    <SettingsRow
                        icon={<User width={22} height={22} color={iconColor} />}
                        label="Name"
                        value={userName}
                        onPress={() => setNameModalVisible(true)}
                        isDark={isDark}
                    />

                    <SettingsRow
                        icon={<Mail width={22} height={22} color={iconColor} />}
                        label="Email"
                        value={user?.email || 'Not set'}
                        onPress={() => setEmailModalVisible(true)}
                        isDark={isDark}
                    />

                    <SettingsRow
                        icon={<Lock width={22} height={22} color={iconColor} />}
                        label="Password"
                        value="••••••••"
                        onPress={() => setPasswordModalVisible(true)}
                        isDark={isDark}
                    />
                </View>

                {/* Theme Section */}
                <View className="mb-8">
                    <Text
                        className={`mb-4 font-instrument-serif-italic text-lg ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}
                    >
                        Appearance
                    </Text>

                    <ThemeOption
                        mode="light"
                        label="Light"
                        icon={<Sun width={22} height={22} color={iconColor} />}
                        isSelected={theme === 'light'}
                        onPress={() => handleThemeChange('light')}
                        isDark={isDark}
                    />

                    <ThemeOption
                        mode="dark"
                        label="Dark"
                        icon={<Moon width={22} height={22} color={iconColor} />}
                        isSelected={theme === 'dark'}
                        onPress={() => handleThemeChange('dark')}
                        isDark={isDark}
                    />

                    <ThemeOption
                        mode="system"
                        label="System"
                        icon={
                            <Smartphone
                                width={22}
                                height={22}
                                color={iconColor}
                            />
                        }
                        isSelected={theme === 'system'}
                        onPress={() => handleThemeChange('system')}
                        isDark={isDark}
                />
                </View>

                {/* Legal */}
                <View className="mb-8">
                    <Text
                        className={`mb-4 font-instrument-serif-italic text-lg ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}
                    >
                        Legal
                    </Text>

                    <SettingsRow
                        icon={
                            <FileText
                                width={22}
                                height={22}
                                color={iconColor}
                            />
                        }
                        label="Terms of Service"
                        onPress={() => openExternalLink(TERMS_OF_SERVICE_URL)}
                        isDark={isDark}
                    />

                    <SettingsRow
                        icon={
                            <ShieldCheck
                                width={22}
                                height={22}
                                color={iconColor}
                            />
                        }
                        label="Privacy Policy"
                        onPress={() => openExternalLink(PRIVACY_POLICY_URL)}
                        isDark={isDark}
                    />
                </View>

                {/* Danger Zone */}
                <View className="mb-8">
                    <Text
                        className={`mb-4 font-instrument-serif-italic text-lg ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}
                    >
                        Danger Zone
                    </Text>

                    <SettingsRow
                        icon={
                            <LogOut
                                width={22}
                                height={22}
                                color={isDark ? '#ffffff' : '#000000'}
                            />
                        }
                        label="Logout"
                        onPress={handleLogout}
                        isDark={isDark}
                        isLogout
                    />

                    <SettingsRow
                        icon={
                            <Trash2
                                width={22}
                                height={22}
                                color={isDark ? '#f87171' : '#dc2626'}
                            />
                        }
                        label="Delete Account"
                        onPress={handleDeleteAccount}
                        isDark={isDark}
                        isDelete
                    />
                </View>
            </ScrollView>

            <View
                className="absolute bottom-0 left-0 right-0 px-8 pb-8 pt-4"
                style={{ backgroundColor: isDark ? '#000000' : '#ffffff' }}
            >
                <Button title="Close settings" onPress={handleBackToHome} />
            </View>

            {/* Edit Name Modal */}
            <EditModal
                visible={nameModalVisible}
                onClose={() => setNameModalVisible(false)}
                title="Edit Name"
                isDark={isDark}
            >
                <View className="flex-1">
                    <Text
                        className={`mb-2 font-instrument-serif text-base ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}
                    >
                        First Name
                    </Text>
                    <TextInput
                        placeholder="Enter your first name"
                        value={firstName}
                        onChangeText={setFirstName}
                        autoCapitalize="words"
                    />

                    <Text
                        className={`mb-2 font-instrument-serif text-base ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}
                    >
                        Last Name
                    </Text>
                    <TextInput
                        placeholder="Enter your last name"
                        value={lastName}
                        onChangeText={setLastName}
                        autoCapitalize="words"
                    />

                    <View className="mt-4">
                        <Button
                            title="Save Changes"
                            onPress={handleUpdateName}
                            loading={isUpdating}
                            disabled={isUpdating}
                        />
                    </View>
                </View>
            </EditModal>

            {/* Edit Email Modal */}
            <EditModal
                visible={emailModalVisible}
                onClose={() => setEmailModalVisible(false)}
                title="Change Email"
                isDark={isDark}
            >
                <View className="flex-1">
                    <Text
                        className={`mb-4 font-instrument-serif text-base ${
                            isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}
                    >
                        A verification email will be sent to your new address.
                    </Text>

                    <Text
                        className={`mb-2 font-instrument-serif text-base ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}
                    >
                        New Email
                    </Text>
                    <TextInput
                        placeholder="Enter your new email"
                        value={newEmail}
                        onChangeText={setNewEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <View className="mt-4">
                        <Button
                            title="Update Email"
                            onPress={handleUpdateEmail}
                            loading={isUpdating}
                            disabled={isUpdating}
                        />
                    </View>
                </View>
            </EditModal>

            {/* Edit Password Modal */}
            <EditModal
                visible={passwordModalVisible}
                onClose={() => {
                    setPasswordModalVisible(false);
                    setNewPassword('');
                    setConfirmPassword('');
                }}
                title="Change Password"
                isDark={isDark}
            >
                <View className="flex-1">
                    <Text
                        className={`mb-2 font-instrument-serif text-base ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}
                    >
                        New Password
                    </Text>
                    <TextInput
                        placeholder="Enter new password"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                    />

                    <Text
                        className={`mb-2 font-instrument-serif text-base ${
                            isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}
                    >
                        Confirm Password
                    </Text>
                    <TextInput
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />

                    <View className="mt-4">
                        <Button
                            title="Update Password"
                            onPress={handleUpdatePassword}
                            loading={isUpdating}
                            disabled={isUpdating}
                        />
                    </View>
                </View>
            </EditModal>
        </View>
    );
}
