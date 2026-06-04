import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  ScrollView,
  Modal,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import { COLORS, RADII, SHADOWS, SPACING, TYPOGRAPHY } from "../../constants/theme";

const RECENT = [
  { id: "021", type: "Neem", zone: "North Quad", time: "2 min ago", image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=200&q=80" },
  { id: "032", type: "Peepal", zone: "Library Garden", time: "38 min ago", image: "https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=200&q=80" },
  { id: "045", type: "Mango", zone: "Botany Block", time: "2 hr ago", image: "https://images.unsplash.com/photo-1601985705806-5b9a71f6004f?w=200&q=80" },
  { id: "017", type: "Banyan", zone: "Main Avenue", time: "Yesterday", image: "https://images.unsplash.com/photo-1604548704389-12daa90c5b9c?w=200&q=80" },
];

// ✅ Only this exact QR code will open the tree detail
const VALID_QR_CODE = "TREE-084";

// Tree data mapped to QR codes
const QR_TREE_DB: Record<string, any> = {
  "TREE-084": {
    id: "084",
    type: "Oak",
    zone: "Central Campus",
    status: "Healthy",
    age: "12 years",
    height: "8.4 m",
    watered: "2 days ago",
    healthNotes: "Vibrant foliage, robust trunk, no visible pests.",
    co2: "24 kg",
    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&q=80",
  },
};

export default function QrScanScreen() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);
  const router = useRouter();
  const { width: winW, height: winH } = useWindowDimensions();
  const SCREEN_W = Math.min(winW, 480);
  const SCREEN_H = winH;
  const FRAME = Math.min(SCREEN_W * 0.68, 280);

  const [flash, setFlash] = useState(false);
  const [recent, setRecent] = useState(RECENT);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [scannedTree, setScannedTree] = useState<any>(null);
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const [invalidQr, setInvalidQr] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const scanProgress = useRef(new Animated.Value(0)).current;
  const scanningDataRef = useRef<any>(null);

  // Debounce refs — require 3 stable consecutive reads of same QR
  const scanCountRef = useRef(0);
  const lastScannedRef = useRef<string>("");

  const handleBarcodeScanned = ({ data, bounds }: { data: string; bounds?: any }) => {
    if (scannedTree || isScanning) return;

    // ── Frame restriction via QR size ────────────────────────────────
    // The QR code must be large enough (filling the frame area) to be
    // considered "inside" the frame. Small/edge detections are ignored.
    if (bounds?.size) {
      const bw = bounds.size.width;
      const bh = bounds.size.height;

      // Normalized coords (0-1): QR must fill ≥18% of screen width/height
      if (bw <= 1 && bh <= 1) {
        if (bw < 0.18 || bh < 0.08) return; // too small → outside or at edge
      } else {
        // Pixel coords: QR must be at least 20% of FRAME size
        if (bw < FRAME * 0.2 || bh < FRAME * 0.2) return;
      }
    }
    // ─────────────────────────────────────────────────────────────────

    if (data !== lastScannedRef.current) {
      lastScannedRef.current = data;
      scanCountRef.current = 1;
      return;
    }

    scanCountRef.current += 1;
    if (scanCountRef.current < 4) return;

    scanCountRef.current = 0;
    lastScannedRef.current = "";

    const treeData = QR_TREE_DB[data];
    if (treeData) {
      // Start 3-second scanning animation before opening modal
      scanningDataRef.current = treeData;
      setIsScanning(true);
      scanProgress.setValue(0);
      Animated.timing(scanProgress, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          setIsScanning(false);
          setScannedTree(scanningDataRef.current);
          setInvalidQr(false);
        }
      });
    } else {
      setInvalidQr(true);
      setTimeout(() => setInvalidQr(false), 2500);
    }
  };

  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (scannedTree) {
      slideAnim.setValue(1); // start from bottom (off-screen fraction used in style)
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 90,
        mass: 0.5,
      }).start();
    }
  }, [scannedTree]);

  const lineY = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(lineY, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(lineY, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(ringScale, { toValue: 1.08, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(ringScale, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => { loop.stop(); pulse.stop(); };
  }, [lineY, ringScale]);

  const lineTranslate = lineY.interpolate({ inputRange: [0, 1], outputRange: [10, FRAME - 14] });

  return (
    <View style={[styles.root, { width: SCREEN_W, alignSelf: "center" }]} testID="qr-scan-screen">
      {/* FULL-SCREEN CAMERA VIEWPORT */}
      <View style={styles.viewport}>
        {permission?.granted ? (
          <CameraView
            style={styles.cameraImg}
            facing="back"
            enableTorch={flash}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={handleBarcodeScanned}
          />
        ) : (
          <>
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=900&q=70" }}
              style={styles.cameraImg}
              blurRadius={6}
            />
            <View style={styles.viewportTint} />
          </>
        )}

        {/* DIM OVERLAY strips around frame */}
        <View style={[styles.dimRow, { height: `calc(50% - ${FRAME / 2}px)` as any, top: 0 }]} />
        <View style={[styles.dimRow, { height: `calc(50% - ${FRAME / 2}px)` as any, bottom: 0 }]} />
        <View style={[styles.dimSide, { width: `calc(50% - ${FRAME / 2}px)` as any, left: 0 }]} />
        <View style={[styles.dimSide, { width: `calc(50% - ${FRAME / 2}px)` as any, right: 0 }]} />

        {/* HEADER */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity
            testID="qr-back-btn"
            onPress={() => router.replace("/(tabs)")}
            style={styles.headerBtn}
            activeOpacity={0.85}
          >
            <Ionicons name="chevron-back" size={20} color={COLORS.textInverse} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={styles.headerTitle}>QR Scanner</Text>
            <Text style={styles.headerSub}>Scan a tree QR code to view details</Text>
          </View>
          <TouchableOpacity testID="qr-help-btn" style={styles.headerBtn} activeOpacity={0.85}>
            <Ionicons name="help-circle-outline" size={20} color={COLORS.textInverse} />
          </TouchableOpacity>
        </View>

        {/* INVALID QR TOAST */}
        {invalidQr && (
          <View style={styles.invalidToast}>
            <Ionicons name="close-circle" size={18} color="#fff" />
            <Text style={styles.invalidToastText}>Bu QR kod daraxtga biriktirilmagan</Text>
          </View>
        )}

        {/* SCAN FRAME */}
        <Animated.View
          style={[
            styles.frame,
            {
              width: FRAME,
              height: FRAME,
              top: "50%",
              left: "50%",
              transform: [{ translateX: -FRAME / 2 }, { translateY: -FRAME / 2 }, { scale: ringScale }],
            },
          ]}
          testID="scan-frame"
        >
          <View style={[styles.corner, styles.tl]} />
          <View style={[styles.corner, styles.tr]} />
          <View style={[styles.corner, styles.bl]} />
          <View style={[styles.corner, styles.br]} />

          {/* SCANNING PROGRESS OVERLAY */}
          {isScanning && (
            <View style={styles.scanningOverlay}>
              <View style={styles.scanningIconWrap}>
                <Ionicons name="qr-code" size={36} color={COLORS.primary} />
              </View>
              <Text style={styles.scanningLabel}>Scanning...</Text>
              <View style={styles.scanProgressBar}>
                <Animated.View
                  style={[
                    styles.scanProgressFill,
                    { width: scanProgress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) },
                  ]}
                />
              </View>
            </View>
          )}
          <Animated.View
            style={[styles.scanLine, { transform: [{ translateY: lineTranslate }] }]}
            testID="scan-line"
          >
            <View style={styles.scanLineGlow} />
            <View style={styles.scanLineCore} />
          </Animated.View>
          <View style={styles.frameHint}>
            <View style={styles.frameHintDot} />
            <Text style={styles.frameHintText}>Align tree QR inside the frame</Text>
          </View>
        </Animated.View>

        {/* CONTROL ROW — Flash · Recent History · Gallery */}
        <View style={[styles.quickRow, { bottom: insets.bottom + 120 }]}>
          <TouchableOpacity
            testID="flash-toggle"
            activeOpacity={0.85}
            onPress={() => setFlash((p) => !p)}
            style={[styles.quickBtn, flash && styles.quickBtnActive]}
          >
            <Ionicons name={flash ? "flash" : "flash-off"} size={18} color={flash ? COLORS.primaryDark : COLORS.textInverse} />
            <Text style={[styles.quickText, flash && { color: COLORS.primaryDark }]}>
              {flash ? "Flash On" : "Flash"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            testID="history-btn"
            activeOpacity={0.85}
            onPress={() => setHistoryOpen(true)}
            style={styles.quickBtn}
          >
            <Ionicons name="time-outline" size={18} color={COLORS.textInverse} />
            <Text style={styles.quickText}>Recent History</Text>
          </TouchableOpacity>

          <TouchableOpacity testID="gallery-btn" activeOpacity={0.85} style={styles.quickBtn}>
            <Ionicons name="images-outline" size={18} color={COLORS.textInverse} />
            <Text style={styles.quickText}>Gallery</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* FULLSCREEN HISTORY MODAL */}
      <Modal
        visible={historyOpen}
        animationType="slide"
        onRequestClose={() => setHistoryOpen(false)}
        transparent={false}
        testID="history-modal"
      >
        <View style={styles.modalRoot}>
          <View style={[styles.modalHeader, { paddingTop: insets.top + 12 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>Recent Scans</Text>
              <Text style={styles.modalSub}>Your recently scanned trees</Text>
            </View>
            <TouchableOpacity
              testID="history-close"
              onPress={() => setHistoryOpen(false)}
              style={styles.modalCloseBtn}
              activeOpacity={0.85}
            >
              <Ionicons name="close" size={20} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.modalToolRow}>
              <Text style={styles.modalCount}>{recent.length} {recent.length === 1 ? "scan" : "scans"}</Text>
              {recent.length > 0 && (
                <TouchableOpacity
                  testID="recent-clear"
                  onPress={() => setRecent([])}
                  activeOpacity={0.8}
                  style={styles.clearAllBtn}
                >
                  <Ionicons name="trash-outline" size={14} color={COLORS.health.sick} />
                  <Text style={styles.clearAllText}>Clear all</Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
            >
              {recent.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIcon}>
                    <Ionicons name="qr-code-outline" size={28} color={COLORS.primaryDark} />
                  </View>
                  <Text style={styles.emptyTitle}>No recent scans</Text>
                  <Text style={styles.emptySub}>Scan a tree QR to see it here</Text>
                </View>
              ) : (
                recent.map((r, i) => (
                  <TouchableOpacity
                    key={r.id}
                    testID={`recent-${r.id}`}
                    activeOpacity={0.9}
                    style={[styles.recentItem, i === recent.length - 1 && { borderBottomWidth: 0 }]}
                  >
                    <Image source={{ uri: r.image }} style={styles.recentImg} />
                    <View style={styles.recentBadge}>
                      <Ionicons name="qr-code" size={10} color={COLORS.textInverse} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.recentTitleRow}>
                        <Text style={styles.recentTreeId}>#{r.id}</Text>
                        <Text style={styles.recentType}> · {r.type}</Text>
                      </View>
                      <View style={styles.recentMetaRow}>
                        <Ionicons name="location-outline" size={12} color={COLORS.textMuted} />
                        <Text style={styles.recentMeta}>{r.zone}</Text>
                        <View style={styles.recentDot} />
                        <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
                        <Text style={styles.recentMeta}>{r.time}</Text>
                      </View>
                    </View>
                    <View style={styles.recentChevron}>
                      <Ionicons name="chevron-forward" size={16} color={COLORS.primaryDark} />
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* TREE INFO FULL SCREEN MODAL */}
      <Modal
        visible={!!scannedTree}
        animationType="none"
        transparent={false}
        statusBarTranslucent
        onRequestClose={() => setScannedTree(null)}
      >
        <Animated.View
          style={[
            { flex: 1, backgroundColor: COLORS.surface },
            {
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 900],
                }),
              }],
            },
          ]}
        >
          <View style={[styles.fsHeader, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity onPress={() => setScannedTree(null)} style={styles.fsCloseBtn}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.fsHeaderText}>Tree Details</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 }}>
              {/* 1. TOP SECTION */}
              <View style={styles.sheetTop}>
                <TouchableOpacity activeOpacity={0.9} onPress={() => scannedTree && setViewerImage(scannedTree.image)}>
                  <Image source={{ uri: scannedTree?.image }} style={styles.sheetImg} />
                </TouchableOpacity>
                <Text style={styles.sheetTreeId}>Tree #{scannedTree?.id}</Text>
              </View>

              {/* 2. BASIC INFO */}
              <View style={styles.sheetBasic}>
                <Text style={styles.sheetType}>{scannedTree?.type}</Text>
                <Text style={styles.sheetZone}>{scannedTree?.zone}</Text>
                <View style={[styles.sheetBadge, { backgroundColor: COLORS.health.healthyBg }]}>
                  <View style={[styles.sheetBadgeDot, { backgroundColor: COLORS.health.healthy }]} />
                  <Text style={[styles.sheetBadgeText, { color: COLORS.health.healthy }]}>{scannedTree?.status}</Text>
                </View>
              </View>

              {/* 3. STATS */}
              <View style={styles.sheetGrid}>
                <View style={styles.sheetCard}>
                  <Ionicons name="calendar-outline" size={18} color={COLORS.primaryDark} />
                  <Text style={styles.sheetCardVal}>{scannedTree?.age}</Text>
                  <Text style={styles.sheetCardLabel}>Age (est.)</Text>
                </View>
                <View style={styles.sheetCard}>
                  <Ionicons name="resize-outline" size={18} color={COLORS.primaryDark} />
                  <Text style={styles.sheetCardVal}>{scannedTree?.height}</Text>
                  <Text style={styles.sheetCardLabel}>Height</Text>
                </View>
                <View style={styles.sheetCard}>
                  <Ionicons name="water-outline" size={18} color={COLORS.primaryDark} />
                  <Text style={styles.sheetCardVal}>{scannedTree?.watered}</Text>
                  <Text style={styles.sheetCardLabel}>Last Watered</Text>
                </View>
              </View>

              <View style={styles.sheetNotes}>
                <Ionicons name="information-circle" size={20} color={COLORS.primaryDark} />
                <Text style={styles.sheetNotesText}>{scannedTree?.healthNotes}</Text>
              </View>

              {/* 4. ECO */}
              <View style={styles.sheetEco}>
                <View style={styles.sheetEcoIcon}>
                  <Ionicons name="leaf" size={20} color={COLORS.textInverse} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sheetEcoVal}>{scannedTree?.co2}</Text>
                  <Text style={styles.sheetEcoLabel}>Eco Impact · CO₂ absorbed / yr</Text>
                </View>
              </View>

              {/* 5. ACTIONS */}
              <View style={styles.sheetActionsTop}>
                <TouchableOpacity style={[styles.sheetBtn, styles.sheetBtnPrimary, { flex: 1 }]} activeOpacity={0.85}>
                  <Ionicons name="map" size={18} color={COLORS.textInverse} />
                  <Text style={styles.sheetBtnTextInverse}>View on Map</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.sheetBtn, styles.sheetBtnSecondary, { width: 50, paddingHorizontal: 0 }]} activeOpacity={0.85}>
                  <Ionicons name="heart-outline" size={20} color={COLORS.primaryDark} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.sheetBtn, styles.sheetBtnSecondary, { width: 50, paddingHorizontal: 0 }]} activeOpacity={0.85}>
                  <Ionicons name="share-social-outline" size={20} color={COLORS.primaryDark} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.sheetBtnReport} activeOpacity={0.85}>
                <Ionicons name="warning-outline" size={18} color={COLORS.health.sick} />
                <Text style={styles.sheetBtnTextReport}>Report an Issue</Text>
              </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </Modal>

      {/* IMAGE VIEWER MODAL */}
      <Modal visible={!!viewerImage} animationType="fade" transparent={true} onRequestClose={() => setViewerImage(null)}>
        <View style={styles.viewerRoot}>
          <TouchableOpacity style={styles.viewerClose} onPress={() => setViewerImage(null)}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Image source={{ uri: viewerImage! }} style={styles.viewerImg} resizeMode="contain" />
        </View>
      </Modal>

    </View>
  );
}

