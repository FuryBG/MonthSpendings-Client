import { Platform, ViewStyle } from 'react-native';

export const Tavira = {
  navy:        '#0B1B3A',
  navyDeep:    '#071228',
  navyCard:    '#0F2244',
  teal:        '#3EC6C6',
  purple:      '#5B7BFF',
  lightBg:     '#F2F4F8',
  white:       '#FFFFFF',

  // glass surfaces (dark)
  glassBg:     'rgba(255,255,255,0.07)',
  glassBgMid:  'rgba(255,255,255,0.10)',
  glassBgHi:   'rgba(255,255,255,0.15)',
  glassBorder: 'rgba(255,255,255,0.14)',

  // glows
  glowTeal:    'rgba(62,198,198,0.22)',
  glowPurple:  'rgba(91,123,255,0.22)',

  // semantic
  expense:     '#FF6B6B',
  income:      '#3EC6C6',
  warning:     '#F59E0B',

  // gradients (for LinearGradient)
  gradTeal:    ['#3EC6C6', '#5B7BFF'] as const,
  gradNavy:    ['#0B1B3A', '#071228'] as const,
  gradCard:    ['rgba(62,198,198,0.13)', 'rgba(91,123,255,0.08)'] as const,
  gradCardAlt: ['rgba(91,123,255,0.13)', 'rgba(62,198,198,0.08)'] as const,
} as const;

export const glassCard: ViewStyle = {
  backgroundColor: Tavira.glassBg,
  borderWidth: 1,
  borderColor: Tavira.glassBorder,
  borderRadius: 18,
};

export const gradientButton: ViewStyle = {
  borderRadius: 14,
  overflow: 'hidden',
};

// Legacy colors (kept for backward compatibility)
export const Colors = {
  light: {
    text: '#0B1B3A',
    background: '#F2F4F8',
    tint: '#0B1B3A',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#0B1B3A',
  },
  dark: {
    text: '#F2F4F8',
    background: '#0B1B3A',
    tint: '#3EC6C6',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#3EC6C6',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
