import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DataLoader, Question } from '../../../services/DataLoader';
import UserProgressService from '../../../services/UserProgressService';
import { PaperCard, InkButton, SealText, CorrectStamp, WrongStamp } from '../../../components/ui/GuofengComponents';
import Svg, { Path } from 'react-native-svg';

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

    const handleOptionPress = async (option: string) => { // Made async
        if (isAnswered) return;

        setSelectedOption(option);
        setIsAnswered(true);

        const currentQuestion = questions[currentIndex];
        const isCorrect = option === currentQuestion.answer;

        if (isCorrect) {
            setScore(s => s + 1);
            // Auto advance if correct
            setTimeout(() => {
                nextQuestion();
            }, 1000);
        } else {
            // Save wrong question
            await UserProgressService.saveWrongQuestion({
                id: currentQuestion.id,
                testId: id as string,
                section: 'vocabulary', // Assuming 'vocabulary' as section
                question: currentQuestion.question,
                userAnswer: option,
                correctAnswer: currentQuestion.answer || '',
                explanation: currentQuestion.explanation,
                timestamp: Date.now(),
            });
        }

        // Update stats
        await UserProgressService.updateStats(isCorrect, 'vocabulary');
        // If wrong, stay on screen to show explanation
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(i => i + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setIsFinished(true);
        }
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

                    <InkButton onPress={() => router.back()}>Back to Menu</InkButton>
                </PaperCard>
            </SafeAreaView>
        );
    }

    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedOption === currentQuestion.answer;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F2E6D8' }}>
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(0,0,0,0.1)',
                backgroundColor: '#F2E6D8'
            }}>
                <Text style={{
                    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: '#2c2c2c'
                }}>Question {currentIndex + 1} / {questions.length}</Text>
                <Text style={{
                    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: '#8b0000'
                }}>Score: {score}</Text>
            </View>

            <ScrollView className="flex-1 p-4">
                {currentQuestion.passage && (
                    <PaperCard className="mb-4 bg-paper/50 border-stone-200">
                        <Text className="text-ink/80 italic leading-6">{currentQuestion.passage}</Text>
                    </PaperCard>
                )}

                <PaperCard className="mb-6 min-h-[150px] justify-center relative border border-stone-200">
                    <Text style={{
                        fontSize: 20,
                        color: '#1a1a1a',
                        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
                        lineHeight: 32
                    }}>{currentQuestion.question}</Text>

                    {isAnswered && (
                        <View style={{ position: 'absolute', top: 8, right: 8 }}>
                            <View style={{
                                transform: [{ rotate: '-10deg' }],
                                borderWidth: 2,
                                borderColor: '#8b0000',
                                borderRadius: 4,
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                backgroundColor: isCorrect ? 'rgba(139, 0, 0, 0.05)' : 'rgba(139, 0, 0, 0.1)'
                            }}>
                                <Text style={{
                                    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
                                    fontSize: 14,
                                    fontWeight: 'bold',
                                    color: '#8b0000',
                                    letterSpacing: 1
                                }}>
                                    {isCorrect ? '正確' : '錯誤'}
                                </Text>
                            </View>
                        </View>
                    )}
                </PaperCard>

                {isAnswered && !isCorrect && currentQuestion.explanation && (
                    <PaperCard className="mb-6 bg-red-50 border-red-200">
                        <Text className="text-ink font-bold mb-2">Explanation</Text>
                        <Text style={{
                            fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
                            color: '#1a1a1a',
                            lineHeight: 24
                        }}>{currentQuestion.explanation}</Text>
                    </PaperCard>
                )}

                <View className="space-y-3 mb-6">
                    {currentQuestion.options.map((option, index) => {
                        const letter = String.fromCharCode(65 + index);
                        const isCorrectAnswer = letter === currentQuestion.answer;
                        const isUserSelection = selectedOption === letter;

                        let customStyle = {};
                        let showCircle = false;
                        let showCross = false;

                        // Determine styling and marks
                        if (isAnswered) {
                            // After answering, all buttons remain outline style
                            // Show marks on correct answer and wrong selection
                            if (isCorrectAnswer) {
                                showCircle = true;
                            } else if (isUserSelection) {
                                showCross = true;
                            }
                        } else if (isUserSelection) {
                            // Before answering, selected button gets cinnabar style
                            customStyle = {
                                borderColor: '#8b0000',
                                borderWidth: 2,
                                backgroundColor: 'rgba(139, 0, 0, 0.05)'
                            };
                        }

                        return (
                            <View key={index} style={{ position: 'relative' }}>
                                <InkButton
                                    variant="outline"
                                    onPress={() => handleOptionPress(letter)}
                                    disabled={isAnswered}
                                    className="items-start pl-4"
                                    textClassName="text-base font-normal"
                                    style={customStyle}
                                >
                                    <Text style={{
                                        fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
                                        color: isUserSelection && !isAnswered ? '#8b0000' : '#1a1a1a',
                                        fontWeight: isUserSelection && !isAnswered ? 'bold' : 'normal'
                                    }}>
                                        {`(${letter}) ${option}`}
                                    </Text>
                                </InkButton>

                                {/* Brush Stroke Marks */}
                                {showCircle && <CorrectStamp />}
                                {showCross && <WrongStamp />}
                            </View>
                        );
                    })}
                </View>

                {isAnswered && !isCorrect && (
                    <InkButton onPress={nextQuestion} className="mb-8">
                        Next Question
                    </InkButton>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
