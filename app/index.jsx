import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function Index() {
  const router = useRouter();
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [qrData, setQrData] = useState('');
  const [qrList, setQrList] = useState([]);

  // Load saved QR list from AsyncStorage when component mounts
  useEffect(() => {
    const loadQrList = async () => {
      try {
        const storedQrList = await AsyncStorage.getItem('qrList');
        if (storedQrList) {
          setQrList(JSON.parse(storedQrList));
        }
      } catch (error) {
        console.error('Erro ao carregar qrList do AsyncStorage:', error);
      }
    };
    loadQrList();
  }, []);

  // Save QR list to AsyncStorage whenever it changes
  useEffect(() => {
    const saveQrList = async () => {
      try {
        await AsyncStorage.setItem('qrList', JSON.stringify(qrList));
      } catch (error) {
        console.error('Erro ao salvar qrList no AsyncStorage:', error);
      }
    };
    saveQrList();
  }, [qrList]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Precisamos da sua permissão para usar a câmera.
        </Text>
        <Button onPress={requestPermission} title="Conceder permissão" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  // Add timestamp when storing the scanned QR code
  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    setQrData(data);
    const qrEntry = { url: data, timestamp: new Date().toLocaleString() };
    setQrList((prevList) => [...prevList, qrEntry]);
    Alert.alert('QR Code Escaneado', `Conteúdo: ${data}`, [
      { text: 'OK', onPress: () => console.log('OK pressed') },
    ]);
  };

  const irParaHistorico = () => {
    router.push({
      pathname: '/historico',
      params: {
        qrList: JSON.stringify(qrList),
      },
    });
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Floating button to flip camera */}
      <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
        <Ionicons name="camera-reverse" size={30} color="white" />
      </TouchableOpacity>

      <View style={styles.controles}>
        <TouchableOpacity style={styles.button} onPress={irParaHistorico}>
          <Text style={styles.text}>Ver Histórico</Text>
        </TouchableOpacity>
        {scanned && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.text}>Escanear Novamente</Text>
          </TouchableOpacity>
        )}
      </View>

      {qrData !== '' && (
        <View style={styles.result}>
          <Text style={styles.resultText}>{qrData}</Text>
        </View>
      )}

      {/* QR Code Counter */}
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          Total de QR Codes: {qrList.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  controles: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  flipButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 50,
    padding: 10,
  },
  result: {
    position: 'absolute',
    top: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 10,
    borderRadius: 5,
  },
  resultText: {
    fontSize: 16,
    color: '#000',
  },
  counterContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'yellow',
    padding: 5,
    borderRadius: 5,
  },
  counterText: {
    fontSize: 16,
    color: '#555',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
});
