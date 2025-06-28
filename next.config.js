/** @type {import('next').NextConfig} */

let firebaseConfig = {};
// During the build on App Hosting, FIREBASE_WEBAPP_CONFIG will be available.
if (process.env.FIREBASE_WEBAPP_CONFIG) {
  try {
    firebaseConfig = JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
  } catch (e) {
    console.error('Failed to parse FIREBASE_WEBAPP_CONFIG:', e);
  }
}

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  experimental: {
    allowedDevOrigins: [
      'https://3000-firebase-studio-1750685226437.cluster-4xpux6pqdzhrktbhjf2cumyqtg.cloudworkstations.dev',
    ],
  },
  reactStrictMode: true,
  // Manually expose the environment variables to the client.
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: firebaseConfig.apiKey || process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: firebaseConfig.authDomain || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: firebaseConfig.projectId || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: firebaseConfig.storageBucket || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: firebaseConfig.messagingSenderId || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: firebaseConfig.appId || process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_APP_ADMIN_EMAIL: process.env.NEXT_PUBLIC_APP_ADMIN_EMAIL,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID,
  },
};

module.exports = nextConfig;
