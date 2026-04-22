import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import CustomAlert from "./CustomAlert";
import Colors from "../constants/Colors";

export default function AlertExample() {
  const [alertVisible, setAlertVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setAlertVisible(true)}
      >
        <Text style={styles.buttonText}>Show Alert</Text>
      </TouchableOpacity>

      <CustomAlert
        visible={alertVisible}
        title="Success!"
        message="Your action was completed successfully."
        type="success"
        onConfirm={() => setAlertVisible(false)}
        onCancel={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});