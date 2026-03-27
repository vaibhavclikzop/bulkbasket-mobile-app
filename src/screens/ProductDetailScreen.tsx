import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { debounce } from "lodash";
import Swiper from "react-native-swiper";
import ProductCard from "../components/ProductCard";
import Header from "../components/Header";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  getProductDetailsApi,
  addToCartApi,
  updateCartQuantityApi,
  addToWishlistApi,
  updateWishlistQtyApi,
  getCartApi,
} from "../services/api";

const backeryItems = [
  {
    id: "1",
    image: require("../assets/product/product1-.png"),
    title: "Morde - Dark Compound (CO D15), 500 gm",
    packSize: "Pack of 10",
    price: "640",
    oldPrice: "₹660",
    discount: "33",
    isOrganic: true,
  },
  {
    id: "2",
    image: require("../assets/product/product3-.png"),
    title: "Cello Tape - Transparent W: 1 Inch, L: 55 m",
    packSize: "Pack of 20",
    price: "820",
    oldPrice: "₹900",
    discount: "10",
    isOrganic: false,
  },
  {
    id: "3",
    image: require("../assets/product/product3-.png"),
    title: "Morde - Dark Compound (CO D15), 500 gm",
    packSize: "Pack of 20",
    price: "820",
    oldPrice: "₹900",
    discount: "10",
    isOrganic: false,
  },
];

