import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Animated, Dimensions, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { DataLoader, Question } from '../../../services/DataLoader';
import { GuofengBackground, SealText, GuofengBackButton, InkButton, PaperCard } from '../../../components/ui/GuofengComponents';
import { TestTimer } from '../../../components/ui/TestTimer';
import { AudioPlayer } from '../../../components/ui/AudioPlayer';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type TestSection = 'listening' | 'reading';

// --- 选项组件 (复用) ---
const OptionButton = ({ 
    label, 
    text, 
    selected, 
    onPress 
}: { 
    label: string; 
    text: string; 
    selected: boolean; 
    onPress: () => void 
}) => {
    let bgClass = "bg-white/80 border-stone-300";
    let textClass = "text-ink";
    
    if (selected) {
        bgClass = "bg-ink border-ink";
        textClass = "text-paper font-bold";
    }

    return (
        <InkButton 
            onPress={onPress}
            activeOpacity={0.9}
            className={`flex-row items-start justify-start mb-2 px-3 py-3 border rounded-lg ${bgClass}`}
        >
            <View className={`w-6 h-6 rounded-full border items-center justify-center mr-2 ${selected ? 'border-transparent bg-white/20' : 'border-stone-400'}`}>
                <Text className={`font-serif text-xs font-bold ${selected ? textClass : 'text-stone-500'}`}>{label}</Text>
            </View>
            <Text className={`flex-1 font-serif text-sm leading-5 ${textClass}`}>{text}</Text>
        </InkButton>
    );
};

