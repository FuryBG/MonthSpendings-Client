import { OverlayLoader } from "@/components/OverlayLoader";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Tavira } from "@/constants/theme";
import { useSnackbarStore } from "@/stores/snackbarStore";
import { useTitleStore } from "@/stores/titleStore";
import { BankOption } from "@/types/Types";
import { useFocusEffect } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import debounce from "lodash.debounce";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Icon, Text, useTheme } from "react-native-paper";
import { getBanks, startBankConnection } from "../services/api";

// ─── Skeleton row ────────────────────────────────────────────────────────────
function SkeletonRow({ isDark }: { isDark: boolean }) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.7] });
  const base = isDark ? "rgba(255,255,255,0.08)" : "rgba(11,27,58,0.06)";

  return (
    <Animated.View
      style={[
        s.skeletonRow,
        {
          opacity,
          backgroundColor: isDark ? Tavira.glassBg : "#fff",
          borderColor: isDark ? Tavira.glassBorder : "rgba(11,27,58,0.07)",
        },
      ]}
    >
      <View style={[s.skeletonLogo, { backgroundColor: base }]} />
      <View style={s.skeletonMeta}>
        <View style={[s.skeletonName, { backgroundColor: base }]} />
        <View style={[s.skeletonBadge, { backgroundColor: base }]} />
      </View>
      <View style={[s.skeletonChevron, { backgroundColor: base }]} />
    </Animated.View>
  );
}

// ─── Bank row ─────────────────────────────────────────────────────────────────
type BankRowProps = { item: BankOption; onPress: () => void; isDark: boolean };

