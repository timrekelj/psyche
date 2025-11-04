import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

interface LoadingScreenProps {
  backgroundColor?: string;
  circleColor?: string;
}

export default function LoadingScreen({
  backgroundColor = 'bg-white',
  circleColor = '#000000'
}: LoadingScreenProps) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const breathingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 1500,
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
    <View className={`flex-1 justify-center items-center ${backgroundColor}`}>
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
          }}
        >
          <View
            className="rounded-full"
            style={{
              width: 80,
              height: 80,
              backgroundColor: circleColor
            }}
          />
        </Animated.View>
    </View>
  );
}
