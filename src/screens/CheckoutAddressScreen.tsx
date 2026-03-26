import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Styles from "../components/Styles";
import Header from "../components/Header";
import {
  getAddressApi,
  updateDefaultAddressApi,
  deleteAddressApi,
} from "../services/api";
import { useFocusEffect } from "@react-navigation/native";

const CheckoutAddressScreen = ({ navigation, route }: any) => {
  const delivery_date = route?.params?.delivery_date;
  const delivery_instruction = route?.params?.delivery_instruction;
  const isCheckoutFlow = !!delivery_date;
  const [selected, setSelected] = useState<number | string>(1);
  const [addressList, setAddressList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState<number | string | null>(
    null,
  );

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await getAddressApi();
      console.log("Address", res);

      if (res?.data) {
        setAddressList(res.data);
        const defaultAddr = res.data.find(
          (addr: any) => addr.default_status === 1,
        );
        if (defaultAddr) {
          setSelected(defaultAddr.id);
        }
      }
    } catch (error) {
      console.log("Fetch Address Error", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchAddresses();
      setActiveMenuId(null);
    }, []),
  );

  const handleSetDefault = async (id: string | number, address?: any) => {
    try {
      setSelected(id);
      // console.log("Selected Address:", address);

      const res = await updateDefaultAddressApi(id);
      console.log("handleSetDefault", res);
      // Alert.alert("Success", "Address updated successfully");
    } catch (error) {
      console.log("Set Default Error:", error);
    }
  };

  const toggleMenu = (id: string | number) => {
    setActiveMenuId((prev) => (prev === id ? null : id));
  };

  const handleDelete = (id: string | number) => {
    Alert.alert(
      "Delete Address",
      "Are you sure you want to delete this address?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const res = await deleteAddressApi(id);
              // console.log("Delete Address", res);

              if (res) {
                Alert.alert("Success", "Address deleted successfully");
                fetchAddresses();
              }
            } catch (error) {
              console.log("Delete error", error);
              Alert.alert("Error", "Failed to delete address");
            } finally {
              setLoading(false);
              setActiveMenuId(null);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <Header title="Addresses" backgroundColor="#fff" />

        {/* Add Address Button */}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            if (activeMenuId !== null) {
              setActiveMenuId(null);
            }
            navigation.navigate("AddressAddUpd");
          }}
        >
          <Image
            source={require("../assets/Common/plus.png")}
            style={[Styles.headerImage, { marginTop: 2, tintColor: "#fff" }]}
          />
          <Text style={styles.addText}>Add New Address</Text>
        </TouchableOpacity>

        {/* Address List */}
        {loading ? (
          <View style={{ marginTop: 20, alignItems: "center" }}>
            <Text style={[styles.NoAddressText, { color: "#000" }]}>
              Loading Addresses...
            </Text>
          </View>
        ) : addressList.length === 0 ? (
          <View style={styles.Emptycontainer}>
            <Text style={styles.NoAddressText}>No addresses found.</Text>
          </View>
        ) : (
          <FlatList
            data={addressList}
            keyExtractor={(item: any) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            onScrollBeginDrag={() => setActiveMenuId(null)}
            renderItem={({ item }: { item: any }) => {
              const active = selected === item.id;

              const addressTextLines = [item.address, item.state]
                .filter(Boolean)
                .join(", ");

              return (
                <TouchableOpacity
                  style={[
                    styles.card,
                    active && styles.activeCard,
                    activeMenuId === item.id && { zIndex: 1000, elevation: 10 },
                  ]}
                  onPress={() => {
                    console.log("Pressed Address:", item);
                    handleSetDefault(item.id);
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    {/* Left Content */}
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <View style={styles.titleRow}>
                        <Image
                          source={require("../assets/Common/SLocation.png")}
                          style={[Styles.headerImage, { marginRight: 6 }]}
                          resizeMode="contain"
                        />

                        <Text style={styles.city}>
                          {item.city || "Address"}
                        </Text>
                      </View>

                      <Text style={styles.address}>{addressTextLines}</Text>

                      <TouchableOpacity
                        onPress={() => {
                          if (activeMenuId !== null) {
                            setActiveMenuId(null);
                            return;
                          }
                          navigation.navigate("AddressAddUpd", {
                            addressData: item,
                          });
                        }}
                      >
                        <Text style={styles.mapLink}>View on Map</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Right Side */}
                    <View
                      style={{
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                      }}
                    >
                      {/* Radio */}

                      <TouchableOpacity
                        style={[
                          styles.radioOuter,
                          active && styles.radioOuterActive,
                        ]}
                        onPress={() => {
                          if (activeMenuId !== null) {
                            setActiveMenuId(null);
                            return;
                          }
                          handleSetDefault(item.id);
                        }}
                        activeOpacity={0.7}
                      >
                        {active && <View style={styles.radioInner} />}
                      </TouchableOpacity>

                      {/* Menu */}
                      <View style={{ position: "relative" }}>
                        <TouchableOpacity onPress={() => toggleMenu(item.id)}>
                          <Image
                            source={require("../assets/Common/dots.png")}
                            style={[Styles.headerImage]}
                            resizeMode="contain"
                          />
                        </TouchableOpacity>

                        {/* Dropdown Menu */}
                        {activeMenuId === item.id && (
                          <View style={styles.dropdownMenu}>
                            <TouchableOpacity
                              style={styles.dropdownItem}
                              onPress={() => {
                                toggleMenu(item.id);
                                navigation.navigate("AddressAddUpd", {
                                  addressData: item,
                                });
                              }}
                            >
                              <Image
                                source={require("../assets/Common/edit.png")}
                                style={{ height: 16, width: 16 }}
                                resizeMode="contain"
                              />

                              <Text style={styles.dropdownText}>Edit</Text>
                            </TouchableOpacity>
                            <View
                              style={{ height: 1, backgroundColor: "#ccc" }}
                            />
                            <TouchableOpacity
                              style={styles.dropdownItem}
                              onPress={() => handleDelete(item.id)}
                            >
                              <Image
                                source={require("../assets/Common/trash.png")}
                                style={{
                                  height: 16,
                                  width: 16,
                                  tintColor: "#DC2626",
                                }}
                                resizeMode="contain"
                              />
                              <Text
                                style={[
                                  styles.dropdownText,
                                  { color: "#DC2626" },
                                ]}
                              >
                                Delete
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>

      {/* Proceed to Payment — only shown when arriving from CheckoutScreen */}
      {isCheckoutFlow && (
        <TouchableOpacity
          style={styles.proceedBtn}
          onPress={() => {
            const activeAddress = addressList.find(
              (a: any) => a.id === selected,
            );

            if (!activeAddress) {
              Alert.alert("Required", "Please select an address");
              return;
            }

            navigation.navigate("PaymentScreen", {
              delivery_date,
              delivery_instruction,
              address_id: activeAddress.id,
              state: activeAddress.state,
              district: activeAddress.district,
              city: activeAddress.city,
              pincode: activeAddress.pincode,
            });
          }}
        >
          <Text style={styles.proceedText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default CheckoutAddressScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F6F8",
  },

  container: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 999,
  },
  addBtn: {
    backgroundColor: "#487D44",
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  addText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
    fontFamily: "DMSans-Medium",
  },
  NoAddressText: {
    color: "#000000",
    fontSize: 16,
    textAlign: "center",
    fontFamily: "DMSans-Medium",
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  activeCard: {
    borderColor: "#487D44",
    backgroundColor: "#F6FBF6",
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  city: {
    fontSize: 16,
    fontFamily: "DMSans-Regular",
  },

  address: {
    fontSize: 12,
    color: "#64748B",
    fontFamily: "DMSans-Regular",
    marginTop: 4,
    lineHeight: 18,
  },
  Emptycontainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  mapLink: {
    color: "#487D44",
    fontSize: 14,
    marginTop: 8,
    fontFamily: "DMSans-Regular",
    textDecorationLine: "underline",
  },

  radio: {
    width: 18,
    height: 18,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
  },

  radioActive: {
    backgroundColor: "#487D44",
    borderColor: "#487D44",
  },
  cardItem: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },

  radioOuterActive: {
    borderColor: "#487D44",
  },

  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#487D44",
  },
  dropdownMenu: {
    position: "absolute",
    right: 0,
    top: 25,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 4,
    width: 110,
    elevation: 20,
    zIndex: 2000,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dropdownText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    color: "#4B5563",
  },

  proceedBtn: {
    backgroundColor: "#487D44",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    position: "absolute",
    bottom: 30,
    left: 15,
    right: 15,
  },

  proceedText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "DMSans-Medium",
  },
});
