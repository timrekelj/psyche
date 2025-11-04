import React, { useEffect, useRef } from "react";
import { View, Animated, Image, Text } from "react-native";
import { Easing } from 'react-native-reanimated';

export default function SplashScreen() {
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
      ]),
    );

    breathingAnimation.start();

    return () => {
      breathingAnimation.stop();
    };
  }, [scaleAnim]);

  return (
    <View className="flex-1 bg-white items-center justify-center">
      {/* Hello World text in the center */}
      <Text className="text-black text-3xl font-instrument-serif absolute top-[25%]">
        It's okay to cry.
      </Text>

      {/* Circle positioned so only upper half is visible */}
      <View className="absolute bottom-0 w-full items-center">
        <Animated.View
          className="rounded-full w-[800px] h-[800px] bg-black absolute -bottom-[400px]"
          style={{ transform: [{ scale: scaleAnim }] }}
        />
        <Image
          source={require('../../assets/images/sad_face.png')}
          className="absolute bottom-[100px] w-[200px]"
          resizeMode="contain"
        />
      </View>
    </View>
  );
}
