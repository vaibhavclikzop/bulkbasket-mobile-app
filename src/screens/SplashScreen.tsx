import React, { useEffect } from "react";
import { View, StyleSheet, Image, StatusBar } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SplashScreen = ({ navigation }: any) => {
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");

        setTimeout(() => {
          if (token) {
            navigation.replace("Home");
          } else {
            navigation.replace("Signup");
          }
        }, 2000);
      } catch (error) {
        navigation.replace("Signup");
      }
    };

    checkLogin();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#487D44" barStyle="light-content" />

      <Image
        source={require("../assets/images/logo-white.png")}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#487D44",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 91.24,
    height: 143,
  },
});
