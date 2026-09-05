import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, Dimensions, Modal, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import { API_PREDICT_URL } from './apiConfig';

const { width } = Dimensions.get('window');

export default function Scan() {
  const router = useRouter();
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [modelType, setModelType] = useState('ViT');

  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) {
        router.replace('/login');
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const checkPendingResult = async () => {
      try {
        const result = await ImagePicker.getPendingResultAsync();
        if (result && result.length > 0) {
          const lastResult = result[result.length - 1];
          if (!lastResult.canceled && lastResult.assets && lastResult.assets.length > 0) {
            setImage(lastResult.assets[0]);
          }
        }
      } catch (error) {
        console.error("Error picking pending image result:", error);
      }
    };
    
    checkPendingResult();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };
 
  const takePhoto = async () => {
    if (!permission) {
      // Permission is still loading
      return;
    }

    if (!permission.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert("Permission Error", "Camera access is required to take retinal photos.");
        return;
      }
    }

    setCameraVisible(true);
  };

  const captureCameraImage = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
          base64: false,
          exif: false,
        });
        setImage({ uri: photo.uri });
        setCameraVisible(false);
      } catch (error) {
        Alert.alert("Error", "Failed to capture photo");
        console.error(error);
      }
    }
  };

  const uploadAndAnalyze = async () => {
    if (!image) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', {
        uri: image.uri,
        name: 'scan.jpg',
        type: 'image/jpeg'
      });
      formData.append('model', modelType);

      const token = await SecureStore.getItemAsync('userToken');
      const response = await axios.post(API_PREDICT_URL, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Token ${token}`
        },
      });

      setLoading(false);
      router.push({
        pathname: '/results',
        params: {
          ...response.data,
          probabilities: JSON.stringify(response.data.probabilities),
          model_used: response.data.model_used
        }
      });

    } catch (error) {
      setLoading(false);
      
      const errorMsg = error.response?.data?.error || 'Could not connect to the AI engine. Ensure your backend is running.';
      const isValidationError = error.response?.status === 422;

      Alert.alert(
        isValidationError ? 'Invalid Image' : 'Analysis Failed',
        errorMsg
      );
      
      if (isValidationError) {
        setImage(null); // Clear invalid image
      }
    }
  };

  return (
    <>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Retinal Analysis</Text>
          <Text style={styles.headerSubtitle}>Upload or take a clear fundus image</Text>
        </View>

        {/* AI Model Selection */}
        <View style={styles.modelSelectionContainer}>
          <Text style={styles.sectionLabel}>AI Detection Engine</Text>
          <View style={styles.modelToggleRow}>
            <TouchableOpacity 
              activeOpacity={0.7}
              style={[styles.modelTab, styles.modelTabActive]} 
              onPress={() => setModelType('ViT')}
            >
              <View style={[styles.modelTabCircle, styles.modelTabCircleActive]}>
                <Text style={styles.modelTabEmoji}>⚡</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modelTabText, styles.modelTabTextActive]}>
                  Vision Transformer (ViT)
                </Text>
                <Text style={styles.modelTabSub}>Advanced attention-based screening</Text>
              </View>
              <View style={[styles.radioCircle, styles.radioCircleActive]}>
                <View style={styles.radioDot} />
              </View>
            </TouchableOpacity>

            {/* ResNet CNN Model Option Commented Out - ViT is the exclusive model */}
            {/* 
            <TouchableOpacity 
              activeOpacity={0.7}
              style={[styles.modelTab, modelType === 'ResNet' && styles.modelTabActive]} 
              onPress={() => setModelType('ResNet')}
            >
              <View style={[styles.modelTabCircle, modelType === 'ResNet' && styles.modelTabCircleActive]}>
                <Text style={styles.modelTabEmoji}>🧠</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modelTabText, modelType === 'ResNet' && styles.modelTabTextActive]}>
                  ResNet CNN
                </Text>
                <Text style={styles.modelTabSub}>Standard convolutional deep architecture</Text>
              </View>
              <View style={[styles.radioCircle, modelType === 'ResNet' && styles.radioCircleActive]}>
                {modelType === 'ResNet' && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
            */}
          </View>
        </View>

        {!image ? (
          <View style={styles.uploadContainer}>
            <TouchableOpacity style={styles.uploadCard} onPress={pickImage}>
              <LinearGradient colors={['#fff', '#f8fafc']} style={styles.cardGradient}>
                <View style={styles.iconCircle}>
                  <Text style={styles.iconEmji}>🖼️</Text>
                </View>
                <Text style={styles.cardTitle}>Gallery</Text>
                <Text style={styles.cardDesc}>Select an existing image</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadCard} onPress={takePhoto}>
              <LinearGradient colors={['#fff', '#f8fafc']} style={styles.cardGradient}>
                <View style={[styles.iconCircle, { backgroundColor: '#E6F4FE' }]}>
                  <Text style={styles.iconEmji}>📸</Text>
                </View>
                <Text style={styles.cardTitle}>Camera</Text>
                <Text style={styles.cardDesc}>Capture new scan</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.previewSection}>
            <View style={styles.imageFrame}>
              <Image source={{ uri: image.uri }} style={styles.previewImage} />
            </View>
            
            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color="#005b9f" />
                <Text style={styles.loadingText}>Processing through AI...</Text>
              </View>
            ) : (
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.secondaryBtn} onPress={() => setImage(null)}>
                  <Text style={styles.secondaryBtnText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryBtn} onPress={uploadAndAnalyze}>
                  <Text style={styles.primaryBtnText}>Analyze Now</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <Modal visible={cameraVisible} animationType="slide">
        <View style={styles.cameraContainer}>
          <CameraView 
            ref={cameraRef}
            style={styles.camera} facing="back">
            <View style={styles.cameraOverlay}>
              <TouchableOpacity style={styles.closeCamera} onPress={() => setCameraVisible(false)}>
                <Text style={styles.closeCameraText}>✕</Text>
              </TouchableOpacity>
              
              <View style={styles.captureContainer}>
                <TouchableOpacity 
                  style={styles.captureBtn} 
                  onPress={captureCameraImage}
                >
                  <View style={styles.captureInner} />
                </TouchableOpacity>
              </View>
            </View>
          </CameraView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#718096',
    marginTop: 4,
  },
  uploadContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  uploadCard: {
    width: '48%',
    height: 180,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardGradient: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F7FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconEmji: {
    fontSize: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  cardDesc: {
    fontSize: 12,
    color: '#a0aec0',
    marginTop: 4,
    textAlign: 'center',
  },
  previewSection: {
    flex: 1,
    alignItems: 'center',
  },
  imageFrame: {
    padding: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 40,
  },
  previewImage: {
    width: width - 80,
    height: width - 80,
    borderRadius: 20,
  },
  actionRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 16,
  },
  primaryBtn: {
    flex: 2,
    backgroundColor: '#005b9f',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  secondaryBtnText: {
    color: '#4a5568',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingBox: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#005b9f',
    fontWeight: '500',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    padding: 30,
  },
  closeCamera: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  closeCameraText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  captureContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  modelSelectionContainer: {
    marginBottom: 26,
    backgroundColor: '#fff',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#718096',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  modelToggleRow: {
    flexDirection: 'column',
    gap: 10,
  },
  modelTab: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  modelTabActive: {
    backgroundColor: '#e6f4fe',
    borderColor: '#005b9f',
  },
  modelTabCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#edf2f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modelTabCircleActive: {
    backgroundColor: '#d0e8ff',
  },
  modelTabEmoji: {
    fontSize: 18,
  },
  modelTabText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4a5568',
  },
  modelTabTextActive: {
    color: '#005b9f',
  },
  modelTabSub: {
    fontSize: 11,
    color: '#718096',
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  radioCircleActive: {
    borderColor: '#005b9f',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#005b9f',
  }
});
