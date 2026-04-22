import Colors from "@/constants/Colors";
import { useAuth } from "@/Contexts/AuthContexts";
import { useUser } from "@/Contexts/UserContext";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const OCCUPATIONS = [
  "Bank Employee",
  "Student",
  "Financial Advisor",
  "Sales Manager",
  "DSA",
  "Influencer",
  "Others",
];

// If not already present, extend the UserDetails type locally for this file
// (This is a workaround if the import doesn't include profileimage)
type UserDetailsWithImage = {
  name?: string;
  phone?: string;
  pincode?: number | string;
  email?: string;
  occupation?: string;
  username?: string;
  profileimage?: string;
};

export default function MyAccountScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  // Use type assertion to allow profileimage property
  const {
    userDetails,
    updateUserDetails,
    uploadProfileImage,
    fetchUserDetails,
  } = useUser() as {
    userDetails: UserDetailsWithImage | null;
    updateUserDetails: (u: any) => Promise<void>;
    uploadProfileImage: (u: string, oldUrl?: string) => Promise<string | null>;
    fetchUserDetails: () => Promise<void>;
  };
  // const [editing, setEditing] = useState(false);
  // const [profileImage, setProfileImage] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [phoneModalVisible, setPhoneModalVisible] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(20);
  const [newPhone, setNewPhone] = useState("");
  const [confirmPhone, setConfirmPhone] = useState("");
  const [selectedOccupation, setSelectedOccupation] = useState(
    userDetails?.occupation || ""
  );
  const [occupationModalVisible, setOccupationModalVisible] = useState(false);
  // Track initial form state for change detection
  const initialForm = {
    name: userDetails?.name || "",
    phone: userDetails?.phone || "",
    pincode: userDetails?.pincode?.toString() || "",
    email: userDetails?.email || "",
    occupation: userDetails?.occupation || "",
  };
  const [form, setForm] = useState(initialForm);
  const [modalVisible, setModalVisible] = useState(false);

  //   const SHARE_MESSAGE = `Hey!

  // Check out the Finsang app & start earning up to ₹1 Lakh every month 💸

  // Sell financial products online from 50+ top brands like SBI, HDFC, ICICI, Axis & more and grow your income.

  // Use my referral code: *${userDetails?.username}* 💼

  // 📲 Download now:
  // https://finsang.in/`;

  // Show the profile image from userDetails.profileimage if available
  const profileImageToShow = userDetails?.profileimage;

  // Updated pick image logic
  const pickImageFromGallery = async () => {
    setModalVisible(false);
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      const uploadedUrl = await uploadProfileImage(
        uri,
        userDetails?.profileimage
      );
      if (uploadedUrl) {
        await updateUserDetails({ profileimage: uploadedUrl });
        await fetchUserDetails();
        alert("Profile image updated successfully!");
      }
    }
  };

  const takePhotoWithCamera = async () => {
    setModalVisible(false);
    let permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.status !== "granted") {
      alert("Camera permission is required!");
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      const uploadedUrl = await uploadProfileImage(
        uri,
        userDetails?.profileimage
      );
      if (uploadedUrl) {
        await updateUserDetails({ profileimage: uploadedUrl });
        await fetchUserDetails();
        alert("Profile image updated successfully!");
      }
    }
  };

  //   const handleShare = async () => {
  //     try {
  //       const result = await Share.share({ message: SHARE_MESSAGE });
  //       if (result.action === Share.sharedAction) {
  //         console.log('Shared successfully!');
  //       } else if (result.action === Share.dismissedAction) {
  //         console.log('Share dismissed.');
  //       }
  //     } catch (error) {
  //       alert('Error sharing message: ' + error.message);
  //     }
  //   };

  // --- Phone number OTP timer logic ---
  React.useEffect(() => {
    let timer: any;
    if (otpModalVisible && otpTimer > 0) {
      timer = setTimeout(() => setOtpTimer((t) => t - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpModalVisible, otpTimer]);

  const handleEditProfile = () => {
    setEditModalVisible(true);
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/Login/login");
  };

  const handleEditPhone = () => {
    setPhoneModalVisible(true);
  };

  const handleContinuePhone = () => {
    // Here, you would send OTP to newPhone
    setPhoneModalVisible(false);
    setOtpModalVisible(true);
    setOtpTimer(20);
    setOtp(["", "", "", ""]);
  };

  const handleVerifyOtp = () => {
    // Here, you would verify the OTP
    setForm((f) => ({ ...f, phone: newPhone }));
    setOtpModalVisible(false);
    setNewPhone("");
    setConfirmPhone("");
  };

  const handleOccupationSelect = (occ: string) => {
    setSelectedOccupation(occ);
    setForm((f) => ({ ...f, occupation: occ }));
    setOccupationModalVisible(false);
  };

  // Detect if any changes have been made
  const isChanged =
    form.name !== initialForm.name ||
    form.email !== initialForm.email ||
    form.occupation !== initialForm.occupation ||
    form.pincode !== initialForm.pincode;

  // Save handler
  const handleSave = async () => {
    await updateUserDetails({
      name: form.name,
      email: form.email,
      occupation: form.occupation,
      pincode: form.pincode,
    });
    await fetchUserDetails();
    alert("Profile updated successfully!");
    setEditModalVisible(false);
  };

  // --- UI ---
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}></Text>
        <TouchableOpacity onPress={handleEditProfile}>
          <Text style={styles.headerEditBtnText}>Edit Details</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        style={{ flex: 1, backgroundColor: "#fff" }}
      >
        {/* Profile Image */}
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImageBox}>
            {profileImageToShow ? (
              <Image
                source={{ uri: profileImageToShow }}
                style={styles.profileImage}
              />
            ) : (
              <Ionicons name="person" size={80} color="#BDBDBD" />
            )}
            <TouchableOpacity
              style={styles.cameraIcon}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        {/* Details Section */}
        <View style={styles.detailsSection}>
          <ProfileDetail icon="person-outline" label="Name" value={form.name} />
          <ProfileDetail
            icon="call-outline"
            label="Phone number"
            value={`+91 ${form.phone?.slice(2)}`}
          />
          <ProfileDetail
            icon="location-outline"
            label="Pin Code"
            value={form.pincode}
          />
          <ProfileDetail
            icon="mail-outline"
            label="Email Address"
            value={form.email}
          />
          <ProfileDetail
            icon="briefcase-outline"
            label="Occupation"
            value={form.occupation}
          />
        </View>
        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons
              name="power"
              size={24}
              color="#E53935"
              style={styles.logoutBtnIcon}
            />
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.editModalCard, { paddingTop: 0 }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={styles.backBtnModal}
              >
                <Ionicons name="arrow-back" size={24} color="#222" />
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitle}>Edit Your Profile</Text>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.editScroll}
            >
              <Text style={styles.inputLabel}>
                Full Name<Text style={{ color: "#E53935" }}>*</Text>
              </Text>
              <TextInput
                style={styles.inputBox}
                value={form.name}
                onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
              />
              <Text style={styles.inputLabel}>Phone number</Text>
              <View style={styles.phoneRow}>
                <View style={styles.phoneBox}>
                  <Text style={{ color: "#BDBDBD", fontWeight: "bold" }}>
                    +91
                  </Text>
                </View>
                <TextInput
                  style={[styles.inputBox, { flex: 1, marginLeft: 8 }]}
                  value={form.phone.slice(2)}
                  editable={false}
                />
              </View>
              <TouchableOpacity onPress={handleEditPhone}>
                <Text style={styles.editPhoneText}>Edit Phone Number</Text>
              </TouchableOpacity>
              <Text style={styles.inputLabel}>Email ID</Text>
              <TextInput
                style={styles.inputBox}
                value={form.email}
                onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
              />
              <Text style={styles.inputLabel}>
                Occupation<Text style={{ color: "#E53935" }}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.occupationBox}
                onPress={() => setOccupationModalVisible(true)}
              >
                <Ionicons
                  name="briefcase-outline"
                  size={20}
                  color="#222"
                  style={{ marginRight: 8 }}
                />
                <Text style={{ flex: 1 }}>
                  {selectedOccupation || "Select Occupation"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#222" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  !isChanged && { backgroundColor: "#BDBDBD" },
                ]}
                disabled={!isChanged}
                onPress={handleSave}
              >
                <Text style={styles.saveBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      {/* Occupation Modal */}
      <Modal visible={occupationModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.occupationModalCard, { paddingTop: 0 }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Ionicons
                name="briefcase-outline"
                size={22}
                color="#222"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.modalHeaderTitle}>Occupation</Text>
              <TouchableOpacity
                onPress={() => setOccupationModalVisible(false)}
                style={{
                  marginLeft: "auto",
                  padding: 4,
                  borderRadius: 20,
                  backgroundColor: "#F6F8FA",
                }}
              >
                <Ionicons name="close" size={22} color="#222" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ marginTop: 8 }}>
              {OCCUPATIONS.map((occ) => (
                <TouchableOpacity
                  key={occ}
                  style={[
                    styles.occupationOption,
                    selectedOccupation === occ
                      ? styles.occupationOptionSelected
                      : null,
                  ]}
                  onPress={() => handleOccupationSelect(occ)}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: selectedOccupation === occ ? "#fff" : "#222",
                      fontWeight:
                        selectedOccupation === occ ? "bold" : "normal",
                    }}
                  >
                    {occ}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
      {/* Phone Number Modal */}
      <Modal visible={phoneModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.phoneModalCard}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Ionicons
                name="call-outline"
                size={22}
                color="#222"
                style={{ marginRight: 8 }}
              />
              <Text style={{ fontWeight: "bold", fontSize: 18 }}>
                Add New Phone Number
              </Text>
              <TouchableOpacity
                onPress={() => setPhoneModalVisible(false)}
                style={{ marginLeft: "auto" }}
              >
                <Ionicons name="close" size={22} color="#222" />
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>
              Add New Phone Number<Text style={{ color: "#E53935" }}>*</Text>
            </Text>
            <TextInput
              style={styles.inputBox}
              value={newPhone}
              onChangeText={setNewPhone}
              keyboardType="number-pad"
              maxLength={10}
            />
            <Text style={styles.inputLabel}>
              Confirm New Phone Number
              <Text style={{ color: "#E53935" }}>*</Text>
            </Text>
            <TextInput
              style={styles.inputBox}
              value={confirmPhone}
              onChangeText={setConfirmPhone}
              keyboardType="number-pad"
              maxLength={10}
            />
            <TouchableOpacity
              style={[
                styles.saveBtn,
                {
                  backgroundColor:
                    newPhone && confirmPhone && newPhone === confirmPhone
                      ? Colors.primary
                      : "#BDBDBD",
                },
              ]}
              disabled={
                !(newPhone && confirmPhone && newPhone === confirmPhone)
              }
              onPress={handleContinuePhone}
            >
              <Text style={styles.saveBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* OTP Modal */}
      <Modal visible={otpModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.otpModalCard}>
            <Text
              style={{
                fontWeight: "bold",
                fontSize: 20,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Verify your Existing Number
            </Text>
            <Text
              style={{ color: "#888", textAlign: "center", marginBottom: 16 }}
            >
              We have sent an OTP to {newPhone}
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              {otp.map((d, i) => (
                <TextInput
                  key={i}
                  style={styles.otpInput}
                  value={d}
                  onChangeText={(v) => {
                    if (/^\d?$/.test(v)) {
                      setOtp((arr) => arr.map((x, idx) => (idx === i ? v : x)));
                      if (v && i < 3) {
                        // Focus next input
                        const next = document.getElementById(`otp${i + 1}`);
                        if (next) (next as any).focus();
                      }
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={1}
                  id={`otp${i}`}
                />
              ))}
            </View>
            <Text
              style={{ textAlign: "center", color: "#888", marginBottom: 8 }}
            >
              Resend OTP in{" "}
              <Text style={{ color: "#2962FF" }}>
                00:{otpTimer.toString().padStart(2, "0")}
              </Text>
            </Text>
            <TouchableOpacity style={styles.saveBtn} onPress={handleVerifyOtp}>
              <Text style={styles.saveBtnText}>Verify Phone Number</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Modal for choosing image source (camera/gallery) */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.3)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 24,
              width: 280,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 16,
                textAlign: "center",
              }}
            >
              Select Option
            </Text>
            <TouchableOpacity
              onPress={takePhotoWithCamera}
              style={{ paddingVertical: 12 }}
            >
              <Text style={{ fontSize: 16, textAlign: "center" }}>
                Take Photo
              </Text>
            </TouchableOpacity>
            <View
              style={{ height: 1, backgroundColor: "#eee", marginVertical: 8 }}
            />
            <TouchableOpacity
              onPress={pickImageFromGallery}
              style={{ paddingVertical: 12 }}
            >
              <Text style={{ fontSize: 16, textAlign: "center" }}>
                Choose from Gallery
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{ marginTop: 12 }}
            >
              <Text
                style={{ fontSize: 15, color: "#E53935", textAlign: "center" }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function ProfileDetail({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailItemModern}>
      <Ionicons
        name={icon}
        size={22}
        color="#222"
        style={{ marginRight: 16, marginTop: 2 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.detailLabelModern}>{label}</Text>
        <Text style={styles.detailValueModern}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 86,
    // borderBottomWidth: 1,
    // borderBottomColor: '#F2F2F2',
  },
  headerBackBtn: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: "#F6F8FA",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
  headerEditBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 8,
    backgroundColor: "#E3EDFF",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  headerEditBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    marginLeft: 6,
  },
  profileCard: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    marginBottom: 8,
  },
  profileImageContainer: {
    backgroundColor: Colors.primary,
    alignItems: "center",
    // marginTop: 24,
    marginBottom: 16,
    paddingVertical: 20,
  },
  profileImageBox: {
    width: 120,
    height: 120,
    borderRadius: 24,
    backgroundColor: "#F6F8FA",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 16,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "#2962FF",
    borderRadius: 16,
    padding: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginTop: 2,
  },
  profileUsername: {
    color: "#888",
    fontSize: 14,
    marginTop: 2,
  },
  editProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 8,
    backgroundColor: "#E3EDFF",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  editProfileBtnText: {
    color: "#2962FF",
    fontWeight: "bold",
    fontSize: 15,
    marginLeft: 6,
  },
  detailsSection: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 16,
    marginBottom: 18,
    shadowColor: Colors.gray,
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  detailItemModern: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    paddingBottom: 6,
  },
  detailLabelModern: {
    color: "#888",
    fontSize: 14,
    marginBottom: 2,
  },
  detailValueModern: {
    color: "#111",
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 2,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2962FF",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignSelf: "center",
    marginBottom: 18,
    marginTop: 8,
  },
  shareButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E53935",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignSelf: "center",
    marginTop: 12,
  },
  logoutText: {
    color: "#E53935",
    fontWeight: "bold",
    fontSize: 18,
  },
  logoutSection: {
    marginTop: 48,
    marginBottom: 32,
  },
  logoutBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E53935",
    borderRadius: 12,
    paddingVertical: 18,
    marginHorizontal: 28,
    backgroundColor: "#fff",
  },
  logoutBtnIcon: {
    marginRight: 8,
  },
  logoutBtnText: {
    color: "#E53935",
    fontWeight: "bold",
    fontSize: 18,
  },
  // --- Modal Styles ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  editModalCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 24,
    width: "92%",
    maxWidth: 400,
    maxHeight: "90%",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  editModalTitle: {
    fontWeight: "bold",
    fontSize: 20,
    marginLeft: 12,
  },
  backBtnModal: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: "#f2f2f2",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  modalHeaderBackBtn: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: "#f2f2f2",
  },
  modalHeaderTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#222",
    flex: 1,
    textAlign: "center",
    marginRight: 32,
  },
  editScroll: {
    paddingHorizontal: 4,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  phoneBox: {
    backgroundColor: "#F7F7F7",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  editPhoneText: {
    color: Colors.primary,
    fontWeight: "bold",
    fontSize: 15,
    marginLeft: 8,
  },
  occupationBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 2,
    marginBottom: 12,
  },
  occupationOption: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#F6F8FA",
    alignItems: "flex-start",
  },
  occupationOptionSelected: {
    backgroundColor: Colors.primary,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 18,
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  occupationModalCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    width: "92%",
    maxWidth: 400,
    maxHeight: "70%",
    alignSelf: "center",
  },
  phoneModalCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    width: "92%",
    maxWidth: 400,
    alignSelf: "center",
  },
  otpModalCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    width: "92%",
    maxWidth: 400,
    alignSelf: "center",
    alignItems: "center",
  },
  otpInput: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 20,
    marginHorizontal: 4,
    backgroundColor: "#F7F7F7",
  },
  inputLabel: {
    color: "#222",
    fontSize: 15,
    marginBottom: 2,
    marginTop: 12,
  },
  inputBox: {
    color: "#111",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 2,
    backgroundColor: "#F7F7F7",
  },
});
