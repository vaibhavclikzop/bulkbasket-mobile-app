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
import { getOrderApi } from "../services/api";

/* ================= TYPES ================= */

type Order = {
  id: number | string;
  invoice_no: string;
  total_amount: string;
  created_at: string;
  delivery_date: string | null;
  order_status: string;
  payment_status: string;
  image?: string; // optional image from API
};

/* ================= COMPONENT ================= */

const OrdersScreen = ({ navigation }: any) => {
  const fallbackImg = require("../assets/Common/Order.png");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const formatDateTime = (dateString: string) => {
    const safeDate = dateString.replace(" ", "T");
    const date = new Date(safeDate);

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  /* ================= API ================= */

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const res = await getOrderApi();
      console.log("Orders:", res);

      setOrders(res?.data || []);
    } catch (error) {
      console.log("Order Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* ================= HELPERS ================= */

  const getStatusText = (status: string) => {
    if (status === "pending") return "Order Pending";
    if (status === "complete") return "Order Delivered";
    return status;
  };

  const getStatusColor = (status: string) => {
    if (status === "pending") return "#FF9933";
    if (status === "complete") return "#2E7D32";
    return "#64748B";
  };

  /* ================= IMAGE COMPONENT ================= */

  const OrderImage = ({ uri }: { uri?: string }) => {
    const [imgError, setImgError] = useState(false);

    if (!uri || imgError) {
      return <Image source={fallbackImg} style={styles.productImg} />;
    }

    return (
      <Image
        source={{ uri }}
        style={styles.productImg}
        onError={() => setImgError(true)}
      />
    );
  };

  /* ================= CARD ================= */

  const OrderCard = ({ item }: { item: Order }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate("OrdersDetailScreen", {
            order_id: item.id,
          })
        }
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <OrderImage uri={item.image} />

            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text
                style={[
                  styles.status,
                  { color: getStatusColor(item.order_status) },
                ]}
              >
                {getStatusText(item.order_status)}
              </Text>

              <Text style={styles.invoice}>Invoice: {item.invoice_no}</Text>
              <View
                style={{
                  height: 1,
                  backgroundColor: "#E5E7EB",
                  marginVertical: 6,
                }}
              />
              <Text style={styles.date}>
                {formatDateTime(item.delivery_date || item.created_at)}
              </Text>

              <Text style={styles.price}>₹{item.total_amount}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  /* ================= UI ================= */

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require("../assets/Common/Back.png")}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <Text style={styles.title}>Your Orders</Text>

        {/* LIST */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#487D44"
            style={{ marginTop: 40 }}
          />
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => <OrderCard item={item} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No orders found</Text>
            }
          />
        )}

        {/* HELP */}
        {/* {!loading && orders.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Need help with your order?</Text>

            <TouchableOpacity style={styles.chatBox}>
              <View style={styles.chatIcon}>
                <Image
                  source={require("../assets/Common/chat.png")}
                  style={{ width: 20, height: 20 }}
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
                style={styles.arrow}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </>
        )} */}
      </View>
    </SafeAreaView>
  );
};

export default OrdersScreen;

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
    fontFamily: "DMSans-Medium",
    marginVertical: 15,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  cardHeader: {
    flexDirection: "row",
    padding: 14,
    alignItems: "center",
  },

  productImg: {
    width: 65,
    height: 65,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },

  status: {
    fontFamily: "DMSans-Medium",
    fontSize: 15,
  },

  invoice: {
    fontSize: 12,
    color: "#374151",
    marginTop: 2,
    fontFamily: "DMSans-Regular",
  },

  date: {
    fontSize: 11,
    color: "#64748B",
    marginVertical: 2,
    fontFamily: "DMSans-Regular",
  },

  price: {
    fontFamily: "DMSans-SemiBold",
    // marginTop: 4,
    fontSize: 14,
  },

  sectionTitle: {
    fontSize: 16,
    fontFamily: "DMSans-SemiBold",
    marginTop: 10,
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
  },

  arrow: {
    height: 9,
    width: 9,
    marginLeft: "auto",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#64748B",
    fontFamily: "DMSans-Regular",
  },
});
