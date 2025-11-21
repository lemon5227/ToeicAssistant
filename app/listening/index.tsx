import React from 'react';
import { View, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { DataLoader } from '../../services/DataLoader';
import { GuofengBackground, SealText, GuofengListCard, GuofengBackButton } from '../../components/ui/GuofengComponents';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ListeningHome() {
    const router = useRouter();
    const tests = DataLoader.getListeningTests();

    return (
        <GuofengBackground>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ padding: 20, flex: 1 }}>
                    <GuofengBackButton />
                    <SealText type="title">听音辨律</SealText>
                    <SealText type="info" style={{ alignSelf: 'center', marginBottom: 30 }}>Listening Practice</SealText>

                    <FlatList
                        data={tests}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item, index }) => (
                            <GuofengListCard
                                title={item.title}
                                subtitle="100 题 • 含音频"
                                index={index}
                                onPress={() => router.push(`/listening/quiz/${item.id}`)}
                            />
                        )}
                    />
                </View>
            </SafeAreaView>
        </GuofengBackground>
    );
}
