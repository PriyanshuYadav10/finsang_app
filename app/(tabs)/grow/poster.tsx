import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Share2 } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Share from "react-native-share";
import ViewShot from "react-native-view-shot";
import { useUser } from "../../../Contexts/UserContext";

export default function PosterScreen() {
  const poster = useLocalSearchParams();
  const router = useRouter();
  const { userDetails } = useUser();
  const viewShotRef = useRef<ViewShot | null>(null);
  const [loading, setLoading] = useState(false);

  const onShare = async () => {
    setLoading(true);
    try {
      const uri = await viewShotRef.current?.capture?.();
      if (uri) {
        const message = `Special offers on ${poster.title} are available for you. Check out now: https://wee.bnking.in/c/M2IzZjE2O`;
        await Share.open({
          title: poster.title as string,
          message,
          url: uri,
          type: "image/png",
          failOnCancel: false,
        });
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share with your network</Text>
        <TouchableOpacity onPress={onShare}>
          <Share2 size={24} color="black" />
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsHorizontalScrollIndicator={false}
      >
        <ViewShot
          ref={viewShotRef}
          options={{ format: "png", quality: 1.0 }}
          style={styles.posterImageContainer}
        >
          <Image
            source={{ uri: poster.image_url as string }}
            style={styles.posterImage}
          />
        </ViewShot>

        {/* User info signature, now below the image */}
        <View style={styles.signatureContainer}>
          <View style={styles.signatureText}>
            <Text
              style={styles.signatureName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {userDetails?.name || "User Name"}
            </Text>
            <Text
              style={styles.signatureOccupation}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {userDetails?.occupation || "Occupation"}
            </Text>
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity
        style={styles.shareButton}
        onPress={onShare}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.shareButtonText}>Share</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  posterImageContainer: {
    width: 300,
    height: 450,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    marginBottom: 20,
  },
  posterImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  signatureContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    maxWidth: 300,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  signatureText: {
    marginLeft: 12,
    flex: 1,
  },
  signatureAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
  },
  signatureInitials: {
    color: "#333",
    fontWeight: "bold",
    fontSize: 20,
  },
  signatureName: {
    color: "#222",
    fontWeight: "bold",
    fontSize: 17,
  },
  signatureOccupation: {
    color: "#666",
    fontSize: 14,
  },
  shareButton: {
    backgroundColor: "#25D366",
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  shareButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