const DARK = "#0B1F17";

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DARK },

  // Full-screen viewport
  viewport: {
    flex: 1,
    backgroundColor: DARK,
    overflow: "hidden",
  },
  cameraImg: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%", opacity: 0.85 },
  viewportTint: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(11,31,23,0.55)" },

  dimRow: { position: "absolute", left: 0, right: 0, backgroundColor: "rgba(11,31,23,0.72)" },
  dimSide: { position: "absolute", top: 0, bottom: 0, backgroundColor: "rgba(11,31,23,0.72)" },

  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 5,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { ...TYPOGRAPHY.h3, color: COLORS.textInverse },
  headerSub: { ...TYPOGRAPHY.caption, color: "rgba(255,255,255,0.8)", marginTop: 2 },

  // Frame
  frame: { position: "absolute", borderRadius: 32 },
  corner: { position: "absolute", width: 32, height: 32, borderColor: COLORS.primaryLight },
  tl: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 28 },
  tr: { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 28 },
  bl: { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 28 },
  br: { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 28 },

  scanLine: { position: "absolute", left: 8, right: 8, height: 4 },
  scanLineGlow: {
    position: "absolute",
    left: -4, right: -4, top: -8,
    height: 24,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.25,
    borderRadius: 12,
  },
  scanLineCore: {
    height: 3,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 2,
    shadowColor: COLORS.primaryLight,
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },

  scanningOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.72)",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  scanningIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  scanningLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  scanProgressBar: {
    width: 140,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  scanProgressFill: {
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },

  frameHint: {
    position: "absolute",
    bottom: -44,
    left: 0, right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  frameHintDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primaryLight },
  frameHintText: { ...TYPOGRAPHY.caption, color: "rgba(255,255,255,0.85)" },

  // Quick actions row
  quickRow: {
    position: "absolute",
    left: 0, right: 0,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  quickBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADII.full,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  quickBtnActive: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primaryLight },
  quickText: { ...TYPOGRAPHY.caption, color: COLORS.textInverse, fontWeight: "700" },

  invalidToast: {
    position: "absolute",
    top: 100,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(239,68,68,0.92)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 99,
    zIndex: 10,
  },
  invalidToastText: { ...TYPOGRAPHY.caption, color: "#fff", fontWeight: "700" },

  // Modal
  modalRoot: { flex: 1, backgroundColor: COLORS.background },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  modalTitle: { ...TYPOGRAPHY.h2, color: COLORS.textPrimary },
  modalSub: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 3 },
  modalCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.05)",
    ...SHADOWS.soft,
  },
  modalBody: { flex: 1, paddingHorizontal: 20 },
  modalToolRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalCount: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, fontWeight: "700" },
  clearAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADII.full,
    backgroundColor: COLORS.health.sickBg,
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.25)",
  },
  clearAllText: { ...TYPOGRAPHY.caption, color: COLORS.health.sick, fontWeight: "700" },

  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  recentImg: { width: 56, height: 56, borderRadius: 14, backgroundColor: COLORS.primarySoft },
  recentBadge: {
    position: "absolute",
    top: 8, left: 42,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: COLORS.background,
  },
  recentTitleRow: { flexDirection: "row", alignItems: "center" },
  recentTreeId: { ...TYPOGRAPHY.bodyLg, color: COLORS.primaryDark, fontWeight: "800" },
  recentType: { ...TYPOGRAPHY.bodyLg, color: COLORS.textPrimary, fontWeight: "600" },
  recentMetaRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  recentMeta: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, fontWeight: "500" },
  recentDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: COLORS.textMuted, marginHorizontal: 2 },
  recentChevron: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center", justifyContent: "center",
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center", justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { ...TYPOGRAPHY.h3, color: COLORS.textPrimary },
  emptySub: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginTop: 6, textAlign: "center" },

  // Full Screen Modal
  sheetContent: {
    backgroundColor: COLORS.surface,
    flex: 1,
  },
  fsHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  fsCloseBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.background, alignItems: "center", justifyContent: "center" },
  fsHeaderText: { ...TYPOGRAPHY.h3, color: COLORS.textPrimary },
  
  sheetTop: { alignItems: "center", marginTop: 10 },
  sheetImg: { width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.primarySoft, borderWidth: 4, borderColor: COLORS.surface, marginTop: 0 },
  sheetTreeId: { ...TYPOGRAPHY.h3, color: COLORS.primaryDark, marginTop: 12, fontSize: 18 },
  
  sheetBasic: { alignItems: "center", marginTop: 2 },
  sheetType: { ...TYPOGRAPHY.h2, color: COLORS.textPrimary, fontSize: 26 },
  sheetZone: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginTop: 2 },
  sheetBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginTop: 12 },
  sheetBadgeDot: { width: 8, height: 8, borderRadius: 4 },
  sheetBadgeText: { ...TYPOGRAPHY.caption, fontWeight: "700" },

  sheetGrid: { flexDirection: "row", gap: 10, marginTop: 24 },
  sheetCard: { flex: 1, backgroundColor: COLORS.background, padding: 12, borderRadius: 16, alignItems: "center", borderWidth: 1, borderColor: "rgba(15,23,42,0.03)" },
  sheetCardVal: { ...TYPOGRAPHY.bodyLg, fontWeight: "700", color: COLORS.textPrimary, marginTop: 8 },
  sheetCardLabel: { ...TYPOGRAPHY.micro, color: COLORS.textSecondary, marginTop: 2 },

  sheetNotes: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: COLORS.primarySoft, padding: 14, borderRadius: 16, marginTop: 12 },
  sheetNotesText: { flex: 1, ...TYPOGRAPHY.caption, color: COLORS.primaryDark, lineHeight: 18 },

  sheetEco: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: COLORS.background, padding: 16, borderRadius: 16, marginTop: 12, borderWidth: 1, borderColor: "rgba(15,23,42,0.03)" },
  sheetEcoIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center", ...SHADOWS.glow },
  sheetEcoVal: { ...TYPOGRAPHY.h3, color: COLORS.textPrimary, fontSize: 18 },
  sheetEcoLabel: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 },

  sheetActionsTop: { flexDirection: "row", gap: 10, marginTop: 24 },
  sheetBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, borderRadius: 25 },
  sheetBtnPrimary: { backgroundColor: COLORS.primary, ...SHADOWS.glow },
  sheetBtnSecondary: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: "rgba(15,23,42,0.06)", ...SHADOWS.soft },
  sheetBtnTextInverse: { ...TYPOGRAPHY.body, color: COLORS.textInverse, fontWeight: "700" },
  
  sheetBtnReport: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, borderRadius: 25, marginTop: 12, backgroundColor: COLORS.health.sickBg, borderWidth: 1, borderColor: "rgba(239,68,68,0.2)" },
  sheetBtnTextReport: { ...TYPOGRAPHY.body, color: COLORS.health.sick, fontWeight: "700" },

  // Image Viewer
  viewerRoot: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)", justifyContent: "center", alignItems: "center" },
  viewerClose: { position: "absolute", top: 50, right: 20, zIndex: 10, width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  viewerImg: { width: "100%", height: "80%" },
});
