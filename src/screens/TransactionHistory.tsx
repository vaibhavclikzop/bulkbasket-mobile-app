import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
// import Feather from "react-native-vector-icons/Feather";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import { getWalletLedgerApi } from "../services/api";
import { useFocusEffect } from "@react-navigation/native";

type Transaction = {
  id: number;
  type: string;
  invoice_no: string;
  particular: string;
  amount: number;
};

export default function TransactionHistory({ navigation }: any) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [history, setHistory] = useState([]);
  const [searchText, setSearchText] = useState("");

  const filters = ["All", "Credits", "Debits"];

  const getWalletData = async () => {
    try {
      const res = await getWalletLedgerApi();
      setHistory(res?.data || []);
    } catch (error) {
      console.log("Wallet Error:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getWalletData();
    }, []),
  );

  // ✅ FILTER + SEARCH LOGIC
  const filteredData = history.filter((item: any) => {
    const matchesFilter =
      activeFilter === "All" ||
      (activeFilter === "Credits" && item.type === "credit") ||
      (activeFilter === "Debits" && item.type === "debit");

    const matchesSearch = item.invoice_no
      ?.toString()
      .toLowerCase()
      .includes(searchText.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const renderItem = ({ item }: any) => {
    const isCredit = item.type === "credit";

    return (
      <View
        style={[
          styles.transactionCard,
          isCredit ? styles.blueCard : styles.redCard,
        ]}
      >
        <View style={{ flexDirection: "row", flex: 1 }}>
          <View style={styles.iconBox}>
            <Image
              source={
                item.type === "debit"
                  ? require("../assets/Common/debit.png")
                  : require("../assets/Common/credit.png")
              }
              style={{
                height: 16,
                width: 16,
                tintColor: item.type === "debit" ? "#F53333" : "#0C8CE9",
              }}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={styles.transactionTitle}>
              {item.particular}
            </Text>
            <Text numberOfLines={1} style={styles.transactionSub}>
              {item.invoice_no}
            </Text>

            <Text
              numberOfLines={1}
              style={[styles.transactionSub, { color: "#000" }]}
            >
              {item.pay_date?.split(" ")[0]}
            </Text>
          </View>
        </View>

        <View
          style={{
            alignItems: "flex-end",
            marginLeft: 10,
            flexShrink: 0,
            minWidth: 70,
          }}
        >
          <Text style={styles.amount} numberOfLines={1}>
            {isCredit ? "+" : "-"}₹{item.amount}
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

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <Header title="BBI Wallet" containerStyle={styles.header} />

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Image
            source={require("../assets/Common/search.png")}
            style={{
              height: 16,
              width: 16,
              resizeMode: "contain",
            }}
          />
          <TextInput
            placeholder="Search transaction..."
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* <View style={styles.filterIcon}>
          <Feather name="sliders" size={18} color="#487D44" />
        </View> */}
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        <FlatList
          data={filters}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={{ flexDirection: "row" }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveFilter(item)}
              style={[
                styles.filterBtn,
                activeFilter === item && styles.activeFilter,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === item && styles.activeFilterText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Transactions */}
      <View style={styles.container}>
        <FlatList
          data={filteredData}
          keyExtractor={(item: any) => item.id.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <Text
              style={{
                textAlign: "center",
                marginTop: 20,
                fontFamily: "DMSans-Medium",
              }}
            >
              No transactions found
            </Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F9FD",
  },

  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
    marginBottom: 12,
    padding: 15,
  },

  headerTitle: {
    fontSize: 18,
    marginLeft: 10,
    fontFamily: "DMSans-SemiBold",
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 15,
  },

  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingHorizontal: 12,
    height: 40,
    borderWidth: 1,
    borderColor: "#D2D6DB",
  },

  searchInput: {
    marginLeft: 8,
    flex: 1,
    fontFamily: "DMSans-Regular",
  },

  filterIcon: {
    width: 40,
    height: 40,
    marginLeft: 10,
    borderRadius: 18,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D2D6DB",
  },

  filterRow: {
    flexDirection: "row",
    marginBottom: 15,
    paddingHorizontal: 15,
  },

  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#fff",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#D2D6DB",
  },

  activeFilter: {
    backgroundColor: "#487D44",
  },

  filterText: {
    fontSize: 14,
    color: "#000",
    fontFamily: "DMSans-Medium",
  },

  activeFilterText: {
    color: "#fff",
  },

  transactionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    alignItems: "center",
  },

  blueCard: {
    backgroundColor: "#ECF7FF",
  },

  orangeCard: {
    backgroundColor: "#FFF4EA",
  },

  redCard: {
    backgroundColor: "#FFEEEE",
  },

  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconBox: {
    width: 36,
    height: 36,
    backgroundColor: "#fff",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  transactionTitle: {
    fontSize: 14,
    fontFamily: "DMSans-Medium",
  },

  transactionSub: {
    fontSize: 10,
    color: "#64748B",
    fontFamily: "DMSans-Regular",
    marginTop: 4,
  },

  amount: {
    fontSize: 14,
    fontFamily: "DMSans-SemiBold",
    flexShrink: 0,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },

  statusText: {
    fontSize: 10,
    fontFamily: "DMSans-Medium",
  },

  statusCompleted: {
    backgroundColor: "#66BFFF1A",
  },

  statusCompletedText: {
    color: "#0C8CE9",
  },

  statusProcessing: {
    backgroundColor: "#FFA9531A",
  },

  statusProcessingText: {
    color: "#FF9933",
  },

  statusFailed: {
    backgroundColor: "#FF72721F",
  },

  statusFailedText: {
    color: "#F53333",
  },
});
