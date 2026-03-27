import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCartApi, saveOrderApi } from "../services/api";
import Styles from "../components/Styles";

const PaymentScreen = ({ navigation, route }: any) => {
  const {
    delivery_date,
    delivery_instruction,
    address_id,
    state,
    district,
    city,
    pincode,
  } = route?.params || {};

  console.log("PaymentScreen params:", {
    delivery_date,
    delivery_instruction,
    address_id,
    state,
    district,
    city,
    pincode,
  });

  const [selected, setSelected] = useState("wallet");
  const [orderSummary, setOrderSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const formatPrice = (price: number) => {
    if (price === undefined || price === null) return "0.00";
    return Number(price).toFixed(2);
  };

  const fetchCart = async () => {
    try {
      setLoading(true);

      const data = await getCartApi();

      setOrderSummary(data?.orderSummary || {});
      console.log("Order Summary:123", data.orderSummary);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCart();
  }, []);

  const handleOrder = async () => {
    // try {
    //   const payload = {
    //     delivery_date,
    //     address: address_id,
    //     state,
    //     district,
    //     city,
    //     pincode,
    //     pay_mode: "wallet",
    //     remarks: delivery_instruction,
    //   };

    //   const res = await saveOrderApi(payload);

    //   console.log("Order Success:", res);
    //   Alert.alert("Success", "Order placed successfully");
    navigation.navigate("OrderConfirmScreen");
    // } catch (error: any) {
    //   console.log("Order Failed:", error);
    //   Alert.alert("Error", error.message);
    // }
  };

  const PaymentOption = ({ id, title, subtitle, icon, disabled }: any) => (
    <TouchableOpacity
      style={[
        styles.paymentCard,
        selected === id && styles.activeCard,
        disabled && styles.disabledCard,
      ]}
      onPress={() => {
        if (!disabled) {
          setSelected(id);
        }
      }}
      activeOpacity={disabled ? 1 : 0.7}
    >
      <View
        style={[
          styles.iconBox,
          selected === id && styles.iconBoxActive,
          disabled && styles.disabledIconBox,
        ]}
      >
        <Image
          source={icon}
          style={[
            styles.icon,
            selected === id && styles.iconActive,
            disabled && styles.disabledIcon,
          ]}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.paymentTitle, disabled && styles.disabledText]}>
          {title}
        </Text>
        <Text style={[styles.paymentSub, disabled && styles.disabledText]}>
          {subtitle}
        </Text>
      </View>

      <View
        style={[styles.radioOuter, selected === id && styles.radioOuterActive]}
      >
        {selected === id && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        {loading && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="#487D44" />
          </View>
        )}
        <TouchableOpacity
          style={{ marginHorizontal: 16 }}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={require("../assets/Common/Back.png")}
            style={[Styles.headerImage, { marginTop: 2 }]}
          />
        </TouchableOpacity>

        <Text style={styles.title}>Payment Method</Text>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 50 }}
          style={styles.scrollview}
          keyboardShouldPersistTaps="handled"
        >
          {/* Total Amount */}
          <View style={styles.amountCard}>
            <Text style={styles.totalLabel}>Total Payable Amount</Text>
            <Text style={styles.amount}>
              ₹{formatPrice(orderSummary?.totalAmount) || 0}
            </Text>

            <View style={styles.challan}>
              <Text style={styles.challanText}>CHALLAN ID : #B2B-889653</Text>
            </View>
          </View>

          {/* Order Summary */}

          <Text style={styles.section}>Order summary</Text>

          <View style={[styles.summaryRow, { marginTop: 10 }]}>
            <Text style={styles.summaryText}>Taxable Value</Text>
            <Text style={{ fontSize: 12, fontFamily: "DMSans-Regular" }}>
              ₹{orderSummary?.taxable}
            </Text>
          </View>

          {orderSummary?.gstBifurcation?.map((gst: any, index: number) => (
            <View key={index} style={styles.summaryRow}>
              <Text style={styles.summaryText}>GST ({gst.percentage}%)</Text>
              <Text style={{ fontSize: 12, fontFamily: "DMSans-Regular" }}>
                ₹{formatPrice(gst.price)}
              </Text>
            </View>
          ))}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Total</Text>
            <Text style={styles.summaryText}>
              ₹{formatPrice(orderSummary?.totalAmount)}
            </Text>
          </View>

          {/* Promo */}

          <TouchableOpacity style={styles.promoBox}>
            <Image
              source={require("../assets/Common/Discount.png")}
              style={{ height: 18, width: 18 }}
            />
            <Text style={styles.promoText}>Apply promos before you order</Text>
            <Image
              source={require("../assets/Common/ArrowRight.png")}
              style={{ height: 10, width: 10 }}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Recommended */}
          <Text style={styles.section}>Recommended for Business</Text>

          <PaymentOption
            id="credit"
            title="Pay Later / Credit Line"
            subtitle="Available limit: ₹2,00,000 | 0% Interest"
            icon={require("../assets/icons/wallet.png")}
          />

          {/* Other Methods */}

          <Text style={styles.section}>Other Payment Methods</Text>

          <PaymentOption
            id="upi"
            title="Online Payment"
            subtitle="GPay, PhonePe, Paytm & Others"
            icon={require("../assets/icons/upi.png")}
            disabled={true}
          />
          {/* <PaymentOption
            id="card"
            title="Business Cards"
            subtitle="Visa, Mastercard, Amex"
            icon={require("../assets/icons/card.png")}
          /> */}

          {/* <PaymentOption
            id="bank"
            title="Net Banking"
            subtitle="All Major Indian Banks"
            icon={require("../assets/icons/bank.png")}
          /> */}

          {/* <View style={{ height: 100 }} /> */}
        </ScrollView>

        {/* Sticky Bottom Bar */}
        <View style={styles.bottomBox}>
          <View style={styles.amountRow}>
            <Text style={styles.amountDue}>Amount Due</Text>
            <Text style={styles.amountValue}>
              ₹{formatPrice(orderSummary?.totalAmount)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.payBtn}
            onPress={() => {
              console.log("BUTTON PRESSED");
              handleOrder();
            }}
          >
            <Text style={styles.payText}>Pay Securely</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Button */}
      </View>
    </SafeAreaView>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6F8",
    // ,
  },
  scrollview: {
    padding: 16,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F6F8",
  },
  title: {
    fontSize: 18,
    marginTop: 10,
    fontFamily: "DMSans-Medium",
    marginBottom: 13,
    marginHorizontal: 16,
  },

  amountCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 14,
    borderColor: "#d0cfcf99",
    borderWidth: 1,
    alignItems: "center",
    marginBottom: 20,
  },

  totalLabel: {
    color: "#777",
    fontFamily: "DMSans-Regular",
  },

  amount: {
    fontSize: 24,
    fontFamily: "DMSans-Bold",
    marginVertical: 6,
  },

  challan: {
    backgroundColor: "#E7F3E7",
    paddingHorizontal: 12,
    borderColor: "#57E24D1F",
    borderWidth: 1,
    paddingVertical: 4,
    borderRadius: 20,
  },

  summaryText: {
    fontSize: 13,
    fontFamily: "DMSans-Regular",
  },

  challanText: {
    color: "#487D44",
    fontSize: 9,
    fontFamily: "DMSans-SemiBold",
  },

  section: {
    fontSize: 18,
    fontFamily: "DMSans-SemiBold",
    marginBottom: 10,
    // marginTop: 10
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  promoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E7F3E7",
    padding: 14,
    borderRadius: 10,
    marginVertical: 15,
  },
  loaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    zIndex: 999,
  },

  promoText: {
    flex: 1,
    marginLeft: 10,
    color: "#64748B",
    fontSize: 12,
    fontFamily: "DMSans-Regular",
  },

  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 14,
    marginBottom: 12,
  },

  activeCard: {
    borderWidth: 2,
    borderColor: "#487D44",
  },

  iconBox: {
    width: 40,
    height: 40,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginRight: 10,
  },

  icon: {
    width: 22,
    height: 22,
    resizeMode: "contain",
  },

  paymentTitle: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "DMSans-SemiBold",
  },

  paymentSub: {
    fontSize: 12,
    color: "#777",
    fontFamily: "DMSans-Regular",
  },

  bottomBox: {
    padding: 16,
    // backgroundColor: "#fff",
    // borderTopWidth: 1,
    borderColor: "#E5E7EB",
  },

  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  amountDue: {
    color: "#777",
    fontSize: 12,
    fontFamily: "DMSans-Regular",
  },

  amountValue: {
    // fontWeight: '700',s
    fontSize: 16,
    fontFamily: "DMSans-Bold",
  },

  payBtn: {
    backgroundColor: "#487D44",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  payText: {
    color: "#fff",
    fontSize: 16,
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

  iconBoxActive: {
    backgroundColor: "#487D44",
  },

  iconActive: {
    tintColor: "#fff",
  },

  disabledCard: {
    opacity: 0.5,
  },

  disabledText: {
    color: "#A1A1AA",
  },

  disabledIconBox: {
    backgroundColor: "#E5E7EB",
  },

  disabledIcon: {
    tintColor: "#9CA3AF",
  },
});
