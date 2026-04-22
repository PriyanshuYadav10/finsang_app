import { useUser } from "@/Contexts/UserContext";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useExperienceSwitch } from "../Contexts/ExperienceContext";

export default function ProfileScreen() {
  const { userDetails } = useUser();
  const router = useRouter();
  const name = userDetails?.name || "User";
  const username = userDetails?.username || "XYZ123";
  const initials = name.slice(0, 2).toUpperCase();
  const phone = "+91" + " " + userDetails?.phone?.slice(2) || "";
  const { switchToExperience } = useExperienceSwitch();

  const SHARE_MESSAGE = `Hey!

  Check out the Finsang app & start earning up to ₹1 Lakh every month 💸
  
  Sell financial products online from 50+ top brands like SBI, HDFC, ICICI, Axis & more and grow your income.
  
  Use my referral code: *${username}* 💼
  
  📲 Download now:
  https://finsang.in/`;

  const handleShare = async () => {
    try {
      const result = await Share.share({ message: SHARE_MESSAGE });
      if (result.action === Share.sharedAction) {
        console.log("Shared successfully!");
      } else if (result.action === Share.dismissedAction) {
        console.log("Share dismissed.");
      }
    } catch (error) {
      let message = "Unknown error";
      if (error instanceof Error) {
        message = error.message;
      }
      alert("Error sharing message: " + message);
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: Colors.white }}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={28} color={Colors.black} />
        </TouchableOpacity>
        {/* Profile Banner */}
        <View style={styles.profileBanner}>
          <View style={styles.profileCircle}>
            <Text style={styles.profileInitials}>{initials}</Text>
          </View>
          <Text style={styles.profileName}>{name}</Text>
          <Text style={styles.profilePhone}>{phone}</Text>
        </View>

        {/* Switch to FinsangMart Card */}
        <TouchableOpacity
          style={{
            backgroundColor: Colors.white,
            borderRadius: 16,
            marginHorizontal: 20,
            marginBottom: 20,
            padding: 20,
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: "#E5E5E5",
          }}
          onPress={() => {
            console.log(
              "Main app - Finsang Pro button pressed, switching to finsangpro experience"
            );
            switchToExperience("finsangmart");
          }}
        >
          <View style={styles.sellIconContainer}>
            <Ionicons name="cart-outline" size={32} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: Colors.primary,
              }}
            >
              Try Finsang Mart!
            </Text>
            <Text style={{ fontSize: 14, color: Colors.gray, marginTop: 2 }}>
              Shop, sell, and manage with a new experience
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={28} color={Colors.primary} />
        </TouchableOpacity>

        {/* Finsang Partner Code Section */}
        <View style={styles.partnerCodeSection}>
          <View>
            <Text style={styles.partnerCodeLabel}>My Finsang Pro Code</Text>
            <Text style={styles.partnerCodeValue}>{username}</Text>
          </View>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons
              name="share-social-outline"
              size={22}
              color={Colors.primary}
            />
            <Text style={styles.shareText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* finsang Partner Kit Section */}
        <View style={styles.partnerKitSection}>
          <TouchableOpacity
            style={styles.partnerKitCard}
            onPress={() => router.push("/VisitingCard")}
          >
            <Ionicons name="card-outline" size={24} color={Colors.primary} />
            <Text style={styles.partnerKitText}>Visiting Card</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.partnerKitCard}
            onPress={() => router.push("/IdCard")}
          >
            <Ionicons name="id-card-outline" size={24} color={Colors.primary} />
            <Text style={styles.partnerKitText}>ID Card</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.partnerKitCard}
            onPress={() => router.push("/OfferLetter")}
          >
            <Ionicons
              name="document-outline"
              size={24}
              color={Colors.primary}
            />
            <Text style={styles.partnerKitText}>Offer Letter</Text>
          </TouchableOpacity>
        </View>

        {/* Menu List */}
        <View style={styles.menuList}>
          <MenuItem
            icon="person-outline"
            label="My Account"
            onPress={() => router.push("/MyAccount")}
          />
          <MenuItem
            icon="business-outline"
            label="Payment Account Details"
            onPress={() => router.push("/PaymentAccountDetails")}
          />
          {/* <MenuItem icon="cash-outline" label="My Earnings" /> */}
          <MenuItem
            icon="globe-outline"
            label="My Website"
            onPress={() => router.push("/create-website")}
          />
          <MenuItem
            icon="storefront-outline"
            label="List My Shop"
            onPress={() => router.push("/create-shop")}
          />
          <MenuItem
            icon="people-outline"
            label="My Team"
            onPress={() => router.push("/MyTeam")}
          />
          {/* <MenuItem
            icon="share-social-outline"
            label="Refer & Earn"
            onPress={() => router.push("/refer-earn")}
            rightElement={
              <View style={styles.badge}>
                <Text style={styles.badgeText}>₹1500 Extra</Text>
              </View>
            }
          /> */}
          {/* <MenuItem icon="language-outline" label="App Language" onPress={() => router.push('/app-language')} /> */}
          <MenuItem
            icon="help-circle-outline"
            label="Help & Support"
            onPress={() => router.push("/help-support")}
          />
          <MenuItem
            icon="chatbubble-ellipses-outline"
            label="Feedback & Suggestions"
            onPress={() => router.push("/feedback-suggestions")}
          />
          <MenuItem
            icon="document-text-outline"
            label="Terms of Use"
            onPress={() => router.push("/terms-of-use")}
          />
          <MenuItem
            icon="document-outline"
            label="Privacy Policy."
            onPress={() => router.push("/privacy-policy")}
          />
          <MenuItem
            icon="document-outline"
            label="Licence Agreement"
            onPress={() => router.push("/licence-agreement")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
// MenuItem component
function MenuItem({
  icon,
  label,
  onPress,
  rightElement,
}: {
  icon: any;
  label: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Ionicons
        name={icon}
        size={24}
        color={Colors.primary}
        style={styles.menuIcon}
      />
      <Text style={styles.menuLabel}>{label}</Text>
      {rightElement}
      <Ionicons
        name="chevron-forward"
        size={20}
        color={Colors.gray}
        style={styles.menuArrow}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    minHeight: "100%",
  },
  sellIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 10,
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 4,
  },
  profileBanner: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  profileCircle: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#E5DFCA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  profileInitials: {
    color: "#6B5B2B",
    fontWeight: "bold",
    fontSize: 24,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.black,
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 16,
    color: Colors.gray,
  },
  partnerCodeSection: {
    flexDirection: "row",
    width: "90%",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  partnerCodeLabel: {
    fontWeight: "bold",
    fontSize: 15,
    color: Colors.black,
  },
  partnerCodeValue: {
    fontSize: 16,
    color: Colors.black,
    marginTop: 2,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#F5F8FF",
  },
  shareText: {
    color: Colors.primary,
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 15,
  },
  partnerKitSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  partnerKitCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    marginHorizontal: 4,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "#F7F7F7",
    position: "relative",
  },
  partnerKitCardActive: {
    borderColor: "#E53935",
  },
  partnerKitText: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.black,
    fontWeight: "500",
  },
  menuList: {
    width: "100%",
    marginTop: 10,
    paddingHorizontal: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  menuIcon: {
    marginRight: 16,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: Colors.black,
    fontWeight: "500",
  },
  menuArrow: {
    marginLeft: 8,
  },
  badge: {
    backgroundColor: "#F2994A",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
    height: 24,
    minWidth: 60,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
});
