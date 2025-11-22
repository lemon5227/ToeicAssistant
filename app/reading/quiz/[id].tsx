import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Animated, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { DataLoader, Question } from '../../../services/DataLoader';
import UserProgressService from '../../../services/UserProgressService';
import { GuofengBackground, SealText, GuofengBackButton, InkButton, PaperCard, CorrectStamp, WrongStamp } from '../../../components/ui/GuofengComponents';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// --- 选项组件 (复用) ---
const OptionButton = ({ 
    label, 
    text, 
    selected, 
    isCorrect, 
    showResult, 
    onPress 
}: { 
    label: string; 
    text: string; 
    selected: boolean; 
    isCorrect?: boolean; 
    showResult: boolean; 
    onPress: () => void 
}) => {
    let bgClass = "bg-white/80 border-stone-300";
    let textClass = "text-ink";
    
    if (selected) {
        if (showResult) {
            bgClass = isCorrect ? "bg-jade/10 border-jade" : "bg-cinnabar/10 border-cinnabar";
            textClass = isCorrect ? "text-jade font-bold" : "text-cinnabar font-bold";
        } else {
            bgClass = "bg-ink border-ink";
            textClass = "text-paper font-bold";
        }
    } else if (showResult && isCorrect) {
        bgClass = "bg-jade/10 border-jade";
        textClass = "text-jade font-bold";
    }

    return (
        <InkButton 
            onPress={onPress}
            activeOpacity={0.9}
            className={`flex-row items-start justify-start mb-2 px-3 py-3 border rounded-lg ${bgClass}`}
            disabled={showResult}
        >
            <View className={`w-6 h-6 rounded-full border items-center justify-center mr-2 ${selected ? 'border-transparent bg-white/20' : 'border-stone-400'}`}>
                <Text className={`font-serif text-xs font-bold ${selected ? textClass : 'text-stone-500'}`}>{label}</Text>
            </View>
            <Text className={`flex-1 font-serif text-sm leading-5 ${textClass}`}>{text}</Text>

            {showResult && (selected || isCorrect) && (
                <>
                    {isCorrect ? (
                        <CorrectStamp />
                    ) : (
                        selected && <WrongStamp />
                    )}
                </>
            )}
        </InkButton>
    );
};export default function ReadingQuiz() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    // Get Part 7 questions (147-200)
    const allQuestions = DataLoader.getTestQuestions(id as string, [7]);

    // Group questions by passage
    const questionGroups = useMemo(() => {
        const groups: { passage: string; questions: Question[] }[] = [];
        let currentPassage = '';
        let currentGroup: Question[] = [];

        allQuestions.forEach((q, index) => {
            if (q.passage && q.passage !== currentPassage) {
                // New passage starts
                if (currentGroup.length > 0) {
                    groups.push({ passage: currentPassage, questions: currentGroup });
                }
                currentPassage = q.passage;
                currentGroup = [q];
            } else {
                // Same passage continues
                currentGroup.push(q);
            }

            // Push the last group
            if (index === allQuestions.length - 1 && currentGroup.length > 0) {
                groups.push({ passage: currentPassage, questions: currentGroup });
            }
        });

        return groups;
    }, [allQuestions]);

    const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [showFeedback, setShowFeedback] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    // 进场动画
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, [currentGroupIndex]);

    if (questionGroups.length === 0) {
        return (
            <GuofengBackground>
                <View className="flex-1 justify-center items-center">
                    <Text className="text-ink font-serif">加载中...</Text>
                </View>
            </GuofengBackground>
        );
    }

    if (isFinished) {
        return (
            <GuofengBackground>
                <SafeAreaView className="flex-1 justify-center items-center p-6">
                    <PaperCard className="w-full items-center py-10">
                        <SealText type="title" className="mb-4">阅读考核结束</SealText>
                        <View className="w-32 h-32 rounded-full border-4 border-ink items-center justify-center mb-6">
                            <Text className="text-4xl font-bold font-serif text-ink">{score}</Text>
                            <Text className="text-sm text-ink/60">/ {allQuestions.length}</Text>
                        </View>
                        <InkButton onPress={() => router.back()} className="w-48">
                            返回
                        </InkButton>
                    </PaperCard>
                </SafeAreaView>
            </GuofengBackground>
        );
    }

    const currentGroup = questionGroups[currentGroupIndex];
    const isLastGroup = currentGroupIndex === questionGroups.length - 1;

    const handleAnswerSelect = (questionId: string, option: string) => {
        if (showFeedback) return;
        setAnswers({ ...answers, [questionId]: option });
    };

    const handleSubmit = async () => {
        setShowFeedback(true);

        // Calculate score for current group
        let groupScore = 0;
        let correctCount = 0;
        let totalCount = 0;

        for (const q of currentGroup.questions) {
            totalCount++;
            const selectedIndex = q.options.indexOf(answers[q.id]);
            const selectedLetter = selectedIndex >= 0 ? String.fromCharCode(65 + selectedIndex) : '';
            const isCorrect = selectedLetter === q.answer;

            if (isCorrect) {
                groupScore++;
                correctCount++;
            } else {
                // Save wrong question
                await UserProgressService.saveWrongQuestion({
                    id: q.id,
                    testId: id as string,
                    section: 'reading',
                    question: q.question,
                    userAnswer: selectedLetter,
                    correctAnswer: q.answer || '',
                    explanation: q.explanation,
                    timestamp: Date.now(),
                });
            }

            // Update stats per question
            await UserProgressService.updateStats(isCorrect, 'reading');
        }

        setScore(score + groupScore);
    };

    const handleNext = () => {
        if (isLastGroup) {
            setIsFinished(true);
        } else {
            setCurrentGroupIndex(currentGroupIndex + 1);
            setShowFeedback(false);
        }
    };

    const allQuestionsAnswered = currentGroup.questions.every(q => answers[q.id]);

    return (
        <GuofengBackground>
            <SafeAreaView className="flex-1">
                <View className="px-4 pt-2">
                    <GuofengBackButton />
                </View>

                <ScrollView contentContainerStyle={{ padding: 20 }}>
                    <SealText type="title" className="mb-2">阅读理解 Test {id}</SealText>
                    <Text className="text-ink/60 text-center mb-6 font-serif">
                        文章 {currentGroupIndex + 1} / {questionGroups.length}
                    </Text>

                    <Animated.View style={{ opacity: fadeAnim }}>
                        {/* Passage Display */}
                        {currentGroup.passage && (
                            <PaperCard className="mb-6 p-5 bg-white/60 border-ink/10">
                                <Text className="text-ink font-serif leading-7 text-base">
                                    {currentGroup.passage.replace(/\\n/g, '\n')}
                                </Text>
                            </PaperCard>
                        )}

                        {/* Questions */}
                        {currentGroup.questions.map((question, qIndex) => {
                            const questionNumber = parseInt(question.id);

                            return (
                                <View key={question.id} className="mb-8">
                                    <View className="flex-row items-center mb-3">
                                        <View className="bg-ink px-2 py-1 rounded mr-2">
                                            <Text className="text-paper font-bold text-xs">Q{questionNumber}</Text>
                                        </View>
                                        <Text className="text-ink font-serif font-bold flex-1">
                                            {question.question.replace(/\\n/g, '\n')}
                                        </Text>
                                    </View>

                                    {/* Options */}
                                    <View>
                                        {question.options.map((option, index) => {
                                            const optionLetter = String.fromCharCode(65 + index);
                                            const isSelected = answers[question.id] === option;
                                            const isCorrect = optionLetter === question.answer;

                                            return (
                                                <OptionButton
                                                    key={index}
                                                    label={optionLetter}
                                                    text={option}
                                                    selected={isSelected}
                                                    isCorrect={isCorrect}
                                                    showResult={showFeedback}
                                                    onPress={() => handleAnswerSelect(question.id, option)}
                                                />
                                            );
                                        })}
                                    </View>

                                    {/* Explanation */}
                                    {showFeedback && question.explanation && (
                                        <PaperCard className="mt-4 bg-red-50 border-red-200">
                                            <Text className="text-ink font-bold mb-2">解析</Text>
                                            <Text className="text-ink leading-6">{question.explanation}</Text>
                                        </PaperCard>
                                    )}
                                </View>
                            );
                        })}

                        {/* Action Buttons */}
                        <View className="mb-10">
                            {!showFeedback ? (
                                <InkButton
                                    onPress={handleSubmit}
                                    disabled={!allQuestionsAnswered}
                                    className={!allQuestionsAnswered ? "opacity-50" : ""}
                                >
                                    提交本页答案
                                </InkButton>
                            ) : (
                                <InkButton onPress={handleNext} variant="outline">
                                    {isLastGroup ? '查看结果' : '下一篇文章'}
                                </InkButton>
                            )}
                        </View>
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        </GuofengBackground>
    );
}
