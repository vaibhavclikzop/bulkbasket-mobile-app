import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// import Feather from "react-native-vector-icons/Feather";
import Styles from "../components/Styles";

const WithdrawMoney = ({ navigation }: any) => {
  const [amount, setAmount] = useState("20000");
  const [selectedBank, setSelectedBank] = useState(1);

  const banks = [
    {
      id: 1,
      name: "Axis Bank Ltd.",
      number: "**** 5674",
      logo: require("../assets/banks/axis.png"),
    },
    {
      id: 2,
      name: "CitiBank",
      number: "**** 2980",
      logo: require("../assets/banks/citi.png"),
    },
    {
      id: 3,
      name: "State Bank of India",
      number: "**** 2652",
      logo: require("../assets/banks/sbi.png"),
    },
  ];

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[Styles.header, { padding: 16, backgroundColor: "#fff" }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require("../assets/Common/Back.png")}
              style={Styles.headerImage}
            />
          </TouchableOpacity>

          <Text style={Styles.headerText}>Withdraw Money</Text>
        </View>
        <View style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 10 }}
          >
            {/* Enter Amount */}
            <View style={styles.amountCard}>
              <Text style={styles.label}>Enter Amount</Text>

              <TextInput
                value={`₹ ${amount}`}
                onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ""))}
                keyboardType="numeric"
                style={styles.amountInput}
              />
            </View>

            {/* Choose Account */}
            <Text style={styles.sectionTitle}>Choose Account</Text>

            {banks.map((bank) => {
              const active = selectedBank === bank.id;

              return (
                <TouchableOpacity
                  key={bank.id}
                  style={[styles.bankCard, active && styles.activeCard]}
                  onPress={() => setSelectedBank(bank.id)}
                >
                  <View style={{ flexDirection: "row" }}>
                    {/* <View style={[styles.radio, active && styles.radioActive]} /> */}
                    <View
                      style={[
                        styles.radioOuter,
                        active && styles.radioOuterActive,
                      ]}
                    >
                      {active && <View style={styles.radioInner} />}
                    </View>
                    <View style={{ marginLeft: 10 }}>
                      <Text style={styles.bankName}>{bank.name}</Text>
                      <Text style={styles.bankAccount}>
                        Account No. {bank.number}
                      </Text>
                    </View>
                  </View>

                  <Image source={bank.logo} style={styles.bankLogo} />
                </TouchableOpacity>
              );
            })}

            {/* Withdrawal Info */}
            <View style={styles.lastView}>
              <View style={styles.infoCard}>
                {/* <Feather name="info" size={18} color="#2E7D32" /> */}
                <Image
                  source={require("../assets/Common/info.png")}
                  style={{ height: 18, width: 18 }}
                />

                <Text style={styles.infoText}>
                  <Text style={{ fontFamily: "DMSans-Medium" }}>
                    Withdrawal Info :
                  </Text>{" "}
                  Withdrawals may take up to 7 working days to reflect in your
                  bank account, depending on your bank's processing time.
                </Text>
              </View>

              {/* Process Button */}
              <TouchableOpacity style={styles.processBtn}>
                <Text style={styles.processText}>Process</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default WithdrawMoney;

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
    borderColor: "#000000",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontFamily: "DMSans-Medium",
  },

  sectionTitle: {
    fontSize: 18,
    fontFamily: "DMSans-Medium",
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
  },

  bankCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    padding: 16,
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

  bankName: {
    fontSize: 16,
    fontFamily: "DMSans-Regular",
  },

  bankAccount: {
    fontSize: 12,
    color: "#64748B",
    fontFamily: "DMSans-Regular",
  },

  bankLogo: {
    width: 40,
    height: 30,
    resizeMode: "contain",
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

  infoCard: {
    flexDirection: "row",
    backgroundColor: "#E8F5E9",
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
  },

  infoText: {
    flex: 1,
    fontSize: 13,
    marginLeft: 8,
    color: "#374151",
    fontFamily: "DMSans-Regular",
    lineHeight: 18,
  },

  processBtn: {
    backgroundColor: "#487D44",
    margin: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  processText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "DMSans-Medium",
  },
  lastView: {
    marginTop: 20,
  },
});
