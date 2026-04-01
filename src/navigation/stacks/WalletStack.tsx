import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WalletScreen from "../../screens/WalletScreen";
import TransactionHistory from "../../screens/TransactionHistory";
import AddMoney from "../../screens/AddMoney";
import WithdrawMoney from "../../screens/WithdrawMoney";

export type WalletStackParamList = {
  WalletMain: undefined;
  TransactionHistory: undefined;
  AddMoney: undefined;
  WithdrawMoney: undefined;
};

const Stack = createNativeStackNavigator<WalletStackParamList>();

const WalletStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WalletMain" component={WalletScreen} />
      <Stack.Screen name="TransactionHistory" component={TransactionHistory} />
      <Stack.Screen name="AddMoney" component={AddMoney} />
      <Stack.Screen name="WithdrawMoney" component={WithdrawMoney} />
    </Stack.Navigator>
  );
};

export default WalletStack;