function BankRow({ item, onPress, isDark }: BankRowProps) {
  return (
    <TouchableOpacity
      style={[
        s.bankRow,
        {
          backgroundColor: isDark ? Tavira.glassBg : "#fff",
          borderColor: isDark ? Tavira.glassBorder : "rgba(11,27,58,0.07)",
          ...(!isDark && lightShadow),
        },
      ]}
      onPress={onPress}
      activeOpacity={0.62}
    >
      <View style={s.logoWrap}>
        {item.logo ? (
          <Image
            source={{ uri: item.logo }}
            resizeMode="contain"
            style={s.logo}
          />
        ) : (
          <Icon source="bank-outline" size={22} color={Tavira.teal} />
        )}
      </View>

      <View style={s.bankMeta}>
        <Text
          style={[s.bankName, { color: isDark ? "#F2F4F8" : Tavira.navy }]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <View
          style={[
            s.countryBadge,
            {
              backgroundColor: isDark
                ? "rgba(62,198,198,0.12)"
                : "rgba(62,198,198,0.10)",
              borderColor: isDark
                ? "rgba(62,198,198,0.22)"
                : "rgba(62,198,198,0.20)",
            },
          ]}
        >
          <Text style={s.countryText}>{item.country}</Text>
        </View>
      </View>

      <Icon
        source="chevron-right"
        size={16}
        color={isDark ? "rgba(62,198,198,0.5)" : "rgba(11,27,58,0.22)"}
      />
    </TouchableOpacity>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ query, isDark }: { query: string; isDark: boolean }) {
  return (
    <View style={s.emptyWrap}>
      <View
        style={[
          s.emptyIconRing,
          {
            backgroundColor: isDark
              ? "rgba(62,198,198,0.08)"
              : "rgba(62,198,198,0.07)",
            borderColor: isDark
              ? "rgba(62,198,198,0.18)"
              : "rgba(62,198,198,0.15)",
          },
        ]}
      >
        <Icon source="bank-off-outline" size={32} color={Tavira.teal} />
      </View>
      <Text
        style={[s.emptyTitle, { color: isDark ? "#F2F4F8" : Tavira.navy }]}
      >
        No banks found
      </Text>
      {query.length > 0 && (
        <Text
          style={[
            s.emptySubtitle,
            { color: isDark ? "rgba(242,244,248,0.4)" : "rgba(11,27,58,0.4)" },
          ]}
        >
          No results for &ldquo;{query}&rdquo;
        </Text>
      )}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function ConnectBankScreen() {
  const theme = useTheme();
  const isDark = theme.dark;

  const [banks, setBanks] = useState<BankOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const showError = useSnackbarStore((s) => s.showError);
  const setTitle = useTitleStore((s) => s.setTitle);

  const fetchBanks = async (bankName: string) => {
    try {
      setLoadingBanks(true);
      const result = await getBanks(bankName);
      setBanks(result);
    } catch {
      showError("Failed to load banks.");
    } finally {
      setLoadingBanks(false);
    }
  };

  useEffect(() => {
    fetchBanks("");
  }, []);

  const debouncedSearch = useRef(
    debounce((text: string) => fetchBanks(text), 500)
  ).current;

  useEffect(() => () => debouncedSearch.cancel(), [debouncedSearch]);

  const onChangeSearch = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  async function onSelectBank(bank: BankOption) {
    try {
      setLoading(true);
      const authUrl = await startBankConnection(
        bank.name,
        bank.country,
        bank.logo,
        bank.maximumConsentValidity
      );
      setLoading(false);
      await WebBrowser.openAuthSessionAsync(authUrl, 'tavira://(main)/');
    } catch {
      showError("Bank connection failed.");
      setLoading(false);
    }
  }

  useFocusEffect(() => {
    setTitle("Select Bank");
  });

  // ── border color for search ──
  const searchBorderColor = focused
    ? Tavira.teal
    : isDark
    ? Tavira.glassBorder
    : "rgba(11,27,58,0.12)";

  const searchBg = isDark ? Tavira.glassBgMid : "#fff";

  // ── list header ──
  const ListHeader = (
    <View style={s.headerArea}>
      <Text
        style={[
          s.subtitle,
          {
            color: isDark
              ? "rgba(242,244,248,0.38)"
              : "rgba(11,27,58,0.38)",
          },
        ]}
      >
        Search from 2,500+ European banks
      </Text>

      {/* Search */}
      <View
        style={[
          s.searchWrap,
          {
            backgroundColor: searchBg,
            borderColor: searchBorderColor,
            ...(!isDark && lightShadowSm),
          },
        ]}
      >
        <Icon
          source="magnify"
          size={18}
          color={
            focused
              ? Tavira.teal
              : isDark
              ? "rgba(242,244,248,0.35)"
              : "rgba(11,27,58,0.35)"
          }
        />
        <TextInput
          style={[
            s.searchInput,
            {
              color: isDark ? "#F2F4F8" : Tavira.navy,
            },
          ]}
          placeholder="Search bank name..."
          placeholderTextColor={
            isDark ? "rgba(242,244,248,0.3)" : "rgba(11,27,58,0.3)"
          }
          value={searchQuery}
          onChangeText={onChangeSearch}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
      </View>
    </View>
  );

  // ── skeleton ──
  const showSkeleton = loadingBanks && banks.length === 0;

  return (
    <ScreenContainer scrollable={false} glowColor="teal">
      <OverlayLoader isVisible={loading} message="Redirecting to bank..." />

      {showSkeleton ? (
        <View style={s.skeletonContainer}>
          {ListHeader}
          {Array.from({ length: 7 }).map((_, i) => (
            <SkeletonRow key={i} isDark={isDark} />
          ))}
        </View>
      ) : (
        <FlatList
          data={banks}
          keyExtractor={(item) => `${item.name}-${item.country}`}
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          windowSize={5}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.list}
          ListHeaderComponent={ListHeader}
          ItemSeparatorComponent={() => <View style={s.sep} />}
          ListEmptyComponent={
            !loadingBanks ? (
              <EmptyState query={searchQuery} isDark={isDark} />
            ) : null
          }
          renderItem={({ item }) => (
            <BankRow
              item={item}
              onPress={() => onSelectBank(item)}
              isDark={isDark}
            />
          )}
        />
      )}
    </ScreenContainer>
  );
}

// ─── Shadow helpers ───────────────────────────────────────────────────────────
const lightShadow = Platform.select({
  ios: {
    shadowColor: "#0B1B3A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  android: { elevation: 2 },
  default: {},
});

const lightShadowSm = Platform.select({
  ios: {
    shadowColor: "#0B1B3A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  android: { elevation: 1 },
  default: {},
});

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // header
  headerArea: {
    paddingBottom: 12,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.2,
    marginBottom: 14,
  },

  // search
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "android" ? 6 : 11,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    paddingVertical: 0,
  },

  // list
  list: {
    paddingHorizontal: 0,
    paddingBottom: 32,
  },
  sep: { height: 8 },

  // bank row
  bankRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  logoWrap: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(11,27,58,0.08)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    padding: 5,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  bankMeta: {
    flex: 1,
    gap: 5,
  },
  bankName: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.1,
  },
  countryBadge: {
    alignSelf: "flex-start",
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  countryText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
    color: Tavira.teal,
  },

  // skeleton
  skeletonContainer: {
    flex: 1,
    gap: 8,
  },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    height: 74,
  },
  skeletonLogo: {
    width: 50,
    height: 50,
    borderRadius: 12,
  },
  skeletonMeta: {
    flex: 1,
    gap: 8,
  },
  skeletonName: {
    height: 13,
    borderRadius: 6,
    width: "60%",
  },
  skeletonBadge: {
    height: 10,
    borderRadius: 5,
    width: "25%",
  },
  skeletonChevron: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },

  // empty
  emptyWrap: {
    alignItems: "center",
    paddingTop: 48,
    gap: 12,
  },
  emptyIconRing: {
    width: 72,
    height: 72,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: "center",
  },
});
