import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "../components/Styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL, getProfileApi } from "../services/api";
import {
  launchImageLibrary,
  ImageLibraryOptions,
  ImagePickerResponse,
} from "react-native-image-picker";

const UpdateProfile = ({ navigation }: any) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [number, setNumber] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);

  const getProfile = async () => {
    try {
      setInitialLoading(true);

      const response = await getProfileApi();
      const data = response?.data;
      console.log("Get Api Data :-------->", data);
      setEmail(data?.customer_email || "");
      setNumber(data?.customer_number);
      setName(data?.customer_name);
      setAddress(data?.customer_address);
      if (data?.image) {
        setImage(data.image);
      }
    } catch (error) {
      console.log("Get Profile Error:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    getProfile();
  }, []);

  if (initialLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#487D44" />
      </View>
    );
  }

  const openGallery = (): void => {
    const options: ImageLibraryOptions = {
      mediaType: "photo",
      quality: 1,
      selectionLimit: 1,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      console.log(
        "[ImagePicker] Raw response:",
        JSON.stringify(response, null, 2),
      );
      if (response.didCancel) {
        console.log("[ImagePicker] User cancelled");
      } else if (response.errorCode) {
        console.log(
          "[ImagePicker] Error:",
          response.errorCode,
          response.errorMessage,
        );
      } else {
        const asset = response.assets?.[0];
        if (asset) {
          console.log("[ImagePicker] Asset selected:");
          console.log("  uri    :", asset.uri);
          console.log("  type   :", asset.type);
          console.log("  name   :", asset.fileName);
          console.log("  size   :", asset.fileSize, "bytes");
          setImage(asset);
          handleUpdateProfile(asset);
        } else {
          console.log("[ImagePicker] No asset found in response");
        }
      }
    });
  };

  const handleUpdateProfile = async (selectedImage?: any) => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("userToken");
      console.log(
        "[Upload] Token:",
        token ? `${token.slice(0, 20)}...` : "NULL ❌",
      );

      const formData = new FormData();

      if (email) formData.append("email", email);
      if (name) formData.append("name", name);
      if (address) formData.append("address", address);

      const imageToUpload =
        selectedImage && selectedImage.uri ? selectedImage : image;

      if (imageToUpload && imageToUpload.uri) {
        const imagePayload = {
          uri: imageToUpload.uri,
          type: imageToUpload.type || "image/jpeg",
          name: imageToUpload.fileName || "profile.jpg",
        };
        console.log("[Upload] Appending image to FormData:", imagePayload);
        formData.append("image", imagePayload as any);
      } else {
        console.log(
          "[Upload] ⚠️ No image to upload. imageToUpload =",
          imageToUpload,
        );
      }

      console.log("[Upload] Sending POST to:", `${BASE_URL}/update-profile`);

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

      console.log("[Upload] ✅ Response status:", response.status);
      console.log(
        "[Upload] ✅ Response data:",
        JSON.stringify(response.data, null, 2),
      );

      if (response.data.error === false) {
        if (selectedImage) {
          Alert.alert("Success", "Profile photo updated.");
        } else {
          await getProfile();
          Alert.alert("Profile Updated", "Profile updated successfully");
        }
      } else {
        console.log("[Upload] ❌ Server returned error:", response.data);
        Alert.alert(
          "Profile Update Failed",
          JSON.stringify(response.data?.message || response.data),
        );
      }
    } catch (error: any) {
      console.log("[Upload] ❌ Exception caught:");
      console.log("  message :", error.message);
      console.log("  status  :", error.response?.status);
      console.log("  data    :", JSON.stringify(error.response?.data, null, 2));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        {/* Header */}
        <View
          style={[
            Styles.header,
            {
              backgroundColor: "#fff",
              padding: 16,
            },
          ]}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require("../assets/Common/Back.png")}
              style={Styles.headerImage}
            />
          </TouchableOpacity>

          <Text style={Styles.headerText}>Profile</Text>
        </View>
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Profile Info */}
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
                    ? { uri: typeof image === "string" ? image : image.uri }
                    : {
                        uri: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
                      }
                }
                style={styles.avatar}
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
              />

              <View style={styles.editIcon}>
                <Image
                  source={require("../assets/Common/camera.png")}
                  style={{ width: 14, height: 14, tintColor: "#fff" }}
                />
              </View>
            </TouchableOpacity>
            <Text style={styles.businessName}>
              {name ? name : "The Bulk Basket"}
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.row}>
              <View style={styles.inputHalf}>
                <Text style={styles.label}>Email ID</Text>
                <TextInput
                  style={styles.input}
                  placeholder="gourmet@bistro.in"
                  placeholderTextColor="#64748B"
                  value={email}
                  onChangeText={setEmail}
                  textAlign="left"
                  textAlignVertical="center"
                />
              </View>

              <View style={styles.inputHalf}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+91 98765 43210"
                  editable={false}
                  placeholderTextColor="#64748B"
                  value={number}
                  onChangeText={setNumber}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your Name"
                placeholderTextColor="#64748B"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              {/* <Text style={styles.label}>FSSAI Number (recommended)</Text> */}

              {/* <View style={styles.verifiedInput}>
              <TextInput
                style={styles.flexInput}
                placeholder="1 23 19 678 901234"
                placeholderTextColor="#64748B"
                keyboardType="number-pad"
                maxLength={14}
                value={fssai}
                onChangeText={setFssai}
              />

              <View style={styles.verifiedBadge}>
                <Image
                  source={require("../assets/Common/stick.png")}
                  style={{ height: 10, width: 10 }}
                  resizeMode="contain"
                />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View> */}

              <Text style={styles.label}>Address</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    height: 100,
                    textAlignVertical: "top",
                    paddingVertical: 10,
                  },
                ]}
                placeholder="Enter your address"
                placeholderTextColor="#64748B"
                multiline
                value={address}
                onChangeText={setAddress}
              />
              {/* <View
                style={{
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  backgroundColor: "#FFF",
                  padding: 14,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: "DMSans-Regular",
                    color: "#64748B",
                  }}
                >
                  {address}
                </Text>
              </View> */}
            </View>

            <Text style={styles.note}>
              *Must be the number as shown on your food license.
            </Text>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleUpdateProfile}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveText}>Update Profile</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default UpdateProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  /* Header */

  /* Profile Section */

  profileSection: {
    alignItems: "center",
    marginBottom: 25,
    marginTop: 10,
  },

  avatarWrapper: {
    position: "relative",
    marginBottom: 10,
    borderRadius: 20,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },

  editIcon: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
  },

  businessName: {
    fontSize: 18,
    fontFamily: "DMSans-SemiBold",
    color: "#111",
    width: "80%",
    textAlign: "center",
  },

  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
    fontFamily: "DMSans-Regular",
  },

  member: {
    fontSize: 12,
    color: "#487D44",
    marginTop: 4,
    fontFamily: "DMSans-Medium",
  },

  /* Form */

  form: {
    // backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  inputHalf: {
    width: "48%",
  },

  inputGroup: {
    marginTop: 15,
  },

  label: {
    fontSize: 14,
    marginBottom: 7,
    color: "#374151",
    fontFamily: "DMSans-Medium",
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    fontFamily: "DMSans-Regular",
    backgroundColor: "#FFF",
  },

  /* Verified Input */

  verifiedInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
  },

  flexInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: "DMSans-Regular",
    // backgroundColor: "#FFF",s
  },

  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6F4EA",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  verifiedText: {
    fontSize: 11,
    color: "#2E7D32",
    marginLeft: 4,
    fontFamily: "DMSans-Medium",
  },

  note: {
    fontSize: 12,
    color: "#000000",
    marginTop: 6,
    fontFamily: "DMSans-Regular",
  },

  /* Save Button */
  saveBtn: {
    backgroundColor: "#487D44",
    marginTop: 22,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  saveText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "DMSans-Medium",
  },
  loaderContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  imageLoader: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    zIndex: 1,
  },
});
