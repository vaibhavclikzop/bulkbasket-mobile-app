import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Styles from '../components/Styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL, getCompanyProfileApi } from '../services/api';

const CompanyProfile = ({ navigation }: any) => {
  const [brandName, setBrandName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [gstin, setGstin] = useState('');
  // const [fssai, setFssai] = useState("");
  // const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [gstVerified, setGstVerified] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const getCompanyProfile = async () => {
    try {
      setInitialLoading(true);

      const response = await getCompanyProfileApi();

      const data = response?.data;
      console.log('Get Company Api Data :-------->', data);

      if (data?.gst && data.gst.length === 15) {
        setGstVerified(true);
      } else {
        setGstVerified(false);
      }

      setBrandName(data?.company_name || '');
      setLegalName(data?.company_name || '');
      setGstin(data?.gst || '');
      // setFssai(data?.fssai || "");
      setAddress(data?.company_address);
    } catch (error) {
      console.log('Get Profile Error:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    getCompanyProfile();
  }, []);

  if (initialLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#487D44" />
      </View>
    );
  }

  const handleVerifyGst = async () => {
    // if (!brandName) {
    //   Alert.alert("Error", "Please fill all required fields");
    //   return;
    // }
    if (!gstin) {
      Alert.alert('Error', 'Please enter GST number');
      return;
    }

    const cleanGstin = gstin.trim();

    if (cleanGstin.length !== 15) {
      Alert.alert(
        'Invalid GST',
        `GST number must be 15 characters. You have entered ${cleanGstin.length} characters.`,
      );
      return;
    }

    // if (gstin && gstin.length !== 15) {
    //   Alert.alert("Invalid GST", "GST number must be 15 characters");
    //   return;
    // }

    console.log('asdjsdkjasdklj', gstin);

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('userToken');

      const response = await axios.post(
        `${BASE_URL}/check-gst`,
        {
          gst_no: gstin,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );

      const gstLegalName = response.data?.data?.data?.lgnm;
      const addr = response.data?.data?.data?.pradr?.addr;

      const fullAddress = `${addr?.bno || ''}, ${addr?.flno || ''}, ${
        addr?.st || ''
      }, ${addr?.loc || ''}, ${addr?.dst || ''}, ${addr?.stcd || ''} - ${
        addr?.pncd || ''
      }`;

      console.log('Full Address:', fullAddress);

      setAddress(fullAddress);

      if (gstLegalName) {
        setLegalName(gstLegalName);
        setBrandName(gstLegalName);
        setGstVerified(true);
      }
      console.log('GST API Response:', response.data);
      // console.log("GST API Response Data:", response.data.data.data.lgnm);
    } catch (error: any) {
      console.log('GST API Error:', error.response?.data || error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!gstVerified) {
      Alert.alert('GST Required', 'Please verify GST number first');
      return;
    }

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem('userToken');
      // console.log("token", token);
      const formData = new FormData();
      if (brandName) formData.append('name', brandName);
      if (legalName) formData.append('brand_name', legalName);
      if (gstin) formData.append('gst', gstin);
      if (address) formData.append('address', address);

      const response = await axios.post(
        `${BASE_URL}/update-company`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      console.log('Update Profile Response:', response.data);
      getCompanyProfile();
      if (response.data.error === false) {
        console.log('Profile Updated', response.data);
      } else {
        console.log('Profile Update Failed', response.data);
      }
    } catch (error) {
      console.log('Update Profile Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        {/* Header */}
        <View
          style={[
            Styles.header,
            {
              backgroundColor: '#fff',
              padding: 16,
            },
          ]}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../assets/Common/Back.png')}
              style={Styles.headerImage}
            />
          </TouchableOpacity>

          <Text style={Styles.headerText}>Company Profile</Text>
        </View>

        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.menuText}>
              {legalName ? legalName : 'Enter the GST number for verification'}
            </Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Brand Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Restaurant & Cafe"
                placeholderTextColor="#64748B"
                value={brandName}
                onChangeText={setBrandName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Legal Business Name</Text>
              <TextInput
                style={styles.input}
                placeholder="The Gourmet Bistro"
                placeholderTextColor="#fff"
                value={legalName}
                onChangeText={setLegalName}
                editable={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>GSTIN (if applicable)</Text>

              <View style={styles.verifiedInput}>
                <TextInput
                  style={styles.flexInput}
                  placeholder="07AAAZ9999A1Z5"
                  placeholderTextColor="#64748B"
                  value={gstin}
                  onChangeText={text =>
                    setGstin(text.replace(/\s/g, '').toUpperCase())
                  }
                  maxLength={15}
                  editable={!gstVerified}
                />
                {gstVerified && (
                  <View style={styles.verifiedBadge}>
                    <Image
                      source={require('../assets/Verified.png')}
                      style={{ height: 10, width: 10 }}
                      resizeMode="contain"
                    />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address</Text>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  backgroundColor: '#FFF',
                  padding: 14,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: 'DMSans-Regular',
                    color: '#64748B',
                  }}
                >
                  {address}
                </Text>
              </View>
            </View>

            <Text style={styles.note}>
              * Must be the number as shown on your food license.
            </Text>

            <TouchableOpacity
              style={[
                styles.saveBtn,
                // loading && { backgroundColor: '#A0AEC0' },
              ]}
              onPress={
                gstVerified ? () => handleUpdateProfile() : handleVerifyGst
              }
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveText}>
                  {gstVerified ? 'Update GST' : 'Add GST Number To Verify'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CompanyProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'DMSans-Regular',
  },

  member: {
    fontSize: 12,
    color: '#487D44',
    marginTop: 4,
    fontFamily: 'DMSans-Medium',
  },

  /* Form */
  menuText: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    color: 'green',
    alignSelf: 'center',
    width: '80%',
    textAlign: 'center',
    marginVertical: 10,
    textDecorationLine: 'underline',
  },

  form: {
    borderRadius: 16,
    paddingHorizontal: 16,
    // marginTop: 20,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  inputHalf: {
    width: '48%',
  },

  inputGroup: {
    marginTop: 15,
  },

  label: {
    fontSize: 14,
    marginBottom: 7,
    color: '#374151',
    fontFamily: 'DMSans-Medium',
  },

  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    backgroundColor: '#FFF',
  },

  verifiedInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
  },

  flexInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'DMSans-Regular',
  },

  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  verifiedText: {
    fontSize: 11,
    color: '#2E7D32',
    marginLeft: 4,
    fontFamily: 'DMSans-Medium',
  },

  note: {
    fontSize: 12,
    color: '#000000',
    marginTop: 6,
    fontFamily: 'DMSans-Regular',
  },

  /* Save Button */
  saveBtn: {
    backgroundColor: '#487D44',
    marginTop: 22,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  saveText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'DMSans-Medium',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  imageLoader: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    zIndex: 1,
  },
});
