// AppSchema — The schema that defines an app
// Every app in LOTUS is defined by this schema structure

export interface AppSchema {
  name: string;
  screens: Screen[];
  navigation: NavigationConfig;
  activeScreenId: string;
  theme: ThemeConfig;
  imageAssets: ImageAsset[];
}

export interface Screen {
  id: string;
  name: string;
  title: string;
  components: ComponentDef[];
}

export interface ComponentDef {
  id: string;
  type: string;
  props: Record<string, any>;
}

export interface NavigationConfig {
  type: 'none' | 'bottom-tabs' | 'drawer' | 'stack';
  items?: NavItem[];
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  screenId: string;
}

export interface ThemeConfig {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
}

export interface ImageAsset {
  id: string;
  name: string;
  dataUrl: string;
  mimeType: string;
}

export interface SchemaPatch {
  op: string;
  description?: string;
  screen?: Screen;
  screenId?: string;
  component?: ComponentDef;
}
