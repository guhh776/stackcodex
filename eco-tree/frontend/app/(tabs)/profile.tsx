import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Platform,
  useWindowDimensions,
} from "react-native";
import Reanimated, { FadeInUp, FadeInRight, ZoomIn } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, RADII, SHADOWS, SPACING, TYPOGRAPHY } from "../../constants/theme";

type IoniconName = keyof typeof Ionicons.glyphMap;

const RECENT_ACTIVITY = [
  { id: "a1", title: "Scanned Tree #021", time: "2 mins ago", icon: "qr-code", tint: COLORS.primaryDark, bg: COLORS.primarySoft },
  { id: "a2", title: "Viewed Banyan Tree", time: "1 hr ago", icon: "eye", tint: "#0369A1", bg: "#E0F2FE" },
  { id: "a3", title: "Report Submitted", time: "Yesterday", icon: "document-text", tint: "#B45309", bg: COLORS.health.warningBg },
];

const SAVED_TREES = [
  { id: "077", type: "Gulmohar", status: "Healthy", statusColor: COLORS.health.healthy, image: "https://images.unsplash.com/photo-1597047084897-51e81819a499?w=200&q=80" },
  { id: "060", type: "Teak", status: "Warning", statusColor: COLORS.health.warning, image: "https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=200&q=80" },
  { id: "089", type: "Neem", status: "Healthy", statusColor: COLORS.health.healthy, image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=200&q=80" },
];

type SettingRow = {
  id: string;
  icon: IoniconName;
  label: string;
  tint: string;
  bg: string;
  toggle?: boolean;
};

const SETTINGS_LIST: SettingRow[] = [
  { id: "lang", icon: "language", label: "Language", tint: COLORS.primaryDark, bg: COLORS.primarySoft },
  { id: "notif", icon: "notifications", label: "Notifications", tint: "#B45309", bg: "#FEF3C7", toggle: true },
  { id: "privacy", icon: "lock-closed", label: "Privacy & security", tint: "#7C3AED", bg: "#EDE9FE" },
  { id: "prefs", icon: "options", label: "App preferences", tint: "#0369A1", bg: "#E0F2FE" },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { width: winW } = useWindowDimensions();
  const SCREEN_W = Math.min(winW, 480);

  const [notifOn, setNotifOn] = useState(true);

  return (
    <View style={[styles.root, { width: SCREEN_W, alignSelf: "center" }]} testID="profile-screen">
      {/* decorative blobs */}
      <View style={styles.blobA} />
      <View style={styles.blobB} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 140 }}
      >
        {/* TOP BAR / HEADER */}
        <Reanimated.View style={styles.header} entering={FadeInUp.duration(400).delay(100)}>
          <View style={styles.headerLeft}>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80" }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.username}>Aarav Raghunath</Text>
              <Text style={styles.subtitle}>Eco User / Tree Explorer</Text>
            </View>
          </View>
          <TouchableOpacity testID="edit-profile-btn" style={styles.editIconBtn} activeOpacity={0.85}>
            <Ionicons name="create-outline" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </Reanimated.View>

        {/* STATS (3 CARDS) */}
        <Reanimated.View style={styles.statsRow} entering={FadeInUp.duration(500).delay(200)}>
          <StatCard icon="qr-code" value="128" label="Trees Scanned" tint={COLORS.primaryDark} bg={COLORS.primarySoft} />
          <StatCard icon="eye" value="45" label="Trees Viewed" tint="#0369A1" bg="#E0F2FE" />
          <StatCard icon="document-text" value="12" label="Reports Sent" tint="#B45309" bg={COLORS.health.warningBg} />
        </Reanimated.View>

        {/* RECENT ACTIVITY */}
        <Reanimated.View style={styles.sectionHead} entering={FadeInUp.duration(400).delay(300)}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </Reanimated.View>
        <Reanimated.View style={styles.listCard} entering={FadeInUp.duration(500).delay(350)}>
          {RECENT_ACTIVITY.map((a, i) => (
            <View key={a.id} style={[styles.listRow, i === RECENT_ACTIVITY.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={[styles.listIcon, { backgroundColor: a.bg }]}>
                <Ionicons name={a.icon as any} size={18} color={a.tint} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.listTitle}>{a.title}</Text>
                <Text style={styles.listTime}>{a.time}</Text>
              </View>
            </View>
          ))}
        </Reanimated.View>

        {/* SAVED TREES */}
        <Reanimated.View style={styles.sectionHead} entering={FadeInUp.duration(400).delay(400)}>
          <Text style={styles.sectionTitle}>Saved Trees</Text>
        </Reanimated.View>
        <Reanimated.ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }} entering={FadeInRight.duration(500).delay(500)}>
          {SAVED_TREES.map((t) => (
            <View key={t.id} style={styles.savedCard}>
              <Image source={{ uri: t.image }} style={styles.savedImage} />
              <View style={styles.savedInfo}>
                <View style={styles.savedTitleRow}>
                  <Text style={styles.savedId}>#{t.id}</Text>
                  <View style={[styles.badge, { backgroundColor: t.statusColor + "20" }]}>
                    <Text style={[styles.badgeText, { color: t.statusColor }]}>{t.status}</Text>
                  </View>
                </View>
                <Text style={styles.savedType}>{t.type}</Text>
              </View>
            </View>
          ))}
        </Reanimated.ScrollView>

        {/* SETTINGS */}
        <Reanimated.View style={styles.sectionHead} entering={FadeInUp.duration(400).delay(600)}>
          <Text style={styles.sectionTitle}>Settings</Text>
        </Reanimated.View>
        <Reanimated.View style={styles.listCard} entering={FadeInUp.duration(500).delay(650)}>
          {SETTINGS_LIST.map((s, i) => (
            <View key={s.id} style={[styles.listRow, i === SETTINGS_LIST.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={[styles.listIcon, { backgroundColor: s.bg }]}>
                <Ionicons name={s.icon as any} size={18} color={s.tint} />
              </View>
              <Text style={styles.settingLabel}>{s.label}</Text>
              {s.toggle ? (
                <Switch
                  value={notifOn}
                  onValueChange={setNotifOn}
                  trackColor={{ false: "#CBD5E1", true: COLORS.primary }}
                  thumbColor={Platform.OS === "android" ? COLORS.surface : undefined}
                  ios_backgroundColor="#CBD5E1"
                />
              ) : (
                <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
              )}
            </View>
          ))}
        </Reanimated.View>

        {/* LOGOUT */}
        <Reanimated.View entering={ZoomIn.duration(400).delay(800)}>
          <TouchableOpacity testID="logout-btn" activeOpacity={0.85} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </Reanimated.View>

      </ScrollView>
    </View>
  );
}

