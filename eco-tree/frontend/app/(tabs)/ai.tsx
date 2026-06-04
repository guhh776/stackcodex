import React, { useEffect, useRef, useState } from "react";
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
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  Keyboard,
} from "react-native";
import Reanimated, { FadeInUp } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, RADII, SHADOWS, SPACING, TYPOGRAPHY } from "../../constants/theme";

type IoniconName = keyof typeof Ionicons.glyphMap;

type Suggestion = { id: string; label: string; icon: IoniconName; tint: string; bg: string };

const SUGGESTIONS: Suggestion[] = [
  { id: "s1", label: "Check tree health", icon: "pulse", tint: COLORS.primaryDark, bg: COLORS.primarySoft },
  { id: "s2", label: "Diagnose disease", icon: "medkit", tint: COLORS.health.sick, bg: COLORS.health.sickBg },
  { id: "s3", label: "Watering advice", icon: "water", tint: "#0369A1", bg: "#E0F2FE" },
  { id: "s4", label: "Tree care tips", icon: "leaf", tint: COLORS.primaryDark, bg: "#ECFDF5" },
];

type MessageBase = { id: string; role: "user" | "ai"; time: string };
type TextMsg = MessageBase & { kind: "text"; text: string };
type ImageMsg = MessageBase & { kind: "image"; uri: string; caption?: string };
type DiagnosisMsg = MessageBase & { kind: "diagnosis"; title: string; status: "healthy" | "warning" | "sick"; summary: string; points: string[] };
type Message = TextMsg | ImageMsg | DiagnosisMsg;

const INITIAL: Message[] = [
  { id: "m1", role: "ai", kind: "text", time: "now", text: "Hi! I'm your AI Tree Assistant 🌿\n\nI can help you diagnose diseases, check tree health from photos, and share care tips. Try a suggestion below, or send me a tree image." },
];

