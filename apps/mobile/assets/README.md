# Assets

Place app icons and fonts here:

## Required files

```
assets/
├── icon.png              (1024×1024 PNG, app icon)
├── splash.png            (1242×2436 PNG, splash screen)
├── adaptive-icon.png     (1024×1024 PNG, Android adaptive icon foreground)
├── favicon.png           (48×48 PNG, web favicon)
└── fonts/
    ├── Sora-Regular.ttf
    ├── Sora-Bold.ttf
    ├── Sora-ExtraBold.ttf
    ├── Sora-Black.ttf
    ├── DMSans-Regular.ttf
    ├── DMSans-Medium.ttf
    └── DMSans-Bold.ttf
```

## Quick start

**Fonts:** Download from Google Fonts (Sora + DM Sans) and place the .ttf files in `assets/fonts/`.

**Icons:** Reuse the existing PWA icons temporarily:
```powershell
copy ..\..\apps\web\public\icons\icon-512.png icon.png
copy ..\..\apps\web\public\icons\icon-512.png adaptive-icon.png
copy ..\..\apps\web\public\icons\icon-144.png favicon.png
```
