
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { authenticatedPost } from './api';

// Configure how notifications are handled when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register for push notifications and send token to backend
 */
export async function registerForPushNotifications(): Promise<string | null> {
  console.log('[Notifications] Registering for push notifications');
  
  if (!Device.isDevice) {
    console.log('[Notifications] Not a physical device, skipping registration');
    return null;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      console.log('[Notifications] Requesting notification permissions...');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[Notifications] Permission not granted');
      return null;
    }

    console.log('[Notifications] Permission granted, getting push token...');

    // Get project ID from app.json or use a default
    const projectId = process.env.EXPO_PUBLIC_PROJECT_ID || undefined;
    
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId, // This will be auto-configured by Expo
    });
    
    const expoPushToken = tokenData.data;
    console.log('[Notifications] Got push token:', expoPushToken);

    // Register token with backend
    try {
      await authenticatedPost('/api/notifications/register-token', {
        expoPushToken,
        platform: Platform.OS,
      });
      console.log('[Notifications] Token registered with backend');
    } catch (error) {
      console.error('[Notifications] Failed to register token with backend:', error);
    }

    return expoPushToken;
  } catch (error) {
    console.error('[Notifications] Error registering for push notifications:', error);
    return null;
  }
}

/**
 * Set up notification listeners
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationTapped?: (response: Notifications.NotificationResponse) => void
) {
  // Handle notifications received while app is foregrounded
  const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
    console.log('[Notifications] Notification received:', notification);
    onNotificationReceived?.(notification);
  });

  // Handle notification taps
  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('[Notifications] Notification tapped:', response);
    onNotificationTapped?.(response);
  });

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}

/**
 * Schedule a local notification (for testing)
 */
export async function scheduleLocalNotification(title: string, body: string, data?: any) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: null, // Show immediately
  });
}
