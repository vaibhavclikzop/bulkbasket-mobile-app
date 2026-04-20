import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getWalletLedgerApi } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

export default function WalletScreen({ navigation }: any) {
  const [amount, setAmount] = useState('');
  const [history, setHistory] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await getWalletData();
    setRefreshing(false);
  }, []);

  const getWalletData = async () => {
    try {
      setLoading(true);
      const res = await getWalletLedgerApi();

      console.log('Wallet Data:', res);

      const walletAmount = Number(res?.company?.wallet) || 0;
      const usedWallet = Number(res?.company?.used_wallet) || 0;
      setAmount(String(Number(walletAmount) - Number(usedWallet)));
      setHistory(res?.data || []);
    } catch (error) {
      console.log('Wallet Error:', error);
    } finally {
      setLoading(false); // Stop loader
    }
  };

  useFocusEffect(
    useCallback(() => {
      getWalletData();
    }, []),
  );

  const renderTransaction = ({ item }: any) => {
    const isCredit = item.type === 'credit';

    return (
      <View
        style={[
          styles.transactionCard,
          isCredit ? styles.blueCard : styles.redCard,
        ]}
      >
        <View style={styles.transactionLeft}>
          <View style={styles.iconBox}>
            <Image
              source={
                item.type === 'debit'
                  ? require('../assets/Common/debit.png')
                  : require('../assets/Common/credit.png')
              }
              style={{
                height: 16,
                width: 16,
                tintColor: item.type === 'debit' ? '#F53333' : '#0C8CE9',
              }}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={styles.transactionTitleText}>
              {item.particular}
            </Text>
            <Text numberOfLines={1} style={styles.transactionSub}>
              {item.order_id?.trim() ? item.order_id : item.invoice_no}
            </Text>
            <Text
              numberOfLines={1}
              style={[styles.transactionSub, { color: '#000' }]}
            >
              {item.pay_date?.split(' ')[0]}
            </Text>
          </View>
        </View>

        <View style={{ alignItems: 'flex-end', minWidth: 70 }}>
          <Text style={styles.amount}>
            {isCredit ? '+' : '-'}₹{item.amount}
          </Text>

          <View
            style={[
              styles.statusBadge,
              isCredit ? styles.statusCompleted : styles.statusFailed,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isCredit ? styles.statusCompletedText : styles.statusFailedText,
              ]}
            >
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const HeaderComponent = () => (
    <>
      {/* Balance Card */}
      <View style={{ marginTop: 10 }}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>₹{Number(amount).toFixed(2)}</Text>

          <View style={styles.buttonRow}>
            {/* <TouchableOpacity
              style={styles.withdrawBtn}
              onPress={() => navigation.navigate("WithdrawMoney")}
            >
              <Image
                source={require("../assets/Common/Withdraw.png")}
                style={{ height: 16, width: 16 }}
              />
              <Text style={styles.withdrawText}>Withdraw</Text>
            </TouchableOpacity> */}

            <TouchableOpacity
              onPress={() => navigation.navigate('AddMoney')}
              style={{
                backgroundColor: '#487D44',
                padding: 10,
                borderRadius: 10,
                flexDirection: 'row',
                alignItems: 'center',
                width: '40%',
                justifyContent: 'center',
              }}
            >
              <View
                style={{
                  backgroundColor: '#fff',
                  padding: 3,
                  borderRadius: 10,
                }}
              >
                <Image
                  source={require('../assets/Common/addMoney.png')}
                  style={{ height: 10, width: 10, tintColor: '#487D44' }}
                />
              </View>
              <Text style={styles.addText}>Add Money</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Transactions Header */}
      <View style={styles.transactionHeader}>
        <Text style={styles.transactionTitle}>Transactions</Text>

        <TouchableOpacity
          onPress={() => navigation.navigate('TransactionHistory')}
          style={styles.historyRow}
        >
          <Image
            source={require('../assets/Common/history.png')}
            style={{
              height: 14,
              width: 14,
              tintColor: '#64748B',
              resizeMode: 'contain',
            }}
          />
          <Text style={styles.historyText}>History</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: '#F5F6F8' }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BBI Wallet</Text>
      </View>

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <ActivityIndicator size="large" color="#487D44" />
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item: any, index: number) => `${item.id}-${index}`}
          renderItem={renderTransaction}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#487D44']}
            />
          }
          ListHeaderComponent={HeaderComponent}
          ListEmptyComponent={() => (
            <View style={{ alignItems: 'center', marginTop: 50 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: '#666',
                  fontFamily: 'DMSans-Medium',
                }}
              >
                No transaction history yet
              </Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 20,
            flexGrow: 1,
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    paddingVertical: 16,
  },

  headerTitle: {
    fontSize: 18,
    fontFamily: 'DMSans-SemiBold',
  },

  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },

  balanceLabel: {
    color: '#64748B',
    fontSize: 13,
    fontFamily: 'DMSans-Regular',
  },

  balanceAmount: {
    fontSize: 32,
    fontFamily: 'DMSans-Bold',
    marginVertical: 6,
  },

  buttonRow: {
    flexDirection: 'row',
    marginTop: 15,
    width: '100%',
    justifyContent: 'center',
  },

  withdrawBtn: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    width: '45%',
    justifyContent: 'center',
  },

  withdrawText: {
    marginLeft: 6,
    fontFamily: 'DMSans-Medium',
  },

  addBtn: {
    backgroundColor: '#487D44',
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
    justifyContent: 'center',
  },

  addText: {
    color: '#fff',
    marginLeft: 6,
    fontFamily: 'DMSans-Medium',
  },

  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },

  transactionTitle: {
    fontSize: 16,
    fontFamily: 'DMSans-SemiBold',
  },

  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  historyText: {
    marginLeft: 4,
    color: '#64748B',
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
  },

  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    alignItems: 'center',
  },

  blueCard: {
    backgroundColor: '#ECF7FF',
  },

  orangeCard: {
    backgroundColor: '#FFF4EA',
  },

  redCard: {
    backgroundColor: '#FFEEEE',
  },

  transactionLeft: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    marginRight: 10,
  },

  iconBox: {
    width: 36,
    height: 36,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  transactionTitleText: {
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
  },

  transactionSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 5,
    fontFamily: 'DMSans-Regular',
  },

  amount: {
    fontSize: 14,
    fontFamily: 'DMSans-SemiBold',
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },

  statusCompleted: {
    backgroundColor: '#66BFFF1A',
  },

  statusProcessing: {
    backgroundColor: '#FFA9531A',
  },

  statusFailed: {
    backgroundColor: '#FF72721F',
  },

  statusText: {
    fontSize: 10,
    fontFamily: 'DMSans-Medium',
  },

  statusCompletedText: {
    color: '#0C8CE9',
  },

  statusProcessingText: {
    color: '#FF9933',
  },

  statusFailedText: {
    color: '#F53333',
  },
});
