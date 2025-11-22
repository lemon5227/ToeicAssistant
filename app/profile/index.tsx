import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { GuofengBackground, SealText, GuofengBackButton, PaperCard, InkButton } from '../../components/ui/GuofengComponents';
import { SafeAreaView } from 'react-native-safe-area-context';
import UserProgressService, { UserStats } from '../../services/UserProgressService';
import { Trophy, Target, Flame, Clock } from 'lucide-react-native';

export default function ProfileScreen() {
    const router = useRouter();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const loadStats = async () => {
        const data = await UserProgressService.getUserStats();
        setStats(data);
    };

    useEffect(() => {
        loadStats();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadStats();
        setRefreshing(false);
    };

    if (!stats) return null;

    const accuracy = stats.totalQuestionsAnswered > 0
        ? Math.round((stats.correctAnswers / stats.totalQuestionsAnswered) * 100)
        : 0;

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
                    <SealText type="title" className="mb-2">修身养性</SealText>
                    <Text className="text-center text-ink/60 font-serif mb-8">
                        学而时习之，不亦说乎
                    </Text>

                    {/* Main Stats Card */}
                    <PaperCard className="mb-6 items-center py-8 bg-white/80">
                        <View className="w-32 h-32 rounded-full border-4 border-ink items-center justify-center mb-4 bg-white">
                            <Text className="text-4xl font-bold font-serif text-ink">{accuracy}%</Text>
                            <Text className="text-xs text-ink/60 font-serif mt-1">正确率</Text>
                        </View>

                        <View className="flex-row justify-around w-full mt-4">
                            <View className="items-center">
                                <Text className="text-2xl font-bold text-ink font-serif">{stats.totalQuestionsAnswered}</Text>
                                <Text className="text-xs text-ink/60">刷题总数</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-2xl font-bold text-jade font-serif">{stats.correctAnswers}</Text>
                                <Text className="text-xs text-ink/60">正确题数</Text>
                            </View>
                        </View>
                    </PaperCard>

                    {/* Streak & Activity */}
                    <View className="flex-row space-x-4 mb-6">
                        <PaperCard className="flex-1 p-4 items-center bg-white/60">
                            <Flame size={24} color="#c0392b" className="mb-2" />
                            <Text className="text-2xl font-serif text-ink mb-1">{stats.streakDays}</Text>
                            <Text className="text-xs text-ink/60 font-serif">连续打卡(天)</Text>
                        </PaperCard>

                        <PaperCard className="flex-1 p-4 items-center bg-white/60">
                            <Clock size={24} color="#2c3e50" className="mb-2" />
                            <Text className="text-xs font-serif text-ink mb-1 mt-2 text-center">
                                {stats.lastActiveDate || '暂无记录'}
                            </Text>
                            <Text className="text-xs text-ink/60 font-serif">上次活跃</Text>
                        </PaperCard>
                    </View>

                    {/* Detailed Scores */}
                    <SealText type="info" className="mb-4">能力分布</SealText>
                    <PaperCard className="mb-8 p-4">
                        <View className="flex-row justify-between items-center mb-4 border-b border-stone-200 pb-2">
                            <Text className="text-ink font-serif">听力 (Listening)</Text>
                            <Text className="text-ink font-bold">{stats.listeningScore} pts</Text>
                        </View>
                        <View className="flex-row justify-between items-center mb-4 border-b border-stone-200 pb-2">
                            <Text className="text-ink font-serif">阅读 (Reading)</Text>
                            <Text className="text-ink font-bold">{stats.readingScore} pts</Text>
                        </View>
                        <View className="flex-row justify-between items-center">
                            <Text className="text-ink font-serif">词汇 (Vocabulary)</Text>
                            <Text className="text-ink font-bold">{stats.vocabularyScore} pts</Text>
                        </View>
                    </PaperCard>

                    {/* Actions */}
                    <InkButton
                        onPress={() => router.push('/mistakes')}
                        className="mb-4"
                    >
                        查看错题本
                    </InkButton>

                    <InkButton
                        variant="outline"
                        onPress={async () => {
                            await UserProgressService.clearAllData();
                            loadStats();
                        }}
                    >
                        重置数据
                    </InkButton>
                </ScrollView>
            </SafeAreaView>
        </GuofengBackground>
    );
}
