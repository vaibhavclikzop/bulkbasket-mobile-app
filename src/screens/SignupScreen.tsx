import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import COLORS from "../components/Styles";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import axios from "axios";
import { BASE_URL } from "../services/api";
// import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

type Props = NativeStackScreenProps<RootStackParamList, "Signup">;

const SignupScreen: React.FC<Props> = ({ navigation }) => {
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const { width, height } = useWindowDimensions();
  const handleContinue = async () => {
    if (mobile.trim().length !== 10) {
      Alert.alert("Error", "Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("number", mobile);
      const response = await axios.post(`${BASE_URL}/send-otp`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("response", response.data);

      if (response.data.error === false) {
        Alert.alert("Success", response.data.message);
        navigation.navigate("OTP", { mobile });
      }
    } catch (error: any) {
      console.log("OTP Error:", error);
      Alert.alert("Error", "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/1login-bg.png")}
      style={styles.background}
      resizeMode="stretch"
    >
      <View style={styles.overlay} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "android" ? 2 : 0}
      >
        <SafeAreaView edges={["top"]} style={[styles.container, { flex: 1 }]}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/images/full-logo-white.png")}
              style={styles.logo}
              resizeMode="cover"
            />
            <Text style={styles.tagline}>
              One stop solution for HoReCa Supplies
            </Text>
          </View>
          {/* Bottom Card */}
          <View style={[styles.card, { marginBottom: 0 }]}>
            <Text style={styles.heading}>
              End-to-end wholesale supply{"\n"}
              for HoReCa businesses
            </Text>
            {/* Mobile Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.countryCode}>🇮🇳 +91</Text>
              <TextInput
                placeholder="Enter Mobile Number"
                value={mobile}
                maxLength={10}
                keyboardType="number-pad"
                onChangeText={(val) => setMobile(val.replace(/[^0-9]/g, ""))}
                style={styles.input}
              />
            </View>
            {/* Continue Button */}
            <TouchableOpacity style={styles.button} onPress={handleContinue}>
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Continue</Text>
              )}
            </TouchableOpacity>
            {/* <View>
              <Text style={styles.taglineBottom}>
                Already have an account?{" "}
                <Text
                  style={styles.loginText}
                  onPress={() => navigation.navigate("Login")}
                >
                  Log In
                </Text>
              </Text>
            </View> */}
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  logoContainer: {
    marginTop: 80,
    alignItems: "center",
  },
  logo: {
    width: 300,
    height: 80,
    aspectRatio: 4,
  },
  tagline: {
    color: "#fff",
    marginLeft: 25,
    fontFamily: "DMSans-Regular",
    fontSize: 13,
    includeFontPadding: false,
    textAlignVertical: "center",
    marginTop: -4,
  },
  taglineBottom: {
    color: "#000",
    fontSize: 12,
    textAlign: "center",
    fontFamily: "DMSans-Regular",
  },
  card: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: Platform.OS === "ios" ? 35 : 35,
  },
  heading: {
    textAlign: "center",
    fontSize: 20,
    marginBottom: 20,
    fontWeight: "500", // ✅ FIXED
    fontFamily: "DMSans-Medium",
    color: COLORS.headerText,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  countryCode: {
    marginRight: 8,
    fontSize: 14,
    fontFamily: "DMSans-Regular",
  },
  input: {
    flex: 1,
    height: 45,
    fontFamily: "DMSans-Regular",
  },
  signup: {
    textAlign: "right",
    fontSize: 12,
    color: "#487D44",
    marginTop: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#487D44",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "DMSans-Medium",
  },
  loginText: {
    color: "#487D44",
    textDecorationLine: "underline",
    fontFamily: "DMSans-Regular",
    fontSize: 12,
  },
});
