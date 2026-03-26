import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Styles from "./Styles";

interface HeaderProps {
  title?: string;
  backgroundColor?: string;
  showBack?: boolean;
  centerComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  onBackPress?: () => void;
  containerStyle?: ViewStyle;
}

const Header: React.FC<HeaderProps> = ({
  title,
  backgroundColor = "transparent",
  showBack = true,
  centerComponent,
  rightComponent,
  onBackPress,
  containerStyle,
}) => {
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.headerContainer, { backgroundColor }, containerStyle]}>
      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity
            onPress={handleBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.backButton}
          >
            <Image
              source={require("../assets/Common/Back.png")}
              style={Styles.headerImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
        {centerComponent ? (
          centerComponent
        ) : title ? (
          <Text style={Styles.headerText} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
      </View>
      {rightComponent && (
        <View style={styles.rightSection}>{rightComponent}</View>
      )}
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 60,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: "100%",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 15,
  },
  backButton: {},
  rightSection: {
    marginLeft: 10,
  },
});
