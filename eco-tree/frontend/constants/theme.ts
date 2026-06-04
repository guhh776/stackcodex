// Design tokens — Smart Tree Management System
// Source of truth: /app/design_guidelines.json
// Reused across all screens (Home, Map, QR, AI, Profile)

export const COLORS = {
  primary: "#6DC72B", // Pure, warm grass green (no blue/cyan)
  primaryDark: "#4E9C1C", // Darker warm green
  primaryLight: "#A4E070", // Soft light yellow-green
  primarySoft: "#EBF9E1", // Softest background tint
  primaryTint: "#F5FDF0", // Almost white background

  background: "#F7F9F8",
  surface: "#FFFFFF",
  surfaceGlass: "rgba(255, 255, 255, 0.72)",
  surfaceGlassDark: "rgba(1, 51, 84, 0.04)",

  textPrimary: "#013354", // Extracted navy blue from logo text
  textSecondary: "#4A6D85", // Muted navy
  textMuted: "#8DA3B4",
  textInverse: "#FFFFFF",

  border: "#E2E8E5",
  borderGlass: "rgba(255, 255, 255, 0.55)",
  divider: "#E9EEEB",

  health: {
    healthy: "#6DC72B",
    warning: "#F59E0B",
    sick: "#EF4444",
    healthyBg: "#D1FAE5",
    warningBg: "#FEF3C7",
    sickBg: "#FEE2E2",
  },

  // Decorative
  leafShade: "#0E5C3F",
  forest: "#064E3B",
  mist: "#F1F5F4",
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADII = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

export const SHADOWS = {
  soft: {
    shadowColor: "#013354",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  card: {
    shadowColor: "#013354",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 3,
  },
  glow: {
    shadowColor: "#6DC72B",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 22,
    elevation: 12,
  },
};

export const TYPOGRAPHY = {
  display: { fontSize: 34, lineHeight: 40, fontWeight: "800" as const, letterSpacing: -0.8 },
  h1: { fontSize: 28, lineHeight: 34, fontWeight: "800" as const, letterSpacing: -0.6 },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: "700" as const, letterSpacing: -0.4 },
  h3: { fontSize: 18, lineHeight: 24, fontWeight: "700" as const, letterSpacing: -0.2 },
  bodyLg: { fontSize: 16, lineHeight: 24, fontWeight: "500" as const },
  body: { fontSize: 14, lineHeight: 20, fontWeight: "500" as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: "600" as const, letterSpacing: 0.2 },
  micro: { fontSize: 11, lineHeight: 14, fontWeight: "600" as const, letterSpacing: 0.4 },
};
