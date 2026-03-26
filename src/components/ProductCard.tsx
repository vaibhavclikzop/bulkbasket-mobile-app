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
} from "react-native";
import LinearGradient from "react-native-linear-gradient";

export interface ProductCardProps {
  image: ImageSourcePropType;
  title: string;
  packSize: string;
  price: string;
  bestRate: string;
  oldPrice?: string;
  discount?: string;
  isOrganic?: boolean;
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

  return (
    <TouchableOpacity
      style={[styles.cardContainer, containerStyle]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.cardInner}>
        {/* Organic Ribbon */}
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

        {Platform.OS === "ios" ? (
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
        )}

        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image
            source={image ? image : require("../assets/icons/sicon5.png")}
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

        {/* Content */}
        <View style={styles.content}>
          <View>
            <Text numberOfLines={2} style={styles.title}>
              {title}
            </Text>
            {/* {packSize !== "" && (
              <Text style={styles.pack}>Pack of {packSize}</Text>
            )} */}
            <View style={styles.divider} />

            {/* Variant Box */}
            {tiers && tiers.length > 0 && (
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
                        >
                          <Text style={styles.addSmall}>Add+</Text>
                        </TouchableOpacity>
                      </View>
                      {!isLast && <View style={styles.dividerPrice} />}
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Bottom Price Section */}
          <View style={[styles.bottomRow, {}]}>
            <View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.price}>
                  ₹{formatPrice(getCalculatedPrice())}
                </Text>
                <Text style={styles.oldPrice}>₹{formatPrice(oldPrice)}</Text>
              </View>
              {bestRate ? (
                <Text style={styles.bestRate}>{bestRate}</Text>
              ) : null}
            </View>

            {cart_status === true ||
            cart_status === 1 ||
            cart_status === "1" ? (
              <View style={styles.qtyRow}>
                {updatingQty ? (
                  <ActivityIndicator size="small" color="#487D44" />
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() =>
                        onUpdateQty && onUpdateQty((cartQty || 0) - 1)
                      }
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
                    />

                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() =>
                        onUpdateQty && onUpdateQty((cartQty || 0) + 1)
                      }
                    >
                      <Text style={styles.qtyText}>+</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            ) : (
              <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
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
    </TouchableOpacity>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  cardContainer: {
    width: 175,
    height: 280,
    margin: 10,
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
    fontWeight: "600",
    fontFamily: "DMSans-Medium",
    width: "100%",
  },

  pack: {
    color: "#6b7280",
    marginVertical: 6,
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
    fontSize: 10,
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
    fontSize: 10,
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
    fontSize: 12,
    fontFamily: "DMSans-Medium",
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
    fontSize: 9,
    fontWeight: "600",
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
    fontSize: 8,
    fontFamily: "DMSans-SemiBold",
    textAlign: "center",
  },
});
