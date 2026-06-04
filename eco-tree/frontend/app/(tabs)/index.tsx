import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  useWindowDimensions,
  Animated,
  Easing,
  Modal,
  Pressable,
} from "react-native";
import Reanimated, { FadeInUp, FadeInRight, ZoomIn } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { COLORS, RADII, SHADOWS, SPACING, TYPOGRAPHY } from "../../constants/theme";

const H_PADDING = 20;

type IoniconName = keyof typeof Ionicons.glyphMap;

type Banner = {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  image: string;
  tint: string;
};

const BANNERS: Banner[] = [
  {
    id: "b1",
    tag: "Campaign",
    title: "Plant 1,000 Trees",
    subtitle: "Join the green campus drive this March",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=900&q=80",
    tint: "rgba(1, 51, 84, 0.45)", // Navy overlay matching logo
  },
  {
    id: "b2",
    tag: "Eco Tip",
    title: "Mulch in Monsoon",
    subtitle: "Retains moisture & protects young roots",
    image: "https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=900&q=80",
    tint: "rgba(0, 0, 0, 0.35)", // Neutral dark overlay
  },
  {
    id: "b3",
    tag: "News",
    title: "Green Canopy +12%",
    subtitle: "Campus air quality improving this quarter",
    image: "https://images.unsplash.com/photo-1772960826221-f401b678840d?w=900&q=80",
    tint: "rgba(1, 51, 84, 0.4)", // Navy overlay
  },
];

type Zone = {
  id: string;
  name: string;
  kind: string;
  distance: string;
  trees: number;
  image: string;
};

