import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  Dimensions,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "../constants/Colors";
import { useAuth } from "../Contexts/AuthContexts";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();
  const { isLoggedIn, loading } = useAuth();

  useEffect(() => {
    // console.log('isLoggedIn:', isLoggedIn, 'loading:', loading);
    if (!loading && isLoggedIn) {
      router.replace("/(tabs)");
    }
  }, [isLoggedIn, loading, router]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.primary }}>
      <ImageBackground
        source={require("../assets/images/Banner1.png")}
        style={styles.backgroundImage}
        resizeMode="contain"
      >
        <View style={styles.container}>
          <StatusBar
            backgroundColor={Colors.primary}
            barStyle="light-content"
          />

          {/* Purple Background Section */}
          <View style={styles.purpleSection}></View>

          {/* White Bottom Section */}
          <View style={styles.bottomSection}>
            <Text style={styles.mainTitle}>Start Your Journey to a</Text>
            <Text style={styles.mainTitle}>750+ Credit Score</Text>

            <Text style={styles.subtitle}>Use Finsang Pro Together Grow</Text>

            {/* Trust Indicators */}
            <View style={styles.trustSection}>
              <View style={styles.trustBadge}>
                <Text style={styles.trustBadgeText}>100%</Text>
                <Text style={styles.trustBadgeSubtext}>SECURE</Text>
              </View>
              <View style={styles.trustBadge}>
                <Text style={styles.trustBadgeText}>🌐</Text>
                <Text style={styles.trustBadgeSubtext}>ISO 27001</Text>
              </View>
            </View>

            {/* Get Started Button */}
            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={() => {
                router.push("/Login/login");
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "70%",
  },
  container: {
    flex: 1,
  },
  purpleSection: {
    flex: 0.6,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  brandSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  brandName: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.white,
    letterSpacing: 2,
  },
  brandTagLine: {
    fontSize: 18,
    color: Colors.white,
    letterSpacing: 2,
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 180,
  },
  mainImage: {
    width: width * 1,
    height: height * 0.55,
    borderRadius: 20,
  },
  bottomSection: {
    flex: 0.4,
    backgroundColor: Colors.background,
    borderTopLeftRadius: "20%",
    borderTopRightRadius: "20%",
    paddingHorizontal: 30,
    paddingTop: 35,
    paddingBottom: 40,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.black,
    textAlign: "center",
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 30,
  },
  trustSection: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 40,
    gap: 40,
  },
  trustBadge: {
    alignItems: "center",
  },
  trustBadgeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.black,
  },
  trustBadgeSubtext: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 4,
  },
  getStartedButton: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    paddingVertical: 18,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  getStartedText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  signupOption: {
    paddingVertical: 12,
  },
  signupText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
