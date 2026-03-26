import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import Styles from "../components/Styles";
import Header from "../components/Header";
import { SafeAreaView } from "react-native-safe-area-context";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// const generateDates = () => {
//   const today = new Date();
//   return Array.from({ length: 30 }, (_, i) => {
//     const d = new Date(today);
//     d.setDate(today.getDate() + i);
//     return {
//       day: i === 0 ? "Today" : DAY_NAMES[d.getDay()],
//       date: String(d.getDate()).padStart(2, "0"),
//       month: MONTH_NAMES[d.getMonth()],
//       full: `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(
//         2,
//         "0",
//       )}/${String(d.getDate()).padStart(2, "0")}`,
//     };
//   });
// };
const generateDates = () => {
  const today = new Date();
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      day: DAY_NAMES[d.getDay()], // always show day name
      date: String(d.getDate()).padStart(2, "0"),
      month: MONTH_NAMES[d.getMonth()],
      full: `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(
        2,
        "0",
      )}/${String(d.getDate()).padStart(2, "0")}`,
    };
  });
};
const dates = generateDates();

export default function CheckoutScreen({ navigation }: any) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [instruction, setInstruction] = useState("");
  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      {/* Header */}
      <Header title="Preferred Delivery Slot" backgroundColor="#F3F4F6" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120, padding: 0 }}
        style={{ paddingHorizontal: 15 }}
      >
        {/* Date Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginVertical: 0 }}
        >
          {dates.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setSelectedIndex(index);
                setSelectedDate(item.full);
                console.log("Selected date:", item.full);
              }}
              style={[
                styles.dateCard,
                selectedIndex === index && styles.activeDateCard,
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  selectedIndex === index && styles.activeText,
                ]}
              >
                {item.day}
              </Text>
              <Text
                style={[
                  styles.dateText,
                  selectedIndex === index && styles.activeText,
                ]}
              >
                {item.date}
              </Text>
              <Text
                style={[
                  styles.monthText,
                  selectedIndex === index && styles.activeText,
                ]}
              >
                {item.month}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Delivery Instructions */}
        <Text style={styles.sectionTitle}>
          Delivery Instructions{" "}
          <Text
            style={{
              color: "#6B7280",
              fontSize: 13,
              fontFamily: "DMSans-Regular",
            }}
          >
            (Optional)
          </Text>
        </Text>

        <TextInput
          placeholder="Write here..."
          placeholderTextColor="#9CA3AF"
          multiline
          style={styles.textArea}
          value={instruction}
          onChangeText={setInstruction}
        />

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Image
            source={require("../assets/Common/info.png")}
            style={{ height: 18, width: 18 }}
            resizeMode="contain"
          />
          <Text style={styles.infoText}>
            <Text
              style={{
                fontWeight: "600",
                fontFamily: "DMSans-SemiBold",
                color: "#000",
                fontSize: 14,
              }}
            >
              B2B Priority :
            </Text>{" "}
            <Text style={styles.sText}>
              Early Morning slots are prioritized for restaurant partners to
              ensure inventory is ready before peak service hour.
            </Text>
          </Text>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (!selectedDate) {
            Alert.alert("Required", "Please select a delivery date");
            return;
          }
          console.log("Selected Date:", selectedDate);
          console.log("Delivery Instruction:", instruction);
          // return;
          navigation.navigate("CheckoutAddressScreen", {
            delivery_date: selectedDate,
            delivery_instruction: instruction,
          });
        }}
      >
        <Text style={Styles.buttonText}>Verify</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    // paddingHorizontal: 15,
  },
  button: {
    backgroundColor: "#487D44",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    position: "absolute",
    bottom: 50,
    left: 15,
    right: 15,
  },
  header: {
    gap: 15,
    marginHorizontal: 16,
    marginTop: 3,
  },

  // headerTitle: {
  //   fontSize: 16,
  //   fontFamily: "DMSans-Medium",
  //   marginLeft: 12,
  // },

  dateCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },

  activeDateCard: {
    backgroundColor: "#4F7D46",
    borderColor: "#4F7D46",
  },

  dayText: {
    fontSize: 14,
    color: "#374151",
    fontFamily: "DMSans-Regular",
  },

  dateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    fontFamily: "DMSans-SemiBold",
    marginVertical: 1,
  },

  monthText: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "DMSans-Regular",
  },

  activeText: {
    color: "#fff",
  },

  sectionTitle: {
    fontSize: 15,
    fontFamily: "DMSans-Medium",
    marginBottom: 8,
    marginTop: 10,
  },

  textArea: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    height: 110,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    textAlignVertical: "top",
    fontFamily: "DMSans-Regular",
    fontSize: 14,
    lineHeight: 20,
  },

  infoCard: {
    flexDirection: "row",
    backgroundColor: "#DCEFE2",
    padding: 14,
    borderRadius: 14,
    marginTop: 18,
  },

  sText: {
    color: "#64748B",
    fontFamily: "DMSans-Regular",
    fontSize: 14,
  },

  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: "#2F6B3E",
    lineHeight: 18,
  },
});
