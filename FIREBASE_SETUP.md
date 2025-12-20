# Firebase Configuration - Deployment Guide

## 1. Local Development
Create a file named `.env.local` in this directory (g:\kyeweb\.env.local) and paste the follow content, replacing the values with your actual Firebase keys:

NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

## 2. Cloudflare Pages Deployment
Since `.env` files are not committed to git (for security), you must set these variables in the Cloudflare Dashboard:

1. Go to **Cloudflare Pages** -> Select your project (`kyebeezy`).
2. Go to **Settings** -> **Environment variables**.
3. Click **Add variable** for "Production" and "Preview".
4. Add each of the 6 keys above and their values.
5. Redeploy your site for changes to take effect.
