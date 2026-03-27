import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HomeScreen from "./stacks/HomeStack";
import WishlistScreen from "./stacks/WishlistStack";
import WalletScreen from "./stacks/WalletStack";
import CartScreen from "./stacks/CartStack";
import ProfileScreen from "./stacks/ProfileStack";

export type BottomTabParamList = {
  Home: undefined;
  Wishlist: undefined;
  Wallet: undefined;
  Cart: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const BottomTabs = () => {
  const insets = useSafeAreaInsets();

  const icons: any = {
    Home: require("../assets/Tabs/home.png"),
    Wishlist: require("../assets/Tabs/heart.png"),
    Wallet: require("../assets/Tabs/wallet.png"),
    Cart: require("../assets/Tabs/shopping.png"),
    Profile: require("../assets/Tabs/Profile.png"),
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: "#487D44",
        tabBarInactiveTintColor: "#999",
        unmountOnBlur: true,

        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
        },

        tabBarLabelStyle: {
          fontSize: Platform.OS === "ios" ? 12 : 11,
          fontFamily: "DMSans-Medium",
        },

        tabBarIcon: ({ color, focused }) => (
          <View
            style={{ alignItems: "center", justifyContent: "center", flex: 1 }}
          >
            {focused && (
              <View
                style={{
                  position: "absolute",
                  top: -6,
                  width: 40,
                  height: 4,
                  backgroundColor: "#487D44",
                  borderBottomLeftRadius: 4,
                  borderBottomRightRadius: 4,
                }}
              />
            )}

            <Image
              source={icons[route.name]}
              style={{
                width: 22,
                height: 22,
                resizeMode: "contain",
                tintColor: color,
                marginTop: 5,
              }}
            />
          </View>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Wishlist" component={WishlistScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabs;
