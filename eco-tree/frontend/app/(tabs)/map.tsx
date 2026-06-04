import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Animated,
  Easing,
  Pressable,
  useWindowDimensions,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, RADII, SHADOWS, SPACING, TYPOGRAPHY } from "../../constants/theme";

type IoniconName = keyof typeof Ionicons.glyphMap;
type Health = "healthy" | "warning" | "sick";
type FilterKey = "all" | Health;

type Zone = {
  id: string;
  name: string;
  subtitle: string;
  trees: number;
  area: string;
  // position on faux map (percent)
  x: number;
  y: number;
  // shape for zone overlay
  w: number;
  h: number;
  color: string;
};

type Tree = {
  id: string;
  zoneId: string;
  type: string;
  species: string;
  health: Health;
  watered: string;
  registered: string;
  image: string;
  // position on detail map (percent within map)
  x: number;
  y: number;
};

const ZONES: Zone[] = [
  { id: "z1", name: "North Quad", subtitle: "Main university campus", trees: 412, area: "2.4 ha", x: 30, y: 28, w: 36, h: 26, color: "rgba(16,185,129,0.28)" },
  { id: "z2", name: "Botany Park", subtitle: "Research green zone", trees: 287, area: "1.6 ha", x: 62, y: 56, w: 30, h: 22, color: "rgba(110,231,183,0.34)" },
  { id: "z3", name: "Riverside Lawn", subtitle: "Eco trail & gardens", trees: 203, area: "3.1 ha", x: 14, y: 64, w: 32, h: 22, color: "rgba(52,211,153,0.30)" },
];

