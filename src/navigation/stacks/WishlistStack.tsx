import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WishlistScreen from "../../screens/WishlistScreen";
import ProductDetailScreen from "../../screens/ProductDetailScreen";

export type WishlistStackParamList = {
  WishlistMain: undefined;
  ProductDetail: undefined;
};

const Stack = createNativeStackNavigator<WishlistStackParamList>();

const WishlistStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WishlistMain" component={WishlistScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
};

export default WishlistStack;
