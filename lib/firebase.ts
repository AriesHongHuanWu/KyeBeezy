import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyAnDDm7HCp6FcAMuWLWlkKru7ImYw8PKU4",
    authDomain: "kyebeezyonline.firebaseapp.com",
    projectId: "kyebeezyonline",
    storageBucket: "kyebeezyonline.firebasestorage.app",
    messagingSenderId: "604455178250",
    appId: "1:604455178250:web:6a150d15ee6ba451c58ff3",
    measurementId: "G-S8NC12VB98"
};

// Initialize Firebase SDK
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

let analytics;
// Analytics only works in the browser
if (typeof window !== "undefined") {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

// Messaging (FCM)
import { getMessaging } from "firebase/messaging";
let messaging: any;

if (typeof window !== "undefined") {
    messaging = getMessaging(app);
}

export { app, auth, db, analytics, googleProvider, messaging };
