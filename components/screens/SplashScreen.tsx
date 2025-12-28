import React, { useEffect, useRef } from 'react';
import { View, Animated, Image, Text } from 'react-native';
import { Easing } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';

export default function SplashScreen() {
    const { isDark } = useTheme();
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        // ease in and out
        const breathingAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.2,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 0.8,
                    duration: 2000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );

        breathingAnimation.start();

        return () => {
            breathingAnimation.stop();
        };
    }, [scaleAnim]);

    return (
        <View
            className={`flex-1 items-center justify-center ${isDark ? 'bg-black' : 'bg-white'}`}
        >
            {/* Hello World text in the center */}
            <Text
                className={`absolute top-[25%] font-instrument-serif text-3xl ${
                    isDark ? 'text-white' : 'text-black'
                }`}
            >
                It's okay to cry.
            </Text>

            {/* Circle positioned so only upper half is visible */}
            <View className="absolute bottom-0 w-full items-center">
                <Animated.View
                    className={`absolute -bottom-[400px] h-[800px] w-[800px] rounded-full ${
                        isDark ? 'bg-white' : 'bg-black'
                    }`}
                    style={{ transform: [{ scale: scaleAnim }] }}
                />
                <Image
                    source={
                        isDark
                            ? require('../../assets/images/sad_face_black.png')
                            : require('../../assets/images/sad_face.png')
                    }
                    className="absolute -bottom-20 w-[200px]"
                    resizeMode="contain"
                />
            </View>
        </View>
    );
}
