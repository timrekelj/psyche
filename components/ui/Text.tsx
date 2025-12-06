import React from 'react';
import { Text as RNText, TextProps } from 'react-native';

interface CustomTextProps extends TextProps {
    variant?:
        | 'heading1'
        | 'heading2'
        | 'heading3'
        | 'body'
        | 'caption'
        | 'link';
    color?: 'primary' | 'secondary' | 'muted' | 'error' | 'success';
    weight?: 'normal' | 'medium' | 'semibold' | 'bold';
    align?: 'left' | 'center' | 'right';
    children: React.ReactNode;
}

export default function Text({
    variant = 'body',
    color = 'primary',
    weight = 'normal',
    align = 'left',
    style,
    className = '',
    children,
    ...props
}: CustomTextProps) {
    const getVariantStyles = () => {
        switch (variant) {
            case 'heading1':
                return 'text-3xl font-instrument-serif-bold';
            case 'heading2':
                return 'text-2xl font-instrument-serif-bold';
            case 'heading3':
                return 'text-xl font-instrument-serif-semibold';
            case 'caption':
                return 'text-sm font-instrument-serif';
            case 'link':
                return 'text-base font-instrument-serif-semibold underline';
            default: // body
                return 'text-base font-instrument-serif';
        }
    };

    const getColorStyles = () => {
        switch (color) {
            case 'secondary':
                return 'text-gray-600';
            case 'muted':
                return 'text-gray-500';
            case 'error':
                return 'text-red-500';
            case 'success':
                return 'text-green-500';
            default: // primary
                return 'text-gray-900';
        }
    };

    const getWeightStyles = () => {
        switch (weight) {
            case 'medium':
                return 'font-instrument-serif-medium';
            case 'semibold':
                return 'font-instrument-serif-semibold';
            case 'bold':
                return 'font-instrument-serif-bold';
            default: // normal
                return 'font-instrument-serif';
        }
    };

    const getAlignStyles = () => {
        switch (align) {
            case 'center':
                return 'text-center';
            case 'right':
                return 'text-right';
            default: // left
                return 'text-left';
        }
    };

    const combinedStyles = `${getVariantStyles()} ${getColorStyles()} ${getWeightStyles()} ${getAlignStyles()} ${className}`;

    return (
        <RNText className={combinedStyles} style={style} {...props}>
            {children}
        </RNText>
    );
}
