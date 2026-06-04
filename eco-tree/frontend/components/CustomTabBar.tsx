import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useWindowDimensions,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Svg, { Path } from "react-native-svg";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { COLORS, SPACING, TYPOGRAPHY } from "../constants/theme";

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: "home",
  map: "map",
  "qr-scan": "qr-code",
  ai: "chatbubbles",
  profile: "person",
};

const ICON_OUTLINE_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: "home-outline",
  map: "map-outline",
  "qr-scan": "qr-code-outline",
  ai: "chatbubbles-outline",
  profile: "person-outline",
};

const LABEL_MAP: Record<string, string> = {
  index: "HOME",
  map: "MAP",
  "qr-scan": "",
  ai: "ASSISTANT",
  profile: "PROFILE",
};

// Notch geometry
const NOTCH_RADIUS = 46;
const NOTCH_CURVE = 22;
const BAR_CORNER = 32;
const BAR_HEIGHT_BASE = 78;

function buildBarPath(width: number, height: number) {
  const cx = width / 2;
  const r = NOTCH_RADIUS;
  const c = NOTCH_CURVE;
  const d = [
    `M ${BAR_CORNER} 0`,
    `L ${cx - r - c} 0`,
    `C ${cx - r} 0, ${cx - r} ${r}, ${cx} ${r}`,
    `C ${cx + r} ${r}, ${cx + r} 0, ${cx + r + c} 0`,
    `L ${width - BAR_CORNER} 0`,
    `Q ${width} 0, ${width} ${BAR_CORNER}`,
    `L ${width} ${height}`,
    `L 0 ${height}`,
    `L 0 ${BAR_CORNER}`,
    `Q 0 0, ${BAR_CORNER} 0`,
    `Z`,
  ].join(" ");
  return d;
}

// ── Simple Premium QR FAB ───────────────────────────────────────────────────
function AnimatedQrFab({ onPress }: { onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const breatheAnim = useRef<Animated.CompositeAnimation | null>(null);

  const startBreathing = () => {
    breatheAnim.current = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.06,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    breatheAnim.current.start();
  };

  useEffect(() => {
    startBreathing();
    return () => {
      breatheAnim.current?.stop();
    };
  }, []);

  const handlePressIn = () => {
    breatheAnim.current?.stop();
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 20,
      bounciness: 12,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 12,
    }).start(({ finished }) => {
      if (finished) {
        startBreathing();
      }
    });
  };

  return (
    <Animated.View style={[styles.fabOuter, { transform: [{ scale }] }]}>
      <TouchableOpacity
        testID="qr-scan-fab"
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={styles.fabNew}
      >
        <Ionicons name="qr-code" size={32} color={COLORS.surface} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width: winW } = useWindowDimensions();
  const SCREEN_W = Math.min(winW, 480);

  const bottomPad = Math.max(insets.bottom, 10);
  const barHeight = BAR_HEIGHT_BASE + bottomPad;

  const handlePress = (routeKey: string, routeName: string, isFocused: boolean) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    const event = navigation.emit({ type: "tabPress", target: routeKey, canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(routeName as never);
    }
  };

  return (
    <View style={[styles.wrapper, { width: SCREEN_W, alignSelf: "center", height: barHeight + 32 }]} testID="bottom-tab-bar">
      {/* SVG arched bar shape */}
      <View style={styles.svgLayer} pointerEvents="none">
        <Svg width={SCREEN_W} height={barHeight} style={{ position: "absolute", bottom: 0 }}>
          <Path d={buildBarPath(SCREEN_W, barHeight)} fill={COLORS.surface} />
          <Path
            d={buildBarPath(SCREEN_W, barHeight)}
            fill="none"
            stroke="rgba(15,23,42,0.05)"
            strokeWidth={1}
          />
        </Svg>
      </View>

      {/* Tab row */}
      <View style={[styles.row, { height: barHeight, paddingBottom: bottomPad }]}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const isFab = route.name === "qr-scan";
          const label = LABEL_MAP[route.name] ?? route.name;

          if (isFab) {
            return (
              <View key={route.key} style={styles.fabSlot}>
                <AnimatedQrFab
                  onPress={() => handlePress(route.key, route.name, isFocused)}
                />
              </View>
            );
          }

          const iconName = isFocused ? ICON_MAP[route.name] : ICON_OUTLINE_MAP[route.name];
          return (
            <TouchableOpacity
              key={route.key}
              testID={`tab-${route.name}`}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={() => handlePress(route.key, route.name, isFocused)}
              style={styles.tab}
              activeOpacity={0.7}
            >
              <View style={styles.iconWrap}>
                <Ionicons
                  name={iconName ?? "ellipse-outline"}
                  size={22}
                  color={isFocused ? COLORS.primaryDark : COLORS.textSecondary}
                />
              </View>
              <Text style={[styles.label, isFocused && styles.labelActive]} numberOfLines={2}>
                {label}
              </Text>
              <View style={[styles.activeDot, !isFocused && styles.activeDotHidden]} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const FAB_SIZE = 76;

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
  },
  svgLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  row: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.sm,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 2,
    paddingTop: 0,
  },
  iconWrap: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    ...TYPOGRAPHY.micro,
    fontSize: 11,
    letterSpacing: 0.8,
    textAlign: "center",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
  },
  labelActive: {
    color: COLORS.primaryDark,
    fontWeight: "700",
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginTop: 2,
  },
  activeDotHidden: {
    opacity: 0,
  },
  fabSlot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    height: "100%",
  },
  fabOuter: {
    position: "absolute",
    top: -42,
    alignItems: "center",
    justifyContent: "center",
    width: FAB_SIZE + 40,
    height: FAB_SIZE + 40,
  },

  // Premium solid FAB
  fabNew: {
    width: FAB_SIZE - 4,
    height: FAB_SIZE - 4,
    borderRadius: (FAB_SIZE - 4) / 2,
    backgroundColor: COLORS.primary, // Solid bright green
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 12,
  },
});
