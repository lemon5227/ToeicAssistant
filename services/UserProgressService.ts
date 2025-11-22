import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WrongQuestion {
    id: string;
    testId: string;
    section: 'listening' | 'reading' | 'vocabulary';
    question: string;
    userAnswer: string;
    correctAnswer: string;
    explanation?: string;
    timestamp: number;
}

export interface UserStats {
    totalQuestionsAnswered: number;
    correctAnswers: number;
    listeningScore: number;
    readingScore: number;
    vocabularyScore: number;
    streakDays: number;
    lastActiveDate: string;
}

const STORAGE_KEYS = {
    WRONG_QUESTIONS: 'toeic_wrong_questions',
    USER_STATS: 'toeic_user_stats',
    TEST_HISTORY: 'toeic_test_history',
};

class UserProgressService {
    // --- Wrong Questions ---

    async saveWrongQuestion(question: WrongQuestion): Promise<void> {
        try {
            const existing = await this.getWrongQuestions();
            // Avoid duplicates
            if (!existing.find(q => q.id === question.id)) {
                const updated = [question, ...existing];
                await AsyncStorage.setItem(STORAGE_KEYS.WRONG_QUESTIONS, JSON.stringify(updated));
            }
        } catch (error) {
            console.error('Failed to save wrong question:', error);
        }
    }

    async getWrongQuestions(): Promise<WrongQuestion[]> {
        try {
            const json = await AsyncStorage.getItem(STORAGE_KEYS.WRONG_QUESTIONS);
            return json ? JSON.parse(json) : [];
        } catch (error) {
            console.error('Failed to get wrong questions:', error);
            return [];
        }
    }

    async removeWrongQuestion(questionId: string): Promise<void> {
        try {
            const existing = await this.getWrongQuestions();
            const updated = existing.filter(q => q.id !== questionId);
            await AsyncStorage.setItem(STORAGE_KEYS.WRONG_QUESTIONS, JSON.stringify(updated));
        } catch (error) {
            console.error('Failed to remove wrong question:', error);
        }
    }

    // --- User Stats ---

    async updateStats(isCorrect: boolean, section: 'listening' | 'reading' | 'vocabulary'): Promise<void> {
        try {
            const stats = await this.getUserStats();

            stats.totalQuestionsAnswered += 1;
            if (isCorrect) {
                stats.correctAnswers += 1;
                if (section === 'listening') stats.listeningScore += 5; // Arbitrary points
                if (section === 'reading') stats.readingScore += 5;
                if (section === 'vocabulary') stats.vocabularyScore += 5;
            }

            // Streak Logic
            const today = new Date().toISOString().split('T')[0];
            if (stats.lastActiveDate !== today) {
                const lastDate = new Date(stats.lastActiveDate);
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);

                if (stats.lastActiveDate && lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
                    stats.streakDays += 1;
                } else {
                    stats.streakDays = 1;
                }
                stats.lastActiveDate = today;
            }

            await AsyncStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(stats));
        } catch (error) {
            console.error('Failed to update stats:', error);
        }
    }

    async getUserStats(): Promise<UserStats> {
        try {
            const json = await AsyncStorage.getItem(STORAGE_KEYS.USER_STATS);
            if (json) {
                return JSON.parse(json);
            }
        } catch (error) {
            console.error('Failed to get user stats:', error);
        }

        // Default stats
        return {
            totalQuestionsAnswered: 0,
            correctAnswers: 0,
            listeningScore: 0,
            readingScore: 0,
            vocabularyScore: 0,
            streakDays: 0,
            lastActiveDate: '',
        };
    }

    // --- Clear Data ---
    async clearAllData(): Promise<void> {
        try {
            await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
        } catch (error) {
            console.error('Failed to clear data:', error);
        }
    }
}

export default new UserProgressService();
