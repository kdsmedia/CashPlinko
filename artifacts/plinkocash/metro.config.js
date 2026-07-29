const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Stub react-native-google-mobile-ads on web so Metro never tries to
// bundle its native-only internals (codegenNativeComponent, etc.).
// On Android/iOS the real library is resolved via .native.ts platform files.
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    platform === 'web' &&
    moduleName === 'react-native-google-mobile-ads'
  ) {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'stubs/admob-web-stub.js'),
    };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
