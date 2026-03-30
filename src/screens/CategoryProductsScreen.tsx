import React, { useState, useCallback, useRef, useEffect } from "react";
import { debounce } from "lodash";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Modal,
  TextInput,
  Platform,
  RefreshControl,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import ProductCard from "../components/ProductCard";
import Styles from "../components/Styles";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused, useFocusEffect } from "@react-navigation/native";
import {
  addToCartApi,
  addToWishlistApi,
  getCartApi,
  getCategoriesApi,
  getProductsApi,
  updateCartQuantityApi,
  updateWishlistQtyApi,
} from "../services/api";

const packingItems = [
  {
    id: "1",
    image: require("../assets/product/product1-.png"),
    title: "Disposables & Packaging Material",
    packSize: "Pack of 10",
    price: "640",
    oldPrice: "₹660",
    discount: "33",
    isOrganic: true,
  },
  {
    id: "2",
    image: require("../assets/product/product1-.png"),
    title: "Cello Tape - Transparent W: 1 Inch, L: 55 m",
    packSize: "Pack of 20",
    price: "820",
    oldPrice: "₹900",
    discount: "10",
    isOrganic: true,
  },
  {
    id: "3",
    image: require("../assets/product/product1-.png"),
    title: "Disposables & Packaging",
    packSize: "Pack of 20",
    price: "820",
    oldPrice: "₹900",
    discount: "10",
    isOrganic: false,
  },
];

interface Tier {
  qty: number;
  price: number;
}

interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
  mrp: number;
  discount: number;
  tiers?: Tier[];
  wishlist_status: boolean;
  cart_status?: boolean;
  cart?: {
    qty: number;
  };
  product_type?: string;
  product_sub_sub_category?: number | string;
  // bestRate: number;
}

interface SubSubCategory {
  id: string;
  name: string;
  isSort?: boolean;
  label?: string;
}

interface Category {
  sub_category_id: number | string;
  sub_category: string;
  image: string;
  subSubCategory: SubSubCategory[];
  products: Product[];
}

