import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Styles from '../components/Styles';
import { addWalletAmountApi } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddMoney = ({ navigation }: any) => {
  const [amount, setAmount] = useState('20000');
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error' | 'inactive'>(
    'success',
  );
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const quickAmounts = [10000, 20000, 50000];

  const showModal = (
    type: 'success' | 'error' | 'inactive',
    title: string,
    message: string,
  ) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleAddMoney = async () => {
    const numericAmount = Number(amount);

    if (!amount || numericAmount <= 1) {
      showModal('error', 'Error', 'Amount must be greater than 1');
      return;
    }
    try {
      const userId = await AsyncStorage.getItem('userId');
      console.log('🚀 ~ handleAddMoney ~ userId:', userId);

      if (!userId) {
        showModal('error', 'Error', 'User not found');
        return;
      }

      if (!amount) {
        showModal('error', 'Error', 'Please enter amount');
        return;
      }

      setLoading(true);
      const res = await addWalletAmountApi(userId, Number(amount));
      console.log('Wallet updated:', res);

      if (res?.status === false || res?.error) {
        if (res?.message === 'Your account currently not active') {
          showModal(
            'inactive',
            'Complete Profile',
            'Please complete your account setup (GST required) before adding money.',
          );
        } else {
          showModal('error', 'Error', res?.message || 'Failed to add money');
        }
        return;
      }

      showModal(
        'success',
        'Success',
        res?.message || 'Money added successfully',
      );
    } catch (error: any) {
      console.log('Error:', error);
      if (error?.message === 'Your account currently not active') {
        showModal(
          'inactive',
          'Complete Profile',
          'Please complete your account setup (GST required) before adding money.',
        );
      } else {
        showModal('error', 'Error', error?.message || 'Failed to add money');
      }
    } finally {
      setLoading(false);
    }
  };

  const PaymentMethod = ({ id, image, title, desc }: any) => {
    const active = selectedMethod === id;

    return (
      <TouchableOpacity
        style={[styles.methodCard, active && styles.activeCard]}
        onPress={() => setSelectedMethod(id)}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={[styles.iconBox, active && styles.iconActive]}>
            <Image
              source={image}
              style={{
                height: 20,
                width: 20,
                resizeMode: 'contain',
                tintColor: active ? '#fff' : '#000',
              }}
            />
          </View>

          <View style={{ marginLeft: 10 }}>
            <Text style={styles.methodTitle}>{title}</Text>
            <Text style={styles.methodDesc}>{desc}</Text>
          </View>
        </View>

        <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
          {active && <View style={styles.radioInner} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[Styles.header, { padding: 16, backgroundColor: '#FFF' }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../assets/Common/Back.png')}
              style={Styles.headerImage}
            />
          </TouchableOpacity>

          <Text style={Styles.headerText}>Add Money</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Amount Card */}
          <View style={styles.amountCard}>
            <Text style={styles.label}>Add Money</Text>

            <TextInput
              value={`₹ ${amount}`}
              keyboardType="numeric"
              onChangeText={text => setAmount(text.replace(/[^0-9.]/g, ''))}
              style={styles.amountInput}
            />

            {/* Quick Amount */}
            <View style={styles.quickRow}>
              {quickAmounts.map(value => {
                const active = Number(amount) === value;

                return (
                  <TouchableOpacity
                    key={value}
                    style={[styles.quickBtn, active && styles.quickBtnActive]}
                    onPress={() => setAmount(String(value))}
                  >
                    <Text
                      style={[
                        styles.quickText,
                        active && {
                          color: '#fff',
                          fontFamily: 'DMSans-Medium',
                        },
                      ]}
                    >
                      + ₹{value.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          {/* Pay Using */}
          <Text style={styles.sectionTitle}>Pay Using</Text>
          <PaymentMethod
            id="upi"
            title="UPI"
            desc="GPay, PhonePe, Paytm & Others"
            image={require('../assets/AddWithdrawMony/upi.png')}
          />
          <PaymentMethod
            id="card"
            title="Business Cards"
            desc="Visa, Mastercard, Amex"
            image={require('../assets/AddWithdrawMony/card.png')}
          />
          <PaymentMethod
            id="netbanking"
            title="Net Banking"
            desc="All Major Indian Banks"
            image={require('../assets/AddWithdrawMony/bank.png')}
          />
        </ScrollView>

        {/* Pay Now */}
        <TouchableOpacity
          onPress={() => handleAddMoney()}
          style={[styles.payBtn, loading && { opacity: 0.7 }]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payText}>Pay Now</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Status Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor:
                    modalType === 'success' ? '#E6F4EA' : '#FCE8E6',
                },
              ]}
            >
              <Image
                source={
                  modalType === 'success'
                    ? require('../assets/icons/righticon.png')
                    : require('../assets/Common/info.png')
                }
                style={[
                  styles.modalIcon,
                  {
                    tintColor: modalType === 'success' ? '' : '#EF4444',
                  },
                ]}
              />
            </View> */}

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

                    if (modalType === 'success') {
                      navigation.goBack();
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

export default AddMoney;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },

  container: {
    flex: 1,
  },

  amountCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 14,
  },

  label: {
    fontSize: 14,
    marginBottom: 10,
    fontFamily: 'DMSans-Regular',
  },

  amountInput: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontFamily: 'DMSans-Medium',
  },

  quickRow: {
    flexDirection: 'row',
    marginTop: 12,
  },

  quickBtn: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
  },

  quickBtnActive: {
    backgroundColor: '#487D44',
    borderColor: '#487D44',
  },

  quickText: {
    fontSize: 12,
    fontFamily: 'DMSans-Medium',
  },

  sectionTitle: {
    fontSize: 18,
    marginHorizontal: 16,
    marginBottom: 10,
    fontFamily: 'DMSans-Medium',
  },

  methodCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  activeCard: {
    borderColor: '#487D44',
    backgroundColor: '#F6FBF6',
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconActive: {
    backgroundColor: '#487D44',
  },

  methodTitle: {
    fontSize: 16,
    fontFamily: 'DMSans-Medium',
  },

  methodDesc: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'DMSans-Regular',
  },

  payBtn: {
    backgroundColor: '#487D44',
    margin: 16,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },

  payText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'DMSans-Medium',
  },
  cardItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 10,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'DMSans-Bold',
    color: '#1F2937',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    fontFamily: 'DMSans-Regular',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalFooter: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'DMSans-Medium',
  },
  setupBtn: {
    backgroundColor: '#487D44',
  },
  setupBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
  },
  cancelBtn: {
    backgroundColor: '#F3F4F6',
  },
  cancelBtnText: {
    color: '#4B5563',
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
  },
});
