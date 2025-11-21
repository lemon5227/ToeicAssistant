import React from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { DataLoader } from '../../services/DataLoader';
import { GuofengBackground, SealText, GuofengListCard, GuofengBackButton } from '../../components/ui/GuofengComponents';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VocabularyHome() {
    const router = useRouter();
    const tests = DataLoader.getVocabularyTests();

    return (
        <GuofengBackground>
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
                    <GuofengBackButton />
                    <SealText type="title">词汇研习</SealText>
                    <SealText type="info" style={{ alignSelf: 'center', marginBottom: 30 }}>Vocabulary Practice</SealText>

                    <View>
                        {tests.map((test, index) => (
                            <GuofengListCard
                                key={test.id}
                                title={test.title}
                                subtitle="Part 5 & 6 • ~46 Questions"
                                index={index}
                                onPress={() => router.push(`/vocabulary/quiz/${test.id}`)}
                            />
                        ))}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </GuofengBackground>
    );
}
