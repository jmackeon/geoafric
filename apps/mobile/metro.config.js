const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Some packages (e.g. zustand) ship an "exports" map whose "import" condition
// points at real ESM files using `import.meta`, which breaks when Metro bundles
// them into a non-module script. Falling back to "main" (CommonJS) avoids that.
config.resolver.unstable_enablePackageExports = false;

module.exports = config;