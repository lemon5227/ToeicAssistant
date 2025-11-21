const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for audio files
config.resolver.assetExts.push(
    'mp3',
    'MP3',
    'wav',
    'aac',
    'm4a'
);

module.exports = config;
