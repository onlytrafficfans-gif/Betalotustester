import { expoClient } from '@better-auth/expo/client';
import { createAuthClient } from 'better-auth/react';
import * as SecureStore from 'expo-secure-store';

export const authClient = createAuthClient({
  baseURL: 'https://www.luckylotus.app',
  plugins: [
    expoClient({
      scheme: 'lotusappbuilder',
      storagePrefix: 'lotus-app-builder',
      storage: SecureStore,
    }),
  ],
});
