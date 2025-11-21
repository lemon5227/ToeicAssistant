import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { InkButton } from './GuofengComponents';
import { Play, Pause, Square } from 'lucide-react-native';

interface AudioPlayerProps {
    audioUri: any;
    onPlaybackStatusUpdate?: (status: any) => void;
}

export function AudioPlayer({ audioUri, onPlaybackStatusUpdate }: AudioPlayerProps) {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [duration, setDuration] = useState(0);
    const [position, setPosition] = useState(0);

    const isMounted = React.useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
            if (sound) {
                console.log('Unloading sound on unmount');
                sound.unloadAsync();
            }
        };
    }, [sound]);

    async function loadAndPlaySound() {
        if (isLoading) return;

        try {
            setIsLoading(true);

            // Set audio mode to stop other audio
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
                interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
                interruptionModeIOS: InterruptionModeIOS.DoNotMix,
            });

            const { sound: newSound } = await Audio.Sound.createAsync(
                audioUri,
                { shouldPlay: true },
                onPlaybackStatusUpdate
            );

            if (!isMounted.current) {
                console.log('Component unmounted during load, unloading sound');
                await newSound.unloadAsync();
                return;
            }

            setSound(newSound);
            setIsPlaying(true);

            newSound.setOnPlaybackStatusUpdate((status: any) => {
                if (!isMounted.current) return;

                if (status.isLoaded) {
                    setDuration(status.durationMillis || 0);
                    setPosition(status.positionMillis || 0);
                    setIsPlaying(status.isPlaying);

                    if (status.didJustFinish) {
                        setIsPlaying(false);
                        setPosition(0);
                    }
                }
            });
        } catch (error) {
            console.error('Error loading sound:', error);
        } finally {
            if (isMounted.current) {
                setIsLoading(false);
            }
        }
    }

    async function togglePlayPause() {
        if (!sound) {
            await loadAndPlaySound();
            return;
        }

        if (isPlaying) {
            await sound.pauseAsync();
        } else {
            await sound.playAsync();
        }
    }

    async function stopSound() {
        if (sound) {
            await sound.stopAsync();
            await sound.setPositionAsync(0);
            setPosition(0);
            setIsPlaying(false);
        }
    }

    function formatTime(millis: number) {
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    return (
        <View className="bg-white/60 border border-stone-300 rounded-xl p-4 w-full">
            <View className="flex-row justify-between items-center mb-3">
                <Text className="text-ink font-serif text-sm">音频播放</Text>
                <Text className="text-ink/60 text-xs font-serif">
                    {formatTime(position)} / {formatTime(duration)}
                </Text>
            </View>

            {/* Progress Bar (Simple) */}
            <View className="h-1 bg-stone-200 rounded-full mb-4 overflow-hidden">
                <View
                    className="h-full bg-ink"
                    style={{ width: `${duration > 0 ? (position / duration) * 100 : 0}%` }}
                />
            </View>

            <View className="flex-row justify-center items-center space-x-6">
                <InkButton
                    onPress={togglePlayPause}
                    disabled={isLoading}
                    className="w-12 h-12 rounded-full items-center justify-center p-0"
                >
                    {isLoading ? (
                        <ActivityIndicator color="#f2e6d8" size="small" />
                    ) : isPlaying ? (
                        <Pause size={20} color="#f2e6d8" fill="#f2e6d8" />
                    ) : (
                        <Play size={20} color="#f2e6d8" fill="#f2e6d8" style={{ marginLeft: 2 }} />
                    )}
                </InkButton>

                <InkButton
                    onPress={stopSound}
                    disabled={!sound}
                    className="w-10 h-10 rounded-full items-center justify-center p-0 bg-stone-600 border-stone-600"
                >
                    <Square size={16} color="#f2e6d8" fill="#f2e6d8" />
                </InkButton>
            </View>
        </View>
    );
}
