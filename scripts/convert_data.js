const fs = require('fs');
const pdf = require('pdf-parse');

// Polyfill for pdfjs-dist environment
if (typeof DOMMatrix === 'undefined') {
    global.DOMMatrix = class DOMMatrix { };
}

const OUTPUT_DIR = 'assets/data';
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function convertPdf() {
    console.log("Reading PDF...");
    const dataBuffer = fs.readFileSync('assets/阅读全真模拟1000题.pdf');
    const data = await pdf(dataBuffer);
    const fullText = data.text;

    console.log(`Total text length: ${fullText.length}`);

    // Split into Question Book and Answer Book
    // "答案册" seems to be the divider around line 11058 in the dump
    const splitMarker = "答案册";
    const parts = fullText.split(splitMarker);

    if (parts.length < 3) {
        console.error("Expected at least 3 parts (TOC, Questions, Answers) but found " + parts.length);
        // Fallback if only 2 parts (maybe TOC doesn't have it?)
        if (parts.length === 2) {
            // Assume part 0 is Questions, part 1 is Answers? No, likely part 0 is TOC+Questions, part 1 is Answers.
            // But we saw "答案册" at line 27.
            // Let's log the lengths to be sure.
            console.log("Part 0 length:", parts[0].length);
            console.log("Part 1 length:", parts[1].length);
        }
        return;
    }

    // parts[0] is TOC (up to line 27)
    // parts[1] is Questions (Line 27 to 11058)
    // parts[2] is Answers (Line 11058 to End)

    const questionSection = parts[1];
    const answerSection = parts[2];

    console.log("Parsing Answers...");
    const answers = parseAnswers(answerSection);
    console.log(`Found answers for ${Object.keys(answers).length} tests.`);

    console.log("Parsing Questions...");
    const tests = parseQuestions(questionSection);
    console.log(`Found questions for ${Object.keys(tests).length} tests.`);

    // Merge and Save
    for (const [testId, questions] of Object.entries(tests)) {
        const testAnswers = answers[testId] || {};

        const mergedQuestions = questions.map(q => {
            return {
                ...q,
                answer: testAnswers[q.id] || null
            };
        });

        const cleanedQuestions = cleanData(mergedQuestions);

        const outputPath = `${OUTPUT_DIR}/reading_${testId.toLowerCase().replace(' ', '_')}.json`;
        fs.writeFileSync(outputPath, JSON.stringify(cleanedQuestions, null, 2));
        console.log(`Saved ${cleanedQuestions.length} questions to ${outputPath}`);
    }
}

function cleanData(questions) {
    // Map to store context (passage) for question ranges
    // Key: questionId, Value: passage text
    const contextMap = {};

    // Regex to find "Questions 131-134 refer to..."
    // And "Part 6", "Part 7" headers
    const splitRegex = /((?:Part \d+[\s\S]*?)?Questions\s+(\d+)-(\d+)\s+refer\s+to\s+the\s+following\s+[\w\s]+(?:\.|:))/i;

    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.options || q.options.length === 0) continue;

        // Check the last option for the split pattern
        const lastOptionIdx = q.options.length - 1;
        let lastOption = q.options[lastOptionIdx];

        // Sometimes the passage is in the last option
        const match = splitRegex.exec(lastOption);

        if (match) {
            // Found a passage start!
            const splitIndex = match.index;
            const realOptionContent = lastOption.substring(0, splitIndex).trim();
            const passageHeader = match[0]; // "Questions 131-134 refer to..."
            const passageContent = lastOption.substring(splitIndex + match[0].length).trim();

            // Update the option
            q.options[lastOptionIdx] = realOptionContent;

            // The passage text is header + content
            // But wait, the passage content might continue until the next question starts.
            // Since we split by questions, the passage content is fully contained here?
            // Yes, because the next question starts with "131." which was the delimiter for q(i).

            const fullPassage = passageHeader + "\n" + passageContent;

            const startId = parseInt(match[2]);
            const endId = parseInt(match[3]);

            // Assign to map
            for (let id = startId; id <= endId; id++) {
                contextMap[id] = fullPassage;
            }
        }
    }

    // Apply context to questions
    return questions.map(q => {
        const qId = parseInt(q.id);
        if (contextMap[qId]) {
            return { ...q, passage: contextMap[qId] };
        }
        return q;
    });
}

