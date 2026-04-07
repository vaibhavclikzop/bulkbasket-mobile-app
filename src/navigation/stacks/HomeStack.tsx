import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../../screens/HomeScreen';
import SearchScreen from '../../components/SearchScreen';
import CategoryProductsScreen from '../../screens/CategoryProductsScreen';
import ProductDetailScreen from '../../screens/ProductDetailScreen';
import BrandProductScreen from '../../screens/BrandProductScreen';
import NotificationScreen from '../../screens/NotificationScreen';
import AddressAddUpd from '../../screens/AddressAddUpd';
import Addresses from '../../screens/Addresses';

export type HomeStackParamList = {
  HomeMain: undefined;
  Search: undefined;
  CategoryProduct: undefined;
  ProductDetail: undefined;
  BrandProduct: { brandId: number; brandName: string };
  NotificationScreen: undefined;
  Addresses: undefined;
  AddressAddUpd: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="CategoryProduct" component={CategoryProductsScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="BrandProduct" component={BrandProductScreen} />
      <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
            <Stack.Screen name="AddressAddUpd" component={AddressAddUpd} />
      <Stack.Screen name="Addresses" component={Addresses} />
    </Stack.Navigator>
  );
};

export default HomeStack;
