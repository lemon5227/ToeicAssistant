import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';

interface TestTimerProps {
    totalSeconds: number;
    onTimeUp?: () => void;
    isPaused?: boolean;
}

export function TestTimer({ totalSeconds, onTimeUp, isPaused = false }: TestTimerProps) {
    const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);

    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            setRemainingSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    onTimeUp?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isPaused, onTimeUp]);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const isLowTime = remainingSeconds < 300; // Less than 5 minutes
    const textColor = isLowTime ? 'text-cinnabar-red' : 'text-ink-black';

    return (
        <View className="bg-rice-paper border-2 border-ink-black/20 rounded-lg p-3">
            <Text className="text-ink-black/60 text-xs text-center mb-1">剩余时间</Text>
            <Text className={`${textColor} text-2xl font-serif font-bold text-center`}>
                {formatTime(remainingSeconds)}
            </Text>
        </View>
    );
}
