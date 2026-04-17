import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import OTPScreen from '../screens/OTPScreen';
import AccountStatusScreen from '../screens/AccountStatusScreen';
import SignupScreen from '../screens/SignupScreen';
import SetupProfileScreen from '../screens/SetupProfileScreen';
import DeliveryLocationScreen from '../screens/DeliveryLocation';
import BottomTabs from './BottomTabs';

const Stack = createNativeStackNavigator<RootStackParamList>();
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
const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      {/* <Stack.Screen name="Login" component={LoginScreen} /> */}
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="AccountStatus" component={AccountStatusScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="SignupSetUp" component={SetupProfileScreen} />
      {/* <Stack.Screen name="ForgotPassword" component={ForgotPassword} /> */}
      <Stack.Screen
        name="DeliveryLocation"
        component={DeliveryLocationScreen}
      />
      <Stack.Screen name="Home" component={BottomTabs} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
