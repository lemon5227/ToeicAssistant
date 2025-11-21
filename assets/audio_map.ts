// This file maps test IDs to their corresponding audio files.
// We use static requires to ensure React Native bundler can resolve them.

const audioMap: Record<string, any> = {
    'listening_test_01': require('./audio/test_01.mp3'),
    'listening_test_02': require('./audio/test_02.mp3'),
    'listening_test_03': require('./audio/test_03.mp3'),
    'listening_test_04': require('./audio/test_04.mp3'),
    'listening_test_05': require('./audio/test_05.mp3'),
    'listening_test_06': require('./audio/test_06.mp3'),
    'listening_test_07': require('./audio/test_07.mp3'),
    'listening_test_08': require('./audio/test_08.mp3'),
    'listening_test_09': require('./audio/test_09.mp3'),
    'listening_test_10': require('./audio/test_10.mp3'),
};

export default audioMap;
