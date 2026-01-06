import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    showSplash: boolean;
    isPasswordRecovery: boolean;
    signUp: (
        email: string,
        password: string,
        firstName: string,
        lastName: string
    ) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    completePasswordReset: (newPassword: string) => Promise<void>;
    hideSplash: () => void;
    updateProfile: (firstName: string, lastName: string) => Promise<void>;
    updateEmail: (newEmail: string) => Promise<void>;
    updatePassword: (newPassword: string) => Promise<void>;
    deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [showSplash, setShowSplash] = useState(true);
    const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

    // Configure deep link origin to match app.json
    const deepLinkOptions = {
        scheme: 'the-psyche',
        host: 'psyche.timrekelj.si',
    };
    const createAppDeepLink = (path: string) =>
        Linking.createURL(path, deepLinkOptions);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
            if (event === 'PASSWORD_RECOVERY') {
                setIsPasswordRecovery(true);
            }
            if (event === 'SIGNED_OUT') {
                setIsPasswordRecovery(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        const handleDeepLink = async (url: string | null) => {
            if (!url) return;

            // Supabase sends recovery links with tokens in the hash fragment
            // e.g. the-psyche://.../reset-password#access_token=...&refresh_token=...&type=recovery
            const parsedUrl = new URL(url);
            const hashParams = new URLSearchParams(
                parsedUrl.hash.replace(/^#/, '')
            );
            const type = hashParams.get('type');
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');

            if (type !== 'recovery') return;

            if (!accessToken || !refreshToken) {
                console.warn('Recovery link missing tokens.');
                return;
            }

            const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
            });

            if (error) {
                console.error('Error setting session from recovery link:', error);
                return;
            }

            setIsPasswordRecovery(true);

            if (data.session) {
                setSession(data.session);
                setUser(data.session.user);
            }

            router.replace('/reset-password');
        };

        const urlListener = Linking.addEventListener('url', ({ url }) =>
            handleDeepLink(url)
        );

        Linking.getInitialURL().then((url) => handleDeepLink(url));

        return () => {
            urlListener.remove();
        };
    }, []);

    // Hide splash screen after loading is complete
    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(() => {
                setShowSplash(false);
            }, 2000); // Show custom splash for 2 seconds after auth loading completes

            return () => clearTimeout(timer);
        }
    }, [loading]);

    const signUp = async (
        email: string,
        password: string,
        firstName: string,
        lastName: string
    ) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: createAppDeepLink('/email-confirmed'),
                data: {
                    first_name: firstName,
                    last_name: lastName,
                },
            },
        });

        if (error) {
            throw error;
        }
    };

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw error;
        }
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            throw error;
        }
        setIsPasswordRecovery(false);
    };

    const hideSplash = () => {
        setShowSplash(false);
    };

    const resetPassword = async (email: string) => {
        const redirectTo = createAppDeepLink('/reset-password');
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo,
        });

        if (error) {
            throw error;
        }
    };

    const completePasswordReset = async (newPassword: string) => {
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) {
            throw error;
        }

        setIsPasswordRecovery(false);
    };

    const updateProfile = async (firstName: string, lastName: string) => {
        const { error } = await supabase.auth.updateUser({
            data: {
                first_name: firstName,
                last_name: lastName,
            },
        });

        const { error: usersDataError } = await supabase
            .from('users_data')
            .update({ first_name: firstName, last_name: lastName })
            .eq('id', user?.id);

        if (error || usersDataError) {
            throw error || usersDataError;
        }
    };

    const updateEmail = async (newEmail: string) => {
        const { error } = await supabase.auth.updateUser(
            {
                email: newEmail,
            },
            { emailRedirectTo: createAppDeepLink('/email-confirmed') }
        );

        if (error) {
            throw error;
        }
    };

    const updatePassword = async (newPassword: string) => {
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) {
            throw error;
        }
    };

    const deleteAccount = async () => {
        // First, delete user data from any related tables
        if (user) {
            // Delete crying sessions
            const { error: dataError } = await supabase
                .from('crying_sessions')
                .delete()
                .eq('user_id', user.id);

            if (dataError) {
                console.error('Error deleting user data:', dataError);
                // Continue with account deletion even if data deletion fails
            }
        }

        // Call the delete account RPC function or sign out
        // Note: Supabase doesn't allow users to delete themselves directly
        // You'll need to set up a server-side function or Edge Function for this
        // For now, we'll sign out and you can implement server-side deletion
        const { error } = await supabase.rpc('delete_user');

        if (error) {
            // If RPC doesn't exist, throw a specific error
            throw new Error(
                'Account deletion requires server-side setup. Please contact support.'
            );
        }

        // Sign out after deletion
        await signOut();
    };

    const value = {
        user,
        session,
        loading,
        showSplash,
        isPasswordRecovery,
        signUp,
        signIn,
        signOut,
        resetPassword,
        completePasswordReset,
        hideSplash,
        updateProfile,
        updateEmail,
        updatePassword,
        deleteAccount,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