const TREES: Tree[] = [
  { id: "021", zoneId: "z1", type: "Neem", species: "Azadirachta indica", health: "healthy", watered: "2 hr ago", registered: "12 Jan 2026", image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80", x: 22, y: 30 },
  { id: "022", zoneId: "z1", type: "Banyan", species: "Ficus benghalensis", health: "healthy", watered: "5 hr ago", registered: "08 Jan 2026", image: "https://images.unsplash.com/photo-1604548704389-12daa90c5b9c?w=600&q=80", x: 42, y: 22 },
  { id: "032", zoneId: "z1", type: "Peepal", species: "Ficus religiosa", health: "warning", watered: "Today, 9:14", registered: "21 Dec 2025", image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80", x: 66, y: 38 },
  { id: "008", zoneId: "z1", type: "Ashoka", species: "Saraca asoca", health: "sick", watered: "Yesterday", registered: "11 Nov 2025", image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&q=80", x: 28, y: 62 },
  { id: "045", zoneId: "z1", type: "Mango", species: "Mangifera indica", health: "healthy", watered: "1 hr ago", registered: "02 Feb 2026", image: "https://images.unsplash.com/photo-1601985705806-5b9a71f6004f?w=600&q=80", x: 56, y: 70 },
  { id: "051", zoneId: "z1", type: "Gulmohar", species: "Delonix regia", health: "warning", watered: "Today, 7:40", registered: "19 Jan 2026", image: "https://images.unsplash.com/photo-1597047084897-51e81819a499?w=600&q=80", x: 78, y: 60 },
  { id: "060", zoneId: "z1", type: "Teak", species: "Tectona grandis", health: "healthy", watered: "3 hr ago", registered: "30 Jan 2026", image: "https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=600&q=80", x: 14, y: 80 },
  { id: "071", zoneId: "z1", type: "Banyan", species: "Ficus benghalensis", health: "sick", watered: "2 days ago", registered: "07 Oct 2025", image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&q=80", x: 88, y: 30 },
  { id: "017", zoneId: "z2", type: "Mango", species: "Mangifera indica", health: "healthy", watered: "30 min ago", registered: "12 Feb 2026", image: "https://images.unsplash.com/photo-1601985705806-5b9a71f6004f?w=600&q=80", x: 30, y: 40 },
  { id: "029", zoneId: "z2", type: "Neem", species: "Azadirachta indica", health: "warning", watered: "Today, 8:00", registered: "23 Jan 2026", image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80", x: 64, y: 56 },
  { id: "088", zoneId: "z3", type: "Peepal", species: "Ficus religiosa", health: "healthy", watered: "1 hr ago", registered: "05 Feb 2026", image: "https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=600&q=80", x: 50, y: 50 },
];

const HEALTH_META: Record<Health, { color: string; bg: string; label: string; icon: IoniconName }> = {
  healthy: { color: COLORS.health.healthy, bg: COLORS.health.healthyBg, label: "Healthy", icon: "checkmark-circle" },
  warning: { color: COLORS.health.warning, bg: COLORS.health.warningBg, label: "Warning", icon: "warning" },
  sick: { color: COLORS.health.sick, bg: COLORS.health.sickBg, label: "Sick", icon: "medkit" },
};

const FILTERS: { key: FilterKey; label: string; icon: IoniconName }[] = [
  { key: "all", label: "All Trees", icon: "leaf-outline" },
  { key: "healthy", label: "Healthy", icon: "checkmark-circle" },
  { key: "warning", label: "Warning", icon: "warning" },
  { key: "sick", label: "Sick", icon: "medkit" },
];

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { width: winW } = useWindowDimensions();
  const SCREEN_W = Math.min(winW, 480);

  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedTree, setSelectedTree] = useState<Tree | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");

  // ── Entry animation (zoom from sky) ──────────────────────────────────────
  const entryScale = useRef(new Animated.Value(0.72)).current;
  const entryOpacity = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-60)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Stagger: map zooms in first, then header slides down
    Animated.sequence([
      Animated.parallel([
        Animated.timing(entryScale, {
          toValue: 1,
          duration: 550,
          easing: Easing.bezier(0.16, 1, 0.3, 1), // spring-like
          useNativeDriver: true,
        }),
        Animated.timing(entryOpacity, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(headerSlide, {
          toValue: 0,
          duration: 380,
          easing: Easing.bezier(0.22, 1, 0.36, 1),
          useNativeDriver: true,
        }),
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const zoom = useRef(new Animated.Value(0)).current; // 0=overview, 1=detail
  const sheetY = useRef(new Animated.Value(420)).current;

  useEffect(() => {
    Animated.timing(zoom, {
      toValue: selectedZone ? 1 : 0,
      duration: 520,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: true,
    }).start();
  }, [selectedZone, zoom]);

  useEffect(() => {
    Animated.timing(sheetY, {
      toValue: selectedTree ? 0 : 480,
      duration: 360,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: true,
    }).start();
  }, [selectedTree, sheetY]);

  const visibleTrees = useMemo(() => {
    if (!selectedZone) return [];
    return TREES.filter((t) => t.zoneId === selectedZone.id && (filter === "all" || t.health === filter));
  }, [selectedZone, filter]);

  const filteredZones = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ZONES;
    return ZONES.filter((z) => z.name.toLowerCase().includes(q) || z.subtitle.toLowerCase().includes(q));
  }, [search]);

  const mapScale = zoom.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] });
  const mapTransX = zoom.interpolate({
    inputRange: [0, 1],
    outputRange: [0, selectedZone ? (50 - selectedZone.x - selectedZone.w / 2) * 2.2 : 0],
  });
  const mapTransY = zoom.interpolate({
    inputRange: [0, 1],
    outputRange: [0, selectedZone ? (50 - selectedZone.y - selectedZone.h / 2) * 1.6 : 0],
  });
  const overviewOpacity = zoom.interpolate({ inputRange: [0, 0.6], outputRange: [1, 0] });
  const detailOpacity = zoom.interpolate({ inputRange: [0.4, 1], outputRange: [0, 1] });

  return (
    <View style={[styles.root, { width: SCREEN_W, alignSelf: "center" }]} testID="map-screen">
      {/* SEARCH HEADER — slides down after map zooms in */}
      <Animated.View
        style={[styles.header, { paddingTop: insets.top + 8, transform: [{ translateY: headerSlide }], opacity: headerOpacity }]}
      >
        <View style={styles.searchPill}>
          <Ionicons name="search" size={18} color={COLORS.textSecondary} />
          <TextInput
            testID="zone-search-input"
            placeholder="Search university, campus, park…"
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
          {search.length > 0 ? (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          ) : (
            <View style={styles.searchAccent}>
              <Ionicons name="options-outline" size={16} color={COLORS.primaryDark} />
            </View>
          )}
        </View>

        {/* FILTER CHIPS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingTop: 12, paddingBottom: 4 }}
        >
          {FILTERS.map((f) => {
            const active = filter === f.key;
            const tint =
              f.key === "healthy" ? COLORS.health.healthy :
              f.key === "warning" ? COLORS.health.warning :
              f.key === "sick" ? COLORS.health.sick :
              COLORS.primary;
            return (
              <TouchableOpacity
                key={f.key}
                testID={`filter-${f.key}`}
                onPress={() => setFilter(f.key)}
                activeOpacity={0.85}
                style={[
                  styles.chip,
                  active && { backgroundColor: tint, borderColor: tint },
                ]}
              >
                <Ionicons
                  name={f.icon}
                  size={14}
                  color={active ? COLORS.textInverse : tint}
                />
                <Text style={[styles.chipText, active && { color: COLORS.textInverse }]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* MAP CANVAS — zooms in from sky on mount */}
      <Animated.View
        style={[styles.canvas, { transform: [{ scale: entryScale }], opacity: entryOpacity }]}
        testID="map-canvas"
      >
        <MapView
          style={StyleSheet.absoluteFillObject}
          initialRegion={{
            latitude: 40.7128,
            longitude: -74.0060,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          {visibleTrees.map((t) => {
            const meta = HEALTH_META[t.health];
            const lat = 40.7128 + (50 - t.y) * 0.0002;
            const lng = -74.0060 + (t.x - 50) * 0.0002;
            const isActive = selectedTree?.id === t.id;

            return (
              <Marker
                key={t.id}
                coordinate={{ latitude: lat, longitude: lng }}
                onPress={() => setSelectedTree(t)}
              >
                <View style={[styles.treePin, { backgroundColor: meta.color }, isActive && styles.treePinActive]}>
                  <Ionicons name="leaf" size={14} color={COLORS.textInverse} />
                </View>
                <View style={[styles.treePinTail, { borderTopColor: meta.color }]} />
              </Marker>
            );
          })}
        </MapView>

        {/* TOP BACK CHIP (when zone selected) */}
        {selectedZone && (
          <View style={styles.zoneTopChip}>
            <TouchableOpacity
              testID="zone-back-btn"
              onPress={() => { setSelectedZone(null); setSelectedTree(null); }}
              style={styles.backBtn}
              activeOpacity={0.85}
            >
              <Ionicons name="chevron-back" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <View style={styles.zoneTopInfo}>
              <Text style={styles.zoneTopName}>{selectedZone.name}</Text>
              <Text style={styles.zoneTopMeta}>
                {visibleTrees.length} trees · {selectedZone.area}
              </Text>
            </View>
            <View style={styles.zoneTopBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.zoneTopBadgeText}>Live</Text>
            </View>
          </View>
        )}

        {/* MAP CONTROLS */}
        <View style={styles.mapControls}>
          <TouchableOpacity testID="map-zoom-in" style={styles.ctrlBtn} activeOpacity={0.85}>
            <Ionicons name="add" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.ctrlDivider} />
          <TouchableOpacity testID="map-zoom-out" style={styles.ctrlBtn} activeOpacity={0.85}>
            <Ionicons name="remove" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity testID="map-locate" style={styles.locateBtn} activeOpacity={0.85}>
          <Ionicons name="locate" size={20} color={COLORS.primaryDark} />
        </TouchableOpacity>

        {/* OVERVIEW BOTTOM PEEK CARDS */}
        {!selectedZone && (
          <View style={styles.peekWrap}>
            <View style={styles.peekHead}>
              <Text style={styles.peekTitle}>Discover Zones</Text>
              <Text style={styles.peekSub}>{filteredZones.length} green areas nearby</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
              testID="zone-peek-scroll"
            >
              {filteredZones.map((z) => (
                <TouchableOpacity
                  key={z.id}
                  testID={`zone-card-${z.id}`}
                  activeOpacity={0.9}
                  onPress={() => setSelectedZone(z)}
                  style={styles.peekCard}
                >
                  <View style={styles.peekIcon}>
                    <Ionicons name="leaf" size={18} color={COLORS.primaryDark} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.peekName}>{z.name}</Text>
                    <Text style={styles.peekMeta}>{z.subtitle}</Text>
                    <View style={styles.peekStatsRow}>
                      <View style={styles.peekStat}>
                        <Ionicons name="leaf-outline" size={11} color={COLORS.textSecondary} />
                        <Text style={styles.peekStatText}>{z.trees}</Text>
                      </View>
                      <View style={styles.peekStat}>
                        <Ionicons name="resize-outline" size={11} color={COLORS.textSecondary} />
                        <Text style={styles.peekStatText}>{z.area}</Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </Animated.View>

      {/* TREE BOTTOM SHEET */}
      {selectedTree && <Pressable style={styles.scrim} onPress={() => setSelectedTree(null)} />}
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: sheetY }] }]}
        pointerEvents={selectedTree ? "auto" : "none"}
        testID="tree-sheet"
      >
        <View style={styles.sheetHandle} />
        {selectedTree && (
          <>
            <View style={styles.sheetHero}>
              <Image source={{ uri: selectedTree.image }} style={styles.sheetImg} />
              <View style={styles.sheetOverlay} />
              <View style={styles.sheetIdBadge}>
                <Text style={styles.sheetIdText}>Tree #{selectedTree.id}</Text>
              </View>
              <View
                style={[
                  styles.sheetHealthBadge,
                  { backgroundColor: HEALTH_META[selectedTree.health].bg },
                ]}
              >
                <Ionicons
                  name={HEALTH_META[selectedTree.health].icon}
                  size={12}
                  color={HEALTH_META[selectedTree.health].color}
                />
                <Text style={[styles.sheetHealthText, { color: HEALTH_META[selectedTree.health].color }]}>
                  {HEALTH_META[selectedTree.health].label}
                </Text>
              </View>
              <TouchableOpacity testID="sheet-close" onPress={() => setSelectedTree(null)} style={styles.sheetClose}>
                <Ionicons name="close" size={18} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.sheetBody}>
              <Text style={styles.sheetType}>{selectedTree.type}</Text>
              <Text style={styles.sheetSpecies}>{selectedTree.species}</Text>

              <View style={styles.sheetMetaGrid}>
                <SheetMeta icon="water" tint="#0369A1" bg="#E0F2FE" label="Last watered" value={selectedTree.watered} />
                <SheetMeta icon="calendar" tint={COLORS.primaryDark} bg={COLORS.primarySoft} label="Registered" value={selectedTree.registered} />
              </View>

              <View style={styles.sheetActions}>
                <TouchableOpacity style={styles.sheetPrimary} activeOpacity={0.9} testID="sheet-water">
                  <Ionicons name="water" size={16} color={COLORS.textInverse} />
                  <Text style={styles.sheetPrimaryText}>Log Watering</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sheetSecondary} activeOpacity={0.85} testID="sheet-details">
                  <Ionicons name="information-circle-outline" size={16} color={COLORS.primaryDark} />
                  <Text style={styles.sheetSecondaryText}>Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </Animated.View>
    </View>
  );
}

function SheetMeta({ icon, tint, bg, label, value }: { icon: IoniconName; tint: string; bg: string; label: string; value: string }) {
  return (
    <View style={styles.sheetMeta}>
      <View style={[styles.sheetMetaIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={16} color={tint} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.sheetMetaLabel}>{label}</Text>
        <Text style={styles.sheetMetaValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },

  // Header
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: COLORS.background,
    zIndex: 5,
  },
  searchPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.full,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.05)",
    ...SHADOWS.card,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
  searchAccent: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADII.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.06)",
  },
  chipText: { ...TYPOGRAPHY.caption, color: COLORS.textPrimary },

  // Canvas
  canvas: { flex: 1, overflow: "hidden", borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: 8 },
  mapInner: { ...StyleSheet.absoluteFillObject },
  mapBase: { ...StyleSheet.absoluteFillObject, backgroundColor: "#EAF1EC" },
  parkBlob: { position: "absolute", backgroundColor: "rgba(16,185,129,0.18)", borderRadius: 80 },
  water: {
    position: "absolute",
    top: "70%",
    right: "-10%",
    width: 220,
    height: 160,
    backgroundColor: "rgba(125,211,252,0.45)",
    borderRadius: 110,
    transform: [{ rotate: "-14deg" }],
  },
  road: { position: "absolute", backgroundColor: "#FFFFFF", borderRadius: 4 },
  roadLine: { position: "absolute", backgroundColor: "rgba(15,23,42,0.06)" },
  building: {
    position: "absolute",
    backgroundColor: "rgba(15,23,42,0.10)",
    borderRadius: 3,
  },

  // Zones
  zoneArea: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "rgba(16,185,129,0.55)",
    borderStyle: "dashed",
  },
  zonePin: {
    position: "absolute",
    top: -6,
    left: "50%",
    transform: [{ translateX: -16 }],
    alignItems: "center",
  },
  zonePinDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: COLORS.surface,
    ...SHADOWS.glow,
  },
  zonePinTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 7,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: COLORS.primary,
    marginTop: -2,
  },
  zoneLabel: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    ...SHADOWS.soft,
  },
  zoneLabelText: { ...TYPOGRAPHY.caption, color: COLORS.textPrimary, fontWeight: "700" },
  zoneLabelMeta: { ...TYPOGRAPHY.micro, color: COLORS.textSecondary, marginTop: 1 },

  zoneGlow: {
    position: "absolute",
    borderRadius: 30,
    backgroundColor: "rgba(16,185,129,0.10)",
    borderWidth: 2,
    borderColor: "rgba(16,185,129,0.45)",
    borderStyle: "dashed",
  },

  // Tree pins
  treePin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: COLORS.surface,
    ...SHADOWS.soft,
  },
  treePinActive: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  treePinTail: {
    alignSelf: "center",
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: -2,
  },
  treePulse: {
    position: "absolute",
    top: -10,
    left: -10,
    width: 48,
    height: 48,
    borderRadius: 24,
    opacity: 0.18,
  },

  // Top zone chip
  zoneTopChip: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    paddingHorizontal: 10,
    paddingVertical: 10,
    ...SHADOWS.card,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  zoneTopInfo: { flex: 1 },
  zoneTopName: { ...TYPOGRAPHY.h3, color: COLORS.textPrimary, fontSize: 16 },
  zoneTopMeta: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 },
  zoneTopBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADII.full,
    backgroundColor: COLORS.primarySoft,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary },
  zoneTopBadgeText: { ...TYPOGRAPHY.micro, color: COLORS.primaryDark },

  // Map controls
  mapControls: {
    position: "absolute",
    right: 12,
    top: 80,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md,
    overflow: "hidden",
    ...SHADOWS.soft,
  },
  ctrlBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  ctrlDivider: { height: 1, backgroundColor: COLORS.divider, marginHorizontal: 8 },
  locateBtn: {
    position: "absolute",
    right: 12,
    top: 178,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.soft,
  },

  // Peek cards
  peekWrap: {
    position: "absolute",
    bottom: 130,
    left: 0,
    right: 0,
  },
  peekHead: { paddingHorizontal: 20, marginBottom: 10 },
  peekTitle: { ...TYPOGRAPHY.h3, color: COLORS.textPrimary },
  peekSub: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 },
  peekCard: {
    width: 280,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.04)",
    ...SHADOWS.card,
  },
  peekIcon: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center", justifyContent: "center",
  },
  peekName: { ...TYPOGRAPHY.bodyLg, color: COLORS.textPrimary, fontWeight: "700" },
  peekMeta: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 },
  peekStatsRow: { flexDirection: "row", gap: 12, marginTop: 6 },
  peekStat: { flexDirection: "row", alignItems: "center", gap: 4 },
  peekStatText: { ...TYPOGRAPHY.micro, color: COLORS.textSecondary },

  // Bottom sheet
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15,23,42,0.35)",
    zIndex: 8,
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 8,
    paddingBottom: 110,
    zIndex: 9,
    ...SHADOWS.card,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.divider,
    marginBottom: 12,
  },
  sheetHero: { marginHorizontal: 16, height: 170, borderRadius: RADII.lg, overflow: "hidden" },
  sheetImg: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  sheetOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(15,23,42,0.18)" },
  sheetIdBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADII.full,
  },
  sheetIdText: { ...TYPOGRAPHY.caption, color: COLORS.textPrimary, fontWeight: "800" },
  sheetHealthBadge: {
    position: "absolute",
    top: 12,
    right: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADII.full,
  },
  sheetHealthText: { ...TYPOGRAPHY.caption, fontWeight: "700" },
  sheetClose: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  sheetBody: { paddingHorizontal: 20, paddingTop: 18 },
  sheetType: { ...TYPOGRAPHY.h2, color: COLORS.textPrimary },
  sheetSpecies: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, fontStyle: "italic", marginTop: 2 },
  sheetMetaGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  sheetMeta: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: RADII.md,
  },
  sheetMetaIcon: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  sheetMetaLabel: { ...TYPOGRAPHY.micro, color: COLORS.textSecondary },
  sheetMetaValue: { ...TYPOGRAPHY.caption, color: COLORS.textPrimary, marginTop: 2, fontWeight: "700" },

  sheetActions: { flexDirection: "row", gap: 10, marginTop: 18 },
  sheetPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADII.full,
    ...SHADOWS.glow,
  },
  sheetPrimaryText: { ...TYPOGRAPHY.bodyLg, color: COLORS.textInverse, fontWeight: "700" },
  sheetSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: COLORS.primarySoft,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: RADII.full,
  },
  sheetSecondaryText: { ...TYPOGRAPHY.bodyLg, color: COLORS.primaryDark, fontWeight: "700" },
});
