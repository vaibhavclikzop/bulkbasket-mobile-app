import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  StatusBar,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "../components/Styles";
import axios from "axios";
import { BASE_URL, getCompanyProfileApi } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<RootStackParamList, "OTP">;

const OTPScreen: React.FC<Props> = ({ navigation, route }) => {
  const { mobile } = route.params;
  const [loading, setLoading] = useState(false);

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputs.current[0]?.focus();
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (text: string, index: number) => {
    if (!/^[0-9]?$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (otp.some((digit) => digit === "")) {
      Alert.alert("Error", "Please enter the complete 6-digit OTP");
      return;
    }

    const finalOtp = otp.join("");

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("number", mobile);
      formData.append("otp", finalOtp);

      const response = await axios.post(`${BASE_URL}/verify-otp`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("OTP Verify Response:", response.data);

      if (response.data.error === false) {
        const token = response.data.token;

        Alert.alert("Success", response.data.message);

        await AsyncStorage.setItem("userToken", token);

        await getCompanyProfile();
      } else {
        Alert.alert("Error", response.data.message || "Invalid OTP");
      }
    } catch (error: any) {
      console.log("OTP Verify Error:", error.response?.data || error.message);
      Alert.alert("Error", "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const getCompanyProfile = async () => {
    try {
      const response = await getCompanyProfileApi();
      const data = response?.data;
      console.log("Get Company Api Data :-------->", data);
      if (!data?.gst) {
        navigation.navigate("SignupSetUp");
      } else {
        navigation.navigate("Home");
      }
    } catch (error) {
      console.log("Get Profile Error:", error);
    }
  };

  // Removed redundant getCompanyProfile call on mount
  /*
  useEffect(() => {
    getCompanyProfile();
  }, []);
  */

  const handleResendOtp = async () => {
    try {
      const formData = new FormData();
      formData.append("number", mobile);
      //   return;
      const response = await axios.post(`${BASE_URL}/send-otp`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("response", response.data);

      if (response.data.error === false) {
        Alert.alert("Success", response.data.message);
      }
    } catch (error: any) {
      console.log("OTP Error:", error);
      Alert.alert("Error", "Failed to send OTP");
    }
  };

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#ffffff"
        translucent={false}
      />

      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={Styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require("../assets/Common/Back.png")}
              style={Styles.headerImage}
            />
          </TouchableOpacity>

          <Text style={Styles.headerText}>OTP Verification</Text>
        </View>

        <Text style={[Styles.headerText, { marginTop: 25 }]}>Enter OTP</Text>

        <Text style={[Styles.SubTitle, { marginTop: 12 }]}>
          6 digit OTP has been sent to {mobile}
        </Text>

        {/* OTP Boxes */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputs.current[index] = ref;
              }}
              style={styles.otpBox}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={({ nativeEvent }) => {
                if (
                  nativeEvent.key === "Backspace" &&
                  otp[index] === "" &&
                  index > 0
                ) {
                  inputs.current[index - 1]?.focus();
                }
              }}
            />
          ))}
        </View>

        <Text
          style={[Styles.SemiBoldTitle, { marginTop: 15, marginBottom: 8 }]}
        >
          00:30
        </Text>

        {/* Resend */}
        <View style={{ flexDirection: "row", marginBottom: 30 }}>
          <Text style={styles.resend}>Didn’t receive OTP ? </Text>

          <TouchableOpacity onPress={handleResendOtp}>
            <Text style={{ color: "#487D44", fontFamily: "DMSans-SemiBold" }}>
              Resend now
            </Text>
          </TouchableOpacity>
        </View>

        {/* Verify Button */}
        <TouchableOpacity style={styles.button} onPress={handleVerify}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={Styles.buttonText}>Verify</Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </>
  );
};

export default OTPScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffff",
    paddingHorizontal: 15,
  },

  otpContainer: {
    flexDirection: "row",
    marginVertical: 40,
    justifyContent: "space-between",
    width: "90%",
  },

  otpBox: {
    width: 48,
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 14,
    textAlign: "center",
    fontSize: 18,
    fontFamily: "DMSans-Medium",
    color: "#64748B",
  },

  resend: {
    fontSize: 12,
    color: "#000",
    marginBottom: 30,
    fontFamily: "DMSans-Regular",
  },

  button: {
    backgroundColor: "#487D44",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    minHeight: 50,
    justifyContent: "center",
  },
});
