// src/app/actions/send-notifications.ts
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';

type SendNotificationPayload = {
  title: string;
  message: string;
};

export async function sendNotificationsToAll(payload: SendNotificationPayload) {
  try {
    const usersSnapshot = await adminDb.collection('users').get();
    const tokens: string[] = [];

    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      // Ensure we only collect valid, non-empty tokens
      if (userData.notificationToken) {
        tokens.push(userData.notificationToken);
      }
    });

    if (tokens.length === 0) {
      console.log('No registered device tokens found. No notifications sent.');
      return { success: true, message: 'No registered devices to send notifications to.' };
    }

    // FCM's multicast messaging can send to up to 500 tokens at a time.
    // For larger audiences, you would need to batch these requests.
    const message = {
      notification: {
        title: payload.title,
        body: payload.message,
      },
      tokens: tokens,
    };

    const response = await getMessaging().sendEachForMulticast(message);
    console.log(`Successfully sent message to ${response.successCount} devices.`);
    if (response.failureCount > 0) {
      console.log(`Failed to send to ${response.failureCount} devices.`);
    }

    return { success: true, message: `Notification sent to ${response.successCount} of ${tokens.length} devices.` };
  } catch (error) {
    console.error('Error sending push notifications:', error);
    return { success: false, message: 'Failed to send notifications.' };
  }
}


export async function sendNotificationToUser(userId: string, payload: SendNotificationPayload) {
    try {
        const userRef = adminDb.doc(`users/${userId}`);
        const userSnap = await userRef.get();

        if (!userSnap.exists) {
            return { success: false, message: "User not found." };
        }

        const userData = userSnap.data();
        const token = userData?.notificationToken;

        if (!token) {
            return { success: false, message: "User does not have a notification token." };
        }

        const message = {
            notification: {
                title: payload.title,
                body: payload.message,
            },
            token: token,
        };

        const response = await getMessaging().send(message);
        console.log("Successfully sent message:", response);
        return { success: true, message: "Notification sent successfully." };

    } catch (error: any) {
        console.error(`Error sending notification to user ${userId}:`, error);
        // Check for specific error codes if needed, e.g., 'messaging/registration-token-not-registered'
        if (error.code === 'messaging/registration-token-not-registered') {
            // The token is invalid, so we should remove it from the user's document
            await adminDb.doc(`users/${userId}`).update({ notificationToken: null });
             return { success: false, message: "User token was invalid and has been removed." };
        }
        return { success: false, message: "Failed to send notification." };
    }
}
