import React, { useEffect, useRef } from 'react';
import { router, usePathname } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { getEncryptionStatus } from '@/lib/userEncryption';
import {
    getEncryptionSetupComplete,
    setEncryptionSetupComplete,
} from '@/lib/encryptionDevice';

const AUTH_ROUTES = new Set([
    '/login',
    '/register',
    '/confirmation',
    '/email-confirmed',
    '/forgot-password',
    '/reset-password',
]);

export default function EncryptionGate() {
    const { user, loading } = useAuth();
    const pathname = usePathname();
    const lastRedirectRef = useRef<string | null>(null);

    useEffect(() => {
        if (loading) return;
        if (!user) return;
        if (AUTH_ROUTES.has(pathname)) return;
        if (
            pathname === '/encryption-key' ||
            pathname === '/encryption-key-save' ||
            pathname === '/encryption-key-import'
        )
            return;

        let cancelled = false;

        (async () => {
            try {
                const [status, setupComplete] = await Promise.all([
                    getEncryptionStatus(user.id),
                    getEncryptionSetupComplete(user.id),
                ]);
                if (cancelled) return;

                if (status.status !== 'ready' || !setupComplete) {
                    void setEncryptionSetupComplete(user.id, false);
                    if (lastRedirectRef.current === pathname) return;
                    lastRedirectRef.current = pathname;
                    const destination =
                        status.status === 'needs_backup'
                            ? '/encryption-key-save'
                            : '/encryption-key-import';
                    router.replace(destination as any);
                } else {
                    lastRedirectRef.current = null;
                }
            } catch {
                // If we can't check status, don't hard-block navigation.
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [user?.id, loading, pathname]);

    return null;
}
