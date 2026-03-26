import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CartScreen from "../../screens/CartScreen";
import CheckoutScreen from "../../screens/CheckoutScreen";
import PaymentScreen from "../../screens/PaymentScreen";
import Addresses from "../../screens/Addresses";
import OrderConfirmScreen from "../../screens/OrderConfirmScreen";
import OrderSummery from "../../screens/OrderSummery";
import CheckoutAddressScreen from "../../screens/CheckoutAddressScreen";

export type CartStackParamList = {
  CartMain: undefined;
  CheckoutScreen: undefined;
  PaymentScreen: { delivery_date?: string; delivery_instruction?: string };
  CheckoutAddressScreen:
    | { delivery_date?: string; delivery_instruction?: string }
    | undefined;
  OrderConfirmScreen: undefined;
  OrderSummery: undefined;
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
    </Stack.Navigator>
  );
};

export default CartStack;
