import React, { useEffect, useRef } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    Animated,
    TouchableOpacityProps,
    Easing,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
    title: string;
    loading?: boolean;
}

export default function Button({
    title,
    loading = false,
    disabled,
    style,
    ...props
}: ButtonProps) {
    const isDisabled = disabled || loading;
    const breathingAnimation = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (loading) {
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
                    if (loading) {
                        breathe();
                    }
                });
            };
            breathe();
        } else {
            breathingAnimation.setValue(1);
        }
    }, [loading, breathingAnimation]);

    return (
        <TouchableOpacity disabled={isDisabled} style={[style]} {...props}>
            <View
                className={`px-5 py-4 transition-all duration-300 ${loading ? 'bg-white' : disabled ? 'bg-black/10' : 'bg-black'} rounded-lg`}
            >
                {loading ? (
                    <Animated.View
                        style={{
                            transform: [{ scale: breathingAnimation }],
                        }}
                        className="h-4 w-4 self-center rounded-full bg-black"
                    />
                ) : (
                    <Text
                        className={`text-center font-instrument-serif text-base transition-all duration-300 ${disabled ? 'text-black' : 'text-white'}`}
                    >
                        {title}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
}
