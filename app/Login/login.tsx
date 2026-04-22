import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../Contexts/AuthContexts";
import CustomAlert from "../../components/CustomAlert";
import Colors from "../../constants/Colors";
import { supabase } from "../../lib/supabase";
// import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {
  const router = useRouter();
  const { refreshSession, isLoggedIn } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info",
  });

  // Animations - use useState to prevent recreation on re-renders
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/(tabs)");
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    let interval: any;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  // Prevent hardware back button on login screen
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => true; // Prevent going back
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => subscription.remove();
    }, [])
  );

  const handleVerifyNumber = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setAlert({
        visible: true,
        title: "Invalid Number",
        message: "Please enter a valid 10-digit phone number",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Check network connectivity first
      const testResponse = await fetch('https://www.google.com', { method: 'HEAD' });
      if (!testResponse.ok) {
        throw new Error('No internet connection');
      }
      
      const fullPhone = "+91" + phoneNumber;
      console.log('Attempting to send OTP to:', fullPhone);
      
      const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
      if (error) {
        console.log('Supabase error:', error);
        throw error;
      }
      
      setStep("otp");
      setCountdown(60);
      setAlert({
        visible: true,
        title: "OTP Sent! 📱",
        message: "Please check your phone for the verification code",
        type: "success",
      });
    } catch (error: any) {
      console.log("Login error", error);
      
      let errorMessage = "Failed to send OTP. Please try again.";
      if (error.message?.includes('Network request failed')) {
        errorMessage = "Network connection failed. Please check your internet connection and try again.";
      } else if (error.message?.includes('SMS')) {
        errorMessage = "SMS service is not configured. Please contact support.";
      }
      
      setAlert({
        visible: true,
        title: "Connection Error",
        message: errorMessage,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!otp || otp.length < 6) {
      setAlert({
        visible: true,
        title: "Invalid OTP",
        message: "Please enter the complete 6-digit code",
        type: "error",
      });
      return;
    }
    setIsLoading(true);
    try {
      const fullPhone = "+91" + phoneNumber;
      console.log('Verifying OTP for:', fullPhone);
      
      const { data, error } = await supabase.auth.verifyOtp({
        phone: fullPhone,
        token: otp,
        type: "sms",
      });
      
      if (error) {
        console.log('OTP verification error:', error);
        throw error;
      }
      
      if (!data.user) throw new Error("No user returned");
      
      const { user } = data;
      // Check if user exists in users table
      const { data: existing, error: fetchError } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single();

      if (!existing && (!fetchError || fetchError.code === "PGRST116")) {
        // User does not exist, navigate to Usercard screen with phone param
        router.replace({
          pathname: "/Usercard",
          params: { phone: user.phone },
        });
        return;
      } else {
        // User exists, refresh session and go to home
        await refreshSession();
        setAlert({
          visible: true,
          title: "OTP Verified Successfully!",
          message: "You have been logged in.",
          type: "success",
        });
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      console.log('Verification error:', error);
      
      let errorMessage = "Please try again";
      if (error.message?.includes('Network request failed')) {
        errorMessage = "Network connection failed. Please check your internet connection.";
      } else if (error.message?.includes('Invalid')) {
        errorMessage = "Invalid OTP code. Please check and try again.";
      }
      
      setAlert({
        visible: true,
        title: "Verification Failed",
        message: errorMessage,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = () => {
    if (countdown === 0) {
      setCountdown(60);
      setAlert({
        visible: true,
        title: "OTP Resent! 📱",
        message: "New verification code sent to your phone",
        type: "success",
      });
    }
  };

  const handleEditNumber = () => {
    setStep("phone");
    setOtp("");
    setCountdown(0);
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Background Gradient Effect */}
        <View style={styles.backgroundGradient} />
        <View style={styles.backgroundCircle1} />
        <View style={styles.backgroundCircle2} />

        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Welcome To Finsang Pro</Text>
            <Text style={styles.subtitle}>
              {step === "phone"
                ? "Enter your phone number to get started"
                : "We've sent a code to your phone"}
            </Text>
          </View>

          {/* Main Card */}
          <View style={styles.card}>
            {step === "phone" ? (
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={styles.phoneInputContainer}>
                  <View style={styles.countryCodeContainer}>
                    <Text style={styles.flag}>🇮🇳</Text>
                    <Text style={styles.countryCode}>+91</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="Enter 10-digit mobile number"
                    placeholderTextColor="#94a3b8"
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    isLoading && styles.buttonDisabled,
                  ]}
                  onPress={handleVerifyNumber}
                  disabled={isLoading}
                >
                  <Text style={styles.primaryButtonText}>
                    {isLoading ? "Sending Code..." : "Send Verification Code"}
                  </Text>
                  {/* {!isLoading && <Text style={styles.buttonIcon}>📱</Text>} */}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.inputSection}>
                <View style={styles.phoneDisplayContainer}>
                  <Text style={styles.phoneDisplayLabel}>Code sent to</Text>
                  <Text style={styles.phoneDisplay}>🇮🇳 +91 {phoneNumber}</Text>
                  <TouchableOpacity
                    onPress={handleEditNumber}
                    style={styles.editButton}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.inputLabel}>Verification Code</Text>
                <TextInput
                  style={styles.otpInput}
                  placeholder="• • • • • •"
                  placeholderTextColor="#cbd5e1"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                  textAlign="center"
                  autoFocus
                />

                <View style={styles.resendContainer}>
                  <Text style={styles.resendText}>
                    Didn&apos;t receive the code?{" "}
                  </Text>
                  <TouchableOpacity
                    onPress={handleResendOTP}
                    disabled={countdown > 0}
                    style={styles.resendButton}
                  >
                    <Text
                      style={[
                        styles.resendLink,
                        countdown > 0 && styles.resendDisabled,
                      ]}
                    >
                      {countdown > 0
                        ? `Resend in ${countdown}s`
                        : "Resend Code"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    isLoading && styles.buttonDisabled,
                  ]}
                  onPress={handleContinue}
                  disabled={isLoading}
                >
                  <Text style={styles.primaryButtonText}>
                    {isLoading ? "Verifying..." : "Continue"}
                  </Text>
                  {!isLoading && <Text style={styles.buttonIcon}></Text>}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Footer */}
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
        </Animated.View>

        <CustomAlert
          visible={alert.visible}
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onConfirm={() => setAlert({ ...alert, visible: false })}
          onCancel={() => setAlert({ ...alert, visible: false })}
        />
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    position: "relative",
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
  },
  backgroundCircle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    top: -50,
    right: -50,
  },
  backgroundCircle2: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    bottom: 100,
    left: -30,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 32,
    width: "100%",
    maxWidth: 380,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  inputSection: {
    width: "100%",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 12,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    marginBottom: 24,
  },
  countryCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
  },
  flag: {
    fontSize: 20,
    marginRight: 8,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4a5568",
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
    fontSize: 16,
    color: "#2d3748",
  },
  phoneDisplayContainer: {
    alignItems: "center",
    marginBottom: 24,
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  phoneDisplayLabel: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 4,
  },
  phoneDisplay: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editButtonText: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "500",
  },
  otpInput: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#e2e8f0",
    paddingVertical: 15,
    paddingHorizontal: 10,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
    color: "#2d3748",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  resendText: {
    color: "#64748b",
    fontSize: 14,
  },
  resendButton: {
    paddingHorizontal: 4,
  },
  resendLink: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "600",
  },
  resendDisabled: {
    color: "#94a3b8",
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: Colors.gray,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  buttonIcon: {
    fontSize: 16,
  },
  footerText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    textAlign: "center",
    marginTop: 24,
    lineHeight: 18,
  },
});
