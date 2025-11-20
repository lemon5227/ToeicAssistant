import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DataLoader, Question } from '../../../services/DataLoader';
import { PaperCard, InkButton, SealText } from '../../../components/ui/GuofengComponents';

export default function QuizScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        if (id) {
            const q = DataLoader.getTestQuestions(id);
            setQuestions(q);
        }
    }, [id]);

    const handleOptionPress = (option: string) => {
        if (isAnswered) return;

        setSelectedOption(option);
        setIsAnswered(true);

        const currentQuestion = questions[currentIndex];
        const isCorrect = option === currentQuestion.answer;

        if (isCorrect) {
            setScore(s => s + 1);
        }

        // Auto advance after delay
        setTimeout(() => {
            if (currentIndex < questions.length - 1) {
                setCurrentIndex(i => i + 1);
                setSelectedOption(null);
                setIsAnswered(false);
            } else {
                setIsFinished(true);
            }
        }, 1500);
    };

    if (questions.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-paper items-center justify-center">
                <Text className="text-ink">Loading...</Text>
            </SafeAreaView>
        );
    }

    if (isFinished) {
        return (
            <SafeAreaView className="flex-1 bg-paper items-center justify-center p-6">
                <PaperCard className="w-full items-center py-10">
                    <Text className="text-3xl font-serif font-bold text-ink mb-4">Test Complete</Text>
                    <Text className="text-xl text-ink mb-6">Score: {score} / {questions.length}</Text>

                    <InkButton title="Back to Menu" onPress={() => router.back()} />
                </PaperCard>
            </SafeAreaView>
        );
    }

    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedOption === currentQuestion.answer;

    return (
        <SafeAreaView className="flex-1 bg-paper">
            <View className="flex-row justify-between items-center p-4 border-b border-stone-300">
                <Text className="text-ink font-bold">Question {currentIndex + 1} / {questions.length}</Text>
                <Text className="text-ink">Score: {score}</Text>
            </View>

            <ScrollView className="flex-1 p-4">
                {currentQuestion.passage && (
                    <PaperCard className="mb-4 bg-paper/50 border-stone-200">
                        <Text className="text-ink/80 italic leading-6">{currentQuestion.passage}</Text>
                    </PaperCard>
                )}

                <PaperCard className="mb-6 min-h-[150px] justify-center relative">
                    <Text className="text-xl text-ink font-serif leading-8">{currentQuestion.question}</Text>

                    {isAnswered && (
                        <View className="absolute top-2 right-2 transform rotate-[-15deg]">
                            <SealText type={isCorrect ? 'success' : 'error'}>
                                {isCorrect ? 'CORRECT' : 'WRONG'}
                            </SealText>
                        </View>
                    )}
                </PaperCard>

                <View className="gap-3">
                    {currentQuestion.options.map((option, index) => {
                        const letter = String.fromCharCode(65 + index); // A, B, C, D
                        let variant: 'primary' | 'outline' | 'ghost' = 'outline';

                        if (isAnswered) {
                            if (letter === currentQuestion.answer) {
                                variant = 'primary'; // Show correct answer
                            } else if (letter === selectedOption && selectedOption !== currentQuestion.answer) {
                                variant = 'ghost'; // Show wrong selection
                            }
                        } else if (selectedOption === letter) {
                            variant = 'primary';
                        }

                        return (
                            <InkButton
                                key={index}
                                title={`(${letter}) ${option}`}
                                variant={variant}
                                onPress={() => handleOptionPress(letter)}
                                disabled={isAnswered}
                                className="items-start pl-4"
                                textClassName="text-base font-normal"
                            />
                        );
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
