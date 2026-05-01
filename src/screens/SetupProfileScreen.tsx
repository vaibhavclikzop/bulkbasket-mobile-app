import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ScrollView, Image, ActivityIndicator,  } from 'react-native';
import { Alert } from '../utils/CustomAlert';

import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "../components/Styles";
import Header from "../components/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../services/api";
import axios from "axios";

const OPTIONS = [
  {
    id: "1",
    title: "Hotel",
    sub: "Full-service dining and eateries",
    icon: require("../assets/icons/icon1.png"),
  },
  {
    id: "2",
    title: "Restaurant / cafe",
    sub: "Delivery-only kitchen facility",
    icon: require("../assets/icons/icon5.png"),
  },
  {
    id: "3",
    title: "Banquet / Caterer",
    sub: "Coffee shops and baked goods",
    icon: require("../assets/icons/icon2.png"),
  },
  {
    id: "4",
    title: "Institutional / canteen",
    sub: "Event catering and bulk services",
    icon: require("../assets/icons/icon3.png"),
  },
  {
    id: "5",
    title: "Others",
    sub: "",
    icon: require("../assets/icons/icon4.png"),
  },
];

const SetupProfileScreen = ({ navigation }: any) => {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);

  const [brandName, setBrandName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [gstin, setGstin] = useState("");
  const [fssai, setFssai] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!brandName) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    if (gstin && gstin.length !== 15) {
      Alert.alert("Invalid GST", "GST number must be 15 characters");
      return;
    }
    console.log("asdjsdkjasdklj", gstin);

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("userToken");

      const response = await axios.post(
        `${BASE_URL}/check-gst`,
        {
          gst_no: gstin,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );
      const gstLegalName = response.data?.data?.data?.lgnm;

      if (gstLegalName) {
        setLegalName(gstLegalName);
      }

      console.log("GST API Response:", response.data);

      navigation.navigate("DeliveryLocation");
    } catch (error: any) {
      console.log("GST API Error:", error.response?.data || error.message);

      Alert.alert("GST Verification Failed", error || "Something went wrong");
    } finally {
      setLoading(false);
    }

    // navigation.navigate("DeliveryLocation");
  };

  const renderItem = ({ item }: any) => {
    const isSelected = selected === item.id;

    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.selectedCard]}
        onPress={() => setSelected(item.id)}
      >
        <View style={styles.cardLeft}>
          <View style={[styles.iconBox, isSelected && styles.selectedIconBox]}>
            <Image
              source={item.icon}
              style={[
                styles.iconsize,
                { tintColor: isSelected ? "#fff" : "#677489" },
              ]}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, isSelected && styles.selectedText]}>
              {item.title}
            </Text>

            {item.sub !== "" && <Text style={styles.cardSub}>{item.sub}</Text>}
          </View>
        </View>

        <View
          style={[styles.radioOuter, isSelected && styles.radioOuterActive]}
        >
          {isSelected && <View style={styles.radioInner} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <Header
        title="Setup Profile"
        onBackPress={() => {
          if (step === 2) {
            setStep(1);
          } else {
            navigation.goBack();
          }
        }}
        rightComponent={
          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>
        }
      />

      {/* STEP 1 */}

      {step === 1 && (
        <View style={{ paddingHorizontal: 15 }}>
          <Text style={[Styles.headerText, { marginTop: 25 }]}>
            Tell us about your business
          </Text>

          <Text style={[Styles.SubTitle, { marginTop: 12 }]}>
            This helps us show you relevant products, pricing and ordering
            preferences for your business.
          </Text>

          <View style={{ marginTop: 30 }}>
            <FlatList
              data={OPTIONS}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingTop: 10 }}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: selected ? "#487D44" : "#D1D5DB" },
            ]}
            disabled={!selected}
            onPress={() => setStep(2)}
          >
            <Text style={Styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* STEP 2 */}

      {step === 2 && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ paddingHorizontal: 15 }}
        >
          <Text style={[Styles.headerText, { marginTop: 25 }]}>
            Registration Info
          </Text>

          <Text style={[Styles.SubTitle, { marginTop: 12 }]}>
            We require these details to verify business and enable wholesale
            ordering.
          </Text>

          <Text style={[styles.label, { marginTop: 30 }]}>Brand Name</Text>

          <TextInput
            style={styles.input}
            placeholder="hotel/restaurant name"
            value={brandName}
            onChangeText={setBrandName}
          />

          <Text style={styles.label}>Legal Business Name</Text>

          <TextInput
            style={styles.input}
            placeholder="as per GST records"
            value={legalName}
            onChangeText={setLegalName}
          />

          <Text style={styles.label}>GSTIN (If applicable)</Text>

          <TextInput
            style={styles.input}
            placeholder="07AAAZ9999A1Z5"
            value={gstin}
            onChangeText={(text) => setGstin(text.toUpperCase())}
            maxLength={15}
          />

          <Text style={styles.label}>FSSAI Number</Text>

          <TextInput
            style={styles.input}
            placeholder="14-digit licence number"
            value={fssai}
            onChangeText={setFssai}
            keyboardType="number-pad"
            maxLength={14}
          />

          <Text style={styles.labelfssai}>
            *Must be the number as shown on your food license.
          </Text>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: loading ? "#A5A5A5" : "#2F7D32" },
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={Styles.buttonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default SetupProfileScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // important
    marginBottom: 20,
    // marginTop: 35,
  },

  headerTitle: {
    fontSize: 18,
    fontFamily: "DMSans-Medium",
  },

  backIcon: {
    fontSize: 28,
    fontWeight: "700",
  },

  skip: {
    fontSize: 14,
    fontWeight: "600",
    color: "#487D44",
    fontFamily: "DMSans-Medium",
  },

  iconsize: {
    width: 30,
    height: 30,
    resizeMode: "contain",
    // tintColor: '#677489',
  },

  title: {
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "DMSans-bold",
    color: "#0000",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 20,
    lineHeight: 18,
    fontFamily: "DMSans",
    gap: 12,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 14.9,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },

  selectedCard: {
    borderColor: "#487D44",
    backgroundColor: "#fff",
  },

  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#EAF3FF",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#487D44",
    marginRight: 12,
  },

  selectedIconBox: {
    backgroundColor: "#487D44",
  },

  iconText: {
    fontSize: 18,
    color: "#fff",
  },

  cardTitle: {
    color: "#000000",
    fontSize: 16,
    fontFamily: "DMSans-Medium",
  },

  selectedText: {
    color: "#000",
  },

  cardSub: {
    fontSize: 14,
    letterSpacing: 0.2,
    color: "#6B7280",
    marginTop: 2,
    fontFamily: "DMSans-Medium",
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

  iconImage: {
    width: 22,
    height: 22,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    marginTop: 14,
    color: "#000000",
    fontFamily: "DMSans-Regular",
    fontWeight: "500",
  },

  labelfssai: {
    fontSize: 12,
    marginBottom: 6,
    marginTop: 14,
    color: "#000000",
    fontWeight: "500",
    fontFamily: "DMSans-Regular",
  },

  input: {
    borderWidth: 1,
    borderColor: "#c9cbcf",
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 55,
    backgroundColor: "#fff",
    fontSize: 14,
    fontFamily: "DMSans-Regular",
  },

  inputWithBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    backgroundColor: "#F9FAFB",
  },

  flexInput: {
    flex: 1,
  },

  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6F4EA",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  verifiedText: {
    fontSize: 12,
    marginLeft: 4,
    color: "#487D44",
    fontWeight: "600",
  },

  note: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 6,
  },

  button: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 20,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
