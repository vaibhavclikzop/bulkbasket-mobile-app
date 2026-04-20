import React from 'react';
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
  ToastAndroid,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export interface ProductCardProps {
  image?: ImageSourcePropType | string;
  title?: string;
  packSize?: string;
  price?: string;
  bestRate?: string;
  oldPrice?: string;
  mrp?: string | number;
  discount?: string;
  isOrganic?: boolean;
  onAddPress?: () => void;
  onPress?: () => void;
  tiers?: any[];
  onTierAddPress?: (qty: number) => void;
  cart_status?: boolean | number | string;
  cartQty?: number | string;
  onUpdateQty?: (newQty: number | string) => void;
  updatingQty?: boolean;
  wishlist_status?: boolean;
  onWishlistPress?: () => void;
  containerStyle?: any;
  uom_name?: string;
  current_stock?: number | string;
}

const ProductCard: React.FC<ProductCardProps> = React.memo(
  ({
    image,
    title,
    packSize,
    price,
    bestRate,
    oldPrice,
    mrp,
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
    uom_name,
    current_stock,
  }) => {
    const isOutOfStock = Number(current_stock) === 0;
    const calculatedPrice = React.useMemo(() => {
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
    }, [price, cartQty, tiers]);

    const formatPrice = React.useCallback((value: any) => {
      const num = parseFloat(value);
      if (isNaN(num)) return '0';
      return Number.isInteger(num) ? String(num) : num.toFixed(2);
    }, []);

    return (
      <View
        style={[styles.cardContainer, containerStyle]}
      >
        <View style={styles.cardInner}>
          <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
            {/* Organic Ribbon */}
            {isOrganic && (
              <View style={styles.ribbonWrapper}>
                <LinearGradient
                  colors={['#487D44', '#12FF00']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.ribbonGradient}
                >
                  <Text style={styles.ribbonText}>Organic</Text>
                </LinearGradient>
              </View>
            )}

            {Number(discount) > 0 &&
              (Platform.OS === 'ios' ? (
                <View
                  style={[
                    {
                      backgroundColor: '#FAAF20',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      paddingLeft: 10,
                      paddingRight: 12,
                      height: 24,
                      justifyContent: 'center',
                      alignItems: 'center',
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
                      fontWeight: '600',
                      fontFamily: 'DMSans-Medium',
                      includeFontPadding: false,
                    }}
                  >
                    {discount}% OFF
                  </Text>
                </View>
              ) : (
                <LinearGradient
                  colors={['#FFDC61', '#FAAF20']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.discountBadge}
                >
                  <Text style={styles.discountText}>{discount}% OFF</Text>
                </LinearGradient>
              ))}

            {/* Image Section */}
            <View style={styles.imageContainer}>
              <Image
                source={
                  typeof image === 'string'
                    ? { uri: image }
                    : image || require('../assets/icons/sicon5.png')
                }
                // style={styles.image}
                style={[styles.image, isOutOfStock && { opacity: 0.4 }]}
              />
              {onWishlistPress && (
                <TouchableOpacity
                  onPress={onWishlistPress}
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    padding: 4,
                    zIndex: 10,
                  }}
                >
                  <Image
                    source={
                      wishlist_status
                        ? require('../assets/Common/fillheart.png')
                        : require('../assets/Common/heart.png')
                    }
                    style={{
                      height: 18,
                      width: 18,
                      resizeMode: 'contain',
                    }}
                  />
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>

          {/* Content */}
          <View style={[styles.content, isOutOfStock && { opacity: 0.6 }]}>
            <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
              <Text numberOfLines={2} style={styles.title}>
                {title}
              </Text>
              {uom_name ? (
                <Text style={styles.pack}>Pack of {uom_name}</Text>
              ) : null}
            </TouchableOpacity>
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
                          onPress={() => {
                            Vibration.vibrate(60);
                            !isOutOfStock &&
                              onTierAddPress &&
                              onTierAddPress(tier.qty);
                          }}
                          disabled={isOutOfStock}
                        >
                          <Text
                            style={[
                              styles.addSmall,
                              isOutOfStock && { color: '#A0A0A0' },
                            ]}
                          >
                            Add+
                          </Text>
                        </TouchableOpacity>
                      </View>
                      {!isLast && <View style={styles.dividerPrice} />}
                    </View>
                  );
                })}
              </View>
            )}

            {/* Bottom Price Section */}
            <View style={[styles.bottomRow, {}]}>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.price}>
                    ₹{formatPrice(calculatedPrice)}
                  </Text>
                  {Number(mrp) > 0 && Number(mrp) > Number(calculatedPrice) && (
                    <Text style={styles.oldPrice}>₹{formatPrice(mrp)}</Text>
                  )}
                </View>
                {bestRate ? (
                  <Text style={styles.bestRate}>{bestRate}</Text>
                ) : null}
              </View>

              {cart_status === true ||
              cart_status === 1 ||
              cart_status === '1' ? (
                <View style={styles.qtyRow}>
                  {updatingQty ? (
                    <ActivityIndicator size="small" color="#487D44" />
                  ) : (
                    <>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => {
                          Vibration.vibrate(60);
                          onUpdateQty && onUpdateQty(Number(cartQty || 0) - 1);
                        }}
                      >
                        <Text style={styles.qtyText}>-</Text>
                      </TouchableOpacity>

                      <TextInput
                        style={styles.qtyNumber}
                        keyboardType="numeric"
                        maxLength={5}
                        value={
                          cartQty !== undefined && cartQty !== null
                            ? String(cartQty)
                            : ''
                        }
                        onChangeText={text => {
                          const val = text.replace(/[^0-9]/g, '');
                          if (val !== '') {
                            let num = Number(val);
                            if (num > 10000) {
                              num = 10000;
                              if (Platform.OS === 'android') {
                                ToastAndroid.show(
                                  'Maximum quantity is 10,000',
                                  ToastAndroid.SHORT,
                                );
                              } else {
                                Alert.alert(
                                  'Maximum Limit',
                                  'Maximum quantity is 10,000',
                                );
                              }
                            }
                            onUpdateQty && onUpdateQty(num);
                          } else {
                            onUpdateQty && onUpdateQty('');
                          }
                        }}
                        onBlur={() => {
                          if (
                            cartQty === undefined ||
                            cartQty === null ||
                            cartQty === '' ||
                            Number(cartQty) === 0
                          ) {
                            onUpdateQty && onUpdateQty(1);
                          }
                        }}
                      />

                      <TouchableOpacity
                        style={[
                          styles.qtyBtn,
                          isOutOfStock && { backgroundColor: '#A0A0A0' },
                        ]}
                        onPress={() => {
                          Vibration.vibrate(60);
                            onUpdateQty &&
                            onUpdateQty(Number(cartQty || 0) + 1);
                        }}
                        disabled={isOutOfStock}
                      >
                        <Text style={styles.qtyText}>+</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              ) : isOutOfStock ? (
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    {
                      backgroundColor: 'transparent',
                      borderWidth: 1,
                      borderColor: '#EF4444',
                    },
                  ]}
                  onPress={onPress}
                >
                  <Text style={[styles.addText, { color: '#EF4444' }]}>
                    Out Of Stock
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => {
                    Vibration.vibrate(60);
                    onAddPress && onAddPress();
                  }}
                >
                  <Text style={styles.addText}>Add</Text>
                  <Image
                    source={require('../assets/Common/cart.png')}
                    style={styles.addImage}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  },
);

