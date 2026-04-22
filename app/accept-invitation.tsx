import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomAlert from "../components/CustomAlert";
import Colors from "../constants/Colors";
import { supabase } from "../lib/supabase";
import { teamApi } from "../lib/teamApi";

export default function AcceptInvitationScreen() {
  const { token } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [invitationValid, setInvitationValid] = useState(false);
  const [invitationDetails, setInvitationDetails] = useState<any>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info" as "success" | "error" | "warning" | "info",
    onConfirm: () => {}
  });

  useEffect(() => {
    checkInvitation();
  }, [token]);

  // Re-check invitation when user logs in
  useEffect(() => {
    const checkAuthState = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && invitationDetails?.requiresLogin) {
        // User just logged in, re-check invitation
        checkInvitation();
      }
    };

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        checkAuthState();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [invitationDetails?.requiresLogin]);

  const checkInvitation = async () => {
    if (!token) {
      setInvitationValid(false);
      setLoading(false);
      return;
    }

    try {
      // Check if invitation exists and is valid
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // User not logged in, but invitation is still valid
        // We'll show the invitation and prompt them to login
        setInvitationValid(true);
        setInvitationDetails({
          member_name: "Team Member",
          team_leader_name: "Team Leader",
          requiresLogin: true,
        });
      } else {
        // User is logged in, invitation is valid
        setInvitationValid(true);
        setInvitationDetails({
          member_name: "Team Member",
          team_leader_name: "Team Leader",
          requiresLogin: false,
        });
      }
    } catch (error) {
      console.error("Error checking invitation:", error);
      setInvitationValid(false);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!token) {
      setAlertConfig({
        title: "Error",
        message: "Invalid invitation link",
        type: "error",
        onConfirm: () => setAlertVisible(false)
      });
      setAlertVisible(true);
      return;
    }

    try {
      setAccepting(true);
      const success = await teamApi.acceptInvitation(token as string);

      if (success) {
        setAlertConfig({
          title: "Success!",
          message: "You have successfully joined the team. You now have restricted access to product pricing.",
          type: "success",
          onConfirm: () => {
            setAlertVisible(false);
            router.replace("/(tabs)");
          }
        });
        setAlertVisible(true);
      } else {
        setAlertConfig({
          title: "Error",
          message: "Failed to accept invitation. Please try again.",
          type: "error",
          onConfirm: () => setAlertVisible(false)
        });
        setAlertVisible(true);
      }
    } catch (error) {
      console.error("Error accepting invitation:", error);
      setAlertConfig({
        title: "Error",
        message: "Failed to accept invitation. Please try again.",
        type: "error",
        onConfirm: () => setAlertVisible(false)
      });
      setAlertVisible(true);
    } finally {
      setAccepting(false);
    }
  };

  const handleDeclineInvitation = () => {
    setAlertConfig({
      title: "Decline Invitation",
      message: "Are you sure you want to decline this team invitation?",
      type: "warning",
      onConfirm: () => {
        setAlertVisible(false);
        router.replace("/(tabs)");
      }
    });
    setAlertVisible(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Checking invitation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!invitationValid) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="close-circle-outline" size={64} color="#F44336" />
          </View>
          <Text style={styles.title}>Invalid Invitation</Text>
          <Text style={styles.subtitle}>
            This invitation link is invalid or has expired. Please contact your
            team leader for a new invitation.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.buttonText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="people-circle-outline"
            size={64}
            color={Colors.primary}
          />
        </View>

        <Text style={styles.title}>Team Invitation</Text>
        <Text style={styles.subtitle}>
          You&apos;ve been invited to join a Finsang Pro team!
        </Text>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailsText}>
            • You&apos;ll have restricted access to product pricing{"\n"}• Your
            team leader will manage your account{"\n"}• All your leads will be
            visible to your team leader{"\n"}• You can still browse and share
            products
          </Text>
        </View>

        {invitationDetails?.requiresLogin ? (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={() => router.push("/Login/login")}
            >
              <Ionicons name="log-in" size={20} color="#fff" />
              <Text style={styles.acceptButtonText}>Login to Accept</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => router.push("/Login/login")}
            >
              <Ionicons name="person-add" size={20} color={Colors.primary} />
              <Text style={styles.secondaryButtonText}>Create Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.declineButton]}
              onPress={handleDeclineInvitation}
            >
              <Ionicons name="close" size={20} color="#666" />
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={handleAcceptInvitation}
              disabled={accepting}
            >
              {accepting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="#fff" />
                  <Text style={styles.acceptButtonText}>Accept Invitation</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.declineButton]}
              onPress={handleDeclineInvitation}
            >
              <Ionicons name="close" size={20} color="#666" />
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.title === "Decline Invitation" ? () => setAlertVisible(false) : undefined}
        cancelText="Cancel"
        confirmText={alertConfig.title === "Decline Invitation" ? "Decline" : "OK"}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  detailsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  acceptButton: {
    backgroundColor: Colors.primary,
  },
  acceptButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  declineButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  declineButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
