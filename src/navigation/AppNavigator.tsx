import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "../screens/SplashScreen";
// import LoginScreen from "../screens/LoginScreen";
import SetupProfileScreen from "../screens/SetupProfileScreen";
import OTPScreen from "../screens/OTPScreen";
import AccountStatusScreen from "../screens/AccountStatusScreen";
import Signup from "../screens/SignupScreen";
import { enableScreens } from "react-native-screens";
// import ForgotPassword from "../screens/ForgotPasswordScreen";
import DeliveryLocation from "../screens/DeliveryLocation";
import BottomTabs from "./BottomTabs";
import SearchScreen from "../components/SearchScreen";
import CategoryProductsScreen from "../screens/CategoryProductsScreen";
import ProductDetailScreen from "../screens/ProductDetailScreen";
import CartScreen from "../screens/CartScreen";
import CheckoutScreen from "../screens/CheckoutScreen";
import PaymentScreen from "../screens/PaymentScreen";
import OrderConfirmScreen from "../screens/OrderConfirmScreen";
// import SearchLocation from "../screens/SearchLocation";
import OrderSummery from "../screens/OrderSummery";
import TrackOrder from "../screens/TrackOrder";
import TransactionHistory from "../screens/TransactionHistory";
import NotificationScreen from "../screens/NotificationScreen";
import ContactSupportScreen from "../screens/ContactSupportScreen";
import ProfileScreen from "../screens/ProfileScreen";
import UpdateProfile from "../screens/UpdateProfile";
import PaymentOptionsScreen from "../screens/PaymentOptionsScreen";
import Addresses from "../screens/Addresses";
import WithdrawMoney from "../screens/WithdrawMoney";
import AddMoney from "../screens/AddMoney";
import OrdersScreen from "../screens/OrdersScreen";
import OrdersDetailScreen from "../screens/OrdersDetailScreen";
import BrandProductScreen from "../screens/BrandProductScreen";
import EstimateScreen from "../screens/EstimateScreen";
import WalletScreen from "../screens/WalletScreen";
import CompanyProfile from "../screens/CompanyProfile";
import AddressAddUpd from "../screens/AddressAddUpd";
import WishlistScreen from "../screens/WishlistScreen";

export type RootStackParamList = {
  Splash: undefined;
  // Login: undefined;
  Signup: undefined;
  OTP: { mobile: string };
  SignupSetUp: undefined;
  AccountStatus: undefined;
  // ForgotPassword: undefined;
  DeliveryLocation: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        {/* <Stack.Screen name="Login" component={LoginScreen} /> */}
        <Stack.Screen name="OTP" component={OTPScreen} />
        <Stack.Screen name="AccountStatus" component={AccountStatusScreen} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="SignupSetUp" component={SetupProfileScreen} />
        {/* <Stack.Screen name="ForgotPassword" component={ForgotPassword} /> */}
        <Stack.Screen name="DeliveryLocation" component={DeliveryLocation} />
        <Stack.Screen name="Home" component={BottomTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
