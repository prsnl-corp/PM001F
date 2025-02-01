import { View, Text, Platform, StyleSheet } from "react-native";
import { useCallback } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as CONST from "../app/common/const";

const top = () => {
  const navigation = useNavigation();
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === "web") {
        const params = {
          user: "00000002",
          year: null,
          month: null,
        };

        const requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        };
        fetch("http://localhost:5001/getAtndData", requestOptions)
          .then((res) => res.json())
          .then((json) => {
            navigation.replace("(tabs)", {
              screen: "index",
              params: {
                allDiligenceData: JSON.stringify(json),
              },
            });
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
          });
      } else {
        setTimeout(() => {
          navigation.replace("(tabs)", {
            screen: "index",
            params: {
              allDiligenceData: JSON.stringify(CONST.DUMMY_DATA),
            },
          });
        }, 100);
      }
    }, [])
  );

  return (
    <LinearGradient colors={["#39D2F8", "#306160"]} style={styles.container}>
      <Text style={styles.text}>Hello, Gradient Background!</Text>
    </LinearGradient>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
});

export default top;