function parseAnswers(text) {
    const tests = {};
    let currentTest = null;

    // Split by lines to process line by line
    const lines = text.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();

        // Detect Test Header
        const testMatch = trimmed.match(/^Test\s+(\d+)/i);
        if (testMatch) {
            currentTest = `Test ${testMatch[1]}`;
            tests[currentTest] = {};
            continue;
        }

        if (!currentTest) continue;

        // Match patterns like "101. (A) 102. (B)"
        // Regex to find "101. (A)" pairs
        const answerRegex = /(\d+)\.\s*\(([A-D])\)/g;
        let match;
        while ((match = answerRegex.exec(trimmed)) !== null) {
            const qId = match[1];
            const ans = match[2];
            tests[currentTest][qId] = ans;
        }
    }
    return tests;
}

function parseQuestions(text) {
    const tests = {};
    let currentTest = null;

    // We need to be careful about splitting questions.
    // A simple strategy is to split by "Test XX" first.

    // Normalize newlines
    const normalized = text.replace(/\r\n/g, '\n');

    // Split by "Test XX"
    // Note: The TOC also has "Test 01", so we need to ignore the first few occurrences or look for specific content.
    // The actual tests seem to start after "试题册" (Question Book)

    const questionBookStart = normalized.indexOf("试题册");
    const content = normalized.substring(questionBookStart);

    // Regex to split by Test headers
    const testSplitRegex = /(Test\s+\d+)\s+(?:Reading Test)?/g;

    let match;
    let lastIndex = 0;
    let lastTestId = null;

    while ((match = testSplitRegex.exec(content)) !== null) {
        if (lastTestId) {
            const testContent = content.substring(lastIndex, match.index);
            // Skip TOC entries (usually very short)
            if (testContent.length > 1000) {
                console.log(`Processing ${lastTestId}, length: ${testContent.length}`);
                tests[lastTestId] = extractTestQuestions(testContent);
            } else {
                console.log(`Skipping ${lastTestId} (too short, likely TOC)`);
            }
        }
        lastTestId = match[1]; // e.g., "Test 01"
        lastIndex = match.index + match[0].length;
    }
    // Add last test
    if (lastTestId) {
        const testContent = content.substring(lastIndex);
        if (testContent.length > 1000) {
            console.log(`Processing ${lastTestId}, length: ${testContent.length}`);
            tests[lastTestId] = extractTestQuestions(testContent);
        }
    }

    return tests;
}

function extractTestQuestions(text) {
    const questions = [];

    // This is a simplified parser. Real PDF text is messy.
    // We look for "101." to start a question.

    // Strategy: Find all indices of "\n\d+\." (e.g. "\n101.")
    // The text between two indices is the question content.

    // Relaxed regex: Allow spaces before number, and spaces after dot
    const qStartRegex = /\n\s*(\d{3})\./g;
    let match;
    let lastIndex = 0;
    let lastQId = null;

    const rawQuestions = [];

    while ((match = qStartRegex.exec(text)) !== null) {
        if (lastQId) {
            rawQuestions.push({
                id: lastQId,
                raw: text.substring(lastIndex, match.index).trim()
            });
        }
        lastQId = match[1];
        lastIndex = match.index + match[0].length; // Start after "101."
    }
    // Add last question
    if (lastQId) {
        rawQuestions.push({
            id: lastQId,
            raw: text.substring(lastIndex).trim()
        });
    }

    console.log(`Extracted ${rawQuestions.length} raw questions`);

    // Process each raw question to extract text and options
    return rawQuestions.map(q => processRawQuestion(q));
}

function processRawQuestion(q) {
    // q.raw contains the question text and options.
    // Example: "------- you want ... \n(A) If\n(B) For..."

    // Find options (A), (B), (C), (D)
    // They might be (A) Text (B) Text... or on separate lines.

    let text = q.raw;
    const options = {};

    // Regex for options: (A) ... (B) ...
    // We replace them with a marker to split, or extract them.

    const optionRegex = /\(([A-D])\)\s*([^()]+)/g; // Simplified
    // Better: Split by (A), (B), (C), (D)

    // Let's try to find the index of (A)
    const indexA = text.indexOf('(A)');
    if (indexA === -1) {
        return { id: q.id, question: text, options: [] };
    }

    const questionText = text.substring(0, indexA).trim();
    const optionsText = text.substring(indexA);

    const parsedOptions = [];
    const newOptionRegex = /\(([A-D])\)\s*([\s\S]*?)(?=\([A-D]\)|$)/g;

    let match;
    while ((match = newOptionRegex.exec(optionsText)) !== null) {
        parsedOptions.push({
            label: match[1],
            content: match[2].trim()
        });
    }

    return {
        id: q.id,
        question: questionText,
        options: parsedOptions.map(o => o.content)
    };
}

convertPdf().catch(console.error);
