import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { getOrderDetailsApi } from "../services/api";

const OrdersDetailScreen = ({ navigation, route }: any) => {
  const { order_id } = route.params;

  const fallbackImg = require("../assets/Common/Order.png");

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);

  const capitalizeWords = (text: string) =>
    text
      ? text
          .toLowerCase()
          .replace(/[_-]/g, " ")
          .split(" ")
          .filter(Boolean)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      : "";

  /* ================= API ================= */
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);

      const res = await getOrderDetailsApi(order_id);
      console.log("Order Details:", res);

      setOrder(res?.data?.[0] || null);
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  /* ================= HELPERS ================= */

  const getStatusColor = (status: string) => {
    if (status === "pending") return "#FF9933";
    if (status === "complete") return "#2E7D32";
    return "#64748B";
  };

  /* ================= ITEM CARD ================= */

  const ItemCard = ({ item }: any) => {
    const [imgError, setImgError] = useState(false);

    const imageUri = item?.image;
    return (
      <View style={styles.itemCard}>
        <View
          style={{ backgroundColor: "#F4F4F4", padding: 10, borderRadius: 10 }}
        >
          <Image
            source={
              imageUri && !imgError
                ? { uri: imageUri }
                : require("../assets/Common/Order.png")
            }
            resizeMode="contain"
            style={styles.productImg}
            onError={() => setImgError(true)}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.qty}>Qty: {item.qty}</Text>
          <Text style={styles.price}>₹{item.price}</Text>
        </View>
      </View>
    );
  };

  /* ================= UI ================= */

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#487D44" />
      </View>
    );
  }

  if (!order) {
    return <Text style={{ textAlign: "center" }}>No Data</Text>;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* HEADER */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require("../assets/Common/Back.png")}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <Text style={styles.title}>Order Details</Text>

        {/* ORDER INFO */}
        <View style={styles.card}>
          <Text style={styles.invoice}>Invoice No :- {order.invoice_no}</Text>

          <Text
            style={[
              styles.status,
              { color: getStatusColor(order.order_status) },
            ]}
          >
            {capitalizeWords(order.order_status)}
          </Text>

          <Text style={styles.date}>{order.created_at}</Text>

          <Text style={styles.total}>
            Total Amount :- ₹{order.total_amount}
          </Text>
        </View>

        {/* ITEMS */}
        <Text style={styles.sectionTitle}>Products</Text>

        <FlatList
          data={order.items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <ItemCard item={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </SafeAreaView>
  );
};

export default OrdersDetailScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F6F8",
  },

  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  backIcon: {
    height: 18,
    width: 18,
    marginTop: 5,
  },

  title: {
    fontSize: 18,
    marginVertical: 15,
    fontFamily: "DMSans-Medium",
  },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
  },

  invoice: {
    fontSize: 13,
    color: "#374151",
    fontFamily: "DMSans-Regular",
  },

  status: {
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    marginTop: 4,
  },

  date: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
  },

  total: {
    fontSize: 15,
    marginTop: 6,
    fontFamily: "DMSans-SemiBold",
  },

  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    fontFamily: "DMSans-SemiBold",
  },

  itemCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },

  productImg: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },

  productName: {
    fontSize: 13,
    fontFamily: "DMSans-Medium",
  },

  qty: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  price: {
    fontSize: 13,
    marginTop: 3,
    fontFamily: "DMSans-SemiBold",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