const DEMO_FLOW: Message[] = [
  { id: "d1", role: "user", kind: "text", time: "9:41 AM", text: "The leaves on Tree #032 are turning yellow. Is it okay?" },
  { id: "d2", role: "ai", kind: "text", time: "9:41 AM", text: "Yellowing leaves (chlorosis) can signal a few things: underwatering, nitrogen deficiency, or iron deficiency. Can you share a photo so I can take a closer look?" },
  { id: "d3", role: "user", kind: "image", time: "9:42 AM", uri: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=900&q=80", caption: "Here's a close-up of Tree #032" },
  {
    id: "d4",
    role: "ai",
    kind: "diagnosis",
    time: "9:42 AM",
    title: "Likely Iron Deficiency (Interveinal Chlorosis)",
    status: "warning",
    summary: "I see yellowing between dark-green veins — a classic sign of iron chlorosis, often caused by alkaline soil pH.",
    points: [
      "Test soil pH — aim for 6.0–6.8",
      "Apply chelated iron (Fe-EDDHA) to the root zone",
      "Mulch with pine bark to slightly acidify soil",
      "Re-check new growth after 2 weeks",
    ],
  },
];

export default function AiScreen() {
  const insets = useSafeAreaInsets();
  const { width: winW } = useWindowDimensions();
  const SCREEN_W = Math.min(winW, 480);

  const [messages, setMessages] = useState<Message[]>(INITIAL);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [kbVisible, setKbVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const s1 = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow", () => setKbVisible(true));
    const s2 = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide", () => setKbVisible(false));
    return () => { s1.remove(); s2.remove(); };
  }, []);

  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (!typing) return;
    const make = (v: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(v, { toValue: 1, duration: 320, easing: Easing.ease, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0.3, duration: 320, easing: Easing.ease, useNativeDriver: true }),
        ])
      );
    const a = make(dot1, 0);
    const b = make(dot2, 160);
    const c = make(dot3, 320);
    a.start(); b.start(); c.start();
    return () => { a.stop(); b.stop(); c.stop(); };
  }, [typing, dot1, dot2, dot3]);

  const scrollToEnd = () => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);

  const send = (textOverride?: string) => {
    const t = (textOverride ?? input).trim();
    if (!t) return;
    const userMsg: TextMsg = { id: `u-${Date.now()}`, role: "user", kind: "text", text: t, time: "now" };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);
    scrollToEnd();
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: "ai",
          kind: "text",
          time: "now",
          text: "Great question! For a detailed health report I'd recommend sharing a close-up photo of the leaves and trunk. I can also pull your watering history for that tree — just send the Tree ID.",
        } as TextMsg,
      ]);
      scrollToEnd();
    }, 1400);
  };

  const handleSuggestion = (s: Suggestion) => {
    if (s.id === "s2") {
      setMessages((m) => [...m, ...DEMO_FLOW]);
      scrollToEnd();
      return;
    }
    send(s.label);
  };

  const attachImage = () => {
    const img: ImageMsg = {
      id: `img-${Date.now()}`,
      role: "user",
      kind: "image",
      time: "now",
      uri: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=900&q=80",
      caption: "Analyzing this tree",
    };
    setMessages((m) => [...m, img]);
    setTyping(true);
    scrollToEnd();
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [
        ...m,
        {
          id: `diag-${Date.now()}`,
          role: "ai",
          kind: "diagnosis",
          time: "now",
          title: "Healthy Neem — no visible stress",
          status: "healthy",
          summary: "Foliage is vibrant and uniform. Canopy density looks optimal for this season.",
          points: ["Continue current watering schedule", "Mulch base in summer", "Prune dead branches annually"],
        } as DiagnosisMsg,
      ]);
      scrollToEnd();
    }, 1600);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.root, { width: SCREEN_W, alignSelf: "center" }]}
      keyboardVerticalOffset={0}
      testID="ai-screen"
    >
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.botAvatar}>
          <View style={styles.botAvatarRing} />
          <Ionicons name="leaf" size={18} color={COLORS.textInverse} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>AI Tree Assistant</Text>
          <View style={styles.headerStatusRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.headerStatus}>Online · Vision ready</Text>
          </View>
        </View>
        <TouchableOpacity testID="ai-new-chat" style={styles.headerBtn} activeOpacity={0.85}
          onPress={() => setMessages(INITIAL)}>
          <Ionicons name="create-outline" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* CHAT */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((m, i) => {
          if (m.role === "user") return <UserBubble key={m.id} msg={m} />;
          return (
            <AiBubble key={m.id} msg={m} showAvatar={i === 0 || messages[i - 1]?.role !== "ai"} />
          );
        })}

        {/* Suggestions — show when only the initial AI message is present */}
        {messages.length <= 1 && (
          <View style={styles.suggestWrap} testID="ai-suggestions">
            <Text style={styles.suggestTitle}>Quick actions</Text>
            <View style={styles.suggestGrid}>
              {SUGGESTIONS.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  testID={`suggest-${s.id}`}
                  activeOpacity={0.85}
                  onPress={() => handleSuggestion(s)}
                  style={styles.suggestChip}
                >
                  <View style={[styles.suggestIcon, { backgroundColor: s.bg }]}>
                    <Ionicons name={s.icon} size={16} color={s.tint} />
                  </View>
                  <Text style={styles.suggestText}>{s.label}</Text>
                  <Ionicons name="arrow-forward" size={14} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {typing && (
          <View style={styles.typingRow}>
            <View style={styles.aiAvatarSmall}>
              <Ionicons name="leaf" size={12} color={COLORS.textInverse} />
            </View>
            <View style={styles.typingBubble}>
              <Animated.View style={[styles.typingDot, { opacity: dot1 }]} />
              <Animated.View style={[styles.typingDot, { opacity: dot2 }]} />
              <Animated.View style={[styles.typingDot, { opacity: dot3 }]} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* INPUT BAR */}
      <View style={[styles.inputWrap, { paddingBottom: kbVisible ? (Platform.OS === "ios" ? 10 : 20) : Math.max(insets.bottom + 90, 100) }]}>
        <View style={styles.inputRow}>
          <TouchableOpacity testID="ai-attach" activeOpacity={0.85} onPress={attachImage} style={styles.inputIconBtn}>
            <Ionicons name="image-outline" size={20} color={COLORS.primaryDark} />
          </TouchableOpacity>
          <TouchableOpacity testID="ai-camera" activeOpacity={0.85} onPress={attachImage} style={styles.inputIconBtn}>
            <Ionicons name="camera-outline" size={20} color={COLORS.primaryDark} />
          </TouchableOpacity>

          <TextInput
            testID="ai-input"
            value={input}
            onChangeText={setInput}
            placeholder="Ask about tree health..."
            placeholderTextColor={COLORS.textMuted}
            style={styles.inputField}
            multiline
            onSubmitEditing={() => send()}
            returnKeyType="send"
          />

          <TouchableOpacity
            testID="ai-send"
            activeOpacity={0.85}
            disabled={!input.trim()}
            onPress={() => send()}
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          >
            <Ionicons name="send" size={18} color={COLORS.textInverse} />
          </TouchableOpacity>
        </View>
        <Text style={styles.inputHint}>AI can analyze tree photos · Always verify with a specialist</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

function UserBubble({ msg }: { msg: Message }) {
  if (msg.kind === "image") {
    return (
      <Reanimated.View style={styles.userRow} entering={FadeInUp.duration(300)}>
        <View style={styles.userImgBubble}>
          <Image source={{ uri: msg.uri }} style={styles.userImg} />
          {msg.caption ? <Text style={styles.userImgCaption}>{msg.caption}</Text> : null}
        </View>
      </Reanimated.View>
    );
  }
  return (
    <Reanimated.View style={styles.userRow} entering={FadeInUp.duration(300)}>
      <View style={styles.userBubble}>
        <Text style={styles.userText}>{(msg as TextMsg).text}</Text>
      </View>
    </Reanimated.View>
  );
}

function AiBubble({ msg, showAvatar }: { msg: Message; showAvatar: boolean }) {
  return (
    <View style={styles.aiRow}>
      <View style={styles.aiAvatarCol}>
        {showAvatar ? (
          <View style={styles.aiAvatar}>
            <Ionicons name="leaf" size={14} color={COLORS.textInverse} />
          </View>
        ) : (
          <View style={{ width: 30 }} />
        )}
      </View>
      <View style={{ flex: 1 }}>
        {msg.kind === "text" && (
          <View style={styles.aiBubble}>
            <Text style={styles.aiText}>{(msg as TextMsg).text}</Text>
          </View>
        )}
        {msg.kind === "diagnosis" && <DiagnosisCard msg={msg as DiagnosisMsg} />}
      </View>
    </View>
  );
}

function DiagnosisCard({ msg }: { msg: DiagnosisMsg }) {
  const tone =
    msg.status === "healthy" ? { color: COLORS.health.healthy, bg: COLORS.health.healthyBg, label: "Healthy" } :
    msg.status === "warning" ? { color: COLORS.health.warning, bg: COLORS.health.warningBg, label: "Needs attention" } :
    { color: COLORS.health.sick, bg: COLORS.health.sickBg, label: "Critical" };
  return (
    <View style={[styles.aiBubble, styles.diagCard]}>
      <View style={styles.diagHead}>
        <View style={styles.diagIcon}>
          <Ionicons name="sparkles" size={14} color={COLORS.primaryDark} />
        </View>
        <Text style={styles.diagLabel}>AI Diagnosis</Text>
        <View style={[styles.diagStatus, { backgroundColor: tone.bg }]}>
          <View style={[styles.diagStatusDot, { backgroundColor: tone.color }]} />
          <Text style={[styles.diagStatusText, { color: tone.color }]}>{tone.label}</Text>
        </View>
      </View>
      <Text style={styles.diagTitle}>{msg.title}</Text>
      <Text style={styles.diagSummary}>{msg.summary}</Text>
      <View style={styles.diagPoints}>
        {msg.points.map((p, i) => (
          <View key={i} style={styles.diagPoint}>
            <View style={styles.diagBullet}>
              <Ionicons name="checkmark" size={10} color={COLORS.textInverse} />
            </View>
            <Text style={styles.diagPointText}>{p}</Text>
          </View>
        ))}
      </View>
      <View style={styles.diagActions}>
        <TouchableOpacity style={styles.diagPrimary} activeOpacity={0.9}>
          <Ionicons name="save-outline" size={14} color={COLORS.textInverse} />
          <Text style={styles.diagPrimaryText}>Save report</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.diagSecondary} activeOpacity={0.85}>
          <Ionicons name="share-outline" size={14} color={COLORS.primaryDark} />
          <Text style={styles.diagSecondaryText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  botAvatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: COLORS.primary,
    alignItems: "center", justifyContent: "center",
    ...SHADOWS.glow,
  },
  botAvatarRing: {
    position: "absolute", top: -3, right: -3,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2, borderColor: COLORS.background,
  },
  headerTitle: { ...TYPOGRAPHY.h3, color: COLORS.textPrimary },
  headerStatusRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary },
  headerStatus: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary },
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(15,23,42,0.05)",
    ...SHADOWS.soft,
  },

  divider: { height: 1, backgroundColor: COLORS.divider, marginHorizontal: 16 },

  // Bubbles
  userRow: { alignItems: "flex-end", marginTop: 12 },
  userBubble: {
    maxWidth: "82%",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderBottomRightRadius: 6,
    ...SHADOWS.soft,
  },
  userText: { color: COLORS.textInverse, fontSize: 14, lineHeight: 20, fontWeight: "500" },
  userImgBubble: {
    maxWidth: "82%",
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    borderBottomRightRadius: 6,
    padding: 4,
    ...SHADOWS.soft,
  },
  userImg: {
    width: 220, height: 160, borderRadius: 16,
    backgroundColor: COLORS.primaryDark,
  },
  userImgCaption: {
    color: COLORS.textInverse,
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  aiRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginTop: 14 },
  aiAvatarCol: { width: 30, alignItems: "flex-start", paddingTop: 4 },
  aiAvatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: COLORS.primaryDark,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: COLORS.surface,
    ...SHADOWS.soft,
  },
  aiAvatarSmall: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: COLORS.primaryDark,
    alignItems: "center", justifyContent: "center",
  },
  aiBubble: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 20,
    borderTopLeftRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.04)",
    ...SHADOWS.card,
  },
  aiText: { color: COLORS.textPrimary, fontSize: 14, lineHeight: 22, fontWeight: "500" },

  // Diagnosis card
  diagCard: { padding: 14 },
  diagHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  diagIcon: {
    width: 26, height: 26, borderRadius: 8,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center", justifyContent: "center",
  },
  diagLabel: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, fontWeight: "700", flex: 1 },
  diagStatus: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: RADII.full,
  },
  diagStatusDot: { width: 6, height: 6, borderRadius: 3 },
  diagStatusText: { ...TYPOGRAPHY.micro, fontWeight: "700" },
  diagTitle: { ...TYPOGRAPHY.h3, color: COLORS.textPrimary, fontSize: 16, marginTop: 2 },
  diagSummary: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginTop: 6, lineHeight: 20 },
  diagPoints: { marginTop: 10, gap: 8 },
  diagPoint: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  diagBullet: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: COLORS.primary,
    alignItems: "center", justifyContent: "center",
    marginTop: 1,
  },
  diagPointText: { flex: 1, ...TYPOGRAPHY.body, color: COLORS.textPrimary },
  diagActions: { flexDirection: "row", gap: 8, marginTop: 14 },
  diagPrimary: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: RADII.full,
  },
  diagPrimaryText: { color: COLORS.textInverse, fontSize: 12, fontWeight: "700" },
  diagSecondary: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: RADII.full,
  },
  diagSecondaryText: { color: COLORS.primaryDark, fontSize: 12, fontWeight: "700" },

  // Suggestions
  suggestWrap: { marginTop: 20 },
  suggestTitle: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginBottom: 10, marginLeft: 4 },
  suggestGrid: { gap: 8 },
  suggestChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.05)",
    ...SHADOWS.soft,
  },
  suggestIcon: {
    width: 30, height: 30, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  suggestText: { flex: 1, ...TYPOGRAPHY.body, color: COLORS.textPrimary, fontWeight: "600" },

  // Typing
  typingRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12, marginLeft: 4 },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 20,
    borderTopLeftRadius: 6,
    ...SHADOWS.soft,
  },
  typingDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.primary },

  // Input
  inputWrap: {
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: "transparent",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
    backgroundColor: COLORS.surface,
    borderRadius: 26,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.06)",
    ...SHADOWS.card,
  },
  inputIconBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center", justifyContent: "center",
  },
  inputField: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    paddingHorizontal: 6,
    paddingVertical: 8,
    maxHeight: 100,
    minHeight: 36,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: "center", justifyContent: "center",
    ...SHADOWS.glow,
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.textMuted,
    shadowOpacity: 0,
    elevation: 0,
  },
  inputHint: {
    ...TYPOGRAPHY.micro,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 6,
  },
});
