import React, { useEffect, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  useWindowDimensions,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  PermissionsAndroid,
  Platform,
  Modal,
  Alert,
  ImageBackground,
  Pressable,
} from 'react-native';
// import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Carousel from 'react-native-reanimated-carousel';
import ProductCard from '../components/ProductCard';
// import { HomeStackParamList } from "../navigation/HomeStack";
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Geolocation from '@react-native-community/geolocation';
import { GOOGLE_MAPS_API_KEY } from '../config';
import {
  BASE_URL,
  getProfileApi,
  addToCartApi,
  updateCartQuantityApi,
  getAddressApi,
  addToWishlistApi,
  updateWishlistQtyApi,
  getDealProductsApi,
  getCartApi,
  getCompanyProfileApi,
} from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen: React.FC<any> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const numColumns = 4;
  const spacing = 12;
  const itemSize = (width - spacing * (numColumns + 1)) / numColumns;
  const cardWidth = width * 0.75;
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [bannerData, setBannerData] = React.useState<any[]>([]);
  const [categoryData, setCategoryData] = React.useState<any[]>([]);
  const [brandData, setBrandData] = React.useState<any[]>([]);
  const [brandData1, setBrandData1] = React.useState<any[]>([]);
  const [dealBanner, setDealBanner] = React.useState<any[]>([]);
  const [visibleBrandCount, setVisibleBrandCount] = useState(10);

  const [dealOfDayData, setDealOfDayData] = React.useState<any[]>([]);
  const [groupedProducts, setGroupedProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [gst, setGst] = useState<string | null>(null);
  const [addingToCartId, setAddingToCartId] = useState<number | null>(null);
  const [updatingQtyId, setUpdatingQtyId] = useState<number | null>(null);
  const [defaultAddress, setDefaultAddress] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [dealOfDayProduct, setDealOfDayProduct] = React.useState<any[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartLoading, setCartLoading] = useState(true);
  const isFirstLoad = React.useRef(true);

  const flatListLeftRef = React.useRef<FlatList>(null);
  const flatListRightRef = React.useRef<FlatList>(null);
  const leftOffsetRef = React.useRef(0);
  const rightOffsetRef = React.useRef(0);

  useEffect(() => {
    if (!brandData.length) return;
    const interval = setInterval(() => {
      leftOffsetRef.current += 1;
      flatListLeftRef.current?.scrollToOffset({
        offset: leftOffsetRef.current,
        animated: false,
      });
    }, 32);
    return () => clearInterval(interval);
  }, [brandData]);

  useEffect(() => {
    if (!brandData1.length) return;
    const interval = setInterval(() => {
      rightOffsetRef.current += 1;
      flatListRightRef.current?.scrollToOffset({
        offset: rightOffsetRef.current,
        animated: false,
      });
    }, 32);
    return () => clearInterval(interval);
  }, [brandData1]);

  const getCompanyProfile = async () => {
    try {
      const response = await getCompanyProfileApi();
      const data = response?.data;
      console.log('Get Company Api Data home screen :-------->', data);

      setGst(data?.gst);
    } catch (error) {
      console.log('Get Profile Error:', error);
    }
  };

  const fetchCart = async () => {
    try {
      setCartLoading(true);
      const data = await getCartApi();
      console.log('Cart Data', data.data);
      setCartItems(data.data || []);
    } catch (error) {
      console.log('Cart fetch error:', error);
    } finally {
      setCartLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([getProfile(true), getHomePage(true)]);
    setRefreshing(false);
  }, []);

  const fetchDeals = async (isSilent: boolean = false) => {
    try {
      if (!isSilent) setLoading(true);
      const res = await getDealProductsApi();

      console.log('Deal of the day Product', res?.dealofdayproduct);

      setDealOfDayProduct(res?.dealofdayproduct || []);
    } catch (err) {
      console.log('Error fetching deals:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = (): Promise<void> => {
    return new Promise(resolve => {
      Geolocation.getCurrentPosition(
        async pos => {
          const { latitude, longitude } = pos.coords;
          setCoords({ latitude, longitude });
          console.log('📍 User Current Location fetched in Home:', {
            latitude,
            longitude,
          });
          try {
            const response = await axios.get(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`,
            );

            if (response.data?.results?.length > 0) {
              const fullAddress = response.data.results[0].formatted_address;
              const shortAddress = fullAddress
                .split(', ')
                .slice(0, 3)
                .join(', ');
              setCurrentLocation(shortAddress);
            } else {
              setCurrentLocation(
                `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              );
            }
          } catch (err: any) {
            console.log('Geocoding error:', err.message);
            setCurrentLocation(
              `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            );
          }
          resolve();
        },
        err => {
          console.log('Geolocation error:', err.message);
          setCurrentLocation('Location unavailable');
          resolve();
        },
        { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 },
      );
    });
  };

  const fetchAddresses = async () => {
    try {
      const res = await getAddressApi();
      const list: any[] = res?.data || [];
      const def = list.find((a: any) => a.default_status === 1);

      if (def) {
        setDefaultAddress(def);
        if (def.coordinates) {
          const [lat, lng] = def.coordinates
            .split(',')
            .map((c: string) => parseFloat(c));
          if (!isNaN(lat) && !isNaN(lng)) {
            setCoords({ latitude: lat, longitude: lng });
          }
        }
        return;
      }

      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          await getCurrentLocation();
        } else {
          // console.log("Permission denied");
          setCurrentLocation('Permission denied');
          Alert.alert(
            'Permission Required',
            'Please enable location permission',
          );
        }
      } else {
        Geolocation.requestAuthorization(
          () => {
            getCurrentLocation();
          },
          (error: any) => {
            console.log('Permission denied', error);
            setCurrentLocation('Permission denied');
          },
        );
      }
    } catch (error) {
      console.log('Fetch Address Error', error);
    }
  };

  const getDeliveryDate = (daysAhead: number = 2) => {
    const MONTHS = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  };

  const getProfile = async (isSilent: boolean = false) => {
    try {
      if (!isSilent) setLoading(true);

      const response = await getProfileApi();
      const data = response?.data;
      console.log('Get Profile in Home Screen:', response.data);
      // setGst(data?.gst);
    } catch (error: any) {
      console.log('Get Profile Error:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const getHomePage = async (isSilent: boolean = false) => {
    try {
      if (!isSilent) setLoading(true);

      const token = await AsyncStorage.getItem('userToken');
      // console.log("token", token);

      const response = await axios.get(`${BASE_URL}/home-page`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      console.log('Home API Response:', response.data.data);
      setBannerData(response.data.data.sliders);
      setCategoryData(response.data.data.category);
      const brandsList = response.data.data.brand1 || [];
      const brandsList1 = response.data.data.brand2 || [];
      console.log('brand1[0]:', brandsList); // 👈 check field name
      console.log('brand2[0]:', brandsList1);
      setDealBanner(response.data.data.app_slider);
      // setAllBrands(brandsList);
      // setBrandData1(brandsList1);
      setBrandData(brandsList);
      setBrandData1(brandsList1);
      setVisibleBrandCount(15);
      setDealOfDayData(response.data.data.dealOfDay);
      setGroupedProducts(response.data.data.products || []);
    } catch (error: any) {
      console.log('Home API Error:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const checkTokenAndFetch = async () => {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          navigation.navigate('Signup');
          return;
        }
        getProfile(!isFirstLoad.current);
        fetchAddresses();
        getHomePage(!isFirstLoad.current);
        fetchDeals(!isFirstLoad.current);
        fetchCart();
        getCompanyProfile();

        if (isFirstLoad.current) {
          isFirstLoad.current = false;
        }
      };

      checkTokenAndFetch();
    }, []),
  );

  const loadMoreBrands = () => {
    if (loadingMore) return;

    const maxLength = Math.max(brandData.length, brandData1.length);

    if (visibleBrandCount >= maxLength) return;

    setLoadingMore(true);

    setTimeout(() => {
      setVisibleBrandCount(prev => prev + 15);
      setLoadingMore(false);
    }, 500);
  };

  const handleAddToCart = useCallback(
    async (productId: number, quantity: number = 1) => {
      try {
        setAddingToCartId(productId);
        const res = await addToCartApi(productId, quantity);
        console.log('Add to Cart Response', res.data);

        setGroupedProducts(prev =>
          prev.map(section => ({
            ...section,
            products: section.products.map((p: any) =>
              p.id === productId
                ? { ...p, cart_status: true, cart: { qty: quantity } }
                : p,
            ),
          })),
        );

        setDealOfDayProduct(prev =>
          prev.map((p: any) =>
            p.id === productId
              ? { ...p, cart_status: true, cart: { qty: quantity } }
              : p,
          ),
        );
      } catch (error) {
        console.log(error);
      } finally {
        setAddingToCartId(null);
      }
    },
    [],
  );

  const debouncedUpdateCartApi = useCallback(
    debounce(async (productId: number, newQty: number) => {
      try {
        setUpdatingQtyId(productId);
        const res = await updateCartQuantityApi(productId, newQty);
        console.log('Update Qty Response', res.data);
      } catch (error) {
        console.log('Update Qty Error:', error);
      } finally {
        setUpdatingQtyId(null);
      }
    }, 1200),
    [],
  );

  const updateQty = useCallback(
    async (productId: number, newQty: number | string) => {
      const isTextInputEmpty = newQty === '' || Number.isNaN(Number(newQty));
      const finalQty = isTextInputEmpty ? 0 : Number(newQty);

      if (finalQty < 0) return;

      setGroupedProducts(prev =>
        prev.map(section => ({
          ...section,
          products: section.products.map((p: any) =>
            p.id === productId
              ? {
                  ...p,
                  cart_status: finalQty > 0,
                  cart: { ...p.cart, qty: finalQty },
                }
              : p,
          ),
        })),
      );

      setDealOfDayProduct(prev =>
        prev.map((p: any) =>
          p.id === productId
            ? {
                ...p,
                cart_status: finalQty > 0,
                cart: { ...p.cart, qty: finalQty },
              }
            : p,
        ),
      );

      if (finalQty > 0) {
        debouncedUpdateCartApi(productId, finalQty);
      } else {
        debouncedUpdateCartApi(productId, 0);
      }
    },
    [debouncedUpdateCartApi],
  );

  const toggleWishlist = useCallback(async (product: any) => {
    try {
      const newStatus = !product.wishlist_status;

      setGroupedProducts(prev =>
        prev.map(section => ({
          ...section,
          products: section.products.map((p: any) =>
            p.id === product.id ? { ...p, wishlist_status: newStatus } : p,
          ),
        })),
      );

      setDealOfDayProduct(prev =>
        prev.map((p: any) =>
          p.id === product.id ? { ...p, wishlist_status: newStatus } : p,
        ),
      );

      if (newStatus) {
        await addToWishlistApi(product.id);
        // Alert.alert("Success", "Successfully added to wishlist");
        console.log('Success', 'Successfully added to wishlist');
      } else {
        await updateWishlistQtyApi(product.id, 0);
        // Alert.alert("Success", "Item removed from wishlist");
        console.log('Success', 'Item removed from wishlist');
      }
    } catch (error) {
      console.log('Wishlist Toggle Error:', error);
      setGroupedProducts(prev =>
        prev.map(section => ({
          ...section,
          products: section.products.map((p: any) =>
            p.id === product.id
              ? { ...p, wishlist_status: product.wishlist_status }
              : p,
          ),
        })),
      );

      setDealOfDayProduct(prev =>
        prev.map((p: any) =>
          p.id === product.id
            ? { ...p, wishlist_status: product.wishlist_status }
            : p,
        ),
      );
    }
  }, []);

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

  // Fix for reanimated-carousel blank space when loop is true
  // It requires at least 4 items to safely render parallax left/right neighbors without empty holes
  const getLoopedData = (data: any[]) => {
    if (!data || data.length === 0) return [];
    if (data.length === 1) return [data[0], data[0], data[0], data[0]];
    if (data.length === 2) return [...data, ...data];
    // length 3 is sometimes enough, but 6 is butter smooth for looping
    if (data.length === 3) return [...data, ...data];
    return data;
  };

  const loopedBannerData = getLoopedData(bannerData);
  const loopedDealBanner = getLoopedData(dealBanner);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Address */}
      <View style={styles.addressRow}>
        <View>
          {/* Delivery Row */}
          <View style={styles.iconTextRow}>
            <Image
              source={require('../assets/icons/calendar.png')}
              style={styles.iconSet}
            />
            <Text style={styles.deliveryText}>
              Estimated Delivery by {getDeliveryDate()}
            </Text>
          </View>

          {/* Address Row */}
          <TouchableOpacity
            style={[styles.iconTextRow, { marginTop: 3, width: '100%' }]}
            onPress={() => navigation.navigate('Addresses')}
          >
            <Image
              source={require('../assets/Common/SLocation.png')}
              style={[styles.iconSet, { tintColor: '#487D44' }]}
              resizeMode="contain"
            />
            <Text style={styles.addressText} numberOfLines={1}>
              {defaultAddress
                ? capitalizeWords(defaultAddress.address)
                : currentLocation
                ? currentLocation
                : 'Fetching location...'}
            </Text>
            <Image
              source={require('../assets/Common/ArrowDown.png')}
              style={{ height: 6, width: 8, marginLeft: 1 }}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={[
              styles.iconTextRow,
              { marginTop: 3, width: "100%", backgroundColor: "green" },
            ]}
            onPress={() => setShowAddressModal(true)}
          >
            <Image
              source={require("../assets/Common/SLocation.png")}
              style={[styles.iconSet, { tintColor: "#487D44" }]}
              resizeMode="contain"
            />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                flex: 1,
                marginLeft: 6,
              }}
            >
              <Text
                style={[
                  styles.addressText,
                  { width: "100%", backgroundColor: "red" },
                ]}
                numberOfLines={1}
              >
                {defaultAddress
                  ? capitalizeWords(defaultAddress.address)
                  : currentLocation
                  ? currentLocation
                  : "Fetching location..."}
              </Text>

              <Image
                source={require("../assets/Common/ArrowDown.png")}
                style={{
                  height: 6,
                  width: 8,
                  marginLeft: 3,
                }}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity> */}
        </View>

        <TouchableOpacity
          style={styles.bellContainer}
          onPress={() => navigation.navigate('NotificationScreen')}
        >
          <Image
            source={require('../assets/Common/notification.png')}
            style={{
              height: 20,
              width: 20,
              tintColor: '#487D44',
            }}
            resizeMode="contain"
          />

          <View
            style={{
              position: 'absolute',
              right: -7,
              top: -7,
              backgroundColor: '#F59E0B',
              borderRadius: 50,
              minWidth: 18,
              height: 18,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 4,
            }}
          >
            <Text
              style={[
                // styles.badgeText,
                {
                  textAlign: 'center',
                  includeFontPadding: false,
                  color: '#000',
                  fontSize: 10,
                  fontFamily: 'DMSans-Bold',
                  textAlignVertical: 'center',
                  marginTop: 2,
                },
              ]}
            >
              3+
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.searchDisplay}>
        <TouchableOpacity
          style={styles.searchBox}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Search')}
        >
          <Image
            source={require('../assets/Common/search.png')}
            style={{
              height: 20,
              width: 20,
              tintColor: '#487D44',
            }}
            resizeMode="contain"
          />
          <Text
            style={{
              marginLeft: 8,
              color: '#888',
              fontSize: 14,
              fontFamily: 'DMSans-Regular',
            }}
          >
            Search products...
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Cart', { screen: 'CartMain' })}
          style={styles.cartWrapper}
        >
          <Image
            source={require('../assets/Common/cart.png')}
            style={{
              height: 20,
              width: 20,
              tintColor: '#487D44',
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
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#487D44" />
        </View>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#487D44']}
            />
          }
          data={groupedProducts}
          keyExtractor={(item, index) => index.toString()}
          initialNumToRender={2}
          maxToRenderPerBatch={4}
          windowSize={5}
          removeClippedSubviews={true}
          ListHeaderComponent={
            <>
              <View
                style={{
                  marginTop: 5,
                }}
              >
                <Carousel
                  loop
                  width={width}
                  height={180}
                  data={loopedBannerData}
                  autoPlay
                  autoPlayInterval={3000}
                  mode="parallax"
                  modeConfig={{
                    parallaxScrollingScale: 1,
                    parallaxScrollingOffset: 80,
                    parallaxAdjacentItemScale: 0.8,
                  }}
                  onSnapToItem={index => setActiveIndex(index)}
                  renderItem={({ item }) => (
                    <View style={{ paddingHorizontal: 10 }}>
                      <Image
                        source={{ uri: item.image }}
                        style={{
                          width: width - 60,
                          height: 160,
                          borderRadius: 18,
                          alignSelf: 'center',
                        }}
                        resizeMode={Platform.OS === 'ios' ? 'none' : 'stretch'}
                      />
                    </View>
                  )}
                />

                {/* Pagination */}
                <View style={styles.paginationContainer}>
                  {bannerData.map((_, index) => {
                    const isActive = activeIndex % bannerData.length === index;
                    return (
                      <View
                        key={index}
                        style={[
                          styles.dot,
                          isActive ? styles.activeDot : styles.inactiveDot,
                        ]}
                      />
                    );
                  })}
                </View>
              </View>
              {/* Category Title */}
              <Text style={styles.categoryTitle}>Shop by category</Text>
              {/* Categories Grid */}
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  paddingHorizontal: 14,
                }}
              >
                {categoryData.map((item, index) => {
                  const gap =
                    (width - 28 - itemSize * numColumns) / (numColumns - 1);
                  return (
                    <View
                      key={item.id}
                      style={{
                        width: itemSize,
                        backgroundColor: '#F4F4F4',
                        padding: 4,
                        borderRadius: 10,
                        marginBottom: spacing,
                        marginRight: (index + 1) % numColumns === 0 ? 0 : gap,
                      }}
                    >
                      <TouchableOpacity
                        style={[styles.card, {}]}
                        onPress={() =>
                          navigation.navigate('CategoryProduct', {
                            catname: item.name,
                            categoryId: item.id,
                          })
                        }
                      >
                        <View
                          style={{
                            padding: 0,
                            backgroundColor: '#ffff',
                            borderRadius: 10,
                          }}
                        >
                          <Image
                            source={{ uri: item.image }}
                            style={{
                              width: itemSize * 0.85,
                              height: itemSize * 0.85,
                              resizeMode: 'contain',
                            }}
                          />
                        </View>
                      </TouchableOpacity>

                      <Text style={styles.title} numberOfLines={2}>
                        {capitalizeWords(item.name)}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <View style={{ marginTop: 10 }}>
                <Carousel
                  loop
                  width={width}
                  height={170}
                  data={loopedDealBanner}
                  autoPlay
                  autoPlayInterval={3000}
                  mode="parallax"
                  modeConfig={{
                    parallaxScrollingScale: 1,
                    parallaxScrollingOffset: 80,
                    parallaxAdjacentItemScale: 0.8,
                  }}
                  /* Intentionally removed onSnapToItem so it doesn't break the top banner's pagination dots! */
                  renderItem={({ item }) => (
                    <View style={{ paddingHorizontal: 10 }}>
                      <Image
                        source={
                          typeof item.image === 'string'
                            ? { uri: item.image }
                            : item.image
                        }
                        style={{
                          width: width - 60,
                          height: 160,
                          borderRadius: 18,
                          alignSelf: 'center',
                        }}
                        resizeMode={Platform.OS === 'ios' ? 'none' : 'stretch'}
                      />
                    </View>
                  )}
                />
              </View>
              <Text
                style={[
                  styles.dealTitle,
                  { paddingHorizontal: 16, marginBottom: 10, marginTop: 10 },
                ]}
              >
                Limited-Time Business Deals for HoReCa
              </Text>

              {dealOfDayProduct?.length === 0 ? (
                <View style={{ alignItems: 'center', marginVertical: 20 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      color: '#888',
                      fontFamily: 'DMSans-Regular',
                    }}
                  >
                    No Product in Deal of the Day for now
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={dealOfDayProduct}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ paddingBottom: 5 }}
                  keyExtractor={item => item.id.toString()}
                  initialNumToRender={4}
                  maxToRenderPerBatch={4}
                  windowSize={5}
                  removeClippedSubviews={true}
                  getItemLayout={(data, index) => ({
                    length: 195,
                    offset: 195 * index,
                    index,
                  })}
                  renderItem={({ item }) => (
                    <ProductCard
                      image={
                        typeof item.image === 'string'
                          ? { uri: item.image }
                          : item.image
                      }
                      title={item.name}
                      packSize={''}
                      price={item.base_price}
                      mrp={item.mrp}
                      discount={Number(item.discount).toFixed(0)}
                      isOrganic={item.is_organic || false}
                      onAddPress={() => handleAddToCart(item.id, 1)}
                      onPress={() =>
                        navigation.navigate('ProductDetail', {
                          productId: item.id,
                        })
                      }
                      bestRate={item.bestRate || ''}
                      tiers={item.tiers}
                      cart_status={item.cart_status}
                      cartQty={item.cart?.qty}
                      current_stock={item.current_stock} // ✅ ADD THIS
                      uom_name={item.uom_name}
                      onUpdateQty={newQty => updateQty(item.id, newQty)}
                      updatingQty={updatingQtyId === item.id}
                      wishlist_status={item.wishlist_status}
                      onWishlistPress={() => toggleWishlist(item)}
                      onTierAddPress={(tierQty: number) => {
                        if (item.cart_status) {
                          updateQty(item.id, tierQty);
                        } else {
                          handleAddToCart(item.id, tierQty);
                        }
                      }}
                    />
                  )}
                />
              )}
            </>
          }
          renderItem={({ item: section, index }) => (
            <View key={section.category_id || index}>
              <View style={[styles.headerRow, { marginBottom: 10 }]}>
                <Text style={styles.dealTitle}>
                  {capitalizeWords(section.category_name)}
                </Text>
              </View>

              <FlatList
                data={section.products}
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ paddingBottom: 10 }}
                keyExtractor={item => item.id.toString()}
                initialNumToRender={4}
                maxToRenderPerBatch={4}
                windowSize={5}
                removeClippedSubviews={true}
                getItemLayout={(data, index) => ({
                  length: 195,
                  offset: 195 * index,
                  index,
                })}
                renderItem={({ item }) => (
                  <ProductCard
                    image={
                      typeof item.image === 'string'
                        ? { uri: item.image }
                        : item.image
                    }
                    title={item.name}
                    packSize={''}
                    price={item.price}
                    mrp={item.mrp}
                    current_stock={item.current_stock}
                    uom_name={item.uom_name}
                    discount={Number(item.discount).toFixed(0)}
                    isOrganic={item.product_type === 'Organic'}
                    // product_type={item.product_type}
                    onAddPress={() => handleAddToCart(item.id, 1)}
                    onPress={() =>
                      navigation.navigate('ProductDetail', {
                        productId: item.id,
                      })
                    }
                    bestRate={item.bestRate || ''}
                    tiers={item.tiers}
                    cart_status={item.cart_status}
                    cartQty={item.cart?.qty}
                    onUpdateQty={newQty => updateQty(item.id, newQty)}
                    updatingQty={updatingQtyId === item.id}
                    wishlist_status={item.wishlist_status}
                    onWishlistPress={() => toggleWishlist(item)}
                    onTierAddPress={(tierQty: number) => {
                      if (item.cart_status) {
                        updateQty(item.id, tierQty);
                      } else {
                        handleAddToCart(item.id, tierQty);
                      }
                    }}
                  />
                )}
              />
            </View>
          )}
          ListFooterComponent={
            <>
              <ImageBackground
                source={require('../assets/brandbg.jpeg')}
                style={styles.brandSection}
                imageStyle={{ borderTopLeftRadius: 5, borderTopRightRadius: 5 }}
              >
                <Text
                  style={[
                    styles.brandTitle,
                    {
                      color: '#fff',
                      paddingHorizontal: 16,
                    },
                  ]}
                >
                  Shop by Brands
                </Text>
                <View style={{ flex: 1 }}>
                  {/* Top horizontal brand list */}
                  <FlatList
                    ref={flatListLeftRef}
                    horizontal
                    scrollEnabled={false}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                      paddingHorizontal: 10,
                      marginBottom: 2,
                      marginTop: 10,
                    }}
                    data={brandData.slice(0, visibleBrandCount)}
                    keyExtractor={(item, index) => `left-${item.id}-${index}`}
                    renderItem={({ item, index }) => (
                      <Pressable
                        style={styles.brandHorizontalCard}
                        onPress={() =>
                          //   navigation.navigate("BrandProduct", {
                          //     brandId: item.id,
                          //     brandName: item.name || "Brand",
                          //   })
                          console.log('Pressed Brand', item)
                        }
                      >
                        <Image
                          source={{ uri: item.image }}
                          style={styles.brandHorizontalImage}
                          resizeMode="contain"
                        />
                      </Pressable>
                    )}
                    getItemLayout={(data, index) => ({
                      length: 110,
                      offset: 110 * index,
                      index,
                    })}
                    onEndReached={loadMoreBrands}
                    onEndReachedThreshold={0.5}
                  />

                  {/* Bottom horizontal brand list */}
                  <FlatList
                    ref={flatListRightRef}
                    horizontal
                    inverted
                    scrollEnabled={false}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                      paddingHorizontal: 10,
                      marginVertical: 10,
                    }}
                    data={brandData1.slice(0, visibleBrandCount)}
                    keyExtractor={(item, index) => `right-${item.id}-${index}`}
                    renderItem={({ item, index }) => (
                      <Pressable
                        style={styles.brandHorizontalCard}
                        onPress={() =>
                          // navigation.navigate("BrandProduct", {
                          //   brandId: item.id,
                          //   brandName: item.name || "Brand",
                          // })
                          console.log('Pressed Brand', item)
                        }
                      >
                        <Image
                          source={{ uri: item.image }}
                          style={styles.brandHorizontalImage}
                          resizeMode="contain"
                        />
                      </Pressable>
                    )}
                    getItemLayout={(data, index) => ({
                      length: 110,
                      offset: 110 * index,
                      index,
                    })}
                    onEndReached={loadMoreBrands}
                    onEndReachedThreshold={0.5}
                  />
                  {loadingMore && (
                    <View style={{ paddingVertical: 10, alignItems: 'center' }}>
                      <ActivityIndicator size="small" color="#487D44" />
                    </View>
                  )}
                </View>
              </ImageBackground>
            </>
          }
        />
      )}
      {!loading && !gst && (
        <View style={[styles.containerBotom, { width: '100%' }]}>
          <View style={styles.iconWrapper}>
            <Image
              source={require('../assets/icons/bottom-icon.png')}
              style={styles.iconBottom}
            />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.textBottom}>
              Complete your account setup to see actual pricing & start placing
              orders.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Profile', {
                screen: 'CompanyProfile',
              })
            }
            style={styles.button}
          >
            <Text style={styles.buttonText}>Start ›</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  brandHorizontalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
    // width: Platform.OS === "ios" ? 120 : 100,
    // shadow (iOS)
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    // shadow (Android)
    elevation: 2,
  },

  brandHorizontalImage: {
    width: 76,
    height: 66,
    resizeMode: 'contain',
  },

  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 15,
  },

  viewAll: {
    fontSize: 10,
    fontFamily: 'DMSans-Medium',
    color: '#000000',
  },

  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15,
    paddingHorizontal: 14,
  },
  iconSet: {
    height: 15,
    width: 15,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBottom: {
    height: 25,
    width: 25,
  },

  iconTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },

  deliveryText: {
    fontSize: 12,
    color: '#000',
    fontFamily: 'DMSans-Bold',
    marginLeft: 6,
  },
  bellContainer: {
    position: 'relative',
  },

  badge: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: '#F59E0B',
    borderRadius: 50,
    minWidth: 15,
    height: 15,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
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

  badgeText: {
    color: '#000',
    fontSize: 10,
    fontFamily: 'DMSans-Bold',
  },

  addressText: {
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    marginLeft: 6,
    maxWidth: '70%',
  },

  searchDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 14,
  },

  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
    borderWidth: 1,
    borderColor: '#ADAEBC',
  },

  searchInput: {
    marginLeft: 8,
    flex: 1,
    fontFamily: 'DMSans-Regular',
  },

  cartIcon: {
    marginLeft: 12,
  },

  cartWrapper: {
    width: 45,
    height: 45,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    borderWidth: 1,
    borderColor: '#ADAEBC',
  },

  bannerImage: {
    height: 180,
    borderRadius: 15,
  },

  categoryTitle: {
    fontSize: 16,
    fontWeight: '300',
    fontFamily: 'DMSans-Medium',
    marginBottom: 10,
    paddingHorizontal: 14,
  },

  card: {
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: 1,
    padding: 10,
  },

  title: {
    textAlign: 'center',
    fontSize: 10,
    marginTop: 5,
    fontFamily: 'DMSans-SemiBold',
    color: '#303030',
    fontWeight: '100',
  },

  categoryCard: {
    flex: 1,
    width: '23%',
    alignItems: 'center',
    marginBottom: 48,
  },

  categoryImage: {
    width: 80,
    height: 80,
    resizeMode: 'center',
  },

  categoryText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 15,
    fontFamily: 'DMSans-SemiBold',
  },

  dealTitle: {
    fontSize: 16,
    fontWeight: '300',
    fontFamily: 'DMSans-Medium',
  },

  sliderContainer: {
    height: 180,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },

  dealImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },

  brandSection: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingVertical: 10,
    marginTop: 10,
  },

  brandTitle: {
    fontSize: 16,
    marginBottom: 10,
    fontFamily: 'DMSans-Medium',
    fontWeight: '400',
    paddingHorizontal: 7,
  },

  brandCard: {
    backgroundColor: '#fff',
    height: 68,
    width: '31.5%',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    margin: 2,
    borderWidth: 1,
    borderColor: '#F2F2F2',
  },

  brandImage: {
    width: 56,
    height: 56,
    resizeMode: 'cover',
  },

  containerBotom: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 13,
  },

  iconWrapper: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  textBottom: {
    fontSize: 12,
    color: '#5F6C7B',
    fontFamily: 'DMSans-Regular',
    lineHeight: 15,
  },
  button: {
    backgroundColor: '#487D44',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 9,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    fontWeight: '600',
  },

  paginationContainer: {
    position: 'absolute',
    top: 150,
    alignSelf: 'center',
    flexDirection: 'row',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginHorizontal: 2.5,
  },
  activeDot: {
    backgroundColor: '#6b8968ff',
  },
  inactiveDot: {
    backgroundColor: '#D1D5DB',
  },
  miniMapContainer: {
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  miniMap: {
    width: '100%',
    height: '100%',
  },
});
