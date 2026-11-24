import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { openURL } from 'expo-linking';
import { File, Paths } from 'expo-file-system';
import { Stack } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NativePreview } from '@/components/native-preview';
import { authClient } from '@/lib/auth-client';
import { exportSpecificationAsHtml } from '@/lib/export-html';
import { generateApp, GenerationError } from '@/lib/generation-client';
import { starterSpecification } from '@/lib/specification';
import { loadProjects, saveProjects } from '@/lib/storage';
import { BuilderProject, ChatMessage, VersionSnapshot } from '@/types/builder';

const suggestions = ['SaaS dashboard', 'Luxury landing page', 'CRM interface', 'Dark AI workspace'];
const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const createProject = (): BuilderProject => ({
  id: newId(),
  updatedAt: new Date().toISOString(),
  specification: starterSpecification,
  versions: [],
});

function ActionButton({
  title,
  onPress,
  primary = false,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: primary ? '#63F58B' : '#171A1E',
        borderColor: primary ? '#63F58B' : '#30353C',
        borderRadius: 12,
        borderWidth: 1,
        opacity: disabled ? 0.4 : pressed ? 0.72 : 1,
        paddingHorizontal: 14,
        paddingVertical: 11,
      })}
    >
      <Text style={{ color: primary ? '#071009' : '#D9DDE2', fontWeight: '700' }}>{title}</Text>
    </Pressable>
  );
}

