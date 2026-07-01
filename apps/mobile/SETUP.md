# GeoAfric Mobile — Setup Guide

## Prerequisites

- Node.js 18+
- npm 9+
- Expo CLI: `npm install -g expo-cli` (or use `npx`)
- Expo Go app on your phone (iOS App Store / Google Play)
- For native builds: Xcode (iOS) or Android Studio

## First-time setup

```powershell
# From monorepo root
cd C:\Users\Keon Anime\Desktop\Apps\GeoAfric\geoafric

# Install ALL dependencies (root + apps + packages)
npm install
```

## Fonts

Download the fonts from Google Fonts and place them in `apps/mobile/assets/fonts/`:

- Sora-Regular.ttf
- Sora-Bold.ttf
- Sora-ExtraBold.ttf
- Sora-Black.ttf
- DMSans-Regular.ttf
- DMSans-Medium.ttf
- DMSans-Bold.ttf

Sora:    https://fonts.google.com/specimen/Sora
DM Sans: https://fonts.google.com/specimen/DM+Sans

## App icons

Place these in `apps/mobile/assets/`:
- `icon.png` (1024×1024) — main app icon
- `splash.png` (1242×2436) — splash screen
- `adaptive-icon.png` (1024×1024) — Android adaptive icon foreground
- `favicon.png` (48×48) — web favicon

You can reuse `apps/web/public/icons/icon-512.png` for now.

## Environment

Copy `.env.example` to `.env`:

```powershell
cd apps\mobile
copy .env.example .env
```

Edit `.env`:

```
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3001
EXPO_PUBLIC_SUPABASE_URL=https://jhzifjzohrofdxqrlcnq.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_key_here
EXPO_PUBLIC_GOOGLE_MAPS_KEY=optional_for_now
```

**Important:** `localhost` won't work on a physical phone. Find your machine's local IP:

```powershell
ipconfig
# Look for IPv4 Address, e.g. 192.168.1.42
```

Then set `EXPO_PUBLIC_API_URL=http://192.168.1.42:3001`.

## Running

```powershell
# From monorepo root — starts API + web + mobile together
npm run dev

# Or just the mobile app:
cd apps\mobile
npm run dev
```

Scan the QR code with the Expo Go app on your phone.

## Troubleshooting

**"Unable to resolve @geoafric/shared"**
- Run `npm install` from the monorepo root, not inside `apps/mobile`

**API requests fail / Network Error**
- Make sure your phone and computer are on the same WiFi
- Make sure `EXPO_PUBLIC_API_URL` uses your machine's local IP, not localhost
- Check that the API is running (`localhost:3001`)

**Maps not showing**
- You need a Google Maps API key with Android SDK and iOS SDK enabled
- Add it to `app.json` (both iOS and Android sections) AND `.env`

**Font errors**
- Make sure all 7 font files are placed in `apps/mobile/assets/fonts/`
- Filenames are case-sensitive
