#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
ANDROID_DIR="$ROOT_DIR/android"

cd "$ROOT_DIR"

if ! command -v node >/dev/null 2>&1; then
  echo "Error: node is not installed or not in PATH."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is not installed or not in PATH."
  exit 1
fi

if [ -z "${JAVA_HOME:-}" ]; then
  if command -v /usr/libexec/java_home >/dev/null 2>&1; then
    export JAVA_HOME="$(/usr/libexec/java_home 2>/dev/null || true)"
  fi
fi

if [ -z "${JAVA_HOME:-}" ] || [ ! -d "$JAVA_HOME" ]; then
  echo "Error: JAVA_HOME is not set to a valid JDK path."
  echo "Try: export JAVA_HOME=$(/usr/libexec/java_home)"
  exit 1
fi

if [ ! -d "$ANDROID_DIR" ]; then
  echo "Error: android/ directory not found. Run: npx cap add android"
  exit 1
fi

echo "==> Building Next.js app"
npm run build

echo "==> Syncing Capacitor Android project"
npx cap sync android

echo "==> Building debug APK with Gradle"
cd "$ANDROID_DIR"
./gradlew assembleDebug

APK_PATH="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"

if [ -f "$APK_PATH" ]; then
  echo "==> APK generated successfully"
  echo "$APK_PATH"
else
  echo "Build finished, but APK was not found at expected path:"
  echo "$APK_PATH"
  exit 1
fi