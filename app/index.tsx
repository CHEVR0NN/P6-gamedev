import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

export default function Index() {
  const [playerName, setPlayerName] = useState('');
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleStart = async () => {
    await AsyncStorage.setItem("playerName", playerName);
    router.push({ pathname: '/game', params: { name: playerName } });
  };

  const handleLeaderboards = () => {
    router.push('/leaderboards');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      {/* <Animated.Text
        style={[
          styles.title,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        Word Bomb
      </Animated.Text> */}

      <Image source={require('../assets/images/logo.png')} style={{ width: 300, height: 300 }} />

      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        placeholderTextColor="#999"
        value={playerName}
        onChangeText={setPlayerName}
      />

      <TouchableOpacity
        style={[styles.button, playerName ? styles.active : styles.disabled]}
        onPress={handleStart}
        disabled={!playerName}
      >
        <Text style={styles.buttonText}>Start</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.leaderboard]} onPress={handleLeaderboards}>
        <Text style={styles.buttonText}>Leaderboards</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.instruction]} onPress={() => router.push('/instructions')}>
        <Text style={styles.buttonText}>Instructions</Text>
      </TouchableOpacity>

    </KeyboardAvoidingView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e4e2e2',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  input: {
    width: '100%',
    height: 50,
    // backgroundColor: '#222',
    // borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 20,
    color: '#2b2b2b',
    marginBottom: 20,
    borderBottomColor: '#444',
    borderBottomWidth: 2,
    fontFamily: 'Baskerville',
    textAlign: 'center',
    fontWeight: '600',
    textShadowColor: '#fff',
  },
  button: {
    width: '100%',
    height: 50,
    // borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    // borderWidth: 2,
    // borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  active: {
    backgroundColor: '#a70710',
  },
  disabled: {
    backgroundColor: '#010100',
  },
  leaderboard: {
    backgroundColor: '#12689c',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 2,
    transform: [{ perspective: 100 }, { rotateX: '5deg' }],
  },
  instruction: {
    backgroundColor: '#ffa61d',
  },
});
