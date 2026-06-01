import { useState, useEffect } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { userService } from '../services/userService';
import { eventEmitter } from '../utils/eventEmitter';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const usePushNotifications = (enabled: boolean = true) => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [hasPermission, setHasPermission] = useState<boolean>(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

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

    // Escuchamos notificaciones mientras la app está abierta
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notificación recibida en primer plano:', notification);
      eventEmitter.emit('notificationReceived', notification);
    });

    // Escuchamos cuando el usuario interactúa con la notificación
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as Record<string, string> | undefined;
      const alertType = data?.alertType;
      if (alertType) {
        eventEmitter.emit('notificationTapped', { alertType });
      }
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, [enabled]);

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
