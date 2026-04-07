import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "../components/Styles";

const NotificationScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState("All");
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const shoppingGreen = require("../assets/Notification/shoppinggreen.png");
  const groceryRed = require("../assets/Notification/groceryred.png");
  const redCup = require("../assets/Notification/redcup.png");
  const grocery = require("../assets/Notification/grocery.png");
  type NotificationType = {
    id: number;
    title: string;
    desc: string;
    time: string;
    icon: any;
  };

  // const notifications = [
  //   {
  //     id: 1,
  //     title: "Back in Stock !!",
  //     desc: "1000+ kitchen items from frozen foods, dairy, packaging & more.",
  //     time: "4 hours ago",
  //     icon: grocery,
  //   },
  //   {
  //     id: 2,
  //     title: "Almost there!",
  //     desc: "Your cart has few items waiting for you. Order Now!!",
  //     time: "6 hours ago",
  //     icon: shoppingGreen,
  //   },
  //   {
  //     id: 3,
  //     title: "Tea & coffee from:",
  //     desc: "Nescafe, Wagh Bakri, Tata Tea & more at deal prices. Check Now.",
  //     time: "1 day ago",
  //     icon: redCup,
  //   },
  //   {
  //     id: 4,
  //     title: "Tea & coffee from:",
  //     desc: "Nescafe, Wagh Bakri, Tata Tea & more at deal prices. Check Now.",
  //     time: "1 day ago",
  //     icon: groceryRed,
  //   },
  //   {
  //     id: 5,
  //     title: "Back in Stock !!",
  //     desc: "1000+ kitchen items from frozen foods, dairy, packaging & more.",
  //     time: "4 hours ago",
  //     icon: grocery,
  //   },
  //   {
  //     id: 6,
  //     title: "Almost there!",
  //     desc: "Your cart has few items waiting for you. Order Now!!",
  //     time: "6 hours ago",
  //     icon: shoppingGreen,
  //   },
  //   {
  //     id: 7,
  //     title: "Tea & coffee from:",
  //     desc: "Nescafe, Wagh Bakri, Tata Tea & more at deal prices. Check Now.",
  //     time: "1 day ago",
  //     icon: redCup,
  //   },
  //   {
  //     id: 8,
  //     title: "Back in Stock !!",
  //     desc: "1000+ kitchen items from frozen foods, dairy, packaging & more.",
  //     time: "4 hours ago",
  //     icon: grocery,
  //   },
  // ];

  // const notifications = [];

  const NotificationItem = ({ item }: any) => (
    <View style={styles.notificationItem}>
      <View style={styles.iconBox}>
        <Image source={item.icon} style={styles.icon} />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.desc}>{item.desc}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </View>
  );

  const Tab = ({ title }: any) => (
    <TouchableOpacity onPress={() => setActiveTab(title)}>
      <View style={styles.tab}>
        <Text
          style={[styles.tabText, activeTab === title && styles.activeTabText]}
        >
          {title}
        </Text>

        {activeTab === title && <View style={styles.activeLine} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View
          style={[
            Styles.header,
            { justifyContent: "space-between", padding: 16 },
          ]}
        >
          <View style={Styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image
                source={require("../assets/Common/Back.png")}
                style={[Styles.headerImage]}
              />
            </TouchableOpacity>

            <Text style={Styles.headerText}>Notifications</Text>
          </View>

          <TouchableOpacity style={{}}>
            <Image
              source={require("../assets/Common/dots.png")}
              style={[Styles.headerImage]}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.markRead}>
          <Text style={styles.markText}>Mark all as read</Text>
        </TouchableOpacity>

        {/* Tabs */}
        <View style={styles.tabRow}>
          <View style={styles.tabContainer}>
            <Tab title="All" />
            <Tab title="Offers" />
            <Tab title="Payments" />
            <Tab title="Order" />
          </View>
        </View>

        {/* Notification List */}
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <NotificationItem item={item} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No notifications received</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F6F8",
  },

  container: {
    flex: 1,
    // padding: 16,
  },

  headerTitle: {
    fontSize: 18,
    fontFamily: "DMSans-SemiBold",
  },

  tabRow: {
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#DFE0EB",
  },

  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  tab: {
    alignItems: "center",
    position: "relative",
    paddingBottom: 12,
  },

  tabText: {
    fontFamily: "DMSans-Medium",
    color: "#000000",
  },

  activeTabText: {
    color: "#487D44",
  },

  activeLine: {
    position: "absolute",
    bottom: -2,
    height: 3,
    width: 45,
    backgroundColor: "#487D44",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },

  markRead: {
    alignSelf: "flex-end",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    // marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
    marginHorizontal: 16,
    // marginVertical: 2
  },

  markText: {
    fontSize: 12,
    fontFamily: "DMSans-Light",
  },

  notificationItem: {
    flexDirection: "row",
    paddingHorizontal: 18,
    borderBottomWidth: 0.6,
    borderBottomColor: "#DFE0EB",
    paddingVertical: 15,
    backgroundColor: "#fff",
    alignItems: "center",
    // borderColor: "red"
  },

  iconBox: {
    width: 45,
    height: 45,
    borderRadius: 10,
    backgroundColor: "#F8F9FD",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  icon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
  },

  title: {
    fontFamily: "DMSans-Medium",
    fontSize: 14,
  },

  desc: {
    fontFamily: "DMSans-Regular",
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  time: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 4,
    fontFamily: "DMSans-Regular",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100, // adjust if needed
  },

  emptyText: {
    fontSize: 14,
    color: "#64748B",
    fontFamily: "DMSans-Medium",
  },
});
