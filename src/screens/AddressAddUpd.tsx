import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  PermissionsAndroid,
  Platform,
  Modal,
  FlatList,
  KeyboardAvoidingView,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import Geolocation from "@react-native-community/geolocation";
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "../components/Styles";
import { saveAddressApi, getStatesApi, getDistrictsApi } from "../services/api";

// const API_KEY = "AIzaSyCNrGMPAmuBNYZYOTwgOgcYuvHT_G7AQgE";
const API_KEY = "AIzaSyBV3qwiKVCy9lq9l67nSOPGB-1Z9G5qLpo";

const AddressAddUpd = ({ navigation, route }: any) => {
  const mapRef = useRef<any>(null);

  const [region, setRegion] = useState({
    latitude: 30.7333,
    longitude: 76.7794,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [marker, setMarker] = useState({
    latitude: 30.7333,
    longitude: 76.7794,
  });

  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [pincode, setPincode] = useState("");
  const [addressId, setAddressId] = useState("");

  const [statesList, setStatesList] = useState<any[]>([]);
  const [districtsList, setDistrictsList] = useState<any[]>([]);
  const [showStateModal, setShowStateModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);

  React.useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    console.log("asdkljaskldjflkjldksfjklfdjlsd");

    try {
      const res = await getStatesApi();
      console.log("Fetch States Response:", res?.data);
      if (res?.data) {
        setStatesList(res.data);
      }
    } catch (e) {
      console.log("Fetch States Error:", e);
    }
  };

  const fetchDistricts = async (stateName: string) => {
    console.log("asdkljaskldjflkjldksfjklfdjlsd");

    try {
      console.log("Fetching Districts for state:", stateName);
      const res = await getDistrictsApi(stateName);
      console.log("District Response for state " + stateName + ":", res.data);

      if (res?.data) {
        setDistrictsList(res.data);
        console.log("Districts List:", res.data);
      }
    } catch (e) {
      console.log("Fetch Districts Error:", e);
    }
  };

  React.useEffect(() => {
    if (route.params?.addressData) {
      const data = route.params.addressData;
      setAddress(data.address || "");
      setState(data.state || "");
      setDistrict(data.city || "");
      setPincode(data.pincode || "");
      setAddressId(data.id || "");

      if (data.state) {
        fetchDistricts(data.state);
      }

      if (data.coordinates) {
        const [lat, lng] = data.coordinates.split(",");
        if (lat && lng) {
          const latitude = parseFloat(lat);
          const longitude = parseFloat(lng);

          setRegion({
            ...region,
            latitude,
            longitude,
          });

          setMarker({
            latitude,
            longitude,
          });

          // Optional: Add a small delay to ensure the map reference is ready
          setTimeout(() => {
            mapRef.current?.animateToRegion({
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          }, 500);
        }
      }
    }
  }, [route.params?.addressData]);

  const getCurrentLocation = async () => {
    const request = () => {
      Geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setRegion({
            ...region,
            latitude: lat,
            longitude: lng,
          });

          setMarker({
            latitude: lat,
            longitude: lng,
          });

          if (mapRef.current) {
            mapRef.current.animateToRegion({
              latitude: lat,
              longitude: lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          }

          getAddress(lat, lng);
        },
        (error) => {
          console.log("Geolocation error:", error.message);
          Alert.alert("Error", error.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
      );
    };

    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setTimeout(request, 1000);
        }
      } catch (err) {
        console.warn("Permission Request Error:", err);
      }
    } else {
      Geolocation.requestAuthorization();
      request();
    }
  };

  const mapAddress = async () => {
    if (!address && !district && !state) {
      Alert.alert("Error", "Please enter an address to map");
      return;
    }

    const query = `${address}, ${district}, ${state}, ${pincode}`.trim();

    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          query,
        )}&key=${API_KEY}`,
      );

      const json = await res.json();

      if (json.status === "OK" && json.results.length > 0) {
        const result = json.results[0];
        const lat = result.geometry.location.lat;
        const lng = result.geometry.location.lng;

        setRegion({
          ...region,
          latitude: lat,
          longitude: lng,
        });

        setMarker({
          latitude: lat,
          longitude: lng,
        });

        mapRef.current?.animateToRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } else {
        Alert.alert("Error", "Could not find coordinates for this address.");
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to fetch map coordinates.");
    }
  };

  const getAddress = async (lat: number, lng: number) => {
    try {
      console.log("Reverse Geocoding for:", lat, lng);
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`,
      );

      const json = await res.json();
      console.log("Geocoding Status:", json.status);

      if (json.status === "OK" && json.results && json.results.length > 0) {
        const result = json.results[0];
        console.log("Geocoding Result:", result.formatted_address);

        setAddress(result.formatted_address || "");

        let detectedState = "";
        let detectedDistrict = "";
        let detectedPincode = "";

        result.address_components.forEach((item: any) => {
          if (item.types.includes("locality"))
            detectedDistrict = item.long_name;
          if (item.types.includes("administrative_area_level_1"))
            detectedState = item.long_name;
          if (item.types.includes("postal_code"))
            detectedPincode = item.long_name;
        });

        console.log("Detected State:", detectedState);
        console.log("Detected District:", detectedDistrict);
        console.log("Detected Pincode:", detectedPincode);

        if (detectedDistrict) setDistrict(detectedDistrict);
        if (detectedPincode) setPincode(detectedPincode);
        if (detectedState) {
          setState(detectedState);
          // Find matched state name to fetch districts
          const stateObj = statesList.find(
            (s: any) =>
              (s.title || s.name || s.state_name || s.state)?.toLowerCase() ===
              detectedState.toLowerCase(),
          );
          console.log("Matched State Object:", stateObj);
          const matchedName = stateObj
            ? stateObj.title ||
              stateObj.name ||
              stateObj.state_name ||
              stateObj.state
            : detectedState;
          fetchDistricts(matchedName);
        }
      }
    } catch (error) {
      console.log("Get Address Error", error);
    }
  };

  const onMarkerDragEnd = (e: any) => {
    const lat = e.nativeEvent.coordinate.latitude;
    const lng = e.nativeEvent.coordinate.longitude;

    setMarker({
      latitude: lat,
      longitude: lng,
    });

    getAddress(lat, lng);
  };

  const [loading, setLoading] = useState(false);

  const handleSaveAddress = async () => {
    if (!address || !district || !state || !pincode) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);
      const data = {
        address_line_1: address,
        address_line_2: "",
        address: address,
        state: state,
        district: district,
        city: district,
        pincode: pincode,
        coordinates: `${marker.latitude},${marker.longitude}`,
        id: addressId,
      };

      const res = await saveAddressApi(data);
      if (res) {
        // Alert.alert("Success", "Address saved successfully.");
        navigation.goBack();
      }
    } catch (error) {
      console.log("Save Address Error", error);
      // Alert.alert("Error", "Failed to save address. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}

        <View style={[Styles.header, { padding: 16, backgroundColor: "#fff" }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require("../assets/Common/Back.png")}
              style={Styles.headerImage}
            />
          </TouchableOpacity>

          <Text style={Styles.headerText}>Add Address</Text>
        </View>

        {/* Main Scrolling Body */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            style={{
              flex: 1,
              ...Platform.select({ ios: { marginBottom: 20 } }),
            }}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Map */}
            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={region}
                onRegionChangeComplete={(newRegion) => {
                  setRegion(newRegion);
                  setMarker({
                    latitude: newRegion.latitude,
                    longitude: newRegion.longitude,
                  });
                  getAddress(newRegion.latitude, newRegion.longitude);
                }}
              />
              <View style={styles.markerFixed}>
                <Image
                  style={styles.marker}
                  source={require("../assets/Common/Location.png")}
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View
              style={{
                flexDirection: "row",
                paddingHorizontal: 16,
                marginTop: 16,
              }}
            >
              <TouchableOpacity
                style={[
                  styles.locationBtn,
                  { flex: 1, margin: 0, marginRight: 8 },
                ]}
                onPress={getCurrentLocation}
              >
                <Image
                  source={require("../assets/Common/navigation.png")}
                  style={{
                    height: 16,
                    width: 16,
                    tintColor: "#FFFFFF",
                  }}
                />
                <Text style={[styles.locationText, { fontSize: 11 }]}>
                  Current Location
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.locationBtn,
                  { flex: 1, margin: 0, backgroundColor: "#000" },
                ]}
                onPress={mapAddress}
              >
                <Image
                  source={require("../assets/Common/SLocation.png")}
                  style={[
                    Styles.headerImage,
                    { marginRight: 6, tintColor: "#fff" },
                  ]}
                  resizeMode="contain"
                />
                <Text style={[styles.locationText, { fontSize: 11 }]}>
                  Map Address
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <TextInput
                placeholder="Address"
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                textAlign="left"
                textAlignVertical="center"
                multiline={true}
                numberOfLines={2}
              />

              {/* State Dropdown Trigger */}
              <TouchableOpacity
                style={[styles.input, { justifyContent: "center" }]}
                onPress={() => setShowStateModal(true)}
              >
                <Text
                  style={{
                    color: state ? "#000" : "#9CA3AF",
                    fontFamily: "DMSans-Regular",
                  }}
                >
                  {state || "State"}
                </Text>
              </TouchableOpacity>

              {/* District Dropdown Trigger */}
              <TouchableOpacity
                style={[styles.input, { justifyContent: "center" }]}
                onPress={() => {
                  if (!state) {
                    Alert.alert("Error", "Please select a state first");
                    return;
                  }
                  console.log("Districts Data on Button Press:", districtsList);
                  setShowDistrictModal(true);
                }}
              >
                <Text
                  style={{
                    color: district ? "#000" : "#9CA3AF",
                    fontFamily: "DMSans-Regular",
                  }}
                >
                  {district || "District"}
                </Text>
              </TouchableOpacity>

              <TextInput
                placeholder="Pincode"
                style={styles.input}
                value={pincode}
                onChangeText={setPincode}
                keyboardType="numeric"
              />

              <TouchableOpacity
                style={[styles.saveBtn, loading && { opacity: 0.7 }]}
                onPress={handleSaveAddress}
                disabled={loading}
              >
                <Text style={styles.saveText}>
                  {loading ? "Saving..." : "Save Address"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* State Modal */}
            <Modal
              visible={showStateModal}
              animationType="slide"
              transparent={true}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                onPress={() => setShowStateModal(false)}
                activeOpacity={1}
              >
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select State</Text>
                  <FlatList
                    data={statesList}
                    keyExtractor={(item, index) =>
                      item?.id?.toString() || index.toString()
                    }
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.modalItem}
                        onPress={() => {
                          const selectedStateName =
                            item?.title ||
                            item?.name ||
                            item?.state_name ||
                            item?.state;
                          setState(selectedStateName);
                          setDistrict(""); // reset district when state changes
                          if (selectedStateName) {
                            fetchDistricts(selectedStateName);
                          }
                          setShowStateModal(false);
                        }}
                      >
                        <Text style={styles.modalItemText}>
                          {item?.title ||
                            item?.name ||
                            item?.state_name ||
                            item?.state}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </TouchableOpacity>
            </Modal>

            {/* District Modal */}
            <Modal
              visible={showDistrictModal}
              animationType="slide"
              transparent={true}
            >
              <TouchableOpacity
                style={styles.modalOverlay}
                onPress={() => setShowDistrictModal(false)}
                activeOpacity={1}
              >
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Select District</Text>
                  <FlatList
                    data={districtsList}
                    keyExtractor={(item, index) =>
                      item?.id?.toString() || index.toString()
                    }
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.modalItem}
                        onPress={() => {
                          const selectedDistrictName =
                            item?.city ||
                            item?.title ||
                            item?.name ||
                            item?.district_name ||
                            item?.district;
                          setDistrict(selectedDistrictName);
                          setShowDistrictModal(false);
                        }}
                      >
                        <Text style={styles.modalItemText}>
                          {item?.city ||
                            item?.title ||
                            item?.name ||
                            item?.district_name ||
                            item?.district}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </TouchableOpacity>
            </Modal>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

export default AddressAddUpd;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F6F8",
  },

  container: {
    flex: 1,
  },

  mapContainer: {
    height: 260,
    width: "100%",
    position: "relative",
  },

  map: {
    ...StyleSheet.absoluteFillObject,
  },

  markerFixed: {
    left: "50%",
    top: "50%",
    position: "absolute",
    marginLeft: -15, // Half of marker width
    marginTop: -30, // Full marker height to point at center
  },

  marker: {
    width: 30,
    height: 30,
    resizeMode: "contain",
  },

  locationBtn: {
    backgroundColor: "#487D44",
    margin: 16,
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  locationText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 14,
    fontFamily: "DMSans-Medium",
  },

  form: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontFamily: "DMSans-Regular",
  },

  saveBtn: {
    backgroundColor: "#487D44",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  saveText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "DMSans-Medium",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: "50%",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "DMSans-Medium",
    marginBottom: 12,
    alignSelf: "center",
  },
  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalItemText: {
    fontSize: 16,
    fontFamily: "DMSans-Regular",
    color: "#333",
  },
});
