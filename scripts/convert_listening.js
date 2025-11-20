const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');

const PDF_PATH = path.join(__dirname, '../assets/听力全真模拟1000题.pdf');
const OUTPUT_DIR = path.join(__dirname, '../assets/data');

// Helper to ensure output dir exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function convertPdfToData() {
    console.log('Reading PDF...');
    const dataBuffer = fs.readFileSync(PDF_PATH);

    try {
        const data = await pdf(dataBuffer);
        const fullText = data.text;

        console.log(`Total pages: ${data.numpages}`);
        console.log(`Total length: ${fullText.length}`);

        // Split into Test Sections based on Answer Book
        // The Answer Book starts with "答案册" and then "Test 01", "Test 02"...
        // We need to find the *second* big "答案册" section which contains the actual content.
        // Based on inspection, the Answer Book content starts around line 4887.

        const answerBookMarker = "答案册";
        const parts = fullText.split(answerBookMarker);

        // The last part should contain the actual Answer Book content
        // But let's be safer. We look for "Test 01" followed by "1. （A）" patterns.

        let answerBookContent = parts[parts.length - 1];

        // If split didn't work as expected (multiple markers), try to find the one with Test 01 content
        if (parts.length > 2) {
            // The last part is likely the one.
            answerBookContent = parts[parts.length - 1];
        }

        // Split by "Test XX"
        const testSplitRegex = /Test\s+(\d+)/g;
        let match;
        const testIndices = [];

        while ((match = testSplitRegex.exec(answerBookContent)) !== null) {
            testIndices.push({
                id: match[1],
                index: match.index
            });
        }

        for (let i = 0; i < testIndices.length; i++) {
            const currentTest = testIndices[i];
            const nextTest = testIndices[i + 1];
            const start = currentTest.index;
            const end = nextTest ? nextTest.index : answerBookContent.length;

            const testContent = answerBookContent.substring(start, end);
            const testId = currentTest.id;

            console.log(`Processing Test ${testId}...`);
            processTest(testId, testContent);
        }

    } catch (error) {
        console.error('Error parsing PDF:', error);
    }
}

