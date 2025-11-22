import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Animated, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { DataLoader } from '../../../services/DataLoader';
import { GuofengBackground, SealText, GuofengBackButton, InkButton, PaperCard, CorrectStamp, WrongStamp } from '../../../components/ui/GuofengComponents';
import { AudioPlayer } from '../../../components/ui/AudioPlayer';
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
            // 选中且显示结果：对则绿，错则红
            bgClass = isCorrect ? "bg-jade/10 border-jade" : "bg-cinnabar/10 border-cinnabar";
            textClass = isCorrect ? "text-jade font-bold" : "text-cinnabar font-bold";
        } else {
            // 选中但未提交
            bgClass = "bg-ink border-ink";
            textClass = "text-paper font-bold";
        }
    } else if (showResult && isCorrect) {
        // 未选中但正确
        bgClass = "bg-jade/10 border-jade";
        textClass = "text-jade font-bold";
    }

    return (
        <InkButton 
            onPress={onPress}
            activeOpacity={0.9}
            className={`flex-row items-start justify-start mb-3 px-4 py-4 border rounded-xl ${bgClass}`}
            disabled={showResult}
        >
            <View className={`w-8 h-8 rounded-full border items-center justify-center mr-3 ${selected ? 'border-transparent bg-white/20' : 'border-stone-400'}`}>
                <Text className={`font-serif font-bold ${selected ? textClass : 'text-stone-500'}`}>{label}</Text>
            </View>
            <Text className={`flex-1 font-serif text-base leading-6 ${textClass}`}>{text}</Text>
            
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
};

export default function ListeningQuiz() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const testData = DataLoader.getListeningTestById(id as string);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);

    // 进场动画
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, [currentQuestionIndex]);

    if (!testData) {
        return (
            <GuofengBackground>
                <View className="flex-1 justify-center items-center">
                    <Text className="text-ink font-serif">测试未找到</Text>
                </View>
            </GuofengBackground>
        );
    }

    if (isFinished) {
        return (
            <GuofengBackground>
                <SafeAreaView className="flex-1 justify-center items-center p-6">
                    <PaperCard className="w-full items-center py-10">
                        <SealText type="title" className="mb-4">听力考核结束</SealText>
                        <View className="w-32 h-32 rounded-full border-4 border-ink items-center justify-center mb-6">
                            <Text className="text-4xl font-bold font-serif text-ink">{score}</Text>
                            <Text className="text-sm text-ink/60">/ {testData.questions.length}</Text>
                        </View>
                        <InkButton onPress={() => router.back()} className="w-48">
                            返回
                        </InkButton>
                    </PaperCard>
                </SafeAreaView>
            </GuofengBackground>
        );
    }

    const currentQuestion = testData.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === testData.questions.length - 1;

    const handleAnswerSelect = (option: string) => {
        if (showFeedback) return;
        setSelectedAnswer(option);
    };

    const handleSubmit = () => {
        if (!selectedAnswer) return;

        setShowFeedback(true);

        const selectedIndex = currentQuestion.options.indexOf(selectedAnswer);
        const selectedLetter = String.fromCharCode(65 + selectedIndex);

        if (selectedLetter === currentQuestion.answer) {
            setScore(score + 1);
        }
    };

    const handleNext = () => {
        if (isLastQuestion) {
            setIsFinished(true);
        } else {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setShowFeedback(false);
        }
    };

    return (
        <GuofengBackground>
            <SafeAreaView className="flex-1">
                <View className="px-4 pt-2">
                    <GuofengBackButton />
                </View>

                <ScrollView contentContainerStyle={{ padding: 20 }}>
                    <SealText type="title" className="mb-6">{testData.title}</SealText>
                    
                    {/* 音频播放器 */}
                    <PaperCard className="mb-6 bg-ink/5 border-ink/10">
                        <View className="flex-row items-center justify-center py-4">
                            <AudioPlayer audioUri={testData.audioUri} />
                        </View>
                        <Text className="text-center text-ink/60 font-serif text-xs mt-2">
                            请点击播放按钮开始听题
                        </Text>
                    </PaperCard>

                    <Animated.View style={{ opacity: fadeAnim }}>
                        <View className="flex-row justify-between items-end mb-4">
                            <Text className="font-serif text-lg font-bold text-ink">Question {currentQuestionIndex + 1}</Text>
                            <Text className="font-serif text-sm text-ink/60">{currentQuestionIndex + 1} / {testData.questions.length}</Text>
                        </View>

                        {/* 选项列表 */}
                        <View className="mb-8">
                            {currentQuestion.options.map((opt, idx) => {
                                const label = String.fromCharCode(65 + idx);
                                const isSelected = selectedAnswer === opt;
                                const isCorrect = label === currentQuestion.answer;
                                
                                return (
                                    <OptionButton
                                        key={idx}
                                        label={label}
                                        text={opt}
                                        selected={isSelected}
                                        isCorrect={isCorrect}
                                        showResult={showFeedback}
                                        onPress={() => handleAnswerSelect(opt)}
                                    />
                                );
                            })}
                        </View>

                        {/* 操作按钮 */}
                        {!showFeedback ? (
                            <InkButton 
                                onPress={handleSubmit} 
                                disabled={!selectedAnswer}
                                className={!selectedAnswer ? "opacity-50" : ""}
                            >
                                确认答案
                            </InkButton>
                        ) : (
                            <InkButton onPress={handleNext} variant="outline">
                                {isLastQuestion ? "查看结果" : "下一题"}
                            </InkButton>
                        )}
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        </GuofengBackground>
    );
}