function StatCard({ icon, value, label, tint, bg }: { icon: IoniconName; value: string; label: string; tint: string; bg: string }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={16} color={tint} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },

  blobA: {
    position: "absolute", top: -100, right: -80,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: "rgba(52,211,153,0.18)",
  },
  blobB: {
    position: "absolute", top: 320, left: -100,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: "rgba(110,231,183,0.14)",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 64, height: 64,
    borderRadius: 32,
    borderWidth: 2, borderColor: COLORS.surface,
  },
  username: { ...TYPOGRAPHY.h2, color: COLORS.textPrimary },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.primaryDark, fontWeight: "600", marginTop: 2 },
  editIconBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(15,23,42,0.05)",
    ...SHADOWS.soft,
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 20,
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    padding: 12,
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.04)",
    ...SHADOWS.card,
  },
  statIcon: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
    marginBottom: 8,
  },
  statValue: { fontSize: 20, fontWeight: "800", color: COLORS.textPrimary },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2, fontWeight: "500" },

  // Sections
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: SPACING.xl,
    marginBottom: 12,
  },
  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.textPrimary },

  listCard: {
    marginHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.04)",
    ...SHADOWS.card,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15,23,42,0.06)",
  },
  listIcon: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  listTitle: { ...TYPOGRAPHY.bodyLg, color: COLORS.textPrimary, fontWeight: "600" },
  listTime: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, marginTop: 2 },
  
  settingLabel: { flex: 1, ...TYPOGRAPHY.bodyLg, color: COLORS.textPrimary, fontWeight: "600" },

  // Saved Trees
  savedCard: {
    width: 140,
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(15,23,42,0.04)",
    ...SHADOWS.card,
  },
  savedImage: { width: "100%", height: 100 },
  savedInfo: { padding: 10 },
  savedTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  savedId: { ...TYPOGRAPHY.bodyLg, color: COLORS.textPrimary, fontWeight: "700" },
  savedType: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 9, fontWeight: "800", textTransform: "uppercase" },

  logoutBtn: {
    marginHorizontal: 20,
    marginTop: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    paddingVertical: 14,
    borderRadius: RADII.full,
    borderWidth: 1.5,
    borderColor: "rgba(239,68,68,0.3)",
  },
  logoutText: { color: COLORS.health.sick, fontSize: 16, fontWeight: "700" },
});
