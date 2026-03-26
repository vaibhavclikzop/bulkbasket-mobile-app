import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Image,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  searchProductsApi,
  addToCartApi,
  updateCartQuantityApi,
} from "../services/api";
import { debounce } from "lodash";
import ProductCard from "./ProductCard";

const suggestions = ["Sugar", "Brown Sugar", "Sugar Powder", "Sugar Cosmetics"];
const recent = ["Spices", "Haldi", "Garam Masala", "Seeds", "Chilli Powder"];

const SearchScreen = ({ navigation }: any) => {
  const { width } = useWindowDimensions();
  // 16px left pad + 16px right pad + 8px gap between cards
  const cardWidth = (width - 32 - 8) / 2;

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingToCartId, setAddingToCartId] = useState<number | null>(null);
  const [updatingQtyId, setUpdatingQtyId] = useState<number | null>(null);

  /* ─── Search API ─── */
  const handleSearch = async (text: string) => {
    try {
      setLoading(true);
      const res = await searchProductsApi(text);
      setResults(res?.data || []);
    } catch (err) {
      console.log("Search Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((text: string) => {
      if (text.trim().length > 0) {
        handleSearch(text);
      } else {
        setResults([]);
      }
    }, 500),
    [],
  );

  const onChangeText = (text: string) => {
    setQuery(text);
    debouncedSearch(text);
  };

  /* ─── Cart helpers ─── */
  const handleAddToCart = async (productId: number, quantity: number = 1) => {
    try {
      setAddingToCartId(productId);
      await addToCartApi(productId, quantity);
      setResults((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, cart_status: true, cart: { qty: quantity } }
            : p,
        ),
      );
    } catch (error) {
      console.log("Add to Cart Error:", error);
    } finally {
      setAddingToCartId(null);
    }
  };

  const debouncedUpdateCartApi = useCallback(
    debounce(async (productId: number, newQty: number) => {
      try {
        setUpdatingQtyId(productId);
        await updateCartQuantityApi(productId, newQty);
      } catch (error) {
        console.log("Update Qty Error:", error);
      } finally {
        setUpdatingQtyId(null);
      }
    }, 1200),
    [],
  );

  const updateQty = (productId: number, newQty: number | string) => {
    const isEmpty = newQty === "" || Number.isNaN(Number(newQty));
    const finalQty = isEmpty ? 0 : Number(newQty);
    if (finalQty < 0) return;

    setResults((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              cart_status: finalQty > 0,
              cart: { ...p.cart, qty: finalQty },
            }
          : p,
      ),
    );
    debouncedUpdateCartApi(productId, finalQty);
  };

  /* ─── Render ─── */
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <SafeAreaView style={styles.container}>
        {/* HEADER */}
        <View style={styles.searchHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require("../assets/Common/Back.png")}
              style={{ height: 14, width: 14 }}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TextInput
            value={query}
            onChangeText={onChangeText}
            placeholder="Search..."
            style={styles.searchInput}
            autoFocus
          />

          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setQuery("");
                setResults([]);
              }}
            >
              {/* <Image
                source={require("../assets/Common/Close.png")}
                style={{ height: 14, width: 14, tintColor: "#888" }}
                resizeMode="contain"
              /> */}
            </TouchableOpacity>
          )}
        </View>

        {/* LOADER */}
        {loading && (
          <ActivityIndicator
            size="small"
            color="#487D44"
            style={{ marginBottom: 10 }}
          />
        )}

        {/* SEARCH RESULTS */}
        {query.length > 0 && results.length > 0 ? (
          <FlatList
            key="results-list"
            data={results}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              !loading ? (
                <Text style={styles.emptyText}>No results found</Text>
              ) : null
            }
            renderItem={({ item }) => (
              <View style={{ width: cardWidth, marginBottom: 16 }}>
                <ProductCard
                  containerStyle={{ width: "100%", margin: 0 }}
                  image={
                    typeof item.image === "string"
                      ? { uri: item.image }
                      : item.image
                  }
                  title={item.name}
                  packSize={""}
                  price={item.base_price}
                  oldPrice={item.mrp}
                  discount={item.discount}
                  isOrganic={false}
                  onAddPress={() => handleAddToCart(item.id, 1)}
                  onPress={() =>
                    navigation.navigate("ProductDetail", {
                      productId: item.id,
                    })
                  }
                  bestRate={item.bestRate || ""}
                  tiers={item.tiers}
                  cart_status={item.cart_status}
                  cartQty={item.cart?.qty}
                  onUpdateQty={(newQty) => updateQty(item.id, newQty)}
                  updatingQty={updatingQtyId === item.id}
                  onTierAddPress={(tierQty: number) => {
                    if (item.cart_status) {
                      updateQty(item.id, tierQty);
                    } else {
                      handleAddToCart(item.id, tierQty);
                    }
                  }}
                />
              </View>
            )}
          />
        ) : query.length > 0 && !loading ? (
          <Text style={styles.emptyText}>No results found for "{query}"</Text>
        ) : (
          /* SUGGESTIONS + RECENT */
          <FlatList
            key="suggestions-list"
            data={suggestions}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => {
                  setQuery(item);
                  handleSearch(item);
                }}
              >
                <Image
                  source={require("../assets/icons/sicon1.png")}
                  style={styles.suggestionImage}
                />
                <Text style={styles.suggestionText}>{item}</Text>
              </TouchableOpacity>
            )}
            ListFooterComponent={
              <>
                <Text style={styles.recentTitle}>RECENT SEARCHES</Text>
                <View style={styles.recentContainer}>
                  {recent.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.recentChip}
                      onPress={() => {
                        setQuery(item);
                        handleSearch(item);
                      }}
                    >
                      <Image
                        source={require("../assets/icons/sicon1.png")}
                        style={styles.recentImage}
                      />
                      <Text style={styles.recentText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            }
          />
        )}
      </SafeAreaView>
    </>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 30,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    height: 45,
    fontSize: 13,
    fontFamily: "DMSans-Regular",
    color: "#000000",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  suggestionImage: {
    width: 35,
    height: 35,
    borderRadius: 20,
    marginRight: 10,
  },
  recentImage: {
    width: 15,
    height: 15,
    marginRight: 10,
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: "DMSans-Regular",
  },
  recentTitle: {
    marginTop: 20,
    color: "#5F6C7B",
    fontFamily: "DMSans-Medium",
    marginBottom: 10,
  },
  recentContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  recentChip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  recentText: {
    fontSize: 13,
    fontFamily: "DMSans-Regular",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#64748B",
    fontFamily: "DMSans-Regular",
    fontSize: 14,
  },
});
