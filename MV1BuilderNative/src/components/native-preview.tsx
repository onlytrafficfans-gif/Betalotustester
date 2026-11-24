import { Pressable, ScrollView, Text, View } from 'react-native';

import { AppSection, AppSectionItem, AppSpecification } from '@/types/builder';

type PreviewTheme = AppSpecification['theme'];

const parseMetric = (value: string, fallback: number) => {
  const parsed = Number.parseFloat(value.replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? Math.min(100, Math.max(8, parsed)) : fallback;
};

function SectionHeading({ section, theme }: { section: AppSection; theme: PreviewTheme }) {
  return (
    <View style={{ gap: 7, maxWidth: 620 }}>
      <Text selectable style={{ color: theme.accent, fontSize: 10, fontWeight: '800', letterSpacing: 1.6 }}>
        {section.eyebrow}
      </Text>
      <Text selectable style={{ color: theme.text, fontSize: 25, fontWeight: '800', letterSpacing: -0.8 }}>
        {section.title}
      </Text>
      <Text selectable style={{ color: theme.muted, fontSize: 13, lineHeight: 20 }}>
        {section.subtitle}
      </Text>
    </View>
  );
}

function Hero({ section, theme }: { section: AppSection; theme: PreviewTheme }) {
  return (
    <View
      style={{
        backgroundColor: theme.surface,
        borderColor: `${theme.accent}38`,
        borderRadius: theme.radius,
        borderWidth: 1,
        gap: 24,
        overflow: 'hidden',
        padding: 30,
        position: 'relative',
      }}
    >
      <View
        style={{
          backgroundColor: `${theme.accent}18`,
          borderRadius: 120,
          height: 210,
          position: 'absolute',
          right: -65,
          top: -90,
          width: 210,
        }}
      />
      <View style={{ gap: 12, maxWidth: 680 }}>
        <View style={{ alignSelf: 'flex-start', backgroundColor: `${theme.accent}18`, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 6 }}>
          <Text style={{ color: theme.accent, fontSize: 9, fontWeight: '800', letterSpacing: 1.4 }}>{section.eyebrow}</Text>
        </View>
        <Text selectable style={{ color: theme.text, fontSize: 38, fontWeight: '900', letterSpacing: -1.8, lineHeight: 42 }}>
          {section.title}
        </Text>
        <Text selectable style={{ color: theme.muted, fontSize: 15, lineHeight: 23, maxWidth: 600 }}>{section.subtitle}</Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
        {section.items.slice(0, 2).map((entry, index) => (
          <Pressable
            key={`${section.id}-${entry.title}`}
            style={{
              backgroundColor: index === 0 ? theme.accent : 'transparent',
              borderColor: index === 0 ? theme.accent : `${theme.text}30`,
              borderRadius: 12,
              borderWidth: 1,
              paddingHorizontal: 16,
              paddingVertical: 11,
            }}
          >
            <Text style={{ color: index === 0 ? theme.background : theme.text, fontSize: 12, fontWeight: '800' }}>
              {entry.title} {index === 0 ? '↗' : '→'}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function Stats({ section, theme }: { section: AppSection; theme: PreviewTheme }) {
  return (
    <View style={{ gap: 16 }}>
      <SectionHeading section={section} theme={theme} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
        {section.items.map((entry, index) => (
          <View
            key={`${section.id}-${index}`}
            style={{
              backgroundColor: theme.surface,
              borderColor: `${theme.text}14`,
              borderRadius: theme.radius * 0.72,
              borderWidth: 1,
              flexBasis: section.columns >= 4 ? '22%' : '45%',
              flexGrow: 1,
              gap: 14,
              minWidth: 130,
              padding: 16,
            }}
          >
            <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text selectable style={{ color: theme.muted, fontSize: 11, fontWeight: '700' }}>{entry.title}</Text>
              <Text selectable style={{ color: theme.accent, fontSize: 10, fontWeight: '800' }}>{entry.meta}</Text>
            </View>
            <Text selectable style={{ color: theme.text, fontSize: 28, fontWeight: '900', letterSpacing: -1 }}>{entry.value}</Text>
            <Text selectable style={{ color: theme.muted, fontSize: 10, lineHeight: 15 }}>{entry.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Chart({ section, theme }: { section: AppSection; theme: PreviewTheme }) {
  return (
    <View style={{ backgroundColor: theme.surface, borderColor: `${theme.text}14`, borderRadius: theme.radius, borderWidth: 1, gap: 20, padding: 20 }}>
      <SectionHeading section={section} theme={theme} />
      <View style={{ alignItems: 'flex-end', flexDirection: 'row', gap: 8, height: 150 }}>
        {section.items.map((entry, index) => {
          const height = parseMetric(entry.value, 30 + index * 8);
          return (
            <View key={`${section.id}-${entry.title}`} style={{ alignItems: 'center', flex: 1, gap: 7 }}>
              <Text style={{ color: theme.muted, fontSize: 9 }}>{entry.value}</Text>
              <View style={{ backgroundColor: `${theme.text}0D`, borderRadius: 7, height: 105, justifyContent: 'flex-end', overflow: 'hidden', width: '100%' }}>
                <View style={{ backgroundColor: index === section.items.length - 1 ? theme.accent : `${theme.accentSecondary}B8`, borderRadius: 7, height: `${height}%` }} />
              </View>
              <Text style={{ color: theme.muted, fontSize: 9 }}>{entry.title}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function EditorialGrid({ section, theme }: { section: AppSection; theme: PreviewTheme }) {
  const isList = ['activity', 'faq', 'table'].includes(section.type);
  return (
    <View style={{ gap: 16 }}>
      <SectionHeading section={section} theme={theme} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
        {section.items.map((entry: AppSectionItem, index) => (
          <View
            key={`${section.id}-${index}`}
            style={{
              backgroundColor: index === 0 && !isList ? `${theme.accent}12` : theme.surface,
              borderColor: index === 0 && !isList ? `${theme.accent}38` : `${theme.text}14`,
              borderRadius: theme.radius * 0.72,
              borderWidth: 1,
              flexBasis: isList ? '100%' : section.columns >= 3 ? '30%' : section.columns === 2 ? '46%' : '100%',
              flexGrow: 1,
              gap: 10,
              minHeight: isList ? 78 : 132,
              minWidth: isList ? '100%' : 150,
              padding: 16,
            }}
          >
            <View style={{ alignItems: 'center', flexDirection: 'row', gap: 10 }}>
              <View style={{ alignItems: 'center', backgroundColor: `${theme.accent}18`, borderRadius: 9, height: 30, justifyContent: 'center', width: 30 }}>
                <Text style={{ color: theme.accent, fontSize: 13, fontWeight: '900' }}>{index + 1}</Text>
              </View>
              <Text selectable style={{ color: theme.text, flex: 1, fontSize: 13, fontWeight: '800' }}>{entry.title}</Text>
              {entry.meta ? <Text selectable style={{ color: theme.muted, fontSize: 9 }}>{entry.meta}</Text> : null}
            </View>
            {entry.value ? <Text selectable style={{ color: theme.accent, fontSize: 22, fontWeight: '900' }}>{entry.value}</Text> : null}
            <Text selectable style={{ color: theme.muted, fontSize: 11, lineHeight: 17 }}>{entry.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function PreviewSection({ section, theme }: { section: AppSection; theme: PreviewTheme }) {
  if (section.type === 'hero' || section.type === 'cta') return <Hero section={section} theme={theme} />;
  if (section.type === 'stats') return <Stats section={section} theme={theme} />;
  if (section.type === 'chart') return <Chart section={section} theme={theme} />;
  return <EditorialGrid section={section} theme={theme} />;
}

export function NativePreview({ specification }: { specification: AppSpecification }) {
  const theme = specification.theme;
  return (
    <View
      style={{
        backgroundColor: theme.background,
        borderColor: `${theme.text}18`,
        borderRadius: 22,
        borderWidth: 1,
        flex: 1,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          alignItems: 'center',
          backgroundColor: `${theme.surface}E8`,
          borderBottomColor: `${theme.text}14`,
          borderBottomWidth: 1,
          flexDirection: 'row',
          gap: 14,
          minHeight: 48,
          paddingHorizontal: 16,
        }}
      >
        <View style={{ alignItems: 'center', backgroundColor: theme.accent, borderRadius: 8, height: 25, justifyContent: 'center', width: 25 }}>
          <Text style={{ color: theme.background, fontSize: 10, fontWeight: '900' }}>{specification.projectName.slice(0, 1)}</Text>
        </View>
        <Text numberOfLines={1} selectable style={{ color: theme.text, fontSize: 12, fontWeight: '800' }}>{specification.projectName}</Text>
        <View style={{ flex: 1 }} />
        <View style={{ flexDirection: 'row', gap: 14 }}>
          {specification.navigation.slice(0, 4).map((entry, index) => (
            <Text key={entry} style={{ color: index === 0 ? theme.text : theme.muted, fontSize: 9, fontWeight: index === 0 ? '800' : '600' }}>{entry}</Text>
          ))}
        </View>
      </View>
      <ScrollView
        contentContainerStyle={{ gap: 34, padding: 22 }}
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1 }}
      >
        {specification.sections.map((section) => (
          <PreviewSection key={section.id} section={section} theme={theme} />
        ))}
        <View style={{ borderTopColor: `${theme.text}14`, borderTopWidth: 1, flexDirection: 'row', gap: 12, paddingVertical: 18 }}>
          <Text selectable style={{ color: theme.text, flex: 1, fontSize: 11, fontWeight: '800' }}>{specification.projectName}</Text>
          <Text selectable style={{ color: theme.muted, fontSize: 9 }}>Generated with Lotus App Builder</Text>
        </View>
      </ScrollView>
    </View>
  );
}
