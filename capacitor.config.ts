import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.hyowoncho.nasunko",
  appName: "Nasunko",
  webDir: "out",
  server: {
    url: "https://nasunko.vercel.app",
    cleartext: false,
  },
};

export default config;
