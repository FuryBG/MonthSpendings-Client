import { BottomSheet, BottomSheetRef } from '@/components/BottomSheet';
import type { BudgetPeriod } from '@/types/Types';
import { useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { formatSpan, pluralPeriods } from '../../model/format';
import { COMPARE_A_COLOR, COMPARE_B_COLOR } from '../../model/palette';
import type { ResolvedRange } from '../../model/types';
import { useStatsColors } from '../primitives/useStatsColors';

type Props = {
  visible: boolean;
  periods: BudgetPeriod[];
  rangeA: ResolvedRange;
  previous: ResolvedRange | null;
  yearEarlier: ResolvedRange | null;
  onPick: (range: ResolvedRange) => void;
  onCustom: () => void;
  onClose: () => void;
};

export function CompareSheet({ visible, periods, rangeA, previous, yearEarlier, onPick, onCustom, onClose }: Props) {
  const c = useStatsColors();
  const sheetRef = useRef<BottomSheetRef>(null);

  const span = (r: ResolvedRange) => formatSpan(periods[r.startIndex].startDate, periods[r.endIndex].endDate);
  const closeThen = (action: () => void) => sheetRef.current?.close(action);

  return (
    <BottomSheet ref={sheetRef} visible={visible} onClose={(done) => { onClose(); done?.(); }}>
      <Text style={[s.title, { color: c.text }]}>Compare with</Text>

      <View style={[s.current, { borderColor: c.border }]}>
        <View style={[s.dot, { backgroundColor: COMPARE_A_COLOR }]} />
        <Text style={[s.currentText, { color: c.muted }]}>
          <Text style={{ color: c.text, fontWeight: '600' }}>{rangeA.label}</Text>  {span(rangeA)}
        </Text>
      </View>

      <View style={s.options}>
        {previous ? (
          <CompareOption
            icon="history"
            title={previous.count === 1 ? 'Previous period' : previous.count === rangeA.count ? `Previous ${previous.count} periods` : `The ${pluralPeriods(previous.count)} before`}
            detail={span(previous)}
            recommended
            onPress={() => closeThen(() => onPick(previous))}
          />
        ) : null}
        {yearEarlier ? (
          <CompareOption
            icon="calendar-arrow-left"
            title="Same periods a year earlier"
            detail={span(yearEarlier)}
            onPress={() => closeThen(() => onPick(yearEarlier))}
          />
        ) : null}
        <CompareOption icon="calendar-range" title="Choose periods" detail="Pick any first and last period" onPress={() => closeThen(onCustom)} />
      </View>

      {!previous ? (
        <Text style={[s.note, { color: c.faint }]}>There are no earlier periods yet, so only a custom range is available.</Text>
      ) : null}
    </BottomSheet>
  );
}

type OptionProps = {
  icon: string;
  title: string;
  detail: string;
  recommended?: boolean;
  onPress: () => void;
};

function CompareOption({ icon, title, detail, recommended = false, onPress }: OptionProps) {
  const c = useStatsColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.option, { backgroundColor: c.surfaceRaised, borderColor: recommended ? COMPARE_B_COLOR : c.border }, pressed && { opacity: 0.75 }]}
      accessibilityRole="button"
    >
      <View style={[s.optionIcon, { backgroundColor: `${COMPARE_B_COLOR}22` }]}>
        <Icon source={icon} size={18} color={COMPARE_B_COLOR} />
      </View>
      <View style={s.optionText}>
        <Text style={[s.optionTitle, { color: c.text }]}>{title}</Text>
        <Text style={[s.optionDetail, { color: c.muted }]}>{detail}</Text>
      </View>
      <Icon source="chevron-right" size={20} color={c.faint} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  current: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, borderBottomWidth: 1, marginBottom: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  currentText: { fontSize: 14, flex: 1 },
  options: { gap: 8 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, minHeight: 64 },
  optionIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  optionText: { flex: 1, gap: 2 },
  optionTitle: { fontSize: 15, fontWeight: '600' },
  optionDetail: { fontSize: 13 },
  note: { fontSize: 13, textAlign: 'center', marginTop: 4 },
});
