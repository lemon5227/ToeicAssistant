import React from 'react';
import { View, FlatList, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { DataLoader } from '../../services/DataLoader';
import { GuofengBackground, SealText, GuofengListCard, PaperCard, GuofengBackButton } from '../../components/ui/GuofengComponents';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MockTestHome() {
    const router = useRouter();
    const tests = DataLoader.getListeningTests();

    return (
        <GuofengBackground>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ padding: 20, flex: 1 }}>
                    <GuofengBackButton />
                    <SealText type="title">金榜夺魁</SealText>
                    <SealText type="info" style={{ alignSelf: 'center', marginBottom: 20 }}>Mock Test</SealText>

                    <PaperCard className="mb-6 p-4 bg-white/60">
                        <Text className="text-sm leading-6 text-ink font-serif">
                            完整的TOEIC模拟考试包含听力和阅读两部分：{'\n'}
                            • 听力部分：100题，约45分钟{'\n'}
                            • 阅读部分：100题，75分钟{'\n'}
                            总计：200题，120分钟
                        </Text>
                    </PaperCard>

                    <Text className="text-lg font-bold text-ink mb-3 font-serif">选择测试：</Text>

                    <FlatList
                        data={tests}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item, index }) => {
                            const testNumber = item.id.replace('listening_test_', '');
                            return (
                                <GuofengListCard
                                    title={`模拟考试 ${testNumber}`}
                                    subtitle="听力 + 阅读 • 120分钟 • 200题"
                                    index={index}
                                    onPress={() => router.push(`/mocktest/test/${testNumber}`)}
                                />
                            );
                        }}
                    />
                </View>
            </SafeAreaView>
        </GuofengBackground>
    );
}
