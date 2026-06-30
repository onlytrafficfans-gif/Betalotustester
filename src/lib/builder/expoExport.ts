/**
 * Expo Export Generator
 * 
 * Generates a complete Expo/React Native project from an app schema.
 * Creates all necessary files for a runnable mobile app.
 */

interface ExportFile {
  path: string;
  content: string;
}

export function generateExpoProject(schema: any): ExportFile[] {
  const appName = schema.name || "MyApp";
  const files: ExportFile[] = [];

  // package.json
  files.push({
    path: "package.json",
    content: JSON.stringify(
      {
        name: appName.toLowerCase().replace(/\s+/g, "-"),
        version: "1.0.0",
        main: "expo/AppEntry.js",
        scripts: {
          start: "expo start",
          android: "expo start --android",
          ios: "expo start --ios",
          web: "expo start --web",
        },
        dependencies: {
          expo: "^50.0.0",
          "expo-status-bar": "~1.11.0",
          react: "18.2.0",
          "react-native": "0.73.0",
          "@react-navigation/native": "^6.1.0",
          "@react-navigation/stack": "^6.3.0",
          "react-native-screens": "~3.29.0",
          "react-native-safe-area-context": "4.8.0",
          "@react-native-community/datetimepicker": "7.6.0",
          "@react-native-async-storage/async-storage": "1.21.0",
          "react-native-svg": "14.1.0",
          "lucide-react-native": "^0.300.0",
        },
        devDependencies: {
          "@babel/core": "^7.20.0",
          "@types/react": "~18.2.0",
          typescript: "^5.3.0",
        },
        private: true,
      },
      null,
      2
    ),
  });

  // App.tsx
  files.push({
    path: "App.tsx",
    content: generateAppTsx(schema),
  });

  // app.json
  files.push({
    path: "app.json",
    content: JSON.stringify(
      {
        expo: {
          name: appName,
          slug: appName.toLowerCase().replace(/\s+/g, "-"),
          version: "1.0.0",
          orientation: "portrait",
          icon: "./assets/icon.png",
          userInterfaceStyle: "light",
          splash: {
            image: "./assets/splash.png",
            resizeMode: "contain",
            backgroundColor: schema.theme?.backgroundColor || "#ffffff",
          },
          assetBundlePatterns: ["**/*"],
          ios: {
            supportsTablet: true,
          },
          android: {
            adaptiveIcon: {
              foregroundImage: "./assets/adaptive-icon.png",
              backgroundColor: schema.theme?.backgroundColor || "#ffffff",
            },
          },
          web: {
            favicon: "./assets/favicon.png",
          },
        },
      },
      null,
      2
    ),
  });

  // Screen components
  if (schema.screens) {
    schema.screens.forEach((screen: any) => {
      files.push({
        path: `src/screens/${screen.name}.tsx`,
        content: generateScreenComponent(screen, schema),
      });
    });
  }

  // Navigation
  files.push({
    path: "src/navigation/AppNavigator.tsx",
    content: generateNavigation(schema),
  });

  // Theme
  files.push({
    path: "src/theme/colors.ts",
    content: generateThemeColors(schema),
  });

  // Components
  files.push({
    path: "src/components/Button.tsx",
    content: generateButtonComponent(),
  });

  files.push({
    path: "src/components/Input.tsx",
    content: generateInputComponent(),
  });

  files.push({
    path: "src/components/Card.tsx",
    content: generateCardComponent(),
  });

  return files;
}

function generateAppTsx(schema: any): string {
  return `import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <AppNavigator />
    </NavigationContainer>
  );
}
`;
}

function generateNavigation(schema: any): string {
  const screenImports = schema.screens
    .map((s: any) => `import ${s.name} from '../screens/${s.name}';`)
    .join("\n");

  const screenRegisters = schema.screens
    .map(
      (s: any) =>
        `      <Stack.Screen name="${s.name}" component={${s.name}} options={{ title: '${s.name}' }} />`
    )
    .join("\n");

  return `import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
${screenImports}

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '${schema.theme?.primaryColor || "#6366f1"}' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
${screenRegisters}
    </Stack.Navigator>
  );
}
`;
}

function generateScreenComponent(screen: any, schema: any): string {
  const imports = [
    "import React, { useState } from 'react';",
    "import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';",
    "import Button from '../components/Button';",
    "import Input from '../components/Input';",
    "import Card from '../components/Card';",
    "import { colors } from '../theme/colors';",
  ].join("\n");

  const componentRenderers = screen.components
    ?.map((comp: any) => generateComponentJsx(comp))
    .join("\n      ");

  return `${imports}

export default function ${screen.name}() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
      ${componentRenderers || "<Text>Empty Screen</Text>"}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
});
`;
}

function generateComponentJsx(component: any): string {
  switch (component.type) {
    case "header":
      return `<View style={styles.header}>
        <Text style={styles.headerTitle}>${component.title}</Text>
      </View>`;
    case "text":
      if (component.variant === "title")
        return `<Text style={styles.title}>${component.content}</Text>`;
      return `<Text style={styles.text}>${component.content}</Text>`;
    case "button":
      return `<Button title="${component.text}" variant="${component.variant || "primary"}" onPress={() => {}} />`;
    case "input":
      return `<Input placeholder="${component.placeholder || ""}" label="${component.label || ""}" />`;
    case "card":
      return `<Card title="${component.title}" description="${component.description || ""}" ${component.price ? `price="${component.price}"` : ""} />`;
    case "searchBar":
      return `<Input placeholder="${component.placeholder || "Search..."}" icon="search" />`;
    case "tabs":
      return `<View style={styles.tabs}>
        ${(component.tabs || ["Tab 1", "Tab 2"]).map((t: string) => `<TouchableOpacity style={styles.tab}><Text>${t}</Text></TouchableOpacity>`).join("\n        ")}
      </View>`;
    case "divider":
      return `<View style={styles.divider} />`;
    default:
      return `<Text>Component: ${component.type}</Text>`;
  }
}

function generateThemeColors(schema: any): string {
  return `export const colors = {
  primary: '${schema.theme?.primaryColor || "#6366f1"}',
  secondary: '${schema.theme?.secondaryColor || "#8b5cf6"}',
  background: '${schema.theme?.backgroundColor || "#ffffff"}',
  surface: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  error: '#ef4444',
  success: '#10b981',
};
`;
}

function generateButtonComponent(): string {
  return `import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface ButtonProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  onPress?: () => void;
}

export default function Button({ title, variant = 'primary', onPress }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'outline' && styles.outline,
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.text,
        variant === 'primary' && styles.primaryText,
        variant === 'outline' && styles.outlineText,
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#fff',
  },
  outlineText: {
    color: colors.primary,
  },
});
`;
}

function generateInputComponent(): string {
  return `import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface InputProps {
  placeholder?: string;
  label?: string;
  secureTextEntry?: boolean;
}

export default function Input({ placeholder, label, secureTextEntry }: InputProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
});
`;
}

function generateCardComponent(): string {
  return `import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

interface CardProps {
  title: string;
  description?: string;
  price?: string;
  onPress?: () => void;
}

export default function Card({ title, description, price, onPress }: CardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {price && <Text style={styles.price}>{price}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 8,
  },
});
`;
}

/**
 * Generate zip-ready file structure
 */
export function generateProjectZip(schema: any): { filename: string; files: ExportFile[] } {
  const appName = schema.name || "MyApp";
  const files = generateExpoProject(schema);

  return {
    filename: `${appName.toLowerCase().replace(/\s+/g, "-")}-expo.zip`,
    files,
  };
}
