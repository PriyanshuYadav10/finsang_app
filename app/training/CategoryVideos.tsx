import Colors from "@/constants/Colors";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import { fetchVideosByCategory } from "../../lib/trainingApi";

const { width } = Dimensions.get("window");

function getYoutubeId(url: string) {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default function CategoryVideos() {
  const params = useLocalSearchParams();
  const category = params.category
    ? JSON.parse(params.category as string)
    : null;
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoModal, setVideoModal] = useState<{
    visible: boolean;
    youtubeUrl: string;
  }>({ visible: false, youtubeUrl: "" });

  useEffect(() => {
    async function loadVideos() {
      setLoading(true);
      try {
        const vids = await fetchVideosByCategory(category.id);
        setVideos(vids);
      } catch (e) {
        // handle error
      }
      setLoading(false);
    }
    loadVideos();
  }, [category.id]);

  const openVideo = (youtubeUrl: string) =>
    setVideoModal({ visible: true, youtubeUrl });
  const closeVideo = () => setVideoModal({ visible: false, youtubeUrl: "" });

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => openVideo(item.youtube_url)}
            style={{ marginBottom: 20 }}
          >
            <View style={{ position: "relative", alignItems: "center" }}>
              <Image
                source={{ uri: item.thumbnail_url }}
                style={{ width: width - 32, height: 150, borderRadius: 12 }}
              />
              {/* Play button overlay */}
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: width - 32,
                  height: 150,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    backgroundColor: "rgba(0,0,0,0.5)",
                    borderRadius: 24,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 28 }}>▶</Text>
                </View>
              </View>
            </View>
            <Text
              style={{
                fontWeight: "bold",
                marginTop: 8,
                textAlign: "left",
                width: width - 55,
                alignSelf: "center",
                fontSize: 20,
              }}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Video Modal */}
      <Modal
        visible={videoModal.visible}
        animationType="slide"
        onRequestClose={closeVideo}
      >
        <View
          style={{ flex: 1, backgroundColor: "#000", justifyContent: "center" }}
        >
          <TouchableOpacity
            onPress={closeVideo}
            style={{ position: "absolute", top: 40, right: 20, zIndex: 1 }}
          >
            <Text style={{ color: "#fff", fontSize: 24 }}>✕</Text>
          </TouchableOpacity>
          <YoutubePlayer
            height={300}
            play={true}
            videoId={getYoutubeId(videoModal.youtubeUrl)}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
});