const ZONES: Zone[] = [
  { id: "z1", name: "North Quad", kind: "University Campus", distance: "0.4 km", trees: 412, image: "https://images.unsplash.com/photo-1695413440810-5bc32ad8b8a8?w=900&q=80" },
  { id: "z2", name: "Botany Park", kind: "Research Park", distance: "1.2 km", trees: 287, image: "https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=900&q=80" },
  { id: "z3", name: "Riverside Lawn", kind: "Garden & Trail", distance: "2.8 km", trees: 203, image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=900&q=80" },
];

type Status = "Healthy" | "Rare" | "New";
type Tree = {
  id: string;
  type: string;
  zone: string;
  status: Status;
  image: string;
};

const TREES: Tree[] = [
  { id: "021", type: "Neem", zone: "North Quad", status: "Healthy", image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80" },
  { id: "077", type: "Gulmohar", zone: "Riverside Lawn", status: "Rare", image: "https://images.unsplash.com/photo-1597047084897-51e81819a499?w=600&q=80" },
  { id: "112", type: "Mango Sapling", zone: "Botany Park", status: "New", image: "https://images.unsplash.com/photo-1601985705806-5b9a71f6004f?w=600&q=80" },
  { id: "060", type: "Teak", zone: "North Quad", status: "Healthy", image: "https://images.unsplash.com/photo-1604548704389-12daa90c5b9c?w=600&q=80" },
];

const STATUS_META: Record<Status, { color: string; bg: string; dot: string }> = {
  Healthy: { color: COLORS.health.healthy, bg: COLORS.health.healthyBg, dot: COLORS.health.healthy },
  Rare: { color: "#7C3AED", bg: "#EDE9FE", dot: "#7C3AED" },
  New: { color: "#0369A1", bg: "#E0F2FE", dot: "#0369A1" },
};

type QuickAction = { id: string; label: string; icon: IoniconName; tint: string; bg: string };

const QUICK_ACTIONS: QuickAction[] = [
  { id: "q1", label: "Check tree health", icon: "pulse", tint: COLORS.primaryDark, bg: COLORS.primarySoft },
  { id: "q2", label: "Ask AI assistant", icon: "sparkles", tint: "#7C3AED", bg: "#EDE9FE" },
  { id: "q3", label: "Upload tree photo", icon: "cloud-upload", tint: "#0369A1", bg: "#E0F2FE" },
];

type Recent = {
  id: string;
  treeId: string;
  type: string;
  action: "scanned" | "viewed" | "saved";
  zone: string;
  time: string;
  image: string;
};

const RECENT: Recent[] = [
  { id: "r1", treeId: "021", type: "Neem", action: "scanned", zone: "North Quad", time: "2 min ago", image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=200&q=80" },
  { id: "r2", treeId: "032", type: "Peepal", action: "viewed", zone: "Library Garden", time: "38 min ago", image: "https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=200&q=80" },
  { id: "r3", treeId: "077", type: "Gulmohar", action: "saved", zone: "Riverside Lawn", time: "2 hr ago", image: "https://images.unsplash.com/photo-1597047084897-51e81819a499?w=200&q=80" },
];

const RECENT_META: Record<Recent["action"], { icon: IoniconName; color: string; verb: string }> = {
  scanned: { icon: "qr-code", color: COLORS.primaryDark, verb: "Scanned" },
  viewed: { icon: "eye", color: "#0369A1", verb: "Viewed" },
  saved: { icon: "bookmark", color: "#7C3AED", verb: "Saved" },
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width: winW } = useWindowDimensions();
  const SCREEN_W = Math.min(winW, 480);
  const BANNER_W = SCREEN_W - H_PADDING * 2;
  const BANNER_STEP = SCREEN_W; // full width per step for clean snapping
  const ZONE_W = Math.round(SCREEN_W * 0.68);
  const TREE_W = Math.round(SCREEN_W * 0.42);

  const [bannerIdx, setBannerIdx] = useState(0);
  const bannerScrollRef = useRef<ScrollView>(null);
  const bannerIdxRef = useRef(0);
  const lastTouchTime = useRef(0); // Track when user last touched the banner

  const LANG_FLAGS = [
    { code: "UZ", icon: require("../../assets/images/flag_uz.png"), label: "O'zbek" },
    { code: "RU", icon: require("../../assets/images/flag_ru.png"), label: "Русский" },
    { code: "EN", icon: require("../../assets/images/flag_en.png"), label: "English" },
  ];
  const [langIdx, setLangIdx] = useState(0);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / BANNER_STEP);
    if (idx !== bannerIdxRef.current) {
      bannerIdxRef.current = idx;
      setBannerIdx(idx);
    }
  };

  const onScrollBeginDrag = () => {
    lastTouchTime.current = Date.now();
  };

  // Auto-scroll banners every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      // Pause if user touched within last 15 seconds
      if (Date.now() - lastTouchTime.current < 15000) {
        return;
      }
      
      let next = bannerIdxRef.current + 1;
      if (next >= BANNERS.length) {
        next = 0;
      }
      bannerScrollRef.current?.scrollTo({ x: next * BANNER_STEP, animated: true });
      bannerIdxRef.current = next;
      setBannerIdx(next);
    }, 3500);
    return () => clearInterval(timer);
  }, [BANNER_STEP]);

  return (
    <View style={styles.root} testID="home-screen">
      {/* decorative blobs */}
      <View style={[styles.glowA, { width: SCREEN_W * 0.7, height: SCREEN_W * 0.7, borderRadius: SCREEN_W * 0.35 }]} />
      <View style={[styles.glowB, { width: SCREEN_W * 0.6, height: SCREEN_W * 0.6, borderRadius: SCREEN_W * 0.3 }]} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ alignSelf: "center", width: SCREEN_W }}
        contentContainerStyle={{ paddingTop: insets.top + SPACING.sm, paddingBottom: 140 }}
      >
        {/* HEADER */}
        <Reanimated.View style={styles.header} testID="home-header" entering={FadeInUp.duration(400).delay(100)}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.userName}>Aarav <Text style={styles.wave}>🌿</Text></Text>
          </View>
          <TouchableOpacity 
            testID="lang-btn" 
            activeOpacity={0.85} 
            style={styles.langBtn}
            onPress={() => setLangMenuOpen(true)}
          >
            <Image source={LANG_FLAGS[langIdx].icon} style={styles.langFlag} />
          </TouchableOpacity>
          <TouchableOpacity
            testID="avatar-btn"
            activeOpacity={0.85}
            onPress={() => router.push("/(tabs)/profile")}
            style={styles.avatarBtn}
          >
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80" }}
              style={styles.avatarImg}
            />
            <View style={styles.avatarRingSmall} />
          </TouchableOpacity>
        </Reanimated.View>

        {/* SEARCH */}
        <Reanimated.View entering={FadeInUp.duration(400).delay(200)}>
          <TouchableOpacity testID="home-search" activeOpacity={0.85} style={styles.searchPill}>
            <Ionicons name="search" size={18} color={COLORS.textSecondary} />
            <Text style={styles.searchText}>Discover trees, zones, species…</Text>
            <View style={styles.searchAccent}>
              <Ionicons name="leaf" size={14} color={COLORS.primaryDark} />
            </View>
          </TouchableOpacity>
        </Reanimated.View>

        {/* ECO NEWS */}
        <Reanimated.View style={styles.sectionHead} entering={FadeInUp.duration(400).delay(300)}>
          <View>
            <Text style={styles.sectionTitle}>Eco Highlights</Text>
            <Text style={styles.sectionSub}>News & tips for a greener campus</Text>
          </View>
          <Text style={styles.sectionLink}>See all</Text>
        </Reanimated.View>
        <Reanimated.View entering={FadeInRight.duration(500).delay(350)}>
          <ScrollView
            ref={bannerScrollRef}
            horizontal
            pagingEnabled
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onMomentumScrollEnd}
            onScrollBeginDrag={onScrollBeginDrag}
            scrollEventThrottle={16}
            testID="eco-banner-scroll"
          >
            {BANNERS.map((b) => (
              <View key={b.id} style={{ width: SCREEN_W, alignItems: "center" }}>
                <ImageBackground
                  source={{ uri: b.image }}
                  style={[styles.banner, { width: BANNER_W }]}
                  imageStyle={styles.bannerImg}
                >
                  <View style={[styles.bannerOverlay, { backgroundColor: b.tint }]} />
                <View style={styles.bannerContent}>
                  <View style={styles.bannerTag}>
                    <View style={styles.bannerTagDot} />
                    <Text style={styles.bannerTagText}>{b.tag}</Text>
                  </View>
                  <View>
                    <Text style={styles.bannerTitle}>{b.title}</Text>
                    <Text style={styles.bannerSub}>{b.subtitle}</Text>
                    <View style={styles.bannerCta}>
                      <Text style={styles.bannerCtaText}>Read more</Text>
                      <Ionicons name="arrow-forward" size={14} color={COLORS.textInverse} />
                    </View>
                  </View>
                </View>
              </ImageBackground>
              </View>
            ))}
          </ScrollView>
        </Reanimated.View>
        <Reanimated.View style={styles.dots} testID="banner-dots" entering={FadeInUp.duration(400).delay(400)}>
          {BANNERS.map((_, i) => (
            <View key={i} style={[styles.dot, i === bannerIdx && styles.dotActive]} />
          ))}
        </Reanimated.View>

        {/* NEARBY ZONES */}
        <Reanimated.View style={styles.sectionHead} entering={FadeInUp.duration(400).delay(450)}>
          <View>
            <Text style={styles.sectionTitle}>Nearby Zones</Text>
            <Text style={styles.sectionSub}>Green spaces close to you</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(tabs)/map")}>
            <Text style={styles.sectionLink}>View map</Text>
          </TouchableOpacity>
        </Reanimated.View>
        <Reanimated.ScrollView
          entering={FadeInRight.duration(500).delay(500)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: H_PADDING, gap: 12 }}
          testID="zones-scroll"
        >
          {ZONES.map((z) => (
            <TouchableOpacity
              key={z.id}
              testID={`zone-${z.id}`}
              activeOpacity={0.9}
              onPress={() => router.push("/(tabs)/map")}
              style={[styles.zoneCard, { width: ZONE_W }]}
            >
              <ImageBackground
                source={{ uri: z.image }}
                style={styles.zoneImgWrap}
                imageStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
              >
                <View style={styles.zoneImgOverlay} />
                <View style={styles.zoneKindPill}>
                  <Ionicons name="location" size={10} color={COLORS.primaryDark} />
                  <Text style={styles.zoneKindText}>{z.kind}</Text>
                </View>
                <View style={styles.zoneDistPill}>
                  <Ionicons name="navigate" size={10} color={COLORS.textInverse} />
                  <Text style={styles.zoneDistText}>{z.distance}</Text>
                </View>
              </ImageBackground>
              <View style={styles.zoneBody}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.zoneName}>{z.name}</Text>
                  <View style={styles.zoneMetaRow}>
                    <Ionicons name="leaf" size={12} color={COLORS.primaryDark} />
                    <Text style={styles.zoneMeta}>{z.trees} trees</Text>
                  </View>
                </View>
                <View style={styles.zoneBtn}>
                  <Text style={styles.zoneBtnText}>Explore</Text>
                  <Ionicons name="arrow-forward" size={14} color={COLORS.textInverse} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </Reanimated.ScrollView>

        {/* DISCOVER TREES */}
        <Reanimated.View style={styles.sectionHead} entering={FadeInUp.duration(400).delay(550)}>
          <View>
            <Text style={styles.sectionTitle}>Discover Trees</Text>
            <Text style={styles.sectionSub}>Featured species in your area</Text>
          </View>
          <Text style={styles.sectionLink}>See all</Text>
        </Reanimated.View>
        <Reanimated.ScrollView
          entering={FadeInRight.duration(500).delay(600)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: H_PADDING, gap: 12 }}
          testID="trees-scroll"
        >
          {TREES.map((t) => {
            const meta = STATUS_META[t.status];
            return (
              <TouchableOpacity
                key={t.id}
                testID={`tree-${t.id}`}
                activeOpacity={0.9}
                style={[styles.treeCard, { width: TREE_W }]}
              >
                <Image source={{ uri: t.image }} style={styles.treeImg} />
                <View style={[styles.treeStatusPill, { backgroundColor: meta.bg }]}>
                  <View style={[styles.treeStatusDot, { backgroundColor: meta.dot }]} />
                  <Text style={[styles.treeStatusText, { color: meta.color }]}>{t.status}</Text>
                </View>
                <View style={styles.treeBody}>
                  <Text style={styles.treeId}>#{t.id}</Text>
                  <Text style={styles.treeType}>{t.type}</Text>
                  <View style={styles.treeMetaRow}>
                    <Ionicons name="location-outline" size={11} color={COLORS.textMuted} />
                    <Text style={styles.treeMeta} numberOfLines={1}>{t.zone}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </Reanimated.ScrollView>

        {/* QUICK AI ACTIONS */}
        <Reanimated.View style={styles.sectionHead} entering={FadeInUp.duration(400).delay(650)}>
          <View>
            <Text style={styles.sectionTitle}>Quick AI Actions</Text>
            <Text style={styles.sectionSub}>Instant help, one tap away</Text>
          </View>
          <View style={styles.aiPill}>
            <Ionicons name="sparkles" size={11} color={COLORS.primaryDark} />
            <Text style={styles.aiPillText}>AI</Text>
          </View>
        </Reanimated.View>
        <Reanimated.View style={styles.quickGrid} testID="quick-actions" entering={FadeInUp.duration(500).delay(700)}>
          {QUICK_ACTIONS.map((q) => (
            <TouchableOpacity
              key={q.id}
              testID={`quick-${q.id}`}
              activeOpacity={0.85}
              onPress={() => router.push("/(tabs)/ai")}
              style={styles.quickCard}
            >
              <View style={[styles.quickIcon, { backgroundColor: q.bg }]}>
                <Ionicons name={q.icon} size={18} color={q.tint} />
              </View>
              <Text style={styles.quickLabel}>{q.label}</Text>
              <Ionicons name="arrow-forward" size={14} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </Reanimated.View>

        {/* RECENT ACTIVITY */}
        <Reanimated.View style={styles.sectionHead} entering={FadeInUp.duration(400).delay(750)}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Text style={styles.sectionLink}>View all</Text>
        </Reanimated.View>
        <Reanimated.View style={styles.recentCard} testID="recent-activity" entering={FadeInUp.duration(500).delay(800)}>
          {RECENT.map((r, i) => {
            const meta = RECENT_META[r.action];
            return (
              <View
                key={r.id}
                testID={`recent-${r.id}`}
                style={[styles.recentRow, i === RECENT.length - 1 && { borderBottomWidth: 0 }]}
              >
                <Image source={{ uri: r.image }} style={styles.recentImg} />
                <View style={[styles.recentBadge, { backgroundColor: meta.color }]}>
                  <Ionicons name={meta.icon} size={10} color={COLORS.textInverse} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recentTitle}>
                    <Text style={styles.recentVerb}>{meta.verb} </Text>
                    <Text style={styles.recentTreeId}>#{r.treeId}</Text>
                    <Text> · {r.type}</Text>
                  </Text>
                  <View style={styles.recentMetaRow}>
                    <Ionicons name="location-outline" size={11} color={COLORS.textMuted} />
                    <Text style={styles.recentMeta}>{r.zone}</Text>
                    <View style={styles.metaDot} />
                    <Text style={styles.recentMeta}>{r.time}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
              </View>
            );
          })}
        </Reanimated.View>
        {/* MODAL: LANGUAGE SELECTOR */}
        <Modal visible={langMenuOpen} transparent animationType="fade">
          <Pressable style={styles.langModalOverlay} onPress={() => setLangMenuOpen(false)}>
            <View style={styles.langModalBox}>
              <Text style={styles.langModalTitle}>Select Language</Text>
              {LANG_FLAGS.map((lang, index) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.langOption, langIdx === index && styles.langOptionActive]}
                  onPress={() => {
                    setLangIdx(index);
                    setLangMenuOpen(false);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.langOptionIconWrap}>
                    <Image source={lang.icon} style={styles.langOptionIcon} />
                  </View>
                  <Text style={[styles.langOptionText, langIdx === index && styles.langOptionTextActive]}>
                    {lang.label}
                  </Text>
                  {langIdx === index && (
                    <Ionicons name="checkmark" size={18} color={COLORS.primaryDark} style={{ marginLeft: "auto" }} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  glowA: { position: "absolute", top: -120, right: -100, backgroundColor: COLORS.primary, opacity: 0.25 },
  glowB: { position: "absolute", top: 220, left: -120, backgroundColor: COLORS.primary, opacity: 0.2 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: H_PADDING,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  greeting: { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
  userName: { ...TYPOGRAPHY.h2, color: COLORS.textPrimary, marginTop: 2 },
  wave: { fontSize: 18 },
  langBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.surface,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(15,23,42,0.05)",
    overflow: "hidden",
    ...SHADOWS.soft,
  },
  langFlag: {
    width: "140%", height: "140%",
    resizeMode: "cover",
  },
  langModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  langModalBox: {
    width: 260,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    ...SHADOWS.medium,
  },
  langModalTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: 16,
    textAlign: "center",
  },
  langOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: COLORS.background,
  },
  langOptionActive: {
    backgroundColor: COLORS.primarySoft,
  },
  langOptionIconWrap: {
    width: 28, height: 28,
    borderRadius: 14,
    overflow: "hidden",
    marginRight: 12,
  },
  langOptionIcon: {
    width: "140%", height: "140%",
    resizeMode: "cover",
    alignSelf: "center",
    marginTop: -5,
  },
  langOptionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  langOptionTextActive: {
    color: COLORS.primaryDark,
    fontWeight: "700",
  },
  avatarBtn: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
  },
  avatarImg: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 2, borderColor: COLORS.surface,
  },
  avatarRingSmall: {
    position: "absolute",
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
  },

  // Search
  searchPill: {
    marginHorizontal: H_PADDING,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.05)",
    ...SHADOWS.card,
  },
  searchText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, flex: 1 },
  searchAccent: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center", justifyContent: "center",
  },

  // Section heads
  sectionHead: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: H_PADDING,
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.textPrimary },
  sectionSub: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 },
  sectionLink: { ...TYPOGRAPHY.caption, color: COLORS.primaryDark, fontWeight: "700" },

  // Banners
  banner: { height: 168, borderRadius: RADII.lg, overflow: "hidden", ...SHADOWS.card },
  bannerImg: { borderRadius: RADII.lg },
  bannerOverlay: { ...StyleSheet.absoluteFillObject },
  bannerContent: { flex: 1, padding: SPACING.md, justifyContent: "space-between" },
  bannerTag: {
    alignSelf: "flex-start",
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.35)",
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: RADII.full,
  },
  bannerTagDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primaryLight },
  bannerTagText: { color: COLORS.textInverse, fontSize: 11, fontWeight: "700", letterSpacing: 0.4 },
  bannerTitle: { color: COLORS.textInverse, fontSize: 22, fontWeight: "800", letterSpacing: -0.4 },
  bannerSub: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 4 },
  bannerCta: {
    marginTop: 12,
    alignSelf: "flex-start",
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: RADII.full,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.35)",
  },
  bannerCtaText: { color: COLORS.textInverse, fontSize: 12, fontWeight: "700" },

  dots: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: SPACING.md },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(15,23,42,0.15)" },
  dotActive: { width: 18, backgroundColor: COLORS.primary },

  // Zone cards
  zoneCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.04)",
    ...SHADOWS.card,
  },
  zoneImgWrap: {
    height: 130,
    justifyContent: "space-between",
    padding: 12,
  },
  zoneImgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(15,23,42,0.12)" },
  zoneKindPill: {
    alignSelf: "flex-start",
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: RADII.full,
  },
  zoneKindText: { ...TYPOGRAPHY.micro, color: COLORS.primaryDark, fontWeight: "700" },
  zoneDistPill: {
    alignSelf: "flex-end",
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(15,23,42,0.55)",
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: RADII.full,
  },
  zoneDistText: { ...TYPOGRAPHY.micro, color: COLORS.textInverse, fontWeight: "700" },
  zoneBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
  },
  zoneName: { ...TYPOGRAPHY.bodyLg, color: COLORS.textPrimary, fontWeight: "700" },
  zoneMetaRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  zoneMeta: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary },
  zoneBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: RADII.full,
    ...SHADOWS.glow,
  },
  zoneBtnText: { color: COLORS.textInverse, fontSize: 12, fontWeight: "700" },

  // Tree cards
  treeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.04)",
    ...SHADOWS.card,
  },
  treeImg: { width: "100%", height: 130, backgroundColor: COLORS.primarySoft },
  treeStatusPill: {
    position: "absolute",
    top: 10, left: 10,
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: RADII.full,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.7)",
  },
  treeStatusDot: { width: 6, height: 6, borderRadius: 3 },
  treeStatusText: { ...TYPOGRAPHY.micro, fontWeight: "700" },
  treeBody: { padding: 12 },
  treeId: { ...TYPOGRAPHY.micro, color: COLORS.primaryDark, fontWeight: "800" },
  treeType: { ...TYPOGRAPHY.bodyLg, color: COLORS.textPrimary, fontWeight: "700", marginTop: 2 },
  treeMetaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  treeMeta: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, flex: 1 },

  // AI pill
  aiPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: RADII.full,
    backgroundColor: COLORS.primarySoft,
  },
  aiPillText: { ...TYPOGRAPHY.micro, color: COLORS.primaryDark, fontWeight: "800" },

  // Quick actions
  quickGrid: {
    marginHorizontal: H_PADDING,
    gap: 10,
  },
  quickCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.04)",
    ...SHADOWS.soft,
  },
  quickIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  quickLabel: { flex: 1, ...TYPOGRAPHY.body, color: COLORS.textPrimary, fontWeight: "600" },

  // Recent
  recentCard: {
    marginHorizontal: H_PADDING,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.04)",
    ...SHADOWS.card,
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  recentImg: { width: 44, height: 44, borderRadius: 14, backgroundColor: COLORS.primarySoft },
  recentBadge: {
    position: "absolute",
    top: 6, left: 42,
    width: 20, height: 20, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: COLORS.surface,
  },
  recentTitle: { ...TYPOGRAPHY.bodyLg, color: COLORS.textPrimary, fontWeight: "600" },
  recentVerb: { color: COLORS.textSecondary, fontWeight: "500" },
  recentTreeId: { color: COLORS.primaryDark, fontWeight: "800" },
  recentMetaRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  recentMeta: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, fontWeight: "500" },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: COLORS.textMuted, marginHorizontal: 2 },
});
