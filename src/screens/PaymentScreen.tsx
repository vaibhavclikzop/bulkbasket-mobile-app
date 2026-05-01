import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCartApi, getWalletLedgerApi, saveOrderApi } from '../services/api';
import Styles from '../components/Styles';

const PaymentScreen = ({ navigation, route }: any) => {
  const {
    delivery_date,
    delivery_instruction,
    address_id,
    state,
    district,
    city,
    pincode,
  } = route?.params || {};

  console.log('PaymentScreen params:', {
    delivery_date,
    delivery_instruction,
    address_id,
    state,
    district,
    city,
    pincode,
  });

  const [selected, setSelected] = useState('wallet');
  const [orderSummary, setOrderSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [holdAmount, setHoldAmount] = useState('');
  // Promo State
  const [promoExpanded, setPromoExpanded] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('success');
  const [successOrderData, setSuccessOrderData] = useState<any>(null);

  const formatPrice = (price: number) => {
    if (price === undefined || price === null) return '0';
    const num = Number(price);
    return num % 1 === 0 ? String(num) : num.toFixed(2);
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await getCartApi();
      setOrderSummary(data?.orderSummary || {});
      console.log('Order Summary:123', data.orderSummary);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getWalletData = async () => {
    try {
      setLoading(true);
      const res = await getWalletLedgerApi();
      console.log('Wallet Data:', res);
      const holdAmountValue = Number(res?.company?.hold_amount) || 0;

      const walletAmount = Number(res?.company?.wallet) || 0;
      const usedWallet = Number(res?.company?.used_wallet) || 0;
      // setHoldAmount(res?.company?.hold_amount);
      // setAmount(String(Number(walletAmount) - Number(usedWallet)));
      setAmount(
        String(
          Number(walletAmount) -
            Number(usedWallet) -
            Number(res?.company?.hold_amount),
        ),
      );
      setHoldAmount(String(Number(res?.company?.hold_amount)));
      // setHistory(res?.data || []);
    } catch (error) {
      console.log('Wallet Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    getWalletData();
  }, []);

  const handleOrder = async () => {
    try {
      const payload = {
        delivery_date,
        address: address_id,
        state,
        district,
        city,
        pincode,
        pay_mode: selected === 'upi' ? 'online' : 'wallet',
        remarks: delivery_instruction,
      };
      // console.log('🚀 ~ handleOrder ~ payload:', payload);
      const res = await saveOrderApi(payload);
      console.log('Order Success:', res);

      setSuccessOrderData(res);
      setModalTitle('Success');
      setModalMessage('Order placed successfully');
      setModalType('success');
      setModalVisible(true);
    } catch (error: any) {
      console.log('Order Failed:', error);

      setModalTitle('Error');
      setModalMessage(error.message || 'Something went wrong');
      setModalType('error');
      setModalVisible(true);
    }
  };

  const PaymentOption = ({ id, title, subtitle, icon, disabled }: any) => (
    <TouchableOpacity
      style={[
        styles.paymentCard,
        selected === id && styles.activeCard,
        disabled && styles.disabledCard,
      ]}
      onPress={() => {
        if (!disabled) {
          setSelected(id);
        }
      }}
      activeOpacity={disabled ? 1 : 0.7}
    >
      <View
        style={[
          styles.iconBox,
          selected === id && styles.iconBoxActive,
          disabled && styles.disabledIconBox,
        ]}
      >
        <Image
          source={icon}
          style={[
            styles.icon,
            selected === id && styles.iconActive,
            disabled && styles.disabledIcon,
          ]}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.paymentTitle, disabled && styles.disabledText]}>
          {title}
        </Text>
        <Text style={[styles.paymentSub, disabled && styles.disabledText]}>
          {subtitle}
        </Text>
      </View>

      <View
        style={[styles.radioOuter, selected === id && styles.radioOuterActive]}
      >
        {selected === id && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        {loading && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="#487D44" />
          </View>
        )}
        <TouchableOpacity
          style={{ marginHorizontal: 16 }}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={require('../assets/Common/Back.png')}
            style={[Styles.headerImage, { marginTop: 2 }]}
          />
        </TouchableOpacity>

        <Text style={styles.title}>Payment Method</Text>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 50 }}
          style={styles.scrollview}
          keyboardShouldPersistTaps="handled"
        >
          {/* Total Amount */}
          <View style={styles.amountCard}>
            <Text style={styles.totalLabel}>Total Payable Amount</Text>
            <Text style={styles.amount}>
              ₹{formatPrice(orderSummary?.totalAmount) || 0}
            </Text>

            {/* <View style={styles.challan}>
              <Text style={styles.challanText}>CHALLAN ID : #B2B-889653</Text>
            </View> */}
          </View>

          {/* Order Summary */}

          <Text style={styles.section}>Order summary</Text>

          <View style={[styles.summaryRow, { marginTop: 10 }]}>
            <Text style={styles.summaryText}>Taxable Value</Text>
            <Text style={{ fontSize: 13, fontFamily: 'DMSans-Regular' }}>
              ₹{orderSummary?.taxable}
            </Text>
          </View>

          {orderSummary?.gstBifurcation?.map((gst: any, index: number) => (
            <View key={index} style={styles.summaryRow}>
              <Text style={styles.summaryText}>GST ({gst.percentage}%)</Text>
              <Text style={{ fontSize: 13, fontFamily: 'DMSans-Regular' }}>
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

          <View style={styles.promoContainer}>
            <TouchableOpacity
              style={styles.promoBox}
              activeOpacity={0.7}
              onPress={() => setPromoExpanded(!promoExpanded)}
            >
              <Image
                source={require('../assets/Common/Discount.png')}
                style={{ height: 18, width: 18 }}
              />
              <Text style={styles.promoText}>
                Apply promos before you order
              </Text>
              <Image
                source={
                  promoExpanded
                    ? require('../assets/Common/ArrowUp.png')
                    : require('../assets/Common/ArrowRight.png')
                }
                style={{ height: 10, width: 10, tintColor: 'gray' }}
                resizeMode="contain"
              />
            </TouchableOpacity>

            {promoExpanded && (
              <View style={styles.promoInputRow}>
                <TextInput
                  placeholder="Enter Promo Code"
                  style={styles.promoInput}
                  value={promoCode}
                  onChangeText={setPromoCode}
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  style={styles.applyBtn}
                  onPress={() => {
                    if (!promoCode) {
                      setModalTitle('Error');
                      setModalMessage('Please enter a promo code');
                      setModalType('error');
                      setModalVisible(true);
                      return;
                    }
                    setModalTitle('Promo applied');
                    setModalMessage(`Code ${promoCode} applied!`);
                    setModalType('success');
                    setModalVisible(true);
                  }}
                >
                  <Text style={styles.applyText}>Apply</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Recommended */}
          <Text style={styles.section}>Recommended for Business</Text>

          <PaymentOption
            id="wallet"
            title="Pay Later / Credit Line"
            subtitle={`Available limit: ₹${formatPrice(Number(amount))}`}
            icon={require('../assets/icons/wallet.png')}
          />

          {/* Other Methods */}

          <Text style={styles.section}>Other Payment Methods</Text>

          <PaymentOption
            id="upi"
            title="Online Payment"
            subtitle="GPay, PhonePe, Paytm & Others"
            icon={require('../assets/icons/upi.png')}
          />
          {/* <PaymentOption
            id="card"
            title="Business Cards"
            subtitle="Visa, Mastercard, Amex"
            icon={require("../assets/icons/card.png")}
          /> */}
        </ScrollView>

        {/* Sticky Bottom Bar */}
        <View style={styles.bottomBox}>
          <View style={styles.amountRow}>
            <Text style={styles.amountDue}>Amount Due</Text>
            <Text style={styles.amountValue}>
              ₹{formatPrice(orderSummary?.totalAmount)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.payBtn}
            onPress={() => {
              console.log('BUTTON PRESSED');
              handleOrder();
            }}
          >
            <Text style={styles.payText}>Pay Securely</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Button */}
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>

            <View style={styles.modalFooter}>
              {modalType === 'inactive' ? (
                <>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelBtn]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.setupBtn]}
                    onPress={() => {
                      setModalVisible(false);
                      navigation.navigate('Profile', {
                        screen: 'CompanyProfile',
                      });
                    }}
                  >
                    <Text style={styles.setupBtnText}>Go to Setup</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    {
                      backgroundColor:
                        modalType === 'success' ? '#487D44' : '#EF4444',
                      width: '100%',
                    },
                  ]}
                  onPress={() => {
                    setModalVisible(false);

                    if (modalType === 'success' && successOrderData) {
                      navigation.navigate('OrderConfirmScreen', {
                        orderData: successOrderData,
                      });
                      setTimeout(() => setSuccessOrderData(null), 500);
                    }
                  }}
                >
                  <Text style={styles.modalButtonText}>
                    {modalType === 'success' ? 'Great!' : 'Close'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
    // ,
  },
  scrollview: {
    padding: 16,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },
  title: {
    fontSize: 18,
    marginTop: 10,
    fontFamily: 'DMSans-Medium',
    marginBottom: 13,
    marginHorizontal: 16,
  },

  amountCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 14,
    borderColor: '#d0cfcf99',
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 20,
  },

  totalLabel: {
    color: '#777',
    fontFamily: 'DMSans-Regular',
  },

  amount: {
    fontSize: 24,
    fontFamily: 'DMSans-Bold',
    marginVertical: 6,
  },

  challan: {
    backgroundColor: '#E7F3E7',
    paddingHorizontal: 12,
    borderColor: '#57E24D1F',
    borderWidth: 1,
    paddingVertical: 4,
    borderRadius: 20,
  },

  summaryText: {
    fontSize: 13,
    fontFamily: 'DMSans-Regular',
    // letterSpacing: 0.4,
  },

  challanText: {
    color: '#487D44',
    fontSize: 9,
    fontFamily: 'DMSans-SemiBold',
  },

  section: {
    fontSize: 18,
    fontFamily: 'DMSans-SemiBold',
    marginBottom: 10,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  promoContainer: {
    marginVertical: 15,
  },

  promoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7F3E7',
    padding: 14,
    borderRadius: 10,
  },
  promoInputRow: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },
  promoInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
  },
  applyBtn: {
    backgroundColor: '#487D44',
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyText: {
    color: '#fff',
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    zIndex: 999,
  },

  promoText: {
    flex: 1,
    marginLeft: 10,
    color: '#64748B',
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
  },

  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 14,
    marginBottom: 12,
  },

  activeCard: {
    borderWidth: 2,
    borderColor: '#487D44',
  },

  iconBox: {
    width: 40,
    height: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginRight: 10,
  },

  icon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },

  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'DMSans-SemiBold',
  },

  paymentSub: {
    fontSize: 12,
    color: '#777',
    fontFamily: 'DMSans-Regular',
  },

  bottomBox: {
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderColor: '#E5E7EB',
    paddingVertical: 10,
  },

  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  amountDue: {
    color: '#777',
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
  },

  amountValue: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
  },

  payBtn: {
    backgroundColor: '#487D44',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  payText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'DMSans-Medium',
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },

  radioOuterActive: {
    borderColor: '#487D44',
  },

  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#487D44',
  },

  iconBoxActive: {
    backgroundColor: '#487D44',
  },

  iconActive: {
    tintColor: '#fff',
  },

  disabledCard: {
    opacity: 0.5,
  },

  disabledText: {
    color: '#A1A1AA',
  },

  disabledIconBox: {
    backgroundColor: '#E5E7EB',
  },

  disabledIcon: {
    tintColor: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'DMSans-Bold',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    color: '#64748B',
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
  },
  setupBtn: {
    flex: 1,
    backgroundColor: '#487D44',
  },
  setupBtnText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
  },
});
