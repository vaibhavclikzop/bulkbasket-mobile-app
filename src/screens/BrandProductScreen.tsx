import React, { useEffect, useState, useCallback } from "react";
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
  Alert,
  TextInput,
  RefreshControl,
  Vibration,
  Platform,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import ProductCard from "../components/ProductCard";
import Styles from "../components/Styles";
import { SafeAreaView } from "react-native-safe-area-context";
import { useIsFocused, useFocusEffect } from "@react-navigation/native";
import {
  addToCartApi,
  addToWishlistApi,
  getBrandsApi,
  getProductsByBrandApi,
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
    discount: "33%",
    isOrganic: true,
  },
  {
    id: "2",
    image: require("../assets/product/product1-.png"),
    title: "Cello Tape - Transparent W: 1 Inch, L: 55 m",
    packSize: "Pack of 20",
    price: "820",
    oldPrice: "₹900",
    discount: "10%",
    isOrganic: true,
  },
  {
    id: "3",
    image: require("../assets/product/product1-.png"),
    title: "Disposables & Packaging",
    packSize: "Pack of 20",
    price: "820",
    oldPrice: "₹900",
    discount: "10%",
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
  isOrganic?: boolean;
  bestRate?: string;
  current_stock?: number;
  product_type?: string;
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

const BrandProductScreen = ({ navigation, route }: any) => {
  const isFocused = useIsFocused();
  // const [qty, setQty] = useState(0);
  // const [likedProducts, setLikedProducts] = useState({});
  const { brandId, brandName } = route.params;
  const [selectedBrandId, setSelectedBrandId] = useState(brandId);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  console.log("Brand Name Id", brandId, brandName);
  const [showDropdown, setShowDropdown] = useState(false);
  const [brandData, setBrandData] = useState([]);
  const [selectedSubSubCats, setSelectedSubSubCats] = useState<number[]>([]);
  const [currentCatName, setCurrentCatName] = useState(brandName);
  const [loading, setLoading] = useState(true);
  const [addingToCartId, setAddingToCartId] = useState<number | null>(null);
  const [updatingQtyId, setUpdatingQtyId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBrands = async () => {
    try {
      const res = await getBrandsApi();
      setBrandData(res.data);
    } catch (error) {
      console.log(error);
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
    catId?: number | string,
    subcatId?: number | string,
    ssCategoryId?: number | string,
  ) => {
    try {
      setLoading(true);

      const resolvedId = id ?? selectedBrandId;

      if (resolvedId) {
        const data = await getProductsByBrandApi(
          resolvedId,
          catId as any,
          subcatId as any,
          ssCategoryId as any,
        );

        console.log("Products API:", data.data);

        if (!catId || catId === "all") {
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
                (c: any) => String(c.sub_category_id) === String(catId),
              );
              newProducts = matchedCategory
                ? matchedCategory.products || []
                : data.data[0]?.products || [];
            }
          }

          setCategories((prev) =>
            prev.map((cat) =>
              String(cat.sub_category_id) === String(catId)
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
      Alert.alert("Success", "Successfully added to cart");
    } catch (error) {
      console.log(error);
    } finally {
      setAddingToCartId(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
      fetchBrands();
    }, [route?.params?.brandId]),
  );

  // const filters = [
  //   { id: "sort", label: "Sort", isSort: true },
  //   { id: "1", label: "Chilli Powder" },
  //   { id: "2", label: "Garam Masala" },
  //   { id: "3", label: "Haldi" },
  //   { id: "4", label: "Spices" },
  // ];

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

    // 2. Call API with debounce only if it's a valid number.
    // If it's effectively 0, the debounce handles the delay before removing.
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
        Alert.alert("Success", "Item removed from wishlist");
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

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);

      const subCategoryId = categories[selectedIndex]?.sub_category_id;
      const validSubcatId =
        subCategoryId === "all" ? "all" : Number(subCategoryId);

      await fetchProducts(
        selectedBrandId,
        validSubcatId,
        selectedSubSubCats.join(","),
      );
    } catch (err) {
      console.log("Refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  }, [selectedBrandId, selectedIndex, selectedSubSubCats, categories]);

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
                  height: 10,
                  width: 13,
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
                  Change Brand
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

            {/* <TouchableOpacity style={styles.iconCircle}>
              <Image
                source={require("../assets/Common/cart.png")}
                style={{
                  height: 20,
                  width: 20,
                  tintColor: "#487D44",
                }}
                resizeMode="contain"
              />
            </TouchableOpacity> */}
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
                    onPress={() => setSelectedIndex(index)}
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
                      onPress={() => {
                        const categoryId = selectedBrandId;
                        const subCategoryId =
                          categories[selectedIndex]?.sub_category_id;
                        const validSubcatId =
                          subCategoryId === "all"
                            ? "all"
                            : Number(subCategoryId);
                        const subSubCatId = Number(item?.id);

                        let updated = [];

                        if (selectedSubSubCats.includes(subSubCatId)) {
                          updated = selectedSubSubCats.filter(
                            (id) => id !== subSubCatId,
                          );
                        } else {
                          updated = [...selectedSubSubCats, subSubCatId];
                        }

                        setSelectedSubSubCats(updated);

                        // console.log("category_id:", categoryId);
                        // console.log("sub_category_id:", subCategoryId);
                        // console.log("subsubcat_ids:", updated);

                        fetchProducts(
                          undefined,
                          validSubcatId,
                          updated.join(","),
                        );
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
                data={categories[selectedIndex]?.products || []}
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
                    <Text style={styles.emptyText}>No Product Found</Text>
                  </View>
                )}
                // renderItem={({ item }) => (
                //   <View style={styles.card}>
                //     {/* Organic Ribbon */}
                //     <LinearGradient
                //       colors={["#487D44", "#12FF00"]}
                //       start={{ x: 0, y: 0 }}
                //       end={{ x: 1, y: 0 }}
                //       style={styles.ribbon}
                //     >
                //       <Text style={styles.ribbonText}>Organic</Text>
                //     </LinearGradient>

                //     {item.discount && Number(item.discount) > 0 ? (
                //       <LinearGradient
                //         colors={["#FFDC61", "#FAAF20"]}
                //         start={{ x: 0, y: 0 }}
                //         end={{ x: 1, y: 0 }}
                //         style={styles.discountBadge}
                //       >
                //         <Text style={styles.discountText}>
                //           {item.discount}% OFF
                //         </Text>
                //       </LinearGradient>
                //     ) : null}

                //     <TouchableOpacity
                //       onPress={() =>
                //         navigation.navigate("ProductDetail", {
                //           productId: item.id,
                //         })
                //       }
                //       style={{ flexDirection: "row" }}
                //     >
                //       <View style={[styles.productImageBg, { width: "35%" }]}>
                //         <Image
                //           source={{ uri: item.image }}
                //           style={styles.productImage}
                //         />
                //         <TouchableOpacity
                //           onPress={() => toggleWishlist(item)}
                //           style={{
                //             position: "absolute",
                //             bottom: 10,
                //             right: 10,
                //             padding: 4,
                //           }}
                //         >
                //           <Image
                //             source={
                //               item.wishlist_status
                //                 ? require("../assets/Common/fillheart.png")
                //                 : require("../assets/Common/heart.png")
                //             }
                //             style={{
                //               height: 18,
                //               width: 18,
                //               resizeMode: "contain",
                //             }}
                //           />
                //         </TouchableOpacity>
                //       </View>

                //       <View
                //         style={[
                //           styles.details,
                //           {
                //             alignItems: "center",
                //             justifyContent: "center",
                //           },
                //         ]}
                //       >
                //         <Text style={styles.productTitle}>{item.name}</Text>
                //         {item.tiers && item.tiers.length > 0 && (
                //           <View
                //             style={[
                //               styles.variantBox,
                //               { backgroundColor: "#F4F4F4" },
                //             ]}
                //           >
                //             {item.tiers.map((tier, index) => {
                //               const isLast =
                //                 index === (item.tiers?.length ?? 0) - 1;
                //               return (
                //                 <View
                //                   key={index}
                //                   style={[
                //                     styles.variantRow,
                //                     !isLast && {
                //                       borderBottomColor: "#E6E7EE80",
                //                       borderBottomWidth: 1,
                //                       paddingBottom: 5,
                //                       marginBottom: 4,
                //                     },
                //                   ]}
                //                 >
                //                   <Text style={styles.slabPrice}>
                //                     {tier.qty} Pc ₹{tier.price}/pc
                //                   </Text>

                //                   <TouchableOpacity
                //                     onPress={() => {
                //                       if (item.cart_status) {
                //                         updateQty(item.id, tier.qty);
                //                       } else {
                //                         handleAddToCart(item.id, tier.qty);
                //                       }
                //                     }}
                //                   >
                //                     <Text style={styles.addSmall}>Add+</Text>
                //                   </TouchableOpacity>
                //                 </View>
                //               );
                //             })}
                //           </View>
                //         )}
                //         <View
                //           style={[styles.priceRow, { backgroundColor: "" }]}
                //         >
                //           {/* Price Section */}
                //           <View style={styles.priceContainer}>
                //             <Text style={styles.price}>
                //               ₹{formatPrice(getCalculatedPrice(item))}
                //             </Text>
                //             {/* <Text style={styles.bestRate}>
                //               ₹81/pack Best rate
                //             </Text> */}
                //           </View>

                //           {/* Quantity Counter */}
                //           {item.cart_status === true ? (
                //             // 🔹 SHOW QTY COUNTER
                //             <View style={styles.qtyRow}>
                //               {updatingQtyId === item.id ? (
                //                 <ActivityIndicator
                //                   size="small"
                //                   color="#487D44"
                //                 />
                //               ) : (
                //                 <>
                //                   <TouchableOpacity
                //                     style={styles.qtyBtn}
                //                     onPress={() =>
                //                       updateQty(
                //                         item.id,
                //                         (item.cart?.qty || 0) - 1,
                //                       )
                //                     }
                //                   >
                //                     <Text style={styles.qtyText}>-</Text>
                //                   </TouchableOpacity>

                //                   <TextInput
                //                     style={styles.qtyNumber}
                //                     keyboardType="numeric"
                //                     value={
                //                       item.cart?.qty !== undefined &&
                //                       item.cart?.qty !== null
                //                         ? String(item.cart.qty)
                //                         : ""
                //                     }
                //                     onChangeText={(text) => {
                //                       const val = text.replace(/[^0-9]/g, "");
                //                       if (val === "") {
                //                         updateQty(item.id, "");
                //                       } else {
                //                         updateQty(item.id, Number(val));
                //                       }
                //                     }}
                //                     onBlur={() => {
                //                       // If they blur while empty, actually remove it.
                //                       if (
                //                         String(item.cart?.qty) === "" ||
                //                         item.cart?.qty === 0
                //                       ) {
                //                         updateQty(item.id, 0);
                //                       }
                //                     }}
                //                   />

                //                   <TouchableOpacity
                //                     style={styles.qtyBtn}
                //                     onPress={() =>
                //                       updateQty(
                //                         item.id,
                //                         (item.cart?.qty || 0) + 1,
                //                       )
                //                     }
                //                   >
                //                     <Text style={styles.qtyText}>+</Text>
                //                   </TouchableOpacity>
                //                 </>
                //               )}
                //             </View>
                //           ) : (
                //             // 🔹 SHOW ADD BUTTON
                //             <TouchableOpacity
                //               style={styles.addButton}
                //               onPress={() => handleAddToCart(item.id)}
                //               disabled={addingToCartId === item.id}
                //             >
                //               {addingToCartId === item.id ? (
                //                 <ActivityIndicator size="small" color="#fff" />
                //               ) : (
                //                 <>
                //                   <Text style={styles.addText}>Add</Text>
                //                   <Image
                //                     source={require("../assets/Common/cart.png")}
                //                     style={{
                //                       height: 12,
                //                       width: 12,
                //                       tintColor: "#fff",
                //                     }}
                //                     resizeMode="contain"
                //                   />
                //                 </>
                //               )}
                //             </TouchableOpacity>
                //           )}
                //         </View>
                //       </View>
                //     </TouchableOpacity>
                //   </View>
                // )}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.card,
                      Number(item.current_stock) === 0 && { opacity: 0.5 },
                    ]}
                  >
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
                        {item.product_type ? (
                          <View
                            style={{
                              position: "absolute",
                              top: 0,
                              width: "100%",
                              height: 18,
                              overflow: "hidden",
                              alignSelf: "center",
                              borderBottomLeftRadius: 10,
                              borderBottomRightRadius: 10,
                              backgroundColor: "#6B7280",
                              justifyContent: "center",
                              alignItems: "center",
                              zIndex: 11,
                            }}
                          >
                            <Text
                              style={{
                                color: "#FFFFFF",
                                fontSize: 7,
                                fontFamily: "DMSans-SemiBold",
                                textAlign: "center",
                              }}
                            >
                              {item.product_type}
                            </Text>
                          </View>
                        ) : null}
                        {Number(item.discount) > 0 && (
                          <LinearGradient
                            colors={["#FFDC61", "#FAAF20"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[
                              styles.discountBadge,
                              {
                                top: undefined,
                                right: undefined,
                                bottom: 0,
                                left: 0,
                                borderBottomLeftRadius: 0,
                                borderTopRightRadius: 8,
                              },
                            ]}
                          >
                            <Text style={styles.discountText} numberOfLines={1}>
                              {item.discount}% OFF
                            </Text>
                          </LinearGradient>
                        )}
                        <Image
                          source={{ uri: item.image }}
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
                            alignItems: "center",
                            justifyContent: "center",
                          },
                        ]}
                      >
                        <Text style={styles.productTitle}>{item.name}</Text>
                        {item.tiers && item.tiers.length > 0 && (
                          <View
                            style={[
                              styles.variantBox,
                              { backgroundColor: "#F4F4F4" },
                            ]}
                          >
                            {item.tiers.map((tier, index) => {
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
                        <View style={[styles.priceRow]}>
                          {/* Price Section */}
                          <View
                            style={[
                              styles.priceContainer,
                              { flexDirection: "row", alignItems: "center" },
                            ]}
                          >
                            <Text style={styles.price}>
                              ₹{formatPrice(getCalculatedPrice(item))}
                            </Text>
                            <Text style={styles.bestRate}>
                              ₹{formatPrice(item.mrp)}
                            </Text>
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
                              style={[
                                styles.addButton,
                                Number(item.current_stock) === 0 && {
                                  backgroundColor: "transparent",
                                  borderWidth: 1,
                                  borderColor: "#EF4444",
                                },
                              ]}
                              onPress={() => {
                                if (Number(item.current_stock) === 0) {
                                  navigation.navigate("ProductDetail", {
                                    productId: item.id,
                                  });
                                } else {
                                  Vibration.vibrate(60);
                                  handleAddToCart(item.id);
                                }
                              }}
                              disabled={
                                Number(item.current_stock) !== 0 &&
                                addingToCartId === item.id
                              }
                            >
                              {addingToCartId === item.id ? (
                                <ActivityIndicator size="small" color="#fff" />
                              ) : (
                                <>
                                  <Text
                                    style={[
                                      styles.addText,
                                      Number(item.current_stock) === 0 && {
                                        color: "#EF4444",
                                      },
                                    ]}
                                  >
                                    {Number(item.current_stock) === 0
                                      ? "View similar"
                                      : "Add"}
                                  </Text>
                                  {Number(item.current_stock) !== 0 && (
                                    <Image
                                      source={require("../assets/Common/cart.png")}
                                      style={{
                                        height: 12,
                                        width: 12,
                                        tintColor: "#fff",
                                      }}
                                      resizeMode="contain"
                                    />
                                  )}
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
                          image={item?.image}
                          title={item?.title}
                          packSize={item?.packSize}
                          price={item?.price}
                          oldPrice={item?.oldPrice}
                          discount={Number(item.discount).toFixed(0)}
                          isOrganic={item?.isOrganic}
                          current_stock={item.current_stock}
                          // bestRate={item?.bestRate || ""}
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
        {/* <View style={styles.bottomTab}>
                <TouchableOpacity style={styles.tabItem}>
                    <Feather name="home" size={22} color="#487D44" />
                    <Text style={styles.tabText}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.tabItem}>
                    <Feather name="heart" size={22} color="#999" />
                    <Text style={styles.tabText}>Wishlist</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.tabItem}>
                    <Image
                        source={require('../assets/icons/wallet.png')}
                        style={{
                            width: 22,
                            height: 22,
                            resizeMode: 'contain',
                        }}
                    />
                    <Text style={styles.tabText}>Wishlist</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.tabItem}>
                    <Image
                        source={require('../assets/icons/Vector.png')}
                        style={{
                            width: 22,
                            height: 22,
                            resizeMode: 'contain',
                        }} />
                    <Text style={styles.tabText}>Order</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.tabItem}>
                    <Feather name="user" size={22} color="#999" />
                    <Text style={styles.tabText}>Profile</Text>
                </TouchableOpacity>
            </View> */}

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
                data={brandData}
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
                      setSelectedBrandId(item.id); // Update local state for subsequent filters
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

export default BrandProductScreen;
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

  // headerTitle: {
  //   fontSize: 14,
  //   marginTop: 28,
  //   fontWeight: "600",
  //   fontFamily: "DMSans-Bold",
  // },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    // marginTop: 25,
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
    // width: 260,
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
    // marginLeft: 1,
    padding: 7,
    borderLeftWidth: 1,
    borderLeftColor: "#F4F4F4",
    // width: "100%",
  },
  productTitle: {
    fontSize: 12,
    fontFamily: "DMSans-Medium",
    marginBottom: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#E6E7EE80",
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
    // backgroundColor: "#E8F3E8",
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  qtyBtn: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#487D44",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "DMSans-Medium",
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
  discountText: { fontSize: 8, fontFamily: "DMSans-Medium" },

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
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 8,
  },

  addText: {
    color: "#fff",
    marginRight: 4,
    fontFamily: "DMSans-Regular",
    fontSize: 9,
  },
  bottomTab: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 65,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },

  tabItem: {
    alignItems: "center",
    justifyContent: "center",
  },

  tabText: {
    fontSize: 11,
    marginTop: 4,
    color: "#777",
    fontFamily: "DMSans-Regular",
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
    paddingVertical: 4,
    transform: [{ rotate: "-45deg" }],
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    backgroundColor: "transparent",
  },
  organicRibbonText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
    fontFamily: "DMSans-Bold",
    textTransform: "uppercase",
  },
});
