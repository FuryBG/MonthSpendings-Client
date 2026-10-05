import { Tavira } from '@/constants/theme';
import { useTheme } from 'react-native-paper';

/** Theme-aware colours shared by every stats component. */
export function useStatsColors() {
  const { dark } = useTheme();

  return dark
    ? {
        dark,
        text: '#F2F4F8',
        muted: 'rgba(242,244,248,0.58)',
        faint: 'rgba(242,244,248,0.32)',
        surface: Tavira.glassBg,
        surfaceRaised: Tavira.glassBgMid,
        border: Tavira.glassBorder,
        track: 'rgba(255,255,255,0.08)',
        accent: Tavira.teal,
        onAccent: Tavira.navy,
        more: Tavira.expense,  // spent more
        less: Tavira.income,   // spent less
        ghostBar: 'rgba(91,123,255,0.55)',
        skeleton: 'rgba(255,255,255,0.08)',
        canvasBg: '#0D1D3D',
      }
    : {
        dark,
        text: Tavira.navy,
        muted: 'rgba(11,27,58,0.58)',
        faint: 'rgba(11,27,58,0.34)',
        surface: Tavira.white,
        surfaceRaised: '#F7F8FB',
        border: 'rgba(11,27,58,0.08)',
        track: 'rgba(11,27,58,0.06)',
        accent: Tavira.navy,
        onAccent: Tavira.white,
        more: '#E5484D',
        less: '#1E9E9E',
        ghostBar: 'rgba(91,123,255,0.45)',
        skeleton: 'rgba(11,27,58,0.06)',
        canvasBg: Tavira.white,
      };
}

export type StatsColors = ReturnType<typeof useStatsColors>;
