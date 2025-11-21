// Reading Tests
import test01 from '../assets/data/reading_test_01.json';
import test02 from '../assets/data/reading_test_02.json';
import test03 from '../assets/data/reading_test_03.json';
import test04 from '../assets/data/reading_test_04.json';
import test05 from '../assets/data/reading_test_05.json';
import test06 from '../assets/data/reading_test_06.json';
import test07 from '../assets/data/reading_test_07.json';
import test08 from '../assets/data/reading_test_08.json';
import test09 from '../assets/data/reading_test_09.json';
import test10 from '../assets/data/reading_test_10.json';

// Listening Tests
import listeningTest01 from '../assets/data/listening_test_01.json';
import listeningTest02 from '../assets/data/listening_test_02.json';
import listeningTest03 from '../assets/data/listening_test_03.json';
import listeningTest04 from '../assets/data/listening_test_04.json';
import listeningTest05 from '../assets/data/listening_test_05.json';
import listeningTest06 from '../assets/data/listening_test_06.json';
import listeningTest07 from '../assets/data/listening_test_07.json';
import listeningTest08 from '../assets/data/listening_test_08.json';
import listeningTest09 from '../assets/data/listening_test_09.json';
import listeningTest10 from '../assets/data/listening_test_10.json';

import audioMap from '../assets/audio_map';

export interface Question {
    id: string;
    question: string;
    options: string[];
    answer: string | null;
    passage?: string;
    explanation?: string;
    script?: string;
}

export interface ListeningTest {
    testId: string;
    title: string;
    questions: Question[];
}

const allTests: Record<string, Question[]> = {
    'Test 01': test01,
    'Test 02': test02,
    'Test 03': test03,
    'Test 04': test04,
    'Test 05': test05,
    'Test 06': test06,
    'Test 07': test07,
    'Test 08': test08,
    'Test 09': test09,
    'Test 10': test10,
};

const allListeningTests: Record<string, ListeningTest> = {
    'listening_test_01': listeningTest01 as ListeningTest,
    'listening_test_02': listeningTest02 as ListeningTest,
    'listening_test_03': listeningTest03 as ListeningTest,
    'listening_test_04': listeningTest04 as ListeningTest,
    'listening_test_05': listeningTest05 as ListeningTest,
    'listening_test_06': listeningTest06 as ListeningTest,
    'listening_test_07': listeningTest07 as ListeningTest,
    'listening_test_08': listeningTest08 as ListeningTest,
    'listening_test_09': listeningTest09 as ListeningTest,
    'listening_test_10': listeningTest10 as ListeningTest,
};

export const DataLoader = {
    getVocabularyTests: () => {
        return Object.keys(allTests).map(id => ({ id, title: `Vocabulary ${id}` }));
    },

    getTestQuestions: (testId: string, parts: number[] = [5, 6]) => {
        const questions = allTests[testId];
        if (!questions) return [];

        return questions.filter(q => {
            const id = parseInt(q.id);
            // Part 5: 101-130
            // Part 6: 131-146
            // Part 7: 147-200
            let include = false;
            if (parts.includes(5) && id >= 101 && id <= 130) include = true;
            if (parts.includes(6) && id >= 131 && id <= 146) include = true;
            if (parts.includes(7) && id >= 147 && id <= 200) include = true;
            return include;
        });
    },

    getListeningTests: () => {
        return Object.keys(allListeningTests).map(id => ({
            id,
            title: allListeningTests[id].title,
            audioUri: audioMap[id]
        }));
    },

    getListeningTestById: (testId: string) => {
        const test = allListeningTests[testId];
        if (!test) return null;

        return {
            ...test,
            audioUri: audioMap[testId]
        };
    }
};
