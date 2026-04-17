import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";
import { BASE_URL, getProfileApi } from "../services/api";
import {
  launchImageLibrary,
  ImageLibraryOptions,
  ImagePickerResponse,
} from "react-native-image-picker";

type MenuItem = {
  id: number;
  title: string;
  image?: any;
};

const menuItems: MenuItem[] = [
  { id: 1, title: "Profile", image: require("../assets/Tabs/Profile.png") },
  {
    id: 2,
    title: "Company Profile",
    image: require("../assets/Common/contractor.png"),
  },

  {
    id: 3,
    title: "Estimate",
    image: require("../assets/Common/calculator.png"),
  },
  {
    id: 4,
    title: "Your Orders",
    image: require("../assets/Tabs/shopping.png"),
  },
  {
    id: 5,
    title: "Notifications",
    image: require("../assets/Common/notification.png"),
  },
  // {
  //   id: 6,
  //   title: "Payment Options",
  //   image: require("../assets/Payment/card.png"),
  // },
  {
    id: 7,
    title: "Saved Address",
    image: require("../assets/Common/SLocation.png"),
  },
  {
    id: 8,
    title: "Contact & Support",
    image: require("../assets/Common/chat.png"),
  },
];

export default function ProfileScreen({ navigation }: any) {
  const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [imageLoading, setImageLoading] = useState(true);

  const openGallery = (): void => {
    const options: ImageLibraryOptions = {
      mediaType: "photo",
      quality: 1,
      selectionLimit: 1,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.errorCode) {
        console.log("ImagePicker Error: ", response.errorMessage);
      } else {
        // const uri: string | undefined = response.assets?.[0]?.uri;
        // if (uri) {
        //   console.log("Selected Image:", uri);

        //   setImage(uri);
        // }
        const asset = response.assets?.[0];
        if (asset) {
          console.log("Selected Image:", asset);
          setImage(asset.uri);
          handleUpdateProfile(asset);
        }
      }
    });
  };

  const handleUpdateProfile = async (selectedImage: any) => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("userToken");
      const formData = new FormData();

      if (selectedImage && selectedImage.uri) {
        formData.append("image", {
          uri: selectedImage.uri,
          type: selectedImage.type || "image/jpeg",
          name: selectedImage.fileName || "profile.jpg",
        } as any);
      }

      const response = await axios.post(
        `${BASE_URL}/update-profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
          },
        },
      );

      console.log("Update Profile Response:", response.data);
      getProfile();
      if (response.data.error === false) {
        // Alert.alert("Profile Updated", "Profile updated successfully");
      } else {
        // Alert.alert("Profile Update Failed", "Profile update failed");
      }
    } catch (error) {
      console.log("Update Profile Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getProfile = async () => {
    try {
      setLoading(true);

      const response = await getProfileApi();
      const data = response?.data;
      // console.log("Profile Data : -------->", data);

      if (data.image) {
        setImage(data.image);
      }
      setName(data.customer_name);
    } catch (error: any) {
      console.log("Get Profile Error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      getProfile();
    }, []),
  );

  const handleLogOut = async () => {
    try {
      await AsyncStorage.removeItem("userToken");

      navigation.reset({
        index: 0,
        routes: [{ name: "Signup" }],
      });
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.container}>
          {/* Profile Header */}
          <View style={styles.profileSection}>
            <TouchableOpacity
              onPress={openGallery}
              style={styles.avatarWrapper}
            >
              {imageLoading && (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="small" color="#487D44" />
                </View>
              )}
              <Image
                source={
                  image
                    ? { uri: image.uri || image }
                    : {
                        uri: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
                      }
                }
                style={styles.avatar}
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
              />

              <View style={styles.verifiedBadge}>
                <Image
                  source={require("../assets/Common/camera.png")}
                  style={{ width: 14, height: 14, tintColor: "#fff" }}
                />
              </View>
            </TouchableOpacity>

            <Text style={styles.name}>{name}</Text>
          </View>

          {/* Menu Card */}
          <View style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  index === menuItems.length - 1 && styles.lastItem,
                ]}
                onPress={() => {
                  if (item.title === "Notifications") {
                    navigation.navigate("NotificationScreen");
                  } else if (item.title === "Contact & Support") {
                    navigation.navigate("ContactSupportScreen");
                  } else if (item.title === "Profile") {
                    navigation.navigate("UpdateProfile");
                    // }
                    // else if (item.title === "Payment Options") {
                    //   navigation.navigate("PaymentOptionsScreen");
                  } else if (item.title === "Saved Address") {
                    navigation.navigate("Addresses");
                  } else if (item.title === "Your Orders") {
                    navigation.navigate("OrdersScreen");
                  } else if (item.title === "Estimate") {
                    navigation.navigate("EstimateScreen");
                  } else if (item.title === "Company Profile") {
                    navigation.navigate("CompanyProfile");
                  }
                }}
              >
                <View style={styles.menuLeft}>
                  {/* Icon or Image */}
                  {/* {item.icon ? (
                    <Feather
                      name={item.icon}
                      size={18}
                      color="#64748B"
                      style={{ marginRight: 12 }}
                    />
                  ) : ( */}
                  <Image
                    source={item.image}
                    style={styles.menuImage}
                    resizeMode="contain"
                  />
                  <Text style={styles.menuText}>{item.title}</Text>
                  {/* )} */}
                </View>

                <Image
                  source={require("../assets/Common/ArrowRight.png")}
                  style={{ height: 11, width: 11 }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogOut}>
            <Image
              source={require("../assets/Common/logout.png")}
              style={{ height: 18, width: 18 }}
              resizeMode="contain"
            />
            <Text style={styles.logoutText}>LogOut</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  scrollContainer: {
    paddingBottom: 40,
  },

  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  profileSection: {
    alignItems: "center",
    marginTop: 25,
    marginBottom: 20,
  },

  avatarWrapper: {
    position: "relative",
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },

  verifiedBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },

  name: {
    fontSize: 18,
    marginTop: 14,
    fontFamily: "DMSans-SemiBold",
    textAlign: "center",
    width: "80%",
  },

  subtitle: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 4,
    fontFamily: "DMSans-Regular",
  },

  member: {
    fontSize: 14,
    color: "#4CAF50",
    marginTop: 4,
    fontFamily: "DMSans-Medium",
  },

  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#D2D6DB4D",
  },

  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
  },

  lastItem: {
    borderBottomWidth: 0,
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  menuText: {
    fontSize: 16,
    fontFamily: "DMSans-Regular",
  },

  menuImage: {
    width: 18,
    height: 18,
    marginRight: 12,
    tintColor: "#64748B",
  },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#D2D6DB4D",
  },

  logoutText: {
    color: "#FF3B30",
    fontSize: 16,
    marginLeft: 8,
    fontFamily: "DMSans-SemiBold",
  },
  loaderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});
