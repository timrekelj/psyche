import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import {
    Text,
    TouchableOpacity,
    TouchableOpacityProps,
    View,
} from 'react-native';

interface ToggleButtonProps extends TouchableOpacityProps {
    label: string;
    selected?: boolean;
}

export default function ToggleButton({
    label,
    selected = false,
    className,
    ...props
}: ToggleButtonProps) {
    const { isDark } = useTheme();
    return (
        <TouchableOpacity
            className={`flex-row items-center rounded-lg ${className}`}
            {...props}
        >
            <View
                className={`mr-3 h-4 w-4 rounded-md
                    ${ isDark ?
                        selected ? 'bg-white' : 'bg-white/10' :
                        selected ? 'bg-black' : 'bg-black/10'
                    }
                `}
            />
            <Text className={`font-instrument-serif text-base ${
                isDark ?
                    selected ? 'text-white' : 'text-white/30' :
                    selected ? 'text-black' : 'text-black/30'
            }`}>{label}</Text>
        </TouchableOpacity>
    );
}
// isDark ? '#000000' : '#ffffff'
