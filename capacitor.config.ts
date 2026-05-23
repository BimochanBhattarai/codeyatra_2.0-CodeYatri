import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.uddhar.app',
  appName: 'Uddhar',
  webDir: 'out',
    server: {
    androidScheme: "http",
    cleartext: true,
  },
    plugins: {
    CapacitorCookies: {
      enabled: true,
    },
  },
};

export default config;
