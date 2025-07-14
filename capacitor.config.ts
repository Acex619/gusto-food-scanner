import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.greentrace.app',
  appName: 'GreenTrace',
  webDir: 'dist',
  server: process.env.NODE_ENV === 'development' ? {
    url: 'https://3d9d9ebd-5686-4720-ac42-85677832f2da.lovableproject.com?forceHideBadge=true',
    cleartext: true
  } : undefined,
  plugins: {
    Camera: {
      permissions: ['camera']
    }
  }
};

export default config;