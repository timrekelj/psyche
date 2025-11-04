import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, Animated } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Button from './Button';

interface TimePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
}

export default function TimePicker({
  value,
  onChange,
  placeholder = "Select time"
}: TimePickerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));
  const [tempTime, setTempTime] = useState<Date | null>(null);

  const showBottomSheet = () => {
    setTempTime(value || new Date());
    setIsVisible(true);
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 10,
    }).start();
  };

  const hideBottomSheet = () => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start(() => {
      setIsVisible(false);
      setTempTime(null);
    });
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    if (selectedTime && event.type !== 'dismissed') {
      // Only update the temporary time, don't call onChange yet
      if (value) {
        const newDateTime = new Date(value);
        newDateTime.setHours(selectedTime.getHours());
        newDateTime.setMinutes(selectedTime.getMinutes());
        setTempTime(newDateTime);
      } else {
        // If no existing value, use today's date with selected time
        const today = new Date();
        today.setHours(selectedTime.getHours());
        today.setMinutes(selectedTime.getMinutes());
        setTempTime(today);
      }
    }
  };

  const handleConfirm = () => {
    if (tempTime) {
      onChange(tempTime);
    }
    hideBottomSheet();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [400, 0],
  });

  return (
    <View>
      <TouchableOpacity
        onPress={showBottomSheet}
        className="border border-gray-300 rounded-lg px-4 py-4 bg-white"
      >
        <Text className={`font-instrument-serif text-base ${
          value ? 'text-black' : 'text-gray-400'
        }`}>
          {value ? formatTime(value) : placeholder}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={hideBottomSheet}
      >
        <View className="flex-1 justify-end bg-black/50">
          <Pressable
            className="flex-1"
            onPress={hideBottomSheet}
          />

          <Animated.View
            style={{
              transform: [{ translateY }],
            }}
            className="bg-white rounded-t-2xl px-6 pt-8 pb-10"
          >
            <Text className="text-xl font-instrument-serif text-center mb-6">
              Select Time
            </Text>

            <View className="items-center">
              <DateTimePicker
                value={tempTime || value || new Date()}
                mode="time"
                display="spinner"
                is24Hour={false}
                onChange={onTimeChange}
                textColor="#000000"
              />
            </View>

            <Button
              onPress={handleConfirm}
              title="Confirm"
            />
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}
