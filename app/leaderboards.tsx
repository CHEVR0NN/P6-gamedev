import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Score = {
  name: string;
  score: number;
};

export default function Leaderboards() {
  const [scores, setScores] = useState<Score[]>([]);
  const [playerName, setPlayerName] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const fetchScoresAndName = async () => {
      try {
        const storedScores = await AsyncStorage.getItem("leaderboard");
        if (storedScores) {
          const parsedScores: Score[] = JSON.parse(storedScores);
          const sortedScores = parsedScores.sort((a, b) => b.score - a.score).slice(0, 10);
          setScores(sortedScores);
        }

        const storedName = await AsyncStorage.getItem("playerName");
        if (storedName) {
          setPlayerName(storedName);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchScoresAndName();
  }, []);

  const renderItem = ({ item, index }: { item: Score; index: number }) => (
    <View style={styles.record}>
      <Text style={styles.rank}>{index + 1}</Text>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.score}>{item.score}</Text>
    </View>
  );

  return (
    <ImageBackground
      source={require("../assets/images/gamebg2.jpg")}
      style={styles.container}
      resizeMode="cover"
    >
      <TouchableOpacity style={styles.backButton} onPress={() => router.push("/")}>
        <Text style={styles.backImage}>←</Text>
      </TouchableOpacity>

      <View style={styles.container}>
        <Text style={styles.title}>Leaderboards</Text>
        <FlatList
          data={scores}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>No records yet!</Text>}
        />
        {playerName ? (
          <Text style={{ textAlign: "center", color: "#12689c", marginBottom: 10 }}>
            You are logged in as: <Text style={{ fontWeight: "bold" }}>{playerName}</Text>
          </Text>
        ) : null}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 35,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#5e0d30",
    marginTop: 70,
    fontFamily: "PixelifySans",
  },
  record: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  rank: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ff4a4a",
    fontFamily: "PixelifySans",
  },
  name: {
    fontSize: 18,
    color: "#555",
    flex: 1,
    textAlign: "left",
    marginLeft: 20,
    fontFamily: "PixelifySans",
  },
  score: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    fontFamily: "PixelifySans",
  },
  empty: {
    textAlign: "center",
    fontSize: 18,
    color: "#aaa",
    marginTop: 50,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backImage: {
    width: 40,
    height: 40,
  },
});
