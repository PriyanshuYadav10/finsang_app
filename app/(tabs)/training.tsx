import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import Colors from "../../constants/Colors";
import {
  fetchCategories,
  fetchFeaturedVideos,
  fetchVideosByCategory,
} from "../../lib/trainingApi";

const { width, height } = Dimensions.get("window");

function getYoutubeId(url: string) {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default function Training() {
  const [featuredVideos, setFeaturedVideos] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoModal, setVideoModal] = useState<{
    visible: boolean;
    youtubeUrl: string;
  }>({ visible: false, youtubeUrl: "" });
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [videos, cats] = await Promise.all([
          fetchFeaturedVideos(),
          fetchCategories(),
        ]);
        // Fetch all videos for all categories
        const allCategoryIds = cats.map((cat: any) => cat.id);
        // Fetch all videos for all categories in parallel
        const videosByCategory = await Promise.all(
          allCategoryIds.map((id: any) => fetchVideosByCategory(id))
        );
        // Add video_count to each category
        const categoriesWithCount = cats.map((cat: any, idx: number) => ({
          ...cat,
          video_count: videosByCategory[idx]?.length || 0,
        }));
        setFeaturedVideos(videos);
        setCategories(categoriesWithCount);
      } catch (e) {
        // handle error
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const openVideo = (youtubeUrl: string) =>
    setVideoModal({ visible: true, youtubeUrl });
  const closeVideo = () => setVideoModal({ visible: false, youtubeUrl: "" });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading Training Content...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Clean Header */}

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Featured Videos Section */}
        {featuredVideos.length > 0 && (
          <View style={styles.featuredSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Videos</Text>
            </View>

            <FlatList
              data={featuredVideos}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.featuredListContainer}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => openVideo(item.youtube_url)}
                  style={styles.featuredVideoCard}
                  activeOpacity={0.8}
                >
                  <View style={styles.videoImageContainer}>
                    <Image
                      source={{ uri: item.thumbnail_url }}
                      style={styles.featuredVideoImage}
                    />

                    {/* Simple overlay */}
                    <View style={styles.videoOverlay} />

                    {/* Clean play button */}
                    <View style={styles.playButtonContainer}>
                      <View style={styles.playButton}>
                        <Text style={styles.playButtonText}>▶</Text>
                      </View>
                    </View>

                    {/* Duration badge */}
                    <View style={styles.durationBadge}>
                      <Text style={styles.durationText}>5:30</Text>
                    </View>
                  </View>

                  <View style={styles.featuredVideoInfo}>
                    <Text style={styles.featuredVideoTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.featuredVideoMeta}>Featured</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Training Modules Section */}
        <View style={styles.modulesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Training Modules</Text>
          </View>

          <View style={styles.categoriesGrid}>
            {categories.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={styles.categoryCard}
                onPress={() =>
                  router.push({
                    pathname: "/training/CategoryVideos",
                    params: { category: JSON.stringify(item) },
                  })
                }
                activeOpacity={0.8}
              >
                <View style={styles.categoryImageContainer}>
                  <Image
                    source={{ uri: item.banner_url }}
                    style={styles.categoryImage}
                    resizeMode="cover"
                  />

                  {/* Clean overlay */}
                  <View style={styles.categoryOverlay} />

                  {/* Video count badge */}
                  {item.video_count > 0 && (
                    <View style={styles.videoCountBadge}>
                      <Text style={styles.videoCountText}>
                        {item.video_count} videos
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryTitle} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.categoryDescription}>
                    Training module
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Clean Video Modal */}
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
            <View style={styles.closeButtonContainer}>
              <Text style={styles.closeButtonText}>✕</Text>
            </View>
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
    flex: 1,
    backgroundColor: "#ffffff",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },

  loadingText: {
    color: "#666666",
    fontSize: 16,
    marginTop: 16,
    fontWeight: "500",
  },

  headerSection: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },

  headerSubtitle: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "400",
  },

  scrollContent: {
    flex: 1,
    backgroundColor: "#fafafa",
  },

  featuredSection: {
    backgroundColor: "#ffffff",
    paddingTop: 16,
    paddingBottom: 20,
  },

  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1a1a1a",
  },

  featuredListContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  featuredVideoCard: {
    width: width * 0.72,
    marginHorizontal: 6,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    overflow: "hidden",
  },

  videoImageContainer: {
    position: "relative",
    height: 160,
  },

  featuredVideoImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f5f5f5",
  },

  videoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
  },

  playButtonContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -24 }, { translateY: -24 }],
  },

  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },

  playButtonText: {
    color: Colors.primary,
    fontSize: 18,
    marginLeft: 2,
    fontWeight: "600",
  },

  durationBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },

  durationText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
  },

  featuredVideoInfo: {
    padding: 16,
  },

  featuredVideoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    lineHeight: 22,
    marginBottom: 4,
  },

  featuredVideoMeta: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },

  modulesSection: {
    backgroundColor: "#fafafa",
    paddingTop: 24,
    paddingBottom: 20,
  },

  categoriesGrid: {
    paddingHorizontal: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  categoryCard: {
    width: (width - 44) / 2,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    overflow: "hidden",
  },

  categoryImageContainer: {
    position: "relative",
    height: 120,
  },

  categoryImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f5f5f5",
  },

  categoryOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.1)",
  },

  videoCountBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  videoCountText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
  },

  categoryInfo: {
    padding: 16,
  },

  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    lineHeight: 20,
    marginBottom: 4,
  },

  categoryDescription: {
    fontSize: 13,
    color: "#666666",
    fontWeight: "400",
  },

  bottomSpacing: {
    height: 20,
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000000",
  },

  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },

  closeButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },

  closeButtonText: {
    color: "#333333",
    fontSize: 18,
    fontWeight: "600",
  },

  videoPlayerContainer: {
    width: width * 0.95,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000000",
  },
});
