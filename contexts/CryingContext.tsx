import React, { createContext, useContext, useState } from 'react';
import type { CryEntry } from '@/lib/cryingService';

export type EmotionType =
    | 'OVERWHELMED'
    | 'MISSING_SOMEONE'
    | 'STRESS'
    | 'LONELINESS'
    | 'RELATIONSHIP_ISSUES'
    | 'SADNESS'
    | 'JOY'
    | 'PROUD'
    | 'NO_REASON';

export interface CryingSessionData {
    criedAt: Date | null;
    emotions: EmotionType | null;
    feelingIntensity: number | null;
    thoughts: string;
    recentSmileThing: string;
}

interface CryingContextType {
    sessionData: CryingSessionData;
    editingEntryId: string | null;
    updateCriedAt: (date: Date) => void;
    updateEmotions: (emotion: EmotionType) => void;
    updateIntensityAndThoughts: (intensity: number, thoughts: string) => void;
    updateRecentSmileThing: (text: string) => void;
    startEditing: (entry: CryEntry) => void;
    clearEditing: () => void;
    resetSession: () => void;
    isSessionComplete: () => boolean;
}

const initialSessionData: CryingSessionData = {
    criedAt: null,
    emotions: null,
    feelingIntensity: null,
    thoughts: '',
    recentSmileThing: '',
};

const CryingContext = createContext<CryingContextType | undefined>(undefined);

export function CryingProvider({ children }: { children: React.ReactNode }) {
    const [sessionData, setSessionData] =
        useState<CryingSessionData>(initialSessionData);
    const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

    const updateCriedAt = (date: Date) => {
        setSessionData((prev) => ({ ...prev, criedAt: date }));
    };

    const updateEmotions = (emotion: EmotionType) => {
        setSessionData((prev) => ({ ...prev, emotions: emotion }));
    };

    const updateIntensityAndThoughts = (
        intensity: number,
        thoughts: string
    ) => {
        setSessionData((prev) => ({
            ...prev,
            feelingIntensity: intensity,
            thoughts,
        }));
    };

    const updateRecentSmileThing = (text: string) => {
        setSessionData((prev) => ({ ...prev, recentSmileThing: text }));
    };

    const startEditing = (entry: CryEntry) => {
        if (!entry.id) return;
        setEditingEntryId(entry.id);
        setSessionData({
            criedAt: entry.cried_at ? new Date(entry.cried_at) : null,
            emotions: entry.emotions,
            feelingIntensity: entry.feeling_intensity,
            thoughts: entry.thoughts,
            recentSmileThing: entry.recent_smile_thing,
        });
    };

    const clearEditing = () => {
        setEditingEntryId(null);
    };

    const resetSession = () => {
        setSessionData(initialSessionData);
        setEditingEntryId(null);
    };

    const isSessionComplete = () => {
        return (
            sessionData.criedAt !== null &&
            sessionData.emotions !== null &&
            sessionData.feelingIntensity !== null &&
            sessionData.thoughts.trim() !== '' &&
            sessionData.recentSmileThing.trim() !== ''
        );
    };

    const value = {
        sessionData,
        editingEntryId,
        updateCriedAt,
        updateEmotions,
        updateIntensityAndThoughts,
        updateRecentSmileThing,
        startEditing,
        clearEditing,
        resetSession,
        isSessionComplete,
    };

    return (
        <CryingContext.Provider value={value}>
            {children}
        </CryingContext.Provider>
    );
}

export function useCrying() {
    const context = useContext(CryingContext);
    if (context === undefined) {
        throw new Error('useCrying must be used within a CryingProvider');
    }
    return context;
}
