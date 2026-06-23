# Android Guide — AlumiEye Mobile

Two goals covered here:
1. **Plug and play** — run the app on a real Android device for development
2. **Build APK** — produce an installable `.apk` file

---

## Prerequisites

- **Android Studio** installed at `/Applications/Android Studio.app`
- Android SDK installed (bundled with Android Studio)
- `ANDROID_HOME` set in your shell

### Set `ANDROID_HOME` (one-time)

Add to `~/.zshrc`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Then reload:

```bash
source ~/.zshrc
```

Verify:

```bash
adb version   # should print a version string
```

---

## First-time setup (fresh clone)

> Skip this section if you already have the `android/` folder locally.

The `android/` folder is gitignored (Expo managed workflow — it's a generated artifact).
Run prebuild to regenerate it:

```bash
npm install
npm run prebuild:android      # generates android/ via expo prebuild
```

After prebuild, create `android/local.properties` pointing to your SDK:

```bash
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties
```

Then set up your environment file:

```bash
cp .env.example .env
```

The default in `.env.example` points to the production backend (`https://eyeapp-backend.fly.dev`),
which is correct for running on a real device. Edit `.env` if you need a different URL.

---

## 1. Run on a real Android device (plug and play)

### Enable USB debugging on the device

1. **Settings → About phone** — tap **Build number** 7 times until "Developer options" unlocks
2. **Settings → Developer options** — enable **USB debugging**
3. Connect the device to your Mac via USB
4. On the device, accept the **"Allow USB debugging?"** prompt

### Verify the device is detected

```bash
adb devices
```

Expected output:
```
List of devices attached
XXXXXXXX    device
```

If it shows `unauthorized`, disconnect and reconnect — recheck the prompt on your phone.

### Run the app

```bash
npm run android
```

This builds a debug APK, installs it on the device, and starts the Metro bundler.
First build: ~3–5 min. Subsequent builds are incremental (~30 sec).

> **API note**: The app reads `EXPO_PUBLIC_API_URL` from your `.env` file.
> `http://localhost:8080` does **not** work on a physical device — use
> `https://eyeapp-backend.fly.dev` or your machine's local IP (e.g. `http://192.168.x.x:8080`).

### Pick device interactively (if multiple devices/emulators connected)

```bash
npx expo run:android --device
```

---

## 2. Build an APK file

### Debug APK (fastest — for quick installs and testing)

```bash
npm run apk:debug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

Signed with the debug keystore — can be installed on any device with
"Install from unknown sources" enabled.

### Release APK (optimized, minified — for internal distribution)

```bash
npm run apk
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

> **Signing note**: The release build currently uses the debug keystore
> (`android/app/debug.keystore`). This is fine for internal testing and direct APK
> distribution. For Google Play Store submission, a production keystore is required —
> see the [React Native signing docs](https://reactnative.dev/docs/signed-apk-android).

### Install an APK directly onto a connected device

```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

---

## 3. EAS cloud build (APK without Android SDK)

If you need to build without Android Studio installed, use EAS (Expo's cloud build service):

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview   # produces a downloadable APK
```

The `preview` profile in `eas.json` is already configured with `buildType: apk`.
Download the APK from the EAS dashboard link after the build finishes (~10 min).

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `adb: command not found` | `ANDROID_HOME` not set — see Prerequisites above |
| Device not listed in `adb devices` | Re-plug USB, accept the debugging prompt on device |
| `Could not find tools.jar` | Open Android Studio → SDK Manager → install **Android SDK Build-Tools** |
| Metro bundler can't connect to device | Device and Mac must be on the same WiFi, or use USB mode: `npx expo start --localhost` |
| App opens but API calls fail | Check `EXPO_PUBLIC_API_URL` in `.env` — `localhost` doesn't resolve on a physical device |
| `android/local.properties` missing | Run `echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties` |
| `android/` folder missing | Run `npm run prebuild:android` |
