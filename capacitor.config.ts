import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.3d9d9ebd56864720ac4285677832f2da',
  appName: 'eco-ai-food-lens',
  webDir: 'dist',
  server: {
    url: 'https://3d9d9ebd-5686-4720-ac42-85677832f2da.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ['camera']
    }
  }
};

export default config;