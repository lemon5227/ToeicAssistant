import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
    return (
        <SafeAreaView className="flex-1 bg-paper items-center justify-center p-6">
            <StatusBar style="dark" />
            <View className="mb-10 items-center">
                <Text className="text-4xl font-serif font-bold text-ink mb-2">TOEIC Master</Text>
                <Text className="text-lg text-ink/60 italic">Ancient Wisdom, Modern Success</Text>
            </View>

            <View className="w-full gap-4">
                <Link href="/vocabulary" asChild>
                    <TouchableOpacity className="bg-ink py-4 rounded-lg items-center shadow-md active:opacity-90">
                        <Text className="text-paper text-xl font-bold font-serif">Vocabulary Practice</Text>
                        <Text className="text-paper/80 text-sm mt-1">Part 5 & 6</Text>
                    </TouchableOpacity>
                </Link>

                <TouchableOpacity className="bg-paper border-2 border-ink py-4 rounded-lg items-center shadow-sm opacity-50" disabled>
                    <Text className="text-ink text-xl font-bold font-serif">Listening Practice</Text>
                    <Text className="text-ink/60 text-sm mt-1">Coming Soon</Text>
                </TouchableOpacity>

                <TouchableOpacity className="bg-paper border-2 border-ink py-4 rounded-lg items-center shadow-sm opacity-50" disabled>
                    <Text className="text-ink text-xl font-bold font-serif">Reading Practice</Text>
                    <Text className="text-ink/60 text-sm mt-1">Coming Soon</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
