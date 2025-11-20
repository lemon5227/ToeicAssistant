import React from 'react';
import { Text, TouchableOpacity, View, ViewProps, TouchableOpacityProps, TextProps } from 'react-native';

interface PaperCardProps extends ViewProps {
    children: React.ReactNode;
    className?: string;
}

export const PaperCard: React.FC<PaperCardProps> = ({ children, className, ...props }) => {
    return (
        <View
            className={`bg-paper border border-stone-300 rounded-lg shadow-sm p-4 ${className}`}
            {...props}
        >
            {children}
        </View>
    );
};

interface InkButtonProps extends TouchableOpacityProps {
    title: string;
    variant?: 'primary' | 'outline' | 'ghost';
    textClassName?: string;
}

export const InkButton: React.FC<InkButtonProps> = ({ title, variant = 'primary', className, textClassName, ...props }) => {
    let containerClass = "py-3 px-6 rounded-full items-center justify-center";
    let textClass = "font-serif text-lg";

    if (variant === 'primary') {
        containerClass += " bg-ink";
        textClass += " text-paper font-bold";
    } else if (variant === 'outline') {
        containerClass += " border-2 border-ink bg-transparent";
        textClass += " text-ink font-bold";
    } else {
        containerClass += " bg-transparent";
        textClass += " text-ink underline";
    }

    return (
        <TouchableOpacity className={`${containerClass} ${className}`} {...props}>
            <Text className={`${textClass} ${textClassName}`}>{title}</Text>
        </TouchableOpacity>
    );
};

interface SealTextProps extends TextProps {
    children: React.ReactNode;
    type?: 'success' | 'error' | 'info';
}

export const SealText: React.FC<SealTextProps> = ({ children, type = 'info', className, ...props }) => {
    let colorClass = "text-cinnabar border-cinnabar";
    if (type === 'success') colorClass = "text-jade border-jade";
    if (type === 'error') colorClass = "text-cinnabar border-cinnabar";
    if (type === 'info') colorClass = "text-ink border-ink";

    return (
        <View className={`border-2 rounded-sm px-2 py-1 items-center justify-center rotate-[-10deg] opacity-90 self-start ${colorClass.replace('text-', 'border-')}`}>
            <Text className={`font-serif font-bold uppercase tracking-widest ${colorClass} ${className}`} {...props}>
                {children}
            </Text>
        </View>
    );
};
