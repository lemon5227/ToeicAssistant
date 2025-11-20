import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { DataLoader } from '../../services/DataLoader';
import { PaperCard, SealText } from '../../components/ui/GuofengComponents';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VocabularyHome() {
    const router = useRouter();
    const tests = DataLoader.getVocabularyTests();

    return (
        <SafeAreaView className="flex-1 bg-paper">
            <ScrollView className="p-4">
                <View className="mb-6 items-center">
                    <Text className="text-3xl font-serif font-bold text-ink mb-2">Vocabulary Practice</Text>
                    <Text className="text-ink/60 italic">Select a test to begin</Text>
                </View>

                <View className="gap-4 pb-8">
                    {tests.map((test) => (
                        <TouchableOpacity
                            key={test.id}
                            onPress={() => router.push(`/vocabulary/quiz/${test.id}`)}
                            activeOpacity={0.8}
                        >
                            <PaperCard className="flex-row items-center justify-between">
                                <View>
                                    <Text className="text-xl font-bold text-ink">{test.title}</Text>
                                    <Text className="text-ink/60 mt-1">Part 5 & 6 • ~46 Questions</Text>
                                </View>
                                <SealText type="info">START</SealText>
                            </PaperCard>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
