import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const OrderSummery = ({ navigation }: any) => {
  const ItemCard = ({ title, subtitle, price, image }: any) => (
    <View style={styles.itemCard}>
      <Image source={image} style={styles.productImg} />

      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemSub}>{subtitle}</Text>
        <View
          style={{ height: 1, backgroundColor: "#E5E7EB", marginVertical: 10 }}
        />
        <View style={styles.priceRow}>
          <Text style={styles.price}>{price}</Text>
          <Text style={styles.oldPrice}>₹660</Text>
        </View>

        <Text style={styles.bestRate}>₹81/pack Best rate</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require("../assets/Common/Back.png")}
            style={{ height: 18, width: 18 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.title}>sary</Text>

        <Text style={styles.eta}>ETA : 15 Jan, (11:00 AM - 11:00 PM)</Text>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Confirmed Items */}
          <View style={styles.rowBetween}>
            <Text style={styles.section}>Confirmed Items (2 items)</Text>

            <View style={styles.shipBadge}>
              <Text style={styles.shipText}>Ready to Ship</Text>
            </View>
          </View>

          <Text style={styles.subSection}>Packaging Material</Text>

          <ItemCard
            title="MDH - Deggi Mirch, 100 gm"
            subtitle="12 pc"
            price="₹640"
            image={require("../assets/images/product-image.png")}
          />

          <ItemCard
            title="Disposables & Packaging Material"
            subtitle="12 pc"
            price="₹640"
            image={require("../assets/images/product-image.png")}
          />

          {/* Out of stock */}

          <Text style={styles.outStock}>Unavailable/Out of Stock (1 item)</Text>

          <Text style={styles.subSection}>Milk Product</Text>

          <ItemCard
            title="Organic whole milk"
            subtitle="12 pc"
            price="₹640"
            image={require("../assets/images/product-image.png")}
          />

          {/* Price Detail */}

          <Text style={styles.section}>Price Detail</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.PriceLable}>Taxable Value</Text>
            <Text style={styles.PriceLable}>$218</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.PriceLable}>
              Deduction (Out of stock items)
            </Text>
            <Text style={styles.PriceLable}>- $19</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.PriceLable}>GST</Text>
            <Text style={styles.PriceLable}>5%</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.PriceLable}>Promo</Text>
            <Text style={styles.PriceLable}>- $19</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.PriceLable}>Freight Charges</Text>
            <Text style={styles.PriceLable}>- $19</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.PriceLable}>Unloading Charges</Text>
            <Text style={styles.PriceLable}>$5</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.bold}>Revised total (2 items)</Text>
            <Text style={styles.bold}>$192</Text>
          </View>

          {/* Order Detail */}

          <Text style={styles.section}>Order Detail</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.PriceLable}>Order id</Text>
            <Text style={styles.PriceLable}>ORD8803287499</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.PriceLable}>Payment Method</Text>
            <Text style={styles.PriceLable}>Pay Later</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.PriceLable}>Deliver to</Text>
            <Text
              style={{
                width: 200,
                textAlign: "right",
                fontFamily: "DMSans-Regular",
                fontSize: 12,
              }}
            >
              4, Shree Ganesh Apt, Shradhanand Road, Vile Parle
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.PriceLable}>Order date</Text>
            <Text style={styles.PriceLable}>Fri, 16 Jan 25, 4:29 PM</Text>
          </View>

          {/* Download */}

          <Text style={styles.section}>Download Challan</Text>

          <TouchableOpacity style={styles.exportBtn}>
            <Text style={styles.exportText}>Export Excel</Text>
            <Image
              source={require("../assets/Common/Export.png")}
              style={{ height: 18, width: 18 }}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.pdfBtn}>
            <Text style={styles.pdfText}>Save PDF</Text>
            <Image
              source={require("../assets/Common/SavePdf.png")}
              style={{ height: 18, width: 18, tintColor: "#fff" }}
              resizeMode="center"
            />
          </TouchableOpacity>

          {/* Help */}

          <Text style={styles.section}>Need help with your order?</Text>

          <TouchableOpacity style={styles.chatBox}>
            <View
              style={{
                backgroundColor: "#F8F9FD",
                padding: 10,
                borderRadius: 10,
              }}
            >
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

            <Image
              source={require("../assets/Common/ArrowRight.png")}
              style={{
                height: 9,
                width: 9,
                marginLeft: "auto",
              }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default OrderSummery;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F6F8",
    padding: 16,
    // paddingTop: 50,
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
    marginBottom: 12,
    fontFamily: "DMSans-Regular",
  },

  section: {
    fontSize: 18,
    fontFamily: "DMSans-SemiBold",
    marginTop: 20,
    marginBottom: 10,
  },

  subSection: {
    color: "#000000",
    marginBottom: 10,
    fontFamily: "DMSans-Medium",
    fontSize: 14,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  shipBadge: {
    backgroundColor: "#E7F3E7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  shipText: {
    color: "#487D44",
    fontSize: 11,
    fontFamily: "DMSans-Medium",
  },

  itemCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: "center",
  },

  productImg: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 10,
  },

  itemTitle: {
    fontFamily: "DMSans-SemiBold",
    fontSize: 14,
  },

  itemSub: {
    fontSize: 12,
    color: "#777",
    fontFamily: "DMSans-Regular",
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    // marginTop: 4,
  },

  price: {
    fontFamily: "DMSans-SemiBold",
    marginRight: 6,
  },

  oldPrice: {
    color: "red",
    textDecorationLine: "line-through",
    fontSize: 12,
  },

  bestRate: {
    fontSize: 11,
    color: "#487D44",
  },

  outStock: {
    color: "red",
    marginVertical: 8,
    fontFamily: "DMSans-SemiBold",
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  bold: {
    fontFamily: "DMSans-SemiBold",
    fontSize: 12,
  },
  PriceLable: {
    fontFamily: "DMSans-Regular",
    fontSize: 12,
  },
  exportBtn: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },

  exportText: {
    color: "#487D44",
    fontFamily: "DMSans-Medium",
    fontSize: 16,
  },

  pdfBtn: {
    backgroundColor: "#487D44",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },

  pdfText: {
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

  chatTitle: {
    fontFamily: "DMSans-SemiBold",
  },

  chatSub: {
    fontSize: 12,
    color: "#777",
  },
});
