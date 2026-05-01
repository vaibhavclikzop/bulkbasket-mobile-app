import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, TextInput, ActivityIndicator, RefreshControl,  } from 'react-native';
import { Alert } from '../utils/CustomAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getWishlistApi,
  addToWishlistApi,
  updateWishlistQtyApi,
  addToCartApi,
  updateCartQuantityApi,
} from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { debounce } from 'lodash';
import ProductCard from '../components/ProductCard';

export default function WishlistScreen({ navigation }: any) {
  const [wishlistData, setWishlistData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartLoadingId, setCartLoadingId] = useState<any | null>(null);
  const [updatingQtyId, setUpdatingQtyId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWishlist();
    setRefreshing(false);
  }, []);

  const filteredWishlist = wishlistData.filter(item =>
    item.name?.toLowerCase().includes(searchText.toLowerCase()),
  );

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await getWishlistApi();

      const transformedData = res.data.map((item: any) => {
        const productId = item.product_id || item.id;
        return {
          ...item,
          id: productId,
          product_id: productId,
          wishlist_status: true,
          cart_status: item.cart_qty > 0,
          cartQty: item.cart_qty || 0,
          qty: item.qty || 1, // Wishlist intended quantity
          price: item.base_price || item.mrp || 0,
          oldPrice: item.mrp || 0,
          discount: item.discount || 0,
          tiers: item.tiers || [],
          name: item.name,
          is_organic: item.product_type?.toLowerCase() === 'organic',
          product_type: item.product_type,
          mrp: item.mrp || 0,
          current_stock: item.current_stock || 0,
        };
      });

      setWishlistData(transformedData);
      setLoading(false);
    } catch (error) {
      console.log('Wishlist Fetch Error:', error);
      setLoading(false);
    }
  };

  const toggleWishlist = async (product: any) => {
    try {
      const newStatus = !product.wishlist_status;

      // Update UI optimistically
      setWishlistData(prev =>
        prev.map(item =>
          item.id === product.id
            ? { ...item, wishlist_status: newStatus }
            : item,
        ),
      );

      const productId = product.product_id || product.id;

      if (newStatus) {
        await addToWishlistApi(productId);
        // Alert.alert("Success", "Added to wishlist");
      } else {
        await updateWishlistQtyApi(productId, 0);
        // Alert.alert("Success", "Removed from wishlist");
        fetchWishlist();
      }
    } catch (error) {
      console.log('Wishlist Toggle Error:', error);
      // Revert on error
      setWishlistData(prev =>
        prev.map(item =>
          item.id === product.id
            ? { ...item, wishlist_status: product.wishlist_status }
            : item,
        ),
      );
    }
  };

  const debouncedUpdateWishlistQtyApi = useCallback(
    debounce(async (productId: any, newQty: number) => {
      try {
        setUpdatingQtyId(productId);
        if (newQty <= 0) {
          await updateWishlistQtyApi(productId, 0);
          // Remove from wishlist if quantity becomes 0
          setWishlistData(prev =>
            prev.filter(item => (item.product_id || item.id) !== productId),
          );
        } else {
          await updateWishlistQtyApi(productId, newQty);
          // Alert.alert("Success", "Quantity updated successfully");
        }
      } catch (error) {
        console.log('Update Wishlist Qty API Error:', error);
      } finally {
        setUpdatingQtyId(null);
      }
    }, 1500),
    [],
  );

  const updateQty = async (productId: number, newQty: number | string) => {
    const isTextInputEmpty = newQty === '' || Number.isNaN(Number(newQty));
    const finalQty = isTextInputEmpty ? 0 : Number(newQty);

    if (finalQty < 0) return;

    // Update UI optimistically
    setWishlistData(prev =>
      prev.map(item =>
        (item.product_id || item.id) === productId
          ? { ...item, qty: finalQty }
          : item,
      ),
    );

    if (finalQty > 0) {
      debouncedUpdateWishlistQtyApi(productId, finalQty);
    } else {
      debouncedUpdateWishlistQtyApi(productId, 0);
    }
  };

  const handleUpdateCartQty = async (
    productId: number,
    newQty: number | string,
  ) => {
    const isTextInputEmpty = newQty === '' || Number.isNaN(Number(newQty));
    const finalQty = isTextInputEmpty ? 0 : Number(newQty);

    try {
      setUpdatingQtyId(productId);
      setWishlistData(prev =>
        prev.map(item =>
          item.id === productId
            ? {
                ...item,
                cartQty: isTextInputEmpty ? ('' as any) : finalQty,
                cart_status: finalQty > 0 || isTextInputEmpty,
                qty: finalQty || item.qty,
              }
            : item,
        ),
      );

      if (!isTextInputEmpty) {
        const res = await updateCartQuantityApi(productId, finalQty);
        console.log('Update Cart Qty:', res);
      }
    } catch (error) {
      console.log('Update Cart Qty Error:', error);
      fetchWishlist();
    } finally {
      setUpdatingQtyId(null);
    }
  };

  const handleAddToCart = async (item: any, qty: number = 1) => {
    try {
      const productId = item.product_id || item.id;
      setCartLoadingId(productId);
      const res = await addToCartApi(productId, qty);
      console.log('Add to Cart:', res);

      setWishlistData(prev =>
        prev.map(i =>
          i.id === productId
            ? { ...i, cartQty: qty, cart_status: true, qty: qty }
            : i,
        ),
      );
      fetchWishlist();
    } catch (error) {
      console.log('Add to Cart Error:', error);
      Alert.alert('Error', 'Could not add to cart. Please try again.');
    } finally {
      setCartLoadingId(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchWishlist();
    }, []),
  );

  const totalPrice = wishlistData.reduce((acc, item) => {
    let currentPrice = item.price || 0;
    const qtyForLogic = item.cart_status ? item.cartQty : item.qty || 1;

    if (item.tiers && item.tiers.length > 0) {
      const sortedTiers = [...item.tiers].sort((a, b) => b.qty - a.qty);
      for (const tier of sortedTiers) {
        if (qtyForLogic >= tier.qty) {
          currentPrice = tier.price;
          break;
        }
      }
    }

    return acc + Number(currentPrice) * qtyForLogic;
  }, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wishlist ({wishlistData.length})</Text>
        <View style={styles.searchBox}>
          <Image
            source={require('../assets/Common/search.png')}
            style={{
              height: 20,
              width: 20,
              tintColor: '#3A7D44',
            }}
            resizeMode="contain"
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#888"
            // onFocus={() => navigation.navigate("Search")}
            value={searchText}
            onChangeText={text => setSearchText(text)}
          />
        </View>
      </View>

      {/* Product Grid using ProductCard */}
      <View style={{ marginTop: 20, flex: 1 }}>
        <FlatList
          data={filteredWishlist}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{
            paddingHorizontal: 10,
            paddingBottom: 60,
            flexGrow: 1,
          }}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            marginBottom: 18,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#487D44']}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              {loading ? (
                <ActivityIndicator size="large" color="#487D44" />
              ) : (
                <Text style={styles.emptyText}>
                  No products added to wishlist yet
                </Text>
              )}
            </View>
          )}
          renderItem={({ item }) => (
            <ProductCard
              image={
                typeof item.image === 'string'
                  ? { uri: item.image }
                  : item.image
              }
              title={item.name}
              packSize={item.packSize || ''}
              price={item.price}
              oldPrice={item.oldPrice}
              discount={Number(item.discount).toFixed(0)}
              product_type={item.product_type}
              mrp={item.mrp}
              tiers={item.tiers || []}
              cart_status={item.cart_status}
              cartQty={item.cartQty}
              onUpdateQty={newQty =>
                handleUpdateCartQty(item.product_id || item.id, newQty)
              }
              updatingQty={updatingQtyId === (item.product_id || item.id)}
              wishlist_status={item.wishlist_status}
              onWishlistPress={() => toggleWishlist(item)}
              onAddPress={() => handleAddToCart(item)}
              current_stock={item.current_stock}
              uom_name={item.uom_name}
              onPress={() =>
                navigation.navigate('ProductDetail', {
                  productId: item.product_id || item.id,
                })
              }
              onTierAddPress={(tierQty: number) => {
                if (item.cart_status) {
                  handleUpdateCartQty(item.product_id || item.id, tierQty);
                } else {
                  handleAddToCart(item, tierQty);
                }
              }}
              containerStyle={styles.productCard}
            />
          )}
        />
      </View>

      {/* Bottom Summary */}
      {wishlistData.length > 0 && (
        <View style={styles.bottomBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Total Estimation</Text>
            <Text style={styles.totalPrice}>₹{totalPrice}</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  headerTitle: {
    fontSize: 18,
    fontFamily: 'DMSans-SemiBold',
  },

  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    marginLeft: 10,
    padding: 8,
    borderColor: '#d3cdcd',
    borderRadius: 20,
  },

  searchInput: {
    flex: 1,
    marginLeft: 6,
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    paddingVertical: 0,
  },

  productCard: {
    width: '47%',
    marginHorizontal: 4,
  },

  bottomBox: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: -2 },
    elevation: 10,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  totalText: {
    fontSize: 16,
    fontFamily: 'DMSans-Medium',
  },

  totalPrice: {
    fontSize: 16,
    fontFamily: 'DMSans-Medium',
    color: '#487D44',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },

  emptyText: {
    fontSize: 14,
    color: '#777',
    marginTop: 10,
    fontFamily: 'DMSans-Medium',
  },
});
