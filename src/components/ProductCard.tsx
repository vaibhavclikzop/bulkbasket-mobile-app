import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
  TextInput,
  ActivityIndicator,
  Platform,
  Vibration,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";

export interface ProductCardProps {
  image?: ImageSourcePropType | string;
  title?: string;
  packSize?: string;
  price?: string;
  bestRate?: string;
  oldPrice?: string;
  discount?: string;
  isOrganic?: boolean;
  product_type?: string;
  onAddPress?: () => void;
  onPress?: () => void;
  tiers?: any[];
  onTierAddPress?: (qty: number) => void;
  cart_status?: boolean | number | string;
  cartQty?: number;
  onUpdateQty?: (newQty: number) => void;
  updatingQty?: boolean;
  wishlist_status?: boolean;
  onWishlistPress?: () => void;
  containerStyle?: any;
  current_stock?: string | number;
  uom_name?: string;
  mrp?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  image,
  title,
  packSize,
  price,
  bestRate,
  oldPrice,
  discount,
  isOrganic,
  product_type,
  onAddPress,
  onPress,
  tiers,
  onTierAddPress,
  cart_status,
  cartQty,
  onUpdateQty,
  updatingQty,
  wishlist_status,
  onWishlistPress,
  containerStyle,
  current_stock,
  uom_name,
  mrp,
}) => {
  const getCalculatedPrice = () => {
    let currentPrice = price;
    const currentQty = cartQty || 0;

    if (tiers && tiers.length > 0) {
      const sortedTiers = [...tiers].sort((a, b) => b.qty - a.qty);
      for (const tier of sortedTiers) {
        if (currentQty >= tier.qty) {
          currentPrice = tier.price;
          break;
        }
      }
    }
    return currentPrice;
  };

  const formatPrice = (value: any) => {
    const num = parseFloat(value);
    return Number.isInteger(num) ? num : num.toFixed(2);
  };

  const capitalizeWords = (text: string) =>
    text
      ? text
          .toLowerCase()
          .replace(/[_-]/g, " ")
          .split(" ")
          .filter(Boolean)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
      : "";


const getActiveTier = () => {
  if (!tiers || tiers.length === 0) return null;

  const currentQty = Number(cartQty || 0);
  const sortedTiers = [...tiers].sort((a, b) => a.qty - b.qty);

  let active = null;

  for (const tier of sortedTiers) {
    if (currentQty >= tier.qty) {
      active = tier;
    }
  }

  return active;
};

  return (
    <View style={[styles.cardContainer, containerStyle]}>
      <View style={styles.cardInner}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        {/* Ribbon */}
        {product_type ? (
          <View style={styles.ribbonWrapper}>
            <LinearGradient
              colors={["#487D44", "#12FF00"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ribbonGradient}
            >
              <Text style={styles.ribbonText}>{product_type}</Text>
            </LinearGradient>
          </View>
        ) : isOrganic ? (
          <View style={styles.ribbonWrapper}>
            <LinearGradient
              colors={["#487D44", "#12FF00"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ribbonGradient}
            >
              <Text style={styles.ribbonText}>Organic</Text>
            </LinearGradient>
          </View>
        ) : null}

        {/* {Number(discount) > 0 &&
          (Platform.OS === "ios" ? (
            <View
              style={[
                {
                  backgroundColor: "#FAAF20",
                  position: "absolute",
                  top: 0,
                  right: 0,
                  paddingLeft: 10,
                  paddingRight: 12,
                  height: 24,
                  justifyContent: "center",
                  alignItems: "center",
                  borderTopRightRadius: 20,
                  borderBottomLeftRadius: 8,
                  zIndex: 10,
                },
              ]}
            >
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 8,
                  fontWeight: "600",
                  fontFamily: "DMSans-Medium",
                  includeFontPadding: false,
                  // marginTop: 3,
                }}
              >
                {discount}% OFF
              </Text>
            </View>
          ) : (
            <LinearGradient
              colors={["#FFDC61", "#FAAF20"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.discountBadge}
            >
              <Text style={styles.discountText}>{discount}% OFF</Text>
            </LinearGradient>
          ))} */}
        {/* Stock / Discount Badge */}
        {Number(current_stock) === 0 ? (
          <LinearGradient
            colors={["#FF4D4D", "#B30000"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.discountBadge}
          >
            <Text style={[styles.discountText, { color: "#fff" }]}>
              Out of Stock
            </Text>
          </LinearGradient>
        ) : (
          Number(discount) > 0 &&
          (Platform.OS === "ios" ? (
            <View
              style={{
                backgroundColor: "#FAAF20",
                position: "absolute",
                top: 0,
                right: 0,
                paddingLeft: 10,
                paddingRight: 12,
                height: 24,
                justifyContent: "center",
                alignItems: "center",
                borderTopRightRadius: 20,
                borderBottomLeftRadius: 8,
                zIndex: 10,
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 8,
                  fontWeight: "600",
                  fontFamily: "DMSans-Medium",
                }}
              >
                {discount}% OFF
              </Text>
            </View>
          ) : (
            <LinearGradient
              colors={["#FFDC61", "#FAAF20"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.discountBadge}
            >
              <Text style={styles.discountText}>{discount}% OFF</Text>
            </LinearGradient>
          ))
        )}
        {/* Image Section */}
        <View style={styles.imageContainer}>
          {/* <Image
            source={image ? image : require("../assets/icons/sicon5.png")}
            style={styles.image}
          /> */}
          <Image
            source={
              typeof image === "string"
                ? { uri: image }
                : image || require("../assets/icons/sicon5.png")
            }
            style={styles.image}
          />
          {onWishlistPress && (
            <TouchableOpacity
              onPress={onWishlistPress}
              style={{
                position: "absolute",
                bottom: 8,
                right: 8,
                padding: 4,
                zIndex: 10,
              }}
            >
              <Image
                source={
                  wishlist_status
                    ? require("../assets/Common/fillheart.png")
                    : require("../assets/Common/heart.png")
                }
                style={{
                  height: 18,
                  width: 18,
                  resizeMode: "contain",
                }}
              />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
          <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
            <Text numberOfLines={2} style={styles.title}>
              {capitalizeWords(title || "")}
            </Text>
            {uom_name ? <Text style={styles.pack}>{uom_name}</Text> : null}
            {/* {packSize !== "" && (
              <Text style={styles.pack}>Pack of {packSize}</Text>
            )} */}
            <View style={styles.divider} />
          </TouchableOpacity>

            {/* Variant Box */}
            {/* {tiers && tiers.length > 0 && (
              <View style={styles.variantBox}>
                {tiers.map((tier: any, index: number) => {
                  const isLast = index === tiers.length - 1;
                  return (
                    <View key={index}>
                      <View style={styles.variantRow}>
                        <Text style={styles.slabPrice}>
                          {tier.qty} Pc ₹{tier.price}/pc
                        </Text>
                      
                        <TouchableOpacity
                          onPress={() =>
                            onTierAddPress && onTierAddPress(tier.qty)
                          }
                          disabled={Number(current_stock) === 0}
                        >
                          {Number(cartQty || 0) >= Number(tier.qty) ? (
                            <Image
                              source={require("../assets/check.png")}
                              style={{
                                height: 16,
                                width: 16,
                                tintColor: "#487D44",
                              }}
                            />
                          ) : (
                            <Text
                              style={[
                                styles.addSmall,
                                Number(current_stock) === 0 && {
                                  color: "#A0A0A0",
                                },
                              ]}
                            >
                              Add+
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                      {!isLast && <View style={styles.dividerPrice} />}
                    </View>
                  );
                })}
              </View>
            )} */}
         
            {/* {tiers && tiers.length > 0 && (
              <View style={styles.variantBox}>
                
                {tiers.map((tier: any, index: number) => {
                  const isLast = index === tiers.length - 1;

                   const activeTier = getActiveTier();

                  return (
                    <View key={index}>
                      <View style={styles.variantRow}>
                        <Text style={styles.slabPrice}>
                          {tier.qty} Pc ₹{tier.price}/pc
                        </Text>

                        <TouchableOpacity
                          onPress={() =>
                            onTierAddPress && onTierAddPress(tier.qty)
                          }
                          disabled={Number(current_stock) === 0}
                        >
                          {isSelected ? (
                            <Image
                              source={require("../assets/check.png")}
                              style={{
                                height: 16,
                                width: 16,
                                tintColor: "#487D44",
                              }}
                            />
                          ) : (
                            <Text
                              style={[
                                styles.addSmall,
                                Number(current_stock) === 0 && {
                                  color: "#A0A0A0",
                                },
                              ]}
                            >
                              Add+
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>

                      {!isLast && <View style={styles.dividerPrice} />}
                    </View>
                  );
                })}
              </View>
            )} */}
            {tiers && tiers.length > 0 && (
  <View style={styles.variantBox}>
    {(() => {
      return tiers.map((tier: any, index: number) => {
        const isLast = index === tiers.length - 1;
        const isSelected = Number(cartQty || 0) >= tier.qty; // ✅ Tick all satisfied tiers

        return (
          <View key={index}>
            <View style={styles.variantRow}>
              <Text style={styles.slabPrice}>
                {tier.qty} Pc ₹{tier.price}/pc
              </Text>

              <TouchableOpacity
                onPress={() => {
                  Vibration.vibrate(10);
                  onTierAddPress && onTierAddPress(tier.qty);
                }}
                disabled={Number(current_stock) === 0}
              >
                {isSelected ? (
                  <Image
                    source={require("../assets/check.png")}
                    style={{
                      height: 16,
                      width: 16,
                      tintColor: "#487D44",
                    }}
                  />
                ) : (
                  <Text
                    style={[
                      styles.addSmall,
                      Number(current_stock) === 0 && {
                        color: "#A0A0A0",
                      },
                    ]}
                  >
                    Add+
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {!isLast && <View style={styles.dividerPrice} />}
          </View>
        );
      });
    })()}
  </View>
)}

          {/* Bottom Price Section */}
          <View style={[styles.bottomRow, {}]}>
            <View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.price}>
                  ₹{formatPrice(getCalculatedPrice())}
                </Text>

                {/* {Number(mrp) > Number(getCalculatedPrice()) && (
                  <Text style={styles.oldPrice}>₹{formatPrice(mrp)}</Text>
                )} */}

                {Number(oldPrice) > 0 && (
                  <Text style={styles.oldPrice}>₹{formatPrice(oldPrice)}</Text>
                )}
              </View>
              {bestRate ? (
                <Text style={styles.bestRate}>{bestRate}</Text>
              ) : null}
            </View>

            {cart_status === true ||
            cart_status === 1 ||
            cart_status === "1" ? (
              <View style={[styles.qtyRow, updatingQty && { opacity: 0.5 }]}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => {
                    Vibration.vibrate(10);
                    onUpdateQty && onUpdateQty((cartQty || 0) - 1);
                  }}
                  disabled={updatingQty}
                >
                  <Text style={styles.qtyText}>-</Text>
                </TouchableOpacity>

                <TextInput
                  style={styles.qtyNumber}
                  keyboardType="numeric"
                  maxLength={4}
                  value={
                    cartQty !== undefined && cartQty !== null
                      ? String(cartQty)
                      : ""
                  }
                  onChangeText={(text) => {
                    const val = text.replace(/[^0-9]/g, "");
                    if (onUpdateQty) {
                      onUpdateQty(val === "" ? 0 : Number(val));
                    }
                  }}
                  editable={!updatingQty}
                />

                <TouchableOpacity
                  style={[
                    styles.qtyBtn,
                    Number(current_stock) === 0 && {
                      backgroundColor: "#A0A0A0",
                    },
                  ]}
                  onPress={() => {
                    Vibration.vibrate(10);
                    onUpdateQty && onUpdateQty((cartQty || 0) + 1);
                  }}
                  disabled={updatingQty || Number(current_stock) === 0}
                >
                  <Text style={styles.qtyText}>+</Text>
                </TouchableOpacity>
              </View>
            ) : Number(current_stock) === 0 ? (
              <View
                style={[
                  styles.addButton,
                  { backgroundColor: "#A0A0A0", paddingHorizontal: 8 },
                ]}
              >
                <Text style={styles.addText}>Out of Stock</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  Vibration.vibrate(10);
                  onAddPress && onAddPress();
                }}
              >
                <Text style={styles.addText}>Add</Text>
                <Image
                  source={require("../assets/Common/cart.png")}
                  style={styles.addImage}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  cardContainer: {
    width: 175,
    height: 280,
    marginHorizontal: 10,
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardInner: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
  },
  addImage: {
    height: 12,
    width: 12,
    resizeMode: "contain",
    tintColor: "#fff",
  },
  imageContainer: {
    height: 120,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    marginTop: 7,
    width: 80,
    height: 80,
    resizeMode: "contain",
  },

  content: {
    padding: 10,
    flex: 1,
    justifyContent: "space-between",
  },

  title: {
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "DMSans-Medium",
    width: "100%",
  },

  pack: {
    color: "#6b7280",
    // marginVertical: 6,
    fontSize: 10,
    fontFamily: "DMSans-Regular",
  },

  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 5,
  },

  dividerPrice: {
    height: 1,
    backgroundColor: "#b2b3b880",
    marginVertical: 5,
  },

  slabPrice: {
    fontSize: 12,
    fontFamily: "DMSans-Regular",
  },

  variantBox: {
    backgroundColor: "#e5e7eb",
    borderColor: "#b2b3b880",
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },

  variantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },

  addSmall: {
    fontSize: 12,
    color: "green",
    fontWeight: "600",
    fontFamily: "DMSans-Medium",
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    flexWrap: "nowrap",
  },

  price: {
    fontSize: 13,
    fontFamily: "DMSans-SemiBold",
    fontWeight: "600",
  },

  oldPrice: {
    textDecorationLine: "line-through",
    color: "#FF7878",
    fontFamily: "DMSans",
    fontSize: 10,
    marginLeft: 6,
  },

  bestRate: {
    color: "green",
    fontSize: 8,
    marginTop: 2,
    fontFamily: "DMSans-Regular",
  },

  addButton: {
    backgroundColor: "#487D44",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  addText: {
    color: "#fff",
    marginRight: 4,
    fontFamily: "DMSans-Regular",
    fontSize: 10,
    fontWeight: "400",
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    backgroundColor: "#E8F3E8",
  },
  qtyBtn: {
    width: 17,
    height: 17,
    borderRadius: 11,
    backgroundColor: "#487D44",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "DMSans-Medium",
  },
  qtyNumber: {
    marginHorizontal: 6,
    fontWeight: "600",
    fontSize: 14,
    fontFamily: "DMSans-Medium",
    color: "#487D44",
    paddingVertical: 5,
  },

  discountBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingLeft: 10,
    paddingRight: Platform.OS === "ios" ? 22 : 12,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 8,
    zIndex: 10,
  },
  discountText: {
    fontWeight: "600",
    fontFamily: "DMSans-Medium",
    fontSize: 8,
    color: "#000000",
    marginTop: Platform.OS === "ios" ? 3 : 0,
    includeFontPadding: false,
  },

  ribbonWrapper: {
    position: "absolute",
    top: 12,
    left: -38,
    width: 130,
    height: 20,
    transform: [{ rotate: "-45deg" }],
    overflow: "hidden",
    zIndex: 10,
  },
  ribbonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  ribbonText: {
    color: "#FFFFFF",
    fontSize: 7,
    fontFamily: "DMSans-SemiBold",
    textAlign: "center",
  },
});
