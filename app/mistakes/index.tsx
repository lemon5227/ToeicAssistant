import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { GuofengBackground, SealText, GuofengBackButton, PaperCard, InkButton } from '../../components/ui/GuofengComponents';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserProgressService, { WrongQuestion } from '../../services/UserProgressService';

export default function MistakesBook() {
    const router = useRouter();
    const [mistakes, setMistakes] = useState<WrongQuestion[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadMistakes = async () => {
        const data = await UserProgressService.getWrongQuestions();
        setMistakes(data);
    };

    useEffect(() => {
        loadMistakes();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadMistakes();
        setRefreshing(false);
    };

    const handleRemove = async (id: string) => {
        await UserProgressService.removeWrongQuestion(id);
        loadMistakes();
    };

    return (
        <GuofengBackground>
            <SafeAreaView className="flex-1">
                <View className="px-4 pt-2">
                    <GuofengBackButton />
                </View>

                <ScrollView
                    contentContainerStyle={{ padding: 20 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    <SealText type="title" className="mb-2">错题集</SealText>
                    <Text className="text-center text-ink/60 font-serif mb-6">
                        温故而知新，可以为师矣
                    </Text>

                    {mistakes.length === 0 ? (
                        <PaperCard className="items-center py-10">
                            <Text className="text-ink font-serif text-lg mb-2">暂无错题</Text>
                            <Text className="text-ink/60 font-serif text-sm">继续努力练习吧！</Text>
                        </PaperCard>
                    ) : (
                        mistakes.map((item, index) => (
                            <PaperCard key={index} className="mb-4">
                                <View className="flex-row justify-between items-start mb-2">
                                    <View className="bg-cinnabar/10 px-2 py-1 rounded">
                                        <Text className="text-cinnabar text-xs font-bold">
                                            {item.section.toUpperCase()}
                                        </Text>
                                    </View>
                                    <Text className="text-ink/40 text-xs">
                                        {new Date(item.timestamp).toLocaleDateString()}
                                    </Text>
                                </View>

                                <Text className="text-ink font-serif font-bold mb-3 leading-6">
                                    {item.question}
                                </Text>

                                <View className="flex-row mb-2">
                                    <Text className="text-ink/60 text-sm mr-2">你的答案：</Text>
                                    <Text className="text-cinnabar font-bold text-sm">{item.userAnswer}</Text>
                                </View>

                                <View className="flex-row mb-3">
                                    <Text className="text-ink/60 text-sm mr-2">正确答案：</Text>
                                    <Text className="text-jade font-bold text-sm">{item.correctAnswer}</Text>
                                </View>

                                {item.explanation && (
                                    <View className="bg-stone-100 p-3 rounded-lg mb-3">
                                        <Text className="text-ink/80 text-sm leading-5">
                                            {item.explanation}
                                        </Text>
                                    </View>
                                )}

                                <InkButton
                                    variant="outline"
                                    className="self-end"
                                    onPress={() => handleRemove(item.id)}
                                >
                                    已掌握
                                </InkButton>
                            </PaperCard>
                        ))
                    )}
                </ScrollView>
            </SafeAreaView>
        </GuofengBackground>
    );
}
