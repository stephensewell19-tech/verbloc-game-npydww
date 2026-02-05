import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  useColorScheme,
  ViewStyle,
  Modal as RNModal,
  View,
  TouchableOpacity,
} from "react-native";
import { appleBlue, zincColors } from "@/constants/Colors";

type ButtonVariant = "filled" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps {
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  variant = "filled",
  size = "md",
  disabled = false,
  loading = false,
  children,
  style,
  textStyle,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const sizeStyles: Record<
    ButtonSize,
    { height: number; fontSize: number; padding: number }
  > = {
    sm: { height: 36, fontSize: 14, padding: 12 },
    md: { height: 44, fontSize: 16, padding: 16 },
    lg: { height: 55, fontSize: 18, padding: 20 },
  };

  const getVariantStyle = () => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    };

    switch (variant) {
      case "filled":
        return {
          ...baseStyle,
          backgroundColor: isDark ? zincColors[50] : zincColors[900],
        };
      case "outline":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
          borderWidth: 1,
          borderColor: isDark ? zincColors[700] : zincColors[300],
        };
      case "ghost":
        return {
          ...baseStyle,
          backgroundColor: "transparent",
        };
    }
  };

  const getTextColor = () => {
    if (disabled) {
      return isDark ? zincColors[500] : zincColors[400];
    }

    switch (variant) {
      case "filled":
        return isDark ? zincColors[900] : zincColors[50];
      case "outline":
      case "ghost":
        return appleBlue;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        getVariantStyle(),
        {
          height: sizeStyles[size].height,
          paddingHorizontal: sizeStyles[size].padding,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text
          style={StyleSheet.flatten([
            {
              fontSize: sizeStyles[size].fontSize,
              color: getTextColor(),
              textAlign: "center",
              marginBottom: 0,
              fontWeight: "700",
            },
            textStyle,
          ])}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
};

// Custom Modal component for web compatibility (replaces Alert.alert)
interface ModalProps {
  visible: boolean;
  title: string;
  message?: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "info" | "error" | "success" | "warning";
  children?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  title,
  message,
  onClose,
  onConfirm,
  confirmText = "OK",
  cancelText = "Cancel",
  type = "info",
  children,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const getTypeColor = () => {
    switch (type) {
      case "error":
        return "#FF3B30";
      case "success":
        return "#34C759";
      case "warning":
        return "#FF9500";
      default:
        return appleBlue;
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View
          style={[
            modalStyles.content,
            { backgroundColor: isDark ? zincColors[900] : "#fff" },
          ]}
        >
          <Text
            style={[
              modalStyles.title,
              { color: isDark ? zincColors[50] : zincColors[900] },
            ]}
          >
            {title}
          </Text>
          {message && (
            <Text
              style={[
                modalStyles.message,
                { color: isDark ? zincColors[300] : zincColors[600] },
              ]}
            >
              {message}
            </Text>
          )}
          {children && (
            <>
              <View style={modalStyles.childrenContainer}>{children}</View>
              <View style={modalStyles.buttons}>
                <TouchableOpacity
                  style={[
                    modalStyles.button,
                    modalStyles.confirmButton,
                    { backgroundColor: getTypeColor() },
                  ]}
                  onPress={onClose}
                >
                  <Text style={modalStyles.confirmButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
          {!children && (
            <View style={modalStyles.buttons}>
              {onConfirm && (
                <TouchableOpacity
                  style={[modalStyles.button, modalStyles.cancelButton]}
                  onPress={onClose}
                >
                  <Text style={modalStyles.cancelButtonText}>{cancelText}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  modalStyles.button,
                  modalStyles.confirmButton,
                  { backgroundColor: getTypeColor() },
                ]}
                onPress={onConfirm || onClose}
              >
                <Text style={modalStyles.confirmButtonText}>{confirmText}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </RNModal>
  );
};

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: "center",
  },
  childrenContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  confirmButton: {
    backgroundColor: appleBlue,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});

export default Button;
