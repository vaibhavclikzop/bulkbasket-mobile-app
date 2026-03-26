import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import CartScreen from "../screens/CartScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import PaymentScreen from "../screens/PaymentScreen";
import OrderConfirmScreen from "../screens/OrderConfirmScreen";
import OrderSummery from "../screens/OrderSummery";
import TrackOrder from "../screens/TrackOrder";

const Stack = createNativeStackNavigator();

const CartStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CartScreen" component={CartScreen} />
      <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} />
      <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
      <Stack.Screen name="OrderConfirmScreen" component={OrderConfirmScreen} />
      <Stack.Screen name="OrderSummery" component={OrderSummery} />
      <Stack.Screen name="TrackOrder" component={TrackOrder} />
    </Stack.Navigator>
  );
};

export default CartStack;