export default function MockTest() {
    const { testNumber } = useLocalSearchParams();
    const router = useRouter();

    const [currentSection, setCurrentSection] = useState<TestSection>('listening');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [startTime] = useState(Date.now());

    // Load test data
    const listeningTest = DataLoader.getListeningTestById(`listening_test_${String(testNumber).padStart(2, '0')}`);
    const readingQuestions = DataLoader.getTestQuestions(`Test ${String(testNumber).padStart(2, '0')}`, [7]);

    const allQuestions = [
        ...(listeningTest?.questions || []),
        ...readingQuestions
    ];

    const listeningQuestionsCount = listeningTest?.questions.length || 0;
    const currentQuestion = allQuestions[currentQuestionIndex];
    const isListeningSection = currentQuestionIndex < listeningQuestionsCount;

    // 进场动画
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }, [currentQuestionIndex]);

    // Timer: 120 minutes total (7200 seconds)
    const handleTimeUp = () => {
        Alert.alert('时间到', '考试时间已结束，将自动提交答案。', [
            { text: '确定', onPress: () => finishTest() }
        ]);
    };

    const handleAnswerSelect = (option: string) => {
        setAnswers({ ...answers, [currentQuestion.id]: option });
    };

    const handleNext = () => {
        if (currentQuestionIndex < allQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);

            // Switch section when moving from listening to reading
            if (currentQuestionIndex + 1 === listeningQuestionsCount) {
                setCurrentSection('reading');
            }
        } else {
            finishTest();
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);

            // Switch section when moving from reading to listening
            if (currentQuestionIndex === listeningQuestionsCount) {
                setCurrentSection('listening');
            }
        }
    };

    const finishTest = () => {
        const endTime = Date.now();
        const timeTaken = Math.floor((endTime - startTime) / 1000);

        // Calculate score
        let correctCount = 0;
        allQuestions.forEach(q => {
            const selectedIndex = q.options.indexOf(answers[q.id]);
            const selectedLetter = selectedIndex >= 0 ? String.fromCharCode(65 + selectedIndex) : '';
            if (selectedLetter === q.answer) {
                correctCount++;
            }
        });

        // Navigate to results page
        router.push({
            pathname: '/mocktest/results',
            params: {
                testNumber,
                score: correctCount,
                total: allQuestions.length,
                timeTaken,
                listeningScore: calculateSectionScore(0, listeningQuestionsCount),
                readingScore: calculateSectionScore(listeningQuestionsCount, allQuestions.length)
            }
        });
    };

    const calculateSectionScore = (start: number, end: number) => {
        let correct = 0;
        for (let i = start; i < end; i++) {
            const q = allQuestions[i];
            const selectedIndex = q.options.indexOf(answers[q.id]);
            const selectedLetter = selectedIndex >= 0 ? String.fromCharCode(65 + selectedIndex) : '';
            if (selectedLetter === q.answer) {
                correct++;
            }
        }
        return correct;
    };

    if (!listeningTest || readingQuestions.length === 0) {
        return (
            <GuofengBackground>
                <View className="flex-1 justify-center items-center">
                    <Text className="text-ink font-serif">加载测试数据...</Text>
                </View>
            </GuofengBackground>
        );
    }

    const progress = ((currentQuestionIndex + 1) / allQuestions.length) * 100;

    return (
        <GuofengBackground>
            <SafeAreaView className="flex-1">
                {/* Header with Timer */}
                <View className="px-4 pt-2 pb-4 border-b border-ink/10 bg-white/30">
                    <View className="flex-row justify-between items-center mb-3">
                        <GuofengBackButton />
                        <View className="bg-ink/10 px-3 py-1 rounded-full border border-ink/20">
                            <TestTimer totalSeconds={7200} onTimeUp={handleTimeUp} />
                        </View>
                    </View>

                    <View className="flex-row justify-between items-center mb-2">
                        <View className="flex-row items-center">
                            <View className={`w-2 h-2 rounded-full mr-2 ${currentSection === 'listening' ? 'bg-jade' : 'bg-cinnabar'}`} />
                            <Text className="text-ink font-serif font-bold">
                                {currentSection === 'listening' ? '听力部分' : '阅读部分'}
                            </Text>
                        </View>
                        <Text className="text-ink/60 font-serif text-sm">
                            题目 {currentQuestionIndex + 1} / {allQuestions.length}
                        </Text>
                    </View>

                    {/* Progress Bar */}
                    <View className="h-1.5 bg-ink/10 rounded-full overflow-hidden w-full">
                        <View
                            className="h-full bg-ink"
                            style={{ width: `${progress}%` }}
                        />
                    </View>
                </View>

                <ScrollView contentContainerStyle={{ padding: 20 }}>
                    <Animated.View style={{ opacity: fadeAnim }}>
                        {/* Audio Player for Listening Section */}
                        {isListeningSection && listeningTest.audioUri && (
                            <PaperCard className="mb-6 bg-ink/5 border-ink/10 py-4">
                                <View className="items-center">
                                    <AudioPlayer audioUri={listeningTest.audioUri} />
                                    <Text className="text-center text-ink/60 font-serif text-xs mt-2">
                                        请仔细听题
                                    </Text>
                                </View>
                            </PaperCard>
                        )}

                        {/* Passage for Reading Section */}
                        {!isListeningSection && currentQuestion.passage && (
                            <PaperCard className="mb-6 p-4 bg-white/60 border-ink/10">
                                <Text className="text-ink font-serif leading-6 text-sm">
                                    {currentQuestion.passage.replace(/\\n/g, '\n')}
                                </Text>
                            </PaperCard>
                        )}

                        {/* Question Card */}
                        <View className="mb-4">
                            <View className="flex-row items-start mb-4">
                                <View className="bg-ink px-2 py-1 rounded mr-2 mt-1">
                                    <Text className="text-paper font-bold text-xs">Q{currentQuestion.id}</Text>
                                </View>
                                <Text className="text-ink font-serif font-bold text-lg flex-1 leading-7">
                                    {currentQuestion.question.replace(/\\n/g, '\n')}
                                </Text>
                            </View>

                            {/* Options */}
                            <View>
                                {currentQuestion.options.map((option, index) => {
                                    const optionLetter = String.fromCharCode(65 + index);
                                    const isSelected = answers[currentQuestion.id] === option;

                                    return (
                                        <OptionButton
                                            key={index}
                                            label={optionLetter}
                                            text={option}
                                            selected={isSelected}
                                            onPress={() => handleAnswerSelect(option)}
                                        />
                                    );
                                })}
                            </View>
                        </View>
                    </Animated.View>
                </ScrollView>

                {/* Navigation Buttons */}
                <View className="p-4 border-t border-ink/10 bg-white/50 flex-row space-x-3">
                    <InkButton
                        onPress={handlePrevious}
                        disabled={currentQuestionIndex === 0}
                        variant="outline"
                        className="flex-1"
                    >
                        上一题
                    </InkButton>

                    {currentQuestionIndex === allQuestions.length - 1 ? (
                        <InkButton
                            onPress={finishTest}
                            className="flex-1 bg-cinnabar border-cinnabar"
                        >
                            提交试卷
                        </InkButton>
                    ) : (
                        <InkButton
                            onPress={handleNext}
                            className="flex-1"
                        >
                            下一题
                        </InkButton>
                    )}
                </View>
            </SafeAreaView>
        </GuofengBackground>
    );
}
