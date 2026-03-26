import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import Feather from "@react-native-vector-icons/feather";
import { SafeAreaView } from "react-native-safe-area-context";
const TrackOrder = ({ navigation }: any) => {
  const [isOpen, setIsOpen] = useState(true);
  const rightIcon = require("../assets/Common/righticon.png");
  const currentIcon = require("../assets/Common/CurrentPlaceHolder.png");
  const pendingIcon = require("../assets/Common/BalckPlaceHolder.png");
  const Step = ({ title, location, time, icon, isLast }: any) => (
    <View style={styles.stepRow}>
      <View style={styles.stepLeft}>
        <Image source={icon} style={styles.stepIcon} />
        {!isLast && <View style={styles.line} />}
      </View>

      <View style={styles.stepContent}>
        <Text style={styles.stepTime}>{time}</Text>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepLocation}>{location}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require("../assets/Common/Back.png")}
            style={{ height: 16, width: 16 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.title}>Track Order</Text>
        <Text style={styles.eta}>ETA : 15 Jan, (11:00 AM - 11:00 PM)</Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        >
          {/* Header */}

          {/* Shipping Card */}
          <View style={styles.shipCard}>
            <View style={styles.shipHeader}>
              <View style={styles.shipIcon}>
                <Image
                  source={require("../assets/Common/truckShipping.png")}
                  style={{ height: 22, width: 22 }}
                />
              </View>

              <View>
                <Text style={styles.shipTitle}>Shipping ID</Text>
                <Text style={styles.shipId}>#ORD8803287499</Text>
              </View>

              {/* <Feather
                name="chevron-up"
                size={20}
                style={{ marginLeft: "auto" }}
              /> */}
              <Image
                source={
                  isOpen
                    ? require("../assets/Common/ArrowUp.png")
                    : require("../assets/Common/ArrowRight.png")
                }
                style={{ height: 9, width: 9, tintColor: "#64748B" }}
                resizeMode="contain"
              />
            </View>

            {/* Timeline */}

            <Step
              time="16 Jan 2025, 5:00 PM"
              title="Order challan has been generated"
              location="Chandigarh"
              icon={rightIcon}
            />

            <Step
              time="16 Jan 2025, 5:15 PM"
              title="Material in processing"
              location="Chandigarh"
              icon={currentIcon}
            />

            <Step
              time="17 Jan 2025"
              title="Packed"
              location="Himachal Pradesh"
              icon={pendingIcon}
            />

            <Step
              time="17 Jan 2025"
              title="Dispatched"
              location="Himachal Pradesh"
              icon={pendingIcon}
            />

            <Step
              time="17 Jan 2025"
              title="Delivered"
              location="Himachal Pradesh"
              icon={pendingIcon}
              isLast
            />
          </View>

          {/* Order Detail */}
          <Text style={styles.section}>Order Detail</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Order ID</Text>
            <Text style={styles.value}>ORD8803287499</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Payment Method</Text>
            <Text style={styles.value}>Pay Later</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Deliver to</Text>
            <Text style={[styles.value, { width: 200, textAlign: "right" }]}>
              4, Shree Ganesh Apt, Shradhanand Road, Vile Parle
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Order date</Text>
            <Text style={styles.value}>Fri, 16 Jan 25, 4:29 PM</Text>
          </View>

          {/* Order Summary Button */}

          <TouchableOpacity
            style={styles.summaryBtn}
            onPress={() => navigation.navigate("OrderSummery")}
          >
            <Text style={styles.summaryText}>Order Summary</Text>
            <Feather name="chevron-right" size={18} color="#64748B" />
          </TouchableOpacity>

          {/* Download */}

          <TouchableOpacity style={styles.downloadBtn}>
            <Text style={styles.downloadText}>Download Invoice</Text>
            <Image
              source={require("../assets/Common/SavePdf.png")}
              style={{ height: 18, width: 18, tintColor: "#fff" }}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Help */}

          <Text style={styles.section}>Need help with your order?</Text>

          <TouchableOpacity style={styles.chatBox}>
            <View style={styles.chatIcon}>
              <Image
                source={require("../assets/Common/chat.png")}
                style={{ height: 20, width: 20 }}
                resizeMode="contain"
              />
            </View>

            <View style={{ marginLeft: 10 }}>
              <Text style={styles.chatTitle}>Chat with us</Text>
              <Text style={styles.chatSub}>
                About any issue related to your order
              </Text>
            </View>

            <Feather
              name="chevron-right"
              size={18}
              color="#64748B"
              style={{ marginLeft: "auto" }}
            />
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default TrackOrder;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6F8",
    paddingHorizontal: 16,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F6F8",
  },
  title: {
    fontSize: 18,
    fontFamily: "DMSans-Medium",
    marginTop: 10,
  },

  eta: {
    color: "#487D44",
    marginBottom: 16,
    fontFamily: "DMSans-Regular",
  },

  shipCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
  },

  shipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  shipIcon: {
    backgroundColor: "#F1F5F9",
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },

  shipTitle: {
    fontFamily: "DMSans-SemiBold",
  },

  shipId: {
    color: "#64748B",
    fontFamily: "DMSans-Regular",
  },

  stepRow: {
    flexDirection: "row",
    marginBottom: 5,
  },

  stepLeft: {
    alignItems: "center",
    width: 30,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 10,
  },

  line: {
    width: 2,
    flex: 1,
    backgroundColor: "#E5E7EB",
    marginTop: 3,
    height: 35,
  },

  stepContent: {
    flex: 1,
    marginLeft: 10,
  },

  stepTime: {
    fontSize: 11,
    color: "#64748B",
    fontFamily: "DMSans-Regular",
  },

  stepTitle: {
    fontFamily: "DMSans-SemiBold",
    fontSize: 14,
    marginVertical: 1,
  },

  stepLocation: {
    fontSize: 12,
    color: "#64748B",
    fontFamily: "DMSans-Regular",
  },

  section: {
    fontSize: 18,
    fontFamily: "DMSans-SemiBold",
    marginTop: 20,
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  label: {
    fontFamily: "DMSans-Regular",
    fontSize: 12,
  },

  value: {
    fontFamily: "DMSans-Regular",
    fontSize: 12,
  },
  stepIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },

  summaryBtn: {
    marginTop: 20,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D2D6DB",
  },

  summaryText: {
    fontFamily: "DMSans-Medium",
  },

  downloadBtn: {
    marginTop: 14,
    backgroundColor: "#487D44",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },

  downloadText: {
    color: "#fff",
    fontFamily: "DMSans-Medium",
    fontSize: 16,
  },

  chatBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },

  chatIcon: {
    backgroundColor: "#F8F9FD",
    padding: 10,
    borderRadius: 10,
  },

  chatTitle: {
    fontFamily: "DMSans-SemiBold",
  },

  chatSub: {
    fontSize: 12,
    color: "#777",
    fontFamily: "DMSans-Regular",
  },
});
