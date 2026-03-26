import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../../screens/ProfileScreen";
import UpdateProfile from "../../screens/UpdateProfile";
import CompanyProfile from "../../screens/CompanyProfile";
import OrdersScreen from "../../screens/OrdersScreen";
import OrdersDetailScreen from "../../screens/OrdersDetailScreen";
import ContactSupportScreen from "../../screens/ContactSupportScreen";
import NotificationScreen from "../../screens/NotificationScreen";
import AddressAddUpd from "../../screens/AddressAddUpd";
import Addresses from "../../screens/Addresses";
import PaymentOptionsScreen from "../../screens/PaymentOptionsScreen";
import EstimateScreen from "../../screens/EstimateScreen";
import EstimateDetailScreen from "../../screens/EstimateDetailScreen";

export type ProfileStackParamList = {
  ProfileMain: undefined;
  UpdateProfile: undefined;
  CompanyProfile: undefined;
  OrdersScreen: undefined;
  OrdersDetailScreen: { order_id: string };
  ContactSupportScreen: undefined;
  NotificationScreen: undefined;
  AddressAddUpd: { addressData?: any } | undefined;
  Addresses: undefined;
  PaymentOptionsScreen: undefined;
  EstimateDetailScreen: undefined;
  EstimateScreen: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="UpdateProfile" component={UpdateProfile} />
      <Stack.Screen name="CompanyProfile" component={CompanyProfile} />
      <Stack.Screen name="OrdersScreen" component={OrdersScreen} />
      <Stack.Screen name="OrdersDetailScreen" component={OrdersDetailScreen} />
      <Stack.Screen
        name="ContactSupportScreen"
        component={ContactSupportScreen}
      />
      <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
      <Stack.Screen name="AddressAddUpd" component={AddressAddUpd} />
      <Stack.Screen name="Addresses" component={Addresses} />
      <Stack.Screen
        name="PaymentOptionsScreen"
        component={PaymentOptionsScreen}
      />
      <Stack.Screen name="EstimateScreen" component={EstimateScreen} />
      <Stack.Screen
        name="EstimateDetailScreen"
        component={EstimateDetailScreen}
      />
    </Stack.Navigator>
  );
};

export default ProfileStack;
