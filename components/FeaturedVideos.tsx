import Colors from "@/constants/Colors";
import { fetchFeaturedVideos } from "@/lib/trainingApi";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";

const { width } = Dimensions.get("window");

function getYoutubeId(url: string) {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default function FeaturedVideos() {
  const [featuredVideos, setFeaturedVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoModal, setVideoModal] = useState<{
    visible: boolean;
    youtubeUrl: string;
  }>({ visible: false, youtubeUrl: "" });

  useEffect(() => {
    async function loadVideos() {
      try {
        const videos = await fetchFeaturedVideos();
        setFeaturedVideos(videos.slice(0, 3)); // Show only 3 videos
      } catch (e) {
        console.error("Error loading videos:", e);
      }
      setLoading(false);
    }
    loadVideos();
  }, []);

  const openVideo = (youtubeUrl: string) =>
    setVideoModal({ visible: true, youtubeUrl });
  const closeVideo = () => setVideoModal({ visible: false, youtubeUrl: "" });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  }

  if (featuredVideos.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Featured Training</Text>
        <Text style={styles.subtitle}>Learn and earn more</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {featuredVideos.map((video) => (
          <TouchableOpacity
            key={video.id}
            style={styles.videoCard}
            onPress={() => openVideo(video.youtube_url)}
            activeOpacity={0.85}
          >
            <View style={styles.videoImageContainer}>
              <Image
                source={{ uri: video.thumbnail_url }}
                style={styles.videoImage}
              />
              <View style={styles.videoOverlay} />
              <View style={styles.playButton}>
                <Ionicons name="play" size={20} color="#ffffff" />
              </View>
            </View>
            <View style={styles.videoInfo}>
              <Text style={styles.videoTitle} numberOfLines={2}>
                {video.title}
              </Text>
              <Text style={styles.videoMeta}>Training Video</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        visible={videoModal.visible}
        animationType="slide"
        onRequestClose={closeVideo}
        statusBarTranslucent
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            onPress={closeVideo}
            style={styles.closeButton}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.videoPlayerContainer}>
            <YoutubePlayer
              height={250}
              play={true}
              videoId={getYoutubeId(videoModal.youtubeUrl)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  loadingContainer: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  scrollContent: {
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  videoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginRight: 16,
    width: 300,
    paddingBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    overflow: "hidden",
  },
  videoImageContainer: {
    position: "relative",
    height: 120,
  },
  videoImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  videoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  videoInfo: {
    padding: 12,
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
    lineHeight: 18,
  },
  videoMeta: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  videoPlayerContainer: {
    flex: 1,
    justifyContent: "center",
  },
});
