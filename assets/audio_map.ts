// This file maps test IDs to their corresponding audio files.
// We use static requires to ensure React Native bundler can resolve them.

const audioMap: Record<string, any> = {
    'listening_test_01': require('./《托业听力全真模拟1000题》音频文件/TEST 01.mp3'),
    'listening_test_02': require('./《托业听力全真模拟1000题》音频文件/TEST 02.MP3'),
    'listening_test_03': require('./《托业听力全真模拟1000题》音频文件/TEST 03.MP3'),
    'listening_test_04': require('./《托业听力全真模拟1000题》音频文件/TEST 04.MP3'),
    'listening_test_05': require('./《托业听力全真模拟1000题》音频文件/TEST 05.MP3'),
    'listening_test_06': require('./《托业听力全真模拟1000题》音频文件/TEST 06.mp3'),
    // Note: TEST 07 has a space before extension in the filesystem
    'listening_test_07': require('./《托业听力全真模拟1000题》音频文件/TEST 07 .MP3'),
    'listening_test_08': require('./《托业听力全真模拟1000题》音频文件/TEST 08.MP3'),
    'listening_test_09': require('./《托业听力全真模拟1000题》音频文件/TEST 09.MP3'),
    'listening_test_10': require('./《托业听力全真模拟1000题》音频文件/TEST 10.MP3'),
};

export default audioMap;
