importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyAnDDm7HCp6FcAMuWLWlkKru7ImYw8PKU4",
    authDomain: "kyebeezyonline.firebaseapp.com",
    projectId: "kyebeezyonline",
    storageBucket: "kyebeezyonline.firebasestorage.app",
    messagingSenderId: "604455178250",
    appId: "1:604455178250:web:6a150d15ee6ba451c58ff3",
    measurementId: "G-S8NC12VB98"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon.svg',
        badge: '/icon.svg',
        image: payload.notification.image
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
