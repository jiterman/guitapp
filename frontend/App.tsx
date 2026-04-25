import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';

const BACKEND_URL = 'http://10.0.2.2:8080/api/health'; // 10.0.2.2 is the host machine from Android Emulator

export default function App() {
  const [status, setStatus] = useState<string>('Connecting...');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(BACKEND_URL);
        const data = await response.json();
        if (data.status === 'UP') {
          setStatus('Backend Online');
        } else {
          setStatus('Backend status unknown');
        }
      } catch (error) {
        setStatus('Error connecting to backend');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>GuitApp</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View style={[styles.statusBadge, status === 'Backend Online' ? styles.online : styles.offline]}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statusBadge: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  online: {
    backgroundColor: '#d4edda',
  },
  offline: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