export default ProductCard;

const styles = StyleSheet.create({
  cardContainer: {
    width: 175,
    height: 280,
    marginHorizontal: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardInner: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  addImage: {
    height: 12,
    width: 12,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  imageContainer: {
    height: 110,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },

  image: {
    marginTop: 7,
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },

  content: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'DMSans-Medium',
    width: '100%',
  },

  pack: {
    color: '#6b7280',
    // marginVertical: 6,
    fontSize: 10,
    fontFamily: 'DMSans-Regular',
  },

  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 5,
  },

  dividerPrice: {
    height: 1,
    backgroundColor: '#b2b3b880',
    marginVertical: 5,
  },

  slabPrice: {
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
  },

  variantBox: {
    backgroundColor: '#e5e7eb',
    borderColor: '#b2b3b880',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },

  variantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },

  addSmall: {
    fontSize: 12,
    color: 'green',
    fontWeight: '600',
    fontFamily: 'DMSans-Medium',
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    flexWrap: 'nowrap',
  },

  price: {
    fontSize: 12,
    fontFamily: 'DMSans-Medium',
  },

  oldPrice: {
    textDecorationLine: 'line-through',
    color: '#FF7878',
    fontFamily: 'DMSans',
    fontSize: 10,
    marginLeft: 6,
  },

  bestRate: {
    color: 'green',
    fontSize: 8,
    marginTop: 2,
    fontFamily: 'DMSans-Regular',
  },

  addButton: {
    backgroundColor: '#487D44',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  addText: {
    color: '#fff',
    marginRight: 4,
    fontFamily: 'DMSans-Regular',
    fontSize: 9,
    fontWeight: '600',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    backgroundColor: '#E8F3E8',
  },
  qtyBtn: {
    width: 17,
    height: 17,
    borderRadius: 11,
    backgroundColor: '#487D44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'DMSans-Medium',
  },
  qtyNumber: {
    marginHorizontal: 6,
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
    color: '#487D44',
    paddingVertical: 5,
  },

  discountBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingLeft: 10,
    paddingRight: Platform.OS === 'ios' ? 22 : 12,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 8,
    zIndex: 10,
  },
  discountText: {
    fontWeight: '600',
    fontFamily: 'DMSans-Medium',
    fontSize: 8,
    color: '#000000',
    marginTop: Platform.OS === 'ios' ? 3 : 0,
    includeFontPadding: false,
  },

  ribbonWrapper: {
    position: 'absolute',
    top: 12,
    left: -38,
    width: 130,
    height: 20,
    transform: [{ rotate: '-45deg' }],
    overflow: 'hidden',
    zIndex: 10,
  },
  ribbonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  ribbonText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontFamily: 'DMSans-SemiBold',
    textAlign: 'center',
  },
});
