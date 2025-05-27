import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function InstructionsScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[
          styles.title,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        How to Play
      </Animated.Text>
      <View style={styles.instructionsBox}>
        <Text style={styles.instructions}>
          1. You will be given a random 2-letter prompt.{'\n\n'}
          2. Type a valid english word that contains the prompt.{'\n\n'}
          3. Each correct word gives you a point and a new prompt.{'\n\n'}
          4. You have limited time for each word—watch the timer!{'\n\n'}
          5. You can pass up to 3 times per game.{'\n\n'}
          6. No repeats! Each word can only be used once.
        </Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e4e2e2',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#a70710',
    marginBottom: 24,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontFamily: 'Baskerville',
  },
  instructionsBox: {
    backgroundColor: '#12689c',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    borderBottomLeftRadius: 0,
  },
  instructions: {
    color: '#e4e2e2',
    fontSize: 20,
    lineHeight: 28,
    textAlign: 'left',
    fontWeight: '400',
  },
  button: {
    backgroundColor: '#ffa61d',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
});
