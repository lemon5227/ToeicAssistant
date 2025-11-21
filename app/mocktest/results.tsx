import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GuofengBackground, PaperCard, InkButton, SealText } from '../../components/ui/GuofengComponents';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MockTestResults() {
    const router = useRouter();
    const { testNumber, score, total, timeTaken, listeningScore, readingScore } = useLocalSearchParams();

    const scoreNum = parseInt(score as string);
    const totalNum = parseInt(total as string);
    const timeTakenNum = parseInt(timeTaken as string);
    const listeningScoreNum = parseInt(listeningScore as string);
    const readingScoreNum = parseInt(readingScore as string);

    const percentage = ((scoreNum / totalNum) * 100).toFixed(1);
    
    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}小时 ${minutes}分钟 ${secs}秒`;
        }
        return `${minutes}分钟 ${secs}秒`;
    };

    // Estimate TOEIC score (rough approximation)
    const estimateTOEICScore = (correct: number, total: number) => {
        const percentage = correct / total;
        return Math.round(5 + percentage * 490); // Scale to 5-495 range
    };

    const listeningTOEIC = estimateTOEICScore(listeningScoreNum, 100);
    const readingTOEIC = estimateTOEICScore(readingScoreNum, 100);
    const totalTOEIC = listeningTOEIC + readingTOEIC;

    const getPerformanceLevel = (percentage: number) => {
        if (percentage >= 90) return { level: '登峰造极', color: 'text-jade' };
        if (percentage >= 80) return { level: '出类拔萃', color: 'text-jade' };
        if (percentage >= 70) return { level: '渐入佳境', color: 'text-ink' };
        if (percentage >= 60) return { level: '初窥门径', color: 'text-ink/60' };
        return { level: '百废待兴', color: 'text-cinnabar' };
    };

    const performance = getPerformanceLevel(parseFloat(percentage));

    return (
        <GuofengBackground>
            <SafeAreaView className="flex-1">
                <ScrollView contentContainerStyle={{ padding: 20 }}>
                    <SealText type="title" className="mb-2">金榜题名</SealText>
                    <Text className="text-center text-ink/60 font-serif mb-8">模拟考试 {testNumber} 成绩单</Text>

                    {/* Total Score Card */}
                    <PaperCard className="mb-6 items-center py-8">
                        <View className="w-40 h-40 rounded-full border-4 border-ink items-center justify-center mb-4 bg-white/50">
                            <Text className="text-5xl font-bold font-serif text-ink">{totalTOEIC}</Text>
                            <Text className="text-sm text-ink/60 font-serif mt-1">预估总分 / 990</Text>
                        </View>
                        
                        <View className="flex-row items-center mb-2">
                            <Text className="text-ink font-serif text-lg mr-2">评价：</Text>
                            <Text className={`font-serif text-2xl font-bold ${performance.color}`}>
                                {performance.level}
                            </Text>
                        </View>
                        
                        <Text className="text-ink/60 font-serif text-sm">
                            用时：{formatTime(timeTakenNum)}
                        </Text>
                    </PaperCard>

                    {/* Detailed Scores */}
                    <View className="flex-row space-x-4 mb-8">
                        <PaperCard className="flex-1 p-4 items-center bg-white/60">
                            <Text className="text-ink font-serif font-bold mb-2">听力部分</Text>
                            <Text className="text-3xl font-serif text-ink mb-1">{listeningTOEIC}</Text>
                            <Text className="text-xs text-ink/60 font-serif">正确率 {((listeningScoreNum / 100) * 100).toFixed(0)}%</Text>
                        </PaperCard>

                        <PaperCard className="flex-1 p-4 items-center bg-white/60">
                            <Text className="text-ink font-serif font-bold mb-2">阅读部分</Text>
                            <Text className="text-3xl font-serif text-ink mb-1">{readingTOEIC}</Text>
                            <Text className="text-xs text-ink/60 font-serif">正确率 {((readingScoreNum / 100) * 100).toFixed(0)}%</Text>
                        </PaperCard>
                    </View>

                    {/* Action Buttons */}
                    <InkButton onPress={() => router.push('/')} className="mb-4">
                        返回首页
                    </InkButton>
                    
                    <InkButton onPress={() => router.push('/mocktest')} variant="outline">
                        再试一次
                    </InkButton>
                </ScrollView>
            </SafeAreaView>
        </GuofengBackground>
    );
}
