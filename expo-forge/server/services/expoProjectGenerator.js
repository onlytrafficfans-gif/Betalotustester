const expoVersion = '~57.0.2';
const reactVersion = '19.2.0';
const reactNativeVersion = '0.86.0';

function slugify(value, fallback = 'generated-expo-app') {
  const slug = String(value || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || fallback;
}

function pascalCase(value, fallback = 'GeneratedApp') {
  const words = slugify(value, fallback).split('-');
  return words.map((word) => word.slice(0, 1).toUpperCase() + word.slice(1)).join('');
}

function safeText(value, fallback) {
  const text = String(value || '').trim();
  return text || fallback;
}

function normalizeBrief(input = {}) {
  const appName = safeText(input.appName, 'FieldCraft');
  const slug = slugify(appName);
  const bundleId = String(input.bundleId || `com.expoforge.${slug.replace(/-/g, '')}`).toLowerCase();
  const themeColor = /^#[0-9a-f]{6}$/i.test(input.themeColor || '') ? input.themeColor : '#0F766E';
  const workflow = safeText(input.workflow, 'Capture a client request, review the work plan, and confirm delivery from a mobile device.');
  const audience = safeText(input.audience, 'field service teams');
  const appCategory = safeText(input.appCategory, 'operations');
  const owner = safeText(input.owner, 'ExpoForge Studio');
  return {
    appName,
    slug,
    bundleId,
    packageName: bundleId,
    componentName: pascalCase(appName),
    themeColor,
    audience,
    appCategory,
    workflow,
    owner,
    includeEas: input.includeEas !== false,
    includeStoreMetadata: input.includeStoreMetadata !== false,
    includePreviewBuilds: input.includePreviewBuilds !== false
  };
}

export function generateExpoProject(input) {
  const brief = normalizeBrief(input);
  const files = [
    { path: 'package.json', content: packageJson(brief) },
    { path: 'app.config.ts', content: appConfig(brief) },
    { path: 'index.ts', content: indexTs() },
    { path: 'babel.config.js', content: babelConfig() },
    { path: 'tsconfig.json', content: tsconfig() },
    { path: 'src/App.tsx', content: appTsx(brief) },
    { path: 'src/data/appPlan.ts', content: appPlan(brief) },
    { path: 'src/theme.ts', content: themeTs(brief) },
    { path: 'src/components/ActionButton.tsx', content: actionButton() },
    { path: 'README.md', content: readme(brief) }
  ];

  if (brief.includeEas) {
    files.push({ path: 'eas.json', content: easJson() });
    if (brief.includePreviewBuilds) {
      files.push({ path: '.eas/workflows/preview.yml', content: previewWorkflow() });
    }
    files.push({ path: '.eas/workflows/store-release.yml', content: storeWorkflow() });
  }

  if (brief.includeStoreMetadata) {
    files.push({ path: 'store/ios/metadata.json', content: iosMetadata(brief) });
    files.push({ path: 'store/android/listing.json', content: androidListing(brief) });
  }

  return { projectName: brief.slug, files };
}

function packageJson(brief) {
  return JSON.stringify({
    name: brief.slug,
    version: '1.0.0',
    private: true,
    main: 'index.ts',
    scripts: {
      start: 'expo start',
      ios: 'expo start --ios',
      android: 'expo start --android',
      web: 'expo start --web',
      doctor: 'expo-doctor',
      'build:preview:ios': 'eas build -p ios --profile preview',
      'build:preview:android': 'eas build -p android --profile preview',
      'build:store:ios': 'eas build -p ios --profile production',
      'build:store:android': 'eas build -p android --profile production',
      'submit:ios': 'eas submit -p ios --profile production',
      'submit:android': 'eas submit -p android --profile production'
    },
    dependencies: {
      '@expo/vector-icons': '^15.0.3',
      expo: expoVersion,
      'expo-constants': '~57.0.3',
      'expo-haptics': '~16.0.7',
      'expo-linear-gradient': '~16.0.7',
      'expo-status-bar': '~4.0.8',
      'react': reactVersion,
      'react-dom': reactVersion,
      'react-native': reactNativeVersion,
      'react-native-safe-area-context': '~5.6.2',
      'react-native-screens': '~4.18.0',
      'react-native-web': '^0.21.2'
    },
    devDependencies: {
      '@babel/core': '^7.28.5',
      '@types/react': '~19.2.5',
      'eas-cli': '^20.5.1',
      'expo-doctor': '^1.18.1',
      typescript: '~5.9.3'
    }
  }, null, 2);
}

function appConfig(brief) {
  return `import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: '${brief.appName}',
  slug: '${brief.slug}',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: '${brief.slug.replace(/-/g, '')}',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  jsEngine: 'hermes',
  ios: {
    supportsTablet: true,
    bundleIdentifier: '${brief.bundleId}',
    buildNumber: '1',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false
    }
  },
  android: {
    package: '${brief.packageName}',
    versionCode: 1,
    adaptiveIcon: {
      backgroundColor: '${brief.themeColor}'
    }
  },
  web: {
    bundler: 'metro',
    name: '${brief.appName}'
  },
  extra: {
    generatedBy: 'ExpoForge',
    owner: '${brief.owner}'
  }
};

export default config;
`;
}

function indexTs() {
  return `import { registerRootComponent } from 'expo';
import App from './src/App';

registerRootComponent(App);
`;
}

function babelConfig() {
  return `module.exports = function api(api) {
  api.cache(true);
  return { presets: ['babel-preset-expo'] };
};
`;
}

function tsconfig() {
  return JSON.stringify({
    extends: 'expo/tsconfig.base',
    compilerOptions: { strict: true, noEmit: true },
    include: ['src', 'index.ts', 'app.config.ts']
  }, null, 2);
}

function appPlan(brief) {
  return `export const appPlan = {
  appName: ${JSON.stringify(brief.appName)},
  audience: ${JSON.stringify(brief.audience)},
  category: ${JSON.stringify(brief.appCategory)},
  workflow: ${JSON.stringify(brief.workflow)},
  releaseChecklist: [
    'Run expo-doctor before native builds',
    'Create preview builds for iOS and Android',
    'Validate app metadata in App Store Connect and Google Play Console',
    'Upload production builds only after device testing'
  ],
  screens: [
    {
      title: 'Today',
      summary: 'Prioritized work for ${brief.audience}.',
      actions: ['Review queue', 'Start next job', 'Share status']
    },
    {
      title: 'Plan',
      summary: ${JSON.stringify(brief.workflow)},
      actions: ['Confirm scope', 'Assign owner', 'Set deadline']
    },
    {
      title: 'Release',
      summary: 'Preview, production build, and store upload readiness.',
      actions: ['Run preview build', 'Check metadata', 'Submit to stores']
    }
  ]
} as const;
`;
}

function themeTs(brief) {
  return `export const theme = {
  color: '${brief.themeColor}',
  background: '#F8FAFC',
  ink: '#111827',
  muted: '#64748B',
  surface: '#FFFFFF',
  line: '#E2E8F0'
};
`;
}

function actionButton() {
  return `import { Pressable, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';

export function ActionButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: theme.color,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18
  },
  pressed: { opacity: 0.82 },
  label: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' }
});
`;
}

function appTsx(brief) {
  return `import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { appPlan } from './data/appPlan';
import { theme } from './theme';
import { ActionButton } from './components/ActionButton';

export default function App() {
  const [activeScreen, setActiveScreen] = useState(0);
  const screen = appPlan.screens[activeScreen];
  const progress = useMemo(() => Math.round(((activeScreen + 1) / appPlan.screens.length) * 100), [activeScreen]);

  const confirmAction = async (action: string) => {
    await Haptics.selectionAsync();
    Alert.alert(action, 'Action recorded in the local ${brief.appName} workflow.');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.page}>
        <LinearGradient colors={['#FFFFFF', '#EEF7F6']} style={styles.hero}>
          <Text style={styles.brand}>{appPlan.appName}</Text>
          <Text style={styles.title}>{screen.title}</Text>
          <Text style={styles.copy}>{screen.summary}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: \`\${progress}%\` }]} />
          </View>
          <Text style={styles.progressText}>{progress}% workflow readiness</Text>
        </LinearGradient>

        <View style={styles.segmented}>
          {appPlan.screens.map((item, index) => (
            <Pressable
              key={item.title}
              onPress={() => setActiveScreen(index)}
              style={[styles.segment, activeScreen === index && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, activeScreen === index && styles.segmentTextActive]}>{item.title}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Next actions</Text>
          {screen.actions.map((action) => (
            <Pressable key={action} style={styles.row} onPress={() => confirmAction(action)}>
              <View style={styles.dot} />
              <Text style={styles.rowText}>{action}</Text>
            </Pressable>
          ))}
          <ActionButton label="Mark screen reviewed" onPress={() => confirmAction('Mark screen reviewed')} />
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Store release path</Text>
          {appPlan.releaseChecklist.map((item) => (
            <Text key={item} style={styles.check}>✓ {item}</Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  page: { padding: 18, gap: 16 },
  hero: { borderRadius: 28, padding: 24, gap: 12, borderWidth: 1, borderColor: theme.line },
  brand: { color: theme.color, fontSize: 14, fontWeight: '900', letterSpacing: 0 },
  title: { color: theme.ink, fontSize: 38, lineHeight: 42, fontWeight: '900' },
  copy: { color: theme.muted, fontSize: 16, lineHeight: 24 },
  progressTrack: { height: 10, borderRadius: 999, backgroundColor: '#DCEBE9', overflow: 'hidden', marginTop: 8 },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: theme.color },
  progressText: { color: theme.ink, fontSize: 13, fontWeight: '800' },
  segmented: { flexDirection: 'row', backgroundColor: '#E8EEF2', borderRadius: 18, padding: 4 },
  segment: { flex: 1, minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 14 },
  segmentActive: { backgroundColor: theme.surface },
  segmentText: { color: theme.muted, fontWeight: '800' },
  segmentTextActive: { color: theme.ink },
  panel: { backgroundColor: theme.surface, borderRadius: 22, padding: 18, gap: 14, borderWidth: 1, borderColor: theme.line },
  panelTitle: { color: theme.ink, fontSize: 20, fontWeight: '900' },
  row: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: theme.line },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.color },
  rowText: { color: theme.ink, fontSize: 16, fontWeight: '700' },
  check: { color: theme.muted, fontSize: 15, lineHeight: 22 }
});
`;
}

function easJson() {
  return JSON.stringify({
    cli: { version: '>= 20.5.1', appVersionSource: 'remote' },
    build: {
      development: { developmentClient: true, distribution: 'internal', channel: 'development' },
      preview: { distribution: 'internal', channel: 'preview', android: { buildType: 'apk' } },
      production: { autoIncrement: true, channel: 'production', android: { buildType: 'app-bundle' } }
    },
    submit: {
      production: {
        ios: {},
        android: { track: 'internal' }
      }
    }
  }, null, 2);
}

function previewWorkflow() {
  return `name: Preview Builds

on:
  pull_request: {}
  workflow_dispatch: {}

jobs:
  build_android_preview:
    type: build
    params:
      platform: android
      profile: preview

  build_ios_preview:
    type: build
    params:
      platform: ios
      profile: preview

  comment:
    after: [build_android_preview, build_ios_preview]
    type: github-comment
    params:
      message: Preview builds are ready for mobile QA.
`;
}

function storeWorkflow() {
  return `name: Store Release

on:
  workflow_dispatch: {}

jobs:
  build_android_store:
    type: build
    params:
      platform: android
      profile: production

  build_ios_store:
    type: build
    params:
      platform: ios
      profile: production

  approval:
    needs: [build_android_store, build_ios_store]
    type: require-approval

  submit_android:
    needs: [approval, build_android_store]
    type: submit
    params:
      build_id: \${{ needs.build_android_store.outputs.build_id }}
      profile: production

  submit_ios:
    needs: [approval, build_ios_store]
    type: submit
    params:
      build_id: \${{ needs.build_ios_store.outputs.build_id }}
      profile: production
`;
}

function iosMetadata(brief) {
  return JSON.stringify({
    name: brief.appName,
    subtitle: `${brief.appCategory} workflow app for ${brief.audience}`,
    description: `${brief.appName} helps ${brief.audience} complete this workflow: ${brief.workflow}`,
    keywords: [brief.appCategory, 'workflow', 'mobile', 'productivity']
  }, null, 2);
}

function androidListing(brief) {
  return JSON.stringify({
    title: brief.appName,
    shortDescription: `${brief.appCategory} workflow app for ${brief.audience}`,
    fullDescription: `${brief.appName} helps ${brief.audience} complete this workflow: ${brief.workflow}`,
    defaultLanguage: 'en-US',
    track: 'internal'
  }, null, 2);
}

function readme(brief) {
  return `# ${brief.appName}

Generated by ExpoForge as a real Expo project.

## Run

\`\`\`bash
npm install
npm run start
\`\`\`

## Preview Builds

\`\`\`bash
npx eas-cli@latest login
npm run build:preview:ios
npm run build:preview:android
\`\`\`

## Store Uploads

\`\`\`bash
npm run build:store:ios
npm run build:store:android
npm run submit:ios
npm run submit:android
\`\`\`

EAS will prompt for real Apple Developer and Google Play credentials. No fake credentials are stored in this project.
`;
}