function processTest(testId, content) {
    // 1. Extract Answer Key
    const answerKey = {};
    const answerKeyRegex = /(\d+)\.\s*[（(]([A-D])[）)]/g;
    let keyMatch;
    while ((keyMatch = answerKeyRegex.exec(content)) !== null) {
        answerKey[keyMatch[1]] = keyMatch[2];
    }

    // 2. Extract Questions and Transcripts
    const questions = [];

    // Find the start of the transcript (Q1)
    // Q1 starts with "1(A)" or "1 (A)" or "1（A）"
    // We look for "1" followed by "(A)" or "（A）"
    let transcriptStartIndex = content.search(/1\s*[（(]A[）)]/);

    if (transcriptStartIndex === -1) {
        console.warn(`Could not find start of transcript for ${testId}`);
        return;
    }

    // Slice content from Q1 start
    let transcriptContent = content.substring(transcriptStartIndex);
    // Prepend a newline to make regex matching consistent (looking for \n\d+)
    transcriptContent = '\n' + transcriptContent;

    let currentIndex = 0;

    for (let qNum = 1; qNum <= 100; qNum++) {
        // Find start of current question
        // Pattern: \n + qNum + (non-digit)
        // We trust that since we are moving sequentially, the first match is the right one.
        // But we must search from currentIndex.

        // Actually, since we sliced from Q1, Q1 is at index 1 (after the prepended \n).
        // But for qNum > 1, we need to find it.

        let startOfQ;
        if (qNum === 1) {
            startOfQ = 1; // Skip the prepended \n
        } else {
            // Search for \n + qNum + non-digit
            // We use a loop to find the correct position
            const qPattern = new RegExp(`\\n${qNum}(?=[^0-9])`);
            const relativeMatch = transcriptContent.slice(currentIndex).search(qPattern);

            if (relativeMatch === -1) {
                console.warn(`Could not find start of Question ${qNum} in ${testId}`);
                break;
            }
            startOfQ = currentIndex + relativeMatch + 1; // +1 to skip \n
        }

        // Find start of next question to define the chunk
        let endOfQ;
        if (qNum === 100) {
            endOfQ = transcriptContent.length;
        } else {
            const nextQNum = qNum + 1;
            const nextQPattern = new RegExp(`\\n${nextQNum}(?=[^0-9])`);
            const relativeMatch = transcriptContent.slice(startOfQ).search(nextQPattern);

            if (relativeMatch === -1) {
                // Could not find next question, maybe this is the last one or something is wrong.
                // Assume it goes to the end.
                endOfQ = transcriptContent.length;
            } else {
                endOfQ = startOfQ + relativeMatch;
            }
        }

        const qChunk = transcriptContent.substring(startOfQ, endOfQ);

        // Update currentIndex for next iteration
        currentIndex = endOfQ;

        // Parse the chunk
        const qData = parseQuestionChunk(qChunk, qNum);
        if (qData) {
            questions.push({
                id: qNum.toString(),
                ...qData,
                answer: answerKey[qNum.toString()] || null
            });
        }
    }

    const output = {
        testId: `listening_test_${testId}`,
        title: `Listening Test ${testId}`,
        questions: questions
    };

    const outputPath = path.join(OUTPUT_DIR, `listening_test_${testId}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`Saved ${outputPath} with ${questions.length} questions.`);
}

function parseQuestionChunk(chunk, qNum) {
    // chunk starts with "qNum..."
    // Remove the qNum from the start
    let text = chunk.replace(new RegExp(`^${qNum}`), '').trim();

    // Part 1 (1-6): Starts with (A)...
    // Part 2 (7-31): Starts with Question Text, then (A)...
    // Part 3/4 (32-100): Starts with Question Text, then (A)...

    let questionText = "";
    let options = [];
    let script = text; // The whole chunk is the script/transcript

    if (qNum <= 6) {
        questionText = "Listen to the audio and choose the best description.";
        // Extract options (A), (B), (C), (D)
        // Regex: (A) text (B) text ...
        const optMatch = text.match(/[（(]A[）)]([\s\S]*?)[（(]B[）)]([\s\S]*?)[（(]C[）)]([\s\S]*?)[（(]D[）)]([\s\S]*?)(?=$|[（(]A|\n\d)/i);
        if (optMatch) {
            options = [optMatch[1].trim(), optMatch[2].trim(), optMatch[3].trim(), optMatch[4].trim()];
        }
    } else {
        // Extract Question Text (everything before (A))
        const splitMatch = text.match(/^([\s\S]*?)\s*[（(]A[）)]/i);
        if (splitMatch) {
            questionText = splitMatch[1].trim();

            // Extract options
            if (qNum <= 31) {
                // Part 2: 3 options
                const optMatch = text.match(/[（(]A[）)]([\s\S]*?)[（(]B[）)]([\s\S]*?)[（(]C[）)]([\s\S]*?)(?=$|[（(]A|\n\d)/i);
                if (optMatch) {
                    options = [optMatch[1].trim(), optMatch[2].trim(), optMatch[3].trim()];
                }
            } else {
                // Part 3/4: 4 options
                const optMatch = text.match(/[（(]A[）)]([\s\S]*?)[（(]B[）)]([\s\S]*?)[（(]C[）)]([\s\S]*?)[（(]D[）)]([\s\S]*?)(?=$|[（(]A|\n\d)/i);
                if (optMatch) {
                    options = [optMatch[1].trim(), optMatch[2].trim(), optMatch[3].trim(), optMatch[4].trim()];
                }
            }
        } else {
            // Fallback if regex fails
            questionText = text;
        }
    }

    // Clean up options (remove newlines, extra spaces)
    options = options.map(o => o.replace(/\s+/g, ' ').trim());

    return {
        question: questionText,
        options: options,
        script: script
    };
}

convertPdfToData();
