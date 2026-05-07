import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { userService } from '../services/userService';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  avatarUrl?: string;
  onUploaded: (url: string) => void;
}

const AvatarUploader: React.FC<Props> = ({ avatarUrl, onUploaded }) => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(avatarUrl ?? null);

  const pickAndUpload = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setPreview(uri);
    await upload(uri);
  };

  const upload = async (uri: string) => {
    try {
      setLoading(true);

      const formData = new FormData();

      formData.append('file', {
        uri,
        name: 'avatar.jpg',
        type: 'image/jpeg',
      } as any);

      const data = await userService.uploadAvatar(formData);
      const url = data.avatarUrl;
      onUploaded(url);
      setPreview(url);
    } catch (e) {
      console.error('Error uploading avatar', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity onPress={pickAndUpload} style={styles.container}>
      <View style={styles.avatar}>
        {preview ? (
          <Image source={{ uri: preview }} style={styles.image} />
        ) : (
          <Ionicons name="person" size={64} color="#5bbfdd" />
        )}

        {loading && (
          <View style={styles.loading}>
            <ActivityIndicator color="#fff" />
          </View>
        )}
      </View>

      <View style={styles.camera}>
        <Ionicons name="camera" size={16} color="#fff" />
      </View>
    </TouchableOpacity>
  );
};

const SIZE = 90;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    overflow: 'hidden',
    backgroundColor: '#E6F2FC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#07a3e4',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  camera: {
    position: 'absolute',
    bottom: 0,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFBB00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AvatarUploader;
