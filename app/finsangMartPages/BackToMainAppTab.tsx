import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useExperienceSwitch } from "../../Contexts/ExperienceContext";

export default function BackToMainAppTab() {
  const { switchToExperience } = useExperienceSwitch();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="arrow-back-circle" size={64} color="#ffffff" />
        </View>

        <Text style={styles.title}>Back to Finsang Pro</Text>
        <Text style={styles.subtitle}>Return to your main experience</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            console.log(
              "BackToMainAppTab - Button pressed, switching to main experience"
            );
            switchToExperience("main");
          }}
          activeOpacity={0.8}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color="#ffffff"
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 40,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    minWidth: 280,
  },
  iconContainer: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 22,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 140,
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
