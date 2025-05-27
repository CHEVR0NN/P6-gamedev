import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useEffect, useRef, useState } from 'react';
import { Animated, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import wordListData from '../assets/wordlist.json';

const ANIMATION_DURATION = 15;

export default function GameScreen() {
  const { name } = useLocalSearchParams();
  const [prompt, setPrompt] = useState('');
  const [input, setInput] = useState('');
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  const [wordSet] = useState(() => new Set(wordListData.map(w => w.trim().toLowerCase())));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [passesLeft, setPassesLeft] = useState(3);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [lottieKey, setLottieKey] = useState(0);
  const [animationDone, setAnimationDone] = useState(false)
  const [timeLeft, setTimeLeft] = useState(ANIMATION_DURATION);
  const animationRef = useRef<LottieView>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseRef = useRef<Animated.CompositeAnimation | null>(null);


  const getPrefixes = (words: string[]) => {
    const prefixSet = new Set<string>();
    words.forEach(word => {
      if (word.length >= 2 && /^[a-zA-Z]{2}$/.test(word.slice(0, 2))) {
        prefixSet.add(word.slice(0, 2).toLowerCase());
      }
    });
    return Array.from(prefixSet);
  };

  const prefixes = getPrefixes(wordListData);
  const easyChars = ['a', 'e', 'i', 'o', 'u', 's', 't', 'r', 'n', 'l'];

  const generatePrompt = () => {
    if (Math.random() < 0.5) {
      const randomIndex = Math.floor(Math.random() * prefixes.length);
      return prefixes[randomIndex];
    } else {
      let char1 = easyChars[Math.floor(Math.random() * easyChars.length)];
      let char2 = easyChars[Math.floor(Math.random() * easyChars.length)];
      return char1 + char2;
    }
  };

  const resetTimer = () => {
    setTimeLeft(ANIMATION_DURATION);
    setAnimationDone(false);
    animationRef.current?.reset();
    animationRef.current?.play();
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    if (gameOver) return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [prompt]);


  const handleSubmit = () => {
    const word = input.trim().toLowerCase();
    const sub = prompt.toLowerCase();
    if (
      word.length >= 3 &&
      word.includes(sub) &&
      wordSet.has(word) &&
      !usedWords.has(word)
    ) {
      setUsedWords(prev => new Set(prev).add(word));
      setScore(prev => prev + 1);
      setInput('');
      setPrompt(generatePrompt());
      resetTimer();
    } else {
      setInput('');
    }
  };

  useEffect(() => {
    setPrompt(generatePrompt());
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handlePass = () => {
    if (passesLeft > 0 && !gameOver) {
      setPrompt(generatePrompt());
      setInput('');
      setPassesLeft(prev => prev - 1);
      resetTimer();
    }
  };

  const handleRetry = () => {
    setScore(0);
    setUsedWords(new Set());
    setPrompt(generatePrompt());
    setInput('');
    setTimeLeft(ANIMATION_DURATION);
    setGameOver(false);
    setPassesLeft(3);
    resetTimer();
  };

  const startPulse = (duration: number) => {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ])
    );
  };

  useEffect(() => {
    if (pulseRef.current) {
      pulseRef.current.stop();
    }

    const duration = timeLeft <= 5 ? 400 : 500;
    pulseRef.current = startPulse(duration);
    pulseRef.current.start();

    return () => {
      pulseRef.current?.stop();
    };
  }, [timeLeft]);
  
  const saveScore = async () => {
    if (!name) return;
    try {
      const newScore = { name, score };
      const storedScores = await AsyncStorage.getItem('leaderboard');
      const scores = storedScores ? JSON.parse(storedScores) : [];
      scores.push(newScore);
      await AsyncStorage.setItem('leaderboard', JSON.stringify(scores));
    } catch (error) {
      console.error('Failed to save score:', error);
    }
  };

  useEffect(() => {
    if (gameOver) {
      saveScore();
    }
  }, [gameOver]);



   if (gameOver) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Game Over</Text>
        <Text style={styles.subtitle}>Score: {score}</Text>
        <TouchableOpacity style={styles.button} onPress={handleRetry}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => router.replace('/')}>
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }


  return (
    <ImageBackground source={require('../assets/images/gamebg3.jpg')} style={styles.container} resizeMode="cover">
      <Text style={styles.score}>Score: {score}</Text>
      <View style={{ alignItems: 'center' }}>
        <View style={styles.timerWrapper}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <LottieView
              key={lottieKey}
              ref={animationRef}
              source={require('../assets/animatedtimer.json')}
              autoPlay
              loop={false}
              style={{ width: 200, height: 200 }}
            />
          </Animated.View>
        </View>
      </View>

      <Text style={styles.instruction}>Enter an english word containing: </Text>

      <Text style={styles.prompt}>
        <Text style={styles.promptHighlight}>{prompt}</Text>
      </Text>

      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        onSubmitEditing={handleSubmit}
        placeholderTextColor="#999"
        autoCapitalize="none"
      />
      <View style={styles.buttons}>
        
        <TouchableOpacity
          style={[styles.passbtn, { backgroundColor: passesLeft > 0 ? '#ffa61d' : '#a8a9a9' }]}
          onPress={handlePass}
          disabled={passesLeft === 0}
        >
        <Text style={styles.buttonText}>Pass [{passesLeft} left]</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitbtn} onPress={handleSubmit}>
          <Text style={styles.submitbtntxt}>Submit</Text>
        </TouchableOpacity>

      </View>
      
      <View style={{ alignItems: 'center', marginTop: 120 }}/>
    </ImageBackground>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 16,
    
  },
  prompt: {
    fontSize: 35,
    color: '#aaa',
    marginBottom: 2,
  },
  promptHighlight: {
    color: '#bd111a',
    fontWeight: 'bold',
    
  },
  timer: {
    fontSize: 20,
    color: '#3d7eff',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    height: 50,
    paddingHorizontal: 16,
    fontSize: 18,
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
    borderBottomColor: '#444',
    borderBottomWidth: 2,
  },
  submitbtn: {
    width: '40%',
    height: 50,
    backgroundColor: '#a70710',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  submitbtntxt: {
    color: '#fff',
    fontSize: 23,
    fontWeight: '600',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 2,
    transform: [{ perspective: 100 }, { rotateX: '5deg' }],
  },
  passbtn: {
    width: '40%',
    height: 50,
    backgroundColor: '#fc000c',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#3d7eff',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 23,
    fontWeight: '600',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 2,
    transform: [{ perspective: 100 }, { rotateX: '5deg' }],
  },
  score: {
    fontSize: 18,
    color: '#aaa',
  },
  subtitle: {
    fontSize: 20,
    color: '#aaa',
    marginBottom: 20,
  },
  timerWrapper: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
  },
  buttons: {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
  },
});
