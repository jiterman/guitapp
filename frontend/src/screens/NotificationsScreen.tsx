import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { notificationService, Notification, AlertType } from '../services/notificationService';
import { eventEmitter } from '../utils/eventEmitter';
import styles from '../styles/notificationStyles';

const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'hace instantes';

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `hace ${diffInMinutes} min`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `hace ${diffInHours} h`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `hace ${diffInDays} d`;

  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

const getNotificationIcon = (type: AlertType) => {
  switch (type) {
    case 'FIXED_EXPENSE_THRESHOLD_EXCEEDED':
      return { name: 'card-outline' as const, color: '#e74c3c' };
    case 'VARIABLE_EXPENSE_THRESHOLD_EXCEEDED':
      return { name: 'cart-outline' as const, color: '#f39c12' };
    case 'SAVINGS_GOAL_AT_RISK':
      return { name: 'trending-down-outline' as const, color: '#e67e22' };
    case 'NEGATIVE_BALANCE_RISK':
      return { name: 'alert-circle-outline' as const, color: '#c0392b' };
    case 'CATEGORY_OVERSPENDING':
      return { name: 'stats-chart-outline' as const, color: '#3498db' };
    case 'MONTHLY_SUMMARY':
      return { name: 'calendar-outline' as const, color: '#07a3e4' };
    default:
      return { name: 'notifications-outline' as const, color: '#95a5a6' };
  }
};

const getNotificationRoute = (type: AlertType): string | null => {
  switch (type) {
    case 'MONTHLY_SUMMARY':
      return '/summary?tab=monthly';
    default:
      return null;
  }
};

const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadNotifications = useCallback(async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
      eventEmitter.emit('notificationsRead');
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      eventEmitter.emit('notificationsRead');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationPress = async (item: Notification) => {
    if (!item.read) {
      await handleMarkAsRead(item.id);
    }
    const route = getNotificationRoute(item.type);
    if (route) {
      router.push(route as Parameters<typeof router.push>[0]);
    }
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const icon = getNotificationIcon(item.type);
    const date = new Date(item.createdAt);
    const isNavigable = getNotificationRoute(item.type) !== null;

    return (
      <TouchableOpacity
        style={[styles.notificationItem, !item.read && styles.unreadItem]}
        onPress={() => handleNotificationPress(item)}
        disabled={item.read && !isNavigable}
      >
        <View style={styles.iconContainer}>
          <Ionicons name={icon.name} size={24} color={icon.color} />
        </View>
        <View style={styles.content}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.time}>{formatRelativeTime(date)}</Text>
          </View>
          <Text style={styles.itemBody}>{item.body}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificaciones</Text>
        <TouchableOpacity onPress={handleMarkAllAsRead}>
          <Text style={styles.markAllButton}>Leer todas</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>No tenés notificaciones aún</Text>
          </View>
        }
      />
    </View>
  );
};

export default NotificationsScreen;
