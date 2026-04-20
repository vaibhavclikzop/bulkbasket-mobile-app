import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getEstimateDetailsApi } from '../services/api';
import Styles from '../components/Styles';
import Header from '../components/Header';

/* ================= TYPES ================= */

type EstimateItem = {
  product_name?: string;
  qty: number;
  price: number;
  total: number;
  image?: string;
};

type EstimateData = {
  order_id: string;
  total_amount: number;
  name: string;
  city: string;
  state: string;
  pincode: string;
  delivery_date: string;
  order_status: string;
  items: EstimateItem[];
};

type Props = {
  route: {
    params: {
      id: number | string;
    };
  };
  navigation: any;
};

/* ================= ITEM COMPONENT ================= */

const EstimateItemCard = ({ item }: { item: EstimateItem }) => {
  const [imgError, setImgError] = useState(false);

  const imageUri = item?.image;

  return (
    <View style={styles.itemCard}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{ backgroundColor: '#F4F4F4', padding: 10, borderRadius: 10 }}
        >
          <Image
            source={
              imageUri && !imgError
                ? { uri: imageUri }
                : require('../assets/Common/Order.png')
            }
            resizeMode="contain"
            style={styles.productImg}
            onError={() => setImgError(true)}
          />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.itemName}>{item.product_name || 'Product'}</Text>

          <Text style={styles.itemText}>Qty: {item.qty}</Text>
          <Text style={[styles.itemText, { marginTop: 4 }]}>₹{item.price}</Text>
          {/* <Text style={styles.itemTotal}>Total: ₹{item.total}</Text> */}
        </View>
      </View>
    </View>
  );
};

/* ================= MAIN COMPONENT ================= */

const EstimateDetailScreen = ({ route, navigation }: Props) => {
  const { id } = route.params;

  const [data, setData] = useState<EstimateData | null>(null);
  const [items, setItems] = useState<EstimateItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const getStatusStyle = (status?: string) => {
    const s = status?.toLowerCase();
    if (s === 'complete') return { bg: '#DCFCE7', color: '#16A34A' };
    return { bg: '#FFF4EA', color: '#FF9933' };
  };
  const statusStyle = getStatusStyle(data?.order_status);
  const getDetails = async () => {
    try {
      setLoading(true);

      const res = await getEstimateDetailsApi(id);
      const details: EstimateData | undefined = res?.data?.[0];

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
    if (id) getDetails();
  }, [id]);

  /* ================= LOADER ================= */

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#487D44" />
      </View>
    );
  }

  /* ================= UI ================= */

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* HEADER */}
      <Header title="Estimate Details" />
      {data && (
        <>
          {/* TOP CARD */}
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.invoice}>{data.order_id}</Text>
              <Text style={styles.amount}>₹{data.total_amount}</Text>
            </View>

            <Text style={styles.name}>{data.name}</Text>

            <Text style={styles.address}>
              {data.city}, {data.state} - {data.pincode}
            </Text>

            <View style={styles.rowBetween}>
              <Text style={styles.date}>{data.delivery_date}</Text>

              <View
                style={[styles.statusBox, { backgroundColor: statusStyle.bg }]}
              >
                <Text style={[styles.statusText, { color: statusStyle.color }]}>
                  {data?.order_status}
                </Text>
              </View>
            </View>
          </View>

          {/* ITEMS */}
          <Text style={styles.sectionTitle}>Items</Text>

          <FlatList
            data={items}
            keyExtractor={(_, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => <EstimateItemCard item={item} />}
          />

          {/* TOTAL */}
          <View style={styles.totalBox}>
            <Text style={styles.totalText}>Total Amount:</Text>
            <Text style={styles.totalText}>₹{data.total_amount}</Text>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default EstimateDetailScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },

  headerTitle: {
    fontSize: 18,
    marginLeft: 10,
    fontFamily: 'DMSans-SemiBold',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  invoice: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'DMSans-Regular',
  },

  amount: {
    fontSize: 15,
    fontFamily: 'DMSans-SemiBold',
    color: '#000',
  },

  name: {
    fontSize: 15,
    marginTop: 6,
    fontFamily: 'DMSans-Medium',
  },

  address: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontFamily: 'DMSans-Regular',
  },

  date: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
    fontFamily: 'DMSans-Regular',
  },

  statusBox: {
    backgroundColor: '#FFF4EA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  statusText: {
    fontSize: 11,
    color: '#FF9933',
    fontFamily: 'DMSans-Medium',
  },

  sectionTitle: {
    fontSize: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    fontFamily: 'DMSans-SemiBold',
  },

  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  productImg: {
    width: 60,
    height: 60,
  },

  itemName: {
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
    marginBottom: 4,
  },

  itemText: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'DMSans-Regular',
  },

  // itemTotal: {
  //   fontSize: 13,
  //   marginTop: 4,
  //   fontFamily: "DMSans-SemiBold",
  // },

  totalBox: {
    margin: 16,
    padding: 14,
    backgroundColor: '#E6F4EA',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  totalText: {
    fontSize: 16,
    color: '#2E7D32',
    fontFamily: 'DMSans-SemiBold',
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
