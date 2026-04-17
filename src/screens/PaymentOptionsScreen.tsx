import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "../components/Styles";

const PaymentOptionsScreen = ({ navigation }: any) => {
  const [selectedCard, setSelectedCard] = useState(1);
  const [showAddCard, setShowAddCard] = useState(true);
  const [saveCard, setSaveCard] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const cards = [
    {
      id: 1,
      bank: "Axis Bank Ltd.",
      number: "**** 5674",
      offer: "10% Instant Discount",
      brand: require("../assets/Payment/visa.png"),
    },
    {
      id: 2,
      bank: "CitiBank",
      number: "**** 2980",
      brand: require("../assets/Payment/mastercard.png"),
      offer: " ",
    },
    {
      id: 3,
      bank: "State Bank of India",
      number: "**** 2652",
      brand: require("../assets/Payment/rupay.png"),
      offer: " ",
    },
  ];

  const formatCardNumber = (text: string) => {
    return text
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(.{4})/g, "$1 ")
      .trim();
  };

  const formatExpiry = (text: string) => {
    const clean = text.replace(/\D/g, "").slice(0, 4);

    if (clean.length >= 3) {
      return `${clean.slice(0, 2)}/${clean.slice(2)}`;
    }
    return clean;
  };

  const validateCard = () => {
    const cleanCard = cardNumber.replace(/\s/g, "");

    if (cleanCard.length !== 16) {
      Alert.alert("Enter valid 16-digit card number");
      return false;
    }

    if (!expiry.includes("/")) {
      Alert.alert("Enter valid expiry (MM/YY)");
      return false;
    }

    const [month, year] = expiry.split("/");

    if (Number(month) < 1 || Number(month) > 12) {
      Alert.alert("Invalid month");
      return false;
    }

    const current = new Date();
    // const exp = new Date(`20${year}`, Number(month) - 1);
    const expYear = Number(`20${year}`);
    const exp = new Date(expYear, Number(month) - 1);

    if (exp < current) {
      Alert.alert("Card expired");
      return false;
    }

    if (cvv.length < 3) {
      Alert.alert("Invalid CVV");
      return false;
    }

    return true;
  };

  const PaymentMethod = ({ image, title, desc }: any) => {
    const selected = selectedMethod === title;

    return (
      <TouchableOpacity
        // style={styles.methodCard}
        style={[styles.methodCard, selected && styles.activeCard]}
        onPress={() => setSelectedMethod(title)}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* <View style={styles.methodIcon}> */}
          <View style={[styles.iconBox, selected && styles.iconActive]}>
            <Image
              source={image}
              style={{
                height: 20,
                width: 20,
                resizeMode: "contain",
                tintColor: selected ? "#fff" : "#000",
              }}
            />
          </View>

          <View style={{ marginLeft: 10 }}>
            <Text style={styles.methodTitle}>{title}</Text>
            <Text style={styles.methodDesc}>{desc}</Text>
          </View>
        </View>

        <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
          {selected && <View style={styles.radioInner} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[Styles.header, { padding: 16, backgroundColor: "#fff" }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require("../assets/Common/Back.png")}
              style={Styles.headerImage}
            />
          </TouchableOpacity>

          <Text style={Styles.headerText}>Payment Options</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Saved Cards */}
          <Text style={styles.sectionTitle}>Saved Cards</Text>

          {cards.map((item) => {
            const selected = selectedCard === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.cardItem, selected && styles.activeCard]}
                onPress={() => setSelectedCard(item.id)}
              >
                <View style={{ flexDirection: "row" }}>
                  <View
                    style={[
                      styles.radioOuter,
                      selected && styles.radioOuterActive,
                    ]}
                  >
                    {selected && <View style={styles.radioInner} />}
                  </View>

                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.bank}>{item.bank}</Text>

                    <Text style={styles.account}>
                      Account No. {item.number}
                    </Text>

                    {item.offer && (
                      <Text style={styles.offer}>{item.offer}</Text>
                    )}
                  </View>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.offerText}>1 Offer</Text>
                  <Image source={item.brand} style={styles.brand} />
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Add Card */}
          <TouchableOpacity
            onPress={() => setShowAddCard(!showAddCard)}
            style={styles.addCardBtn}
          >
            <Image
              source={require("../assets/Common/plus.png")}
              style={[Styles.headerImage, { marginTop: 2, tintColor: "#fff" }]}
            />
            <Text style={styles.addCardText}>Add New Card</Text>
          </TouchableOpacity>

          {showAddCard && (
            <View style={styles.addCardContainer}>
              <View style={styles.cardHeader}>
                <Image
                  source={require("../assets/icons/card.png")}
                  style={{ marginTop: 2, height: 18, width: 18 }}
                />
                <Text style={styles.cardHeaderText}>Credit/Debit Card</Text>
              </View>

              <Text style={styles.inputLabel}>Card Number</Text>
              <View style={styles.inputBox}>
                <TextInput
                  placeholder="**** **** **** 5468"
                  style={styles.input}
                  placeholderTextColor="#94A3B8"
                  value={cardNumber}
                  onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                  keyboardType="numeric"
                  maxLength={19}
                />
                <Image
                  source={require("../assets/Payment/visa.png")}
                  style={styles.brand}
                />
              </View>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ width: "48%" }}>
                  <Text style={styles.inputLabel}>Expiry</Text>
                  <TextInput
                    placeholder="09/32"
                    style={styles.inputField}
                    placeholderTextColor="#94A3B8"
                    value={expiry}
                    onChangeText={(text) => setExpiry(formatExpiry(text))}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>

                <View style={{ width: "48%" }}>
                  <Text style={styles.inputLabel}>CVV</Text>
                  <TextInput
                    placeholder="***"
                    style={styles.inputField}
                    placeholderTextColor="#3a3b3bff"
                    value={cvv}
                    onChangeText={setCvv}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.checkboxRow}>
                <TouchableOpacity onPress={() => setSaveCard(!saveCard)}>
                  {saveCard ? (
                    <Image
                      source={require("../assets/Common/Tick.png")}
                      style={styles.checkIcon}
                    />
                  ) : (
                    <View style={styles.emptyCheck} />
                  )}
                </TouchableOpacity>
                <Text style={styles.checkboxText}>
                  Save this card as per RBI regulations
                </Text>
              </View>

              <TouchableOpacity style={styles.saveCardBtn}>
                <Text style={styles.saveCardText}>Save Card</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Other Methods */}
          <Text style={styles.sectionTitle}>Other Payment Methods</Text>

          <PaymentMethod
            image={require("../assets/AddWithdrawMony/upi.png")}
            title="UPI"
            desc="GPay, PhonePe, Paytm & Others"
          />

          <PaymentMethod
            image={require("../assets/AddWithdrawMony/card.png")}
            title="Business Cards"
            desc="Visa, Mastercard, Amex"
          />

          <PaymentMethod
            image={require("../assets/AddWithdrawMony/bank.png")}
            title="Net Banking"
            desc="All Major Indian Banks"
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default PaymentOptionsScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F6F8",
  },

  container: {
    flex: 1,
  },
  offerText: {
    fontSize: 10,
    fontFamily: "DMSans-Regular",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "DMSans-Medium",
    marginTop: 16,
    marginBottom: 10,
    paddingHorizontal: 16,
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

  // activeCard: {
  //   borderColor: "#487D44",
  //   backgroundColor: "#F6FBF6",
  // },

  bank: {
    fontSize: 15,
    fontFamily: "DMSans-Medium",
  },

  account: {
    fontSize: 13,
    color: "#64748B",
    fontFamily: "DMSans-Regular",
  },

  offer: {
    fontSize: 12,
    color: "#16A34A",
    marginTop: 4,
    fontFamily: "DMSans-Medium",
  },

  brand: {
    width: 22,
    height: 22,
    resizeMode: "contain",
  },

  radio: {
    width: 18,
    height: 18,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    marginTop: 2,
  },

  radioActive: {
    backgroundColor: "#487D44",
    borderColor: "#487D44",
    marginTop: 2,
  },

  addCardBtn: {
    backgroundColor: "#487D44",
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 10,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  checkIcon: {
    height: 16,
    width: 16,
  },

  emptyCheck: {
    height: 20,
    width: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ADAEBC",
  },
  addCardText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 16,
    fontFamily: "DMSans-Medium",
  },

  // methodCard: {
  //   backgroundColor: "#fff",
  //   marginHorizontal: 16,
  //   borderRadius: 12,
  //   padding: 16,
  //   marginBottom: 12,
  //   borderWidth: 1,
  //   borderColor: "#E5E7EB",
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   alignItems: "center",
  //   // pa: 16
  // },

  methodIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
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
    fontFamily: "DMSans-SemiBold",
  },

  methodDesc: {
    fontSize: 12,
    color: "#64748B",
    fontFamily: "DMSans-Regular",
  },
  addCardContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 20,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  cardHeaderText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: "DMSans-SemiBold",
  },

  inputLabel: {
    fontSize: 14,
    marginBottom: 6,
    fontFamily: "DMSans-Medium",
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
  },

  input: {
    flex: 1,
    height: 44,
    fontFamily: "DMSans-Regular",
  },

  inputField: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 10,
    fontFamily: "DMSans-Regular",
    marginBottom: 12,
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  checkboxText: {
    marginLeft: 6,
    fontSize: 12,
    color: "#64748B",
    fontFamily: "DMSans-Regular",
  },

  saveCardBtn: {
    backgroundColor: "#487D44",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },

  saveCardText: {
    color: "#fff",
    fontSize: 16,
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
});
