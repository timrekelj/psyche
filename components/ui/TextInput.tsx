import React, { useState } from 'react';
import {
    View,
    TextInput as RNTextInput,
    Text,
    TextInputProps,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface CustomTextInputProps extends TextInputProps {
    error?: boolean;
    secureTextEntry?: boolean;
}

export default function TextInput({
    error = false,
    secureTextEntry = false,
    value,
    onChangeText,
    style,
    ...props
}: CustomTextInputProps) {
    const { isDark } = useTheme();
    const [actualValue, setActualValue] = useState(value || '');

    const baseInputStyles =
        'border border-[.5px] rounded-lg px-5 py-4 font-instrument-serif';
    const themeStyles = isDark
        ? 'bg-gray-900 border-white/20 text-white placeholder:text-white/40'
        : 'border-black/20 text-black placeholder:text-black/20';
    const errorInputStyles = error ? 'border-red-500' : '';

    const handleTextChange = (text: string) => {
        if (secureTextEntry) {
            // Handle custom asterisk masking
            const currentLength = actualValue.length;
            const newLength = text.length;

            if (newLength > currentLength) {
                // Characters were added
                const newChars = text.slice(currentLength);
                const newActualValue =
                    actualValue + newChars.replace(/\*/g, '');
                setActualValue(newActualValue);
                onChangeText?.(newActualValue);
            } else if (newLength < currentLength) {
                // Characters were removed
                const newActualValue = actualValue.slice(0, newLength);
                setActualValue(newActualValue);
                onChangeText?.(newActualValue);
            }
        } else {
            // Normal text input
            setActualValue(text);
            onChangeText?.(text);
        }
    };

    const displayValue = secureTextEntry
        ? '*'.repeat(actualValue.length)
        : actualValue;

    return (
        <View className="mb-4">
            <RNTextInput
                className={`${baseInputStyles} ${themeStyles} ${errorInputStyles}`}
                style={style}
                value={displayValue}
                onChangeText={handleTextChange}
                secureTextEntry={false} // We're handling masking manually
                placeholderTextColor={
                    isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.2)'
                }
                {...props}
            />
        </View>
    );
}
