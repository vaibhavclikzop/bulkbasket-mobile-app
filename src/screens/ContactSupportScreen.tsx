import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "../components/Styles";

const ContactSupportScreen = ({ navigation }: any) => {
  const [openFaq, setOpenFaq] = useState("About");

  const faqData = [
    {
      id: "About",
      title: "About BulBasket",
      desc: "Learn more about BulBasket, our services, how the app works, and what we offer to users.",
    },
    {
      id: "Outlet",
      title: "Outlet and account related issues",
      desc: "Get help with account setup, login issues, profile updates, and outlet registration or management.",
    },
    {
      id: "Current",
      title: "Current order related issues",
      desc: "Facing issues with an ongoing order? Track your order, modify details, or report delays here.",
    },
    {
      id: "Delivered",
      title: "Delivered order related issues",
      desc: "Report problems with completed orders such as missing items, wrong delivery, or quality concerns.",
    },
    {
      id: "Payment",
      title: "Payment and refund issues",
      desc: "Resolve payment failures, check transaction status, and request refunds for canceled or failed orders.",
    },
  ];

  const FAQItem = ({ item, isLast }: any) => {
    const isOpen = openFaq === item.id;

    return (
      <TouchableOpacity
        style={[styles.faqItem, isLast && { borderBottomWidth: 0 }]}
        activeOpacity={0.8}
        onPress={() => setOpenFaq(isOpen ? "" : item.id)}
      >
        <View style={[styles.faqHeader, isOpen && { marginBottom: 5 }]}>
          <Text style={styles.faqTitle}>{item.title}</Text>

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

        {isOpen && item.desc && <Text style={styles.faqDesc}>{item.desc}</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View
          style={[
            Styles.header,
            {
              justifyContent: "space-between",
              backgroundColor: "#fff",
              padding: 16,
            },
          ]}
        >
          <View style={Styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image
                source={require("../assets/Common/Back.png")}
                style={Styles.headerImage}
              />
            </TouchableOpacity>

            <Text style={Styles.headerText}>Contact Us</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ padding: 16 }}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* FAQ Section */}
          <Text style={styles.sectionTitle}>Frequently asked questions</Text>

          <View style={styles.faqContainer}>
            {faqData.map((item, index) => (
              <FAQItem
                key={item.id}
                item={item}
                isLast={index === faqData.length - 1}
              />
            ))}
          </View>

          {/* Customer Support */}
          <Text style={styles.sectionTitle}>Customer Support</Text>

          <Text style={styles.supportDesc}>
            You can get in touch with us through below platforms. Our Team will
            reach out to you as soon as it would be possible
          </Text>

          {/* Contact Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Contact</Text>

            <View style={styles.contactRow}>
              <View style={styles.iconBox}>
                <Image
                  source={require("../assets/Common/call.png")}
                  style={{
                    height: 16,
                    width: 16,
                  }}
                  resizeMode="contain"
                />
              </View>

              <View>
                <Text style={styles.label}>Contact Number</Text>
                <Text style={styles.value}>+91 98765 43210</Text>
              </View>
            </View>

            <View style={styles.contactRow}>
              <View style={styles.iconBox}>
                <Image
                  source={require("../assets/Common/mail.png")}
                  style={{
                    height: 16,
                    width: 16,
                  }}
                  resizeMode="contain"
                />
              </View>

              <View>
                <Text style={styles.label}>Email Address</Text>
                <Text style={styles.value}>help@bulkbasket.com</Text>
              </View>
            </View>
          </View>

          {/* Chat with us */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Chat with us</Text>

            <View style={styles.chatRow}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={styles.iconBox}>
                  <Image
                    source={require("../assets/Common/whatapp.png")}
                    style={{
                      height: 16,
                      width: 16,
                    }}
                    resizeMode="contain"
                  />
                </View>

                <View>
                  <Text style={styles.label}>WhatsApp Number</Text>
                  <Text style={styles.value}>+91 98765 43210</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.chatBtn}>
                <Text style={styles.chatText}>Chat Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ContactSupportScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F6F8",
  },

  container: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 18,
    fontFamily: "DMSans-Medium",
    marginVertical: 10,
  },

  supportDesc: {
    fontSize: 14,
    color: "#64748B",
    fontFamily: "DMSans-Regular",
    marginBottom: 10,
  },

  faqContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 6,
  },

  faqItem: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  faqTitle: {
    fontSize: 16,
    fontFamily: "DMSans-Medium",
  },

  faqDesc: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748B",
    fontFamily: "DMSans-Regular",
    lineHeight: 18,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },

  cardTitle: {
    fontSize: 18,
    fontFamily: "DMSans-Medium",
    marginBottom: 10,
  },

  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },

  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  label: {
    fontSize: 12,
    color: "#6B7280",
    fontFamily: "DMSans-Regular",
  },

  value: {
    fontSize: 16,
    fontFamily: "DMSans-Medium",
  },

  chatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  chatBtn: {
    backgroundColor: "#487D44",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },

  chatText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "DMSans-Medium",
  },
});
