import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "../components/Styles";
import { addWalletAmountApi } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const AddMoney = ({ navigation }: any) => {
  const [amount, setAmount] = useState("20000");
  const [selectedMethod, setSelectedMethod] = useState("card");

  const quickAmounts = [10000, 20000, 50000];

  const handleAddMoney = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      console.log("🚀 ~ handleAddMoney ~ userId:", userId);

      if (!userId) {
        Alert.alert("Error", "User not found");
        return;
      }

      if (!amount) {
        Alert.alert("Error", "Please enter amount");
        return;
      }

      const res = await addWalletAmountApi(userId, Number(amount));

      console.log("Wallet updated:", res);

      if (res?.status === false || res?.error) {
        if (res?.message === "Your account currently not active") {
          Alert.alert(
            "Complete Profile",
            "Please complete your account setup (GST required) before adding money.",
            [
              {
                text: "Go to Setup",
                onPress: () =>
                  navigation.navigate("Profile", {
                    screen: "CompanyProfile",
                  }),
              },
              { text: "Cancel", style: "cancel" },
            ],
          );
        } else {
          Alert.alert("Error", res?.message || "Failed to add money");
        }
        return;
      }

      Alert.alert("Success", "Money added successfully");
    } catch (error: any) {
      console.log("Error:", error);
      if (error?.message === "Your account currently not active") {
        Alert.alert(
          "Complete Profile",
          "Please complete your account setup (GST required) before adding money.",
          [
            {
              text: "Go to Setup",
              onPress: () =>
                navigation.navigate("Profile", {
                  screen: "CompanyProfile",
                }),
            },
            { text: "Cancel", style: "cancel" },
          ],
        );
      } else {
        Alert.alert("Error", error?.message || "Failed to add money");
      }
    }
  };

  // const handleAddMoney = async () => {
  //   try {
  //     const userId = await AsyncStorage.getItem("userId");
  //     console.log("🚀 ~ handleAddMoney ~ userId:", userId);

  //     if (!userId) {
  //       Alert.alert("Error", "User not found");
  //       return;
  //     }

  //     if (!amount) {
  //       Alert.alert("Error", "Please enter amount");
  //       return;
  //     }

  //     // Prepare form data
  //     const formData = new FormData();
  //     formData.append("customer_id", userId);
  //     formData.append("amount", String(amount));

  //     // Send POST request
  //     const response = await axios.post(
  //       "https://store.bulkbasketindia.com/api/add-walllet-amount",
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       },
  //     );

  //     console.log("Wallet updated:", response.data);

  //     if (response.data.error === false || response.data.success) {
  //       Alert.alert("Success", "Money added successfully");
  //     } else {
  //       Alert.alert("Error", response.data.message || "Failed to add money");
  //     }
  //   } catch (error: any) {
  //     console.log("Error:", error.response?.data || error.message);
  //     Alert.alert("Error", "Failed to add money");
  //   }
  // };

  const PaymentMethod = ({ id, image, title, desc }: any) => {
    const active = selectedMethod === id;

    return (
      <TouchableOpacity
        style={[styles.methodCard, active && styles.activeCard]}
        onPress={() => setSelectedMethod(id)}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={[styles.iconBox, active && styles.iconActive]}>
            <Image
              source={image}
              style={{
                height: 20,
                width: 20,
                resizeMode: "contain",
                tintColor: active ? "#fff" : "#000",
              }}
            />
          </View>

          <View style={{ marginLeft: 10 }}>
            <Text style={styles.methodTitle}>{title}</Text>
            <Text style={styles.methodDesc}>{desc}</Text>
          </View>
        </View>

        <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
          {active && <View style={styles.radioInner} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[Styles.header, { padding: 16, backgroundColor: "#FFF" }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require("../assets/Common/Back.png")}
              style={Styles.headerImage}
            />
          </TouchableOpacity>

          <Text style={Styles.headerText}>Add Money</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Amount Card */}
          <View style={styles.amountCard}>
            <Text style={styles.label}>Add Money</Text>

            <TextInput
              value={`₹ ${amount}`}
              keyboardType="numeric"
              onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ""))}
              style={styles.amountInput}
            />

            {/* Quick Amount */}
            <View style={styles.quickRow}>
              {quickAmounts.map((value) => {
                const active = Number(amount) === value;

                return (
                  <TouchableOpacity
                    key={value}
                    style={[styles.quickBtn, active && styles.quickBtnActive]}
                    onPress={() => setAmount(String(value))}
                  >
                    <Text
                      style={[
                        styles.quickText,
                        active && {
                          color: "#fff",
                          fontFamily: "DMSans-Medium",
                        },
                      ]}
                    >
                      + ₹{value.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          {/* Pay Using */}
          <Text style={styles.sectionTitle}>Pay Using</Text>
          <PaymentMethod
            id="upi"
            title="UPI"
            desc="GPay, PhonePe, Paytm & Others"
            image={require("../assets/AddWithdrawMony/upi.png")}
          />
          <PaymentMethod
            id="card"
            title="Business Cards"
            desc="Visa, Mastercard, Amex"
            image={require("../assets/AddWithdrawMony/card.png")}
          />
          <PaymentMethod
            id="netbanking"
            title="Net Banking"
            desc="All Major Indian Banks"
            image={require("../assets/AddWithdrawMony/bank.png")}
          />
        </ScrollView>

        {/* Pay Now */}
        <TouchableOpacity
          onPress={() => handleAddMoney()}
          style={styles.payBtn}
        >
          <Text style={styles.payText}>Pay Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AddMoney;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F6F8",
  },

  container: {
    flex: 1,
  },

  amountCard: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 14,
  },

  label: {
    fontSize: 14,
    marginBottom: 10,
    fontFamily: "DMSans-Regular",
  },

  amountInput: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontFamily: "DMSans-Medium",
  },

  quickRow: {
    flexDirection: "row",
    marginTop: 12,
  },

  quickBtn: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
  },

  quickBtnActive: {
    backgroundColor: "#487D44",
    borderColor: "#487D44",
  },

  quickText: {
    fontSize: 12,
    fontFamily: "DMSans-Medium",
  },

  sectionTitle: {
    fontSize: 18,
    marginHorizontal: 16,
    marginBottom: 10,
    fontFamily: "DMSans-Medium",
  },

  methodCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  activeCard: {
    borderColor: "#487D44",
    backgroundColor: "#F6FBF6",
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },

  iconActive: {
    backgroundColor: "#487D44",
  },

  methodTitle: {
    fontSize: 16,
    fontFamily: "DMSans-Medium",
  },

  methodDesc: {
    fontSize: 13,
    color: "#64748B",
    fontFamily: "DMSans-Regular",
  },

  payBtn: {
    backgroundColor: "#487D44",
    margin: 16,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  payText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "DMSans-Medium",
  },
  cardItem: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },

  radioOuterActive: {
    borderColor: "#487D44",
  },

  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#487D44",
  },
});
