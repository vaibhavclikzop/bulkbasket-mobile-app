import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CartScreen from "../../screens/CartScreen";
import CheckoutScreen from "../../screens/CheckoutScreen";
import PaymentScreen from "../../screens/PaymentScreen";
import Addresses from "../../screens/Addresses";
import OrderConfirmScreen from "../../screens/OrderConfirmScreen";
import OrderSummery from "../../screens/OrderSummery";
import CheckoutAddressScreen from "../../screens/CheckoutAddressScreen";
import TrackOrder from "../../screens/TrackOrder";
import AddressAddUpd from "../../screens/AddressAddUpd";

export type CartStackParamList = {
  CartMain: undefined;
  CheckoutScreen: undefined;
  PaymentScreen: { delivery_date?: string; delivery_instruction?: string };
  CheckoutAddressScreen:
    | { delivery_date?: string; delivery_instruction?: string }
    | undefined;
  OrderConfirmScreen: undefined;
  OrderSummery: undefined;
  TrackOrder: undefined;
  AddressAddUpd: { addressData?: any } | undefined;
};

const Stack = createNativeStackNavigator<CartStackParamList>();

const CartStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CartMain" component={CartScreen} />
      <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
      <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
      <Stack.Screen
        name="CheckoutAddressScreen"
        component={CheckoutAddressScreen}
      />
      <Stack.Screen name="OrderConfirmScreen" component={OrderConfirmScreen} />
      <Stack.Screen name="OrderSummery" component={OrderSummery} />
      <Stack.Screen name="TrackOrder" component={TrackOrder} />
      <Stack.Screen name="AddressAddUpd" component={AddressAddUpd} />
    </Stack.Navigator>
  );
};

export default CartStack;
