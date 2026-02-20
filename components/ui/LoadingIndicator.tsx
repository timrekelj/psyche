import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface LoadingIndicatorProps {
    size?: 'small' | 'medium' | 'large';
    color?: string;
}

export default function LoadingIndicator({
    size = 'small',
    color,
}: LoadingIndicatorProps) {
    const { isDark } = useTheme();
    const breathingAnimation = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const breathe = () => {
            Animated.sequence([
                Animated.timing(breathingAnimation, {
                    toValue: 1.3,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(breathingAnimation, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ]).start(() => {
                breathe();
            });
        };
        breathe();

        return () => {
            breathingAnimation.setValue(1);
        };
    }, [breathingAnimation]);

    const getSize = () => {
        switch (size) {
            case 'medium': return 'h-6 w-6';
            case 'large': return 'h-8 w-8';
            default: return 'h-4 w-4';
        }
    };

    const getColor = () => {
        return color ?? (isDark ? '#ffffff' : '#000000');
    };

    return (
        <Animated.View
            style={{
                transform: [{ scale: breathingAnimation }],
                backgroundColor: getColor(),
            }}
            className={`self-center rounded-full ${getSize()}`}
        />
    );
}