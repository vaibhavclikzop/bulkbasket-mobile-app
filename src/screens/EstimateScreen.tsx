import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getEstimateApi } from '../services/api';
import Header from '../components/Header';

/* ================= TYPES ================= */

type Estimate = {
  id: number | string;
  order_id: string;
  total_amount: number;
  name: string;
  city: string;
  state: string;
  pincode: string;
  delivery_date: string;
  order_status: string;
  updated_at: string;
};

type Props = {
  navigation: any;
};

/* ================= COMPONENT ================= */

const EstimateScreen = ({ navigation }: Props) => {
  const [data, setData] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const getEstimate = async () => {
    try {
      setLoading(true);

      const res = await getEstimateApi();
      console.log('Estimate:', res);

      const sortedData = (res?.data || []).sort((a: Estimate, b: Estimate) => {
        return (
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
      });

      setData(sortedData);
    } catch (err) {
      console.log('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEstimate();
  }, []);

  /* ================= RENDER ITEM ================= */

  const renderItem = ({ item }: { item: Estimate }) => {
    const isCompleted = item.order_status?.toLowerCase() === 'complete';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('EstimateDetailScreen', { id: item.id })
        }
      >
        {/* Top Row */}
        <View style={styles.rowBetween}>
          {/* <Text style={styles.invoice}>{item.invoice_no}</Text> */}
          <Text style={styles.invoice}>{item.order_id}</Text>
          <Text style={styles.amount}>₹{item.total_amount}</Text>
        </View>

        {/* Name */}
        <Text style={styles.name}>{item.name}</Text>
        <View
          style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 6 }}
        />
        {/* Address */}
        <Text numberOfLines={1} style={styles.address}>
          {item.city}, {item.state} - {item.pincode}
        </Text>

        {/* Bottom Row */}
        <View style={styles.rowBetween}>
          <Text style={styles.date}>{item.delivery_date}</Text>
          <View
            style={[
              styles.statusBox,
              {
                backgroundColor: isCompleted ? '#DCFCE7' : '#FFF4EA', // light green / default
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: isCompleted ? '#16A34A' : '#FF9933', // green / orange
                },
              ]}
            >
              {item.order_status}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      {/* Header */}
      <Header title="Order Challans" />

      {/* List */}
      <FlatList<Estimate>
        data={data}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No estimates found</Text>
        }
      />
    </SafeAreaView>
  );
};

export default EstimateScreen;

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

  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#64748B',
    fontFamily: 'DMSans-Regular',
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
