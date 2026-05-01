import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import { Alert } from '../utils/CustomAlert';
import { SafeAreaView } from 'react-native-safe-area-context';
import { generatePDF as convertToPDF } from 'react-native-html-to-pdf';
import * as XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import notifee from '@notifee/react-native';
import { getEstimateDetailsApi } from '../services/api';

export default function OrderConfirmScreen({ navigation, route }: any) {
  const { orderData } = route.params;
  console.log('Received Order Data: in OrderConfirmScreen', orderData);
  const [data, setData] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const getDetails = async () => {
    try {
      setLoading(true);

      const res = await getEstimateDetailsApi(orderData.order_id);
      console.log('🚀 downlao data pdf and execl after orderconferm', res);
      const details: any = res?.data?.[0];

      if (details) {
        setData(details);
        setItems(details.items || []);
      }
    } catch (err) {
      console.log('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderData.order_id) getDetails();
  }, [orderData.order_id]);

  const [showDownload, setShowDownload] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

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
          color: '#487D44',
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
              color: '#487D44',
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
          color: '#487D44',
          pressAction: {
            id: 'default',
          },
          progress: undefined,
          ongoing: false,
          autoCancel: true,
        },
      });

      Alert.alert('Success', `${fileType} downloaded successfully!`);

      return true;
    } catch (e) {
      console.log('Download error:', e);
      Alert.alert('Error', 'Download failed');
      return false;
    }
  };

  // const generatePDF = async () => {
  //   try {
  //     setExportingPDF(true);
  //     let htmlContent = `
  //       <html>
  //         <head>
  //           <style>
  //             body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 20px; }
  //             h1 { text-align: center; color: #487D44; }
  //             .card { border: 1px solid #D2D6DB; border-radius: 12px; padding: 18px; margin-top: 25px; }
  //             .row { display: flex; flex-direction: row; justify-content: space-between; margin-bottom: 12px; }
  //             .label { color: #6B7280; font-size: 14px; font-weight: bold; }
  //             .value { color: #64748B; font-size: 14px; }
  //           </style>
  //         </head>
  //         <body>
  //           <h1>Challan Generated!</h1>
  //           <p style="text-align: center; color: #6B7280;">Your order is generated and is under review. Get set to savour your chosen delights!</p>
  //           <div class="card">
  //             <div class="row">
  //               <span class="label">Challan ID</span>
  //               <span class="value">${
  //                 orderData.my_order_id || orderData.invoice_no || ''
  //               }</span>
  //             </div>
  //             <div class="row">
  //               <span class="label">Preferred Delivery Date</span>
  //               <span class="value">${orderData.delivery_date || ''}</span>
  //             </div>
  //             <div class="row" style="margin-bottom: 0;">
  //               <span class="label">Payment Method</span>
  //               <span class="value">${
  //                 orderData.payment_method
  //                   ? orderData.payment_method.charAt(0).toUpperCase() +
  //                     orderData.payment_method.slice(1)
  //                   : ''
  //               }</span>
  //             </div>
  //           </div>
  //         </body>
  //       </html>
  //     `;

  //     let options = {
  //       html: htmlContent,
  //       fileName: 'OrderConfirmation_' + Date.now(),
  //       base64: true,
  //     };

  //     let file = await convertToPDF(options);

  //     if (!file || !file.base64) {
  //       throw new Error('PDF generation returned null or empty');
  //     }

  //     const fileName = 'OrderConfirmation_' + Date.now() + '.pdf';

  //     await saveToDownloads(file.base64, fileName, 'PDF');

  //     const path = RNFS.CachesDirectoryPath + '/' + fileName;
  //     await RNFS.writeFile(path, file.base64, 'base64');
  //     setShowDownload(false);
  //   } catch (error: any) {
  //     console.log('PDF Generation Error:', error);
  //     Alert.alert('Error', error?.message || 'Failed to generate PDF');
  //   } finally {
  //     setExportingPDF(false);
  //   }
  // };

  const generatePDF = async () => {
    try {
      setExportingPDF(true);

      let htmlContent = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
              color: #1F2937;
            }

            h1 { 
              text-align: center; 
              color: #487D44; 
              margin-bottom: 5px;
            }

            .subtitle {
              text-align: center; 
              color: #6B7280; 
              font-size: 13px;
              margin-bottom: 20px;
            }

            .card { 
              border: 1px solid #D2D6DB; 
              border-radius: 12px; 
              padding: 18px; 
              margin-top: 10px; 
            }

            .row { 
              display: flex; 
              flex-direction: row; 
              justify-content: space-between; 
              margin-bottom: 12px; 
            }

            .label { 
              color: #6B7280; 
              font-size: 13px; 
              font-weight: bold; 
            }

            .value { 
              color: #111827; 
              font-size: 13px; 
            }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #D2D6DB; padding: 10px; text-align: left; font-size: 13px; vertical-align: middle; }
            th { background-color: #F8F9FD; color: #6B7280; }
            .total-section { margin-top: 20px; text-align: right; font-size: 16px; font-weight: bold; color: #487D44; }
            .product-img { width: 50px; height: 50px; object-fit: contain; border-radius: 8px; background-color: #F4F4F4; padding: 4px; }
            .product-cell { display: flex; align-items: center; gap: 10px; }
          </style>
        </head>

        <body>
          <h1>Challan Details</h1>

          <div class="subtitle">
            Your order is generated and is under review. Get set to savour your chosen delights!
          </div>

          <div class="card">
            <div class="row">
              <span class="label">Challan ID</span>
              <span class="value">
                ${data?.order_id || orderData.my_order_id || orderData.invoice_no || ''}
              </span>
            </div>

            <div class="row">
              <span class="label">Name</span>
              <span class="value">
                ${data?.name || ''}
              </span>
            </div>

            <div class="row">
              <span class="label">Address</span>
              <span class="value">
                ${data ? `${data.city}, ${data.state} - ${data.pincode}` : ''}
              </span>
            </div>

            <div class="row">
              <span class="label">Preferred Delivery Date</span>
              <span class="value">
                ${data?.delivery_date || orderData.delivery_date || ''}
              </span>
            </div>

            <div class="row">
              <span class="label">Order Status</span>
              <span class="value">
                ${data?.order_status || ''}
              </span>
            </div>

            <div class="row" style="margin-bottom:0;">
              <span class="label">Payment Method</span>
              <span class="value">
                ${
                  orderData.payment_method
                    ? orderData.payment_method.charAt(0).toUpperCase() +
                      orderData.payment_method.slice(1)
                    : ''
                }
              </span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item: any) => `
                <tr>
                  <td>
                    <div class="product-cell">
                      ${item.image ? `<img src="${item.image}" class="product-img" />` : ''}
                      <span>${item.product_name || 'Product'}</span>
                    </div>
                  </td>
                  <td>${item.qty}</td>
                  <td>₹${item.price}</td>
                  <td>₹${item.total || (item.qty * item.price)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-section">
            Total Amount: ₹${data?.total_amount || 0}
          </div>
        </body>
      </html>
    `;

      let options = {
        html: htmlContent,
        fileName: 'OrderConfirmation_' + Date.now(),
        base64: true,
      };

      let file = await convertToPDF(options);

      if (!file || !file.base64) {
        throw new Error('PDF generation returned null or empty');
      }

      const fileName = 'OrderConfirmation_' + Date.now() + '.pdf';

      await saveToDownloads(file.base64, fileName, 'PDF');

      const path = RNFS.CachesDirectoryPath + '/' + fileName;
      await RNFS.writeFile(path, file.base64, 'base64');

      setShowDownload(false);
    } catch (error: any) {
      console.log('PDF Generation Error:', error);
      Alert.alert('Error', error?.message || 'Failed to generate PDF');
    } finally {
      setExportingPDF(false);
    }
  };

  const generateExcel = async () => {
    try {
      setExportingExcel(true);
      const excelData = items.map((item: any) => ({
        'Challan ID': data?.order_id || orderData.my_order_id || orderData.invoice_no || '',
        'Name': data?.name || '',
        'City': data?.city || '',
        'State': data?.state || '',
        'Pincode': data?.pincode || '',
        'Delivery Date': data?.delivery_date || orderData.delivery_date || '',
        'Order Status': data?.order_status || '',
        'Payment Method': orderData.payment_method
            ? orderData.payment_method.charAt(0).toUpperCase() +
              orderData.payment_method.slice(1)
            : '',
        'Product Name': item.product_name || 'Product',
        'Quantity': item.qty,
        'Price': item.price,
        'Total': item.total || (item.qty * item.price),
      }));

      if (excelData.length === 0) {
        excelData.push({
          'Challan ID': data?.order_id || orderData.my_order_id || orderData.invoice_no || '',
          'Name': data?.name || '',
          'City': data?.city || '',
          'State': data?.state || '',
          'Pincode': data?.pincode || '',
          'Delivery Date': data?.delivery_date || orderData.delivery_date || '',
          'Order Status': data?.order_status || '',
          'Payment Method': orderData.payment_method
            ? orderData.payment_method.charAt(0).toUpperCase() +
              orderData.payment_method.slice(1)
            : '',
          'Product Name': '',
          'Quantity': '',
          'Price': '',
          'Total': data?.total_amount || 0,
        });
      }

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Order Confirmation');

      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
      const fileName = 'OrderConfirmation_' + Date.now() + '.xlsx';

      const path = RNFS.CachesDirectoryPath + '/' + fileName;
      await RNFS.writeFile(path, wbout, 'base64');
      await saveToDownloads(wbout, fileName, 'Excel');
      setShowDownload(false);
    } catch (error: any) {
      console.log('Excel Generation Error:', error);
      Alert.alert('Error', error?.message || 'Failed to generate Excel file');
    } finally {
      setExportingExcel(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => navigation.goBack()}
      >
        <Image
          source={require('../assets/Common/Back.png')}
          style={{
            height: 16,
            width: 16,
            resizeMode: 'contain',
          }}
        />
        <Text style={styles.headerTitle}>Payment Success</Text>
        <View style={{ width: 22 }} />
      </TouchableOpacity>

      {/* Success Circle */}
      {/* <View style={styles.successWrapper}>
                <View style={styles.circle1}>
                    <View style={styles.circle2}>
                        <View style={styles.circle3}>
                            <View style={styles.circle4}>
                                <Feather name="check" size={30} color="#fff" />
                            </View>
                        </View>
                    </View>
                </View>
            </View> */}
      <Image
        source={require('../assets/Common/TickFill.png')}
        style={{ height: 140, width: 140, alignSelf: 'center' }}
      />

      {/* Title */}
      <Text style={styles.title}>Challan Generated!</Text>

      <Text style={styles.subtitle}>
        Your order is generated and is under review. Get set to savour your
        chosen delights!
      </Text>

      {/* Info Card */}
      <View style={styles.card}>
        <View style={[styles.row, { marginBottom: 12 }]}>
          <Text style={styles.label}>Challan ID</Text>
          <Text style={styles.value}>
            {orderData.my_order_id || orderData.invoice_no}
          </Text>
        </View>

        <View style={[styles.row, { marginBottom: 12 }]}>
          <Text style={styles.label}>Preferred Delivery Date</Text>
          <Text style={styles.value}>{orderData.delivery_date}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Payment Method</Text>
          <Text style={styles.value}>
            {orderData.payment_method?.charAt(0).toUpperCase() +
              orderData.payment_method?.slice(1)}
          </Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.topButtons}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('OrderSummery', { id: orderData.order_id })
          }
          style={styles.outlineBtn}
        >
          <Text style={styles.outlineText}>Order Summary</Text>
          <Image
            source={require('../assets/Common/ArrowRight.png')}
            style={{
              height: 10,
              width: 10,
              resizeMode: 'contain',
            }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.outlineBtn}
          onPress={() => setShowDownload(!showDownload)}
        >
          <Text style={styles.outlineText}>Download Challan</Text>
          <Image
            source={require('../assets/Common/download.png')}
            style={{
              height: 14,
              width: 14,
              resizeMode: 'contain',
            }}
          />
        </TouchableOpacity>
      </View>

      {/* Download Dropdown */}
      {showDownload && (
        <View style={styles.dropdown}>
          <TouchableOpacity
            style={[
              styles.dropdownItem,
              {
                borderBottomWidth: 1,
                borderBottomColor: '#E5E7EB',
                marginBottom: 2,
              },
            ]}
            onPress={generatePDF}
            disabled={exportingPDF}
          >
            {exportingPDF ? (
              <ActivityIndicator size="small" color="#487D44" />
            ) : (
              <Image
                source={require('../assets/Common/SavePdf.png')}
                style={{ height: 18, width: 18 }}
                resizeMode="contain"
              />
            )}
            <Text style={styles.dropdownText}>Save PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dropdownItem, {}]}
            onPress={generateExcel}
            disabled={exportingExcel}
          >
            {exportingExcel ? (
              <ActivityIndicator size="small" color="#487D44" />
            ) : (
              <Image
                source={require('../assets/Common/Export.png')}
                style={{ height: 18, width: 18 }}
              />
            )}
            <Text style={styles.dropdownText}>Export Excel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        {/* <TouchableOpacity
          onPress={() => navigation.navigate('TrackOrder')}
          style={styles.trackBtn}
        >
          <Text numberOfLines={1} style={styles.trackText}>
            Track Order
          </Text>
        </TouchableOpacity> */}

        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={styles.shopBtn}
        >
          <Text numberOfLines={1} style={styles.shopText}>
            Continue Shopping
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FD',
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // marginTop: 20,
    marginBottom: 20,
  },

  headerTitle: {
    fontSize: 18,
    fontFamily: 'DMSans-Medium',
  },

  title: {
    fontSize: 22,
    fontFamily: 'DMSans-SemiBold',
    textAlign: 'center',
    marginTop: 10,
  },

  subtitle: {
    textAlign: 'center',
    color: '#6B7280',
    fontFamily: 'DMSans-Regular',
    marginTop: 8,
    lineHeight: 20,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginTop: 25,
    borderWidth: 1,
    borderColor: '#D2D6DB',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  label: {
    color: '#6B7280',
    fontFamily: 'DMSans-Medium',
    fontSize: 13,
  },

  value: {
    color: '#64748B',
    fontSize: 12,
    fontFamily: 'DMSans-Medium',
  },

  topButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },

  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,

    borderRadius: 10,
    width: '48%',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },

  outlineText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
  },

  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: '50%',
    alignSelf: 'flex-end',
  },

  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    gap: 9,
  },

  dropdownText: {
    marginLeft: 10,
    fontFamily: 'DMSans-Light',
    fontSize: 13,
  },

  bottomButtons: {
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    marginTop: 30,
    alignItems: 'center',
  },

  trackBtn: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    height: 48,
  },

  trackText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
  },

  shopBtn: {
    width: '48%',
    backgroundColor: '#2E7D32',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  shopText: {
    color: '#fff',
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
  },
});