const CategoryProductsScreen = ({ navigation, route }: any) => {
  const isFocused = useIsFocused();
  const [qty, setQty] = useState(0);
  // const [likedProducts, setLikedProducts] = useState({});
  const { categoryId, catname } = route.params;
  const [selectedCategoryId, setSelectedCategoryId] = useState(categoryId);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  // console.log("casdfgksjdflksd", categoryId, catname);
  const [showDropdown, setShowDropdown] = useState(false);
  const [allCategories, setAllCategories] = useState([]);
  const [selectedSubSubCats, setSelectedSubSubCats] = useState<number[]>([]);
  const [currentCatName, setCurrentCatName] = useState(catname);
  const [loading, setLoading] = useState(true);
  const [addingToCartId, setAddingToCartId] = useState<number | null>(null);
  const [updatingQtyId, setUpdatingQtyId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const productListRef = useRef<FlatList>(null);

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

  const fetchCategories = async () => {
    try {
      const data = await getCategoriesApi();
      console.log("Cat Data", data);
      setAllCategories(data.data);
    } catch (error) {
      console.log("error CAat", error);
    }
  };

  const formatPrice = (price: number) => {
    return Number(price) % 1 === 0 ? Number(price) : Number(price).toFixed(2);
  };

  const getCalculatedPrice = (item: Product) => {
    let currentPrice = item.price;
    const currentQty = item.cart?.qty || 0;

    if (item.tiers && item.tiers.length > 0) {
      const sortedTiers = [...item.tiers].sort((a, b) => b.qty - a.qty);
      for (const tier of sortedTiers) {
        if (currentQty >= tier.qty) {
          currentPrice = tier.price;
          break;
        }
      }
    }
    return currentPrice;
  };

  const fetchProducts = async (
    id?: number,
    subcatId?: number | string,
    subsubcats: number[] = [],
  ) => {
    try {
      setLoading(true);

      const resolvedId = id ?? selectedCategoryId;

      if (resolvedId) {
        const data = await getProductsApi(
          resolvedId,
          subcatId as any,
          subsubcats,
        );

        console.log("Products API:", data.data);

        if (!subcatId || subcatId === "all") {
          const allProducts = data.data.flatMap(
            (cat: Category) => cat.products || [],
          );

          const allSubSubCatsMap = new Map();
          data.data.forEach((cat: Category) => {
            if (cat.subSubCategory) {
              cat.subSubCategory.forEach((subSub) => {
                if (!allSubSubCatsMap.has(subSub.id)) {
                  allSubSubCatsMap.set(subSub.id, subSub);
                }
              });
            }
          });
          const allSubSubCategories = Array.from(allSubSubCatsMap.values());

          const allCategory: Category = {
            sub_category_id: "all",
            sub_category: "All",
            image: "local_all_icon",
            subSubCategory: allSubSubCategories,
            products: allProducts,
          };
          setCategories([allCategory, ...data.data]);
        }
        // FILTER PRODUCTS ONLY
        else {
          let newProducts: any[] = [];
          if (Array.isArray(data.data)) {
            // Check if data is directly an array of products
            if (data.data.length > 0 && !("sub_category_id" in data.data[0])) {
              newProducts = data.data;
            } else {
              // It's an array of categories, find the matching one
              const matchedCategory = data.data.find(
                (c: any) => String(c.sub_category_id) === String(subcatId),
              );
              newProducts = matchedCategory
                ? matchedCategory.products || []
                : data.data[0]?.products || [];
            }
          }

          setCategories((prev) =>
            prev.map((cat) =>
              String(cat.sub_category_id) === String(subcatId)
                ? { ...cat, products: newProducts }
                : cat,
            ),
          );
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: number, quantity: number = 1) => {
    try {
      setAddingToCartId(productId);
      const res = await addToCartApi(productId, quantity);
      console.log("Add to Cart Responce", res.data);

      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          products: cat.products.map((p) =>
            p.id === productId
              ? { ...p, cart_status: true, cart: { qty: quantity } }
              : p,
          ),
        })),
      );
      fetchCart();
      // Alert.alert("Success", "Successfully added to cart");
    } catch (error) {
      console.log(error);
    } finally {
      setAddingToCartId(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
      fetchCategories();
      fetchCart();
    }, [route?.params?.categoryId]),
  );

  const debouncedUpdateCartApi = useCallback(
    debounce(async (productId: number, newQty: number) => {
      try {
        setUpdatingQtyId(productId);
        if (newQty === 0) {
          // You may decide to keep or remove the API call here when it's precisely 0
          // (meaning they probably meant to remove it, or maybe wait for more input).
          // We will update it so it does get removed from backend if they leave it at 0.
        }
        const res = await updateCartQuantityApi(productId, newQty);
        console.log("res", res);
        // Alert.alert("Success", "Quantity updated successfully");
      } catch (error) {
        console.log("Update Qty Error:", error);
      } finally {
        setUpdatingQtyId(null);
      }
    }, 1500),
    [],
  );

  const updateQty = async (productId: number, newQty: number | string) => {
    // If user cleared the input manually, we store 0 (or a temporary state) but
    // keep cart_status true so the input box doesn't vanish while typing.
    const isTextInputEmpty = newQty === "" || Number.isNaN(Number(newQty));
    const finalQty = isTextInputEmpty ? 0 : Number(newQty);

    if (finalQty < 0) return;

    // 1. Update UI Locally Immediately
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        products: cat.products.map((p) =>
          p.id === productId
            ? {
                ...p,
                cart: { qty: isTextInputEmpty ? ("" as any) : finalQty },
                // If it's a manual minus button to 0, it removes.
                // If it's text input to empty string "", we keep it visible briefly.
                cart_status: newQty === 0 ? false : true,
              }
            : p,
        ),
      })),
    );

    debouncedUpdateCartApi(productId, finalQty);
  };

  const toggleWishlist = async (product: Product) => {
    try {
      const newStatus = !product.wishlist_status;

      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          products: cat.products.map((p) =>
            p.id === product.id ? { ...p, wishlist_status: newStatus } : p,
          ),
        })),
      );

      if (newStatus) {
        const res = await addToWishlistApi(product.id);
        // Alert.alert("Success", "Successfully added to wishlist");
      } else {
        const res = await updateWishlistQtyApi(product.id, 0);
        // console.log("Wishlist Removed:", res);
        // Alert.alert("Success", "Item removed from wishlist");
      }
    } catch (error) {
      console.log("Wishlist Toggle Error:", error);
      // Revert if API fails
      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          products: cat.products.map((p) =>
            p.id === product.id
              ? { ...p, wishlist_status: product.wishlist_status }
              : p,
          ),
        })),
      );
    }
  };

  const filteredProducts = (categories[selectedIndex]?.products || []).filter(
    (p) => {
      if (selectedSubSubCats.length === 0) return true;
      return selectedSubSubCats
        .map(String)
        .includes(String(p.product_sub_sub_category));
    },
  );

  useEffect(() => {
    if (productListRef.current) {
      productListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, [selectedIndex, selectedSubSubCats]);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);

      await fetchProducts(
        selectedCategoryId,
        categories[selectedIndex]?.sub_category_id,
        selectedSubSubCats,
      );
    } catch (err) {
      console.log("Refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  }, [selectedCategoryId, selectedIndex, selectedSubSubCats, categories]);

  return (
    <>
      {isFocused && (
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />
      )}
      <SafeAreaView style={styles.container} edges={["top"]}>
        {/* HEADER */}
        <View
          style={[
            styles.header,
            {
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              flex: 1,
              alignItems: "flex-start",
            }}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ marginTop: 5 }}
            >
              <Image
                source={require("../assets/Common/Back.png")}
                style={{
                  height: 16,
                  width: 16,
                  resizeMode: "contain",
                }}
              />
            </TouchableOpacity>

            <View
              style={{
                marginLeft: 12,
                flex: 1,
              }}
            >
              <Text
                style={[
                  Styles.headerText,
                  { fontSize: 14, fontFamily: "DMSans-Bold" },
                ]}
                numberOfLines={1}
              >
                {currentCatName}
              </Text>

              <TouchableOpacity
                onPress={() => setShowDropdown(true)}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <Text
                  style={[Styles.SubTitle, { fontSize: 10, color: "#64748B" }]}
                >
                  Change category
                </Text>
                <Image
                  source={require("../assets/Common/ArrowDown.png")}
                  style={{
                    height: 6,
                    width: 8,
                    marginLeft: 5,
                    tintColor: "#64748B",
                  }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.iconCircle}
              onPress={() => navigation.navigate("Search")}
            >
              <Image
                source={require("../assets/Common/search.png")}
                style={{
                  height: 20,
                  width: 20,
                  tintColor: "#487D44",
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconCircle}
              onPress={() =>
                navigation.navigate("Cart", { screen: "CartMain" })
              }
            >
              <Image
                source={require("../assets/Common/cart.png")}
                style={{
                  height: 20,
                  width: 20,
                  tintColor: "#487D44",
                }}
                resizeMode="contain"
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
          </View>
        </View>

        {loading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#487D44" />
          </View>
        ) : (
          <View style={{ flex: 1, flexDirection: "row", zIndex: 1 }}>
            {/* SIDEBAR */}

            <View style={styles.sidebar}>
              <FlatList
                data={categories}
                keyExtractor={(item) => item.sub_category_id.toString()}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedIndex(index);
                      setSelectedSubSubCats([]);
                    }}
                    style={[
                      styles.categoryItem,
                      index === selectedIndex && styles.activeCategory,
                    ]}
                  >
                    {item.image === "local_all_icon" ? (
                      <View
                        style={[
                          styles.categoryImage,
                          {
                            backgroundColor: "#487D44",
                            justifyContent: "center",
                            alignItems: "center",
                          },
                        ]}
                      >
                        <Image
                          source={require("../assets/Common/all.png")}
                          style={{
                            width: 20,
                            height: 20,
                            resizeMode: "contain",
                            tintColor: "#fff",
                          }}
                        />
                      </View>
                    ) : (
                      <Image
                        source={
                          item.image
                            ? { uri: item.image }
                            : require("../assets/productimg.jpg")
                        }
                        style={styles.categoryImage}
                      />
                    )}
                    <Text style={styles.categoryText}>{item.sub_category}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
            <View style={{ flex: 1, backgroundColor: "#F1F2F6" }}>
              {/* SORT ROW */}
              <FlatList
                // data={categories[0]?.subSubCategory || []}
                data={categories[selectedIndex]?.subSubCategory || []}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.sortRowContent}
                style={[styles.sortRow, {}]}
                renderItem={({ item }) =>
                  item.isSort ? (
                    <TouchableOpacity style={styles.sortChip}>
                      <Image
                        source={require("../assets/Common/filter.png")}
                        style={{
                          height: 10,
                          width: 10,
                          tintColor: "#000",
                        }}
                        resizeMode="contain"
                      />
                      <Text style={styles.sortText}> {item.label}</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.filterChip,
                        selectedSubSubCats.includes(Number(item.id)) && {
                          backgroundColor: "#487D44",
                          borderColor: "#487D44",
                        },
                      ]}
                      // onPress={() => {
                      //   const subSubCatId = Number(item?.id);
                      //   if (selectedSubSubCats.includes(subSubCatId)) {
                      //     setSelectedSubSubCats([]);
                      //   } else {
                      //     setSelectedSubSubCats([subSubCatId]);
                      //   }
                      // }}
                      onPress={() => {
                        const subSubCatId = Number(item?.id);
                        if (selectedSubSubCats.includes(subSubCatId)) {
                          // ✅ Remove this one from selection
                          setSelectedSubSubCats((prev) =>
                            prev.filter((id) => id !== subSubCatId),
                          );
                        } else {
                          // ✅ Add this one to existing selection
                          setSelectedSubSubCats((prev) => [
                            ...prev,
                            subSubCatId,
                          ]);
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.sortText,
                          selectedSubSubCats.includes(Number(item.id)) && {
                            color: "#fff",
                          },
                        ]}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  )
                }
              />
              <FlatList
                ref={productListRef}
                data={filteredProducts}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={["#487D44"]}
                  />
                }
                style={styles.productSection}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      No Products in this Category Yet
                    </Text>
                  </View>
                )}
                renderItem={({ item }) => (
                  <View style={styles.card}>
                    {/* Organic Ribbon - Only show if product is organic */}
                    {item.product_type === "Organic" && (
                      <LinearGradient
                        colors={["#487D44", "#12FF00"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.organicRibbon}
                      >
                        <Text style={styles.organicRibbonText}>Organic</Text>
                      </LinearGradient>
                    )}

                    {/* Discount Badge - Positioned at top right of image area */}
                    {/* {item.discount && Number(item.discount) > 0 ? (
                      <LinearGradient
                        colors={["#FFDC61", "#FAAF20"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.discountBadge}
                      >
                        <Text style={styles.discountText}>
                          {item.discount}% OFF
                        </Text>
                      </LinearGradient>
                    ) : null} */}

                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate("ProductDetail", {
                          productId: item.id,
                        })
                      }
                      style={{ flexDirection: "row" }}
                    >
                      <View
                        style={[
                          styles.productImageBg,
                          { width: "38%", backgroundColor: "" },
                        ]}
                      >
                        {Platform.OS === "ios" ? (
                          Number(item.discount) > 0 ? (
                            <View
                              style={{
                                backgroundColor: "#FAAF20",
                                position: "absolute",
                                top: 0,
                                right: 0,
                                paddingLeft: 10,
                                paddingRight: 12,
                                height: 24,
                                justifyContent: "center",
                                alignItems: "center",
                                // borderTopRightRadius: 20,
                                borderBottomLeftRadius: 8,
                                zIndex: 10,
                              }}
                            >
                              <Text
                                numberOfLines={1}
                                style={{
                                  fontSize: 8,
                                  fontWeight: "600",
                                  fontFamily: "DMSans-Medium",
                                }}
                              >
                                {item.discount}% OFF
                              </Text>
                            </View>
                          ) : null
                        ) : Number(item.discount) > 0 ? (
                          <LinearGradient
                            colors={["#FFDC61", "#FAAF20"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.discountBadge}
                          >
                            <Text style={styles.discountText} numberOfLines={1}>
                              {item.discount}% OFF
                            </Text>
                          </LinearGradient>
                        ) : null}

                        <Image
                          source={
                            item?.image && item.image.trim() !== ""
                              ? { uri: item.image }
                              : require("../assets/icons/sicon2.png")
                          }
                          style={styles.productImage}
                        />
                        <TouchableOpacity
                          onPress={() => toggleWishlist(item)}
                          style={{
                            position: "absolute",
                            bottom: 10,
                            left: 70,
                            padding: 4,
                          }}
                        >
                          <Image
                            source={
                              item.wishlist_status
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

                      <View
                        style={[
                          styles.details,
                          {
                            // alignItems: "center",
                            // justifyContent: "center",
                          },
                        ]}
                      >
                        <View>
                          <Text style={styles.productTitle}>{item.name}</Text>
                          <Text
                            style={[
                              styles.productTitle,
                              {
                                marginBottom: 6,
                                paddingBottom: 6,
                                borderBottomWidth: 1,
                                borderBottomColor: "#E6E7EE80",
                                color: "#64748B",
                                fontSize: 10,
                              },
                            ]}
                          >
                            Pack Of 10
                          </Text>
                        </View>
                        {item.tiers && item.tiers.length > 0 && (
                          <View
                            style={[
                              styles.variantBox,
                              {
                                backgroundColor: "#F4F4F4",
                              },
                            ]}
                          >
                            {item.tiers.map((tier: Tier, index: number) => {
                              const isLast =
                                index === (item.tiers?.length ?? 0) - 1;
                              return (
                                <View
                                  key={index}
                                  style={[
                                    styles.variantRow,
                                    !isLast && {
                                      borderBottomColor: "#E6E7EE80",
                                      borderBottomWidth: 1,
                                      paddingBottom: 5,
                                      marginBottom: 4,
                                    },
                                  ]}
                                >
                                  <Text style={styles.slabPrice}>
                                    {tier.qty} Pc ₹{tier.price}/pc
                                  </Text>

                                  <TouchableOpacity
                                    onPress={() => {
                                      if (item.cart_status) {
                                        updateQty(item.id, tier.qty);
                                      } else {
                                        handleAddToCart(item.id, tier.qty);
                                      }
                                    }}
                                  >
                                    <Text style={styles.addSmall}>Add+</Text>
                                  </TouchableOpacity>
                                </View>
                              );
                            })}
                          </View>
                        )}
                        <View
                          style={[
                            styles.priceRow,
                            {
                              // backgroundColor: "green",
                            },
                          ]}
                        >
                          {/* Price Section */}
                          <View style={styles.priceContainer}>
                            <Text style={styles.price}>
                              ₹{formatPrice(getCalculatedPrice(item))}
                            </Text>
                            {/* <Text style={styles.bestRate}>
                              ₹81/pack Best rate
                            </Text> */}
                          </View>

                          {/* Quantity Counter */}
                          {item.cart_status === true ? (
                            <View style={styles.qtyRow}>
                              {updatingQtyId === item.id ? (
                                <ActivityIndicator
                                  size="small"
                                  color="#487D44"
                                />
                              ) : (
                                <>
                                  <TouchableOpacity
                                    style={styles.qtyBtn}
                                    onPress={() =>
                                      updateQty(
                                        item.id,
                                        (item.cart?.qty || 0) - 1,
                                      )
                                    }
                                  >
                                    <Text style={styles.qtyText}>-</Text>
                                  </TouchableOpacity>

                                  <TextInput
                                    style={styles.qtyNumber}
                                    keyboardType="numeric"
                                    value={
                                      item.cart?.qty !== undefined &&
                                      item.cart?.qty !== null
                                        ? String(item.cart.qty)
                                        : ""
                                    }
                                    onChangeText={(text) => {
                                      const val = text.replace(/[^0-9]/g, "");
                                      if (val === "") {
                                        updateQty(item.id, "");
                                      } else {
                                        updateQty(item.id, Number(val));
                                      }
                                    }}
                                    onBlur={() => {
                                      if (
                                        String(item.cart?.qty) === "" ||
                                        item.cart?.qty === 0
                                      ) {
                                        updateQty(item.id, 0);
                                      }
                                    }}
                                  />

                                  <TouchableOpacity
                                    style={styles.qtyBtn}
                                    onPress={() =>
                                      updateQty(
                                        item.id,
                                        (item.cart?.qty || 0) + 1,
                                      )
                                    }
                                  >
                                    <Text style={styles.qtyText}>+</Text>
                                  </TouchableOpacity>
                                </>
                              )}
                            </View>
                          ) : (
                            <TouchableOpacity
                              style={styles.addButton}
                              onPress={() => handleAddToCart(item.id)}
                              disabled={addingToCartId === item.id}
                            >
                              {addingToCartId === item.id ? (
                                <ActivityIndicator size="small" color="#fff" />
                              ) : (
                                <>
                                  <Text style={styles.addText}>Add</Text>
                                  <Image
                                    source={require("../assets/Common/cart.png")}
                                    style={{
                                      height: 12,
                                      width: 12,
                                      tintColor: "#fff",
                                    }}
                                    resizeMode="contain"
                                  />
                                </>
                              )}
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
                ListFooterComponent={
                  <View style={{ marginTop: 10 }}>
                    <View style={styles.headerRow}>
                      <Text style={styles.dealTitle}>Suggested for You</Text>
                    </View>

                    <FlatList
                      data={packingItems}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      keyExtractor={(item) => item.id}
                      contentContainerStyle={{
                        paddingHorizontal: 10,
                        marginBottom: 100,
                      }}
                      renderItem={({ item }) => (
                        <ProductCard
                          image={item.image}
                          title={item.title}
                          packSize={item.packSize}
                          price={item.price}
                          oldPrice={item.oldPrice}
                          discount={item.discount}
                          isOrganic={item.isOrganic}
                          onAddPress={() => console.log("Added")}
                        />
                      )}
                    />
                  </View>
                }
              />
            </View>
          </View>
        )}

        <Modal
          visible={showDropdown}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowDropdown(false)}
        >
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setShowDropdown(false)}
            />
            <View style={[styles.dropdown, { zIndex: 1000 }]}>
              <FlatList
                data={allCategories}
                keyExtractor={(item: any) =>
                  item.id?.toString() || Math.random().toString()
                }
                renderItem={({ item }: any) => (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setShowDropdown(false);
                      setCurrentCatName(item.name);
                      setSelectedIndex(0);
                      setSelectedSubSubCats([]); // Reset filters on cat change
                      setSelectedCategoryId(item.id); // Update local state for subsequent filters
                      fetchProducts(item.id);
                    }}
                  >
                    <Image
                      source={{ uri: item.image }}
                      style={styles.dropdownImage}
                    />
                    <Text style={styles.dropdownText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
};

export default CategoryProductsScreen;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  dealTitle: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "DMSans-Medium",
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F4F4F4",
    borderColor: "#a5a4a4c7",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  /* SORT ROW */

  sortRow: {
    backgroundColor: "#F5F6F8",
    paddingVertical: 10,
    maxHeight: 45,
  },

  sortRowContent: {
    paddingLeft: 10,
    paddingRight: 5,
  },

  sortText: {
    fontSize: 12,
    fontFamily: "DMSans-Regular",
    paddingHorizontal: 5,
  },
  dividerPrice: {
    height: 1,
    backgroundColor: "#b2b3b880",
    marginVertical: 6,
  },

  sortChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffff",
    paddingHorizontal: 14,
    paddingVertical: 3,
    borderColor: "#a5a4a4c7",
    borderWidth: 1,
    borderRadius: 20,
    marginRight: 8,
  },

  filterChip: {
    backgroundColor: "#ffff",
    borderColor: "#a5a4a4c7",
    borderWidth: 1,
    borderRadius: 15,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  /* SIDEBAR */
  sidebar: { width: 75, backgroundColor: "#fff" },
  categoryItem: { alignItems: "center", paddingVertical: 15 },
  activeCategory: { backgroundColor: "#E8F3E8" },
  categoryImage: {
    width: 45,
    height: 45,
    borderRadius: 25,
    marginBottom: 5,
  },
  categoryText: {
    fontSize: 10,
    textAlign: "center",
    fontFamily: "DMSans-Regular",
    paddingHorizontal: 5,
    color: "#64748B",
  },

  /* PRODUCTS */
  productSection: { flex: 1, padding: 2 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 15,
    margin: 10,
    overflow: "hidden",
  },
  productImageBg: {
    backgroundColor: "#e5e7eb",
    width: 118,
    height: 184,
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: {
    width: 100,
    height: 95,
    borderRadius: 15,
    resizeMode: "contain",
  },

  details: {
    flex: 1,
    padding: 7,
    borderLeftWidth: 1,
    borderLeftColor: "#F4F4F4",
    justifyContent: "space-between",
  },
  productTitle: {
    fontSize: 12,
    fontFamily: "DMSans-Medium",

    width: "100%",
  },
  pack: {
    fontSize: 10,
    color: "#777",
    marginVertical: 4,
    fontFamily: "DMSans-Regular",
    textAlign: "left",
    width: "100%",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    width: "100%",
  },

  priceContainer: {
    flexDirection: "column",
  },

  bestRate: {
    fontSize: 9,
    color: "#487D44",
    fontFamily: "DMSans-Regular",
  },

  price: { fontSize: 12, fontFamily: "DMSans-SemiBold" },
  oldPrice: {
    textDecorationLine: "line-through",
    fontSize: 12,
    fontFamily: "DMSans-Regular",
    color: "#FF7878",
  },

  /* Quantity */
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F3E8",
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  qtyBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#487D44",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "DMSans-Regular",
  },
  qtyNumber: {
    marginHorizontal: 6,
    fontWeight: "600",
    fontSize: 13,
    fontFamily: "DMSans-Regular",
    color: "#487D44",
  },

  /* Discount */
  discountBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderBottomLeftRadius: 6,
    zIndex: 5,
    maxWidth: "100%",
  },
  discountText: {
    fontSize: 8,
    fontFamily: "DMSans-Medium",
  },

  ribbon: {
    position: "absolute",
    top: 10,
    left: -38,
    width: 130,
    transform: [{ rotate: "-45deg" }],
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  ribbonText: {
    color: "#fff",
    fontSize: 8,
    textAlign: "center",
    fontFamily: "DMSans-Regular",
  },

  slabPrice: {
    fontSize: 8,
    fontFamily: "DMSans-Regular",
  },

  variantBox: {
    borderColor: "#b2b3b880",
    borderRadius: 8,
    padding: 6,
    width: "100%",
    gap: 2,
  },

  variantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  addSmall: {
    fontSize: 8,
    color: "green",
    fontWeight: "600",
    fontFamily: "DMSans-Medium",
  },
  addButton: {
    backgroundColor: "#487D44",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },

  addText: {
    color: "#fff",
    marginRight: 4,
    fontFamily: "DMSans-Regular",
    fontSize: 9,
  },

  dropdown: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 5,
    maxHeight: 300,
  },

  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 0.5,
    borderColor: "#ddd",
  },

  dropdownImage: {
    width: 35,
    height: 35,
    borderRadius: 20,
    marginRight: 10,
  },

  dropdownText: {
    fontSize: 14,
    fontFamily: "DMSans-Medium",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    fontSize: 14,
    color: "#666",
    fontFamily: "DMSans-Medium",
  },

  organicRibbon: {
    position: "absolute",
    top: 15,
    left: -35,
    width: 120,
    paddingVertical: 3,
    transform: [{ rotate: "-45deg" }],
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    backgroundColor: "transparent",
  },
  organicRibbonText: {
    color: "#fff",
    fontSize: 8,
    // fontWeight: "600",
    textAlign: "center",
    fontFamily: "DMSans-SemiBold",
    // textTransform: "uppercase",
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
