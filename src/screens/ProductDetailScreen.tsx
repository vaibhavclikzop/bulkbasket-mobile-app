import React, { useState, useEffect } from 'react';
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
  RefreshControl,
  Modal,
  Platform,
  Vibration,
} from 'react-native';
import { debounce } from 'lodash';
import Carousel from 'react-native-reanimated-carousel';
import { useWindowDimensions } from 'react-native';
import ProductCard from '../components/ProductCard';
import Header from '../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getProductDetailsApi,
  addToCartApi,
  updateCartQuantityApi,
  addToWishlistApi,
  updateWishlistQtyApi,
  getCartApi,
} from '../services/api';

const ProductDetailScreen = ({ navigation, route }: any) => {
  const [quantity, setQuantity] = React.useState(0);
  const [liked, setLiked] = useState(false);
  const [productDetail, setProductDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [updatingQty, setUpdatingQty] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [addingSuggestedCartId, setAddingSuggestedCartId] = useState<
    number | null
  >(null);
  const [updatingSuggestedQtyId, setUpdatingSuggestedQtyId] = useState<
    number | null
  >(null);
  const { width } = useWindowDimensions();
  const [refreshing, setRefreshing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const productId = route?.params?.productId;

  const onRefresh = async () => {
    if (!productId) return;
    try {
      setRefreshing(true);
      await Promise.all([getProductDetailsApi(productId), fetchCart()]);
    } catch (error) {
      console.log('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchCart = async () => {
    try {
      setCartLoading(true);
      const data = await getCartApi();
      setCartItems(data.data || []);
    } catch (error) {
      console.log('Cart fetch error:', error);
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const stock = Number(productDetail?.product?.current_stock || 0);

  const imagesData =
    Array.isArray(productDetail?.product_images) &&
    productDetail.product_images.length > 0
      ? productDetail.product_images
      : productDetail?.product?.image
      ? [{ image: productDetail.product.image }]
      : [];

  const hasMultipleImages = imagesData.length > 1;

  const getCalculatedPrice = () => {
    const product = productDetail?.product;
    if (!product) return 0;
    const basePrice = Number(product.price || product.base_price || 0);
    const currentQty = Number(quantity) || 0;
    if (product.tiers && product.tiers.length > 0) {
      const sortedTiers = [...product.tiers].sort(
        (a: any, b: any) => b.qty - a.qty,
      );
      for (const tier of sortedTiers) {
        if (currentQty >= tier.qty) {
          return Number(tier.price);
        }
      }
    }
    return basePrice;
  };

  const formatPrice = (price: number) =>
    Number(price) % 1 === 0 ? Number(price) : Number(price).toFixed(2);

  const debouncedUpdateCartApi = React.useCallback(
    debounce(async (id: number, newQty: number) => {
      try {
        setUpdatingQty(true);
        const res = await updateCartQuantityApi(id, newQty);
        console.log('Update Qty Res:', res);
      } catch (error) {
        console.log('Update Qty Error:', error);
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
      console.log('Add to Cart Response', res.data);
      setQuantity(qty);
      fetchCart();
    } catch (error) {
      console.log(error);
    } finally {
      setAddingToCart(false);
    }
  };

  const toggleWishlist = async () => {
    if (!productDetail) return;
    const previousLiked = liked;
    try {
      Vibration.vibrate(10);
      const newStatus = !previousLiked;
      setLiked(newStatus);
      setProductDetail((prev: any) => ({
        ...prev,
        wishlist_status: newStatus,
        product: prev?.product
          ? { ...prev.product, wishlist_status: newStatus }
          : prev?.product,
      }));
      if (newStatus) {
        await addToWishlistApi(productId);
      } else {
        await updateWishlistQtyApi(productId, 0);
      }
    } catch (error) {
      console.log('Wishlist Toggle Error:', error);
      setLiked(previousLiked);
      setProductDetail((prev: any) => ({
        ...prev,
        wishlist_status: previousLiked,
        product: prev?.product
          ? { ...prev.product, wishlist_status: previousLiked }
          : prev?.product,
      }));
    }
  };

  const updateQty = async (newQty: number | string) => {
    const isTextInputEmpty = newQty === '' || Number.isNaN(Number(newQty));
    const finalQty = isTextInputEmpty ? 0 : Number(newQty);
    if (finalQty < 0) return;
    setQuantity(newQty as any);
    if (productId && !isTextInputEmpty) {
      debouncedUpdateCartApi(productId, finalQty);
    }
  };

  const handleSuggestedAddToCart = async (id: number, qty: number = 1) => {
    try {
      Vibration.vibrate(10);
      setAddingSuggestedCartId(id);
      await addToCartApi(id, qty);
      setProductDetail((prev: any) => ({
        ...prev,
        related_products:
          prev.related_products?.map((p: any) =>
            p.id === id ? { ...p, cart_status: true, cart: { qty } } : p,
          ) || [],
        brand_products:
          prev.brand_products?.map((p: any) =>
            p.id === id ? { ...p, cart_status: true, cart: { qty } } : p,
          ) || [],
      }));
      fetchCart();
    } catch (error) {
      console.log(error);
    } finally {
      setAddingSuggestedCartId(null);
    }
  };

  const debouncedUpdateSuggestedQtyApi = React.useCallback(
    debounce(async (id: number, newQty: number) => {
      try {
        setUpdatingSuggestedQtyId(id);
        await updateCartQuantityApi(id, newQty);
      } catch (error) {
        console.log('Update Qty Error:', error);
      } finally {
        setUpdatingSuggestedQtyId(null);
      }
    }, 800),
    [],
  );

  const capitalizeWords = (text: string) =>
    text
      ? text
          .toLowerCase()
          .replace(/[_-]/g, ' ')
          .split(' ')
          .filter(Boolean)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      : '';

  const updateSuggestedQty = (id: number, newQty: number | string) => {
    const isTextInputEmpty = newQty === '' || Number.isNaN(Number(newQty));
    const finalQty = isTextInputEmpty ? 0 : Number(newQty);
    if (finalQty < 0) return;
    setProductDetail((prev: any) => ({
      ...prev,
      related_products:
        prev.related_products?.map((p: any) =>
          p.id === id
            ? {
                ...p,
                cart: { qty: isTextInputEmpty ? '' : finalQty },
                cart_status: finalQty === 0 && newQty === 0 ? false : true,
              }
            : p,
        ) || [],
      brand_products:
        prev.brand_products?.map((p: any) =>
          p.id === id
            ? {
                ...p,
                cart: { qty: isTextInputEmpty ? '' : finalQty },
                cart_status: finalQty === 0 && newQty === 0 ? false : true,
              }
            : p,
        ) || [],
    }));
    debouncedUpdateSuggestedQtyApi(id, finalQty);
  };

  const toggleSuggestedWishlist = async (product: any) => {
    try {
      const newStatus = !product.wishlist_status;
      setProductDetail((prev: any) => ({
        ...prev,
        related_products:
          prev.related_products?.map((p: any) =>
            p.id === product.id ? { ...p, wishlist_status: newStatus } : p,
          ) || [],
        brand_products:
          prev.brand_products?.map((p: any) =>
            p.id === product.id ? { ...p, wishlist_status: newStatus } : p,
          ) || [],
      }));
      if (newStatus) {
        await addToWishlistApi(product.id);
      } else {
        await updateWishlistQtyApi(product.id, 0);
      }
    } catch (error) {
      console.log('Wishlist Toggle Error:', error);
    }
  };

  useEffect(() => {
    if (productId) {
      setLoading(true);
      getProductDetailsApi(productId)
        .then(res => {
          const data = res?.data || res;
          setProductDetail(data);
          const cartStatus = data?.cart_status ?? data?.product?.cart_status;
          const cartQty =
            data?.cart_qty ?? data?.cart?.qty ?? data?.product?.cart?.qty;
          if (cartStatus && cartQty) {
            setQuantity(Number(cartQty));
          } else {
            setQuantity(0);
          }
          const wishlistStatus =
            data?.product?.wishlist_status || data?.wishlist_status;
          setLiked(!!wishlistStatus);
        })
        .catch(error => console.log('Product Detail Error:', error))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [productId]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* HEADER */}
      <Header
        centerComponent={
          <TouchableOpacity
            style={styles.searchBox}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Search')}
          >
            <Image
              source={require('../assets/Common/search.png')}
              style={{ height: 18, width: 18 }}
            />
            <Text style={[styles.searchInput, { color: '#888', marginTop: 2 }]}>
              Search products...
            </Text>
          </TouchableOpacity>
        }
        rightComponent={
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Cart', { screen: 'CartMain' })
              }
              style={styles.iconCircle}
            >
              <Image
                source={require('../assets/Common/cart.png')}
                style={{ height: 18, width: 18, tintColor: '#3A7D44' }}
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
        }
      />

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color="#487D44" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#487D44']}
              tintColor="#487D44"
            />
          }
        >
          {/* PRODUCT IMAGE */}
          <View style={[styles.imageSection, stock === 0 && { opacity: 0.5 }]}>
            <View>
              <Carousel
                width={width}
                height={250}
                data={imagesData}
                loop={hasMultipleImages}
                scrollEnabled={hasMultipleImages}
                pagingEnabled={hasMultipleImages}
                autoPlay={hasMultipleImages}
                autoPlayInterval={3000}
                scrollAnimationDuration={800}
                onSnapToItem={index => setActiveIndex(index)}
                panGestureHandlerProps={{
                  activeOffsetX: [-10, 10],
                }}
                renderItem={({ item }: { item: any }) => (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                      Vibration.vibrate(60);
                      setShowImageModal(true);
                    }}
                    style={{ flex: 1 }}
                  >
                    <Image
                      source={
                        item?.image
                          ? { uri: item.image }
                          : require('../assets/icons/sicon2.png')
                      }
                      style={styles.productImage}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                )}
              />

              {hasMultipleImages && (
                <View style={styles.paginationContainer}>
                  {imagesData.map((_: any, index: number) => (
                    <View
                      key={index}
                      style={[
                        styles.dotStyle,
                        activeIndex === index && styles.activeDot,
                      ]}
                    />
                  ))}
                </View>
              )}
            </View>

            {/* Wishlist Icon */}
            <TouchableOpacity
              onPress={toggleWishlist}
              style={styles.wishlistIcon}
            >
              <Image
                source={
                  liked
                    ? require('../assets/Common/fillheart.png')
                    : require('../assets/Common/heart.png')
                }
                style={{ height: 18, width: 18, resizeMode: 'contain' }}
              />
            </TouchableOpacity>
          </View>

          <View style={[styles.infoCard, stock === 0 && { opacity: 0.5 }]}>
            <View style={styles.productRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { width: '90%' }]}>
                  {capitalizeWords(productDetail?.product?.name || '')}
                </Text>
              </View>
              <View style={styles.priceColumn}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={styles.price}>
                    ₹{formatPrice(getCalculatedPrice())}
                  </Text>
                  {productDetail?.product?.mrp > 0 &&
                    getCalculatedPrice() <
                      Number(productDetail?.product?.mrp) && (
                      <Text style={styles.oldPrice}>
                        ₹{productDetail.product.mrp}
                      </Text>
                    )}
                </View>
                {productDetail?.product?.discount > 0 && (
                  <Text style={styles.save}>
                    Save {productDetail.product.discount}%
                  </Text>
                )}
              </View>
            </View>

            {productDetail?.product?.tiers &&
              productDetail.product.tiers.length > 0 && (
                <View style={styles.optionBox}>
                  {productDetail.product.tiers.map(
                    (tier: any, index: number) => {
                      const tiers = [...productDetail.product.tiers].sort(
                        (a, b) => b.qty - a.qty,
                      );
                      const isSelected =
                        Number(quantity || 0) >= Number(tier.qty);
                      return (
                        <View key={index}>
                          <View style={styles.optionRow}>
                            <Text style={styles.pText}>
                              {tier.qty} Pc ₹{tier.price}/pc
                            </Text>
                            <TouchableOpacity
                              disabled={stock === 0}
                              onPress={() => {
                                Vibration.vibrate(60);
                                if (quantity > 0) {
                                  updateQty(tier.qty);
                                } else {
                                  handleAddToCart(tier.qty);
                                }
                              }}
                            >
                              {isSelected ? (
                                <Image
                                  source={require('../assets/check.png')}
                                  style={{
                                    height: 16,
                                    width: 16,
                                    tintColor: '#487D44',
                                  }}
                                />
                              ) : (
                                <Text
                                  style={[
                                    styles.addText,
                                    stock === 0 && { color: '#A0A0A0' },
                                  ]}
                                >
                                  Add+
                                </Text>
                              )}
                            </TouchableOpacity>
                          </View>
                          {index < productDetail.product.tiers.length - 1 && (
                            <View style={styles.dividerP} />
                          )}
                        </View>
                      );
                    },
                  )}
                </View>
              )}

            {quantity === 0 ? (
              <TouchableOpacity
                style={[
                  styles.cartButton,
                  stock === 0 && { backgroundColor: '#ccc' },
                ]}
                onPress={() => {
                  if (stock > 0) {
                    Vibration.vibrate(60);
                    handleAddToCart();
                  }
                }}
                disabled={addingToCart || stock === 0}
              >
                {addingToCart ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : stock === 0 ? (
                  <Text style={styles.cartText}>Out of Stock</Text>
                ) : (
                  <>
                    <Image
                      source={require('../assets/Common/cart.png')}
                      style={{ height: 16, width: 16, tintColor: '#fff' }}
                      resizeMode="contain"
                    />
                    <Text style={styles.cartText}> Add to Cart</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.actionRow}>
                <View style={styles.qtyBox}>
                  <TouchableOpacity
                    onPress={() => {
                      Vibration.vibrate(60);
                      updateQty(
                        Number(quantity) > 1 ? Number(quantity) - 1 : 0,
                      );
                    }}
                    style={styles.qtyBtn}
                    disabled={updatingQty}
                  >
                    <Image
                      source={require('../assets/Common/sub.png')}
                      style={{ height: 20, width: 20 }}
                    />
                  </TouchableOpacity>

                  <View style={{ justifyContent: 'center' }}>
                    <TextInput
                      style={styles.qtyNumber}
                      keyboardType="numeric"
                      value={
                        quantity !== undefined && quantity !== null
                          ? String(quantity)
                          : ''
                      }
                      editable={!updatingQty}
                      onChangeText={text => {
                        const val = text.replace(/[^0-9]/g, '');
                        if (val === '') {
                          updateQty('');
                        } else {
                          updateQty(Number(val));
                        }
                      }}
                    />
                    {updatingQty && (
                      <View style={styles.loaderOverlay}>
                        <ActivityIndicator size="small" color="#487D44" />
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      Vibration.vibrate(60);
                      updateQty(Number(quantity || 0) + 1);
                    }}
                    style={[
                      styles.qtyBtn,
                      stock === 0 && { backgroundColor: '#A0A0A0' },
                    ]}
                    disabled={updatingQty || stock === 0}
                  >
                    <Image
                      source={require('../assets/Common/add.png')}
                      style={{ height: 20, width: 20 }}
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.buyNowBtn}
                  onPress={() =>
                    navigation.navigate('Cart', { screen: 'CartMain' })
                  }
                >
                  <Text style={styles.buyNowText}>Buy Now</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.dividerPrice} />

            <View style={styles.detailSection}>
              <Text style={styles.detailTitle}>Product details :</Text>
              <View style={styles.bulletRow}>
                <Text style={styles.dot}>•</Text>
                <Text style={styles.bulletText}>
                  {productDetail?.product?.description ||
                    productDetail?.product?.name}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.headerRow}>
            <Text style={styles.dealTitle}>Suggested Products</Text>
          </View>
          <FlatList
            data={productDetail?.related_products || []}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item =>
              item.id?.toString() || Math.random().toString()
            }
            renderItem={({ item }) => (
              <View style={{ marginBottom: 15 }}>
                <ProductCard
                  image={
                    typeof item.image === 'string'
                      ? { uri: item.image }
                      : item.image
                  }
                  title={item.name}
                  packSize={item.uom_name || ''}
                  price={item.base_price || item.price}
                  mrp={item.mrp}
                  discount={Number(item.discount || 0).toFixed(0)}
                  isOrganic={item.product_type === 'Organic'}
                  tiers={item.tiers}
                  cart_status={item.cart_status}
                  cartQty={item.cart?.qty}
                  updatingQty={
                    updatingSuggestedQtyId === item.id ||
                    addingSuggestedCartId === item.id
                  }
                  onAddPress={() => handleSuggestedAddToCart(item.id, 1)}
                  onUpdateQty={newQty => updateSuggestedQty(item.id, newQty)}
                  onWishlistPress={() => toggleSuggestedWishlist(item)}
                  wishlist_status={item.wishlist_status}
                  onTierAddPress={(tierQty: number) => {
                    if (item.cart_status) {
                      updateSuggestedQty(item.id, tierQty);
                    } else {
                      handleSuggestedAddToCart(item.id, tierQty);
                    }
                  }}
                  current_stock={item.current_stock}
                  onPress={() =>
                    navigation.navigate('ProductDetail', { productId: item.id })
                  }
                />
              </View>
            )}
          />

          <View style={styles.headerRow}>
            {Array.isArray(productDetail?.brand_products) &&
              productDetail.brand_products.length > 0 && (
                <Text style={styles.dealTitle}>Products by Brands</Text>
              )}
          </View>
          <FlatList
            data={productDetail?.brand_products || []}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item =>
              item.id?.toString() || Math.random().toString()
            }
            renderItem={({ item }) => (
              <View style={{ marginBottom: 15 }}>
                <ProductCard
                  image={
                    typeof item.image === 'string'
                      ? { uri: item.image }
                      : item.image
                  }
                  title={item.name}
                  packSize={item.uom_name || ''}
                  price={item.base_price || item.price}
                  mrp={item.mrp}
                  discount={Number(item.discount || 0).toFixed(0)}
                  isOrganic={item.product_type === 'Organic'}
                  tiers={item.tiers}
                  cart_status={item.cart_status}
                  cartQty={item.cart?.qty}
                  updatingQty={
                    updatingSuggestedQtyId === item.id ||
                    addingSuggestedCartId === item.id
                  }
                  onAddPress={() => handleSuggestedAddToCart(item.id, 1)}
                  onUpdateQty={newQty => updateSuggestedQty(item.id, newQty)}
                  onWishlistPress={() => toggleSuggestedWishlist(item)}
                  wishlist_status={item.wishlist_status}
                  onTierAddPress={(tierQty: number) => {
                    if (item.cart_status) {
                      updateSuggestedQty(item.id, tierQty);
                    } else {
                      handleSuggestedAddToCart(item.id, tierQty);
                    }
                  }}
                  current_stock={item.current_stock}
                  onPress={() =>
                    navigation.navigate('ProductDetail', { productId: item.id })
                  }
                />
              </View>
            )}
          />
        </ScrollView>
      )}

      {/* Image Modal */}
      <Modal visible={showImageModal} transparent={true} animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalHeader}>
            <Text numberOfLines={1} style={styles.modalTitle}>
              {productDetail?.product?.name}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowImageModal(false)}
            >
              <Image
                source={require('../assets/cancel.png')}
                style={{ width: 22, height: 22, resizeMode: 'contain' }}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.modalCarouselContainer}>
            <Carousel
              width={width}
              height={width * 1.2}
              data={imagesData}
              defaultIndex={activeIndex}
              loop={hasMultipleImages}
              pagingEnabled={true}
              scrollEnabled={true}
              onSnapToItem={index => setActiveIndex(index)}
              renderItem={({ item }: { item: any }) => (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 20,
                  }}
                >
                  <Image
                    source={
                      item?.image
                        ? { uri: item.image }
                        : require('../assets/icons/sicon2.png')
                    }
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="contain"
                  />
                </View>
              )}
            />

            {/* Modal Pagination Dots */}
            {imagesData.length > 1 && (
              <View style={styles.modalPagination}>
                {imagesData.map((_: any, i: number) => (
                  <View
                    key={i}
                    style={[
                      styles.modalDot,
                      activeIndex === i && styles.modalDotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default ProductDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  pText: { fontSize: 14, fontFamily: 'DMSans-Regular' },
  dealTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    fontFamily: 'DMSans-Medium',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderWidth: 1,
    marginHorizontal: 10,
    padding: 8,
    borderColor: '#d3cdcd',
    borderRadius: 20,
  },
  iconCircle: {
    marginLeft: 8,
    backgroundColor: '#eee',
    padding: 8,
    borderWidth: 1,
    borderColor: '#d3cdcd',
    borderRadius: 20,
  },
  imageB: {
    borderWidth: 1,
    padding: 8,
    borderRadius: 7,
    borderColor: '#d3cdcd',
  },
  imageSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 10,
    left: '43%',
    right: '43%',
    backgroundColor: '#DFDFDF',
    paddingVertical: 2,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: 220,
    alignSelf: 'center',
  },
  searchInput: {
    flex: 1,
    marginLeft: 6,
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    paddingVertical: 0,
  },
  wishlistIcon: {
    position: 'absolute',
    right: 20,
    top: 10,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 20,
    elevation: 4,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 20,
    margin: 10,
  },
  title: { fontSize: 14, fontWeight: '600', fontFamily: 'DMSans-SemiBold' },
  pack: { color: '#888', fontSize: 10, marginVertical: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  price: { fontSize: 14, fontFamily: 'DMSans-SemiBold' },
  oldPrice: {
    textDecorationLine: 'line-through',
    marginLeft: 6,
    fontSize: 10,
    fontFamily: 'DMSans-SemiBold',
    color: '#FF7878',
  },
  save: {
    marginLeft: 8,
    fontSize: 10,
    fontFamily: 'DMSans-Medium',
    color: '#487D44',
  },
  optionBox: {
    backgroundColor: '#f1f1f1',
    borderRadius: 12,
    marginVertical: 12,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  addText: { fontSize: 13, color: '#487D44', fontFamily: 'DMSans-Regular' },
  cartButton: {
    flexDirection: 'row',
    backgroundColor: '#487D44',
    padding: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  cartText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'DMSans-Medium',
    marginLeft: 5,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#E6E7EE',
    paddingHorizontal: 15,
    height: 50,
  },
  qtyBtn: { padding: 5 },
  qtyNumber: {
    marginHorizontal: 15,
    fontSize: 15,
    fontFamily: 'DMSans-SemiBold',
    color: '#487D44',
  },
  buyNowBtn: {
    backgroundColor: '#487D44',
    borderRadius: 14,
    height: 50,
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyNowText: { color: '#fff', fontSize: 15, fontFamily: 'DMSans-Medium' },
  detailSection: { marginTop: 15 },
  detailTitle: { marginBottom: 5, fontFamily: 'DMSans-SemiBold', fontSize: 14 },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  dot: { fontSize: 15, marginRight: 2, lineHeight: 20 },
  bulletText: {
    flex: 1,
    lineHeight: 15,
    fontSize: 12,
    color: '#374151',
    fontFamily: 'DMSans-Regular',
  },
  badgeRow: { flexDirection: 'row', marginTop: 15, alignItems: 'center' },
  badge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 10,
    borderRadius: 10,
  },
  badgeTitle: {
    fontSize: 10,
    marginLeft: 10,
    color: '#777',
    fontFamily: 'DMSans-Regular',
  },
  badgeSub: { marginLeft: 10, fontSize: 14, fontFamily: 'DMSans-SemiBold' },
  badgeSubB: {
    fontSize: 8,
    color: 'green',
    fontFamily: 'DMSans-Regular',
    marginLeft: 10,
  },
  suggestedTitle: { fontSize: 16, fontWeight: '600', margin: 15 },
  suggestedCard: {
    width: 150,
    backgroundColor: '#fff',
    marginLeft: 15,
    padding: 10,
    borderRadius: 12,
  },
  suggestedImage: { height: 80, backgroundColor: '#eee', borderRadius: 10 },
  suggestedName: { fontSize: 12, marginVertical: 5 },
  suggestedPrice: { fontWeight: 'bold' },
  activeDot: {
    backgroundColor: '#3A7D44',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  priceColumn: { alignItems: 'flex-end' },
  dividerPrice: {
    height: 1,
    backgroundColor: '#b2b3b880',
    marginTop: 12,
  },
  dividerP: {
    height: 1,
    backgroundColor: '#E6E7EE80',
    marginVertical: 1,
  },
  badgeCart: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: '#F59E0B',
    borderRadius: 50,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { color: '#000', fontSize: 10, fontFamily: 'DMSans-Bold' },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 9,
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  discountText: { fontSize: 12, fontFamily: 'DMSans-SemiBold' },
  dotStyle: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#bbb',
    marginHorizontal: 3,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.98)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontFamily: 'DMSans-SemiBold',
    marginRight: 40,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCarouselContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 50,
  },
  modalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
    marginHorizontal: 4,
  },
  modalDotActive: {
    backgroundColor: '#487D44',
    width: 24,
  },
  closeText: { color: '#fff', fontSize: 16, fontFamily: 'DMSans-SemiBold' },
});
