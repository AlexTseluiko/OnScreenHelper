import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ua.medhelper.app',
  appName: 'MedHelper',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'default',
      backgroundColor: '#ffffff'
    },
    Geolocation: {
      permissions: {
        android: [
          'ACCESS_COARSE_LOCATION',
          'ACCESS_FINE_LOCATION'
        ]
      }
    },
    GoogleMaps: {
      permissions: {
        android: [
          'ACCESS_COARSE_LOCATION',
          'ACCESS_FINE_LOCATION'
        ]
      }
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false
  }
};

export default config;
