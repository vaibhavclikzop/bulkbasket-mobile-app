import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OrderConfirmScreen({ navigation }: any) {
  const [showDownload, setShowDownload] = useState(false);

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
        <View style={styles.row}>
          <Text style={styles.label}>Challan ID</Text>
          <Text style={styles.value}>#B2B-889653</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>very Date</Text>
          <Text style={styles.value}>15 Mar, 2026</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Payment Method</Text>
          <Text style={styles.value}>**** 4242</Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.topButtons}>
        <TouchableOpacity
          onPress={() => navigation.navigate('OrderSummery')}
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
          >
            <Image
              source={require('../assets/Common/SavePdf.png')}
              style={{ height: 18, width: 18 }}
              resizeMode="contain"
            />
            <Text style={styles.dropdownText}>Save PDF</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.dropdownItem, {}]}>
            <Image
              source={require('../assets/Common/Export.png')}
              style={{ height: 18, width: 18 }}
            />
            <Text style={styles.dropdownText}>Export Excel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          onPress={() => navigation.navigate('TrackOrder')}
          style={styles.trackBtn}
        >
          <Text numberOfLines={1} style={styles.trackText}>
            Track Order
          </Text>
        </TouchableOpacity>

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
    marginBottom: 12,
  },

  label: {
    color: '#6B7280',
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
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