function BuilderWorkspace({ onSignOut, email, onDeleteAccount }: { onSignOut: () => void; email: string; onDeleteAccount: (password: string) => Promise<void> }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isDesktop = width >= 960;
  const [projects, setProjects] = useState<BuilderProject[]>([]);
  const [project, setProject] = useState<BuilderProject>(createProject);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: newId(), role: 'assistant', content: 'Describe an app and I will update the validated native specification.' },
  ]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string>();
  const [mobilePane, setMobilePane] = useState<'chat' | 'preview' | 'spec'>('chat');
  const [workspacePane, setWorkspacePane] = useState<'preview' | 'code'>('preview');
  const generationController = useRef<AbortController | null>(null);

  useEffect(() => {
    loadProjects()
      .then((saved) => {
        if (saved.length) {
          setProjects(saved);
          setProject(saved[0]);
        }
      })
      .catch(() => setError('Saved projects could not be loaded.'))
      .finally(() => setLoading(false));
  }, []);

  const commitProject = (nextProject: BuilderProject) => {
    setProject(nextProject);
    setProjects((current) => {
      const next = [nextProject, ...current.filter((item) => item.id !== nextProject.id)]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, 20);
      saveProjects(next).catch(() => setError('Project changes could not be persisted.'));
      return next;
    });
  };

  const specificationJson = useMemo(
    () => JSON.stringify(project.specification, null, 2),
    [project.specification],
  );

  const runGeneration = async (requestedPrompt = prompt, allowDowngrade = false, appendUserMessage = true) => {
    if (generating) return;
    const normalizedPrompt = requestedPrompt.trim();
    if (!normalizedPrompt) return;
    const controller = new AbortController();
    generationController.current = controller;
    setGenerating(true);
    setError(undefined);
    if (appendUserMessage) {
      setMessages((current) => [...current, { id: newId(), role: 'user', content: normalizedPrompt }]);
    }
    try {
      const before = project.specification;
      const result = await generateApp(normalizedPrompt, before, controller.signal, allowDowngrade);
      const updated = result.specification;
      const snapshot: VersionSnapshot = {
        id: newId(),
        timestamp: new Date().toISOString(),
        prompt: normalizedPrompt,
        previousSpecification: before,
        updatedSpecification: updated,
      };
      commitProject({
        ...project,
        updatedAt: snapshot.timestamp,
        specification: updated,
        versions: [...project.versions, snapshot].slice(-30),
      });
      setMessages((current) => [
        ...current,
        { id: newId(), role: 'assistant', content: result.summary },
      ]);
      setPrompt('');
      setMobilePane('preview');
      if (process.env.EXPO_OS === 'ios') await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (caught) {
      if (caught instanceof GenerationError && caught.code === 'DOWNGRADE_CONSENT_REQUIRED' && !allowDowngrade) {
        const consentMessage = 'The selected Lotus model is unavailable for this request. Continue with a lower-tier model?';
        setMessages((current) => [...current, { id: newId(), role: 'assistant', content: consentMessage }]);
        Alert.alert('Use a lower-tier model?', consentMessage, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: () => { void runGeneration(normalizedPrompt, true, false); } },
        ]);
        return;
      }
      const message =
        caught instanceof Error && caught.name === 'AbortError'
          ? 'Generation stopped. Your last working preview was preserved.'
          : caught instanceof Error
            ? caught.message
            : 'Generation failed. Your last working preview was preserved.';
      setError(message);
      setMessages((current) => [...current, { id: newId(), role: 'assistant', content: message }]);
    } finally {
      generationController.current = null;
      setGenerating(false);
    }
  };

  const stopGeneration = () => generationController.current?.abort();

  const regenerate = () => {
    const previousPrompt = [...messages].reverse().find((message) => message.role === 'user')?.content;
    if (previousPrompt) runGeneration(previousPrompt);
  };

  const undo = () => {
    const latest = project.versions.at(-1);
    if (!latest) return;
    commitProject({
      ...project,
      updatedAt: new Date().toISOString(),
      specification: latest.previousSpecification,
      versions: project.versions.slice(0, -1),
    });
  };

  const exportProject = async () => {
    try {
      const safeName = project.specification.projectName.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
      const file = new File(Paths.cache, `${safeName || 'lotus-project'}.json`);
      if (file.exists) file.delete();
      file.create();
      file.write(specificationJson);
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(file.uri);
      else await Clipboard.setStringAsync(specificationJson);
    } catch {
      Alert.alert('Export failed', 'The project JSON could not be exported.');
    }
  };

  const exportHtml = async () => {
    try {
      const safeName = project.specification.projectName.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
      const file = new File(Paths.cache, `${safeName || 'lotus-project'}.html`);
      if (file.exists) file.delete();
      file.create();
      file.write(exportSpecificationAsHtml(project.specification));
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(file.uri, { mimeType: 'text/html', UTI: 'public.html' });
      else {
        await Clipboard.setStringAsync(exportSpecificationAsHtml(project.specification));
        Alert.alert('HTML copied', 'The self-contained HTML draft was copied to your clipboard.');
      }
    } catch {
      Alert.alert('Export failed', 'The HTML draft could not be exported.');
    }
  };

  const renameProject = () => {
    Alert.prompt('Rename project', 'Choose a name for this draft.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Save', onPress: (value: string | undefined) => {
        const projectName = value?.trim();
        if (projectName) commitProject({ ...project, updatedAt: new Date().toISOString(), specification: { ...project.specification, projectName } });
      } },
    ], 'plain-text', project.specification.projectName);
  };

  const duplicateProject = () => commitProject({
    ...project,
    id: newId(),
    updatedAt: new Date().toISOString(),
    specification: { ...project.specification, projectName: `${project.specification.projectName} copy` },
    versions: [],
  });

  const deleteCurrentProject = () => {
    Alert.alert('Delete this project?', 'This permanently removes this saved draft from this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        const remaining = projects.filter((item) => item.id !== project.id);
        const next = remaining.length ? remaining : [createProject()];
        setProject(next[0]);
        setProjects(next);
        saveProjects(next).catch(() => setError('Project changes could not be persisted.'));
      } },
    ]);
  };

  const openAccount = () => Alert.alert('Account & help', email, [
    { text: 'Privacy policy', onPress: () => { void openURL('https://www.luckylotus.app/legal/privacy'); } },
    { text: 'Terms of service', onPress: () => { void openURL('https://www.luckylotus.app/legal/terms'); } },
    { text: 'Contact support', onPress: () => { void openURL('mailto:support@luckylotus.app'); } },
    { text: 'AI provider settings', onPress: () => { void openURL('https://www.luckylotus.app/?section=settings&tab=ai'); } },
    { text: 'Delete account', style: 'destructive', onPress: () => Alert.alert('Permanently delete account?', 'Your Lotus account and saved projects on this device will be removed. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Continue', style: 'destructive', onPress: () => Alert.prompt('Confirm your password', 'Enter your Lotus password to permanently delete your account.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete account', style: 'destructive', onPress: (password: string | undefined) => {
          if (!password) return;
          void onDeleteAccount(password).catch((caught) => Alert.alert('Could not delete account', caught instanceof Error ? caught.message : 'Please try again.'));
        } },
      ], 'secure-text') },
    ]) },
    { text: 'Sign out', style: 'cancel', onPress: onSignOut },
    { text: 'Close', style: 'cancel' },
  ]);

  if (loading) {
    return (
      <View style={{ alignItems: 'center', backgroundColor: '#070809', flex: 1, justifyContent: 'center', gap: 12 }}>
        <ActivityIndicator color="#63F58B" />
        <Text style={{ color: '#A7ADB5' }}>Loading your projects.</Text>
      </View>
    );
  }

  const chatPane = (
    <View style={{ flex: 1, gap: 12 }}>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Text accessibilityElementsHidden style={{ color: '#63F58B', fontSize: 24 }}>?</Text>
        <View style={{ flex: 1 }}>
          <Text selectable style={{ color: '#F7F8F9', fontSize: 18, fontWeight: '800' }}>Build with Lotus</Text>
          <Text selectable style={{ color: '#747B84', fontSize: 12 }}>Controlled native generation</Text>
        </View>
      </View>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ gap: 10, paddingVertical: 4 }}
        style={{ flex: 1 }}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={{
              alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: message.role === 'user' ? '#234B31' : '#15181C',
              borderRadius: 14,
              maxWidth: '90%',
              padding: 12,
            }}
          >
            <Text selectable style={{ color: '#E8EAED', lineHeight: 20 }}>{message.content}</Text>
          </View>
        ))}
      </ScrollView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
        style={{ flexGrow: 0, maxHeight: 34 }}
      >
        {suggestions.map((suggestion) => (
          <Pressable
            key={suggestion}
            onPress={() => setPrompt(`Create a ${suggestion}`)}
            style={{ borderColor: '#30353C', borderRadius: 16, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 7 }}
          >
            <Text style={{ color: '#A9AFB7', fontSize: 12 }}>{suggestion}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <TextInput
        accessibilityLabel="App description"
        multiline
        onChangeText={setPrompt}
        placeholder="Describe an app or request a focused edit."
        placeholderTextColor="#5F666F"
        style={{
          backgroundColor: '#101215',
          borderColor: error ? '#FF6B6B' : '#30353C',
          borderRadius: 16,
          borderWidth: 1,
          color: '#F4F5F6',
          minHeight: 86,
          padding: 14,
          textAlignVertical: 'top',
        }}
        value={prompt}
      />
      {error ? <Text selectable style={{ color: '#FF7B7B', fontSize: 12 }}>{error}</Text> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <ActionButton title={generating ? 'Generating.' : 'Generate'} primary disabled={!prompt.trim() || generating} onPress={() => runGeneration()} />
        {generating ? <ActionButton title="Stop" onPress={stopGeneration} /> : null}
        <ActionButton
          title="Regenerate"
          disabled={generating || !messages.some((message) => message.role === 'user')}
          onPress={regenerate}
        />
        <ActionButton title="Undo" disabled={!project.versions.length} onPress={undo} />
        <ActionButton title="Clear chat" onPress={() => setMessages([])} />
      </View>
    </View>
  );

  const specPane = (
    <View style={{ flex: 1, gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Text selectable style={{ color: '#F7F8F9', fontSize: 17, fontWeight: '800' }}>Specification</Text>
          <Text selectable style={{ color: '#747B84', fontSize: 12 }}>{project.versions.length} saved versions</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <ActionButton title="Export HTML" primary onPress={exportHtml} />
          <ActionButton title="Export JSON" onPress={exportProject} />
        </View>
      </View>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ backgroundColor: '#0B0D0F', borderColor: '#262B31', borderRadius: 16, borderWidth: 1, flex: 1 }}
        contentContainerStyle={{ padding: 14 }}
      >
        <Text selectable style={{ color: '#A8E8BA', fontFamily: 'monospace', fontSize: 12, lineHeight: 19 }}>
          {specificationJson}
        </Text>
      </ScrollView>
      <View style={{ gap: 8 }}>
        <Text selectable style={{ color: '#9DA3AB', fontSize: 12, fontWeight: '700' }}>Saved projects</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <ActionButton title="Rename" onPress={renameProject} />
          <ActionButton title="Duplicate" onPress={duplicateProject} />
          <ActionButton title="Delete" onPress={deleteCurrentProject} />
        </View>
        <ScrollView horizontal contentContainerStyle={{ gap: 8 }}>
          {projects.map((saved) => (
            <Pressable
              key={saved.id}
              onPress={() => setProject(saved)}
              style={{
                backgroundColor: saved.id === project.id ? '#203026' : '#13161A',
                borderColor: saved.id === project.id ? '#63F58B' : '#292E35',
                borderRadius: 12,
                borderWidth: 1,
                padding: 10,
                width: 150,
              }}
            >
              <Text numberOfLines={1} style={{ color: '#F3F4F5', fontWeight: '700' }}>{saved.specification.projectName}</Text>
              <Text style={{ color: '#717882', fontSize: 11 }}>{new Date(saved.updatedAt).toLocaleDateString()}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </View>
  );

  return (
    <View style={{ backgroundColor: '#080808', flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View
        style={{
          alignItems: 'center',
          borderBottomColor: '#222222',
          borderBottomWidth: 1,
          flexDirection: 'row',
          gap: 12,
          minHeight: 54,
          paddingTop: insets.top,
          paddingHorizontal: 14,
        }}
      >
        <View style={{ alignItems: 'center', flexDirection: 'row', gap: 9 }}>
          <View style={{ alignItems: 'center', backgroundColor: '#1A1712', borderColor: '#5F4424', borderRadius: 8, borderWidth: 1, height: 28, justifyContent: 'center', width: 28 }}>
            <Text style={{ color: '#C98B36', fontSize: 13, fontWeight: '900' }}>L</Text>
          </View>
          <Text selectable style={{ color: '#FAFAFA', fontSize: 14, fontWeight: '800' }}>LOTUS</Text>
          <Text style={{ color: '#494949' }}>/</Text>
          <Text numberOfLines={1} selectable style={{ color: '#A6A6A6', maxWidth: isDesktop ? 260 : 130 }}>
            {project.specification.projectName}
          </Text>
        </View>
        <View style={{ flex: 1 }} />
        <View style={{ display: isDesktop ? 'flex' : 'none', flexDirection: 'row', gap: 4 }}>
          {(['preview', 'code'] as const).map((pane) => (
            <Pressable
              key={pane}
              onPress={() => setWorkspacePane(pane)}
              style={{
                backgroundColor: workspacePane === pane ? '#202020' : 'transparent',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 7,
              }}
            >
              <Text style={{ color: workspacePane === pane ? '#FFFFFF' : '#777777', fontSize: 12, fontWeight: '700', textTransform: 'capitalize' }}>
                {pane}
              </Text>
            </Pressable>
          ))}
        </View>
        <ActionButton title="Account" onPress={openAccount} />
        <ActionButton title="New project" onPress={() => commitProject(createProject())} />
        <ActionButton title="Export" primary onPress={exportProject} />
      </View>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {isDesktop ? (
          <View
            style={{
              alignItems: 'center',
              borderRightColor: '#222222',
              borderRightWidth: 1,
              gap: 10,
              paddingHorizontal: 9,
              paddingVertical: 12,
              width: 58,
            }}
          >
            <Pressable
              accessibilityLabel="Create new project"
              onPress={() => commitProject(createProject())}
              style={{ alignItems: 'center', backgroundColor: '#F3F3F3', borderRadius: 10, height: 38, justifyContent: 'center', width: 38 }}
            >
              <Text style={{ color: '#0A0A0A', fontSize: 22 }}>+</Text>
            </Pressable>
            {projects.slice(0, 6).map((saved) => (
              <Pressable
                accessibilityLabel={`Open ${saved.specification.projectName}`}
                key={saved.id}
                onPress={() => setProject(saved)}
                style={{
                  alignItems: 'center',
                  backgroundColor: saved.id === project.id ? '#262626' : '#111111',
                  borderColor: saved.id === project.id ? '#555555' : '#242424',
                  borderRadius: 10,
                  borderWidth: 1,
                  height: 38,
                  justifyContent: 'center',
                  width: 38,
                }}
              >
                <Text style={{ color: saved.id === project.id ? '#FFFFFF' : '#777777', fontSize: 12, fontWeight: '800' }}>
                  {saved.specification.projectName.slice(0, 1).toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        <View style={{ flex: 1, gap: 10, padding: isDesktop ? 8 : 10 }}>
        {!isDesktop ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['chat', 'preview', 'spec'] as const).map((pane) => (
              <Pressable
                key={pane}
                onPress={() => setMobilePane(pane)}
                style={{
                  backgroundColor: mobilePane === pane ? '#63F58B' : '#171A1E',
                  borderRadius: 12,
                  flex: 1,
                  padding: 10,
                }}
              >
                <Text style={{ color: mobilePane === pane ? '#071009' : '#D9DDE2', fontWeight: '700', textAlign: 'center', textTransform: 'capitalize' }}>
                  {pane}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        <View
          style={{
            flex: 1,
            flexDirection: isDesktop ? 'row' : 'column',
            gap: 8,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          {(isDesktop || mobilePane === 'chat') && (
            <View
              style={{
                backgroundColor: '#0D0D0D',
                borderColor: '#242424',
                borderRadius: 14,
                borderWidth: 1,
                flexBasis: isDesktop ? 360 : undefined,
                flexGrow: isDesktop ? 0 : 1,
                padding: 14,
                width: isDesktop ? 360 : undefined,
              }}
            >
              {chatPane}
            </View>
          )}
          {(isDesktop || mobilePane === 'preview' || mobilePane === 'spec') && (
            <View
              style={{
                backgroundColor: '#111111',
                borderColor: '#242424',
                borderRadius: 14,
                borderWidth: 1,
                flex: 1,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  alignItems: 'center',
                  borderBottomColor: '#242424',
                  borderBottomWidth: 1,
                  flexDirection: 'row',
                  gap: 8,
                  minHeight: 44,
                  paddingHorizontal: 12,
                }}
              >
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {['#3A3A3A', '#3A3A3A', '#3A3A3A'].map((color, index) => (
                    <View key={index} style={{ backgroundColor: color, borderRadius: 4, height: 8, width: 8 }} />
                  ))}
                </View>
                <View style={{ flex: 1 }} />
                <View style={{ backgroundColor: '#1A1A1A', borderRadius: 8, flexDirection: 'row', padding: 3 }}>
                  {(['preview', 'code'] as const).map((pane) => (
                    <Pressable
                      key={pane}
                      onPress={() => {
                        setWorkspacePane(pane);
                        if (!isDesktop) setMobilePane(pane === 'code' ? 'spec' : 'preview');
                      }}
                      style={{
                        backgroundColor: workspacePane === pane ? '#323232' : 'transparent',
                        borderRadius: 6,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                      }}
                    >
                      <Text style={{ color: workspacePane === pane ? '#FFFFFF' : '#777777', fontSize: 11, fontWeight: '700', textTransform: 'capitalize' }}>
                        {pane}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <View style={{ flex: 1 }} />
                <Text selectable style={{ color: '#6F6F6F', fontSize: 11 }}>100%</Text>
              </View>
              <View style={{ flex: 1, padding: workspacePane === 'preview' ? 18 : 12 }}>
                {workspacePane === 'preview' && mobilePane !== 'spec' ? (
                  <View
                    style={{
                      alignSelf: 'center',
                      backgroundColor: '#090909',
                      borderRadius: 28,
                      boxShadow: '0 18px 70px rgba(0,0,0,0.45)',
                      flex: 1,
                      maxWidth: 920,
                      overflow: 'hidden',
                      width: '100%',
                    }}
                  >
                    <NativePreview specification={project.specification} />
                  </View>
                ) : specPane}
              </View>
            </View>
          )}
        </View>
        </View>
      </View>
    </View>
  );
}

export default function BuilderScreen() {
  const { data: session, isPending } = authClient.useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  const submit = async () => {
    setSubmitting(true);
    setAuthError('');
    try {
      const result = creatingAccount
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
        : await authClient.signIn.email({ email: email.trim(), password });
      if (result.error) setAuthError(result.error.message ?? 'Could not sign in. Check your details and try again.');
    } catch {
      setAuthError('Could not reach Lotus. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isPending) {
    return (
      <View style={{ alignItems: 'center', backgroundColor: '#070809', flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator color="#63F58B" />
        <Text style={{ color: '#A6A6A6', marginTop: 12 }}>Checking your Lotus session.</Text>
      </View>
    );
  }

  if (session?.user) {
    return <BuilderWorkspace
      email={session.user.email}
      onSignOut={() => { void authClient.signOut(); }}
      onDeleteAccount={async (password) => {
        const result = await authClient.deleteUser({ password });
        if (result.error) throw new Error(result.error.message ?? 'Your password could not be verified.');
        await saveProjects([]);
        await authClient.signOut();
      }}
    />;
  }

  return (
    <View style={{ alignItems: 'center', backgroundColor: '#070809', flex: 1, justifyContent: 'center', padding: 24 }}>
      <View style={{ gap: 16, maxWidth: 420, width: '100%' }}>
        <View style={{ alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Text style={{ color: '#C98B36', fontSize: 13, fontWeight: '900', letterSpacing: 3 }}>LOTUS</Text>
          <Text style={{ color: '#F8F9FA', fontSize: 26, fontWeight: '800' }}>App Builder</Text>
          <Text style={{ color: '#A6A6A6', textAlign: 'center' }}>Sign in to your Lotus account to build and save apps.</Text>
        </View>
        {creatingAccount ? (
          <TextInput
            autoCapitalize="words"
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor="#717882"
            value={name}
            style={{ backgroundColor: '#111316', borderColor: '#30353C', borderRadius: 12, borderWidth: 1, color: '#F8F9FA', padding: 14 }}
          />
        ) : null}
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#717882"
          value={email}
          style={{ backgroundColor: '#111316', borderColor: '#30353C', borderRadius: 12, borderWidth: 1, color: '#F8F9FA', padding: 14 }}
        />
        <TextInput
          autoCapitalize="none"
          autoComplete={creatingAccount ? 'new-password' : 'current-password'}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#717882"
          secureTextEntry
          value={password}
          style={{ backgroundColor: '#111316', borderColor: '#30353C', borderRadius: 12, borderWidth: 1, color: '#F8F9FA', padding: 14 }}
        />
        {authError ? <Text accessibilityRole="alert" style={{ color: '#FF8A8A' }}>{authError}</Text> : null}
        <ActionButton
          title={submitting ? 'Please wait.' : creatingAccount ? 'Create account' : 'Sign in'}
          primary
          disabled={submitting || !email.trim() || !password || (creatingAccount && !name.trim())}
          onPress={() => { void submit(); }}
        />
        <Pressable onPress={() => { setCreatingAccount(!creatingAccount); setAuthError(''); }} style={{ padding: 10 }}>
          <Text style={{ color: '#A6A6A6', textAlign: 'center' }}>
            {creatingAccount ? 'Already have a Lotus account? Sign in' : 'New to Lotus? Create an account'}
          </Text>
        </Pressable>
        <Pressable onPress={() => { void openURL('https://www.luckylotus.app/?section=settings&tab=ai'); }} style={{ padding: 8 }}>
          <Text style={{ color: '#8E9C91', textAlign: 'center' }}>Open Lotus AI settings to connect your provider key</Text>
        </Pressable>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 18 }}>
          <Pressable onPress={() => { void openURL('https://www.luckylotus.app/legal/privacy'); }}><Text style={{ color: '#8E9C91', fontSize: 12 }}>Privacy</Text></Pressable>
          <Pressable onPress={() => { void openURL('https://www.luckylotus.app/legal/terms'); }}><Text style={{ color: '#8E9C91', fontSize: 12 }}>Terms</Text></Pressable>
          <Pressable onPress={() => { void openURL('mailto:support@luckylotus.app'); }}><Text style={{ color: '#8E9C91', fontSize: 12 }}>Support</Text></Pressable>
        </View>
      </View>
    </View>
  );
}