const ProductDetailScreen = ({ navigation, route }: any) => {
  const [quantity, setQuantity] = React.useState(0);
  const [liked, setLiked] = useState(false);
  const [productDetail, setProductDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [updatingQty, setUpdatingQty] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartLoading, setCartLoading] = useState(true);

  const productId = route?.params?.productId;

  const fetchCart = async () => {
    try {
      setCartLoading(true);

      const data = await getCartApi();
      setCartItems(data.data || []);
    } catch (error) {
      console.log("Cart fetch error:", error);
    } finally {
      setCartLoading(false);
    }
  };
  useEffect(() => {
    fetchCart();
  }, []);

  const debouncedUpdateCartApi = React.useCallback(
    debounce(async (id: number, newQty: number) => {
      try {
        setUpdatingQty(true);
        const res = await updateCartQuantityApi(id, newQty);
        console.log("Update Qty Res:", res);
      } catch (error) {
        console.log("Update Qty Error:", error);
      } finally {
        setUpdatingQty(false);
      }
    }, 1500),
    [],
  );

  const handleAddToCart = async (qty: number = 1) => {
    if (!productId) return;
    try {
      setAddingToCart(true);
      const res = await addToCartApi(productId, qty);
      console.log("Add to Cart Response", res.data);
      setQuantity(qty);
      // Alert.alert("Success", "Successfully added to cart");
    } catch (error) {
      console.log(error);
    } finally {
      setAddingToCart(false);
    }
  };

  const toggleWishlist = async () => {
    if (!productDetail) return;
    try {
      const newStatus = !liked;
      setLiked(newStatus); // Optimistic UI update

      if (newStatus) {
        await addToWishlistApi(productId);
        // Alert.alert("Success", "Successfully added to wishlist");
      } else {
        await updateWishlistQtyApi(productId, 0);
        Alert.alert("Success", "Item removed from wishlist");
      }
    } catch (error) {
      console.log("Wishlist Toggle Error:", error);
      setLiked(liked);
    }
  };

  const updateQty = async (newQty: number | string) => {
    const isTextInputEmpty = newQty === "" || Number.isNaN(Number(newQty));
    const finalQty = isTextInputEmpty ? 0 : Number(newQty);

    if (finalQty < 0) return;

    setQuantity(newQty as any);

    if (productId && !isTextInputEmpty) {
      debouncedUpdateCartApi(productId, finalQty);
    }
  };

  useEffect(() => {
    if (productId) {
      setLoading(true);
      getProductDetailsApi(productId)
        .then((res) => {
          console.log("Product Detail Data:", res);
          const data = res?.data || res;
          setProductDetail(data);

          if (data?.cart_status && data?.cart?.qty) {
            setQuantity(data.cart.qty);
          } else {
            setQuantity(0);
          }

          if (data?.wishlist_status) {
            setLiked(true);
          } else {
            setLiked(false);
          }
        })
        .catch((error) => console.log("Product Detail Error:", error))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [productId]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* HEADER */}
      <Header
        centerComponent={
          <TouchableOpacity
            style={styles.searchBox}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Search")}
          >
            <Image
              source={require("../assets/Common/search.png")}
              style={{ height: 18, width: 18 }}
            />
            <Text style={[styles.searchInput, { color: "#888", marginTop: 2 }]}>
              Search products...
            </Text>
          </TouchableOpacity>
        }
        rightComponent={
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Cart", { screen: "CartMain" })}
              style={styles.iconCircle}
            >
              <Image
                source={require("../assets/Common/cart.png")}
                style={{ height: 18, width: 18, tintColor: "#3A7D44" }}
              />
              {(cartLoading || cartItems.length > 0) && (
                <View style={styles.badgeCart}>
                  {cartLoading ? (
                    <ActivityIndicator size="small" color="#3A7D44" />
                  ) : (
                    <Text style={styles.badgeText}>{cartItems.length}</Text>
                  )}
                </View>
              )}
            </TouchableOpacity>

            {/* <TouchableOpacity style={styles.iconCircle}>
              <Image
                source={require("../assets/Common/Share.png")}
                resizeMode="contain"
                style={{ height: 20, width: 20 }}
              />
            </TouchableOpacity> */}
          </View>
        }
      />
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#487D44" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/*  PRODUCT IMAGE */}
          <View style={styles.imageSection}>
            {productDetail?.image ? (
              <Image
                source={{ uri: productDetail.image }}
                style={[
                  styles.productImage,
                  { height: 250, resizeMode: "contain" },
                ]}
              />
            ) : (
              <Swiper
                autoplay
                autoplayTimeout={3}
                showsPagination={true}
                dotStyle={styles.dot}
                activeDotStyle={styles.activeDot}
                paginationStyle={styles.paginationContainer}
                height={250}
              >
                <Image
                  source={require("../assets/images/product-image.png")}
                  style={styles.productImage}
                  resizeMode="contain"
                />

                <Image
                  source={require("../assets/images/product-image.png")}
                  style={styles.productImage}
                  resizeMode="contain"
                />

                <Image
                  source={require("../assets/images/product-image.png")}
                  style={styles.productImage}
                  resizeMode="contain"
                />
              </Swiper>
            )}

            {/* Wishlist Icon */}
            <TouchableOpacity
              onPress={toggleWishlist}
              style={styles.wishlistIcon}
            >
              <Image
                source={
                  liked
                    ? require("../assets/Common/fillheart.png")
                    : require("../assets/Common/heart.png")
                }
                style={{
                  height: 18,
                  width: 18,
                  resizeMode: "contain",
                }}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.productRow}>
              {/* LEFT SIDE */}
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{productDetail?.name}</Text>
              </View>

              {/* RIGHT SIDE */}
              <View style={styles.priceColumn}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.price}>
                    ₹{productDetail?.price || productDetail?.mrp}
                  </Text>
                  {productDetail?.mrp > 0 &&
                    productDetail?.price !== productDetail?.mrp && (
                      <Text style={styles.oldPrice}>₹{productDetail.mrp}</Text>
                    )}
                </View>
                {productDetail?.discount > 0 && (
                  <Text style={styles.save}>
                    Save {productDetail.discount}%
                  </Text>
                )}
              </View>
            </View>

            {productDetail?.tiers && productDetail.tiers.length > 0 && (
              <View style={styles.optionBox}>
                {productDetail.tiers.map((tier: any, index: number) => (
                  <View key={index}>
                    <View style={styles.optionRow}>
                      <Text style={styles.pText}>
                        {tier.qty} Pc ₹{tier.price}/pc
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          if (quantity > 0) {
                            updateQty(tier.qty);
                          } else {
                            handleAddToCart(tier.qty);
                          }
                        }}
                      >
                        <Text style={styles.addText}>Add+</Text>
                      </TouchableOpacity>
                    </View>
                    {index < productDetail.tiers.length - 1 && (
                      <View style={styles.dividerP} />
                    )}
                  </View>
                ))}
              </View>
            )}

            {quantity === 0 ? (
              <TouchableOpacity
                style={styles.cartButton}
                onPress={() => handleAddToCart()}
                disabled={addingToCart}
              >
                {addingToCart ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Image
                      source={require("../assets/Common/cart.png")}
                      style={{
                        height: 16,
                        width: 16,
                        tintColor: "#fff",
                      }}
                      resizeMode="contain"
                    />
                    <Text style={styles.cartText}> Add to Cart</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.actionRow}>
                <View style={styles.qtyBox}>
                  {updatingQty ? (
                    <ActivityIndicator size="small" color="#487D44" />
                  ) : (
                    <>
                      <TouchableOpacity
                        onPress={() =>
                          updateQty(
                            Number(quantity) > 1 ? Number(quantity) - 1 : 0,
                          )
                        }
                        style={styles.qtyBtn}
                      >
                        <Image
                          source={require("../assets/Common/sub.png")}
                          style={[{ tintColor: "", height: 20, width: 20 }]}
                        />
                      </TouchableOpacity>

                      <TextInput
                        style={styles.qtyNumber}
                        keyboardType="numeric"
                        value={
                          quantity !== undefined && quantity !== null
                            ? String(quantity)
                            : ""
                        }
                        onChangeText={(text) => {
                          const val = text.replace(/[^0-9]/g, "");
                          if (val === "") {
                            updateQty("");
                          } else {
                            updateQty(Number(val));
                          }
                        }}
                        onBlur={() => {
                          if (String(quantity) === "" || quantity === 0) {
                            updateQty(0);
                            if (productId) {
                              debouncedUpdateCartApi(productId, 0);
                            }
                          }
                        }}
                      />

                      <TouchableOpacity
                        onPress={() => updateQty(Number(quantity || 0) + 1)}
                        style={styles.qtyBtn}
                      >
                        <Image
                          source={require("../assets/Common/add.png")}
                          style={[{ height: 20, width: 20 }]}
                        />
                      </TouchableOpacity>
                    </>
                  )}
                </View>

                {/* Buy Now */}
                <TouchableOpacity
                  style={styles.buyNowBtn}
                  onPress={() => navigation.navigate("Cart", { screen: "CartMain" })}
                >
                  <Text style={styles.buyNowText}>Buy Now</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.dividerPrice} />

            <View style={styles.detailSection}>
              <Text style={styles.detailTitle}>Product details :</Text>

              {/* Bullet 1 */}
              <View style={styles.bulletRow}>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.bulletText}>
                  {productDetail?.description || productDetail?.name}
                </Text>
              </View>
            </View>

            {/* <View style={styles.dividerPrice} /> */}

            {/* <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <View style={styles.imageB}>
                  <Image
                    source={require("../assets/icons/box-alt1.png")}
                    style={{ height: 20, width: 20, resizeMode: "contain" }}
                  />
                </View>
                <View>
                  <Text style={styles.badgeTitle}>Packaging</Text>
                  <Text style={styles.badgeSub}>Paper Box</Text>
                  <Text style={styles.badgeSubB}>(Recyclable)</Text>
                </View>
              </View> */}

            {/* <View style={styles.badge}>
                <View style={styles.imageB}>
                  <Image
                    source={require("../assets/icons/degree1.png")}
                    style={{ height: 20, width: 20, resizeMode: "contain" }}
                  />
                </View>
                <View>
                  <Text style={styles.badgeTitle}>Certified</Text>
                  <Text style={styles.badgeSub}>FSSAI / Organic</Text>
                  <Text style={styles.badgeSubB}></Text>
                </View>
              </View>
            </View> */}
          </View>

          <View style={styles.headerRow}>
            <Text style={styles.dealTitle}>Suggested Products</Text>
          </View>
          <FlatList
            data={backeryItems}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ProductCard
                image={item.image}
                title={item.title}
                packSize={item.packSize}
                price={item.price}
                oldPrice={item.oldPrice}
                discount={item.discount}
                isOrganic={item.isOrganic}
                bestRate="₹81/pack Best rate"
                onAddPress={() => console.log("Added")}
              />
            )}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default ProductDetailScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  pText: {
    fontSize: 14,
    fontFamily: "DMSans-Regular",
  },
  dealTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
    fontFamily: "DMSans-Medium",
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eee",
    borderWidth: 1,
    marginHorizontal: 10,
    padding: 8,
    borderColor: "#d3cdcd",
    borderRadius: 20,
  },

  iconCircle: {
    marginLeft: 8,
    backgroundColor: "#eee",
    padding: 8,
    borderWidth: 1,
    borderColor: "#d3cdcd",
    borderRadius: 20,
  },
  imageB: {
    borderWidth: 1,
    padding: 8,
    borderRadius: 7,
    borderColor: "#d3cdcd",
  },
  imageSection: {
    alignItems: "center",
    marginVertical: 20,
  },
  paginationContainer: {
    position: "absolute",
    bottom: 10,
    left: "43%",
    right: "43%",
    backgroundColor: "#DFDFDF", // 20% opacity
    // paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },
  productImage: {
    width: "100%",
    height: 220,
    alignSelf: "center",
  },
  searchInput: {
    flex: 1,
    marginLeft: 6,
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    paddingVertical: 0,
  },
  wishlistIcon: {
    position: "absolute",
    right: 20,
    top: 10,
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 20,
    elevation: 4,
  },

  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 20,
    margin: 10,
  },

  title: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "DMSans-SemiBold",
  },

  pack: {
    color: "#888",
    fontSize: 10,
    marginVertical: 4,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },

  price: {
    fontSize: 14,
    fontFamily: "DMSans-SemiBold",
  },

  oldPrice: {
    textDecorationLine: "line-through",
    marginLeft: 6,
    fontSize: 10,
    fontFamily: "DMSans-SemiBold",
    color: "#FF7878",
  },

  save: {
    marginLeft: 8,
    fontSize: 10,
    fontFamily: "DMSans-Medium",
    color: "#487D44",
  },

  optionBox: {
    backgroundColor: "#f1f1f1",
    borderRadius: 12,
    marginVertical: 12,
  },

  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
  },

  addText: {
    fontSize: 13,
    color: "#487D44",
    fontFamily: "DMSans-Regular",
  },

  cartButton: {
    flexDirection: "row",
    backgroundColor: "#487D44",
    padding: 14,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  cartText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "DMSans-Medium",
    marginLeft: 5,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },

  qtyBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F4F4",
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#E6E7EE",
    paddingHorizontal: 15,
    height: 50,
  },

  qtyBtn: {
    padding: 5,
  },

  qtyNumber: {
    marginHorizontal: 15,
    fontSize: 15,
    fontFamily: "DMSans-SemiBold",
    color: "#487D44",
  },

  buyNowBtn: {
    backgroundColor: "#487D44",
    borderRadius: 14,
    height: 50,
    flex: 1,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  buyNowText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "DMSans-Medium",
  },
  inBtn: {
    color: "#fff",
    backgroundColor: "#487D44",
    padding: 2,
    borderRadius: 12,
  },

  detailSection: {
    marginTop: 15,
  },

  detailTitle: {
    marginBottom: 5,
    fontFamily: "DMSans-SemiBold",
    fontSize: 14,
  },

  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },

  dot: {
    fontSize: 15,
    marginRight: 2,
    lineHeight: 20,
  },

  bulletText: {
    flex: 1,
    lineHeight: 15,
    fontSize: 12,
    color: "#374151",
    fontFamily: "DMSans-Regular",
  },

  badgeRow: {
    flexDirection: "row",
    marginTop: 15,
    alignItems: "center",
  },

  badge: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 10,
    borderRadius: 10,
  },

  badgeTitle: {
    fontSize: 10,
    marginLeft: 10,
    color: "#777",
    fontFamily: "DMSans-Regular",
  },

  badgeSub: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: "DMSans-SemiBold",
  },

  badgeSubB: {
    fontSize: 8,
    color: "green",
    fontFamily: "DMSans-Regular",

    marginLeft: 10,
  },

  suggestedTitle: {
    fontSize: 16,
    fontWeight: "600",
    margin: 15,
  },

  suggestedCard: {
    width: 150,
    backgroundColor: "#fff",
    marginLeft: 15,
    padding: 10,
    borderRadius: 12,
  },

  suggestedImage: {
    height: 80,
    backgroundColor: "#eee",
    borderRadius: 10,
  },

  suggestedName: {
    fontSize: 12,
    marginVertical: 5,
  },

  suggestedPrice: {
    fontWeight: "bold",
  },

  bottomTab: {
    height: 60,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#eee",
  },

  activeDot: {
    backgroundColor: "#3A7D44",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
  },

  tabText: {
    fontSize: 11,
    marginTop: 4,
    color: "#777",
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  priceColumn: {
    alignItems: "flex-end",
  },
  dividerPrice: {
    height: 1,
    backgroundColor: "#b2b3b880",
    // marginVertical: 8,
    marginTop: 12,
  },
  dividerP: {
    height: 1,
    backgroundColor: "#E6E7EE80",
    marginVertical: 1,
  },
  badgeCart: {
    position: "absolute",
    right: -5,
    top: -5,
    backgroundColor: "#F59E0B",
    borderRadius: 50,
    width: 18, // ✅ FIX: fixed width
    height: 18, // ✅ FIX: fixed height
    justifyContent: "center",
    alignItems: "center",
  },

  badgeText: {
    color: "#000",
    fontSize: 8,
    fontWeight: "bold",
  },
});
