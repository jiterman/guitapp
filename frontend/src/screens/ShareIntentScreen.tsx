import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Layout, Text, Spinner } from '@ui-kitten/components';
import { router, useLocalSearchParams } from 'expo-router';
import { useShareIntentContext } from 'expo-share-intent';
import * as ImageManipulator from 'expo-image-manipulator';
import { expenseService } from '../services/expenseService';
import { Ionicons } from '@expo/vector-icons';

const ShareIntentScreen = () => {
  const { resetShareIntent } = useShareIntentContext();
  const { sharedFilePath } = useLocalSearchParams<{ sharedFilePath: string }>();
  const [statusMessage, setStatusMessage] = useState('Analizando imagen del ticket...');
  const [subTextMessage, setSubTextMessage] = useState(
    'Estamos extrayendo el monto y los datos del comprobante.'
  );
  const [hasError, setHasError] = useState(false);
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processSharedImage = async () => {
      try {
        console.log('Archivo recibido desde los parámetros:', sharedFilePath);

        if (!sharedFilePath) {
          setStatusMessage('Ha ocurrido un error al procesar la imagen.');
          setSubTextMessage('No se recibió ninguna imagen válida.');
          setHasError(true);
          return;
        }

        // 1. Redimensionar y comprimir la imagen para optimizar el procesamiento
        setStatusMessage('Optimizando imagen...');
        setSubTextMessage('Estamos extrayendo el monto y los datos del comprobante.');
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          sharedFilePath,
          [{ resize: { width: 800 } }], // Redimensionar a 800px de ancho manteniendo el aspect ratio
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        // 2. Enviar al backend para análisis con Gemini
        setStatusMessage('Analizando imagen...');
        const analysisResponse = await expenseService.analyzeReceipt(manipulatedImage.uri);

        if (!analysisResponse.amount || analysisResponse.amount <= 0) {
          setStatusMessage('Ha ocurrido un error al procesar la imagen.');
          setSubTextMessage(
            'No pudimos extraer el monto de la imagen. Por favor, intentá de nuevo con otra foto más clara.'
          );
          setHasError(true);
          return;
        }

        setStatusMessage('¡Datos extraídos con éxito!');

        // 3. Viajamos a la pantalla de agregar movimiento con los datos extraídos
        router.replace({
          pathname: '/(app)/add-movement',
          params: {
            fromShareIntent: 'true',
            amount: analysisResponse.amount.toString(),
            title: analysisResponse.title || '',
            category: analysisResponse.category || 'OTHER',
            date: analysisResponse.date || new Date().toISOString().split('T')[0],
            imagePath: manipulatedImage.uri,
          },
        });
      } catch (error) {
        console.error('Error procesando la imagen:', error);
        setStatusMessage('Ha ocurrido un error al procesar la imagen.');
        setSubTextMessage(
          'Podés volver atrás utilizando la cruz de arriba a la derecha para intentar nuevamente.'
        );
        setHasError(true);
      } finally {
        resetShareIntent();
      }
    };

    processSharedImage();
  }, [sharedFilePath]);

  return (
    <Layout style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.subHeader}>
          <Text category="h4" style={styles.title}>
            Procesando Gasto
          </Text>
          <TouchableOpacity
            onPress={() => {
              try {
                resetShareIntent();
              } catch (e) {
                console.warn('resetShareIntent failed:', e);
              }
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/(app)/home');
              }
            }}
          >
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* CONTENIDO DE CARGA */}
        <View style={styles.loadingContainer}>
          {hasError ? (
            <Ionicons name="alert-circle" size={64} color="#E53935" />
          ) : (
            <Spinner size="large" status="primary" />
          )}
          <Text category="s1" style={styles.statusText}>
            {statusMessage}
          </Text>
          <Text category="p2" style={styles.subText}>
            {subTextMessage}
          </Text>
        </View>
      </ScrollView>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F2FC',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontWeight: 'bold',
    color: '#003366',
    fontSize: 24,
  },
  closeButton: {
    fontSize: 24,
    color: '#7f8c8d',
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  statusText: {
    marginTop: 20,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#003366',
    fontSize: 18,
  },
  subText: {
    marginTop: 8,
    textAlign: 'center',
    color: '#006699',
    paddingHorizontal: 20,
    fontSize: 16,
  },
});

export default ShareIntentScreen;
