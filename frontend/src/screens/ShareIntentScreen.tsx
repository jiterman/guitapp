import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Layout, Text, Spinner } from '@ui-kitten/components';
import { router, useLocalSearchParams } from 'expo-router';
import { useShareIntent, useShareIntentContext } from 'expo-share-intent'; // Ajustá la ruta según tu proyecto

const ShareIntentScreen = () => {
  const { resetShareIntent } = useShareIntentContext();
  const { sharedFilePath } = useLocalSearchParams<{ sharedFilePath: string }>(); // <-- Capturar el parámetro
  const [statusMessage, setStatusMessage] = useState('Analizando imagen del ticket...');
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processSharedImage = async () => {
      try {
        // Limpiamos el intent nativo APENAS empezamos para evitar bucles desde el root
        // resetShareIntent();

        // CORRECCIÓN: Ahora el path llega garantizado por los parámetros de navegación
        console.log('Archivo recibido desde los parámetros:', sharedFilePath);

        if (!sharedFilePath) {
          setStatusMessage('No se recibió ninguna imagen válida.');
          return;
        }

        // 1. Simulamos la pegada al backend (3 segundos)
        await new Promise(resolve => setTimeout(resolve, 3000));

        setStatusMessage('¡Datos extraídos con éxito!');

        // 2. Simulamos la respuesta de la IA / Backend
        const mockBackendResponse = {
          amount: '15000.00',
          description: 'Oldays',
          category: 'RESTAURANT',
          date: new Date().toISOString().split('T')[0],
        };

        // 4. Viajamos a la pantalla de agregar gasto
        router.replace({
          pathname: '/(app)/add-expense',
          params: {
            fromShareIntent: 'true',
            amount: mockBackendResponse.amount,
            description: mockBackendResponse.description,
            category: mockBackendResponse.category,
            date: mockBackendResponse.date,
            imagePath: sharedFilePath,
          },
        });
      } catch (error) {
        console.error('Error procesando la imagen:', error);
        setStatusMessage('Error al procesar el ticket.');
      } finally {
        resetShareIntent();
      }
    };

    processSharedImage();
  }, [sharedFilePath]); // Quitamos resetShareIntent para evitar re-ejecución al limpiar

  return (
    <Layout style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.subHeader}>
          <Text category="h4" style={styles.title}>
            Procesando Gasto
          </Text>
          <TouchableOpacity
            onPress={() => {
              resetShareIntent();
              router.back();
            }}
          >
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* CONTENIDO DE CARGA */}
        <View style={styles.loadingContainer}>
          <Spinner size="large" status="primary" />
          <Text category="s1" style={styles.statusText}>
            {statusMessage}
          </Text>
          <Text category="p2" style={styles.subText}>
            Estamos extrayendo el monto y los datos del comprobante.
          </Text>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 20,
    color: '#7f8c8d',
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  statusText: {
    marginTop: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  subText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#7f8c8d',
    paddingHorizontal: 20,
  },
});

export default ShareIntentScreen;
