import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Platform,
} from "react-native";
import Styles from "../components/Styles";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import {
  getCartApi,
  getCompanyProfileApi,
  getProfileApi,
  removeCartItemApi,
  updateCartQuantityApi,
} from "../services/api";
import { useFocusEffect } from "@react-navigation/native";
import { debounce } from "lodash";

const CartScreen: React.FC = ({ navigation }: any) => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderSummary, setOrderSummary] = useState<any>(null);
  const [hasGST, setHasGST] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingQtyId, setUpdatingQtyId] = useState<number | null>(null); // Track which item is being updated

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await Promise.all([fetchCart()]);
    } catch (error) {
      console.log("Refresh error:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const getCompanyProfile = async () => {
    try {
      const response = await getCompanyProfileApi();
      const data = response?.data;
      console.log("Get Company Api Data :-------->", data);
      setHasGST(!!data?.gst);
    } catch (error) {
      console.log("Get Profile Error:", error);
    }
  };

  // UPDATE QUANTITY
  const debouncedUpdateCartQuantityApi = useCallback(
    debounce(async (product_id: number, newQty: number, cart_id: number) => {
      try {
        setUpdatingQtyId(product_id);
        if (newQty <= 0) {
          await removeCartItemApi(cart_id);
          console.log("Cart item removed");
        } else {
          const res = await updateCartQuantityApi(product_id, newQty);
          console.log("Update API response:", res);
          // Alert.alert("Success", "Quantity updated successfully");
        }
        // Fetch cart again to update the overall order summary (totals and taxes)
        fetchCart();
      } catch (error) {
        console.log("Update quantity API error:", error);
      } finally {
        setUpdatingQtyId(null);
      }
    }, 1500),
    [],
  );

  const updateQty = async (
    product_id: number,
    type: "inc" | "dec" | "set",
    directValue?: number | string,
  ) => {
    const item = cartItems.find((i) => i.product_id === product_id);
    if (!item) return;

    let currentQty = item.qty === "" ? 0 : Number(item.qty);
    let newQty: number | string = currentQty;

    if (type === "inc") {
      newQty = currentQty + 1;
    } else if (type === "dec") {
      newQty = currentQty - 1;
    } else if (type === "set" && directValue !== undefined) {
      newQty = directValue;
    }

    if (newQty !== "" && Number(newQty) < 0) return;

    try {
      // Optimistic local update
      if (newQty !== "" && Number(newQty) <= 0) {
        setCartItems((prev) => prev.filter((i) => i.product_id !== product_id));
        debouncedUpdateCartQuantityApi(product_id, 0, item.cart_id);
        return;
      }

      setCartItems((prev) =>
        prev.map((i) =>
          i.product_id === product_id ? { ...i, qty: newQty } : i,
        ),
      );

      if (newQty !== "") {
        debouncedUpdateCartQuantityApi(
          product_id,
          Number(newQty),
          item.cart_id,
        );
      }
    } catch (error) {
      console.log("Update quantity error:", error);
    }
  };

  const removeItem = async (cart_id: number) => {
    try {
      const res = await removeCartItemApi(cart_id);
      setCartItems((prev) => prev.filter((item) => item.cart_id !== cart_id));
      Alert.alert("Success", res.message);
    } catch (error) {
      console.log("Remove cart error:", error);
    }
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await getCartApi();
      setCartItems(data.data);
      setOrderSummary(data.orderSummary);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCart();
      getCompanyProfile();
    }, []),
  );

  // const formatPrice = (price: number) => {
  //   return Number(price) % 1 === 0 ? Number(price) : Number(price).toFixed(2);
  // };
  const formatPrice = (price: number) => {
    if (price === undefined || price === null) return "0.00";
    return Number(price).toFixed(2);
  };

  const formatPriceClean = (price: number) => {
    if (price === undefined || price === null) return "0";

    const num = Number(price);

    // if whole number → no decimals
    if (num % 1 === 0) {
      return num.toString();
    }

    // else keep 2 decimals
    return num.toFixed(2);
  };

  // Function to get the best price based on current quantity
  const getCalculatedPrice = (item: any) => {
    let currentPrice = item.price;
    const currentQty = item.qty || 0;

    if (item.price_tiers && item.price_tiers.length > 0) {
      const sortedTiers = [...item.price_tiers].sort((a, b) => b.qty - a.qty);
      for (const tier of sortedTiers) {
        if (currentQty >= tier.qty) {
          currentPrice = tier.price;
          break;
        }
      }
    }

    return currentPrice;
  };

  const CartItem = ({ item }: { item: any }) => {
    return (
      <View style={styles.card}>
        <View
          style={{
            // backgroundColor: "#F2F3F5",
            alignItems: "center",
            justifyContent: "center",
            padding: 5,
            marginRight: 10,
            borderRadius: 10,
            backgroundColor: "#e5e7eb",
          }}
        >
          <Image
            source={
              item.image
                ? { uri: item.image }
                : require("../assets/productimg.jpg")
            }
            style={styles.productImage}
          />
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.topRow}>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={styles.productTitle}>
                {item.name}
              </Text>
            </View>

            <TouchableOpacity
              style={{ paddingLeft: 10 }}
              onPress={() => removeItem(item.cart_id)}
            >
              <Image
                source={require("../assets/Common/trash.png")}
                style={{
                  height: 16,
                  width: 16,
                  tintColor: "#DC2626",
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.line} />

          {/* Enhanced Price Tiers Display - Similar to ProductCard */}
          {item?.price_tiers && item.price_tiers.length > 0 && (
            <View style={styles.variantBox}>
              {item.price_tiers.map((tier: any, index: number) => {
                const isLast = index === item.price_tiers.length - 1;
                return (
                  <View key={index}>
                    <View style={styles.variantRow}>
                      <Text style={styles.slabPrice}>
                        {tier.qty} Pc ₹{formatPrice(tier.price)}/pc
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          updateQty(item.product_id, "set", tier.qty)
                        }
                      >
                        <Text style={styles.addSmall}>Add+</Text>
                      </TouchableOpacity>
                    </View>
                    {!isLast && <View style={styles.dividerPrice} />}
                  </View>
                );
              })}
            </View>
          )}

          <View style={styles.bottomRow}>
            <View>
              <View style={styles.priceRow}>
                <Text style={styles.price}>
                  ₹{formatPriceClean(getCalculatedPrice(item))}
                </Text>
                <Text style={styles.oldPrice}>
                  ₹{formatPriceClean(item.mrp)}
                </Text>
              </View>
              {/* Show best rate based on current quantity */}
              {/* {item.price_tiers && item.price_tiers.length > 0 && (
                <Text style={styles.bestRate}>
                  Best rate: ₹{getCalculatedPrice(item)}/pc at {item.qty || 0}{" "}
                  pcs
                </Text>
              )} */}
            </View>

            <View style={styles.qtyBox}>
              {updatingQtyId === item.product_id ? (
                <ActivityIndicator size="small" color="#487D44" />
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQty(item.product_id, "dec")}
                  >
                    <Text style={styles.qtyicon}>-</Text>
                  </TouchableOpacity>

                  <TextInput
                    style={styles.qtyText}
                    keyboardType="numeric"
                    value={
                      item.qty !== undefined && item.qty !== null
                        ? String(item.qty)
                        : ""
                    }
                    onChangeText={(text) => {
                      const val = text.replace(/[^0-9]/g, "");
                      updateQty(
                        item.product_id,
                        "set",
                        val === "" ? "" : Number(val),
                      );
                    }}
                    onBlur={() => {
                      if (String(item.qty) === "" || item.qty === 0) {
                        updateQty(item.product_id, "set", 0);
                      }
                    }}
                  />

                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQty(item.product_id, "inc")}
                  >
                    <Text style={styles.qtyicon}>+</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      {/* HEADER */}
      <Header
        title={`Cart (${cartItems.length})`}
        showBack={false}
        containerStyle={{ paddingHorizontal: 8 }}
        rightComponent={
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity style={styles.headerBtn}>
              <Text style={styles.headerBtnText}>Export Excel</Text>
              <Image
                source={require("../assets/Common/excel.png")}
                style={{
                  height: 12,
                  width: 12,
                  tintColor: "#fff",
                  marginLeft: 5,
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.headerBtn}>
              <Text style={styles.headerBtnText}>Save PDF</Text>
              <Image
                source={require("../assets/Common/SavePdf.png")}
                style={{
                  height: 12,
                  width: 12,
                  tintColor: "#fff",
                  marginLeft: 5,
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        }
      />

      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#487D44"]}
            />
          }
        >
          {loading ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingVertical: 40,
              }}
            >
              <ActivityIndicator size="large" color="#487D44" />
            </View>
          ) : (
            <>
              {/* CART ITEMS */}
              <FlatList
                data={cartItems}
                keyExtractor={(item) => item.cart_id.toString()}
                renderItem={({ item }) => <CartItem item={item} />}
                scrollEnabled={false}
                ListEmptyComponent={() => (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                      paddingVertical: 40,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "DMSans-Medium",
                        fontSize: 16,
                        color: "#666",
                      }}
                    >
                      Cart is Empty yet
                    </Text>
                  </View>
                )}
              />
            </>
          )}

          {cartItems.length > 0 && (
            <>
              {/* ORDER SUMMARY */}
              <Text style={styles.sectionTitle}>Order Summary</Text>

              <View style={[styles.summaryRow, { marginTop: 10 }]}>
                <Text style={styles.summaryText}>Taxable Value</Text>
                <Text style={{ fontSize: 12, fontFamily: "DMSans-Regular" }}>
                  ₹{orderSummary?.taxable}
                </Text>
              </View>

              {orderSummary?.gstBifurcation?.map((gst: any, index: number) => (
                <View key={index} style={styles.summaryRow}>
                  <Text style={styles.summaryText}>
                    GST ({gst.percentage}%)
                  </Text>
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

              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={() => {
                  if (!hasGST) {
                    Alert.alert(
                      "Complete Profile",
                      "Please complete your account setup (GST required) before purchasing.",
                      [
                        {
                          text: "Go to Setup",
                          onPress: () =>
                            navigation.navigate("Profile", {
                              screen: "CompanyProfile",
                            }),
                        },
                        { text: "Cancel", style: "cancel" },
                      ],
                    );
                  } else {
                    navigation.navigate("CheckoutScreen");
                  }
                }}
              >
                <Text style={styles.checkoutText}>Proceed to Checkout</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerBtn: {
    backgroundColor: "#487D44",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  headerBtnText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "DMSans-Medium",
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 12,
    marginBottom: 15,
  },

  productImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },

  productTitle: {
    fontSize: 14,
    fontFamily: "DMSans-Medium",
  },

  line: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 8,
  },

  priceRow: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },

  price: {
    fontSize: 14,
    fontFamily: "DMSans-SemiBold",
    color: "#000",
  },

  oldPrice: {
    textDecorationLine: "line-through",
    color: "#FF7878",
    fontSize: 12,
  },

  bestRate: {
    fontSize: 10,
    color: "#487D44",
    marginTop: 2,
    fontFamily: "DMSans-Regular",
  },

  qtyBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F3E8",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: Platform.OS === "ios" ? 3 : 0,
  },

  qtyBtn: {
    width: 20,
    height: 20,
    borderRadius: 12,
    backgroundColor: "#487D44",
    alignItems: "center",
    justifyContent: "center",
  },

  qtyText: {
    marginHorizontal: 8,
    fontFamily: "DMSans-Medium",
    color: "#487D44",
    fontSize: 14,
    minWidth: 30,
    textAlign: "center",
  },

  sectionTitle: {
    fontSize: 18,
    fontFamily: "DMSans-Medium",
    marginTop: 20,
    marginBottom: 10,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 9,
  },

  summaryText: {
    fontFamily: "DMSans-Medium",
    fontSize: 12,
  },

  checkoutBtn: {
    backgroundColor: "#487D44",
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },

  checkoutText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "DMSans-Medium",
  },

  variantBox: {
    backgroundColor: "#F4F4F4",
    borderColor: "#E6E7EE",
    borderRadius: 8,
    padding: 8,
  },

  variantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  slabPrice: {
    fontSize: 12,
    fontFamily: "DMSans-Regular",
    color: "#000000",
  },

  addSmall: {
    fontSize: 12,
    color: "#487D44",
    fontWeight: "600",
    fontFamily: "DMSans-Medium",
  },

  dividerPrice: {
    height: 1,
    backgroundColor: "#E6E7EE",
    marginVertical: 8,
  },
  qtyicon: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "DMSans-Regular",
  },
});
