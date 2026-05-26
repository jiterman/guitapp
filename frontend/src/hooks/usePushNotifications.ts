import { useState, useEffect } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { userService } from '../services/userService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(token => {
        setExpoPushToken(token);
        if (token) {
          // Send token to backend
          userService.updateFcmToken(token).catch(err => {
            console.error('Error enviando FCM token al backend:', err);
          });
        }
      })
      .catch(error => console.error('Error registrando notificaciones:', error));
  }, []);

  async function registerForPushNotificationsAsync() {
    let token;

    if (!Device.isDevice) {
      console.log('Debes usar un dispositivo físico para notificaciones push');
      return undefined;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permisos denegados para notificaciones push');
      setHasPermission(false);
      return undefined;
    }

    setHasPermission(true);

    try {
      // Usamos getDevicePushTokenAsync para obtener el token nativo FCM/APNs
      const tokenResponse = await Notifications.getDevicePushTokenAsync();
      token = tokenResponse.data;
    } catch (error) {
      console.error('Error obteniendo el token del dispositivo:', error);
    }

    return token;
  }

  return { expoPushToken, hasPermission };
};
