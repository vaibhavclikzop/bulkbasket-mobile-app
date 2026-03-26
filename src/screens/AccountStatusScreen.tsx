import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "../components/Styles";
type Props = NativeStackScreenProps<RootStackParamList, "AccountStatus">;

const AccountStatusScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={Styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require("../assets/Common/Back.png")}
            style={[Styles.headerImage, {}]}
          />
        </TouchableOpacity>
        <Text style={Styles.headerText}>Account Status</Text>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* Verification Icon */}
        <View style={styles.iconWrapper}>
          {/* <View style={styles.ringOuter}>
                    <View style={styles.ringMiddle}>
                        <View style={styles.ringInner}> */}
          <Image
            source={require("../assets/Verification.png")}
            style={styles.shield}
            resizeMode="contain"
          />
          {/* </View>
                    </View>
                </View> */}
        </View>

        {/* Title */}
        <Text style={styles.mainTitle}>Verification in Progress</Text>
        <Text style={styles.subtitle}>
          We are reviewing your business credentials to ensure you{"\n"}
          get access to wholesale pricing and credit features.
        </Text>

        {/* Status Card */}
        <View style={styles.statusCard}>
          {/* Step 1 */}
          <View style={styles.stepRow}>
            <View style={styles.stepLeft}>
              <Image
                source={require("../assets/icons/righticon.png")}
                style={styles.rightIcon}
              />
              <View style={styles.verticalLineActive} />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.statusTitle}>Application Submitted</Text>
              <Text style={styles.statusSub}>
                Your Business Details are received.
              </Text>
            </View>
          </View>

          {/* Step 2 */}
          <View style={styles.stepRow}>
            <View style={styles.stepLeft}>
              <Image
                source={require("../assets/icons/righticon.png")}
                style={styles.rightIcon}
              />
              <View style={styles.verticalLineActive} />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.statusTitle}>Under Review</Text>
              <Text style={styles.statusSub}>Usually takes up to 2 hours</Text>
            </View>
          </View>

          {/* Step 3 */}
          <View style={styles.stepRow}>
            {/* <View style={styles.stepLeft}>
                        <View style={styles.activeCircle} />
                    </View> */}
            <View style={styles.stepLeft}>
              <Image
                source={require("../assets/icons/righticon.png")}
                style={styles.rightIcon}
              />
              {/* <View style={styles.verticalLineActive} /> */}
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.statusTitle}>Account Activated</Text>
              <Text style={styles.statusSub}>Full access to marketplace</Text>
            </View>
          </View>
        </View>

        {/* Support Card */}
        <View style={styles.helpCard}>
          <View style={styles.helpRow}>
            {/* Left Icon */}

            {/* Right Content */}
            <View style={styles.helpContent}>
              <Text style={styles.helpTitle}>Need Immediate Help?</Text>
              <Text style={styles.helpSub}>
                Our support team is available to help expedite your onboarding.
              </Text>
            </View>
            <View style={styles.helpIconWrapper}>
              <TouchableOpacity style={styles.chatBtn}>
                <Text style={styles.chatText}>Chat Now </Text>
                <Image
                  source={require("../assets/icons/messages.png")}
                  style={styles.chatIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <Text style={styles.bottomTitle}>
          We’ll notify you at your registered email address {"\n"}as soon as
          your account is ready.
        </Text>
        {/* Continue Button */}
        <View style={styles.bottomWrapper}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={Styles.buttonText}>Continue to Homepage</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AccountStatusScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
    // padding: 20,
    paddingHorizontal: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  iconWrapper: {
    alignItems: "center",
  },

  shield: {
    width: 180,
    height: 180,
    marginVertical: 20,
  },
  icon: {
    fontSize: 40,
    color: "#487D44",
  },
  mainTitle: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 18,
    fontFamily: "DMSans-Medium",
    fontWeight: "600",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    marginVertical: 10,
    fontFamily: "DMSans-Regular",
  },
  bottomTitle: {
    textAlign: "center",
    fontSize: 14,
    color: "#666",
    fontFamily: "DMSans-Regular",
  },
  statusCard: {
    backgroundColor: "#F8F9FD",
    padding: 15,
    borderRadius: 16,
    borderColor: "#D1D5DB",
    borderWidth: 1,
    marginVertical: 7,
  },

  stepRow: {
    flexDirection: "row",
    marginBottom: 14,
  },

  stepLeft: {
    alignItems: "center",
    marginRight: 15,
    width: 24,
  },

  activeCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#487D44",
    justifyContent: "center",
    alignItems: "center",
  },

  activeCircleSmall: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#487D44",
  },

  inactiveCircle: {
    width: 25,
    height: 25,
    borderRadius: 12,
    backgroundColor: "#D1D5DB",
  },

  // verticalLineActive: {
  //     width: 2,
  //     flex: 2,
  //     backgroundColor: '#D2D6DB',
  //     marginTop: 1,
  //     // height: 30,
  // },
  verticalLineActive: {
    width: 2,
    height: 30,
    backgroundColor: "#D2D6DB",
    marginTop: 6,
  },
  chatIcon: {
    width: 12,
    height: 12,
    resizeMode: "contain",
  },
  verticalLineInactive: {
    width: 2,
    flex: 1,
    backgroundColor: "#E5E7EB",
    marginTop: 2,
  },

  stepContent: {
    flex: 1,
  },

  statusTitle: {
    fontWeight: "500",
    fontSize: 16,
    fontFamily: "DMSans-Medium",
  },

  inactiveTitle: {
    fontWeight: "600",
    fontSize: 13,
    color: "#9CA3AF",
  },

  statusSub: {
    fontSize: 14,
    color: "#6B7280",
    // marginTop: 4,
    fontFamily: "DMSans-Regular",
  },

  check: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  logo: {
    marginTop: 10,
    width: 180,
    height: 180,
  },
  rightIcon: {
    width: 20,
    height: 20,
  },
  helpCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    marginBottom: 22,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  helpRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  helpIconWrapper: {
    width: "auto",
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(72,125,68,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },

  helpIcon: {
    fontSize: 15,
  },

  helpContent: {
    flex: 1,
  },

  helpTitle: {
    fontSize: 16,
    // fontWeight: '700',
    marginBottom: 4,
    fontFamily: "DMSans-Medium",
  },

  helpSub: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 18,
    marginBottom: 12,
    fontFamily: "DMSans-Regular",
  },

  chatBtn: {
    backgroundColor: "#487D44",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    // alignSelf: 'center',
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  chatText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    fontFamily: "DMSans-Medium",
  },

  bottomWrapper: {
    marginTop: 30,
  },

  button: {
    backgroundColor: "#487D44",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#487D44",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  buttonText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "DMSans-SemiBold",
  },
});
