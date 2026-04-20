import React, { useState, useCallback } from 'react';
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
  Vibration,
  PermissionsAndroid,
  ToastAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import {
  getCartApi,
  getCompanyProfileApi,
  removeCartItemApi,
  updateCartQuantityApi,
} from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { debounce } from 'lodash';
import { generatePDF as convertToPDF } from 'react-native-html-to-pdf';
import * as XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import notifee from '@notifee/react-native';

interface CartItemProps {
  item: any;
  removeItem: (cart_id: number) => void;
  updateQty: (
    product_id: number,
    type: 'inc' | 'dec' | 'set',
    directValue?: number | string,
  ) => void;
  formatPrice: (price: number) => string;
  formatPriceClean: (price: number) => string;
  getCalculatedPrice: (item: any) => number;
  getActiveTier: (item: any) => any;
  updatingQtyId: number | null;
}

const CartItem = React.memo(
  ({
    item,
    removeItem,
    updateQty,
    formatPrice,
    formatPriceClean,
    getCalculatedPrice,
    getActiveTier,
    updatingQtyId,
  }: CartItemProps) => {
    return (
      <View
        style={[
          styles.card,
          Number(item.current_stock) === 0 && { opacity: 0.5 },
        ]}
      >
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            padding: 5,
            marginRight: 10,
            borderRadius: 10,
            backgroundColor: '#e5e7eb',
          }}
        >
          <Image
            source={
              item.image
                ? { uri: item.image }
                : require('../assets/productimg.jpg')
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
                source={require('../assets/Common/trash.png')}
                style={{
                  height: 16,
                  width: 16,
                  tintColor: '#DC2626',
                }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.line} />

          {item?.price_tiers && item.price_tiers.length > 0 && (
            <View style={styles.variantBox}>
              {item.price_tiers.map((tier: any, index: number) => {
                const isLast = index === item.price_tiers.length - 1;
                const isSelected = Number(item?.qty || 0) >= tier.qty;

                return (
                  <View key={index}>
                    <View style={styles.variantRow}>
                      <Text style={styles.slabPrice}>
                        {tier.qty} Pc ₹{formatPrice(tier.price)}/pc
                      </Text>

                      <TouchableOpacity
                        onPress={() => {
                          Vibration.vibrate(60);
                          updateQty(item.product_id, 'set', tier.qty);
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
                          <Text style={styles.addSmall}>Add+</Text>
                        )}
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
                {Number(item.mrp) > 0 && (
                  <Text style={styles.oldPrice}>
                    ₹{formatPriceClean(item.mrp)}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.qtyBox}>
              {updatingQtyId === item.product_id ? (
                <ActivityIndicator size="small" color="#487D44" />
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => {
                      Vibration.vibrate(60);
                      updateQty(item.product_id, 'dec');
                    }}
                  >
                    <Text style={styles.qtyicon}>-</Text>
                  </TouchableOpacity>

                  <TextInput
                    style={styles.qtyText}
                    keyboardType="numeric"
                    maxLength={5}
                    value={
                      item.qty !== undefined && item.qty !== null
                        ? String(item.qty)
                        : ''
                    }
                    onChangeText={text => {
                      const val = text.replace(/[^0-9]/g, '');
                      updateQty(
                        item.product_id,
                        'set',
                        val === '' ? '' : Number(val),
                      );
                    }}
                    onBlur={() => {
                      if (String(item.qty) === '' || Number(item.qty) === 0) {
                        updateQty(item.product_id, 'set', 1);
                      }
                    }}
                  />

                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => {
                      Vibration.vibrate(60);
                      updateQty(item.product_id, 'inc');
                    }}
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
  },
);

const CartScreen: React.FC = ({ navigation }: any) => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderSummary, setOrderSummary] = useState<any>(null);
  const [hasGST, setHasGST] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingQtyId, setUpdatingQtyId] = useState<number | null>(null);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  const logo = require('../assets/images/logo-white.png');

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await Promise.all([fetchCart()]);
    } catch (error) {
      console.log('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const getCompanyProfile = async () => {
    try {
      const response = await getCompanyProfileApi();
      const data = response?.data;
      console.log('Get Company Api Data :-------->', data);
      setHasGST(!!data?.gst);
    } catch (error) {
      console.log('Get Profile Error:', error);
    }
  };

  const debouncedUpdateCartQuantityApi = useCallback(
    debounce(async (product_id: number, newQty: number, cart_id: number) => {
      try {
        setUpdatingQtyId(product_id);
        if (newQty <= 0) {
          await removeCartItemApi(cart_id);
          console.log('Cart item removed');
        } else {
          const res = await updateCartQuantityApi(product_id, newQty);
          console.log('Update API response:', res);
        }
        fetchCart();
      } catch (error) {
        console.log('Update quantity API error:', error);
      } finally {
        setUpdatingQtyId(null);
      }
    }, 1500),
    [],
  );

  const updateQty = useCallback(
    async (
      product_id: number,
      type: 'inc' | 'dec' | 'set',
      directValue?: number | string,
    ) => {
      const item = cartItems.find(i => i.product_id === product_id);
      if (!item) return;

      let currentQty = item.qty === '' ? 0 : Number(item.qty);
      let newQty: number | string = currentQty;

      if (type === 'inc') {
        newQty = currentQty + 1;
      } else if (type === 'dec') {
        newQty = currentQty - 1;
      } else if (type === 'set' && directValue !== undefined) {
        newQty = directValue;
      }

      // Allow empty string for TextInput logic
      if (newQty === '') {
        setCartItems(prev =>
          prev.map(i => (i.product_id === product_id ? { ...i, qty: '' } : i)),
        );
        return;
      }

      let numQty = Number(newQty);

      // Enforce 1-10000 range
      if (numQty < 0) return;
      if (numQty > 10000) {
        numQty = 10000;
        if (Platform.OS === 'android') {
          ToastAndroid.show('Maximum quantity is 10,000', ToastAndroid.SHORT);
        } else {
          Alert.alert('Maximum Limit', 'Maximum quantity is 10,000');
        }
      }

      try {
        // If it's transient 0 (while typing), we allow it in local state
        // but we won't trigger the API remove logic unless it's a dec or explicit set to 0?
        // Actually, let's keep it simple: 0 is allowed in UI, but API only called if > 0 or if we want to remove.

        setCartItems(prev =>
          prev.map(i =>
            i.product_id === product_id ? { ...i, qty: numQty } : i,
          ),
        );

        if (numQty > 0) {
          debouncedUpdateCartQuantityApi(product_id, numQty, item.cart_id);
        }
      } catch (error) {
        console.log('Update quantity error:', error);
      }
    },
    [cartItems, debouncedUpdateCartQuantityApi],
  );

  const removeItem = useCallback(async (cart_id: number) => {
    try {
      const res = await removeCartItemApi(cart_id);
      setCartItems(prev => prev.filter(item => item.cart_id !== cart_id));
      Alert.alert('Success', res.message);
    } catch (error) {
      console.log('Remove cart error:', error);
    }
  }, []);

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

  const formatPrice = (price: number) => {
    if (price === undefined || price === null) return '0.00';
    return Number(price).toFixed(2);
  };

  const formatPriceClean = (price: number) => {
    if (price === undefined || price === null) return '0';

    const num = Number(price);

    if (num % 1 === 0) {
      return num.toString();
    }

    return num.toFixed(2);
  };

  const displayDownloadNotification = async (
    filePath: string,
    fileName: string,
    fileType: string,
  ) => {
    try {
      await notifee.requestPermission();
      const channelId = await notifee.createChannel({
        id: 'downloads',
        name: 'Downloads',
      });

      await notifee.displayNotification({
        title: `${fileType} Download Successfully`,
        body: `${fileName}`,
        data: { filePath },
        android: {
          channelId,
          smallIcon: 'ic_launcher',
          largeIcon: logo,
          pressAction: {
            id: 'default',
          },
        },
      });
    } catch (error) {
      console.log('Error displaying notification:', error);
    }
  };

  const saveToDownloads = async (
    base64Data: string,
    fileName: string,
    fileType: string,
  ) => {
    let notificationId;

    try {
      await notifee.requestPermission();

      const channelId = await notifee.createChannel({
        id: 'downloads',
        name: 'Downloads',
      });

      notificationId = await notifee.displayNotification({
        title: `Downloading ${fileType}...`,
        body: fileName,
        android: {
          channelId,
          progress: {
            max: 100,
            current: 0,
            indeterminate: true,
          },
          ongoing: true,
        },
      });

      let finalPath = '';

      if (Platform.OS === 'android') {
        if (Number(Platform.Version) < 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert('Permission Required');
            return false;
          }
        }

        const downloadPath = RNFS.DownloadDirectoryPath + '/' + fileName;

        for (let i = 10; i <= 90; i += 20) {
          await new Promise((res: any) => setTimeout(res, 100));
          await notifee.displayNotification({
            id: notificationId,
            title: `Downloading ${fileType}...`,
            body: fileName,
            android: {
              channelId,
              progress: {
                max: 100,
                current: i,
              },
              ongoing: true,
            },
          });
        }

        await RNFS.writeFile(downloadPath, base64Data, 'base64');
        await RNFS.scanFile(downloadPath);

        finalPath = downloadPath;
      } else {
        const iosPath = RNFS.DocumentDirectoryPath + '/' + fileName;
        await RNFS.writeFile(iosPath, base64Data, 'base64');
        finalPath = iosPath;
      }

      await notifee.displayNotification({
        id: notificationId,
        title: `${fileType} Download Successfully`,
        body: `${fileName}`,
        data: { filePath: finalPath },
        android: {
          channelId,
          pressAction: {
            id: 'default',
          },
          progress: undefined,
          ongoing: false,
          autoCancel: true,
        },
      });

      return true;
    } catch (e) {
      console.log('Download error:', e);
      Alert.alert('Error', 'Download failed');
      return false;
    }
  };

  const generatePDF = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'No items to export');
      return;
    }
    try {
      setExportingPDF(true);
      let htmlContent = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 20px; }
              h1 { text-align: center; color: #487D44; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th { text-align: left; padding: 10px; border-bottom: 2px solid #ccc; font-size: 14px; }
              td { padding: 10px; border-bottom: 1px solid #eee; font-size: 14px; word-wrap: break-word; }
              .section-title { font-size: 18px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; }
              .summary-row { display: flex; flex-direction: row; justify-content: space-between; margin-bottom: 5px; }
              .summary-text { font-size: 12px; font-weight: bold; }
              .summary-value { font-size: 12px; }
            </style>
          </head>
          <body>
            <h1>Order Summary</h1>
            <table>
              <thead>
                <tr>
                  <th style="width: 60%;">Product</th>
                  <th style="width: 15%; text-align: center;">Qty</th>
                  <th style="width: 25%; text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
      `;

      cartItems.forEach((item: any) => {
        htmlContent += `
    <tr>
      <td>
        <div style="display: flex; align-items: center;">
          <img 
            src="${item.image || 'https://via.placeholder.com/50'}" 
            style="width:40px; height:40px; object-fit:contain; margin-right:8px;"
          />
          <span>${item.name}</span>
        </div>
      </td>
      <td style="text-align: center;">${item.qty || 0}</td>
      <td style="text-align: right;">₹${formatPriceClean(
        getCalculatedPrice(item),
      )}</td>
    </tr>
  `;
      });

      htmlContent += `
              </tbody>
            </table>
            
            <div class="section-title">Order Summary</div>
            
            <div class="summary-row" style="margin-top: 10px;">
              <div class="summary-text">Taxable Value</div>
              <div class="summary-value">₹${orderSummary?.taxable || 0}</div>
            </div>
               <div class="summary-row" style="margin-top: 10px;">
              <div class="summary-text">GST</div>
              <div class="summary-value">₹${orderSummary?.gst || 0}</div>
            </div>
      `;

      if (orderSummary?.gstBifurcation) {
        orderSummary.gstBifurcation.forEach((gst: any) => {
          htmlContent += `
            <div class="summary-row">
              <div class="summary-text">GST (${gst.percentage}%)</div>
              <div class="summary-value">₹${formatPrice(gst.price)}</div>
            </div>
          `;
        });
      }

      htmlContent += `
            <div class="summary-row" style="margin-top: 10px; border-top: 1px solid #000; padding-top: 10px;">
              <div class="summary-text" style="font-size: 14px;">Total</div>
              <div class="summary-text" style="font-size: 14px;">₹${formatPrice(
                orderSummary?.totalAmount,
              )}</div>
            </div>
          </body>
        </html>
      `;

      let options = {
        html: htmlContent,
        fileName: 'OrderSummary_' + Date.now(),
        base64: true,
      };

      let file = await convertToPDF(options);

      if (!file || !file.base64) {
        throw new Error('PDF generation returned null or empty');
      }

      const fileName = 'OrderSummary_' + Date.now() + '.pdf';

      await saveToDownloads(file.base64, fileName, 'PDF');

      const path = RNFS.CachesDirectoryPath + '/' + fileName;
      await RNFS.writeFile(path, file.base64, 'base64');

      let filePath = path;
      if (!filePath.startsWith('file://')) {
        filePath = 'file://' + filePath;
      }
    } catch (error: any) {
      console.log('PDF Generation Error:', error);
      Alert.alert('Error', error?.message || 'Failed to generate PDF');
    } finally {
      setExportingPDF(false);
    }
  };

  const generateExcel = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'No items to export');
      return;
    }

    try {
      setExportingExcel(true);

      // 1. Prepare Data
      const data: any[] = cartItems.map(item => ({
        'Product Name': item.name,
        Quantity: item.qty || 0,
        'Price per Unit (₹)': formatPriceClean(getCalculatedPrice(item)),
        'Total (₹)': (
          Number(formatPriceClean(getCalculatedPrice(item))) *
          Number(item.qty || 0)
        ).toFixed(2),
      }));

      data.push({});
      data.push({
        'Product Name': 'Taxable Value',
        Quantity: '',
        'Price per Unit (₹)': '',
        'Total (₹)': orderSummary?.taxable || '0',
      });

      if (orderSummary?.gstBifurcation) {
        orderSummary.gstBifurcation.forEach((gst: any) => {
          data.push({
            'Product Name': `GST (${gst.percentage}%)`,
            Quantity: '',
            'Price per Unit (₹)': '',
            'Total (₹)': formatPrice(gst.price),
          });
        });
      }

      data.push({
        'Product Name': 'Total Amount',
        Quantity: '',
        'Price per Unit (₹)': '',
        'Total (₹)': formatPrice(orderSummary?.totalAmount),
      });

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Order Summary');

      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const fileName = 'OrderSummary_' + Date.now() + '.xlsx';

      const path = RNFS.CachesDirectoryPath + '/' + fileName;
      await RNFS.writeFile(path, wbout, 'base64');
      await saveToDownloads(wbout, fileName, 'Excel');

      let filePath = path;
      if (!filePath.startsWith('file://')) {
        filePath = 'file://' + filePath;
      }
    } catch (error: any) {
      console.log('Excel Generation Error:', error);
      Alert.alert('Error', error?.message || 'Failed to generate Excel file');
    } finally {
      setExportingExcel(false);
    }
  };

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

  const getActiveTier = (item: any) => {
    if (!item.price_tiers || item.price_tiers.length === 0) return null;

    const sortedTiers = [...item.price_tiers].sort((a, b) => b.qty - a.qty);

    const currentQty = Number(item?.qty || 0);

    for (const tier of sortedTiers) {
      if (currentQty >= tier.qty) {
        return tier;
      }
    }

    return null;
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      {/* HEADER */}
      <Header
        title={`Cart (${cartItems.length})`}
        showBack={false}
        containerStyle={{ paddingHorizontal: 8 }}
        rightComponent={
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              style={[styles.headerBtn, exportingExcel && { opacity: 0.7 }]}
              onPress={() => {
                console.log('Export Excel button pressed');
                generateExcel();
              }}
              disabled={exportingExcel}
            >
              {exportingExcel ? (
                <ActivityIndicator
                  size="small"
                  color="#fff"
                  style={{ marginRight: 5 }}
                />
              ) : (
                <Text style={styles.headerBtnText}>Export Excel</Text>
              )}
              {!exportingExcel && (
                <Image
                  source={require('../assets/Common/excel.png')}
                  style={{
                    height: 12,
                    width: 12,
                    tintColor: '#fff',
                    marginLeft: 5,
                  }}
                  resizeMode="contain"
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.headerBtn, exportingPDF && { opacity: 0.7 }]}
              onPress={generatePDF}
              disabled={exportingPDF}
            >
              {exportingPDF ? (
                <ActivityIndicator
                  size="small"
                  color="#fff"
                  style={{ marginRight: 5 }}
                />
              ) : (
                <Text style={styles.headerBtnText}>Save PDF</Text>
              )}
              {!exportingPDF && (
                <Image
                  source={require('../assets/Common/SavePdf.png')}
                  style={{
                    height: 12,
                    width: 12,
                    tintColor: '#fff',
                    marginLeft: 5,
                  }}
                  resizeMode="contain"
                />
              )}
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
              colors={['#487D44']}
            />
          }
        >
          {loading ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
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
                keyExtractor={item => item.cart_id.toString()}
                renderItem={({ item }) => (
                  <CartItem
                    item={item}
                    removeItem={removeItem}
                    updateQty={updateQty}
                    formatPrice={formatPrice}
                    formatPriceClean={formatPriceClean}
                    getCalculatedPrice={getCalculatedPrice}
                    getActiveTier={getActiveTier}
                    updatingQtyId={updatingQtyId}
                  />
                )}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingVertical: 40,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'DMSans-Medium',
                        fontSize: 16,
                        color: '#666',
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
                <Text style={{ fontSize: 12, fontFamily: 'DMSans-Regular' }}>
                  ₹{orderSummary?.taxable}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>GST</Text>
                <Text style={{ fontSize: 12, fontFamily: 'DMSans-Regular' }}>
                  ₹{formatPrice(orderSummary.gst)}
                </Text>
              </View>

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
                      'Complete Profile',
                      'Please complete your account setup (GST required) before purchasing.',
                      [
                        {
                          text: 'Go to Setup',
                          onPress: () =>
                            navigation.navigate('Profile', {
                              screen: 'CompanyProfile',
                            }),
                        },
                        { text: 'Cancel', style: 'cancel' },
                      ],
                    );
                  } else {
                    navigation.navigate('CheckoutScreen');
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
    backgroundColor: '#F3F4F6',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerBtn: {
    backgroundColor: '#487D44',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerBtnText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'DMSans-Medium',
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },

  productTitle: {
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
  },

  line: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 8,
  },

  priceRow: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },

  price: {
    fontSize: 14,
    fontFamily: 'DMSans-SemiBold',
    color: '#000',
  },

  oldPrice: {
    textDecorationLine: 'line-through',
    color: '#FF7878',
    fontSize: 12,
  },

  bestRate: {
    fontSize: 10,
    color: '#487D44',
    marginTop: 2,
    fontFamily: 'DMSans-Regular',
  },

  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F3E8',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: Platform.OS === 'ios' ? 3 : 0,
  },

  qtyBtn: {
    width: 20,
    height: 20,
    borderRadius: 12,
    backgroundColor: '#487D44',
    alignItems: 'center',
    justifyContent: 'center',
  },

  qtyText: {
    marginHorizontal: 8,
    fontFamily: 'DMSans-Medium',
    color: '#487D44',
    fontSize: 14,
    minWidth: 30,
    textAlign: 'center',
  },

  sectionTitle: {
    fontSize: 18,
    fontFamily: 'DMSans-Medium',
    marginTop: 20,
    marginBottom: 10,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 9,
  },

  summaryText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
  },

  checkoutBtn: {
    backgroundColor: '#487D44',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },

  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'DMSans-Medium',
  },

  variantBox: {
    backgroundColor: '#F4F4F4',
    borderColor: '#E6E7EE',
    borderRadius: 8,
    padding: 8,
  },

  variantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  slabPrice: {
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    color: '#000000',
  },

  addSmall: {
    fontSize: 12,
    color: '#487D44',
    fontWeight: '600',
    fontFamily: 'DMSans-Medium',
  },

  dividerPrice: {
    height: 1,
    backgroundColor: '#E6E7EE',
    marginVertical: 8,
  },
  qtyicon: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
  },
});
