import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, SPACING, TYPOGRAPHY, RADII, SHADOWS } from "../constants/theme";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "android" ? 0 : 0}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + SPACING.xl, paddingBottom: insets.bottom + SPACING.lg }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* TOP SECTION */}
        <Animated.View entering={FadeInDown.duration(600).springify()} style={styles.header}>
          <Image 
            source={require("../assets/images/logo.png")} 
            style={styles.logoImg}
          />
          <Text style={styles.appName}>Smart Tree Management</Text>
          <Text style={styles.subtitle}>Explore and protect trees around you</Text>
        </Animated.View>

        {/* LOGIN FORM */}
        <Animated.View entering={FadeInUp.duration(600).delay(200).springify()} style={styles.formContainer}>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* MAIN BUTTON */}
          <TouchableOpacity 
            style={styles.primaryBtn} 
            activeOpacity={0.8}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.primaryBtnText}>Login</Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.textInverse} />
          </TouchableOpacity>

          {/* DIVIDER */}
          <View style={styles.dividerWrap}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* SOCIAL LOGIN */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
              <Ionicons name="logo-google" size={22} color={COLORS.textPrimary} />
              <Text style={styles.socialBtnText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
              <Ionicons name="logo-apple" size={22} color={COLORS.textPrimary} />
              <Text style={styles.socialBtnText}>Apple</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* BOTTOM SECTION */}
        <Animated.View entering={FadeInUp.duration(600).delay(400).springify()} style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text style={styles.footerLink}>Sign Up</Text>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>
    </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
  },
  header: {
    alignItems: "center",
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
  logoImg: {
    width: 90,
    height: 90,
    resizeMode: "contain",
    marginBottom: SPACING.md,
  },
  appName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADII.xl,
    ...SHADOWS.card,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: RADII.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.03)",
  },
  inputIcon: {
    paddingLeft: SPACING.md,
    paddingRight: SPACING.sm,
  },
  input: {
    flex: 1,
    height: 56,
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.textPrimary,
  },
  eyeBtn: {
    padding: SPACING.md,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: SPACING.lg,
  },
  forgotText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primaryDark,
    fontWeight: "700",
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: RADII.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    ...SHADOWS.glow,
  },
  primaryBtnText: {
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.textInverse,
    fontWeight: "700",
  },
  dividerWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: SPACING.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.divider,
  },
  dividerText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    paddingHorizontal: SPACING.md,
  },
  socialRow: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    backgroundColor: COLORS.background,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.03)",
    gap: 10,
  },
  socialBtnText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    paddingTop: SPACING.lg,
    gap: 6,
  },
  footerText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  footerLink: {
    ...TYPOGRAPHY.body,
    color: COLORS.primaryDark,
    fontWeight: "700",
  },
});
