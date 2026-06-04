# Smart Tree Management System — PRD

## Vision
Mobile-first environmental application for universities, campuses, parks, and green zones to digitally register and manage trees with quick analytics, AI assistance, and on-site QR scanning.

## App Architecture
- **Stack**: React Native (Expo SDK 54) · expo-router file-based routing
- **Design system**: `/app/design_guidelines.json` + `/app/frontend/constants/theme.ts` (single source of truth — reused across every screen)
- **Backend**: FastAPI + MongoDB (boilerplate ready, models to be added per feature)

## Tabs (5) — All delivered ✅
1. **Home** ✅ — Dashboard
2. **Map** ✅ — Zone discovery + interactive faux map + tree sheet
3. **QR Scan** ✅ — Animated scanner + recents
4. **AI Assistant** ✅ — Premium chat UI with vision-ready diagnosis cards
5. **Profile** ✅ — Hero + stats + activity + settings + logout
3. **QR Scan** — placeholder (design later) — center floating FAB
4. **AI Assistant** — placeholder (design later, will use Emergent Universal LLM Key with vision)
5. **Profile** — placeholder (design later)

## Design Language (locked)
- Palette: emerald greens (`#10B981`, `#047857`, `#34D399`, `#D1FAE5`), neutrals (whites/greys), health states (healthy green / warning amber / sick coral)
- Soft shadows, 24px rounded cards, glassmorphic surfaces, decorative leaf-glow background blobs
- Custom floating QR Scan FAB (64px, green core, 4px white halo, glowing shadow) elevated 28px above 72px-tall white tab bar

## Screen 1 — Home (USER discovery hub, redesigned)
- **Top header**: time-aware greeting ("Good afternoon, Aarav 🌿") + notification bell with badge + circular avatar (dashed green ring) routing to Profile
- **Discover search pill**: "Discover trees, zones, species…" with leaf accent
- **Eco Highlights banners** (horizontal swipeable, 3 cards): Campaign / Eco Tip / News — image-based with tag pill, title, subtitle, "Read more" CTA, animated page dots
- **Nearby Zones** (horizontal cards, 3): image header with University Campus / Research Park / Garden pill + distance pill over overlay; zone name + tree count + green "Explore" CTA (routes to Map)
- **Discover Trees** (horizontal feature cards, 4): tree image with status pill (Healthy green / Rare purple / New blue), Tree #ID, type, location meta
- **Quick AI Actions** (3 rows): Check tree health · Ask AI assistant · Upload tree photo — all route to AI Assistant
- **Recent Activity**: 3 rows with thumbnail + action badge (Scanned/Viewed/Saved) + tree ID + zone + time

Heavy analytics metric grids and weekly chart removed — this is a discovery hub, not a data dashboard.

## Screen 2 — Map (delivered)
- **Search** pill (zone search by name) + filter accent
- **Filter chips** (horizontal scroll): All Trees, Healthy, Warning, Sick — active state with colored fill matching health tone
- **Faux Google Maps canvas**: cream base, soft green park blobs, blue water blob, white road grid, grey building dots — animated zoom/pan via Animated API
- **Zone overlays** (overview): 3 dashed-border green areas (North Quad / Botany Park / Riverside Lawn) with floating leaf pins + name/tree-count labels
- **Smooth zoom transition** (520ms cubic-bezier) when zone tapped → map scales 1.35x and translates to center the zone
- **Tree pins** (zone detail): 8 colored leaf pins scattered inside the zone, colored per health (green/amber/coral), with pulse halo on active pin
- **Top zone chip**: back button + zone name + tree count + area + Live pill
- **Map controls**: zoom +/− stack + locate FAB on right
- **Discover Zones peek**: horizontal zone cards at bottom of overview
- **Tree bottom sheet** (animated slide up + scrim): tree image hero, Tree #ID badge, health pill, close button, type + species, last watered + registered meta tiles, "Log Watering" primary + "Details" secondary CTAs

## Screen 3 — QR Scan (delivered)
- Dark camera viewport (top 62%) with blurred forest image + green tint; light recents sheet (bottom 38%) — split layout with rounded seams
- **Header** over camera: back ←, "QR Scanner" + helper "Scan a tree QR code to view details", help ?
- **Scan frame**: centered rounded square with 4 green corner brackets + looping animated green scan line (1.8s up / 1.8s down) + subtle pulse scale on frame
- **Dim overlay** strips outside the frame for focus
- **Quick actions**: Flash toggle (glows green when on), "Scanning…" live pill, Gallery upload
- **Recent Scans bottom sheet**: 4 recently scanned trees with circular image + QR badge overlay, Tree #ID + type, zone + time meta, green chevron affordance
- Bottom nav with active QR FAB (centered, glowing)

## Screen 4 — AI Assistant (delivered)
- Premium chat UI with **KeyboardAvoidingView**
- **Header**: green leaf bot avatar with online pip, "AI Tree Assistant" + "Online · Vision ready" status, new-chat icon
- **User bubbles**: right-aligned, green fill, white text, image-attachment bubbles with caption
- **AI bubbles**: left-aligned with green leaf avatar, white glass card; supports text replies and rich **Diagnosis cards** (status pill, title, summary, checkmark action bullets, Save report + Share CTAs)
- **Quick-action suggestions** (4): Check tree health / Diagnose disease / Watering advice / Tree care tips — shown when conversation is fresh
- **Typing indicator**: 3 pulsing green dots in AI bubble style
- **Input bar**: image + camera attach buttons (green chips), multiline text field, send FAB (disabled grey → active glowing green)
- **"AI can analyze tree photos · Always verify with a specialist"** disclaimer
- Tapping "Diagnose disease" plays a demo vision-analysis flow (user question → AI reply → user image → AI diagnosis card). Hooked up locally; ready to connect to Emergent Universal LLM Key (vision) when backend integration phase begins.

## Future Screens (per user instruction — design one at a time)
- Profile

## Future Backend Endpoints (planned, not built yet)
- `/api/zones` · `/api/zones/{id}/trees` · `/api/trees/{id}` · `/api/ai/analyze` (vision)
- **Stats row**: 3 cards — 128 Scanned (green QR), 34 Reports (amber docs), 17 Saved (purple bookmark)
- **Activity History**: segmented tabs (Scans / Reports / Saved) — filter the list live; rows show thumbnail/icon + title + meta + time + chevron; status-colored doc icons for Reports tab (pending amber, approved green, escalated red)
- **Settings list** (glass cards): Language (English US), Notifications (toggle — works), App preferences, Privacy & security · Help & support + About Smart Tree in a second group
- **Logout button**: soft red pill with sick-tone background
- Version + "Made with 🌿 for greener campuses" footer
- Bottom nav with Profile tab active and floating QR FAB centered

## Future (post-design backend integration phase)
- Wire AI chat to Emergent Universal LLM Key (vision)
- Add real zone/tree backend CRUD + activity feed endpoints
- Connect `expo-camera` + QR decoder in QR Scan
- Swap faux map for `react-native-maps` overlays
- Add auth (JWT or Emergent Google login) at the end per user's preference

## Future Backend Endpoints (planned, not built yet)
- `/api/zones` · `/api/zones/{id}/trees` · `/api/trees/{id}` · `/api/ai/analyze` (vision)
