import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        const serviceAccount = JSON.parse(
            process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
        );

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } catch (error) {
        console.error('Firebase Admin Initialization Error:', error);
    }
}

export async function POST(request: Request) {
    try {
        const { token, topic, title, body, icon } = await request.json();

        // 1. Direct Message (Test)
        if (token) {
            const message = {
                token: token,
                notification: {
                    title: title,
                    body: body,
                },
                webpush: {
                    headers: {
                        Urgency: "high"
                    },
                    notification: {
                        icon: '/icon.svg',
                        requireInteraction: true
                    }
                }
            };

            const response = await admin.messaging().send(message);
            return NextResponse.json({ success: true, messageId: response });
        }

        // 2. Topic Broadcast (Targeted)
        if (topic) {
            // Logic to send to all tokens in a topic (or loop through a list of tokens)
            // Note: FCM 'topic' subscription is handled on client or by adding tokens to a group.
            // For this MVP, we might need to query Firestore for tokens if we aren't using FCM Topics strictly.
            // But let's assume valid 'topic' usage or direct batch send if we fetch tokens.

            // However, our current client-side code saves tokens to Firestore under `events/{eventId}/subscribers/{token}`
            // To send to "Event Subscribers", we should receive an `eventId` and fetch those tokens here.

            return NextResponse.json({ success: false, error: "Topic implementation pending logic choice" });
        }

        return NextResponse.json({ success: false, error: "No token provided" }, { status: 400 });

    } catch (error) {
        console.error('Push Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to send notification' }, { status: 500 });
    }
}
