import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Layout, Text, Spinner } from '@ui-kitten/components';
import { router, useLocalSearchParams } from 'expo-router';
import { useShareIntentContext } from 'expo-share-intent';
import * as ImageManipulator from 'expo-image-manipulator';
import { expenseService } from '../services/expenseService';

const ShareIntentScreen = () => {
  const { resetShareIntent } = useShareIntentContext();
  const { sharedFilePath } = useLocalSearchParams<{ sharedFilePath: string }>();
  const [statusMessage, setStatusMessage] = useState('Analizando imagen del ticket...');
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processSharedImage = async () => {
      try {
        console.log('Archivo recibido desde los parámetros:', sharedFilePath);

        if (!sharedFilePath) {
          setStatusMessage('No se recibió ninguna imagen válida.');
          return;
        }

        // 1. Redimensionar y comprimir la imagen para optimizar el procesamiento
        setStatusMessage('Optimizando imagen...');
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          sharedFilePath,
          [{ resize: { width: 800 } }], // Redimensionar a 800px de ancho manteniendo el aspect ratio
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );

        // 2. Enviar al backend para análisis con Gemini
        setStatusMessage('Analizando imagen...');
        const analysisResponse = await expenseService.analyzeReceipt(manipulatedImage.uri);

        setStatusMessage('¡Datos extraídos con éxito!');

        // 3. Viajamos a la pantalla de agregar gasto con los datos extraídos
        router.replace({
          pathname: '/(app)/add-expense',
          params: {
            fromShareIntent: 'true',
            amount: analysisResponse.amount?.toString() || '',
            description: analysisResponse.description || '',
            category: analysisResponse.category || 'OTHER',
            date: analysisResponse.date || new Date().toISOString().split('T')[0],
            imagePath: manipulatedImage.uri,
          },
        });
      } catch (error) {
        console.error('Error procesando la imagen:', error);
        setStatusMessage('Error al procesar la imagen.');
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
