import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Linking, Share } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function Historico() {
  const { qrList } = useLocalSearchParams();
  const [qrListArray, setQrListArray] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (qrList) {
      setQrListArray(JSON.parse(qrList));
    } else {
      setQrListArray([]);
    }
  }, [qrList]);

  const limparHistorico = () => {
    setQrListArray([]);
  };

  const renderItem = ({ item, index }) => {
    const { url, timestamp } = item;
    const isValidURL = url.startsWith('http');
    return (
      <View style={styles.listItem}>
        <Text
          style={[
            styles.listText,
            isValidURL && { color: 'blue', textDecorationLine: 'underline' },
          ]}
          onPress={() => {
            if (isValidURL) {
              Linking.openURL(url);
            }
          }}
          onLongPress={() => Share.share({ message: url })}
        >
          {index + 1}. {url}
          {'\n'}
          <Text style={styles.timestampText}>{timestamp}</Text>
        </Text>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.historyContainer,
        darkMode && { backgroundColor: '#000' },
      ]}
    >
      <Text style={[styles.historyTitle, darkMode && { color: '#fff' }]}>
        Histórico de QR Codes Escaneados
      </Text>
      <FlatList
        data={qrListArray}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={
          <Text style={darkMode && { color: '#fff' }}>
            Nenhum QR Code escaneado ainda
          </Text>
        }
      />
      <View style={styles.buttonContainer}>
        <Button title="Limpar Histórico" onPress={limparHistorico} color="red" />
        <Button
          title={darkMode ? 'Tema Claro' : 'Tema Escuro'}
          onPress={() => setDarkMode(!darkMode)}
          color={darkMode ? 'white' : 'black'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  historyContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  historyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  listItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  listText: {
    fontSize: 16,
  },
  timestampText: {
    fontSize: 12,
    color: '#888',
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
