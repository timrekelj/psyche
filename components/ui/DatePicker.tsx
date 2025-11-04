import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, Animated } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Button from './Button';

interface DatePickerProps {
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "Select date"
}: DatePickerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));
  const [tempDate, setTempDate] = useState<Date | null>(null);

  const showBottomSheet = () => {
    setTempDate(value || new Date());
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
      friction: 10,
    }).start(() => {
      setIsVisible(false);
      setTempDate(null);
    });
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate && event.type !== 'dismissed') {
      // Only update the temporary date, don't call onChange yet
      setTempDate(selectedDate);
    }
  };

  const handleConfirm = () => {
    if (tempDate) {
      onChange(tempDate);
    }
    hideBottomSheet();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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
        className="border  border-gray-300 rounded-lg px-4 py-4 bg-white"
      >
        <Text className={`font-instrument-serif text-base ${
          value ? 'text-black' : 'text-gray-400'
        }`}>
          {value ? formatDate(value) : placeholder}
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
              Select Date
            </Text>

            <View className="items-center">
              <DateTimePicker
                value={tempDate || value || new Date()}
                mode="date"
                display="spinner"
                onChange={onDateChange}
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
