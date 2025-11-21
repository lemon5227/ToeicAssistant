import React from 'react';
import { View, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { DataLoader } from '../../services/DataLoader';
import { GuofengBackground, SealText, GuofengListCard, GuofengBackButton } from '../../components/ui/GuofengComponents';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReadingHome() {
    const router = useRouter();
    const tests = DataLoader.getVocabularyTests(); // Reuse the same data structure

    return (
        <GuofengBackground>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ padding: 20, flex: 1 }}>
                    <GuofengBackButton />
                    <SealText type="title">经史阅览</SealText>
                    <SealText type="info" style={{ alignSelf: 'center', marginBottom: 30 }}>Reading Practice</SealText>

                    <FlatList
                        data={tests}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item, index }) => (
                            <GuofengListCard
                                title={item.title.replace('Vocabulary', 'Reading')}
                                subtitle="Part 7 • 阅读理解"
                                index={index}
                                onPress={() => router.push(`/reading/quiz/${item.id}`)}
                            />
                        )}
                    />
                </View>
            </SafeAreaView>
        </GuofengBackground>
    );
}
